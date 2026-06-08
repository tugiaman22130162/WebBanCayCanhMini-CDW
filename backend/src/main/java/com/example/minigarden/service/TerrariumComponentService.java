package com.example.minigarden.service;

import com.example.minigarden.entity.TerrariumComponent;
import com.example.minigarden.repository.TerrariumComponentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TerrariumComponentService {

    private final TerrariumComponentRepository repository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<TerrariumComponent> getAll() {
        return repository.findAll();
    }

    @Transactional
    public TerrariumComponent create(TerrariumComponent component, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadComponentImage(image);
            component.setImage(uploadedImage.secureUrl());
        }
        return repository.save(Objects.requireNonNull(component));
    }

    @Transactional
    public TerrariumComponent update(Integer id, TerrariumComponent component, MultipartFile image) {
        component.setId(id);
        if (image != null && !image.isEmpty()) {
            CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadComponentImage(image);
            component.setImage(uploadedImage.secureUrl());
        }
        return repository.save(Objects.requireNonNull(component));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(Objects.requireNonNull(id));
    }
}