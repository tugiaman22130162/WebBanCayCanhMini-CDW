import React, { useState, useEffect, useRef } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user: authUser, token, updateUser } = useAuth();

    const [adminData, setAdminData] = useState({
        fullName: "",
        email: "",
        phone: "",
        role: "ADMIN",
        avatar: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Cập nhật thông tin khi có authUser
    useEffect(() => {
        if (authUser) {
            setAdminData({
                fullName: authUser.fullName || "",
                email: authUser.email || "",
                phone: authUser.phoneNumber || "",
                role: authUser.role || "ADMIN",
                avatar: authUser.avatar || ""
            });
        }
    }, [authUser]);

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const updatedData = {
                fullName: adminData.fullName,
                phone: adminData.phone,
                address: authUser?.address || "" // Giữ nguyên address hiện tại nếu có
            };
            await axios.put('http://localhost:8080/api/users/me/info', updatedData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (authUser) {
                updateUser({
                    ...authUser,
                    fullName: updatedData.fullName,
                    phoneNumber: updatedData.phone
                });
            }
            showSuccessToast('Cập nhật thông tin thành công!', 3000);
        } catch (error: any) {
            showErrorToast(error.response?.data?.message || 'Cập nhật thất bại!', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget; // <-- Lưu form vào một biến
        const formData = new FormData(form);
        const currentPassword = formData.get('currentPassword')?.toString() || '';
        const newPassword = formData.get('newPassword')?.toString() || '';
        const confirmPassword = formData.get('confirmPassword')?.toString() || '';

        if (newPassword !== confirmPassword) {
            showErrorToast('Mật khẩu mới không khớp!', 3000);
            return;
        }

        // Thêm kiểm tra độ mạnh mật khẩu
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            Swal.fire({
                icon: 'error',
                title: 'Mật khẩu không đủ mạnh',
                text: 'Mật khẩu phải dài ít nhất 6 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt.',
                confirmButtonColor: '#006c49'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Backend mong đợi một JSON body, không phải URL parameters
            await axios.put('http://localhost:8080/api/users/me/password', { currentPassword, newPassword }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            showSuccessToast('Đổi mật khẩu thành công!', 3000);
            form.reset(); // <-- Sử dụng biến đã lưu
        } catch (error: any) {
            // Log lỗi chi tiết ra console để debug
            console.error("Lỗi đổi mật khẩu:", error.response?.data || error.message);
            showErrorToast(error.response?.data?.message || 'Đổi mật khẩu thất bại!', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Logic upload Ảnh đại diện (Avatar)
    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showErrorToast('Vui lòng chọn file hình ảnh hợp lệ!', 3000);
            return;
        }
        setSelectedFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const getInitials = (name: string) => {
        if (!name) return "A";
        return name.trim().charAt(0).toUpperCase();
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
                                <div className="relative w-28 h-28 mx-auto mb-4 cursor-pointer" onClick={handleCameraClick}>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm" />
                                    ) : adminData.avatar ? (
                                        <img src={adminData.avatar} alt={adminData.fullName} className="w-full h-full object-cover rounded-full border-4 border-emerald-50 shadow-sm" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-4xl border-4 border-emerald-50 shadow-sm">
                                            {getInitials(adminData.fullName)}
                                        </div>
                                    )}
                                    <button type="button" className="absolute bottom-0 right-0 w-8 h-8 bg-[#006c49] text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#005236] transition-colors shadow-sm" title="Thay đổi ảnh đại diện">
                                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                
                                {avatarPreview && (
                                    <div className="flex justify-center gap-2 mb-4">
                                        <button onClick={() => { setAvatarPreview(null); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} disabled={isUploading} className="px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50">Hủy</button>
                                        <button onClick={async () => {
                                            if (!selectedFile) return;
                                            const formData = new FormData(); formData.append('avatar', selectedFile);
                                            setIsUploading(true);
                                            try {
                                                const response = await axios.post('http://localhost:8080/api/users/me/avatar', formData, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
                                                if (authUser) updateUser({ ...authUser, avatar: response.data.avatarUrl });
                                                showSuccessToast('Cập nhật ảnh đại diện thành công!', 3000);
                                                setAvatarPreview(null); setSelectedFile(null);
                                            } catch (error) {
                                                showErrorToast('Không thể cập nhật ảnh đại diện', 3000);
                                            } finally { setIsUploading(false); }
                                        }} disabled={isUploading} className="px-3 py-1.5 text-xs font-bold text-white bg-[#006c49] hover:bg-[#005236] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50">
                                            {isUploading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>} Lưu ảnh
                                        </button>
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-gray-800">{adminData.fullName}</h3>
                                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    {adminData.role === 'ADMIN' ? 'Quản trị viên' : adminData.role}
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
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu hiện tại</label>
                                            <div className="relative">
                                                <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" required placeholder="••••••••" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" />
                                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006c49] focus:outline-none flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined">{showCurrentPassword ? "visibility_off" : "visibility"}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu mới</label>
                                            <div className="relative">
                                                <input type={showNewPassword ? "text" : "password"} name="newPassword" required placeholder="••••••••" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" />
                                                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006c49] focus:outline-none flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                            <div className="relative">
                                                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required placeholder="••••••••" className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] transition-all font-medium" />
                                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006c49] focus:outline-none flex items-center justify-center transition-colors">
                                                    <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                                                </button>
                                            </div>
                                        </div>
                                        
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