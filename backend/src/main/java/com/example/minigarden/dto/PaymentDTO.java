package com.example.minigarden.dto;

import com.example.minigarden.entity.PaymentMethod;
import com.example.minigarden.entity.PaymentStatus;
import com.example.minigarden.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Integer id;
    private Integer orderId;
    private String orderCode;
    private String customerName; // Có thể lấy từ receiver_name của Order
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private OrderStatus orderStatus;
    private LocalDateTime createdAt;
}
