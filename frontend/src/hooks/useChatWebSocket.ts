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
            isActive: true,
            isOnline: false // Trạng thái ban đầu là offline
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
                let currentConversationId: number | null = null;
                let lastMsgTime = new Date();
                try {
                    const convRes = await axios.get('http://localhost:8080/api/conversations/my-conversation', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    currentConversationId = convRes.data.id;
                    lastMsgTime = convRes.data.lastMessageTime ? new Date(convRes.data.lastMessageTime) : new Date();
                } catch (error: any) {
                    if (error.response?.status !== 404) throw error;
                }

                setActiveConversationId(currentConversationId);

                let formattedMsgs: ChatMessage[] = [];
                let lastMsgText = 'Bạn cần tư vấn gì ạ?';

                if (currentConversationId) {
                    const res = await axios.get(`http://localhost:8080/api/messages/conversation/${currentConversationId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!isMounted) return;

                    formattedMsgs = res.data.map((msg: any) => ({
                        id: msg.id,
                        text: msg.content,
                        type: msg.type || 'TEXT',
                        sender: String(msg.senderId) === String(user.id) ? 'USER' : 'ADMIN',
                        timestamp: new Date(msg.createdAt),
                        isDeleted: msg.deletedAt,
                        isEdited: msg.isEdited,
                        updatedAt: msg.updatedAt,
                        replyToMessageId: msg.replyToMessageId,
                        reaction: msg.reaction,
                        senderName: msg.senderName,
                        senderAvatar: msg.senderAvatar,
                        referenceId: msg.referenceId || msg.reference_id
                    }));
                    setMessages(formattedMsgs);

                    if (formattedMsgs.length > 0) {
                        const lastMsg = formattedMsgs[formattedMsgs.length - 1];
                        const isLastMsgSticker = lastMsg.type === 'STICKER' || isStickerUrl(lastMsg.text);
                        const isLastMsgImage = lastMsg.type === 'IMAGE';
                        const isLastMsgOrder = lastMsg.type === 'ORDER';
                        const isLastMsgLocation = lastMsg.type === 'LOCATION';
                        lastMsgText = lastMsg.sender === 'USER' ? `Bạn: ${isLastMsgSticker ? '[Nhãn dán]' : isLastMsgImage ? '[Hình ảnh]' : isLastMsgOrder ? '[Đơn hàng]' : isLastMsgLocation ? '[Vị trí]' : lastMsg.text}` : (isLastMsgSticker ? '[Nhãn dán]' : isLastMsgImage ? '[Hình ảnh]' : isLastMsgOrder ? '[Đơn hàng]' : isLastMsgLocation ? '[Vị trí]' : lastMsg.text);
                        lastMsgTime = lastMsg.timestamp;
                        markConversationAsRead(currentConversationId, lastMsg.timestamp);
                    } else {
                        lastMsgText = 'Bắt đầu trò chuyện...';
                    }
                }

                setConversations(prev => [{
                    id: currentConversationId || 0, name: `Quản trị viên - MiniGarden`, avatar: '/logo.png', 
                    lastMessage: lastMsgText, lastMessageTime: lastMsgTime,
                    unread: currentConversationId ? (JSON.parse(localStorage.getItem("userUnreadCounts") || "{}")[currentConversationId] || 0) : 0,
                    isOnline: prev.length > 0 ? prev[0].isOnline : false, // Giữ lại trạng thái online cũ nếu có
                    isActive: true
                }]);

                const socket = new SockJS('http://localhost:8080/ws');
                stompClient = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        if (currentConversationId) {
                        stompClient!.subscribe(`/topic/conversation/${currentConversationId}`, (message) => {
                            const msg = JSON.parse(message.body);
                            const newMsg: ChatMessage = { // Also add updatedAt here for consistency
                                id: msg.id,
                                text: msg.content,
                                type: msg.type || 'TEXT',
                                sender: msg.senderId === user.id ? 'USER' : 'ADMIN',
                                timestamp: new Date(msg.createdAt), isDeleted: msg.deletedAt, isEdited: msg.isEdited, updatedAt: msg.updatedAt,
                                replyToMessageId: msg.replyToMessageId, reaction: msg.reaction,
                                senderName: msg.senderName, senderAvatar: msg.senderAvatar, referenceId: msg.referenceId || msg.reference_id
                            } as any;
                            
                            if (String(msg.senderId) !== String(user.id)) markConversationAsRead(currentConversationId, new Date(msg.createdAt));

                            setMessages(prev => {
                                if (prev.find(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                            
                            const isNewMsgSticker = newMsg.type === 'STICKER' || isStickerUrl(newMsg.text);
                            const isNewMsgImage = newMsg.type === 'IMAGE';
                            const isNewMsgOrder = newMsg.type === 'ORDER';
                            const isNewMsgLocation = newMsg.type === 'LOCATION';
                            setConversations(prev => prev.map(c => 
                                c.id === currentConversationId ? { 
                                    ...c, 
                                    lastMessage: newMsg.sender === 'USER' ? `Bạn: ${isNewMsgSticker ? '[Nhãn dán]' : isNewMsgImage ? '[Hình ảnh]' : isNewMsgOrder ? '[Đơn hàng]' : isNewMsgLocation ? '[Vị trí]' : newMsg.text}` : (isNewMsgSticker ? '[Nhãn dán]' : isNewMsgImage ? '[Hình ảnh]' : isNewMsgOrder ? '[Đơn hàng]' : isNewMsgLocation ? '[Vị trí]' : newMsg.text), 
                                    lastMessageTime: newMsg.timestamp 
                                } : c
                            ));
                            
                            if (String(msg.senderId) !== String(user.id) && 'Notification' in window && Notification.permission === 'granted') {
                                let notifBody = msg.content;
                                if (msg.type === 'STICKER' || isStickerUrl(notifBody)) notifBody = '[Nhãn dán]';
                                else if (msg.type === 'IMAGE') notifBody = '[Hình ảnh]';
                                else if (msg.type === 'ORDER') notifBody = '[Đơn hàng]';
                                else if (msg.type === 'LOCATION') notifBody = '[Vị trí]';
                                new Notification('Quản trị viên - MiniGarden', { body: notifBody, icon: '/logo.png' });
                            }
                        });

                        stompClient!.subscribe('/topic/conversation/update', (message) => {
                            const updatedMsgData = JSON.parse(message.body);
                            // Chỉ cập nhật tin nhắn nếu nó thuộc về cuộc hội thoại hiện tại
                            if (currentConversationId && updatedMsgData.conversationId === currentConversationId) {
                                setMessages(prev => prev.map(m => m.id === updatedMsgData.id ? {
                                    ...m, text: updatedMsgData.content, type: updatedMsgData.type || 'TEXT', isDeleted: updatedMsgData.deletedAt, isEdited: updatedMsgData.isEdited, 
                                    updatedAt: updatedMsgData.updatedAt || updatedMsgData.updated_at || new Date(),
                                    reaction: updatedMsgData.reaction, senderName: updatedMsgData.senderName, senderAvatar: updatedMsgData.senderAvatar, referenceId: updatedMsgData.referenceId || updatedMsgData.reference_id 
                                } as any : m));
                            }
                        });

                        stompClient!.subscribe(`/topic/conversation/${currentConversationId}/typing`, (message) => {
                            const event = JSON.parse(message.body);
                            if (String(event.senderId) !== String(user.id)) setIsTyping(event.isTyping);
                        });
                        }

                        // Lắng nghe sự kiện ai đó vừa online/offline
                        stompClient!.subscribe('/topic/online-status', (message) => {
                            // Vì có thể có nhiều admin, cứ mỗi khi có người thay đổi trạng thái mạng, ta check lại status của admin
                            axios.get('http://localhost:8080/api/conversations/admin-status', {
                                headers: { Authorization: `Bearer ${token}` }
                            })
                                .then(res => {
                                    setConversations(prev => prev.map(c => ({ ...c, isOnline: res.data.isOnline })));
                                }).catch(console.error);
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

    // Chạy ngầm kiểm tra trạng thái online của Admin
    useEffect(() => {
        if (!isLoggedIn) return;
        const token = localStorage.getItem('token');

        const fetchAdminStatus = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/conversations/admin-status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const adminIsOnline = res.data.isOnline;
                setConversations(prev => prev.map(c => ({ ...c, isOnline: adminIsOnline })));
            } catch (error) {
                console.error("Lỗi kiểm tra trạng thái admin:", error);
                // Nếu lỗi, mặc định là offline
                setConversations(prev => prev.map(c => ({ ...c, isOnline: false })));
            }
        };

        fetchAdminStatus(); // Gọi ngay lần đầu
        // Đã có WebSocket lắng nghe /topic/online-status ở trên nên có thể bỏ interval để giảm tải server
        // const interval = setInterval(fetchAdminStatus, 15000); 
        // return () => clearInterval(interval);
    }, [isLoggedIn]);

    return {
        conversations, setConversations, messages, setMessages,
        activeConversationId, setActiveConversationId, isTyping
    };
}