package com.example.minigarden.controller;

import com.example.minigarden.dto.BlogRequest;
import com.example.minigarden.dto.BlogResponse;
import com.example.minigarden.entity.BlogType;
import com.example.minigarden.service.BlogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BlogController {

    private final BlogService blogService;
    private final ObjectMapper objectMapper; // Dùng để parse Data từ Client

    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAll() {
        return ResponseEntity.ok(blogService.getAll());
    }

    @GetMapping("/published")
    public ResponseEntity<List<BlogResponse>> getPublished() {
        return ResponseEntity.ok(blogService.getPublished());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(blogService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<BlogResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBySlug(slug));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<BlogResponse>> getByType(@PathVariable BlogType type) {
        return ResponseEntity.ok(blogService.getByType(type));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<?> create(
            @RequestPart("blog") String blogStr,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            Principal principal) throws Exception {
        if (principal == null) {
            return new ResponseEntity<>("Yêu cầu đăng nhập để thực hiện chức năng này.", HttpStatus.UNAUTHORIZED);
        }
        BlogRequest req = objectMapper.readValue(blogStr, BlogRequest.class);
        BlogResponse created = blogService.create(req, thumbnail, principal);
        return ResponseEntity.ok(Map.of("message", "Thêm bài viết thành công", "data", created));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestPart("blog") String blogStr,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            Principal principal) throws Exception {
        if (principal == null) {
            return new ResponseEntity<>("Yêu cầu đăng nhập để thực hiện chức năng này.", HttpStatus.UNAUTHORIZED);
        }
        BlogRequest req = objectMapper.readValue(blogStr, BlogRequest.class);
        BlogResponse updated = blogService.update(id, req, thumbnail);
        return ResponseEntity.ok(Map.of("message", "Cập nhật bài viết thành công", "data", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        blogService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Xóa bài viết thành công"));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(blogService.uploadBlogImage(image));
    }
}