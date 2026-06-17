package com.example.minigarden.repository;
import com.example.minigarden.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Message, Integer> {
       List<Message> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);
         
       @Transactional
       @Modifying
       @Query(value = "DELETE FROM message_histories WHERE message_id IN (SELECT id FROM messages WHERE conversation_id = :conversationId)", nativeQuery = true)
       void deleteMessageHistoriesByConversationId(@Param("conversationId") Integer conversationId);

       @Transactional
       @Modifying
       @Query("DELETE FROM Message m WHERE m.conversationId = :conversationId")
       void deleteByConversationId(@Param("conversationId") Integer conversationId);

    
}
