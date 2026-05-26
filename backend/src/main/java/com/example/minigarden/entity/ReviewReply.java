package com.example.minigarden.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "review_replies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Đánh giá được phản hồi (1 Đánh giá - Nhiều Phản hồi)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    @JsonIgnore
    private Reviews review;

    // Người phản hồi (đại diện cho Admin/Shop)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    // Nội dung phản hồi
    @Column(nullable = false, length = 1000)
    private String comment;

    // Ẩn/hiện phản hồi (Để Admin có thể ẩn phản hồi nếu cần)
    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible;

    // Ngày tạo
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Ngày cập nhật
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "edit_count", nullable = false)
    private Integer editCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isVisible == null) {
            isVisible = true; // Mặc định hiển thị khi tạo
        }
        if (editCount == null) {
            editCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
