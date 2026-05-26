package com.example.minigarden.dto;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Integer id;
    private String userName;
    private String productName;
    private Integer rating;
    private String comment;
    private Boolean visible;
    private LocalDateTime createdAt;
    private String image;
}
