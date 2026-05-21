package com.example.minigarden.service;

import com.example.minigarden.entity.Notification;
import com.example.minigarden.entity.NotificationType;
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

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications() {
        return notificationRepository.findByIsReadFalseOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
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
        notificationRepository.markAllAsRead();
    }
}