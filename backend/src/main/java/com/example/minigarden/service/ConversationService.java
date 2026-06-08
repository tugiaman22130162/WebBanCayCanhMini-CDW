package com.example.minigarden.service;

import com.example.minigarden.entity.Conversation;
import com.example.minigarden.entity.Role;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ConversationRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Conversation getOrCreateConversationForUser(Integer userId) {
        return conversationRepository.findByCustomerId(userId).orElseGet(() -> {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            Integer adminId = admins.isEmpty() ? 1 : admins.get(0).getId();

            Conversation newConversation = Conversation.builder()
                    .customerId(userId)
                    .adminId(adminId)
                    .build();
            return conversationRepository.save(Objects.requireNonNull(newConversation));
        });
    }
      public List<Conversation> getAllConversations() {
        return conversationRepository.findAll();
    }
}