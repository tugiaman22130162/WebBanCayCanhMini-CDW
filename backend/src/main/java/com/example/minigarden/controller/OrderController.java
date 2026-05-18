package com.example.minigarden.controller;

import com.example.minigarden.dto.OrderRequest;
import com.example.minigarden.entity.Order;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import com.example.minigarden.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final VNPayService vnPayService;

    //tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            HttpServletRequest httpServletRequest,
            Principal principal
    ) {
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
                String paymentUrl = vnPayService.createPaymentUrl(order.getTotalPrice().longValue(), order.getOrderCode(), httpServletRequest);
                response.put("paymentUrl", paymentUrl);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tạo đơn hàng"));
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải chi tiết đơn hàng"));
        }
    }

    // API Tìm kiếm đơn hàng theo mã đơn hoặc tên sản phẩm (Không truyền keyword sẽ lấy tất cả)
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> searchOrders(@RequestParam(value = "keyword", required = false) String keyword) {
        try {
            List<Order> orders = orderService.searchOrders(keyword);
            return ResponseEntity.ok(orders.stream().map(this::mapOrderToDto).toList());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tìm kiếm đơn hàng"));
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tải danh sách đơn hàng"));
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật trạng thái"));
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi hủy đơn hàng"));
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
        map.put("discountAmount", order.getDiscountAmount());
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
                    if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                        pMap.put("images", item.getProduct().getImages().stream()
                                .map(com.example.minigarden.entity.ProductImages::getImage_url)
                                .toList());
                    }
                    iMap.put("product", pMap);
                }
                return iMap;
            }).toList());
        } else {
            map.put("items", new java.util.ArrayList<>());
        }
        return map;
    }
}
