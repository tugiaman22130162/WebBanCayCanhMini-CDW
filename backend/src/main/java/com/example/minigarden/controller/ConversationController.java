package com.example.minigarden.controller;

import com.example.minigarden.service.ConversationService;
import com.example.minigarden.service.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
        return conversationService.getConversationForUserOptional(currentUser.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Dành cho việc chủ động tạo cuộc trò chuyện (Người dùng gửi tin nhắn đầu tiên)
    @PostMapping
    public ResponseEntity<?> createMyConversation(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(conversationService.getOrCreateConversationForUser(currentUser.getId()));
    }

    // Lấy danh sách tất cả các cuộc trò chuyện
    @GetMapping
    public ResponseEntity<?> getAllConversations() {
        return ResponseEntity.ok(conversationService.getAllConversationsWithOnlineStatus());
    }

    // Tạo hoặc lấy cuộc trò chuyện với một khách hàng cụ thể (Dành cho Admin)
    @PostMapping("/user/{customerId}")
    public ResponseEntity<?> getOrCreateConversationForCustomer(@PathVariable("customerId") Integer customerId) {
        try {
            return ResponseEntity.ok(conversationService.getOrCreateConversationForUser(customerId));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Lỗi tạo cuộc trò chuyện: " + e.getMessage()));
        }
    }

    // xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConversation(@PathVariable("id") Integer conversationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            conversationService.deleteConversation(conversationId, currentUser);
            return ResponseEntity.ok(java.util.Map.of("message", "Xóa cuộc trò chuyện thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("message", "Lỗi khi xóa cuộc trò chuyện: " + e.getMessage()));
        }
    }

    @GetMapping("/admin-status")
    public ResponseEntity<?> getAdminOnlineStatus() {
        return ResponseEntity.ok(java.util.Map.of("isOnline", conversationService.isAdminOnline()));
    }
}