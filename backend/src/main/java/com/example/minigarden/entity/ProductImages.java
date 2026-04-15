package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết tới product
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;

    // URL hình ảnh
    @Column(nullable = false, length = 255)
    private String image_url;

    // Ảnh chính hay không
    @Column(nullable = false)
    private Boolean is_primary;

    // Thứ tự hiển thị
    private Integer sort_order;
}