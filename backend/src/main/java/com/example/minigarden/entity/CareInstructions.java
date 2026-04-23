package com.example.minigarden.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "care_instructions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareInstructions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Liên kết tới product_details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_detail_id", nullable = false)
    @JsonIgnore
    private ProductDetails product_detail;

    // Tưới nước
    @Column(nullable = false, length = 1000)
    private String watering;

    // Ánh sáng
    @Column(nullable = false, length = 1000)
    private String sunlight;

    // Bón phân
    @Column(nullable = false, length = 1000)
    private String fertilizing;
}