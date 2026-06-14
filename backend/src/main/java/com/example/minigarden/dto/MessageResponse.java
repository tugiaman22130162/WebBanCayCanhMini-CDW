package com.example.minigarden.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private Integer id;
    private Integer senderId;
    private String content;
    private String type; // TEXT, IMAGE, LOCATION, ORDER
    private Boolean isEdited;
    private Boolean deletedAt;
    private Integer replyToMessageId;
    private String senderName; 
    private String senderAvatar; 
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; 

    private String reaction; 
    private String imgUrl; 
    private Boolean isOnline;
}
