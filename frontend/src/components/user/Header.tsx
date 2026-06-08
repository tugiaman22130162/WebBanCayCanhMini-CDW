import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../data/useFavorites";
import axios from "axios";
import { showSuccessToast } from "../../utils/ToastUtils";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { isStickerUrl } from '../../utils/chatUtils';

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const animationTimer = useRef<any>(null);
    const { isLoggedIn, user, logout } = useAuth();
    const { favorites } = useFavorites();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [hasMoreResults, setHasMoreResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [cartCount, setCartCount] = useState(0);

    // State quản lý thông báo
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const prevNotifCountRef = useRef<number>(-1);
    const [isMsgOpen, setIsMsgOpen] = useState(false);
    const msgRef = useRef<HTMLDivElement>(null);
    const [recentMessages, setRecentMessages] = useState<any[]>([]);
    const processedMsgIds = useRef<Set<number>>(new Set());

    // Đóng dropdown khi click ra ngoài vùng profile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (msgRef.current && !msgRef.current.contains(event.target as Node)) {
                setIsMsgOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Đóng dropdown tìm kiếm khi click ra ngoài vùng tìm kiếm
    useEffect(() => {
        const handleClickOutsideSearch = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
    }, []);

    // Kích hoạt hiệu ứng đập ngay lập tức khi nhận được sự kiện thêm sản phẩm yêu thích
    useEffect(() => {
        const handleFavoriteToggle = (e: Event) => {
            const { isAdd } = (e as CustomEvent).detail;
            if (isAdd) {
                setIsAnimating(true);
                if (animationTimer.current) clearTimeout(animationTimer.current);
                animationTimer.current = setTimeout(() => setIsAnimating(false), 1000);
            }
        };
        window.addEventListener('localFavoriteToggle', handleFavoriteToggle);
        return () => window.removeEventListener('localFavoriteToggle', handleFavoriteToggle);
    }, []);

    // Gọi API để lấy kết quả tìm kiếm gợi ý (Debounce 300ms)
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setHasMoreResults(false);
                return;
            }
            setIsSearching(true);
            try {
                const response = await axios.get("http://localhost:8080/api/products");
                const filtered = response.data.filter((p: any) =>
                    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
                    !p.name.startsWith("Terrarium Thiết Kế #")
                );
                setSearchResults(filtered.slice(0, 5)); // Chỉ hiển thị tối đa 5 kết quả gợi ý
                setHasMoreResults(filtered.length > 5);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Hàm lấy số lượng giỏ hàng
    const fetchCartCount = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCartCount(0);
            return;
        }
        try {
            let userId;
            const userStr = localStorage.getItem("user");
            if (userStr) {
                userId = JSON.parse(userStr).id;
            }
            if (!userId) {
                const userRes = await axios.get("http://localhost:8080/api/users/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                userId = userRes.data.id;
                localStorage.setItem("user", JSON.stringify(userRes.data));
            }
            const res = await axios.get(`http://localhost:8080/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const count = res.data.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
            setCartCount(count);
        } catch (e) {
            console.error("Lỗi lấy số lượng giỏ hàng", e);
        }
    };

    useEffect(() => {
        fetchCartCount();
        window.addEventListener("cartUpdated", fetchCartCount);
        return () => window.removeEventListener("cartUpdated", fetchCartCount);
    }, []);

    // logout
    const handleLogout = () => {
        setIsProfileOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        logout(); // Gọi hàm logout từ Context
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
    };

    // Xử lý khi ấn Enter ở ô tìm kiếm
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            if (searchQuery.trim()) {
                navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                setShowSearchResults(false);
            } else {
                navigate(`/products`);
            }
        }
    };

    // Hàm bôi đậm từ khóa tìm kiếm trong kết quả gợi ý
    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;
        // Escape các ký tự đặc biệt trong query để tránh lỗi Regex
        const escapeRegex = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapeRegex})`, 'gi');
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="text-primary bg-emerald-50 px-0.5 rounded">{part}</span> : part
        );
    };

    const fetchNotifications = async () => {
        if (!isLoggedIn) return;
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.get("http://localhost:8080/api/notifications/my-notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newNotifs = res.data;

            setNotifications(newNotifs);

            const currentUnreadCount = newNotifs.filter((n: any) => !n.isRead).length;

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
        if (isLoggedIn) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            prevNotifCountRef.current = -1;
        }
    }, [isLoggedIn]);

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
            await axios.put(`http://localhost:8080/api/notifications/user/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const unreadNotifs = notifications.filter(n => !n.isRead);
            unreadNotifs.forEach((notif, index) => {
                setTimeout(() => {
                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                }, index * 100);
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
                const convRes = await axios.get("http://localhost:8080/api/conversations/my-conversation", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const convId = convRes.data.id;

                const readTimes = JSON.parse(localStorage.getItem("userReadTimes") || "{}");
                const readTimeStr = readTimes[convId];
                const readTimeMs = readTimeStr ? new Date(readTimeStr).getTime() : 0;

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
                    
                    return {
                        id: m.id,
                        text: text,
                        time: new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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
                                
                                const newMsgItem = {
                                    id: msg.id,
                                    text: newText,
                                    time: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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
                if (error.response?.status !== 404) {
                    console.log("Không thể khởi tạo listener chat:", error);
                }
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

    const handleMessageIconClick = () => {
    };

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
            <header className="fixed top-0 w-full z-50 bg-header-footer backdrop-blur-md">
                <nav className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto font-['Plus_Jakarta_Sans'] tracking-tight">

                    {/* Logo */}
                    <Link
                        to="/"
                        className="text-2xl font-bold bg-gradient-to-r from-green-300 to-lime-200 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition"
                    >
                        MiniGarden
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-6">
                        {/* Search Bar */}
                        <div className="relative w-[300px] hidden md:block" ref={searchRef}>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => {
                                    if (searchQuery.trim()) setShowSearchResults(true);
                                }}
                                onKeyDown={handleSearch}
                                className="w-full bg-white/10 text-white placeholder-white/60 text-sm rounded-full py-2.5 pl-5 pr-10 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                            />
                            <button
                                onClick={() => {
                                    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                    else navigate(`/products`);
                                    setShowSearchResults(false);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">search</span>
                            </button>

                            {/* Dropdown hiển thị kết quả tìm kiếm */}
                            {showSearchResults && searchQuery.trim() !== "" && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                                            Đang tìm kiếm...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="max-h-[350px] overflow-y-auto">
                                            {searchResults.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    to={`/products/${product.id}`}
                                                    onClick={() => {
                                                        setShowSearchResults(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                >
                                                    <img
                                                        src={(product.images && product.images.length > 0) ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].image_url || product.images[0].imageUrl) : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                                    />
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{highlightMatch(product.name, searchQuery)}</p>
                                                        <p className="text-sm text-emerald-600 font-bold mt-0.5">
                                                            {product.price ? product.price.toLocaleString("vi-VN") + "đ" : "0đ"}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                            {hasMoreResults && (
                                                <button
                                                    onClick={() => {
                                                        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                                        setShowSearchResults(false);
                                                    }}
                                                    className="w-full p-3 text-sm text-center font-bold text-primary hover:bg-emerald-50 transition-colors bg-gray-50"
                                                >
                                                    Xem thêm các kết quả khác
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            Không tìm thấy sản phẩm "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Icons */}
                        <div className="flex items-center space-x-6">
                            {/* NÚT VÀ DROPDOWN TIN NHẮN */}
                            <div ref={msgRef} className="relative flex items-center justify-center">
                                <button
                                    onClick={() => setIsMsgOpen(!isMsgOpen)}
                                    className={`relative flex items-center justify-center text-white transition-all active:scale-95 ${isMsgOpen ? 'text-emerald-300' : 'hover:text-emerald-300'}`}
                                >
                                    {/* Hiệu ứng sóng lan tỏa giống thông báo */}
                                    {unreadMessageCount > 0 && !isMsgOpen && (
                                        <>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave"></span>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span>
                                        </>
                                    )}
                                    <span className={`material-symbols-outlined relative z-10 ${unreadMessageCount > 0 && !isMsgOpen ? 'animate-ring inline-block' : ''}`}>chat</span>
                                    {/* Chấm đỏ thông báo có tin nhắn mới */}
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
                                                {unreadMessageCount > 0 && <span className="text-xs text-primary font-bold bg-emerald-50 px-2 py-1 rounded-full">{unreadMessageCount} tin nhắn mới</span>}
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
                                                            <img src="/images/chatbot.png" alt="Admin" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-baseline mb-1">
                                                                <h4 className={`font-bold text-[14px] truncate ${idx < unreadMessageCount ? 'text-gray-900' : 'text-gray-700'}`}>Quản trị viên</h4>
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

                            {/* NÚT VÀ DROPDOWN THÔNG BÁO */}
                            <div ref={notifRef} className="relative flex items-center justify-center">
                                <button
                                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                                    className={`relative material-symbols-outlined text-white transition-all active:scale-95 block ${isNotifOpen ? 'text-emerald-300' : 'hover:text-emerald-300'}`}
                                >
                                    {/* Hiệu ứng sóng âm lan tỏa */}
                                    {unreadCount > 0 && !isNotifOpen && (
                                        <>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave"></span>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-0.6s' }}></span>
                                            <span className="absolute inset-0 rounded-full border border-red-500 animate-red-wave" style={{ animationDelay: '-1.2s' }}></span>
                                        </>
                                    )}

                                    <span className={`relative z-10 ${unreadCount > 0 && !isNotifOpen ? 'animate-ring inline-block' : ''}`}>
                                        {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full z-20"></span>
                                    )}
                                </button>

                                {isNotifOpen && (
                                    <div className="absolute top-full right-[-80px] sm:right-[-20px] md:right-[-10px] mt-4 w-80 lg:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible animate-in fade-in zoom-in-95 text-gray-800 z-50">
                                        <div className="absolute -top-2 right-[86px] sm:right-[26px] md:right-[16px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>

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
                                                {!isLoggedIn ? (
                                                    <div className="p-8 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-4xl text-gray-200">lock</span>
                                                        Vui lòng đăng nhập để xem thông báo
                                                    </div>
                                                ) : notifications.length > 0 ? (
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

                            <Link to="/favorites" className="relative block group">
                                <span
                                    className={`material-symbols-outlined transition-all duration-300 block ${isAnimating
                                            ? 'scale-125 text-red-500 fill-current drop-shadow-md'
                                            : 'text-white group-hover:text-emerald-300 active:scale-95'
                                        }`}
                                    style={{ fontVariationSettings: favorites.length > 0 ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    favorite
                                </span>
                                {/* Lớp phủ nhịp đập (Ping) tỏa ra */}
                                {isAnimating && (
                                    <span className="absolute inset-0 material-symbols-outlined text-red-500 animate-ping opacity-75 pointer-events-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        favorite
                                    </span>
                                )}
                            </Link>

                            <div className="relative flex items-center justify-center transition-all duration-300" id="cart-icon">
                                <Link to="/cart" className="material-symbols-outlined text-white hover:text-red-500 transition-all active:scale-95 block">
                                    shopping_cart
                                </Link>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center px-1 rounded-full shadow-sm pointer-events-none">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                            {/* PROFILE DROPDOWN */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className={`block ${isLoggedIn ? 'w-9 h-9 border-transparent' : 'w-8 h-8 border-transparent'} rounded-full overflow-hidden border-2 hover:border-emerald-300 focus:border-emerald-300 transition-all active:scale-95 outline-none flex items-center justify-center`}
                                >
                                    {isLoggedIn && user?.avatar ? (
                                        <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                    ) : isLoggedIn && user ? (
                                        <div className="w-full h-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[14px]">
                                            {getInitials(user.fullName)}
                                        </div>
                                    ) : (
                                        <span className="material-symbols-outlined text-white text-[32px]">
                                            account_circle
                                        </span>
                                    )}
                                </button>

                                {/* Menu hiển thị khi isProfileOpen === true */}
                                {isProfileOpen && (
                                    <div className="absolute right-[-5px] mt-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible animate-in fade-in slide-in-from-top-2">
                                        {/* Mũi tên chỉa lên */}
                                        <div className="absolute -top-2 right-[15px] w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45 rounded-tl-sm"></div>

                                        {/* Wrapper có overflow-hidden để bo góc cho nội dung */}
                                        <div className="relative z-10 bg-white rounded-2xl overflow-hidden">
                                            {isLoggedIn ? (
                                                <>
                                                    <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                                        {user?.avatar ? (
                                                            <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                                                                {getInitials(user?.fullName || "") ? (
                                                                    <span className="font-bold text-[16px]">{getInitials(user?.fullName || "")}</span>
                                                                ) : (
                                                                    <span className="material-symbols-outlined">person</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800">{user?.fullName}</span>
                                                            <span className="text-xs text-gray-500 truncate w-40">{user?.email}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-2 flex flex-col gap-1">
                                                        {user?.role === "ADMIN" && (
                                                            <Link to="/admin/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">admin_panel_settings</span> Trang quản trị</Link>
                                                        )}
                                                        <Link to="/profile/info" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">person</span> Thông tin cá nhân</Link>
                                                        <Link to="/profile/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">shopping_bag</span> Đơn hàng của tôi</Link>
                                                        <Link to="/profile/history" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">history</span> Lịch sử đơn hàng</Link>
                                                        <Link to="/profile/reviews" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">rate_review</span> Đánh giá của tôi</Link>
                                                    </div>
                                                    <div className="p-2 border-t border-gray-50">
                                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">logout</span> Đăng xuất</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-6 flex flex-col items-center text-center gap-4">
                                                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-1">
                                                        <span className="material-symbols-outlined text-3xl">waving_hand</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium">Đăng nhập để theo dõi đơn hàng và lưu lại các sản phẩm yêu thích.</p>
                                                    <Link to="/login" onClick={() => setIsProfileOpen(false)} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#2f5146] transition-colors shadow-md">
                                                        Đăng nhập
                                                    </Link>
                                                    <div className="text-sm text-gray-500 font-medium mt-1">
                                                        Chưa có tài khoản? <Link to="/register" onClick={() => setIsProfileOpen(false)} className="text-primary font-bold hover:underline">Đăng ký</Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}