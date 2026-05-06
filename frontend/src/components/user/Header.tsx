import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState("Đang tải...");
    const [userName, setUserName] = useState("Đang tải...");
    const [userAvatar, setUserAvatar] = useState("");
    const [userRole, setUserRole] = useState("");
    const profileRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Kiểm tra trạng thái đăng nhập từ localStorage khi component mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);

            axios.get("http://localhost:8080/api/users/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const data = response.data;
                    const name = data.fullName || (data.email ? data.email.split('@')[0] : "Người dùng");
                    setUserName(name);
                    setUserEmail(data.email || "");
                    setUserAvatar(data.avatar || "");
                    setUserRole(data.role || "");
                })
                .catch(error => {
                    console.error("Token không hợp lệ hoặc đã hết hạn:", error);
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        handleLogout();
                    }
                });
        }
    }, []);

    // Đóng dropdown khi click ra ngoài vùng profile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setIsProfileOpen(false);
        navigate("/login");
    };

    //Lay du lieu nguoi dung tu DB de hien thi tren header
    const mockUser = {
        name: userName,
        email: userEmail,
        avatar: userAvatar || "" //chua co avatar thi hien thi icon mac dinh
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
    };

    return (
        <header className="fixed top-0 w-full z-50 bg-header-footer backdrop-blur-md">
            <nav className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto font-['Plus_Jakarta_Sans'] tracking-tight">

                {/* Logo */}
                <Link
                    to="/"
                    // className="text-2xl font-bold text-white tracking-tighter hover:opacity-80 transition"

                    className="text-2xl font-bold bg-gradient-to-r from-green-300 to-lime-200 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition"
                >
                    MiniGarden
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-6">
                    {/* Search Bar */}
                    <div className="relative w-[300px] hidden md:block">
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full bg-white/10 text-white placeholder-white/60 text-sm rounded-full py-2.5 pl-5 pr-10 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                        />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
                            search
                        </span>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-6">
                        <Link to="/favorites" className="material-symbols-outlined text-white hover:text-red-500 transition-all active:scale-95 block">
                            favorite
                        </Link>

                        <Link to="/cart" className="material-symbols-outlined text-white hover:text-red-500 transition-all active:scale-95 block">
                            shopping_cart
                        </Link>

                        {/* PROFILE DROPDOWN */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`block ${isLoggedIn ? 'w-9 h-9 border-transparent' : 'w-8 h-8 border-transparent'} rounded-full overflow-hidden border-2 hover:border-emerald-300 focus:border-emerald-300 transition-all active:scale-95 outline-none flex items-center justify-center`}
                            >
                                {isLoggedIn && mockUser.avatar ? (
                                    <img src={mockUser.avatar} alt={mockUser.name} className="w-full h-full object-cover" />
                                ) : isLoggedIn && getInitials(mockUser.name) ? (
                                    <div className="w-full h-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[14px]">
                                        {getInitials(mockUser.name)}
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
                                                    {mockUser.avatar ? (
                                                        <img src={mockUser.avatar} alt={mockUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                                                            {getInitials(mockUser.name) ? (
                                                                <span className="font-bold text-[16px]">{getInitials(mockUser.name)}</span>
                                                            ) : (
                                                                <span className="material-symbols-outlined">person</span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800">{mockUser.name}</span>
                                                        <span className="text-xs text-gray-500 truncate w-40">{mockUser.email}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2 flex flex-col gap-1">
                                                    {userRole === "ADMIN" && (
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
    );
}