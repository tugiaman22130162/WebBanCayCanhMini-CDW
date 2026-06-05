package com.example.minigarden.controller;

import com.example.minigarden.entity.TerrariumComponent;
import com.example.minigarden.repository.TerrariumComponentRepository;
import com.example.minigarden.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/terrarium-components")
public class TerrariumComponentController {

    @Autowired
    private TerrariumComponentRepository repository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<TerrariumComponent>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<TerrariumComponent> create(
            @RequestPart("component") TerrariumComponent component,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        
        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadComponentImage(image);
            component.setImage(uploadedImage.secureUrl());
        }
        return ResponseEntity.ok(repository.save(Objects.requireNonNull(component)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TerrariumComponent> update(
            @PathVariable Integer id,
            @RequestPart("component") TerrariumComponent component,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        component.setId(id);
        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadComponentImage(image);
            component.setImage(uploadedImage.secureUrl());
        }
        return ResponseEntity.ok(repository.save(Objects.requireNonNull(component)));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        repository.deleteById(Objects.requireNonNull(id));
    }
}