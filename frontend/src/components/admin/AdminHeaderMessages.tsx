import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isStickerUrl } from "../../utils/chatUtils";
import { showSuccessToast } from "../../utils/ToastUtils";

export default function AdminHeaderMessages({ user }: { user: any }) {
    const [isMsgOpen, setIsMsgOpen] = useState(false);
    const msgDropdownRef = useRef<HTMLDivElement>(null);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const userRolesMapRef = useRef<Record<string, string>>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
             if (msgDropdownRef.current && !msgDropdownRef.current.contains(event.target as Node)) {
                setIsMsgOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user?.id) return; 

        let stompClient: Client | null = null;
        let isMounted = true;

        const safeGetTime = (dateVal: any) => {
            if (!dateVal) return 0;
            if (dateVal instanceof Date) return dateVal.getTime();
            if (Array.isArray(dateVal)) return new Date(dateVal[0], dateVal[1] - 1, dateVal[2], dateVal[3] || 0, dateVal[4] || 0, dateVal[5] || 0).getTime();
            if (typeof dateVal === 'string') {
                if (dateVal.includes('/')) {
                    const parts = dateVal.split(/[\s/:-T]+/);
                    if (parts.length >= 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), Number(parts[3]||0), Number(parts[4]||0), Number(parts[5]||0)).getTime();
                }
                const parsed = new Date(dateVal.replace(' ', 'T'));
                if (!isNaN(parsed.getTime())) return parsed.getTime();
            }
            return new Date(dateVal).getTime() || 0;
        };

        const initGlobalAdminChatListener = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const usersRes = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${token}` } });
                const res = await axios.get("http://localhost:8080/api/conversations", { headers: { Authorization: `Bearer ${token}` } });
                
                const rolesMap: Record<string, string> = {};
                usersRes.data.forEach((u: any) => { rolesMap[u.id] = u.role; });
                userRolesMapRef.current = rolesMap;

                const readTimes = JSON.parse(localStorage.getItem('adminReadTimes') || '{}');
                const unreadCountsToSave: any = {};
                let totalUnread = 0;

                const rawConvs = Array.isArray(res.data) ? res.data : (res.data.content || []);
                const convs = rawConvs.map((item: any) => item.conversation ? { ...item.conversation, isOnline: item.isOnline } : item);

                const formatted = await Promise.all(convs.map(async (c: any) => {
                    const customer = usersRes.data.find((u: any) => u.id === c.customerId);
                    let lastMsg = c.lastMessage;
                    let unreadCountForConv = 0;
                    const rTime = readTimes[c.id] ? new Date(readTimes[c.id]).getTime() : 0;

                    try {
                        const msgRes = await axios.get(`http://localhost:8080/api/messages/conversation/${c.id}`, { headers: { Authorization: `Bearer ${token}` } });
                        const messagesData = Array.isArray(msgRes.data) ? msgRes.data : (msgRes.data.content || []);
                        
                        if (messagesData && messagesData.length > 0) {
                            // Lấy thẳng tin nhắn ở cuối mảng (mới nhất) vì Backend đã sắp xếp sẵn ASC
                            lastMsg = messagesData[messagesData.length - 1];

                            const unreadMsgs = messagesData.filter((m: any) => {
                                const actualSender = m.senderId || m.sender_id;
                                const mRole = rolesMap[actualSender] || (String(actualSender) === String(user.id) ? 'ADMIN' : 'USER');
                                return safeGetTime(m.createdAt || m.created_at || m.timestamp) > rTime && mRole !== 'ADMIN';
                            });
                            unreadCountForConv = unreadMsgs.length;
                        }
                    } catch (e) {
                        console.error("Lỗi khi load tin nhắn conversation:", e);
                    }

                    unreadCountsToSave[c.id] = unreadCountForConv;
                    totalUnread += unreadCountForConv;

                    let text = lastMsg?.content || lastMsg?.text || 'Chưa có tin nhắn';
                    if (lastMsg?.type === 'IMAGE') text = '[Hình ảnh]';
                    else if (lastMsg?.type === 'STICKER' || isStickerUrl(text)) text = '[Nhãn dán]';
                    else if (lastMsg?.type === 'ORDER') text = '[Đơn hàng]';
                    else if (lastMsg?.type === 'LOCATION') text = '[Vị trí]';
                    
                    const actualSenderId = lastMsg?.senderId || lastMsg?.sender_id;
                    const senderRole = rolesMap[actualSenderId] || (String(actualSenderId) === String(user.id) ? 'ADMIN' : 'USER');
                    if (lastMsg && senderRole === 'ADMIN') text = "Bạn: " + text;

                    return {
                        id: c.id, name: customer ? customer.fullName : (c.user?.fullName || c.userName || 'Khách hàng'),
                        avatar: customer ? customer.avatar : c.user?.avatar,
                        lastMessageText: text,
                        lastMessageTime: lastMsg ? new Date(safeGetTime(lastMsg.createdAt || lastMsg.created_at || lastMsg.timestamp || c.lastMessageTime)) : (c.lastMessageTime ? new Date(safeGetTime(c.lastMessageTime)) : null),
                        senderId: actualSenderId
                    };
                }));
                
                formatted.sort((a: any, b: any) => safeGetTime(b.lastMessageTime) - safeGetTime(a.lastMessageTime));

                if (!isMounted) return;
                setRecentChats(formatted.slice(0, 5));
                localStorage.setItem('adminUnreadCounts', JSON.stringify(unreadCountsToSave));
                setUnreadMessageCount(totalUnread);
                window.dispatchEvent(new Event("adminUnreadUpdated"));

                const socket = new SockJS('http://localhost:8080/ws');
                stompClient = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        stompClient!.subscribe('/topic/admin/messages', (message) => {
                            const msg = JSON.parse(message.body);
                            const currentUserStr = localStorage.getItem("user");
                            const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;
                            const convId = msg.conversationId || msg.conversation_id;
                            const actualMsgSenderId = msg.senderId || msg.sender_id;
                            const msgSenderRole = userRolesMapRef.current[actualMsgSenderId] || (String(actualMsgSenderId) === String(currentUserId) ? 'ADMIN' : 'USER');
                            const isFromAdmin = msgSenderRole === 'ADMIN';

                            let newText = msg.content || msg.text;
                            if (msg.type === 'IMAGE') newText = '[Hình ảnh]';
                            else if (msg.type === 'STICKER' || isStickerUrl(newText)) newText = '[Nhãn dán]';
                            else if (msg.type === 'ORDER') newText = '[Đơn hàng]';
                            else if (msg.type === 'LOCATION') newText = '[Vị trí]';
                            if (isFromAdmin) newText = "Bạn: " + newText;

                            setRecentChats(prev => {
                                const exists = prev.find(c => c.id === convId);
                                let updated = exists 
                                    ? prev.map(c => c.id === convId ? { ...c, lastMessageText: newText, lastMessageTime: new Date(safeGetTime(msg.createdAt || msg.created_at)), senderId: actualMsgSenderId } : c)
                                    : [{ id: convId, name: msg.senderName || msg.sender_name || 'Khách hàng', avatar: msg.senderAvatar || msg.sender_avatar, lastMessageText: newText, lastMessageTime: new Date(safeGetTime(msg.createdAt || msg.created_at)), senderId: actualMsgSenderId }, ...prev];
                                return updated.sort((a: any, b: any) => safeGetTime(b.lastMessageTime) - safeGetTime(a.lastMessageTime)).slice(0, 5);
                            });

                            if (!isFromAdmin) {
                                const unreadCounts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');
                                unreadCounts[convId] = (Number(unreadCounts[convId]) || 0) + 1;
                                localStorage.setItem('adminUnreadCounts', JSON.stringify(unreadCounts));
                                setUnreadMessageCount(Object.values(unreadCounts).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0) as number);
                                window.dispatchEvent(new Event("adminUnreadUpdated"));
                                if (!window.location.pathname.includes('/admin/messages')) showSuccessToast('Có tin nhắn mới từ khách hàng!', 3000);
                            }
                        });
                    }
                });
                stompClient.activate();
            } catch (error) {
                console.log("Lỗi khởi tạo listener chat:", error);
            }
        };

        initGlobalAdminChatListener();

        const handleReadUpdate = () => {
            const counts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');
            setUnreadMessageCount(Object.values(counts).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0) as number);
        };
        window.addEventListener("adminUnreadUpdated", handleReadUpdate);
        window.addEventListener("adminNewMessage", handleReadUpdate);

        return () => {
            isMounted = false;
            window.removeEventListener("adminUnreadUpdated", handleReadUpdate);
            window.removeEventListener("adminNewMessage", handleReadUpdate);
            if (stompClient) stompClient.deactivate();
        };
    }, [user?.id]);

    const handleMarkAllAsRead = () => {
        const unreadCounts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');
        const readTimes = JSON.parse(localStorage.getItem('adminReadTimes') || '{}');
        
        Object.keys(unreadCounts).forEach(convId => {
            unreadCounts[convId] = 0;
            readTimes[convId] = new Date().toISOString(); 
        });
        
        localStorage.setItem('adminUnreadCounts', JSON.stringify(unreadCounts));
        localStorage.setItem('adminReadTimes', JSON.stringify(readTimes));
        
        window.dispatchEvent(new Event("adminUnreadUpdated"));
    };

    const unreadCounts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');

    return (
        <div className="relative" ref={msgDropdownRef}>
            <button onClick={() => setIsMsgOpen(!isMsgOpen)} className={`relative w-10 h-10 flex items-center justify-center text-white rounded-full transition-all outline-none ${isMsgOpen ? 'bg-white/20' : 'hover:text-green-200 hover:bg-white/10'}`}>
                {unreadMessageCount > 0 && !isMsgOpen && (<><span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave"></span><span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span><span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span></>)}
                <span className={`material-symbols-outlined relative z-10 ${unreadMessageCount > 0 && !isMsgOpen ? 'animate-ring' : ''}`}>chat</span>
                {unreadMessageCount > 0 && (<span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full shadow-sm pointer-events-none z-20">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>)}
            </button>

            {isMsgOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-visible z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="absolute -top-2 right-[12px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>
                    <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-[16px]">Tin nhắn khách hàng</h3>
                            <div className="flex items-center gap-2">
                                {unreadMessageCount > 0 && <span className="text-xs text-primary font-bold bg-emerald-50 px-2 py-1 rounded-full">{unreadMessageCount} tin mới</span>}
                                {unreadMessageCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary font-medium hover:opacity-80 transition-opacity flex items-center gap-1" title="Đánh dấu tất cả là đã đọc">
                                        <span className="material-symbols-outlined text-[16px]">done_all</span> Đọc tất cả
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
                            {recentChats.length > 0 ? recentChats.map(chat => {
                                const isUnread = unreadCounts[chat.id] > 0;
                                return (
                                    <Link key={chat.id} to="/admin/messages" onClick={() => setIsMsgOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative group border-b border-gray-50 last:border-0 ${isUnread ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50'}`}>
                                        <div className="w-11 h-11 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200 shadow-sm">
                                            {chat.avatar ? <img src={chat.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="font-bold">{chat.name.charAt(0).toUpperCase()}</span>}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className={`font-bold text-[14px] truncate ${isUnread ? 'text-gray-900 font-black' : 'text-gray-800'}`}>{chat.name}</h4>
                                                {chat.lastMessageTime && <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{chat.lastMessageTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                            <p className={`text-xs truncate transition-colors ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-500 group-hover:text-primary'}`}>{chat.lastMessageText}</p>
                                        </div>
                                        {isUnread && <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 shadow-sm"></div>}
                                    </Link>
                                );
                            }) : <div className="p-6 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào</div>}
                        </div>
                        <Link to="/admin/messages" onClick={() => setIsMsgOpen(false)} className="block p-3 text-center text-[14px] text-primary font-bold hover:bg-emerald-50 transition-colors border-t border-gray-50 bg-gray-50/30">Mở tất cả trong Messenger</Link>
                    </div>
                </div>
            )}
        </div>
    );
}