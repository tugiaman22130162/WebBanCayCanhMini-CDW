package com.example.minigarden.controller;

import com.example.minigarden.entity.TerrariumComponent;
import com.example.minigarden.service.TerrariumComponentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/terrarium-components")
@RequiredArgsConstructor
public class TerrariumComponentController {

    private final TerrariumComponentService service;

    @GetMapping
    public ResponseEntity<List<TerrariumComponent>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    public ResponseEntity<TerrariumComponent> create(
            @RequestPart("component") TerrariumComponent component,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(service.create(component, image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TerrariumComponent> update(
            @PathVariable Integer id,
            @RequestPart("component") TerrariumComponent component,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(service.update(id, component, image));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}