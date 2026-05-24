package com.example.minigarden.repository;

import com.example.minigarden.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import com.example.minigarden.entity.OrderStatus;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.items i " +
           "WHERE LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(i.product_name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Order> searchOrders(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.items i " +
           "WHERE (LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(i.product_name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND o.createdAt BETWEEN :startDate AND :endDate")
    List<Order> searchOrdersWithDate(@Param("keyword") String keyword, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

    List<Order> findByUserIdOrderByCreatedAtDesc(Integer userId);

    Optional<Order> findByOrderCode(String orderCode);

    // Thống kê số lượng đơn hàng theo trạng thái
    int countByStatus(OrderStatus status);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0)
        FROM Order o
        WHERE o.status = 'DELIVERED'
    """)
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenueByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}