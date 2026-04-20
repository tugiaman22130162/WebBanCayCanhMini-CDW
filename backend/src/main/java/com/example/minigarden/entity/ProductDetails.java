package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "product_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết với products (1-1)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Products product;

    // Ánh sáng
    @Column(length = 100)
    private String light;

    // Tưới nước
    @Column(length = 100)
    private String water;

    // Kích thước
    @Column(length = 100)
    private String size;

    // Xuất xứ
    @Column(length = 150)
    private String origin;

    // Nhiệt độ phù hợp
    @Column(length = 100)
    private String temperature;

    // Loại chậu (gốm, nhựa,...)
    @Column(length = 100)
    private String potType;

    // Trọng lượng
    private Double weight;

    // Hướng dẫn chăm sóc
    @OneToMany(mappedBy = "product_detail", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CareInstructions> care_instructions;

    // Lưu ý
    @Column(columnDefinition = "TEXT")
    private String note;
}