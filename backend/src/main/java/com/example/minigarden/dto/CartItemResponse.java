package com.example.minigarden.dto;

import lombok.Data;

@Data
public class CartItemResponse {
    private Integer id;
    private Integer productId;
    private Integer categoryId;
    private String name;
    private Double price;
    private String image;
    private Integer quantity;
    private Integer stock;
}