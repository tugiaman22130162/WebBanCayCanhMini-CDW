import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock data người dùng Admin
    const [adminData, setAdminData] = useState({
        fullName: "Quản trị viên",
        email: "admin@minigarden.com",
        phone: "0987654321",
        role: "ADMIN",
        avatar: "https://i.pravatar.cc/150?u=admin@minigarden.com"
    });

    const handleSaveInfo = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert("Cập nhật thông tin thành công!");
        }, 1000);
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert("Đổi mật khẩu thành công!");
        }, 1000);
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Hồ Sơ Cá Nhân</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* LEFT COLUMN: AVATAR & MENU */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="relative w-28 h-28 mx-auto mb-4">
                                    <img
                                        src={adminData.avatar}
                                        alt={adminData.fullName}
                                        className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm"
                                    />
                                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#006c49] text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#005236] transition-colors shadow-sm" title="Thay đổi ảnh đại diện">
                                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{adminData.fullName}</h3>
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    {adminData.role}
                                </span>
                            </div>

                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                                <button
                                    onClick={() => setActiveTab('info')}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'info' ? 'bg-[#E8F1EE] text-[#006c49]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <span className="material-symbols-outlined">person</span>
                                    Thông tin cá nhân
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'password' ? 'bg-[#E8F1EE] text-[#006c49]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <span className="material-symbols-outlined">lock</span>
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FORMS */}
                        <div className="lg:col-span-3">
                            {activeTab === 'info' && (
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Cập Nhật Thông Tin</h3>
                                    <form onSubmit={handleSaveInfo} className="space-y-6 max-w-2xl">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên</label>
                                                <input type="text" required value={adminData.fullName} onChange={(e) => setAdminData({...adminData, fullName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Số điện thoại</label>
                                                <input type="tel" required value={adminData.phone} onChange={(e) => setAdminData({...adminData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email liên hệ</label>
                                            <input type="email" disabled value={adminData.email} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 cursor-not-allowed font-medium" />
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">info</span> Email quản trị viên không thể thay đổi.</p>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                                            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#006c49] text-white font-bold rounded-xl hover:bg-[#005236] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                                                {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
                                                Lưu Thay Đổi
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đổi Mật Khẩu</h3>
                                    <form onSubmit={handleSavePassword} className="space-y-6 max-w-lg">
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label><input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu mới</label><input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" /></div>
                                        <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label><input type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" /></div>
                                        
                                        <div className="pt-4 border-t border-gray-100 flex justify-start">
                                            <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-[#006c49] text-white font-bold rounded-xl hover:bg-[#005236] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                                                {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[20px]">autorenew</span> : <span className="material-symbols-outlined text-[20px]">lock_reset</span>}
                                                Cập Nhật Mật Khẩu
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}