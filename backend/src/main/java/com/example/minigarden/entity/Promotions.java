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
public class Promotions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên khuyến mãi
    @Column(nullable = false, length = 150)
    private String name;

    // Mô tả
    @Column(length = 500)
    private String description;

    // Loại giảm giá
    @Enumerated(EnumType.STRING)
    private DiscountType discount_type;

    // Giá trị giảm
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discount_value;

    // Giảm tối đa (cho %)
    private BigDecimal max_discount;

    // Điều kiện áp dụng (min order)
    private BigDecimal min_order_value;

    // Thời gian
    private LocalDateTime start_date;
    private LocalDateTime end_date;

    // Trạng thái
    private Boolean is_active;

    private LocalDateTime created_at;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        is_active = true;
    }
}