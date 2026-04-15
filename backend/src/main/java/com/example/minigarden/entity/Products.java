package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Products {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên sản phẩm
    @Column(nullable = false, unique = true, length = 150)
    private String name;

    // Mô tả
    @Column(length = 500)
    private String description;

    // Giá bán
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Số lượng tồn kho
    @Column(nullable = false)
    private Integer quantity;

    // Hình ảnh
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImages> images;

    // Loại cây
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Categories category;

    // Trạng thái (còn bán / ngừng bán)
    @Column(nullable = false)
    private Boolean status;

    // Ngày tạo
    @Column(updatable = false)
    private LocalDateTime created_at;

    // Ngày cập nhật
    private LocalDateTime updated_at;

    // Tự động set thời gian
    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        status = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "product")
    private List<CartItems> cart_items;
}