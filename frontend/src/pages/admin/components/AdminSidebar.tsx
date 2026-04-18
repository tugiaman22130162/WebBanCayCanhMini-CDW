import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { name: "Tổng quan", path: "/admin/dashboard", icon: "dashboard" },
        { name: "Người dùng", path: "/admin/users", icon: "group" },
        { name: "Sản phẩm", path: "/admin/products", icon: "inventory_2" },
        { name: "Đơn hàng", path: "/admin/orders", icon: "receipt_long" },
        { name: "Khuyến mãi", path: "/admin/promotions", icon: "campaign" },
        { name: "Cài đặt", path: "/admin/settings", icon: "settings" },
    ];

    return (
        <aside className="w-64 bg-header-footer border-r border-white/10 flex flex-col h-screen sticky top-0 z-50 shadow-sm">
            {/* Logo */}
            <div className="h-16 flex items-center justify-center">
                <Link
                    to="/admin/dashboard"
                    className="text-2xl font-bold bg-gradient-to-r from-green-300 to-lime-200 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition"
                >
                    MiniGarden
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = location.pathname.includes(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group ${isActive
                                ? "bg-white/20 text-white shadow-md"
                                : "text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            <span
                                className={`material-symbols-outlined text-[22px] ${isActive ? "text-white" : "text-white/70 group-hover:text-white"
                                    }`}
                            >
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4">
                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;