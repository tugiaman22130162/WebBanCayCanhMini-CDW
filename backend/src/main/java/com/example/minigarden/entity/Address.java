package com.example.minigarden.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ID của người dùng (lấy từ JWT)
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    // Tên người nhận hàng
    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;

    // Số điện thoại người nhận
    @Column(nullable = false, length = 15)
    private String phone;

    // Tỉnh / Thành phố
    @Column(nullable = false, length = 100)
    private String province;

    // Quận / Huyện
    @Column(nullable = false, length = 100)
    private String district;

    // Phường / Xã
    @Column(nullable = false, length = 100)
    private String ward;

    @Column(name = "province_id")
    private Integer provinceId;

    @Column(name = "district_id")
    private Integer districtId;

    @Column(name = "ward_code", length = 20)
    private String wardCode;

    // Số nhà, tên đường, thôn, ấp
    @Column(nullable = false, length = 255)
    private String street;

    //Full address (tự động ghép từ các trường trên)
    @Column(name = "full_address", nullable = false, length = 500)
    private String fullAddress;

    // Loại địa chỉ (VD: HOME, COMPANY, OTHER)
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private AddressType type;

    // Đặt làm địa chỉ mặc định
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isDefault == null) {
            isDefault = false;
        }
    }
}
