package com.example.minigarden.controller;

import com.example.minigarden.service.ConversationService;
import com.example.minigarden.service.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    // Lấy đoạn chat của người dùng hiện tại
    @GetMapping("/my-conversation")
    public ResponseEntity<?> getMyConversation(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(conversationService.getOrCreateConversationForUser(currentUser.getId()));
    }

    // Lấy danh sách tất cả các cuộc trò chuyện
    @GetMapping
    public ResponseEntity<?> getAllConversations() {
        try {
            return ResponseEntity.ok(conversationService.getAllConversations());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Lỗi lấy danh sách chat: " + e.getMessage()));
        }
    }
}