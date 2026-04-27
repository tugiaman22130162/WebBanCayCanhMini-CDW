import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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

    // Hàm lấy tên trang hiện tại dựa trên đường dẫn
    const getPageName = () => {
        if (location.pathname.includes("/users")) return "Quản lý người dùng";
        if (location.pathname.includes("/products")) return "Quản lý sản phẩm";
        if (location.pathname.includes("/categories")) return "Quản lý danh mục";
        if (location.pathname.includes("/orders")) return "Quản lý đơn hàng";
        if (location.pathname.includes("/promotions")) return "Quản lý khuyến mãi";
        if (location.pathname.includes("/payments")) return "Quản lý thanh toán";
        if (location.pathname.includes("/profile")) return "Hồ sơ cá nhân";
        return "Tổng quan";
    };

    return (
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
                        placeholder="Tìm kiếm..."
                        className="w-full bg-white/10 text-white placeholder-white/60 text-sm rounded-full py-2 pl-5 pr-10 border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-xl">
                        search
                    </span>
                </div>

                <button className="relative p-2 text-white hover:text-green-200 hover:bg-white/10 rounded-full transition-all">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                </button>

                {/* PROFILE DROPDOWN */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all text-white outline-none ${isProfileOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
                    >
                        <img 
                            src="https://i.pravatar.cc/150?u=admin@minigarden.com" 
                            alt="Admin Avatar" 
                            className="w-8 h-8 rounded-full object-cover border border-white/50"
                        />
                        <div className="hidden md:flex flex-col items-start">
                            <span className="text-sm font-bold leading-none">Admin</span>
                        </div>
                        <span className={`material-symbols-outlined text-white/80 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    {/* Menu xổ xuống */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 text-gray-800">
                            <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800">Quản trị viên</span>
                                    <span className="text-xs text-gray-500 truncate w-40">admin@minigarden.com</span>
                                </div>
                            </div>
                            <div className="p-2 flex flex-col gap-1">
                                <Link to="/admin/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-[#006c49] hover:bg-[#E8F1EE] rounded-xl transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">person</span> Hồ sơ cá nhân
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;