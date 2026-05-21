package com.example.minigarden.controller;

import com.example.minigarden.config.VNPayConfig;
import com.example.minigarden.entity.Order;
import com.example.minigarden.entity.OrderStatus;
import com.example.minigarden.entity.PaymentStatus;
import com.example.minigarden.entity.Payments;
import com.example.minigarden.entity.NotificationType;
import com.example.minigarden.repository.PaymentRepository;
import com.example.minigarden.repository.OrderRepository;
import com.example.minigarden.service.OrderService;
import com.example.minigarden.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VNPayController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final NotificationService notificationService;

    // FE gọi để xác thực kết quả sau khi VNPAY redirect về trang Success
    @GetMapping("/payment-return")
    public ResponseEntity<?> paymentReturn(HttpServletRequest request) {
        try {
            Map<String, String> fields = extractAndHashParams(request);
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            String signValue = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, fields.get("hashData"));

            if (signValue.equals(vnp_SecureHash)) {
                String orderCode = request.getParameter("vnp_TxnRef");
                if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                    updateOrderPaymentStatus(orderCode);
                    return ResponseEntity.ok(Map.of("message", "Thanh toán thành công", "orderCode", orderCode));
                }
                // Nếu thất bại (hủy thanh toán, thẻ lỗi,...), xóa đơn hàng để không lưu rác
                orderService.deleteFailedOrder(orderCode);
                return ResponseEntity.badRequest().body(Map.of("message", "Giao dịch không thành công"));
            }
            return ResponseEntity.badRequest().body(Map.of("message", "Chữ ký không hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi xử lý giao dịch: " + e.getMessage()));
        }
    }

    // Webhook (IPN) để VNPAY gọi ngầm vào Server nhằm cập nhật trạng thái đơn hàng
    @GetMapping("/ipn")
    public ResponseEntity<?> paymentIpn(HttpServletRequest request) {
        try {
            Map<String, String> fields = extractAndHashParams(request);
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            String signValue = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, fields.get("hashData"));

            if (signValue.equals(vnp_SecureHash)) {
                String orderCode = request.getParameter("vnp_TxnRef");
                if ("00".equals(request.getParameter("vnp_ResponseCode"))) {
                    boolean isUpdated = updateOrderPaymentStatus(orderCode);
                    if (isUpdated) {
                        return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
                    } else {
                        return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
                    }
                }
                orderService.deleteFailedOrder(orderCode);
                return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Transaction failed"));
            }
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("RspCode", "99", "Message", "Unknown error"));
        }
    }

    // Trích xuất parameters và chuẩn bị chuỗi Hash để Verify
    private Map<String, String> extractAndHashParams(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!first) hashData.append('&');
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                first = false;
            }
        }
        
        Map<String, String> result = new HashMap<>(fields);
        result.put("hashData", hashData.toString());
        return result;
    }

    // Cập nhật trạng thái đơn hàng sang Đã Thanh Toán
    private boolean updateOrderPaymentStatus(String orderCode) {
        Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
        if (orderOpt.isPresent() && orderOpt.get().getPaidAt() == null) {
            Order order = orderOpt.get();
            order.setPaidAt(LocalDateTime.now());
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(Objects.requireNonNull(order));

            // Cập nhật trạng thái trong bảng payments
            List<Payments> payments = paymentRepository.findByOrder_Id(order.getId());
            for (Payments payment : payments) {
                payment.setStatus(PaymentStatus.SUCCESS);
                paymentRepository.save(Objects.requireNonNull(payment));
                
                // Gửi thông báo cho Admin
                notificationService.createNotification("Đơn hàng " + orderCode + " vừa thanh toán thành công qua VNPAY!", "/admin/payments?search=" + orderCode, NotificationType.PAYMENT);
            }
            return true;
        }
        return orderOpt.isPresent();
    }
}
