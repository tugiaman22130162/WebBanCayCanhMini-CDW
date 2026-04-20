package com.example.minigarden.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImage {
    private Integer id;
    private String imageUrl;
    private String publicId;
    private Product product;
}