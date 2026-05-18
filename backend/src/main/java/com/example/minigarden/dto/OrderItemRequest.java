package com.example.minigarden.dto;

import lombok.Data;

@Data
public class OrderItemRequest {

    private Integer productId;

    private Integer quantity;

    private Double price;
    
}
