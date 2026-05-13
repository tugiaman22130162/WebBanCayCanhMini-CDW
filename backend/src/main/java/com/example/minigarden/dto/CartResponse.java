package com.example.minigarden.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private List<CartItemResponse> items;
    private Double totalPrice;
}