package com.example.minigarden.controller;

import com.example.minigarden.entity.CustomTerrarium;
import com.example.minigarden.entity.CustomTerrariumStatus;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.NotificationType;
import com.example.minigarden.service.NotificationService;
import com.example.minigarden.service.CloudinaryService;
import com.example.minigarden.repository.CustomTerrariumRepository;
import com.example.minigarden.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/terrariums")
public class CustomTerrariumController {

    @Autowired
    private CustomTerrariumRepository customTerrariumRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private CloudinaryService cloudinaryService;

    // Dành cho User: Lưu bản thiết kế
    @PostMapping
    public ResponseEntity<?> createDesign(
            @RequestPart("design") CustomTerrarium design,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        design.setUser(user);
        // Nếu không có trạng thái được gửi từ FE, mặc định là PENDING
        if (design.getStatus() == null) {
            design.setStatus(CustomTerrariumStatus.PENDING);
        }
        design.setCreatedAt(LocalDateTime.now());

        if (image != null && !image.isEmpty()) {
            // Sử dụng hàm mới để upload vào folder riêng
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadUserDesignImage(image);
            design.setUserImage(uploadedImage.secureUrl());
        }

        CustomTerrarium saved = customTerrariumRepository.save(design);
        
        // Gửi thông báo cho Admin
        if (saved.getStatus() == CustomTerrariumStatus.PENDING) {
            notificationService.createNotification(
                    "Khách hàng " + user.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium mới.",
                    "/admin/terrariums",
                    NotificationType.TERRARIUM
            );
        }
        
        return ResponseEntity.ok(Map.of("message", "Gửi yêu cầu thiết kế thành công!", "id", saved.getId()));
    }

    // Dành cho User: Lấy danh sách thiết kế của mình
    @GetMapping("/my-designs")
    public ResponseEntity<List<Map<String, Object>>> getMyDesigns(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<CustomTerrarium> designs = customTerrariumRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(designs.stream().map(this::mapToDTO).collect(Collectors.toList()));
    }

    // Dành cho Admin: Lấy tất cả thiết kế
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDesigns() {
        List<CustomTerrarium> designs = customTerrariumRepository.findByStatusNot(CustomTerrariumStatus.DRAFT);
        designs.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return ResponseEntity.ok(designs.stream().map(this::mapToDTO).collect(Collectors.toList()));
    }

    // Dành cho User: Cập nhật bản thiết kế (có thể từ DRAFT -> DRAFT hoặc DRAFT -> PENDING)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDesign(
            @PathVariable Integer id,
            @RequestPart("design") CustomTerrarium updatedDesign,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName()).orElseThrow();
        CustomTerrarium existingDesign = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();

        // Kiểm tra quyền sở hữu
        if (!existingDesign.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền chỉnh sửa bản thiết kế này."));
        }
        
        // Chỉ cho phép cập nhật nếu trạng thái hiện tại là DRAFT
        if (existingDesign.getStatus() != CustomTerrariumStatus.DRAFT) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể chỉnh sửa bản nháp. Để gửi yêu cầu, hãy sử dụng tính năng 'Gửi yêu cầu thiết kế' (nút riêng)."));
        }

        // Cập nhật các trường có thể thay đổi
        existingDesign.setContainerName(updatedDesign.getContainerName());
        existingDesign.setContainerPrice(updatedDesign.getContainerPrice());
        existingDesign.setSoilName(updatedDesign.getSoilName());
        existingDesign.setSoilPrice(updatedDesign.getSoilPrice());
        existingDesign.setPlants(updatedDesign.getPlants());
        existingDesign.setPlantPositions(updatedDesign.getPlantPositions());
        existingDesign.setPlantsPrice(updatedDesign.getPlantsPrice());
        existingDesign.setTotalPrice(updatedDesign.getTotalPrice());
        existingDesign.setUserNote(updatedDesign.getUserNote());
        existingDesign.setStatus(updatedDesign.getStatus()); // Có thể thay đổi trạng thái nếu người dùng Gửi yêu cầu

        if (image != null && !image.isEmpty()) {
            // Tùy chọn: Xóa ảnh cũ trên Cloudinary nếu có (để tiết kiệm dung lượng)
            if (existingDesign.getUserImage() != null && !existingDesign.getUserImage().isEmpty()) {
                cloudinaryService.deleteImage(existingDesign.getUserImage());
            }
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadUserDesignImage(image);
            existingDesign.setUserImage(uploadedImage.secureUrl());
        }
        CustomTerrarium saved = customTerrariumRepository.save(existingDesign);

        // Gửi thông báo cho Admin nếu trạng thái chuyển từ DRAFT sang PENDING
        if (saved.getStatus() == CustomTerrariumStatus.PENDING) {
            notificationService.createNotification(
                    "Khách hàng " + currentUser.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium mới (từ bản nháp được cập nhật).",
                    "/admin/terrariums",
                    NotificationType.TERRARIUM
            );
        }
        return ResponseEntity.ok(Map.of("message", "Cập nhật bản thiết kế thành công!", "id", saved.getId()));
    }

    // Dành cho User: Gửi bản nháp thành yêu cầu (DRAFT -> PENDING)
    @PutMapping("/{id}/submit-draft")
    public ResponseEntity<?> submitDraft(@PathVariable Integer id, Authentication authentication) {
        CustomTerrarium design = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (design.getStatus() != CustomTerrariumStatus.DRAFT) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể gửi bản nháp!"));
        }

        design.setStatus(CustomTerrariumStatus.PENDING);
        customTerrariumRepository.save(design);

        // Gửi thông báo cho Admin
        notificationService.createNotification(
                "Khách hàng " + user.getFullName() + " vừa gửi một yêu cầu duyệt thiết kế Terrarium (từ bản nháp).",
                "/admin/terrariums",
                NotificationType.TERRARIUM
        );

        return ResponseEntity.ok(Map.of("message", "Gửi yêu cầu thiết kế thành công!"));
    }

    // Dành cho User: Xóa bản nháp
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDraft(@PathVariable Integer id, Authentication authentication) {
        User currentUser = userRepository.findByEmail(authentication.getName()).orElseThrow();
        CustomTerrarium existingDesign = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();

        // Kiểm tra quyền sở hữu
        if (!existingDesign.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Bạn không có quyền xóa bản thiết kế này."));
        }
        
        // Chỉ cho phép xóa nếu trạng thái hiện tại là DRAFT
        if (existingDesign.getStatus() != CustomTerrariumStatus.DRAFT) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ có thể xóa bản nháp."));
        }

        if (existingDesign.getUserImage() != null && !existingDesign.getUserImage().isEmpty()) {
            cloudinaryService.deleteImage(existingDesign.getUserImage());
        }
        
        customTerrariumRepository.delete(existingDesign);

        return ResponseEntity.ok(Map.of("message", "Xóa bản nháp thành công!"));
    }

    // Dành cho Admin: Duyệt hoặc Từ chối thiết kế
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        CustomTerrarium design = customTerrariumRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        design.setStatus(CustomTerrariumStatus.valueOf(payload.get("status")));
        
        if (payload.containsKey("adminReply")) {
            design.setAdminReply(payload.get("adminReply"));
        }
        
        // Gửi thông báo lại cho User
        if (design.getUser() != null) {
            String msg = design.getStatus() == CustomTerrariumStatus.APPROVED ? "Thiết kế Terrarium của bạn đã được duyệt!" : "Thiết kế Terrarium của bạn đã bị từ chối.";
            notificationService.createUserNotification(design.getUser().getId(), msg, "/profile/history", NotificationType.TERRARIUM);
        }
        
        customTerrariumRepository.save(design);
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công!"));
    }

    private Map<String, Object> mapToDTO(CustomTerrarium design) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", design.getId());
        map.put("containerName", design.getContainerName());
        map.put("containerPrice", design.getContainerPrice());
        map.put("soilName", design.getSoilName());
        map.put("soilPrice", design.getSoilPrice());
        map.put("plants", design.getPlants());
        map.put("plantPositions", design.getPlantPositions());
        map.put("plantsPrice", design.getPlantsPrice());
        map.put("totalPrice", design.getTotalPrice());
        map.put("userNote", design.getUserNote());
        map.put("adminReply", design.getAdminReply());
        map.put("userImage", design.getUserImage());
        map.put("status", design.getStatus());
        map.put("createdAt", design.getCreatedAt());
        
        if (design.getUser() != null) {
            map.put("user", Map.of("id", design.getUser().getId(), "fullName", design.getUser().getFullName(), "email", design.getUser().getEmail()));
        }
        return map;
    }
}