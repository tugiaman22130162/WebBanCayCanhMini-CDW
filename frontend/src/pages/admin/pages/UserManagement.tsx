import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

type User = {
    name: string;
    id: string;
    email: string;
    role: 'ADMIN' | 'USER';
    roleLabel: string;
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

    // A temporary state for when the user is changing filters in the panel
    const [tempFilters, setTempFilters] = useState(currentFilters);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8080/api/users");

            const formattedData: User[] = response.data.map((item: any) => {
                let statusLabel = "Không xác định";
                let statusColor = "text-gray-500";
                if (item.status === 'ACTIVE') {
                    statusLabel = "Hoạt động";
                    statusColor = "text-primary";
                } else if (item.status === 'BANNED') {
                    statusLabel = "Bị khóa";
                    statusColor = "text-red-500";
                }

                let roleLabel = "Người dùng";
                if (item.role === 'ADMIN') {
                    roleLabel = "Quản trị viên";
                }

                return {
                    id: `#U-${item.id}`,
                    name: item.fullName,
                    email: item.email,
                    role: item.role,
                    roleLabel: roleLabel,
                    status: item.status,
                    statusLabel: statusLabel,
                    statusColor: statusColor,
                    avatar: item.avatar || `https://i.pravatar.cc/150?u=${item.email}`,
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
    };

    const handleClearFilters = () => {
        const clearedFilters = { role: "all", status: "all" };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const roleMatch = currentFilters.role === 'all' || user.role === currentFilters.role;
            const statusMatch = currentFilters.status === 'all' || user.status === currentFilters.status;
            return roleMatch && statusMatch;
        });
    }, [users, currentFilters]);

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
                                className="px-4 py-2 rounded-xl bg-white border text-sm flex items-center gap-2 hover:bg-gray-50 transition"
                            >
                                <span className="material-symbols-outlined text-lg text-on-surface-variant">filter_list</span>
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
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-on-surface-variant">Không tìm thấy người dùng nào khớp với bộ lọc.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, i) => (
                                            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img
                                                        src={u.avatar}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <p className="font-bold">{u.name}</p>
                                                        <p className="text-xs text-on-surface-variant">{u.id}</p>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-sm">{u.email}</td>

                                                <td className="p-4">
                                                    <span className="text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
                                                        {u.roleLabel}
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <span className={`text-sm font-bold ${u.statusColor}`}>
                                                        {u.statusLabel}
                                                    </span>
                                                </td>

                                                <td className="p-4 text-right space-x-2">
                                                    <button className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-[24px] h-[24px] inline-block align-middle text-[#1a1a2e] group-hover:text-header-footer transition-colors duration-200">
                                                            <path fill="currentColor" d="M256.1 312C322.4 312 376.1 258.3 376.1 192C376.1 125.7 322.4 72 256.1 72C189.8 72 136.1 125.7 136.1 192C136.1 258.3 189.8 312 256.1 312zM226.4 368C127.9 368 48.1 447.8 48.1 546.3C48.1 562.7 61.4 576 77.8 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L383.1 397C355.1 378.7 321.7 368.1 285.7 368.1L226.3 368.1zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z" />
                                                        </svg>
                                                    </button>
                                                    <button className="group px-2 py-1 text-sm rounded hover:bg-red-50 transition" title="Khóa">
                                                        <span className="material-symbols-outlined text-[24px] align-middle text-red-500 group-hover:text-red-700 transition-colors duration-200">
                                                            block
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

                    {!isLoading && !error && filteredUsers.length > 0 && (
                        // {/* PAGINATION */}
                        <div className="flex justify-center items-center mt-6 text-sm text-on-surface-variant">

                            <div className="flex flex-wrap justify-center gap-2">
                                <button className="px-3 py-1 rounded border">‹</button>
                                <button className="px-3 py-1 rounded bg-primary text-white">1</button>
                                <button className="px-3 py-1 rounded border">2</button>
                                <button className="px-3 py-1 rounded border">3</button>
                                <button className="px-3 py-1 rounded border">›</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}