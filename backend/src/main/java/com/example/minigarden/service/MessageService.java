package com.example.minigarden.service;

import com.example.minigarden.dto.MessageResponse;
import com.example.minigarden.dto.SendMessageRequest;
import com.example.minigarden.entity.Conversation;
import com.example.minigarden.entity.Message;
import com.example.minigarden.entity.MessageHistory;
import com.example.minigarden.entity.MessageType;
import com.example.minigarden.entity.User;
import com.example.minigarden.repository.ConversationRepository;
import com.example.minigarden.repository.MessageHistoryRepository;
import com.example.minigarden.repository.MessagesRepository;
import com.example.minigarden.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessagesRepository messagesRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageHistoryRepository messageHistoryRepository;
    private final CloudinaryService cloudinaryService;


    // Lấy danh sách tin nhắn của 1 cuộc trò chuyện
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Integer conversationId) {
        List<Message> messages = messagesRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Gửi tin nhắn mới
    @Transactional
    public MessageResponse sendMessage(Integer senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(Objects.requireNonNull(request.getConversationId()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .content(request.getContent())
                .type(MessageType.valueOf(request.getType() != null ? request.getType() : "TEXT"))
                .isEdited(false)
                .deletedAt(false)
                .replyToMessageId(request.getReplyToMessageId())
                .referenceId(request.getReferenceId())
                .build();

        Message savedMessage = messagesRepository.save(Objects.requireNonNull(message));

        // Cập nhật ID tin nhắn cuối cùng vào Conversation
        conversation.updateLastMessage(savedMessage.getId());
        conversationRepository.save(conversation);

        return mapToResponse(savedMessage);
    }

    // Chỉnh sửa tin nhắn
    @Transactional
    public MessageResponse editMessage(Integer messageId, Integer senderId, String newContent) {
        Message message = messagesRepository.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        if (!message.getSenderId().equals(senderId)) {
            throw new RuntimeException("Bạn không có quyền sửa tin nhắn này");
        }

        // Lưu nội dung cũ vào bảng message_histories
        MessageHistory history = MessageHistory.builder()
                .message(message)
                .oldContent(message.getContent())
                .editedAt(java.time.LocalDateTime.now())
                .build();
        messageHistoryRepository.save(history);

        message.setContent(newContent);
        message.markAsEdited();
        return mapToResponse(messagesRepository.save(message));
    }

    // Thu hồi tin nhắn
    @Transactional
    public MessageResponse revokeMessage(Integer messageId, Integer senderId) {
        Message message = messagesRepository.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        if (!message.getSenderId().equals(senderId)) {
            throw new RuntimeException("Bạn không có quyền thu hồi tin nhắn này");
        }

        message.markAsDeleted();
        return mapToResponse(messagesRepository.save(message));
    }

    // Thả cảm xúc
    @Transactional
    public MessageResponse reactMessage(Integer messageId, String reaction) {
        Message message = messagesRepository.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));
        message.setReaction(reaction);
        return mapToResponse(messagesRepository.save(message));
    }

    // Hàm ánh xạ Entity sang DTO
    private MessageResponse mapToResponse(Message message) {
        User sender = userRepository.findById(message.getSenderId()).orElse(null);
        
        return MessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .type(message.getType() != null ? message.getType().name() : "TEXT")
                .isEdited(message.getIsEdited())
                .deletedAt(message.getDeletedAt())
                .replyToMessageId(message.getReplyToMessageId())
                .reaction(message.getReaction())
                .senderName(sender != null ? sender.getFullName() : "Unknown")
                .senderAvatar(sender != null ? sender.getAvatar() : null)
                .createdAt(message.getCreatedAt() != null ? message.getCreatedAt().toString() : null)
                .updatedAt(message.getUpdatedAt() != null ? message.getUpdatedAt().toString() : null)
                .build();
    }

    // Lấy lịch sử chỉnh sửa tin nhắn
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getMessageHistory(Integer messageId) {
        List<MessageHistory> allHistories = messageHistoryRepository.findAll();
        
        List<MessageHistory> histories = allHistories.stream()
                .filter(h -> h.getMessage() != null && messageId.equals(h.getMessage().getId()))
                .sorted((h1, h2) -> {
                    if (h1.getEditedAt() == null && h2.getEditedAt() == null) return 0;
                    if (h1.getEditedAt() == null) return 1;
                    if (h2.getEditedAt() == null) return -1;
                    return h2.getEditedAt().compareTo(h1.getEditedAt());
                })
                .collect(Collectors.toList());

        return histories.stream().map(h -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", h.getId());
            map.put("oldContent", h.getOldContent());
            map.put("editedAt", h.getEditedAt() != null ? h.getEditedAt().toString() : null);
            return map;
        }).collect(Collectors.toList());
    }

    //gửi tin nhắn hình ảnh
    @Transactional
    public MessageResponse sendImg(MultipartFile file, Integer senderId, Integer conversationId) {
        CloudinaryService.UploadedImage uploadedImage = cloudinaryService.uploadChatImage(file);
        String imgUrl = uploadedImage.secureUrl();

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .content(imgUrl)
                .type(MessageType.IMAGE)
                .isEdited(false)
                .deletedAt(false)
                .build();

        Message savedMessage = messagesRepository.save(message);

        conversation.updateLastMessage(savedMessage.getId());
        conversationRepository.save(conversation);

        return mapToResponse(savedMessage);
    }

    //gửi đơn hàng
    @Transactional
    public MessageResponse sendOrder(Integer senderId, Integer conversationId, Integer referenceId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        Message message = Message.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
                .content("ORDER:" + referenceId) 
                .type(MessageType.ORDER)
                .isEdited(false)
                .deletedAt(false)
                .referenceId(referenceId)
                .build();

        Message savedMessage = messagesRepository.save(message);

        conversation.updateLastMessage(savedMessage.getId());
        conversationRepository.save(conversation);

        return mapToResponse(savedMessage);
    }
}
