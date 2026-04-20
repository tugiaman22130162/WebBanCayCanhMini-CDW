package com.example.minigarden.controller;

import com.example.minigarden.dto.Product;
import com.example.minigarden.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
            @RequestPart("product") Product productPayload,
            @RequestPart("images") List<MultipartFile> images) {
        try {
            productService.createProduct(productPayload, images);
            return ResponseEntity.ok().body("{\"message\": \"Thêm sản phẩm thành công!\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("{\"message\": \"Có lỗi xảy ra: " + e.getMessage() + "\"}");
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer id,
            @RequestPart("product") Product productPayload,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            productService.updateProduct(id, productPayload, images);
            return ResponseEntity.ok().body("{\"message\": \"Cập nhật sản phẩm thành công!\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("{\"message\": \"Có lỗi xảy ra: " + e.getMessage() + "\"}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().body("{\"message\": \"Xóa sản phẩm thành công!\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"message\": \"Có lỗi xảy ra: " + e.getMessage() + "\"}");
        }
    }
}
