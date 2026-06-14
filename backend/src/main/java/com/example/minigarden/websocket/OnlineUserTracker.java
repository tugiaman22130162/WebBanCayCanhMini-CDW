package com.example.minigarden.websocket;

import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OnlineUserTracker {

    private final Set<Integer> onlineUsers =
            ConcurrentHashMap.newKeySet();

    public void setOnline(Integer userId) {
        onlineUsers.add(userId);

        System.out.println(
                "ONLINE USERS = " + onlineUsers
        );
    }

    public void setOffline(Integer userId) {
        onlineUsers.remove(userId);

        System.out.println(
                "ONLINE USERS = " + onlineUsers
        );
    }

    public boolean isOnline(Integer userId) {

        boolean online =
                onlineUsers.contains(userId);

        System.out.println(
                "CHECK USER " + userId
                + " => " + online
        );

        return online;
    }

    public Set<Integer> getOnlineUsers() {
        return Collections.unmodifiableSet(onlineUsers);
    }
}