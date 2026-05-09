import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useSearchParams } from "react-router-dom";

type User = {
    name: string;
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
    roleLabel: string;
    roleColor?: string;
    status: 'ACTIVE' | 'BANNED';
    statusLabel: string;
    statusColor: string;
    avatar: string;
};


export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({
        role: "all",
        status: "all",
    });

    const [tempFilters, setTempFilters] = useState(currentFilters);

    // State tìm kiếm từ URL
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // State quản lý Modal Xác nhận Khóa/Mở khóa
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState<{ id: string, name: string, status: string } | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // State quản lý Modal Chỉnh sửa
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<{ id: string, name: string, role: string, status: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const formattedData: User[] = response.data.map((item: any) => {
                let statusLabel = "Không xác định";
                let statusColor = "text-gray-500";
                if (item.status === 'ACTIVE') {
                    statusLabel = "Hoạt động";
                    statusColor = "text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg";
                } else if (item.status === 'BANNED') {
                    statusLabel = "Bị khóa";
                    statusColor = "text-red-700 bg-red-50 px-2 py-1 rounded-lg";
                }

                let roleLabel = "Người dùng";
                let roleColor = "bg-blue-100 text-blue-700";
                if (item.role === 'ADMIN') {
                    roleLabel = "Quản trị viên";
                    roleColor = "bg-red-100 text-red-700";
                }

                return {
                    id: `#U-${item.id}`,
                    name: item.fullName,
                    email: item.email,
                    role: item.role,
                    roleLabel: roleLabel,
                    roleColor: roleColor,
                    status: item.status,
                    statusLabel: statusLabel,
                    statusColor: statusColor,
                    avatar: item.avatar || "",
                };
            });

            setUsers(formattedData);
        } catch (err) {
            console.error("Lỗi khi lấy dữ liệu người dùng:", err);
            setError("Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyFilters = () => {
        setCurrentFilters(tempFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = { role: "all", status: "all" };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name || name === "Đang tải...") return "";
        return name.trim().charAt(0).toUpperCase();
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;
        setIsToggling(true);
        try {
            const numericId = userToToggle.id.replace('#U-', '');
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/users/${numericId}/status`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setIsConfirmModalOpen(false);
            setUserToToggle(null);
            fetchUsers(); // Tải lại danh sách sau khi đổi trạng thái
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái người dùng:", error);
            alert("Có lỗi xảy ra khi thay đổi trạng thái!");
        } finally {
            setIsToggling(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;
        setIsEditing(true);
        try {
            const numericId = userToEdit.id.replace('#U-', '');
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/users/${numericId}`, {
                fullName: userToEdit.name,
                role: userToEdit.role,
                status: userToEdit.status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditModalOpen(false);
            setUserToEdit(null);
            fetchUsers();
        } catch (error) {
            console.error("Lỗi khi cập nhật người dùng:", error);
            alert("Có lỗi xảy ra khi cập nhật!");
        } finally {
            setIsEditing(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const searchMatch = searchTerm === "" || 
                                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                user.id.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = currentFilters.role === 'all' || user.role === currentFilters.role;
            const statusMatch = currentFilters.status === 'all' || user.status === currentFilters.status;
            return searchMatch && roleMatch && statusMatch;
        });
    }, [users, currentFilters, searchTerm]);

    // Xử lý phân trang
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
    const bannedUsers = users.filter((u) => u.status === "BANNED").length;

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden">

            <AdminSidebar />

            {/* CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                {/* MAIN */}
                <main className="p-8 flex-1 overflow-y-auto">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Người Dùng</h2>

                        <div className="relative">
                                <button
                                    onClick={() => {
                                        // When opening the panel, sync the temporary filters with the current active ones
                                        setTempFilters(currentFilters);
                                        setIsFilterPanelOpen(true);
                                    }}
                                    className="h-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Bộ lọc
                                </button>

                                {isFilterPanelOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-5 border-b">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-on-surface">Bộ lọc</h4>
                                                <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition">
                                                    <span className="material-symbols-outlined text-xl">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-6">
                                            {/* Filter by Role */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-3">Vai trò</label>
                                                <div className="space-y-2">
                                                    {(['all', 'ADMIN', 'USER'] as const).map(role => (
                                                        <label key={role} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="role"
                                                                value={role}
                                                                checked={tempFilters.role === role}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, role: e.target.value as 'all' | 'ADMIN' | 'USER' })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{role === 'all' ? 'Tất cả' : (role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng')}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Filter by Status */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['all', 'ACTIVE', 'BANNED'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={tempFilters.status === status}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as 'all' | 'ACTIVE' | 'BANNED' })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{status === 'all' ? 'Tất cả' : (status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa')}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                                            <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white hover:bg-gray-100 transition">Xóa lọc</button>
                                            <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-container transition">Áp dụng</button>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs uppercase text-on-surface-variant font-semibold mb-1">Tổng người dùng</p>
                                <h3 className="text-2xl font-black">{totalUsers.toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs uppercase text-on-surface-variant font-semibold mb-1">Đang hoạt động</p>
                                <h3 className="text-2xl font-black">{activeUsers.toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-xs uppercase text-on-surface-variant font-semibold mb-1">Cảnh báo</p>
                                <h3 className="text-2xl font-black text-red-500">{bannedUsers.toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl shadow overflow-hidden">

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-100 text-on-surface-variant text-xs uppercase">
                                    <tr>
                                        <th className="text-left p-4">Người dùng</th>
                                        <th className="text-left p-4">Email</th>
                                        <th className="text-left p-4">Vai trò</th>
                                        <th className="text-left p-4">Trạng thái</th>
                                        <th className="text-right p-4">Hành động</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-red-500">{error}</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-on-surface-variant">Chưa có người dùng nào.</td>
                                        </tr>
                                    ) : currentUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-on-surface-variant">Không tìm thấy người dùng nào khớp với bộ lọc.</td>
                                        </tr>
                                    ) : (
                                        currentUsers.map((u, i) => (
                                            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                                <td className="p-4 flex items-center gap-3">
                                                    {u.avatar ? (
                                                        <img
                                                            src={u.avatar}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            alt={u.name}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm shrink-0">
                                                            <span className="font-bold text-[16px]">{getInitials(u.name)}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold">{u.name}</p>
                                                        <p className="text-xs text-on-surface-variant">{u.id}</p>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-sm">{u.email}</td>

                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${u.roleColor || 'bg-green-100 text-green-700'}`}>
                                                        {u.roleLabel}
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <span className={`text-sm font-bold ${u.statusColor}`}>
                                                        {u.statusLabel}
                                                    </span>
                                                </td>

                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => { setUserToEdit({ id: u.id, name: u.name, role: u.role, status: u.status }); setIsEditModalOpen(true); }}
                                                        className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-gray-500 group-hover:text-primary transition-colors duration-200">
                                                            edit
                                                        </span>
                                                    </button>
                                                    <button
                                                        onClick={() => { setUserToToggle({ id: u.id, name: u.name, status: u.status }); setIsConfirmModalOpen(true); }}
                                                        className={`group px-2 py-1 text-sm rounded transition ${u.status === 'ACTIVE' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`} title={u.status === 'ACTIVE' ? "Khóa" : "Mở khóa"}
                                                    >
                                                        <span className={`material-symbols-outlined text-[20px] align-middle transition-colors duration-200 ${u.status === 'ACTIVE' ? 'text-red-500 group-hover:text-red-700' : 'text-green-500 group-hover:text-green-700'}`}>
                                                            {u.status === 'ACTIVE' ? 'block' : 'lock_open'}
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!isLoading && !error && totalPages > 1 && (
                        // {/* PAGINATION */}
                        <div className="flex justify-center items-center mt-6 text-sm text-on-surface-variant">

                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 rounded transition ${currentPage === page ? 'bg-primary text-white font-bold' : 'border hover:bg-gray-50'}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL XÁC NHẬN KHÓA/MỞ KHÓA */}
            {isConfirmModalOpen && userToToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${userToToggle.status === 'ACTIVE' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-500'}`}>
                                <span className="material-symbols-outlined text-3xl">
                                    {userToToggle.status === 'ACTIVE' ? 'block' : 'lock_open'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Xác nhận {userToToggle.status === 'ACTIVE' ? 'khóa' : 'mở khóa'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn {userToToggle.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản của người dùng <strong>{userToToggle.name}</strong> không?
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    disabled={isToggling}
                                    className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmToggleStatus}
                                    disabled={isToggling}
                                    className={`px-6 py-2 rounded-xl text-white font-bold transition-colors disabled:opacity-50 ${userToToggle.status === 'ACTIVE' ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                >
                                    {isToggling ? "Đang xử lý..." : "Xác Nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHỈNH SỬA NGƯỜI DÙNG */}
            {isEditModalOpen && userToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800" style={{ fontSize: 25 }}>Chỉnh sửa người dùng</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Tên người dùng</label>
                                <input
                                    type="text"
                                    required
                                    value={userToEdit.name}
                                    onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Vai trò</label>
                                <div className="relative">
                                    <select
                                        value={userToEdit.role}
                                        onChange={(e) => setUserToEdit({ ...userToEdit, role: e.target.value })}
                                        className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] bg-white cursor-pointer"
                                    >
                                        <option value="USER">Người dùng</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                    </select>
                                    <span className="absolute right-[17px] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">expand_more</span>
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isEditing} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isEditing} className="px-5 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors shadow-md">
                                    {isEditing ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}