package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_terrariums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomTerrarium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String containerName;
    private Double containerPrice;

    private String soilName;
    private Double soilPrice;

    private String plants; // Tên các loại cây, cách nhau bằng dấu phẩy
    private Double plantsPrice;

    private Double totalPrice;
    private String userNote;
    private String adminReply;
    private String userImage;

    @Enumerated(EnumType.STRING)
    private CustomTerrariumStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}