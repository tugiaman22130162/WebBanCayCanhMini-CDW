import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminHeader: React.FC = () => {
    const location = useLocation();

    // Hàm lấy tên trang hiện tại dựa trên đường dẫn
    const getPageName = () => {
        if (location.pathname.includes("/users")) return "Quản lý người dùng";
        if (location.pathname.includes("/products")) return "Sản phẩm";
        if (location.pathname.includes("/categories")) return "Quản lý danh mục";
        if (location.pathname.includes("/orders")) return "Đơn hàng";
        if (location.pathname.includes("/promotions")) return "Quản lý khuyến mãi";
        if (location.pathname.includes("/payments")) return "Quản lý thanh toán";
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

                <button className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-all text-white">
                    <span className="material-symbols-outlined text-3xl">
                        account_circle
                    </span>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Admin</span>
                    </div>
                    <span className="material-symbols-outlined text-white/80">
                        expand_more
                    </span>
                </button>

            </div>
        </header>
    );
};

export default AdminHeader;