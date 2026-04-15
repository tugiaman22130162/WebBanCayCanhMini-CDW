package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reviews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Người dùng (từ JWT)
    @Column(name = "user_id", nullable = false)
    private Integer user_id;

    // Sản phẩm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Products product;

    // Số sao (1-5)
    @Column(nullable = false)
    private Integer rating;

    // Nội dung đánh giá
    @Column(length = 1000)
    private String comment;

    // Ẩn/hiện review (để admin có thể ẩn những review không phù hợp)
    @Column(nullable = false)
    private Boolean status;

    private LocalDateTime created_at;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        status = true;
    }
}