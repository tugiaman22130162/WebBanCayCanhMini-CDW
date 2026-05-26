package com.example.minigarden.entity;

public enum OrderStatus {
    PENDING, // chờ xác nhận
    CONFIRMED, // đã xác nhận
    SHIPPING, // đang giao
    DELIVERED, // đã giao
    CANCELLED // đã hủy
}