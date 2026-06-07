package com.example.minigarden.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @Column(name = "old_content")
    private String oldContent;

    @Column(name = "edited_at", nullable = false)
    private LocalDateTime editedAt;

    public void onEdit(String newContent) {
        this.oldContent = message.getContent();
        this.editedAt = LocalDateTime.now();
    }


    
}
