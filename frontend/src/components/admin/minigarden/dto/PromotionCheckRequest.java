package com.example.minigarden.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class PromotionCheckRequest {
    private Double totalPrice;
    private Double subtotal; // Cứ để dự phòng nếu FE có gửi lộn tên
    private Double shippingFee;
    private List<Map<String, Object>> cartItems;
}