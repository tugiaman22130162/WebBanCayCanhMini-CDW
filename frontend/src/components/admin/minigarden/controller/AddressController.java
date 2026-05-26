package com.example.minigarden.controller;

import com.example.minigarden.dto.AddressRequest;
import com.example.minigarden.entity.Address;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    // Hàm hỗ trợ lấy ID người dùng từ Token (Bảo mật)
    private Integer getUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Chưa đăng nhập hoặc Token không hợp lệ");
        }
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<?> getAllAddresses(Principal principal) {
        try {
            Integer userId = getUserIdFromPrincipal(principal);
            List<Address> addresses = addressService.getAllByUserId(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createAddress(@RequestBody AddressRequest request, Principal principal) {
        try {
            Integer userId = getUserIdFromPrincipal(principal);
            Address address = addressService.create(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Integer id, @RequestBody AddressRequest request, Principal principal) {
        try {
            Integer userId = getUserIdFromPrincipal(principal);
            Address address = addressService.update(id, userId, request);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Integer id, Principal principal) {
        try {
            Integer userId = getUserIdFromPrincipal(principal);
            addressService.delete(id, userId);
            return ResponseEntity.ok(Map.of("message", "Xóa địa chỉ thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}