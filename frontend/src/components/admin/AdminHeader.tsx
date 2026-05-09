import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHeader: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";

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

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
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
    );
};

export default AdminHeader;