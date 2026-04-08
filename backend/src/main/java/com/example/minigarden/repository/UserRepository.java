package com.example.minigarden.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.minigarden.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
}