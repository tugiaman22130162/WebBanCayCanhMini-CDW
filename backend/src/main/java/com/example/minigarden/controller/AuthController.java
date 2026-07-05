package com.example.minigarden.controller;

import com.example.minigarden.dto.AuthResponse;
import com.example.minigarden.dto.LoginRequest;
import com.example.minigarden.dto.RegisterRequest;
import com.example.minigarden.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Endpoint này giờ sẽ yêu cầu cả OTP để hoàn tất đăng ký
            userService.completeRegistration(request);
            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được tạo thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/request-register-otp")
    public ResponseEntity<?> requestRegisterOtp(@RequestParam String email) {
        try {
            // Endpoint mới: chỉ kiểm tra và gửi OTP, không tạo tài khoản
            userService.requestRegistrationOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email của bạn."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            String message = userService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        try {
            userService.verifyOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "OTP hợp lệ"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String otp,
            @RequestParam String newPassword) {
        try {
            userService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-account")
    public ResponseEntity<?> verifyAccount(@RequestParam String email, @RequestParam String otp) {
        try {
            userService.verifyAccount(email, otp);
            return ResponseEntity.ok(Map.of("message", "Xác thực tài khoản thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}