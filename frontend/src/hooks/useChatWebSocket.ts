import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message as ChatMessage, Conversation, isStickerUrl } from '../utils/chatUtils';

export default function useChatWebSocket(user: any, isLoggedIn: boolean) {
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 1,
            name: `Quản trị viên - ${user?.fullName || 'Khách hàng'}`,
            lastMessage: 'Cảm ơn bạn đã nhắn tin. Tư vấn viên của chúng mình sẽ phản hồi bạn trong giây lát nhé!',
            unread: 0,
            isActive: true
        }
    ]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const processedMsgIds = useRef<Set<number>>(new Set());

    const markConversationAsRead = (convId: number, lastMessageTime: string | Date) => {
        const readTimes = JSON.parse(localStorage.getItem("userReadTimes") || "{}");
        const timeStr = lastMessageTime instanceof Date ? lastMessageTime.toISOString() : lastMessageTime;
        readTimes[convId] = timeStr;
        localStorage.setItem("userReadTimes", JSON.stringify(readTimes));
        
        const unreadCounts = JSON.parse(localStorage.getItem("userUnreadCounts") || "{}");
        unreadCounts[convId] = 0;
        localStorage.setItem("userUnreadCounts", JSON.stringify(unreadCounts));
        
        window.dispatchEvent(new Event("userUnreadUpdated"));
    };

    useEffect(() => {
        const handleUnreadUpdate = () => {
            const unreadCounts = JSON.parse(localStorage.getItem("userUnreadCounts") || "{}");
            setConversations(prev => prev.map(c => ({ ...c, unread: unreadCounts[c.id] || 0 })));
        };
        window.addEventListener("userUnreadUpdated", handleUnreadUpdate);
        return () => window.removeEventListener("userUnreadUpdated", handleUnreadUpdate);
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !user) return;
        
        const token = localStorage.getItem('token');
        let stompClient: Client | null = null;
        let isMounted = true;

        const initChat = async () => {
            try {
                const convRes = await axios.get('http://localhost:8080/api/conversations/my-conversation', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentConversationId = convRes.data.id;
                setActiveConversationId(currentConversationId);

                const res = await axios.get(`http://localhost:8080/api/messages/conversation/${currentConversationId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!isMounted) return;

                const formattedMsgs = res.data.map((msg: any) => ({
                    id: msg.id, text: msg.content, type: msg.type || 'TEXT',
                    sender: String(msg.senderId) === String(user.id) ? 'USER' : 'ADMIN',
                    timestamp: new Date(msg.createdAt), isDeleted: msg.deletedAt, isEdited: msg.isEdited,
                    replyToMessageId: msg.replyToMessageId, reaction: msg.reaction,
                    senderName: msg.senderName, senderAvatar: msg.senderAvatar
                }));
                setMessages(formattedMsgs);

                let lastMsgText = 'Bắt đầu trò chuyện...';
                let lastMsgTime = convRes.data.lastMessageTime ? new Date(convRes.data.lastMessageTime) : new Date();
                if (formattedMsgs.length > 0) {
                    const lastMsg = formattedMsgs[formattedMsgs.length - 1];
                    const isLastMsgSticker = lastMsg.type === 'STICKER' || isStickerUrl(lastMsg.text);
                    const isLastMsgImage = lastMsg.type === 'IMAGE';
                    const isLastMsgOrder = lastMsg.type === 'ORDER';
                    lastMsgText = lastMsg.sender === 'USER' ? `Bạn: ${isLastMsgSticker ? '[Nhãn dán]' : isLastMsgImage ? '[Hình ảnh]' : isLastMsgOrder ? '[Đơn hàng]' : lastMsg.text}` : (isLastMsgSticker ? '[Nhãn dán]' : isLastMsgImage ? '[Hình ảnh]' : isLastMsgOrder ? '[Đơn hàng]' : lastMsg.text);
                    lastMsgTime = lastMsg.timestamp;
                    markConversationAsRead(currentConversationId, lastMsg.timestamp);
                } else if (convRes.data.lastMessageTime) {
                    markConversationAsRead(currentConversationId, new Date(convRes.data.lastMessageTime));
                }

                setConversations([{
                    id: currentConversationId, name: `Quản trị viên - MiniGarden`,
                    lastMessage: lastMsgText, lastMessageTime: lastMsgTime,
                    unread: JSON.parse(localStorage.getItem("userUnreadCounts") || "{}")[currentConversationId] || 0,
                    isActive: true
                }]);

                const socket = new SockJS('http://localhost:8080/ws');
                stompClient = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        stompClient!.subscribe(`/topic/conversation/${currentConversationId}`, (message) => {
                            const msg = JSON.parse(message.body);
                            const newMsg: ChatMessage = {
                                id: msg.id, text: msg.content, type: msg.type || 'TEXT',
                                sender: msg.senderId === user.id ? 'USER' : 'ADMIN',
                                timestamp: new Date(msg.createdAt), isDeleted: msg.deletedAt, isEdited: msg.isEdited,
                                replyToMessageId: msg.replyToMessageId, reaction: msg.reaction,
                                senderName: msg.senderName, senderAvatar: msg.senderAvatar
                            };
                            
                            if (String(msg.senderId) !== String(user.id)) markConversationAsRead(currentConversationId, new Date(msg.createdAt));

                            setMessages(prev => {
                                if (prev.find(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                            
                            const isNewMsgSticker = newMsg.type === 'STICKER' || isStickerUrl(newMsg.text);
                            const isNewMsgImage = newMsg.type === 'IMAGE';
                            const isNewMsgOrder = newMsg.type === 'ORDER';
                            setConversations(prev => prev.map(c => 
                                c.id === currentConversationId ? { 
                                    ...c, 
                                    lastMessage: newMsg.sender === 'USER' ? `Bạn: ${isNewMsgSticker ? '[Nhãn dán]' : isNewMsgImage ? '[Hình ảnh]' : isNewMsgOrder ? '[Đơn hàng]' : newMsg.text}` : (isNewMsgSticker ? '[Nhãn dán]' : isNewMsgImage ? '[Hình ảnh]' : isNewMsgOrder ? '[Đơn hàng]' : newMsg.text), 
                                    lastMessageTime: newMsg.timestamp 
                                } : c
                            ));
                            
                            if (String(msg.senderId) !== String(user.id) && 'Notification' in window && Notification.permission === 'granted') {
                                let notifBody = msg.content;
                                if (msg.type === 'STICKER' || isStickerUrl(notifBody)) notifBody = '[Nhãn dán]';
                                else if (msg.type === 'IMAGE') notifBody = '[Hình ảnh]';
                                else if (msg.type === 'ORDER') notifBody = '[Đơn hàng]';
                                new Notification('Quản trị viên - MiniGarden', { body: notifBody, icon: '/images/chatbot.png' });
                            }
                        });

                        stompClient!.subscribe('/topic/conversation/update', (message) => {
                            const msg = JSON.parse(message.body);
                            setMessages(prev => prev.map(m => m.id === msg.id ? {
                                ...m, text: msg.content, type: msg.type || 'TEXT', isDeleted: msg.deletedAt, isEdited: msg.isEdited,
                                reaction: msg.reaction, senderName: msg.senderName, senderAvatar: msg.senderAvatar
                            } : m));
                        });

                        stompClient!.subscribe(`/topic/conversation/${currentConversationId}/typing`, (message) => {
                            const event = JSON.parse(message.body);
                            if (String(event.senderId) !== String(user.id)) setIsTyping(event.isTyping);
                        });
                    }
                });
                stompClient.activate();
            } catch (error) {
                console.error("Lỗi khởi tạo chat", error);
            }
        };
        
        initChat();
        return () => { 
            isMounted = false;
            if (stompClient) stompClient.deactivate(); 
        };
    }, [isLoggedIn, user]);

    return {
        conversations, setConversations, messages, setMessages,
        activeConversationId, setActiveConversationId, isTyping
    };
}