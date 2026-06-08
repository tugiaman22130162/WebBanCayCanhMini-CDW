package com.example.minigarden.controller;

import com.example.minigarden.dto.MessageResponse;
import com.example.minigarden.dto.SendMessageRequest;
import com.example.minigarden.service.MessageService;
import com.example.minigarden.service.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    // Lấy tin nhắn của một đoạn chat
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable Integer conversationId) {
        return ResponseEntity.ok(messageService.getMessages(conversationId));
    }

    // Gửi tin nhắn mới
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody SendMessageRequest request) {
        MessageResponse response = messageService.sendMessage(currentUser.getId(), request);
        
        messagingTemplate.convertAndSend("/topic/conversation/" + request.getConversationId(), Objects.requireNonNull(response));
        
        Map<String, Object> adminMsg = objectMapper.convertValue(response, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        adminMsg.put("conversationId", request.getConversationId());
        messagingTemplate.convertAndSend("/topic/admin/messages", Objects.requireNonNull(adminMsg));
        
        return ResponseEntity.ok(response);
    }

    // Sửa tin nhắn
    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable Integer messageId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {
        MessageResponse response = messageService.editMessage(messageId, currentUser.getId(), body.get("content"));
        
        messagingTemplate.convertAndSend("/topic/conversation/update", Objects.requireNonNull(response));
        
        return ResponseEntity.ok(response);
    }

    // Thu hồi tin nhắn
    @DeleteMapping("/{messageId}/revoke")
    public ResponseEntity<MessageResponse> revokeMessage(
            @PathVariable Integer messageId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        MessageResponse response = messageService.revokeMessage(messageId, currentUser.getId());
        
        // Bắn cập nhật qua WebSocket
        messagingTemplate.convertAndSend("/topic/conversation/update", Objects.requireNonNull(response));
        
        return ResponseEntity.ok(response);
    }

    // "đang gõ phím" (Typing indicator)
    @PostMapping("/conversation/{conversationId}/typing")
    public ResponseEntity<?> sendTypingEvent(
            @PathVariable Integer conversationId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Boolean> payload) {
        
        Boolean isTyping = payload.getOrDefault("isTyping", true);
        
        Map<String, Object> event = Map.of(
                "conversationId", conversationId,
                "senderId", currentUser.getId(),
                "isTyping", isTyping
        );
 
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", Objects.requireNonNull(event));
        
        return ResponseEntity.ok().build();
    }

    // Lấy lịch sử chỉnh sửa tin nhắn
    @GetMapping("/{messageId}/history")
    public ResponseEntity<?> getMessageHistory(@PathVariable Integer messageId) {
        return ResponseEntity.ok(messageService.getMessageHistory(messageId));
    }

    // Thả cảm xúc
     @PutMapping("/{messageId}/react")
    public ResponseEntity<?> reactMessage(@PathVariable Integer messageId, @RequestBody java.util.Map<String, String> body) {
        try {
            return ResponseEntity.ok(messageService.reactMessage(messageId, body.get("reaction")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    //gửi tin nhắn hình ảnh
    @PostMapping("/send-image")
    public ResponseEntity<MessageResponse> sendImg(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("conversationId") Integer conversationId) {
        MessageResponse response = messageService.sendImg(file, currentUser.getId(), conversationId);
        
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, Objects.requireNonNull(response));
        
        Map<String, Object> adminMsg = objectMapper.convertValue(response, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        adminMsg.put("conversationId", conversationId);
        messagingTemplate.convertAndSend("/topic/admin/messages", Objects.requireNonNull(adminMsg));
        
        return ResponseEntity.ok(response);
    }

    //gửi đơn hàng
    @PostMapping("/send-order")
    public ResponseEntity<MessageResponse> sendOrder(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("conversationId") Integer conversationId,
            @RequestParam("referenceId") Integer referenceId) {
        MessageResponse response = messageService.sendOrder(currentUser.getId(), conversationId, referenceId);
        
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, Objects.requireNonNull(response));
        
        Map<String, Object> adminMsg = objectMapper.convertValue(response, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        adminMsg.put("conversationId", conversationId);
        messagingTemplate.convertAndSend("/topic/admin/messages", Objects.requireNonNull(adminMsg));
        
        return ResponseEntity.ok(response);
    }

}