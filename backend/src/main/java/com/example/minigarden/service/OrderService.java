package com.example.minigarden.service;

import com.example.minigarden.dto.OrderRequest;
import com.example.minigarden.dto.OrderItemRequest;
import com.example.minigarden.entity.*;
import com.example.minigarden.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CartItemRepository cartItemRepository;
    private final PromotionRepository promotionRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    public Order createOrder(Integer userId, OrderRequest request) {

        //Lấy địa chỉ
        Address address = addressRepository.findById(Objects.requireNonNull(request.getAddressId()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy địa chỉ"));

        //Danh sách order item
        List<OrderItem> orderItems = new ArrayList<>();

        BigDecimal subtotal = BigDecimal.ZERO;

        //Duyệt sản phẩm
        for (OrderItemRequest itemRequest : request.getItems()) {

            Products product = productRepository.findById(Objects.requireNonNull(itemRequest.getProductId()))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

            //Kiểm tra tồn kho
            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Sản phẩm không đủ số lượng");
            }

            //Tính tiền sản phẩm
            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            subtotal = subtotal.add(itemTotal);

            //Tạo order item
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .product_name(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .price(product.getPrice())
                    .subtotal(itemTotal)
                    .build();

            orderItems.add(orderItem);

            //Trừ số lượng sản phẩm
            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());

            productRepository.save(product);
        }

        //Phí ship
        BigDecimal shippingFee = request.getShippingFee() != null ? request.getShippingFee() : BigDecimal.ZERO;

        //Giảm giá
        BigDecimal productDiscount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;

        // Tìm mã khuyến mãi nếu có
        List<Promotion> appliedPromotions = new ArrayList<>();
        List<OrderPromotion> orderPromotions = new ArrayList<>();
        BigDecimal totalShippingDiscount = BigDecimal.ZERO;
        
        if (request.getPromotionCode() != null && !request.getPromotionCode().trim().isEmpty()) {
            String[] codes = request.getPromotionCode().split(",");
            for (String code : codes) {
                Promotion promotion = promotionRepository.findByName(code.trim()).orElse(null);
                
                if (promotion != null) {
                    appliedPromotions.add(promotion);
                    BigDecimal currentPromoDiscount = BigDecimal.ZERO;
                    
                    // Xử lý nếu mã là miễn phí vận chuyển
                    if (promotion.getType() == PromotionType.SHIPPING) {
                        BigDecimal shippingDiscount = BigDecimal.ZERO;
                        if (promotion.getDiscountType() == DiscountType.FREE) {
                            shippingDiscount = shippingFee;
                        } else if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
                            shippingDiscount = shippingFee.multiply(promotion.getDiscountValue()).divide(new BigDecimal(100));
                            if (promotion.getMaxDiscount() != null && promotion.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                                if (shippingDiscount.compareTo(promotion.getMaxDiscount()) > 0) {
                                    shippingDiscount = promotion.getMaxDiscount();
                                }
                            }
                        } else if (promotion.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                            shippingDiscount = promotion.getDiscountValue();
                        }

                        if (shippingDiscount.compareTo(shippingFee) > 0) {
                            shippingDiscount = shippingFee;
                        }

                        currentPromoDiscount = shippingDiscount;
                        totalShippingDiscount = totalShippingDiscount.add(shippingDiscount);
                    }
                    
                    OrderPromotion orderPromotion = OrderPromotion.builder()
                            .promotionCode(promotion.getName())
                            .discountAmount(currentPromoDiscount)
                            .build();
                    orderPromotions.add(orderPromotion);
                }
            }
            
            // Cập nhật lại discountAmount cho các mã không phải SHIPPING
            for (OrderPromotion op : orderPromotions) {
                Promotion promo = appliedPromotions.stream().filter(p -> p.getName().equals(op.getPromotionCode())).findFirst().orElse(null);
                if (promo != null && promo.getType() != PromotionType.SHIPPING) {
                    op.setDiscountAmount(productDiscount);
                }
            }
        }

        //Tổng tiền
        BigDecimal total = subtotal
                .add(shippingFee)
                .subtract(productDiscount)
                .subtract(totalShippingDiscount);
                
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        // Tính toán Thời gian giao hàng dự kiến
        LocalDateTime defaultDeliveryFrom;
        LocalDateTime defaultDeliveryTo;
        String province = address.getProvince() != null ? address.getProvince().toLowerCase() : "";
        
        // Nếu ở TP.HCM giao trong 1-2 ngày, tỉnh khác 3-5 ngày (Chuẩn theo ShippingPolicy), 
        // nếu leadtime của GHN trả về nhanh hơn thì sẽ lấy thời gian của GHN,
        // còn nếu GHN trả về lâu hơn thì sẽ lấy thời gian dự kiến này để đảm bảo không bị hứa giao quá sớm
        if (province.contains("hồ chí minh") || province.contains("ho chi minh")) {
            defaultDeliveryFrom = LocalDateTime.now().plusDays(1);
            defaultDeliveryTo = LocalDateTime.now().plusDays(2);
        } else {
            defaultDeliveryFrom = LocalDateTime.now().plusDays(3);
            defaultDeliveryTo = LocalDateTime.now().plusDays(5);
        }
        
        LocalDateTime deliveryFrom = request.getEstimatedDeliveryTimeFrom() != null ? request.getEstimatedDeliveryTimeFrom() : defaultDeliveryFrom;
        LocalDateTime deliveryTo = request.getEstimatedDeliveryTimeTo() != null ? request.getEstimatedDeliveryTimeTo() : defaultDeliveryTo;
        if (deliveryTo.isAfter(defaultDeliveryTo)) {
            deliveryFrom = defaultDeliveryFrom;
            deliveryTo = defaultDeliveryTo;
        }

        //Tạo order
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .userId(userId)
                .receiverName(address.getReceiverName())
                .phone(address.getPhone())
                .address(address.getFullAddress())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .shippingFee(shippingFee)
                .discountAmount(productDiscount)
                .totalPrice(total)
                .estimatedDeliveryTimeFrom(deliveryFrom)
                .estimatedDeliveryTimeTo(deliveryTo)
                .createdAt(LocalDateTime.now())
                .build();

        //Map order cho items
        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        order.setItems(orderItems);

        // Tạo OrderPromotion nếu đơn hàng có dùng mã khuyến mãi
        if (!orderPromotions.isEmpty()) {
            for (OrderPromotion op : orderPromotions) {
                op.setOrder(order);
            }
            order.setPromotions(orderPromotions);
        }

        Order savedOrder = orderRepository.save(order);
        
        if (request.getCartItemId() != null && !request.getCartItemId().isEmpty()) {
            cartItemRepository.deleteAllById(Objects.requireNonNull(request.getCartItemId()));
        }
        
        // Trừ số lượng mã khuyến mãi (nếu có áp dụng)
        if (!appliedPromotions.isEmpty()) {
            for (Promotion p : appliedPromotions) {
                if (p.getQuantity() != null && p.getQuantity() > 0) {
                    p.setQuantity(p.getQuantity() - 1);
                    promotionRepository.save(p);
                }
            }
        }

        // Lưu dữ liệu vào bảng Payments
        PaymentMethod paymentMethod = "VNPAY".equalsIgnoreCase(request.getPaymentMethod()) ? PaymentMethod.VNPAY : PaymentMethod.COD;
        // Trạng thái ban đầu của mọi thanh toán là PENDING.
        // - Với COD, nó sẽ giữ nguyên cho đến khi giao hàng.
        // - Với VNPAY, nó sẽ được cập nhật thành SUCCESS sau khi có xác nhận từ VNPAY.
        Payments payment = Payments.builder()
                .order(savedOrder)
                .amount(total)
                .method(paymentMethod)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(Objects.requireNonNull(payment));

        // Tạo thông báo cho Admin xác nhận đơn hàng nếu là COD
        if (paymentMethod == PaymentMethod.COD) {
            notificationService.createNotification("Đơn hàng mới " + savedOrder.getOrderCode() + " (COD) đang chờ xác nhận!", "/admin/orders?search=" + savedOrder.getOrderCode(), NotificationType.ORDER);
        }

        return savedOrder;
    }

    //Tạo mã đơn hàng
    private String generateOrderCode() {
        return "DHMG-"+ LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    // Lấy chi tiết đơn hàng
    @Transactional(readOnly = true)
    public Order getOrderById(Integer id) {
        return orderRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
    }

    // Tìm kiếm đơn hàng theo mã đơn hoặc tên sản phẩm
    @Transactional(readOnly = true)
    public List<Order> searchOrders(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return orderRepository.findAll();
        }
        return orderRepository.searchOrders(keyword.trim());
    }

    // Lấy danh sách đơn hàng theo userId
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Integer userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Hủy đơn hàng (User)
    @Transactional
    public Order cancelOrder(Integer orderId, Integer userId) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Rollback số lượng sản phẩm
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Products product = item.getProduct();
                if (product != null) {
                    product.setQuantity((product.getQuantity() != null ? product.getQuantity() : 0) + (item.getQuantity() != null ? item.getQuantity() : 0));
                    productRepository.save(product);
                }
            }
        }

        // Rollback số lượng mã khuyến mãi
        if (order.getPromotions() != null) {
            for (OrderPromotion orderPromotion : order.getPromotions()) {
                promotionRepository.findByName(orderPromotion.getPromotionCode()).ifPresent(promotion -> {
                    promotion.setQuantity((promotion.getQuantity() != null ? promotion.getQuantity() : 0) + 1);
                    promotionRepository.save(promotion);
                });
            }
        }

        return orderRepository.save(order);
    }

    // Cập nhật trạng thái đơn hàng (Admin)
    @Transactional
    public Order updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        // Nếu admin Hủy đơn hàng và trạng thái cũ chưa phải CANCELLED thì cũng cần Rollback
        if (newStatus == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    Products product = item.getProduct();
                    if (product != null) {
                        product.setQuantity((product.getQuantity() != null ? product.getQuantity() : 0) + (item.getQuantity() != null ? item.getQuantity() : 0));
                        productRepository.save(product);
                    }
                }
            }
            if (order.getPromotions() != null) {
                for (OrderPromotion orderPromotion : order.getPromotions()) {
                    promotionRepository.findByName(orderPromotion.getPromotionCode()).ifPresent(promotion -> {
                        promotion.setQuantity((promotion.getQuantity() != null ? promotion.getQuantity() : 0) + 1);
                        promotionRepository.save(promotion);
                    });
                }
            }
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    // Xóa đơn hàng và hoàn lại số lượng nếu thanh toán VNPay thất bại / hủy bỏ
    @Transactional
    public void deleteFailedOrder(String orderCode) {
        orderRepository.findByOrderCode(orderCode).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING && order.getPaidAt() == null) {
                // Hoàn lại số lượng sản phẩm
                if (order.getItems() != null) {
                    for (OrderItem item : order.getItems()) {
                        Products product = item.getProduct();
                        if (product != null) {
                            product.setQuantity((product.getQuantity() != null ? product.getQuantity() : 0) + (item.getQuantity() != null ? item.getQuantity() : 0));
                            productRepository.save(product);
                        }
                    }
                }
                // Hoàn lại mã khuyến mãi
                if (order.getPromotions() != null) {
                    for (OrderPromotion orderPromotion : order.getPromotions()) {
                        promotionRepository.findByName(orderPromotion.getPromotionCode()).ifPresent(promotion -> {
                            promotion.setQuantity((promotion.getQuantity() != null ? promotion.getQuantity() : 0) + 1);
                            promotionRepository.save(promotion);
                        });
                    }
                }
                // Xóa đơn hàng (Cascade sẽ tự động xóa bảng payments và order_items liên quan)
                orderRepository.delete(order);
            }
        });
    }

    //
}