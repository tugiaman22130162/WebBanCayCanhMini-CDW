package com.example.minigarden.service;

import com.example.minigarden.dto.PaymentDTO;
import com.example.minigarden.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream().map(payment -> 
            PaymentDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderCode(payment.getOrder() != null ? payment.getOrder().getOrderCode() : null)
                .customerName(payment.getOrder() != null ? payment.getOrder().getReceiverName() : "Khách hàng không xác định")
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .orderStatus(payment.getOrder() != null ? payment.getOrder().getStatus() : null)
                .createdAt(payment.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }
}
