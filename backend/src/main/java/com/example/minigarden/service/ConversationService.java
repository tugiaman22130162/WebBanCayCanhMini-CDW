package com.example.minigarden.service;

import com.example.minigarden.entity.Conversation;
import com.example.minigarden.entity.Role;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ConversationRepository;
import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.websocket.OnlineUserTracker;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final OnlineUserTracker onlineUserTracker;
    

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
    
    @Transactional(readOnly = true)
    public Optional<Conversation> getConversationForUserOptional(Integer userId) {
        return conversationRepository.findByCustomerId(userId);
    }

    public List<Conversation> getAllConversations() {
        return conversationRepository.findAll().stream()
                .filter(c -> c.getAdminDeletedAt() == null
                        || (c.getLastMessageTime() != null && c.getLastMessageTime().isAfter(c.getAdminDeletedAt())))
                .toList();
    }

    // xóa (ẩn cuộc trò chuyện)
    @Transactional
    public void deleteConversation(Integer conversationId, UserPrincipal currentUser) {
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(conversationId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        boolean isAdmin = currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            conversation.setAdminDeletedAt(java.time.LocalDateTime.now());
        } else {
            conversation.setCustomerDeletedAt(java.time.LocalDateTime.now());
        }
        conversationRepository.save(conversation);
    }

    public boolean isAdminOnline() {
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        System.out.println("=== isAdminOnline CHECK ===");
        System.out.println("ONLINE USERS = " + onlineUserTracker.getOnlineUsers());
        System.out.println("ADMIN IDs = " + admins.stream().map(User::getId).toList());

        boolean result = admins.stream()
                .anyMatch(admin -> onlineUserTracker.isOnline(admin.getId()));

        System.out.println("RESULT = " + result);
        return result;
    }

    public List<Map<String, Object>> getAllConversationsWithOnlineStatus() {
        return getAllConversations().stream().map(c -> {

            System.out.println(
                    "customerId=" + c.getCustomerId()
                            + " online=" + onlineUserTracker.isOnline(c.getCustomerId()));

            Map<String, Object> map = new HashMap<>();
            map.put("conversation", c);
            map.put("isOnline", onlineUserTracker.isOnline(c.getCustomerId()));
            return map;
        }).toList();
    }
}
