import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message as ChatMessage, Conversation, isStickerUrl } from '../utils/chatUtils';

export default function useAdminChatWebSocket(user: any) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);

    const userRef = useRef(user);
    const activeConvRef = useRef(activeConversationId);
    const typingSubRef = useRef<any>(null);
    const processedMsgIds = useRef<Set<number>>(new Set());
    const userRolesMapRef = useRef<Record<string, string>>({});

    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { activeConvRef.current = activeConversationId; }, [activeConversationId]);

    const safeGetTime = (dateVal: any) => {
        if (!dateVal) return 0;
        if (dateVal instanceof Date) return dateVal.getTime();
        if (Array.isArray(dateVal)) return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0).getTime();
        if (typeof dateVal === 'string') {
            const parsed = new Date(dateVal.replace(' ', 'T'));
            if (!isNaN(parsed.getTime())) return parsed.getTime();
        }
        return new Date(dateVal).getTime() || 0;
    };

    const markConversationAsRead = (convId: number, lastMessageTime: string | Date) => {
        const readTimes = JSON.parse(localStorage.getItem("adminReadTimes") || "{}");
        readTimes[convId] = lastMessageTime instanceof Date ? lastMessageTime.toISOString() : lastMessageTime;
        localStorage.setItem("adminReadTimes", JSON.stringify(readTimes));

        const unreadCounts = JSON.parse(localStorage.getItem("adminUnreadCounts") || "{}");
        unreadCounts[convId] = 0;
        localStorage.setItem("adminUnreadCounts", JSON.stringify(unreadCounts));
        window.dispatchEvent(new Event("adminUnreadUpdated"));
    };

    useEffect(() => {
        const handleUnreadUpdate = () => {
            const unreadCounts = JSON.parse(localStorage.getItem("adminUnreadCounts") || "{}");
            setConversations(prev => prev.map(c => ({ ...c, unread: unreadCounts[c.id] || 0 })));
        };
        window.addEventListener("adminUnreadUpdated", handleUnreadUpdate);
        return () => window.removeEventListener("adminUnreadUpdated", handleUnreadUpdate);
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        let client: Client | null = null;
        let isMounted = true;

        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem("token");
                const usersRes = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${token}` } });
                const usersList = usersRes.data;
                const res = await axios.get("http://localhost:8080/api/conversations", { headers: { Authorization: `Bearer ${token}` } });
                const rawConvs = Array.isArray(res.data) ? res.data : (res.data.content || []);
                const formattedConvs = rawConvs.map((item: any) =>
                    item.conversation ? { ...item.conversation, isOnline: item.isOnline } : item
                );

                const rolesMap: Record<string, string> = {};
                usersList.forEach((u: any) => {
                    rolesMap[u.id] = u.role;
                });
                userRolesMapRef.current = rolesMap;

                const activeUserId = userRef.current?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);
                const unreadCounts = JSON.parse(localStorage.getItem("adminUnreadCounts") || "{}");

                const formatted = formattedConvs.map((c: any) => {
                    const customer = usersList.find((u: any) => u.id === c.customerId || u.id === c.customer_id);
                    let lastMsgText = c.lastMessage?.content || 'Chưa có tin nhắn';
                    if (c.lastMessage?.type === 'STICKER' || isStickerUrl(lastMsgText)) lastMsgText = '[Nhãn dán]';
                    else if (c.lastMessage?.type === 'IMAGE') lastMsgText = '[Hình ảnh]';
                    else if (c.lastMessage?.type === 'ORDER') lastMsgText = '[Đơn hàng]';
                    else if (c.lastMessage?.type === 'LOCATION') lastMsgText = '[Vị trí]';
                    console.log(
                        "CONV",
                        c.id,
                        "CUSTOMER",
                        c.customerId,
                        "ONLINE",
                        c.isOnline
                    );
                    const actualSenderId = c.lastMessage?.senderId || c.lastMessage?.sender_id;
                    const senderRole = rolesMap[actualSenderId] || (String(actualSenderId) === String(activeUserId) ? 'ADMIN' : 'USER');
                    if (c.lastMessage && senderRole === 'ADMIN') lastMsgText = `Bạn: ${lastMsgText}`;

                    return {
                        ...c,
                        id: c.id, name: customer ? customer.fullName : (c.user?.fullName || c.userName || 'Khách hàng'),
                        avatar: customer ? customer.avatar : c.user?.avatar,
                        lastMessage: lastMsgText, lastMessageTime: c.lastMessageTime || c.last_message_time || null,
                        unread: unreadCounts[c.id] || 0, isActive: false,
                        isOnline: !!c.isOnline
                    };
                });

                // Chặn tạo Zombie WebSocket
                if (!isMounted) return;

                formatted.sort((a: any, b: any) => safeGetTime(b.lastMessageTime) - safeGetTime(a.lastMessageTime));
                setConversations(formatted);

                // KẾT NỐI WEBSOCKET CHUNG CHO ADMIN
                const socket = new SockJS('http://localhost:8080/ws');
                client = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        setStompClient(client);

                        client!.subscribe('/topic/admin/messages', (message) => {
                            const msg = JSON.parse(message.body);
                            const currentActiveId = userRef.current?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);
                            const convId = msg.conversationId || msg.conversation_id;
                            const actualMsgSenderId = msg.senderId || msg.sender_id;

                            const newMsg: ChatMessage = {
                                id: msg.id,
                                text: msg.content,
                                type: msg.type || 'TEXT',
                                sender: String(actualMsgSenderId) === String(currentActiveId) ? 'ADMIN' : 'USER',
                                timestamp: new Date(msg.createdAt || msg.created_at),
                                isDeleted: msg.deletedAt || msg.deleted_at,
                                isEdited: msg.isEdited || msg.is_edited,
                                updatedAt: msg.updatedAt || msg.updated_at,
                                editedAt: msg.editedAt || msg.edited_at,
                                replyToMessageId: msg.replyToMessageId || msg.reply_to_message_id,
                                reaction: msg.reaction,
                                senderName: msg.senderName || msg.sender_name,
                                senderAvatar: msg.senderAvatar || msg.sender_avatar,
                                referenceId: msg.referenceId || msg.reference_id
                            } as any;

                            const isNewSticker = newMsg.type === 'STICKER' || isStickerUrl(newMsg.text);
                            const isNewImage = newMsg.type === 'IMAGE';
                            const isNewOrder = newMsg.type === 'ORDER';
                            const isNewLocation = newMsg.type === 'LOCATION';
                            const lastMsgText = newMsg.sender === 'ADMIN' ? `Bạn: ${isNewSticker ? '[Nhãn dán]' : isNewImage ? '[Hình ảnh]' : isNewOrder ? '[Đơn hàng]' : isNewLocation ? '[Vị trí]' : newMsg.text}` : (isNewSticker ? '[Nhãn dán]' : isNewImage ? '[Hình ảnh]' : isNewOrder ? '[Đơn hàng]' : isNewLocation ? '[Vị trí]' : newMsg.text);

                            if (activeConvRef.current === convId) {
                                if (String(actualMsgSenderId) !== String(currentActiveId)) markConversationAsRead(convId, new Date(newMsg.timestamp));
                                setMessages(prev => prev.find(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                            } else {
                                if (String(actualMsgSenderId) !== String(currentActiveId)) {
                                }
                            }
                            setConversations(prev => {
                                const exists = prev.find(c => c.id === convId);
                                let updated;
                                if (exists) {
                                    updated = prev.map(c => c.id === convId ? { ...c, lastMessage: lastMsgText, lastMessageTime: newMsg.timestamp } : c);
                                } else {
                                    const newConv = {
                                        id: convId, name: msg.senderName || msg.sender_name || 'Khách hàng', avatar: msg.senderAvatar || msg.sender_avatar,
                                        lastMessage: lastMsgText, lastMessageTime: newMsg.timestamp,
                                        unread: String(actualMsgSenderId) !== String(currentActiveId) ? 1 : 0, isActive: false
                                    };
                                    updated = [newConv, ...prev];
                                }
                                return updated.sort((a: any, b: any) => safeGetTime(b.lastMessageTime) - safeGetTime(a.lastMessageTime));
                            });
                        });

                        client!.subscribe('/topic/conversation/update', (message) => {
                            const msg = JSON.parse(message.body);
                            if (activeConvRef.current === msg.conversationId) {
                                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, text: msg.content, type: msg.type || 'TEXT', isDeleted: msg.deletedAt, isEdited: msg.isEdited, updatedAt: msg.updatedAt || msg.updated_at || new Date(), editedAt: msg.editedAt || msg.edited_at, reaction: msg.reaction, senderName: msg.senderName, senderAvatar: msg.senderAvatar, referenceId: msg.referenceId || msg.reference_id } as any : m));
                            }
                        });

                        // Lắng nghe sự kiện ai đó vừa online/offline
                        client!.subscribe('/topic/online-status', (message) => {
                            const data = JSON.parse(message.body);
                            setConversations(prev => prev.map(c => {
                                // customerId có thể lưu ở dạng c.customerId hoặc c.customer_id
                                const customerId = (c as any).customerId || (c as any).customer_id;
                                if (customerId === data.userId) {
                                    return { ...c, isOnline: data.status === 'ONLINE' };
                                }
                                return c;
                            }));
                        });
                    }
                });
                client.activate();

                if (formatted.length > 0 && !activeConversationId) handleSelectConversation(formatted[0].id);
            } catch (error) { console.error("Lỗi lấy danh sách chat", error); }
        };
        fetchConversations();

        return () => {
            isMounted = false;
            if (client) client.deactivate();
        };
    }, [user?.id]);

    useEffect(() => {
        if (stompClient && stompClient.connected && activeConversationId) {
            if (typingSubRef.current) {
                typingSubRef.current.unsubscribe();
                typingSubRef.current = null;
            }
            typingSubRef.current = stompClient.subscribe(`/topic/conversation/${activeConversationId}/typing`, (message) => {
                const event = JSON.parse(message.body);
                const currentActiveId = userRef.current?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);
                if (String(event.senderId) !== String(currentActiveId)) setIsTyping(event.isTyping);
            });
        }
    }, [stompClient, activeConversationId]);

    // Tiến trình chạy ngầm: Tự động cập nhật trạng thái Online/Offline mỗi 10 giây
    useEffect(() => {
        if (!user?.id) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        const fetchOnlineStatus = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/conversations", { headers: { Authorization: `Bearer ${token}` } });
                const rawConvs = Array.isArray(res.data) ? res.data : (res.data.content || []);
                const statusMap: Record<number, boolean> = {};

                rawConvs.forEach((item: any) => {
                    const convId = item.conversation ? item.conversation.id : item.id;
                    statusMap[convId] = !!item.isOnline;
                });

                setConversations(prev => {
                    let hasChanges = false;
                    const next = prev.map(c => {
                        if (c.isOnline !== statusMap[c.id]) {
                            hasChanges = true;
                            return { ...c, isOnline: statusMap[c.id] };
                        }
                        return c;
                    });
                    return hasChanges ? next : prev;
                });
            } catch (error) {
                console.error("Lỗi cập nhật trạng thái online:", error);
            }
        };

        // Hàm fetchConversations ở useEffect phía trên đã lấy status lần đầu rồi
        // Đã có WebSocket lắng nghe /topic/online-status nên có thể bỏ interval để giảm tải server
        // const interval = setInterval(fetchOnlineStatus, 10000);
        // return () => clearInterval(interval);
    }, [user?.id]);

    const handleSelectConversation = async (convId: number) => {
        if (!convId) return;
        setActiveConversationId(convId);
        setConversations(prev => prev.map(c => ({ ...c, isActive: c.id === convId, unread: c.id === convId ? 0 : c.unread })));
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:8080/api/messages/conversation/${convId}`, { headers: { Authorization: `Bearer ${token}` } });
            const activeUserId = userRef.current?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : null);
            const formattedMsgs = res.data.map((msg: any) => ({
                id: msg.id, text: msg.content, type: msg.type || 'TEXT',
                sender: String(msg.senderId || msg.sender_id) === String(activeUserId) ? 'ADMIN' : 'USER',
                timestamp: new Date(msg.createdAt || msg.created_at),
                isDeleted: msg.deletedAt || msg.deleted_at,
                isEdited: msg.isEdited || msg.is_edited,
                updatedAt: msg.updatedAt || msg.updated_at,
                editedAt: msg.editedAt || msg.edited_at,
                replyToMessageId: msg.replyToMessageId || msg.reply_to_message_id, reaction: msg.reaction, senderName: msg.senderName || msg.sender_name, senderAvatar: msg.senderAvatar || msg.sender_avatar, referenceId: msg.referenceId || msg.reference_id
            }));
            setMessages(formattedMsgs);

            if (formattedMsgs.length > 0) {
                const realLastMsg = formattedMsgs[formattedMsgs.length - 1];
                markConversationAsRead(convId, realLastMsg.timestamp);
            }
        } catch (error) { console.error("Lỗi tải tin nhắn", error); }
    };

    return { conversations, setConversations, messages, setMessages, activeConversationId, setActiveConversationId, isTyping, handleSelectConversation, stompClient };
}