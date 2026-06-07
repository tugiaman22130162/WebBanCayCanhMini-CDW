import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { showSuccessToast } from "../../utils/ToastUtils";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isStickerUrl } from '../../utils/chatUtils';


const AdminHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // State quản lý thông báo
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const prevNotifCountRef = useRef<number>(-1);

    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";
     const [isMsgOpen, setIsMsgOpen] = useState(false);
    const msgDropdownRef = useRef<HTMLDivElement>(null);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const processedMsgIds = useRef<Set<number>>(new Set());
    const userRolesMapRef = useRef<Record<string, string>>({});

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            // Lấy tất cả thông báo
            const res = await axios.get("http://localhost:8080/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newNotifs = res.data;
            setNotifications(newNotifs);

            // Kiểm tra số lượng thông báo chưa đọc mới
            const currentUnreadCount = newNotifs.filter((n: any) => !n.isRead).length;

            // Nếu số lượng chưa đọc tăng lên, kích hoạt thông báo Toast
            if (prevNotifCountRef.current !== -1 && currentUnreadCount > prevNotifCountRef.current) {
                const latestNotif = newNotifs.find((n: any) => !n.isRead);
                if (latestNotif) {
                    showSuccessToast(`Thông báo mới: ${latestNotif.message}`, 5000);
                }
            }
            prevNotifCountRef.current = currentUnreadCount;
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
             if (msgDropdownRef.current && !msgDropdownRef.current.contains(event.target as Node)) {
                setIsMsgOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hàm lấy tên trang hiện tại dựa trên đường dẫn
    const getPageName = () => {
        if (location.pathname.includes("/users")) return "Quản lý người dùng";
        if (location.pathname.includes("/products")) return "Quản lý sản phẩm";
        if (location.pathname.includes("/categories")) return "Quản lý danh mục";
        if (location.pathname.includes("/orders")) return "Quản lý đơn hàng";
        if (location.pathname.includes("/promotions")) return "Quản lý khuyến mãi";
        if (location.pathname.includes("/payments")) return "Quản lý thanh toán";
        if (location.pathname.includes("/profile")) return "Hồ sơ cá nhân";
        if (location.pathname.includes("/reviews")) return "Quản lý đánh giá";
        if (location.pathname.includes("/blogs")) return "Quản lý bài viết";
        if (location.pathname.includes("/terrariums")) return "Quản lý Terrarium";
        if (location.pathname.includes("/messages")) return "Tin nhắn hỗ trợ";
        return "Tổng quan";
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
    };

    const handleReadNotification = async (notif: any) => {
        try {
            if (!notif.isRead) {
                const token = localStorage.getItem("token");
                await axios.put(`http://localhost:8080/api/notifications/${notif.id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            }
            navigate(notif.link);
            setIsNotifOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Hiệu ứng chuyển trạng thái lần lượt
            const unreadNotifs = notifications.filter(n => !n.isRead);
            unreadNotifs.forEach((notif, index) => {
                setTimeout(() => {
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                }, index * 100); // Mỗi thông báo chuyển trạng thái cách nhau 100ms
            });
        } catch (error) {
            console.error(error);
        }
    };

    const getRelativeTime = (dateString: string) => {
        const past = new Date(dateString);
        const diffMs = Date.now() - past.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return "Vừa xong";
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHour < 24) return `${diffHour} giờ trước`;
        if (diffDay < 7) return `${diffDay} ngày trước`;
        return past.toLocaleDateString('vi-VN');
    };

    const getIconByType = (type: string) => {
        switch (type) {
            case 'ORDER': return { icon: 'local_shipping', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'PAYMENT': return { icon: 'payments', color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'REVIEW': return { icon: 'star', color: 'text-yellow-600', bg: 'bg-yellow-50' };
            default: return { icon: 'notifications', color: 'text-gray-600', bg: 'bg-gray-100' };
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return; 

        let stompClient: Client | null = null;
        let isMounted = true;

        const initGlobalAdminChatListener = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const usersRes = await axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${token}` } });
                const res = await axios.get("http://localhost:8080/api/conversations", { headers: { Authorization: `Bearer ${token}` } });
                
                const rolesMap: Record<string, string> = {};
                usersRes.data.forEach((u: any) => {
                    rolesMap[u.id] = u.role;
                });
                userRolesMapRef.current = rolesMap;

                const formatted = res.data.map((c: any) => {
                    const customer = usersRes.data.find((u: any) => u.id === c.customerId);
                    
                    let text = c.lastMessage?.content || 'Chưa có tin nhắn';
                    if (c.lastMessage?.type === 'IMAGE') text = '[Hình ảnh]';
                    else if (c.lastMessage?.type === 'STICKER' || isStickerUrl(text)) text = '[Nhãn dán]';
                    else if (c.lastMessage?.type === 'ORDER') text = '[Đơn hàng]';
                    
                    const actualSenderId = c.lastMessage?.senderId || c.lastMessage?.sender_id;
                    const senderRole = rolesMap[actualSenderId] || (String(actualSenderId) === String(user.id) ? 'ADMIN' : 'USER');
                    if (c.lastMessage && senderRole === 'ADMIN') {
                        text = "Bạn: " + text;
                    }

                    return {
                        id: c.id,
                        name: customer ? customer.fullName : (c.user?.fullName || c.userName || 'Khách hàng'),
                        avatar: customer ? customer.avatar : c.user?.avatar,
                        lastMessageText: text,
                        lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : null,
                        senderId: actualSenderId
                    };
                }).sort((a: any, b: any) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0));
                
                setRecentChats(formatted.slice(0, 5));

                const readTimes = JSON.parse(localStorage.getItem('adminReadTimes') || '{}');
                const unreadCountsToSave: any = {};
                let totalUnread = 0;
                
                const unreadConvs = formatted.filter((c: any) => {
                    const sRole = rolesMap[c.senderId] || (String(c.senderId) === String(user.id) ? 'ADMIN' : 'USER');
                    if (!c.lastMessageTime || sRole === 'ADMIN') return false;
                    const rTime = readTimes[c.id] ? new Date(readTimes[c.id]).getTime() : 0;
                    return c.lastMessageTime.getTime() > rTime;
                });

                for (const c of formatted) {
                    if (unreadConvs.find((uc: any) => uc.id === c.id)) {
                        try {
                            const msgRes = await axios.get(`http://localhost:8080/api/messages/conversation/${c.id}`, { headers: { Authorization: `Bearer ${token}` } });
                            const rTime = readTimes[c.id] ? new Date(readTimes[c.id]).getTime() : 0;
                            const unreadMsgs = msgRes.data.filter((m: any) => {
                                const actualSender = m.senderId || m.sender_id;
                                const mRole = rolesMap[actualSender] || (String(actualSender) === String(user.id) ? 'ADMIN' : 'USER');
                                return new Date(m.createdAt || m.created_at).getTime() > rTime && mRole !== 'ADMIN';
                            });
                            unreadCountsToSave[c.id] = unreadMsgs.length;
                            totalUnread += unreadMsgs.length;
                        } catch (e) {
                            unreadCountsToSave[c.id] = 1;
                            totalUnread += 1;
                        }
                    } else {
                        unreadCountsToSave[c.id] = 0;
                    }
                }

                if (!isMounted) return;

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
                            
                            if (isFromAdmin) {
                                newText = "Bạn: " + newText;
                            }

                            setRecentChats(prev => {
                                const exists = prev.find(c => c.id === convId);
                                let updated;
                                if (exists) {
                                    updated = prev.map(c => c.id === convId ? { ...c, lastMessageText: newText, lastMessageTime: new Date(msg.createdAt || msg.created_at), senderId: actualMsgSenderId } : c);
                                } else {
                                    const newChat = {
                                        id: convId, name: msg.senderName || msg.sender_name || 'Khách hàng', avatar: msg.senderAvatar || msg.sender_avatar,
                                        lastMessageText: newText, lastMessageTime: new Date(msg.createdAt || msg.created_at),
                                        senderId: actualMsgSenderId
                                    };
                                    updated = [newChat, ...prev];
                                }
                                return updated.sort((a: any, b: any) => (b.lastMessageTime?.getTime() || 0) - (a.lastMessageTime?.getTime() || 0)).slice(0, 5);
                            });

                            if (!isFromAdmin) {
                                const unreadCounts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');
                                unreadCounts[convId] = (Number(unreadCounts[convId]) || 0) + 1;
                                localStorage.setItem('adminUnreadCounts', JSON.stringify(unreadCounts));
                                
                                const newTotal = Object.values(unreadCounts).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0) as number;
                                setUnreadMessageCount(newTotal);
                                window.dispatchEvent(new Event("adminUnreadUpdated"));

                                if (!window.location.pathname.includes('/admin/messages')) {
                                    showSuccessToast('Có tin nhắn mới từ khách hàng!', 3000);
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
            } catch (error) {
                console.log("Lỗi khởi tạo listener chat:", error);
            }
        };

        initGlobalAdminChatListener();

        const handleReadUpdate = () => {
            const counts = JSON.parse(localStorage.getItem('adminUnreadCounts') || '{}');
            const total = Object.values(counts).reduce((sum: any, val: any) => sum + (Number(val) || 0), 0) as number;
            setUnreadMessageCount(total);
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


    return (
        <>
            <style>
                {`
                    @keyframes ring {
                        0% { transform: rotate(0); }
                        10% { transform: rotate(10deg); }
                        20% { transform: rotate(-10deg); }
                        30% { transform: rotate(6deg); }
                        40% { transform: rotate(-6deg); }
                        50% { transform: rotate(2deg); }
                        60% { transform: rotate(-2deg); }
                        70%, 100% { transform: rotate(0); }
                    }
                    .animate-ring {
                        animation: ring 2s ease-in-out infinite;
                        transform-origin: top center;
                    }
                    @keyframes red-wave {
                        0% { transform: scale(1); opacity: 0.6; }
                        100% { transform: scale(2.5); opacity: 0; }
                    }
                    .animate-red-wave {
                        animation: red-wave 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                `}
            </style>
        <header className="bg-header-footer h-16 flex items-center justify-between px-6 sticky top-0 z-40 text-white shadow-md">
            <div className="flex items-center text-sm font-medium text-white/70">
                <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                    Trang chủ
                </Link>
                <span className="material-symbols-outlined text-[18px] mx-1">chevron_right</span>
                <span className="text-white font-bold">{getPageName()}</span>
            </div>

            <div className="flex items-center gap-4">

                {/* Search Bar */}
                <div className="relative w-[250px] lg:w-[300px] hidden md:block mr-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm ..."
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchParams(prev => {
                                if (value) prev.set("search", value);
                                else prev.delete("search");
                                return prev;
                            }, { replace: true });
                        }}
                        className="w-full bg-white/10 text-white placeholder-white/60 text-sm rounded-full py-2 pl-5 pr-10 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-xl">
                        search
                    </span>
                </div>
                {/* NÚT TIN NHẮN */}
                <div className="relative" ref={msgDropdownRef}>
                    <button
                        onClick={() => setIsMsgOpen(!isMsgOpen)}
                        className={`relative w-10 h-10 flex items-center justify-center text-white rounded-full transition-all outline-none ${isMsgOpen ? 'bg-white/20' : 'hover:text-green-200 hover:bg-white/10'}`}
                    >
                        {/* Hiệu ứng sóng lan tỏa giống thông báo */}
                        {unreadMessageCount > 0 && !isMsgOpen && (
                            <>
                                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave"></span>
                                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span>
                                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span>
                            </>
                        )}
                        <span className={`material-symbols-outlined relative z-10 ${unreadMessageCount > 0 && !isMsgOpen ? 'animate-ring' : ''}`}>chat</span>
                        {unreadMessageCount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full shadow-sm pointer-events-none z-20">
                                {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                            </span>
                        )}
                    </button>

                    {isMsgOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-visible z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="absolute -top-2 right-[12px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>
                            <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800 text-[16px]">Tin nhắn khách hàng</h3>
                                    {unreadMessageCount > 0 && <span className="text-xs text-primary font-bold bg-emerald-50 px-2 py-1 rounded-full">{unreadMessageCount} tin mới</span>}
                                </div>
                                
                                <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
                                    {recentChats.length > 0 ? recentChats.map((chat, idx) => (
                                        <Link 
                                            key={chat.id}
                                            to="/admin/messages" 
                                            onClick={() => setIsMsgOpen(false)}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors relative group border-b border-gray-50 last:border-0 hover:bg-gray-50`}
                                        >
                                            <div className="w-11 h-11 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200 shadow-sm">
                                                {chat.avatar ? (
                                                    <img src={chat.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold">{chat.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h4 className="font-bold text-gray-800 text-[14px] truncate">{chat.name}</h4>
                                                    {chat.lastMessageTime && <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{chat.lastMessageTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 truncate group-hover:text-primary transition-colors">
                                                    {chat.lastMessageText}
                                                </p>
                                            </div>
                                        </Link>
                                    )) : (
                                        <div className="p-6 text-center text-gray-500 text-sm">Chưa có cuộc trò chuyện nào</div>
                                    )}
                                </div>
                                
                                <Link 
                                    to="/admin/messages" 
                                    onClick={() => setIsMsgOpen(false)}
                                    className="block p-3 text-center text-[14px] text-primary font-bold hover:bg-emerald-50 transition-colors border-t border-gray-50 bg-gray-50/30"
                                >
                                    Vào trung tâm tin nhắn
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* NÚT VÀ DROPDOWN THÔNG BÁO */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className={`relative w-10 h-10 flex items-center justify-center text-white rounded-full transition-all outline-none ${isNotifOpen ? 'bg-white/20' : 'hover:text-green-200 hover:bg-white/10'}`}
                    >
                        {/* Hiệu ứng sóng âm lan tỏa */}
                        {unreadCount > 0 && !isNotifOpen && (
                            <>
                                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-red-wave"></span>
                                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span>
                                <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span>
                            </>
                        )}
                        
                        <span className={`material-symbols-outlined relative z-10 ${unreadCount > 0 && !isNotifOpen ? 'animate-ring' : ''}`}>
                            {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                        </span>
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm z-20"></span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 lg:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible animate-in fade-in zoom-in-95 text-gray-800">
                            <div className="absolute -top-2 right-[12px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>

                            <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                                <div className="p-4 border-b border-gray-50 font-bold text-gray-800 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    Thông báo
                                    {unreadCount > 0 && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} chưa đọc</span>}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary font-medium hover:underline flex items-center gap-1" title="Đánh dấu tất cả là đã đọc">
                                        <span className="material-symbols-outlined text-[16px]">done_all</span> Đánh dấu là đã đọc
                                    </button>
                                )}
                                </div>
                                <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => {
                                            const typeInfo = getIconByType(notif.type);
                                            return (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleReadNotification(notif)}
                                                    className={`p-4 border-b border-gray-50 cursor-pointer transition-all duration-500 flex items-start gap-3 ${!notif.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full ${typeInfo.bg} ${typeInfo.color} flex items-center justify-center shrink-0 transition-opacity duration-500 ${!notif.isRead ? 'opacity-100' : 'opacity-70'}`}>
                                                        <span className="material-symbols-outlined text-[20px]">{typeInfo.icon}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-sm mb-1 transition-colors duration-500 ${!notif.isRead ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>{notif.message}</p>
                                                        <span className={`text-xs transition-colors duration-500 ${!notif.isRead ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                                                        {getRelativeTime(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 transition-all duration-500 ${!notif.isRead ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-gray-200">notifications_paused</span>
                                            Không có thông báo nào
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all text-white outline-none ${isProfileOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        {user?.avatar ? (
                            <img 
                                src={user.avatar} 
                                alt={user.fullName} 
                                className="w-8 h-8 rounded-full object-cover border border-white/50"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                                <span className="font-bold text-[14px]">{getInitials(user?.fullName || "Admin")}</span>
                            </div>
                        )}
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-bold leading-none">{user?.fullName || "Admin"}</span>
                        </div>
                        <span className={`material-symbols-outlined text-white/80 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Menu xổ xuống */}
                    {isProfileOpen && (
                        <div className="absolute right-[-5px] mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible animate-in fade-in slide-in-from-top-2 text-gray-800">
                            {/* Mũi tên chỉa lên */}
                            <div className="absolute -top-2 right-[15px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>
                            
                            {/* Wrapper có overflow-hidden để bo góc cho nội dung */}
                            <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                                <div className="p-5 border-b border-gray-50 flex flex-col items-center justify-center gap-3 bg-gray-50/50 text-center">
                                    {user?.avatar ? (
                                        <img 
                                            src={user.avatar} 
                                            alt={user.fullName} 
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                                            <span className="font-bold text-[20px]">{getInitials(user?.fullName || "Admin")}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-bold text-gray-800">{user?.fullName || "Quản trị viên"}</span>
                                        <span className="text-xs text-gray-500 truncate w-48">{user?.email || "admin@minigarden.com"}</span>
                                    </div>
                                </div>
                                <div className="p-2 flex flex-col gap-1">
                                    <Link to="/admin/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#006c49] hover:bg-[#E8F1EE] rounded-xl transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">person</span> Hồ sơ cá nhân
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
        </>
    );
};

export default AdminHeader;