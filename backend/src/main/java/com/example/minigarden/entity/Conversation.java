package com.example.minigarden.entity;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ID của người dùng (lấy từ JWT)
    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    // id admin lấy từ JWT
    @Column(name = "admin_id", nullable = false)
    private Integer adminId;

    private int lastMessageId;

    private LocalDateTime lastMessageTime;

    @Column(name = "last_message_content", columnDefinition = "TEXT")
    private String lastMessageContent;

    @Column(name = "last_message_sender_id")
    private Integer lastMessageSenderId;

    @Column(name = "customer_last_seen_message_id")
    private int customerLastSeenMessageId;
    @Column(name = "admin_last_seen_message_id")
    private int adminLastSeenMessageId;

    @Column(name = "customer_deleted_at")
    private LocalDateTime customerDeletedAt;

    @Column(name = "admin_deleted_at")
    private LocalDateTime adminDeletedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void updateLastMessage(int messageId, String content, Integer senderId) {
        this.lastMessageId = messageId;
        this.lastMessageContent = content;
        this.lastMessageSenderId = senderId;
        this.lastMessageTime = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
