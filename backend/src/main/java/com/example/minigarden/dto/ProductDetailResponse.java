package com.example.minigarden.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import com.example.minigarden.entity.CareInstructions;

@Getter
@Setter
@Builder
public class ProductDetailResponse {
    private String light;
    private String water;
    private String size;
    private String origin;
    private String temperature;
    private String potType;
    private Double weight;
    private String note;
    private CareInstructions care_instruction;
}