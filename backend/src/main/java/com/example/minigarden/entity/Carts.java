package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "carts", uniqueConstraints = @UniqueConstraint(columnNames = "user_id")) // 1 user = 1 cart
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Carts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Lấy từ JWT
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    private BigDecimal total_price;

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CartItems> items;
}