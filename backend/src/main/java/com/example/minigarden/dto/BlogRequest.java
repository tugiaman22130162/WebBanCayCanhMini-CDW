package com.example.minigarden.dto;

import com.example.minigarden.entity.BlogType;
import lombok.Data;

@Data
public class BlogRequest {
    private String title;
    private String content;
    private String thumbnail;
    private String slug;
    private Integer readingTime;
    private BlogType type;
    private Boolean published;
    
}
