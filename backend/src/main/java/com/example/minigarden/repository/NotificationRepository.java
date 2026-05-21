package com.example.minigarden.repository;

import com.example.minigarden.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    List<Notification> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false")
    void markAllAsRead();
}