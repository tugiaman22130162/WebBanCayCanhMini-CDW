package com.example.minigarden.repository;
import com.example.minigarden.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Message, Integer> {
       List<Message> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);

    
}
