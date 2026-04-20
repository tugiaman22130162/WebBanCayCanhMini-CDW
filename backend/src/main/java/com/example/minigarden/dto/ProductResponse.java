package com.example.minigarden.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Integer id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private Integer categoryId;
    private String categoryName;
    private List<String> images;
    private ProductDetailResponse details;
}