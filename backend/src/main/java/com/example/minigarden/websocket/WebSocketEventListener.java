package com.example.minigarden.websocket;

import com.example.minigarden.repository.UserRepository;
import com.example.minigarden.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final OnlineUserTracker onlineUserTracker;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Map lưu trữ sessionId tương ứng với userId nào
    private final Map<String, Integer> sessionUserMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            try {
                String email = jwtService.extractUsername(jwt);
                userRepository.findByEmail(email).ifPresent(user -> {
                    Integer userId = user.getId();
                    sessionUserMap.put(sessionId, userId);
                    onlineUserTracker.setOnline(userId);
                    
                    System.out.println("USER_ID connected = " + userId + " | Session = " + sessionId);
                    System.out.println("ONLINE USERS = " + onlineUserTracker.getOnlineUsers());
                    
                    // Broadcast cho tất cả mọi người biết user này vừa online
                    messagingTemplate.convertAndSend("/topic/online-status", Map.of("userId", userId, "status", "ONLINE"));
                });
            } catch (Exception e) {
                System.out.println("Invalid JWT in WebSocket Connect");
            }
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();

        Integer userId = sessionUserMap.remove(sessionId);
        if (userId != null) {
            onlineUserTracker.setOffline(userId);
            System.out.println("USER_ID disconnected = " + userId + " | Session = " + sessionId);
            System.out.println("ONLINE USERS = " + onlineUserTracker.getOnlineUsers());
            
            // Broadcast cho tất cả mọi người biết user này vừa offline
            messagingTemplate.convertAndSend("/topic/online-status", Map.of("userId", userId, "status", "OFFLINE"));
        }
    }
}