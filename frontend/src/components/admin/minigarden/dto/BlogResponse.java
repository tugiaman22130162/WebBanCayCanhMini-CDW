package com.example.minigarden.dto;

import java.time.LocalDateTime;

import com.example.minigarden.entity.BlogType;
import lombok.Data;
import lombok.Builder;

@Data
@Builder

public class BlogResponse {
     private Integer id;
    private String title;
    private String content;
    private String thumbnail;
    private String slug;
    private Integer readingTime;
    private BlogType type;
    private Boolean published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String authorName;
    private String authorAvatar;
}
