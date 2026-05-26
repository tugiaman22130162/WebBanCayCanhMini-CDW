package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Tên khuyến mãi
    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

    // Mô tả
    @Column(name = "description", length = 500)
    private String description;

    //Loại:  SHOP, CATEGORY, PRODUCT, SHIPPING
    @Enumerated(EnumType.STRING)    
    @Column(name = "type", nullable = false)
    private PromotionType type;

    // Loại giảm giá
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    // Giá trị giảm
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    // Giảm tối đa (cho %)
    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    // Điều kiện áp dụng (min order)
    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    // Thời gian
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Trạng thái
    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private LocalDateTime createdAt ;

    //số lượng 
    @Column(name = "quantity")
    private Integer quantity;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
    }
}