package com.example.minigarden.dto;

import java.time.LocalDateTime;
import com.example.minigarden.entity.DiscountType;
import com.example.minigarden.entity.PromotionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PromotionResponse {

    private int id;

    private String name;

    private String description;

    private PromotionType type;

    private DiscountType discountType;

    private Double discountValue;

    private Double minOrderValue;

    private Double maxDiscountValue;

    private Boolean isActive;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Integer quantity;

    private LocalDateTime createdAt;

    private Integer targetId;

    private String targetName;
    
    private Integer usedCount;

    private Integer remaining;
}