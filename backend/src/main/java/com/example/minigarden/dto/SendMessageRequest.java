package com.example.minigarden.dto;

import lombok.Data;

@Data
public class SendMessageRequest {
    private Integer conversationId;
    private Integer senderId;
    private String content;
    private String type; // TEXT, IMAGE, LOCATION, STICKER, ORDER, EMOJI
    private Integer replyToMessageId;
    private Integer referenceId;
}
