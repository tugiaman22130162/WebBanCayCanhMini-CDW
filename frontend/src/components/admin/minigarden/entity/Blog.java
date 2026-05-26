package com.example.minigarden.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    //hình thumbnail
    private String thumbnail;

    //cái đường dẫn, vd: trang-tri-ban-hoc
    private String slug;

    //thời gian đọc, vd: 5 phút
    private Integer readingTime;

    //có 5 loai bài viết: mẹo TIPS, xu hướng TREND, hướng dẫn GUIDE, khuyến mãi PROMOTION, trang trí DECOR
    @Enumerated(EnumType.STRING)
    private BlogType type;

    //bài viết đã xuất bản chưa, nếu chưa thì chỉ admin mới xem được, còn nếu đã xuất bản thì tất cả mọi người đều xem được
    private Boolean published;

    private LocalDateTime createdAt;

    //cập nhật lần cuối khi nào
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
