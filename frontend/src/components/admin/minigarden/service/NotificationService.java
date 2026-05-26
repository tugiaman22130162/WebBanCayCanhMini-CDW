package com.example.minigarden.service;

import com.example.minigarden.entity.Notification;
import com.example.minigarden.entity.NotificationType;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(String message, String link, NotificationType type) {
        Notification notification = Notification.builder()
                .message(message)
                .link(link)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(Objects.requireNonNull(notification));
    }

    // Hàm tạo thông báo dành riêng cho 1 User cụ thể (truyền userId vào)
    @Transactional
    public void createUserNotification(Integer userId, String message, String link, NotificationType type) {
        Notification notification = Notification.builder()
                .user(User.builder().id(userId).build())
                .message(message)
                .link(link)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(Objects.requireNonNull(notification));
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseAndUserIsNullOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findByUserIsNullOrderByCreatedAtDesc();
    }

    // Hàm lấy danh sách thông báo của riêng 1 User (Dùng khi user đăng nhập và gọi api lấy thông báo)
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Integer userId) {
        return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Integer id) {
        notificationRepository.findById(Objects.requireNonNull(id)).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(Objects.requireNonNull(notification));
        });
    }

    @Transactional
    public void markAllAsRead() {
        notificationRepository.markAllAdminAsRead();
    }

    @Transactional
    public void markAllUserAsRead(Integer userId) {
        notificationRepository.markAllUserAsRead(userId);
    }
}