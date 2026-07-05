package com.example.minigarden.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String confirmPassword;
    // Thêm trường OTP để gửi từ frontend lên khi xác thực
    private String otp;
}