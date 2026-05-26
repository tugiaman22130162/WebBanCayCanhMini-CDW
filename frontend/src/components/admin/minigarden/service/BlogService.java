package com.example.minigarden.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.example.minigarden.dto.BlogRequest;
import com.example.minigarden.dto.BlogResponse;
import com.example.minigarden.entity.Blog;
import com.example.minigarden.entity.User;
import com.example.minigarden.entity.BlogType;
import com.example.minigarden.repository.BlogRepository;
import com.example.minigarden.repository.UserRepository;

import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;



@Service
@RequiredArgsConstructor
public class BlogService {
    //mapper
    private final BlogRepository repo;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService; // Đảm bảo bạn đã có Service này trong source code

    private BlogResponse mapToResponse(Blog blog) {
    return BlogResponse.builder()
            .id(blog.getId())
            .title(blog.getTitle())
            .content(blog.getContent())
            .thumbnail(blog.getThumbnail())
            .slug(blog.getSlug())
            .readingTime(blog.getReadingTime())
            .type(blog.getType())
            .published(blog.getPublished())
            .createdAt(blog.getCreatedAt())
            .updatedAt(blog.getUpdatedAt())
            .authorName(blog.getUser() != null ? blog.getUser().getFullName() : null)
            .authorAvatar(blog.getUser() != null ? blog.getUser().getAvatar() : null)
            .build();
}

    //tạo blog mới
    public BlogResponse create(BlogRequest req, MultipartFile thumbnail, Principal principal) {

    User user = userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng để gán cho bài viết."));

    Blog blog = new Blog();
    blog.setUser(user);

    blog.setTitle(req.getTitle());
    blog.setContent(req.getContent());

    if (thumbnail != null && !thumbnail.isEmpty()) {
        try {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(thumbnail); // Đổi hàm này cho khớp với CloudinaryService của bạn
            blog.setThumbnail(uploadedImage.secureUrl());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tải ảnh lên Cloudinary");
        }
    } else {
        blog.setThumbnail(req.getThumbnail());
    }

    blog.setSlug(req.getSlug());
    blog.setReadingTime(req.getReadingTime());
    blog.setType(req.getType());
    blog.setPublished(req.getPublished());

    blog.setCreatedAt(LocalDateTime.now());
    blog.setUpdatedAt(LocalDateTime.now());

    Blog saved = repo.save(blog);

    return mapToResponse(saved);
}

//cập nhật blog
public BlogResponse update(Integer id, BlogRequest req, MultipartFile thumbnail) {

    Blog blog = repo.findById(Objects.requireNonNull(id))
            .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

    blog.setTitle(req.getTitle());
    blog.setContent(req.getContent());

    if (thumbnail != null && !thumbnail.isEmpty()) {
        try {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(thumbnail);
            blog.setThumbnail(uploadedImage.secureUrl());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tải ảnh lên Cloudinary");
        }
    } else {
        blog.setThumbnail(req.getThumbnail());
    }

    blog.setSlug(req.getSlug());
    blog.setReadingTime(req.getReadingTime());
    blog.setType(req.getType());
    blog.setPublished(req.getPublished());
    blog.setUpdatedAt(LocalDateTime.now());

    return mapToResponse(repo.save(blog));
}

    // Lấy tất cả blog
    public List<BlogResponse> getAll() {
        return repo.findAll().stream().map(this::mapToResponse).toList();
    }

    // Lấy blog theo id
    public BlogResponse getById(Integer id) {
        Blog blog = repo.findById(Objects.requireNonNull(id)).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        return mapToResponse(blog);
    }

    // Lấy blog theo slug
    public BlogResponse getBySlug(String slug) {
        Blog blog = repo.findBySlug(slug).orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        return mapToResponse(blog);
    }

    // Lấy blog đã xuất bản
    public List<BlogResponse> getPublished() {
        return repo.findByPublishedTrue().stream().map(this::mapToResponse).toList();
    }

    // Lấy blog theo loại
    public List<BlogResponse> getByType(BlogType type) {
        return repo.findByType(type).stream().map(this::mapToResponse).toList();
    }

    // Xóa blog
    public void delete(Integer id) {
        repo.deleteById(Objects.requireNonNull(id));
    }
    
    // Dùng cho Tiptap Editor
    public Map<String, String> uploadBlogImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn một file ảnh.");
        }
        try {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadListingImage(image);
            return Map.of("url", uploadedImage.secureUrl());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tải ảnh lên Cloudinary.");
        }
    }
}
