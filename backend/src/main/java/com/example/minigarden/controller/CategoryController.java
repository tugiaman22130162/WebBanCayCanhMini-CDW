package com.example.minigarden.controller;

import com.example.minigarden.entity.Categories;
import com.example.minigarden.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173") 
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Categories>> getAllCategories() {
        List<Categories> categories = categoryRepository.findAll();
        return ResponseEntity.ok(categories);
    }

    // Lấy thông tin một danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Categories> getCategoryById(@PathVariable Integer id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm mới một danh mục
    @PostMapping
    public ResponseEntity<Categories> createCategory(@RequestBody Categories category) {
        Categories savedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(savedCategory);
    }

    // Cập nhật thông tin danh mục
    @PutMapping("/{id}")
    public ResponseEntity<Categories> updateCategory(@PathVariable Integer id, @RequestBody Categories categoryDetails) {
        return categoryRepository.findById(id).map(category -> {
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            category.setSlug(categoryDetails.getSlug());
            category.setImage_url(categoryDetails.getImage_url());
            Categories updatedCategory = categoryRepository.save(category);
            return ResponseEntity.ok(updatedCategory);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Xóa một danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
