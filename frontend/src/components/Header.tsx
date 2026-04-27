import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    
    // Đổi thành true/false để kiểm tra trạng thái Đăng nhập / Chưa đăng nhập
    // (Sau này bạn sẽ thay bằng Context hoặc Redux)
    const isLoggedIn = false; 

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

    // Dữ liệu người dùng mẫu
    const mockUser = {
        name: "Nguyễn Văn A",
        email: "hello@minigarden.com",
        avatar: "https://i.pravatar.cc/150?u=hello@minigarden.com"
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
                                {isLoggedIn ? (
                                    <img src={mockUser.avatar} alt={mockUser.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-white text-[32px]">
                                        account_circle
                                    </span>
                                )}
                            </button>

                            {/* Menu hiển thị khi isProfileOpen === true */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {isLoggedIn ? (
                                        <>
                                            <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                                <img src={mockUser.avatar} alt={mockUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{mockUser.name}</span>
                                                    <span className="text-xs text-gray-500 truncate w-40">{mockUser.email}</span>
                                                </div>
                                            </div>
                                            <div className="p-2 flex flex-col gap-1">
                                                <Link to="/profile/info" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">person</span> Thông tin cá nhân</Link>
                                                <Link to="/profile/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">shopping_bag</span> Đơn hàng của tôi</Link>
                                                <Link to="/profile/history" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">history</span> Lịch sử đơn hàng</Link>
                                                <Link to="/profile/reviews" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-emerald-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">rate_review</span> Đánh giá của tôi</Link>
                                            </div>
                                            <div className="p-2 border-t border-gray-50">
                                                <button onClick={() => { setIsProfileOpen(false); alert("Đăng xuất thành công!"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"><span className="material-symbols-outlined text-[20px]">logout</span> Đăng xuất</button>
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
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}