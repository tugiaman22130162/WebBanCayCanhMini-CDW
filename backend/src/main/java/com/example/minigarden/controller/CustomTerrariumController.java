package com.example.minigarden.controller;

import com.example.minigarden.entity.CustomTerrarium;
import com.example.minigarden.entity.CustomTerrariumStatus;
import com.example.minigarden.service.CustomTerrariumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terrariums")
@RequiredArgsConstructor
public class CustomTerrariumController {

    private final CustomTerrariumService customTerrariumService;

    // Dành cho User: Lưu bản thiết kế
    @PostMapping
    public ResponseEntity<?> createDesign(
            @RequestPart("design") CustomTerrarium design,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(customTerrariumService.createDesign(design, image, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi tạo thiết kế"));
        }
    }

    // Dành cho User: Lấy danh sách thiết kế của mình
    @GetMapping("/my-designs")
    public ResponseEntity<List<Map<String, Object>>> getMyDesigns(Authentication authentication) {
        return ResponseEntity.ok(customTerrariumService.getMyDesigns(authentication.getName()));
    }

    // Dành cho Admin: Lấy tất cả thiết kế
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDesigns() {
        return ResponseEntity.ok(customTerrariumService.getAllDesigns());
    }

    // Dành cho User: Cập nhật bản thiết kế (có thể từ DRAFT -> DRAFT hoặc DRAFT -> PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDesign(
            @PathVariable Integer id,
            @RequestPart("design") CustomTerrarium updatedDesign,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(customTerrariumService.updateDesign(id, updatedDesign, image, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi cập nhật"));
        }
    }

    // Dành cho User: Gửi bản nháp thành yêu cầu (DRAFT -> PENDING)
    @PutMapping("/{id}/submit-draft")
    public ResponseEntity<?> submitDraft(@PathVariable Integer id, Authentication authentication) {
        try {
            customTerrariumService.submitDraft(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Gửi yêu cầu thiết kế thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Dành cho User: Xóa bản nháp
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDraft(@PathVariable Integer id, Authentication authentication) {
        try {
            customTerrariumService.deleteDraft(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Xóa bản nháp thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    // Dành cho Admin: Duyệt hoặc Từ chối thiết kế
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        try {
            CustomTerrariumStatus newStatus = CustomTerrariumStatus.valueOf(payload.get("status"));
            String adminReply = payload.get("adminReply");
            customTerrariumService.updateStatus(id, newStatus, adminReply);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Dành cho User: Khởi tạo sản phẩm ẩn để thanh toán thiết kế
    @PostMapping("/{id}/checkout-product")
    public ResponseEntity<?> createCheckoutProduct(@PathVariable Integer id, Authentication authentication) {
        try {
            return ResponseEntity.ok(customTerrariumService.createCheckoutProduct(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    // Dành cho User: Đặt lại mẫu thiết kế từ Cộng đồng
    @PostMapping("/{id}/clone")
    public ResponseEntity<?> cloneDesign(@PathVariable Integer id, Authentication authentication) {
        try {
            return ResponseEntity.ok(customTerrariumService.cloneDesign(id, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Lỗi khi clone thiết kế"));
        }
    }
}