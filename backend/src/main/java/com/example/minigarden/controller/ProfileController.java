package com.example.minigarden.controller;

import com.example.minigarden.entity.User;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.CloudinaryService;
import com.example.minigarden.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập hoặc Token không hợp lệ"));
            }
            return ResponseEntity.ok(userService.getUserProfile(principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile file, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập hoặc Token không hợp lệ"));
            }

            String email = principal.getName();
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Người dùng không tồn tại"));
            }

            User user = userOptional.get();

            // Upload ảnh lên Cloudinary
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadAvatarImage(file);
            
            // Cập nhật URL ảnh mới vào User
            user.setAvatar(uploadedImage.secureUrl());
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật ảnh đại diện thành công",
                    "avatarUrl", uploadedImage.secureUrl()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi cập nhật ảnh đại diện: " + e.getMessage()));
        }
    }

    @PutMapping("/me/info")
    public ResponseEntity<?> updateUserInfo(@RequestBody Map<String, String> payload, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập hoặc Token không hợp lệ"));
            }

            String email = principal.getName();
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Người dùng không tồn tại"));
            }

            User user = userOptional.get();

            // Cập nhật thông tin nếu có truyền lên từ Frontend
            if (payload.containsKey("fullName")) {
                user.setFullName(payload.get("fullName"));
            }
            if (payload.containsKey("phone")) {
                user.setPhoneNumber(payload.get("phone")); // Lưu ý: Database dùng trường phoneNumber
            }
            if (payload.containsKey("address")) {
                user.setAddress(payload.get("address"));
                user.setIsDefault(1); // Đánh dấu là địa chỉ mặc định
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Cập nhật thông tin thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi cập nhật thông tin: " + e.getMessage()));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập hoặc Token không hợp lệ"));
            }

            String email = principal.getName();
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Người dùng không tồn tại"));
            }

            User user = userOptional.get();

            String currentPassword = payload.get("currentPassword");
            String newPassword = payload.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng cung cấp đầy đủ mật khẩu hiện tại và mật khẩu mới"));
            }

            // Kiểm tra mật khẩu hiện tại có đúng không
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(400).body(Map.of("message", "Mật khẩu hiện tại không chính xác"));
            }

            // Cập nhật mật khẩu mới (nhớ mã hóa trước khi lưu)
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Cập nhật mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi khi cập nhật mật khẩu: " + e.getMessage()));
        }
    }
}