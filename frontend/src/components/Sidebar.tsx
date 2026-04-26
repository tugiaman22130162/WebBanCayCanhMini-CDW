import React from "react";

interface SidebarProps {
    user: {
        name: string;
        email: string;
        avatar: string;
    };
    activeTab: 'info' | 'orders' | 'reviews' | 'password';
    setActiveTab: (tab: 'info' | 'orders' | 'reviews' | 'password') => void;
    pendingReviewsCount: number;
    onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, pendingReviewsCount, onLogout }: SidebarProps) {
    return (
        <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm"
                    />
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#2f5146] transition-colors shadow-sm" title="Thay đổi ảnh đại diện">
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    </button>
                </div>
                <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'info' ? 'bg-[#E8F1EE] text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined">person</span>
                    Thông tin cá nhân
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'orders' ? 'bg-[#E8F1EE] text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined">shopping_bag</span>
                    Đơn hàng của tôi
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'reviews' ? 'bg-[#E8F1EE] text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">rate_review</span>
                        Đánh giá của tôi
                    </div>
                    {pendingReviewsCount > 0 && (
                        <span className="bg-red-500 text-white text-[11px] font-black min-w-[22px] h-[22px] px-1 flex items-center justify-center rounded-full shadow-sm">
                            {pendingReviewsCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'password' ? 'bg-[#E8F1EE] text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined">lock</span>
                    Đổi mật khẩu
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}