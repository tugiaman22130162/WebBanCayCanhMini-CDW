package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

import java.text.Normalizer;
import java.util.regex.Pattern;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Categories {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    // (vd: terrarium, cay-de-ban, sen-da) dùng để tạo URL thân thiện
    @Column(unique = true, length = 100)
    private String slug;

    @Column(columnDefinition = "LONGTEXT")
    private String image_url;

    @PrePersist
    @PreUpdate
    public void generateSlug() {
        if (this.name != null && !this.name.trim().isEmpty()) {
            // Đổi 'đ' thành 'd' trước vì Normalizer không xử lý được chữ Đ/đ của tiếng Việt
            String temp = this.name.toLowerCase().replace("đ", "d");
            String normalized = Normalizer.normalize(temp, Normalizer.Form.NFD);
            Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
            this.slug = pattern.matcher(normalized).replaceAll("")
                    .replaceAll("[^a-z0-9]+", "-") // Chữ, số thì giữ nguyên, còn lại biến thành dấu gạch ngang
                    .replaceAll("-+", "-") // Xóa nhiều dấu gạch ngang liền nhau
                    .replaceAll("^-|-$", ""); // Xóa dấu gạch ngang ở đầu và cuối chuỗi
        }
    }
}