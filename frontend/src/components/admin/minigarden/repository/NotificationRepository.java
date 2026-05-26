package com.example.minigarden.repository;

import com.example.minigarden.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    // Admin notifications (Lọc những thông báo không gán cho user nào)
    List<Notification> findByIsReadFalseAndUserIsNullOrderByCreatedAtDesc();
    List<Notification> findByUserIsNullOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false AND n.user IS NULL")
    void markAllAdminAsRead();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.isRead = false AND n.user.id = :userId")
    void markAllUserAsRead(Integer userId);

    //tìm kiếm thông báo theo userId và sắp xếp theo createdAt giảm dần
    List<Notification> findByUser_IdOrderByCreatedAtDesc(Integer userId);
}