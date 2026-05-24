package com.example.minigarden.controller;

import com.example.minigarden.dto.OrderRequest;
import com.example.minigarden.entity.Order;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.OrderService;
import com.example.minigarden.repository.PromotionRepository;
import com.example.minigarden.entity.Promotion;
import com.example.minigarden.entity.DiscountType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import com.example.minigarden.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final VNPayService vnPayService;
    private final PromotionRepository promotionRepository;

    // tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            HttpServletRequest httpServletRequest,
            Principal principal) {
        try {
            if (principal == null) {
                throw new RuntimeException("Chưa đăng nhập");
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Order order = orderService.createOrder(user.getId(), request);

            Map<String, Object> response = mapOrderToDto(order);

            // Kiểm tra nếu phương thức thanh toán là VNPAY
            if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = vnPayService.createPaymentUrl(order.getTotalPrice().longValue(),
                        order.getOrderCode(), httpServletRequest);
                response.put("paymentUrl", paymentUrl);
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tạo đơn hàng"));
        }
    }

    // API Lấy chi tiết đơn hàng
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getOrderById(@PathVariable Integer id) {
        try {
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(mapOrderToDto(order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải chi tiết đơn hàng"));
        }
    }

    // API Tìm kiếm đơn hàng theo mã đơn hoặc tên sản phẩm (Không truyền keyword sẽ
    // lấy tất cả)
    @Transactional(readOnly = true) 
    @GetMapping
    public ResponseEntity<?> searchOrders(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String timeRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Order> orders = orderService.searchOrders(keyword, timeRange, startDate, endDate);
            return ResponseEntity.ok(orders.stream().map(this::mapOrderToDto).toList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tìm kiếm đơn hàng"));
        }
    }

    // API Lấy danh sách đơn hàng của người dùng hiện tại
    @GetMapping("/my-orders")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyOrders(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            List<Order> orders = orderService.getOrdersByUserId(user.getId());
            return ResponseEntity.ok(orders.stream().map(this::mapOrderToDto).toList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải danh sách đơn hàng"));
        }
    }

    // API Cập nhật trạng thái đơn hàng (Dành cho Admin)
    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam com.example.minigarden.entity.OrderStatus status) {
        try {
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(mapOrderToDto(order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật trạng thái"));
        }
    }

    // API Hủy đơn hàng (Dành cho User)
    @PutMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@PathVariable Integer id, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Order order = orderService.cancelOrder(id, user.getId());
            return ResponseEntity.ok(mapOrderToDto(order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi hủy đơn hàng"));
        }
    }

    // API Xác nhận đã nhận được hàng (Dành cho User)
    @PutMapping("/{id}/receive")
    @Transactional
    public ResponseEntity<?> confirmOrderReceived(@PathVariable Integer id, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Order order = orderService.confirmOrderReceived(id, user.getId());
            return ResponseEntity.ok(mapOrderToDto(order));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi xác nhận nhận hàng"));
        }
    }

    // API đánh giá sản phẩm
    @PostMapping("/items/{itemId}/review")
    @Transactional
    public ResponseEntity<?> reviewOrderItem(
            @PathVariable Integer itemId,
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            Integer rating = (Integer) payload.get("rating");
            String comment = (String) payload.get("comment");

            orderService.reviewOrderItem(itemId, user.getId(), rating, comment);
            return ResponseEntity.ok(Map.of("message", "Đánh giá thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi đánh giá"));
        }
    }

    // map json trả về cho FE
    private Map<String, Object> mapOrderToDto(Order order) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", order.getId());
        map.put("orderCode", order.getOrderCode());
        map.put("createdAt", order.getCreatedAt());
        map.put("estimatedDeliveryTimeFrom", order.getEstimatedDeliveryTimeFrom());
        map.put("estimatedDeliveryTimeTo", order.getEstimatedDeliveryTimeTo());
        map.put("totalPrice", order.getTotalPrice());
        map.put("status", order.getStatus());
        map.put("updatedAt", order.getUpdatedAt());
        
        java.math.BigDecimal totalDiscount = order.getPromotions() != null 
                ? order.getPromotions().stream().map(op -> {
                    java.math.BigDecimal amt = op.getDiscountAmount();
                    if (amt == null || amt.compareTo(java.math.BigDecimal.ZERO) == 0) {
                        Promotion p = promotionRepository.findByName(op.getPromotionCode()).orElse(null);
                        if (p != null && p.getDiscountType() == DiscountType.FIXED_AMOUNT) amt = p.getDiscountValue();
                        else amt = java.math.BigDecimal.ZERO;
                    }
                    return amt;
                }).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add)
                : java.math.BigDecimal.ZERO;
        map.put("discountAmount", totalDiscount);
        map.put("shippingFee", order.getShippingFee());
        map.put("receiverName", order.getReceiverName());
        map.put("phone", order.getPhone());
        map.put("address", order.getAddress());
        map.put("note", order.getNote());
        map.put("paymentMethod", order.getPaymentMethod());

        if (order.getPromotions() != null && !order.getPromotions().isEmpty()) {
            map.put("promotions", order.getPromotions().stream().map(p -> {
                Map<String, Object> pMap = new java.util.HashMap<>();
                pMap.put("promotionCode", p.getPromotionCode());
                
                java.math.BigDecimal discount = p.getDiscountAmount();
                // Fallback: Tra cứu lại từ bảng Promotion nếu đơn cũ bị lưu bằng 0
                if (discount == null || discount.compareTo(java.math.BigDecimal.ZERO) == 0) {
                    Promotion promo = promotionRepository.findByName(p.getPromotionCode()).orElse(null);
                    if (promo != null && promo.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                        discount = promo.getDiscountValue();
                    }
                }
                
                pMap.put("discountAmount", discount);
                return pMap;
            }).toList());
        } else {
            map.put("promotions", new java.util.ArrayList<>());
        }

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            map.put("items", order.getItems().stream().map(item -> {
                Map<String, Object> iMap = new java.util.HashMap<>();
                iMap.put("id", item.getId());
                iMap.put("product_name", item.getProduct_name());
                iMap.put("quantity", item.getQuantity());
                iMap.put("price", item.getPrice());
                iMap.put("subtotal", item.getSubtotal());

                if (item.getProduct() != null) {
                    Map<String, Object> pMap = new java.util.HashMap<>();
                    pMap.put("id", item.getProduct().getId());
                    if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                        pMap.put("images", item.getProduct().getImages().stream()
                                .map(com.example.minigarden.entity.ProductImages::getImage_url)
                                .toList());
                    }
                    iMap.put("product", pMap);
                }
                iMap.put("isReviewed", item.getIsReviewed());
                return iMap;
            }).toList());
        } else {
            map.put("items", new java.util.ArrayList<>());
        }
        return map;
    }
    
    // API Xuất Excel
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportOrdersToExcel() throws IOException {
        ByteArrayInputStream in = orderService.exportOrdersToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Danh_Sach_Don_Hang.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(java.util.Objects.requireNonNull(in)));
    }
}
