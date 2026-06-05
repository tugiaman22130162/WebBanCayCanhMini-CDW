package com.example.minigarden.repository;

import com.example.minigarden.entity.CustomTerrarium;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomTerrariumRepository extends JpaRepository<CustomTerrarium, Integer> {
    List<CustomTerrarium> findByUserIdOrderByCreatedAtDesc(Integer userId);
}