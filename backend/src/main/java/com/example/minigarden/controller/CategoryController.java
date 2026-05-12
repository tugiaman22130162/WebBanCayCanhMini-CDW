package com.example.minigarden.controller;

import com.example.minigarden.dto.CategoryRespone;
import com.example.minigarden.entity.Categories;
import com.example.minigarden.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173") 
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Categories>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Lấy thông tin một danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Categories> getCategoryById(@PathVariable Integer id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm mới một danh mục
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Categories> createCategory(
            @RequestPart("category") Categories category,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(categoryService.createCategory(category, image));
    }

    // Cập nhật thông tin danh mục
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Categories> updateCategory(
            @PathVariable Integer id, 
            @RequestPart("category") Categories categoryDetails,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return categoryService.updateCategory(id, categoryDetails, image)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Xóa một danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        if (categoryService.deleteCategory(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // API Xuất Excel
    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportExcel() throws IOException {
        ByteArrayInputStream in = categoryService.exportCategoriesToExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=Danh_Sach_Danh_Muc.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // API Nhập Excel
    @PostMapping("/import")
    public ResponseEntity<?> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            categoryService.importCategoriesFromExcel(file);
            return ResponseEntity.ok(Map.of("message", "Nhập dữ liệu thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi khi nhập dữ liệu: " + e.getMessage()));
        }
    }

    @GetMapping("/statistics")
    public CategoryRespone getStatistics() {
        return categoryService.getStatistics();
    }
}
