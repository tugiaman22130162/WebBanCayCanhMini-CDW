package com.example.minigarden.repository;

import com.example.minigarden.entity.Payments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payments, Integer> {
    List<Payments> findByOrder_Id(Integer orderId);
}