package com.example.minigarden.controller;

import com.example.minigarden.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/ask")
    public ResponseEntity<?> askBot(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        
        // Gọi Service xử lý kết nối với OpenAI
        String botReply = chatbotService.getChatbotResponse(userMessage);
        
        // Trả về kết quả JSON dạng { "reply": "Nội dung phản hồi..." }
        return ResponseEntity.ok(Map.of("reply", botReply));
    }
}