package com.example.minigarden.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Product {
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private Integer categoryId;
    private ProductDetail details;
}
