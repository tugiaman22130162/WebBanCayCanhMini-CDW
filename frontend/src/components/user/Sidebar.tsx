import React, { useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

// Cấu hình mặc định cho các thông báo Toast
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    width: 'auto',
    padding: '0.5em 1em',
    customClass: {
        popup: 'rounded-2xl shadow-lg border border-gray-100 font-body flex items-center mt-20',
        title: 'text-sm font-bold text-gray-800 whitespace-nowrap'
    },
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

interface SidebarProps {
    user: {
        name: string;
        email: string;
        avatar: string;
        initial?: string;
    };
    activeTab: 'info' | 'orders' | 'history' | 'reviews' | 'password';
    setActiveTab: (tab: 'info' | 'orders' | 'history' | 'reviews' | 'password') => void;
    pendingReviewsCount: number;
    onLogout: () => void;
}

export default function Sidebar({ user, activeTab, setActiveTab, pendingReviewsCount, onLogout }: SidebarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { token, updateUser, user: authUser } = useAuth();

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            Toast.fire({ icon: 'error', title: 'Vui lòng chọn file hình ảnh hợp lệ!' });
            return;
        }

        setSelectedFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSaveAvatar = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('avatar', selectedFile);

        setIsUploading(true);
        try {
            const response = await axios.post('http://localhost:8080/api/users/me/avatar', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (authUser) {
                updateUser({ ...authUser, avatar: response.data.avatarUrl });
            }
            Toast.fire({ icon: 'success', title: 'Cập nhật ảnh đại diện thành công!' });
            setAvatarPreview(null);
            setSelectedFile(null);
        } catch (error) {
            Toast.fire({ icon: 'error', title: 'Không thể cập nhật ảnh đại diện' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelAvatar = () => {
        setAvatarPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="relative w-24 h-24 mx-auto mb-4">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm"
                        />
                    ) : user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[40px] border-4 border-emerald-50 shadow-sm">
                            {user.initial}
                        </div>
                    )}
                    {!avatarPreview && (
                        <button 
                            onClick={handleCameraClick}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#2f5146] transition-colors shadow-sm" 
                            title="Thay đổi ảnh đại diện"
                        >
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        </button>
                    )}
                    
                    {/* Input file ẩn */}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                {avatarPreview && (
                    <div className="flex justify-center gap-2 mb-4">
                        <button 
                            onClick={handleCancelAvatar}
                            disabled={isUploading}
                            className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button 
                            onClick={handleSaveAvatar}
                            disabled={isUploading}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-[#2f5146] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                            {isUploading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            Lưu ảnh
                        </button>
                    </div>
                )}
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
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'history' ? 'bg-[#E8F1EE] text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                    <span className="material-symbols-outlined">history</span>
                    Lịch sử mua hàng
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