package com.example.minigarden.service;

import com.example.minigarden.dto.OrderRequest;
import com.example.minigarden.dto.OrderItemRequest;
import com.example.minigarden.entity.*;
import com.example.minigarden.repository.*;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import java.io.ByteArrayOutputStream;
import java.io.IOException;


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
    private final CustomTerrariumRepository customTerrariumRepository;
    private final TerrariumComponentRepository terrariumComponentRepository;

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
                    .isReviewed(false)
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
                    // Tự động tính toán lại nếu frontend không gửi kèm discountAmount (bị null hoặc bằng 0)
                    if (productDiscount == null || productDiscount.compareTo(BigDecimal.ZERO) == 0) {
                        BigDecimal calcDiscount = BigDecimal.ZERO;
                        if (promo.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                            calcDiscount = promo.getDiscountValue();
                        } else if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
                            calcDiscount = subtotal.multiply(promo.getDiscountValue()).divide(new BigDecimal(100));
                            if (promo.getMaxDiscount() != null && promo.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                                if (calcDiscount.compareTo(promo.getMaxDiscount()) > 0) calcDiscount = promo.getMaxDiscount();
                            }
                        }
                        if (calcDiscount.compareTo(subtotal) > 0) calcDiscount = subtotal;
                        op.setDiscountAmount(calcDiscount);
                        productDiscount = calcDiscount; // Cập nhật tổng tiền giảm để trừ vào đơn hàng
                    } else {
                        op.setDiscountAmount(productDiscount);
                    }
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

        // Đổi trạng thái CustomTerrarium thành ORDERED nếu đây là sản phẩm thiết kế riêng
        for (OrderItem item : orderItems) {
            if (item.getProduct_name() != null && item.getProduct_name().startsWith("Terrarium Thiết Kế #")) {
                try {
                    Integer designId = Integer.parseInt(item.getProduct_name().substring(20).split(" - ")[0]);
                    customTerrariumRepository.findById(designId).ifPresent(design -> {
                        design.setStatus(CustomTerrariumStatus.ORDERED);
                        customTerrariumRepository.save(design);
                        deductTerrariumComponents(design);
                    });
                } catch (Exception ignored) {}
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
    public List<Order> searchOrders(String keyword, String timeRange, LocalDate customStartDate, LocalDate customEndDate) {
        LocalDateTime startDate = null;
        LocalDateTime endDate = LocalDateTime.now();

        if (timeRange != null && !timeRange.equals("all")) {
            switch (timeRange) {
                case "7days": startDate = endDate.minusDays(7); break;
                case "30days": startDate = endDate.minusDays(30); break;
                case "6months": startDate = endDate.minusMonths(6); break;
                case "1year": startDate = endDate.minusYears(1); break;
                case "quarter":
                    int currentQuarter = (endDate.getMonthValue() - 1) / 3 + 1;
                    startDate = LocalDateTime.of(endDate.getYear(), (currentQuarter - 1) * 3 + 1, 1, 0, 0);
                    break;
                case "custom":
                    if (customStartDate != null && customEndDate != null) {
                        startDate = customStartDate.atStartOfDay();
                        endDate = customEndDate.atTime(LocalTime.MAX);
                    }
                    break;
            }
        }

        if (keyword == null || keyword.trim().isEmpty()) {
            if (startDate != null) {
                return orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startDate, endDate);
            }
            return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        
        if (startDate != null) {
            return orderRepository.searchOrdersWithDate(keyword.trim(), startDate, endDate);
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

                // Rollback cho TerrariumComponent nếu đây là thiết kế
                if (item.getProduct_name() != null && item.getProduct_name().startsWith("Terrarium Thiết Kế #")) {
                    try {
                        Integer designId = Integer.parseInt(item.getProduct_name().substring(20).split(" - ")[0]);
                        customTerrariumRepository.findById(designId).ifPresent(design -> {
                            design.setStatus(CustomTerrariumStatus.APPROVED);
                            customTerrariumRepository.save(design);
                            rollbackTerrariumComponents(design);
                        });
                    } catch (Exception ignored) {}
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

                    // Rollback cho TerrariumComponent nếu đây là thiết kế
                    if (item.getProduct_name() != null && item.getProduct_name().startsWith("Terrarium Thiết Kế #")) {
                        try {
                            Integer designId = Integer.parseInt(item.getProduct_name().substring(20).split(" - ")[0]);
                            customTerrariumRepository.findById(designId).ifPresent(design -> {
                                design.setStatus(CustomTerrariumStatus.APPROVED);
                                customTerrariumRepository.save(design);
                                rollbackTerrariumComponents(design);
                            });
                        } catch (Exception ignored) {}
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

        // Nếu đơn hàng được giao thành công, cập nhật trạng thái thanh toán (đối với COD)
        if (newStatus == OrderStatus.DELIVERED) {
            if (order.getPayments() != null) {
                for (Payments payment : order.getPayments()) {
                    if (payment.getMethod() == PaymentMethod.COD && payment.getStatus() == PaymentStatus.PENDING) {
                        payment.setStatus(PaymentStatus.SUCCESS);
                        paymentRepository.save(payment);
                        order.setPaidAt(LocalDateTime.now());
                    }
                }
            }
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Tạo thông báo cho User khi trạng thái đơn hàng thay đổi
        String message;
        if (newStatus == OrderStatus.SHIPPING) {
            LocalDate today = LocalDate.now();
            LocalDate deliveryTo = savedOrder.getEstimatedDeliveryTimeTo() != null ? savedOrder.getEstimatedDeliveryTimeTo().toLocalDate() : null;
            if (deliveryTo != null && today.isEqual(deliveryTo)) {
                message = "Đơn hàng " + savedOrder.getOrderCode() + " đang được giao đến bạn. Vui lòng chú ý điện thoại.";
            } else {
                message = "Đơn vị vận chuyển lấy hàng thành công và đang trên đường giao.";
            }
        } else {
            String statusMessage = switch (newStatus) {
                case CONFIRMED -> "đã được xác nhận. Chúng tôi đang chuẩn bị hàng cho bạn.";
                case DELIVERED -> "đã giao thành công. Cảm ơn bạn đã mua sắm!";
                case CANCELLED -> "đã bị hủy.";
                default -> "đã được cập nhật trạng thái.";
            };
            message = "Đơn hàng " + savedOrder.getOrderCode() + " " + statusMessage;
        }

        String link = (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.CANCELLED) 
                ? "/profile/history" 
                : "/profile/orders?status=" + newStatus.name();

        // GỌI HÀM LƯU THÔNG BÁO CHO USER (Lấy userId từ chính đơn hàng bị cập nhật)
        notificationService.createUserNotification(savedOrder.getUserId(), message, link, NotificationType.ORDER);

        return savedOrder;
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

                        // Rollback cho TerrariumComponent nếu đây là thiết kế
                        if (item.getProduct_name() != null && item.getProduct_name().startsWith("Terrarium Thiết Kế #")) {
                            try {
                                Integer designId = Integer.parseInt(item.getProduct_name().substring(20).split(" - ")[0]);
                                customTerrariumRepository.findById(designId).ifPresent(design -> {
                                    design.setStatus(CustomTerrariumStatus.APPROVED);
                                    customTerrariumRepository.save(design);
                                    rollbackTerrariumComponents(design);
                                });
                            } catch (Exception ignored) {}
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

    private void deductTerrariumComponents(CustomTerrarium design) {
        List<TerrariumComponent> components = terrariumComponentRepository.findAll();
        
        if (design.getContainerName() != null) {
            components.stream().filter(c -> design.getContainerName().equals(c.getName())).findFirst().ifPresent(c -> {
                c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) - 1);
                terrariumComponentRepository.save(c);
            });
        }
        if (design.getSoilName() != null) {
            components.stream().filter(c -> design.getSoilName().equals(c.getName())).findFirst().ifPresent(c -> {
                c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) - 1);
                terrariumComponentRepository.save(c);
            });
        }
        if (design.getPlants() != null) {
            for (String entry : design.getPlants().split(",")) {
                String t = entry.trim();
                int qty = 1;
                String plantName = t;
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("^(\\d+)x\\s+(.+)$").matcher(t);
                if (m.matches()) {
                    qty = Integer.parseInt(m.group(1));
                    plantName = m.group(2);
                }
                final int finalQty = qty;
                final String finalPlantName = plantName;
                components.stream().filter(c -> finalPlantName.equals(c.getName())).findFirst().ifPresent(c -> {
                    c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) - finalQty);
                    terrariumComponentRepository.save(c);
                });
            }
        }
    }

    private void rollbackTerrariumComponents(CustomTerrarium design) {
        List<TerrariumComponent> components = terrariumComponentRepository.findAll();
        
        if (design.getContainerName() != null) {
            components.stream().filter(c -> design.getContainerName().equals(c.getName())).findFirst().ifPresent(c -> {
                c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) + 1);
                terrariumComponentRepository.save(c);
            });
        }
        if (design.getSoilName() != null) {
            components.stream().filter(c -> design.getSoilName().equals(c.getName())).findFirst().ifPresent(c -> {
                c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) + 1);
                terrariumComponentRepository.save(c);
            });
        }
        if (design.getPlants() != null) {
            for (String entry : design.getPlants().split(",")) {
                String t = entry.trim();
                int qty = 1;
                String plantName = t;
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("^(\\d+)x\\s+(.+)$").matcher(t);
                if (m.matches()) {
                    qty = Integer.parseInt(m.group(1));
                    plantName = m.group(2);
                }
                final int finalQty = qty;
                final String finalPlantName = plantName;
                components.stream().filter(c -> finalPlantName.equals(c.getName())).findFirst().ifPresent(c -> {
                    c.setStockQuantity((c.getStockQuantity() != null ? c.getStockQuantity() : 0) + finalQty);
                    terrariumComponentRepository.save(c);
                });
            }
        }
    }

     //lấy danh sách đơn hàng
     public List<Order> getAllOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

     // Export danh sách đơn hàng ra file Excel
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportOrdersToExcel() throws IOException {
        List<Order> orders = orderRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("DANH SÁCH ĐƠN HÀNG");

            // Style cho Tiêu đề lớn (Title)
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 18);
            titleFont.setColor(IndexedColors.DARK_GREEN.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(titleFont);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);

            // Tạo Title Row ở dòng 0 và gộp 4 cột lại cho đẹp
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("DANH SÁCH ĐƠN HÀNG");
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 11));

            // Style cho Header (Tiêu đề cột)
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.DARK_GREEN.getIndex()); // Màu xanh chủ đạo
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setBorderBottom(BorderStyle.THIN);
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Tạo Header Row (Bị dời xuống dòng 1)
            Row headerRow = sheet.createRow(1);
            String[] columns = {"ID", "Mã Đơn Hàng", "Người Nhận", "Số Điện Thoại", "Địa Chỉ", "Phương Thức TT", "Tiền Ship", "Giảm Giá", "Tổng Tiền", "Ngày Đặt", "Trạng Thái", "Ghi Chú"};
            for (int col = 0; col < columns.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(columns[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // Style cho Data
            CellStyle dataCellStyle = workbook.createCellStyle();
            dataCellStyle.setBorderBottom(BorderStyle.DASHED);
            dataCellStyle.setBorderTop(BorderStyle.DASHED);
            dataCellStyle.setBorderRight(BorderStyle.DASHED);
            dataCellStyle.setBorderLeft(BorderStyle.DASHED);

            // Đổ dữ liệu vào Excel (Bắt đầu từ dòng 2)
            int rowIdx = 2;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            for (Order order : orders) {
                Row row = sheet.createRow(rowIdx++);
                
                int colIdx = 0;
                Cell cell0 = row.createCell(colIdx++);
                cell0.setCellValue(order.getId());
                cell0.setCellStyle(dataCellStyle);

                Cell cell1 = row.createCell(colIdx++);
                cell1.setCellValue(order.getOrderCode() != null ? order.getOrderCode() : "");
                cell1.setCellStyle(dataCellStyle);

                Cell cell2 = row.createCell(colIdx++);
                cell2.setCellValue(order.getReceiverName() != null ? order.getReceiverName() : "");
                cell2.setCellStyle(dataCellStyle);

                Cell cell3 = row.createCell(colIdx++);
                cell3.setCellValue(order.getPhone() != null ? order.getPhone() : "");
                cell3.setCellStyle(dataCellStyle);
                
                Cell cell4 = row.createCell(colIdx++);
                cell4.setCellValue(order.getAddress() != null ? order.getAddress() : "");
                cell4.setCellStyle(dataCellStyle);
                
                Cell cell5 = row.createCell(colIdx++);
                cell5.setCellValue(order.getPaymentMethod() != null ? order.getPaymentMethod() : "");
                cell5.setCellStyle(dataCellStyle);
                
                Cell cell6 = row.createCell(colIdx++);
                cell6.setCellValue(order.getShippingFee() != null ? order.getShippingFee().doubleValue() : 0);
                cell6.setCellStyle(dataCellStyle);
                
                Cell cell7 = row.createCell(colIdx++);
                BigDecimal totalDiscount = order.getPromotions() != null 
                        ? order.getPromotions().stream().map(op -> {
                            BigDecimal amt = op.getDiscountAmount();
                            if (amt == null || amt.compareTo(BigDecimal.ZERO) == 0) {
                                Promotion p = promotionRepository.findByName(op.getPromotionCode()).orElse(null);
                                if (p != null && p.getDiscountType() == DiscountType.FIXED_AMOUNT) amt = p.getDiscountValue();
                                else amt = BigDecimal.ZERO;
                            }
                            return amt;
                        }).reduce(BigDecimal.ZERO, BigDecimal::add)
                        : BigDecimal.ZERO;
                cell7.setCellValue(totalDiscount.doubleValue());
                cell7.setCellStyle(dataCellStyle);
                
                Cell cell8 = row.createCell(colIdx++);
                cell8.setCellValue(order.getTotalPrice() != null ? order.getTotalPrice().doubleValue() : 0);
                cell8.setCellStyle(dataCellStyle);
                
                Cell cell9 = row.createCell(colIdx++);
                cell9.setCellValue(order.getCreatedAt() != null ? order.getCreatedAt().format(formatter) : "");
                cell9.setCellStyle(dataCellStyle);

                Cell cell10 = row.createCell(colIdx++);
                String statusStr = "";
                if (order.getStatus() != null) {
                    switch (order.getStatus().name()) {
                        case "PENDING": statusStr = "Chờ xác nhận"; break;
                        case "CONFIRMED": statusStr = "Đã xác nhận"; break;
                        case "DELIVERED": statusStr = "Đã giao hàng"; break;
                        case "CANCELLED": statusStr = "Đã hủy"; break;
                        default: statusStr = order.getStatus().name();
                    }
                }
                cell10.setCellValue(statusStr);
                cell10.setCellStyle(dataCellStyle);
                
                Cell cell11 = row.createCell(colIdx++);
                cell11.setCellValue(order.getNote() != null ? order.getNote() : "");
                cell11.setCellStyle(dataCellStyle);
            }

            // Tự động căn chỉnh độ rộng cột
            for (int i = 0; i < columns.length; i++) {
                sheet.setColumnWidth(i, 6000); // 6000 tương đương khoảng 23 ký tự
            }
            sheet.setColumnWidth(4, 10000); // Cho cột địa chỉ rộng hơn
            sheet.setColumnWidth(11, 8000); // Cho cột ghi chú rộng hơn

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // Xác nhận đã nhận hàng (User)
    @Transactional
    public Order confirmOrderReceived(Integer orderId, Integer userId) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này");
        }

        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new RuntimeException("Chỉ có thể xác nhận nhận hàng khi đơn hàng đang được giao");
        }

        order.setStatus(OrderStatus.DELIVERED);
        
        // Cập nhật trạng thái thanh toán thành SUCCESS khi khách hàng xác nhận đã nhận hàng (đối với COD)
        if (order.getPayments() != null) {
            for (Payments payment : order.getPayments()) {
                if (payment.getMethod() == PaymentMethod.COD && payment.getStatus() == PaymentStatus.PENDING) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    paymentRepository.save(payment);
                    order.setPaidAt(LocalDateTime.now());
                }
            }
        }
        
        return orderRepository.save(order);
    }

    // Tự động quét vào 8:00 sáng mỗi ngày để gửi thông báo cho các đơn hàng Đang giao
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void notifyShippingOrdersOnDeliveryDate() {
        LocalDate today = LocalDate.now();
        
        List<Order> shippingOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.SHIPPING)
                .filter(o -> o.getEstimatedDeliveryTimeTo() != null && o.getEstimatedDeliveryTimeTo().toLocalDate().isEqual(today))
                .toList();

        for (Order order : shippingOrders) {
            String message = "Đơn hàng " + order.getOrderCode() + " đang được giao đến bạn. Vui lòng chú ý điện thoại.";
            String link = "/profile/orders?status=SHIPPING";
            notificationService.createUserNotification(order.getUserId(), message, link, NotificationType.ORDER);
        }
    }
}