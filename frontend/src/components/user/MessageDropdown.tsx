import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { showSuccessToast } from "../../utils/ToastUtils";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isStickerUrl } from '../../utils/chatUtils';

export default function MessageDropdown() {
    const { isLoggedIn } = useAuth();
    const [isMsgOpen, setIsMsgOpen] = useState(false);
    const msgRef = useRef<HTMLDivElement>(null);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    // Đóng dropdown khi click ra ngoài vùng msg
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
                setIsMsgOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let stompClient: Client | null = null;
        let isMounted = true;
        
        const initGlobalChatListener = async () => {
            if (!isLoggedIn) {
                setUnreadMessageCount(0);
                return;
            }
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                let convId;
                try {
                    const convRes = await axios.get("http://localhost:8080/api/conversations/my-conversation", {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    convId = convRes.data.id;
                } catch (error: any) {
                    if (error.response?.status === 404) {
                        // Không có hội thoại thì không cần kết nối websocket để nhận tin nhắn
                        setUnreadMessageCount(0);
                        return;
                    } else {
                        throw error;
                    }
                }

                const readTimes = JSON.parse(localStorage.getItem("userReadTimes") || "{}");
                const readTimeStr = readTimes[convId];
                const readTimeMs = readTimeStr ? new Date(readTimeStr).getTime() : Date.now();

                const msgRes = await axios.get(`http://localhost:8080/api/messages/conversation/${convId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const currentUserStr = localStorage.getItem("user");
                const currentUserId = currentUserStr ? JSON.parse(currentUserStr).id : null;

                if (!isMounted) return;

                const allAdminMsgs = msgRes.data.filter((m: any) => String(m.senderId) !== String(currentUserId));
                
                allAdminMsgs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                const formattedRecent = allAdminMsgs.slice(0, 10).map((m: any) => {
                    let text = m.content || m.text;
                    if (m.type === 'IMAGE') text = '[Hình ảnh]';
                    else if (m.type === 'STICKER' || isStickerUrl(text)) text = '[Nhãn dán]';
                    else if (m.type === 'ORDER') text = '[Đơn hàng]';
                    else if (m.type === 'LOCATION' || (typeof text === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(text.trim()))) text = '[Vị trí]';
                    
                    return {
                        id: m.id,
                        text: text,
                        time: new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                        senderAvatar: m.senderAvatar
                    };
                });
                setRecentMessages(formattedRecent);

                const unreadMsgs = allAdminMsgs.filter((m: any) => new Date(m.createdAt).getTime() > readTimeMs);
                setUnreadMessageCount(unreadMsgs.length);

                const socket = new SockJS('http://localhost:8080/ws');
                stompClient = new Client({
                    webSocketFactory: () => socket,
                    connectHeaders: { Authorization: `Bearer ${token}` },
                    onConnect: () => {
                        stompClient!.subscribe(`/topic/conversation/${convId}`, (message) => {
                            const msg = JSON.parse(message.body);
                            const activeUserStr = localStorage.getItem("user");
                            const activeUserId = activeUserStr ? JSON.parse(activeUserStr).id : null;
                            
                            if (String(msg.senderId) !== String(activeUserId)) {
                                let newText = msg.content || msg.text;
                                if (msg.type === 'IMAGE') newText = '[Hình ảnh]';
                                else if (msg.type === 'STICKER' || isStickerUrl(newText)) newText = '[Nhãn dán]';
                                else if (msg.type === 'ORDER') newText = '[Đơn hàng]';
                                else if (msg.type === 'LOCATION' || (typeof newText === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(newText.trim()))) newText = '[Vị trí]';
                                
                                const newMsgItem = {
                                    id: msg.id,
                                    text: newText,
                                    time: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                                    senderAvatar: msg.senderAvatar
                                };

                                setRecentMessages(prev => {
                                    if (prev.some(m => m.id === newMsgItem.id)) return prev;
                                    return [newMsgItem, ...prev].slice(0, 10);
                                });

                                const isChatPage = window.location.pathname.includes('/message');
                                if (!isChatPage) {
                                    setUnreadMessageCount(prev => prev + 1);
                                    showSuccessToast('Có tin nhắn mới từ MiniGarden!', 3000);
                                    try {
                                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                                        audio.play().catch(() => {});
                                    } catch(e) {}
                                }
                            }
                        });
                    }
                });
                stompClient.activate();

            } catch (error: any) {
                console.log("Không thể khởi tạo listener chat:", error);
            }
        };

        initGlobalChatListener();

        const handleReadUpdate = () => {
            setUnreadMessageCount(0);
        };
        window.addEventListener("userUnreadUpdated", handleReadUpdate);

        return () => {
            isMounted = false;
            window.removeEventListener("userUnreadUpdated", handleReadUpdate);
            if (stompClient) stompClient.deactivate();
        };
    }, [isLoggedIn]);

    const handleMarkAllAsRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const convRes = await axios.get("http://localhost:8080/api/conversations/my-conversation", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const convId = convRes.data.id;
            
            const readTimes = JSON.parse(localStorage.getItem("userReadTimes") || "{}");
            readTimes[convId] = new Date().toISOString();
            localStorage.setItem("userReadTimes", JSON.stringify(readTimes));
            
            const unreadCounts = JSON.parse(localStorage.getItem("userUnreadCounts") || "{}");
            unreadCounts[convId] = 0;
            localStorage.setItem("userUnreadCounts", JSON.stringify(unreadCounts));
            
            window.dispatchEvent(new Event("userUnreadUpdated"));
        } catch (e) {
            console.error("Lỗi đánh dấu đã đọc:", e);
        }
    };

    return (
        <div ref={msgRef} className="relative flex items-center justify-center">
            <button
                onClick={() => setIsMsgOpen(!isMsgOpen)}
                className={`relative flex items-center justify-center text-white transition-all active:scale-95 ${isMsgOpen ? 'text-emerald-300' : 'hover:text-emerald-300'}`}
            >
                {unreadMessageCount > 0 && !isMsgOpen && (
                    <>
                        <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave"></span>
                        <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span>
                        <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span>
                    </>
                )}
                <span className={`material-symbols-outlined relative z-10 ${unreadMessageCount > 0 && !isMsgOpen ? 'animate-ring inline-block' : ''}`}>chat</span>
                {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full shadow-sm pointer-events-none z-20">
                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                )}
            </button>

            {isMsgOpen && (
                <div className="absolute top-full right-[-60px] sm:right-[-20px] md:right-[-10px] mt-4 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-visible z-50 animate-in fade-in zoom-in-95 text-gray-800">
                    <div className="absolute -top-2 right-[66px] sm:right-[26px] md:right-[16px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>

                    <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 text-[16px]">Tin nhắn</h3>
                            <div className="flex items-center gap-2">
                                {unreadMessageCount > 0 && <span className="text-xs text-primary font-bold bg-emerald-50 px-2 py-1 rounded-full">{unreadMessageCount} tin nhắn mới</span>}
                                {unreadMessageCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary font-medium hover:opacity-80 transition-opacity flex items-center gap-1" title="Đánh dấu tất cả là đã đọc">
                                        <span className="material-symbols-outlined text-[16px]">done_all</span> Đọc tất cả
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
                            {recentMessages.length > 0 ? recentMessages.map((msg, idx) => (
                                <Link 
                                    key={msg.id}
                                    to="/message" 
                                    onClick={() => setIsMsgOpen(false)}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative group border-b border-gray-50 last:border-0 ${idx < unreadMessageCount ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200 shadow-sm">
                                        <img src={msg.senderAvatar || "/logo.png"} alt="Admin" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className={`font-bold text-[14px] truncate ${idx < unreadMessageCount ? 'text-gray-900' : 'text-gray-700'}`}>Quản trị viên - MiniGarden</h4>
                                            <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{msg.time}</span>
                                        </div>
                                        <p className={`text-sm truncate transition-colors ${idx < unreadMessageCount ? 'text-gray-900 font-semibold' : 'text-gray-500 group-hover:text-primary'}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                    {idx < unreadMessageCount && <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 shadow-sm"></div>}
                                </Link>
                            )) : (
                                <div className="p-6 text-center text-gray-500 text-sm">Chưa có tin nhắn nào</div>
                            )}
                        </div>
                        
                        <Link 
                            to="/message" 
                            onClick={() => setIsMsgOpen(false)}
                            className="block p-3 text-center text-[14px] text-primary font-bold hover:bg-emerald-50 transition-colors border-t border-gray-50 bg-gray-50/30"
                        >
                            Mở tất cả trong Messenger
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}