package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "terrarium_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TerrariumComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String type; // CONTAINER, SOIL, PLANT
    private Double price;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String image; // Dùng cho Cây
    private String cssStyle; // Dùng cho class CSS của Bình hoặc Mã màu của Đất
    
    private String light; // Chăm sóc cây
    private String humidity; 
    private String careLevel;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;
}