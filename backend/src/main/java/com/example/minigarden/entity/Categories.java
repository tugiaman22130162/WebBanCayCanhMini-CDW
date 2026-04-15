package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

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

    @Column(length = 255)
    private String image_url;
}