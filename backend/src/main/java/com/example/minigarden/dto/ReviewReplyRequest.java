package com.example.minigarden.dto;

import lombok.Data;

@Data
public class ReviewReplyRequest {

    // ID của đánh giá mà Admin đang phản hồi
    private Integer reviewId;

    // Nội dung phản hồi từ phía Admin
    private String comment;

}