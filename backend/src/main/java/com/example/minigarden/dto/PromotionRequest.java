package com.example.minigarden.dto;

import com.example.minigarden.entity.DiscountType;
import com.example.minigarden.entity.PromotionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PromotionRequest {
    private String name;
    private String description;
    private PromotionType type;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountValue;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer quantity;

    // Thông tin về đích khuyến mãi (nếu là CATEGORY hoặc PRODUCT)
    private Integer targetId;
    private String targetName;
}