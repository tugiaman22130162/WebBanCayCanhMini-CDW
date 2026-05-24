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
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Mã đơn hàng vd DH+thời gian tạo
    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    // User từ JWT
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    // Tổng tiền
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    // Trạng thái đơn hàng
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // Thông tin người nhận
    @Column(nullable = false, length = 150)
    private String receiverName;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 255)
    private String address;

    // Ghi chú
    @Column(length = 255, name = "note", nullable = true)
    private String note;

    // Khuyến mãi áp dụng
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderPromotion> promotions;

    // Phí vận chuyển (Phí ship)
    @Column(name = "shipping_fee", precision = 12, scale = 2)
    private BigDecimal shippingFee;

    // Thời gian giao hàng dự kiến
    @Column(name = "estimated_delivery_time_to")
    private LocalDateTime estimatedDeliveryTimeTo;
    @Column(name = "estimated_delivery_time_from")
    private LocalDateTime estimatedDeliveryTimeFrom;

    // Phương thức thanh toán
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Thời gian thanh toán thành công
    @Column(name = "paidAt", nullable = true)
    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        status = OrderStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<Payments> payments;
}