package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promotion_products", uniqueConstraints = @UniqueConstraint(columnNames = { "promotion_id",
        "product_id" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionProducts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_id", nullable = false)
    private Promotions promotion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;
}