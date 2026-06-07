package com.example.minigarden.repository;

import com.example.minigarden.entity.MessageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageHistoryRepository extends JpaRepository<MessageHistory, Integer> {
}