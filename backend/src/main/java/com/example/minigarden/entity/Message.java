package com.example.minigarden.entity;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "conversation_id", nullable = false)
    private Integer conversationId;

    @Column(name = "sender_id", nullable = false)
    private Integer senderId;

    @Column(name = "content", nullable = false)
    private String content;

    // Loại tin nhắn: TEXT, IMAGE, LOCATION, STICKER, ORDER, EMOJI
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)    
    private MessageType type;
    
    //chỉnh sửa
    @Column(name = "is_edited", nullable = false)
    private Boolean isEdited;

    //Thu hồi hoăc xóa tin nhắn
    @Column(name = "delete_at", nullable = false)
    private Boolean deletedAt;

    //phản hồi tin nhắn
    @Column(name = "reply_to_message_id")
    private Integer replyToMessageId;

    @Column(name = "reaction")
    private String reaction;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "reference_id", nullable = true)
    private Integer referenceId;

    public void markAsEdited() {
        this.isEdited = true;
        this.updatedAt = LocalDateTime.now();
    }
    public void markAsDeleted() {
        this.deletedAt = true;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
