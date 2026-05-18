package com.example.minigarden.dto;

import lombok.Data;

@Data
public class ShippingFeeRequest {

    private Integer toDistrictId;

    private String toWardCode;

    private Integer weight;

    private Integer length;

    private Integer width;

    private Integer height;

    private Integer insuranceValue;
}
