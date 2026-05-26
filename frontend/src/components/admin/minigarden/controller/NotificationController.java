package com.example.minigarden.controller;

import com.example.minigarden.entity.Notification;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Dành cho Admin (Lấy tất cả thông báo hệ thống không thuộc về user cụ thể)
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // Dành cho User (Chỉ lấy thông báo của user đang đăng nhập)
    @GetMapping("/my-notifications")
    public ResponseEntity<?> getMyNotifications(Principal principal) {
        try {
            if (principal == null) return ResponseEntity.status(401).body("Chưa đăng nhập");
            
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
            
            return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tải thông báo: " + e.getMessage());
        }
    }

    // Đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Admin đánh dấu tất cả là đã đọc
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }

    // User đánh dấu tất cả thông báo CỦA MÌNH là đã đọc
    @PutMapping("/user/read-all")
    public ResponseEntity<?> markAllUserAsRead(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName()).orElseThrow();
        notificationService.markAllUserAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}