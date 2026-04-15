package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Orders order;

    // Sản phẩm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;

    @Column(nullable = false)
    private String product_name;

    // Giá tại thời điểm mua
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    // Số lượng
    @Column(nullable = false)
    private Integer quantity;

    // Thành tiền
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
}