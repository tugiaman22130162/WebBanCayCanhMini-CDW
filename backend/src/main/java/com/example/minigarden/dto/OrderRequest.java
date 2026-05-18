package com.example.minigarden.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {

    private Integer addressId;

    private String paymentMethod;

    private String note;

    private String promotionCode;

    private Integer serviceId;

    private BigDecimal shippingFee;
    
    private BigDecimal discountAmount;
    
    private BigDecimal totalPrice;

    private List<OrderItemRequest> items;
    
    private List<Integer> cartItemId;
}
