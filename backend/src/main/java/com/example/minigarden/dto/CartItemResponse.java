package com.example.minigarden.dto;

import lombok.Data;

@Data
public class CartItemResponse {
    private Integer id; // Đây là ID của bản ghi CartItem (chứ không phải Product Id)
    private Integer productId;
    private String name;
    private Double price;
    private String image;
    private Integer quantity;
}