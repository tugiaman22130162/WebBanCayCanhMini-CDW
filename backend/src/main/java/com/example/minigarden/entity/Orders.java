package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // User từ JWT
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    // Tổng tiền
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total_price;

    // Trạng thái đơn hàng
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // Thông tin người nhận
    @Column(nullable = false, length = 150)
    private String receiver_name;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 255)
    private String address;

    // Ghi chú
    @Column(length = 500)
    private String note;

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        status = OrderStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItems> items;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Payments> payments;
}