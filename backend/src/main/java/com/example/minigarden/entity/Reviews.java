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

    // Lưu URL hình ảnh đánh giá (các URL cách nhau bằng dấu phẩy)
    @Column(length = 2000)
    private String images;

    // Ẩn/hiện review (để admin có thể ẩn những review không phù hợp)
    @Column(nullable = false)
    private Boolean status;

    private LocalDateTime created_at;
    
    private LocalDateTime updated_at;
    
    @Builder.Default
    @Column(name = "edit_count", nullable = false)
    private Integer editCount = 0;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        status = true;
        if (editCount == null) {
            editCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }
}