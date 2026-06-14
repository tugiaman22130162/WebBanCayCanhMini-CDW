import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import { useNavigate } from "react-router-dom";

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao';
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'SHIPPING': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    
    // State quản lý bộ lọc thời gian
    const [timeRange, setTimeRange] = useState<'all' | '7days' | '30days' | '6months' | '1year' | 'quarter' | 'custom'>('all');
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    // State lưu dữ liệu thống kê từ API
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalUsers: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        recentOrders: [] as any[],
        categoryStats: [] as any[],
        revenueGrowthData: [] as any[],
        userGrowthData: [] as any[],
        transactionStats: { success: 0, failed: 0, refunded: 0, total: 0 }
    });

    useEffect(() => {
        fetchDashboardStats();
    }, [timeRange, customStartDate, customEndDate]);

    const fetchDashboardStats = async () => {
        if (timeRange === 'custom' && (!customStartDate || !customEndDate)) {
            return; // Đợi đến khi chọn đủ 2 ngày
        }
        try {
            const token = localStorage.getItem("token");
            let url = `http://localhost:8080/api/dashboard?timeRange=${timeRange}`;
            if (timeRange === 'custom') {
                url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
            }
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error("Lỗi tải thống kê Dashboard:", error);
        }
    };

    const handleExportReport = async () => {
        try {
            Swal.fire({
                toast: true,
                position: 'bottom',
                title: 'Đang xuất báo cáo Excel...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: { popup: 'mb-6 rounded-full shadow-lg border border-gray-100', title: 'text-sm font-bold text-gray-700' }
            });

            const token = localStorage.getItem('token');
            let url = `http://localhost:8080/api/dashboard/export?timeRange=${timeRange}`;
            if (timeRange === 'custom') {
                url += `&startDate=${customStartDate}&endDate=${customEndDate}`;
            }

            const response = await axios.get(url, {
                responseType: 'blob', 
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = objectUrl;
            link.setAttribute('download', `Bao_Cao_Thong_Ke_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(objectUrl);
            
            Swal.close();

            Swal.fire({ toast: true, position: 'bottom', icon: 'success', title: 'Xuất báo cáo thành công!', timer: 2000, showConfirmButton: false, customClass: { popup: 'mb-6 rounded-full shadow-lg border border-gray-100', title: 'text-sm font-bold text-gray-700' } });
            showSuccessToast('Xuất báo cáo thành công!', 2000);
        } catch (error) {
            console.error("Lỗi khi xuất báo cáo:", error);
            Swal.fire({ toast: true, position: 'bottom', icon: 'error', title: 'Có lỗi xảy ra khi xuất báo cáo!', timer: 2000, showConfirmButton: false, customClass: { popup: 'mb-6 rounded-full shadow-lg border border-gray-100', title: 'text-sm font-bold text-gray-700' } });
            showErrorToast('Có lỗi xảy ra khi xuất báo cáo!', 2000);
        }
    };

    const itemsPerPage = 4;
    const totalPages = Math.ceil(stats.recentOrders.length / itemsPerPage);
    const currentOrders = stats.recentOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const txTotal = stats.transactionStats.total || 0;
    const txSuccessPct = txTotal === 0 ? 0 : Math.round((stats.transactionStats.success / txTotal) * 100);
    const txFailedPct = txTotal === 0 ? 0 : Math.round((stats.transactionStats.failed / txTotal) * 100);
    const txRefundedPct = txTotal === 0 ? 0 : Math.round(((stats.transactionStats.refunded || 0) / txTotal) * 100);
    const failedEndPct = txSuccessPct + txFailedPct;

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <AdminHeader />

                {/* SCROLLABLE AREA */}
                <main className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Tổng Quan</h2>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 w-full md:w-auto">
                            <select 
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-semibold text-gray-700 shadow-sm min-w-[180px] appearance-none cursor-pointer"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 12px center`, backgroundRepeat: `no-repeat`, backgroundSize: `16px 16px` }}
                            >
                                <option value="all">Tất cả thời gian</option>
                                <option value="7days">7 ngày qua</option>
                                <option value="30days">30 ngày qua</option>
                                <option value="6months">6 tháng qua</option>
                                <option value="1year">1 năm qua</option>
                                <option value="quarter">Trong quý này</option>
                                <option value="custom">Tùy chỉnh thời gian</option>
                            </select>
                            
                            {timeRange === 'custom' && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 w-full sm:w-auto">
                                    <input 
                                        type="date" 
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-700 shadow-sm"
                                    />
                                    <span className="text-gray-400 font-bold">-</span>
                                    <input 
                                        type="date" 
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium text-gray-700 shadow-sm"
                                    />
                                </div>
                            )}
                            
                            <button onClick={handleExportReport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#2f5146] transition-colors shadow-sm whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">download</span> Xuất báo cáo
                            </button>
                        </div>
                    </div>

                    {/* 1. STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Doanh thu</p>
                                <h3 className="text-2xl font-black text-gray-800">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng khách hàng</p>
                                <h3 className="text-2xl font-black text-gray-800">{stats.totalUsers}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">group</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng đơn hàng</p>
                                <h3 className="text-2xl font-black text-gray-800">{stats.totalOrders}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đơn chờ xác nhận</p>
                                <h3 className="text-2xl font-black text-red-500">{stats.pendingOrders}</h3>
                            </div>
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">inventory_2</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. CHARTS (DOANH THU & NGƯỜI DÙNG) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Biểu đồ doanh thu */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Tăng trưởng doanh thu</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.revenueGrowthData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}Tr` : value >= 1000 ? `${value / 1000}k` : value} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')}đ`, 'Doanh thu']}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Biểu đồ người dùng */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Tăng trưởng người dùng mới</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value: any) => [value, 'Người dùng']}
                                        />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 6, 6]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* 3. CHARTS (GIAO DỊCH & DANH MỤC) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Giao dịch (Biểu đồ tròn) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">Tỷ lệ giao dịch</h3>
                            <div 
                                className="w-48 h-48 rounded-full flex items-center justify-center relative shadow-inner"
                                style={{ background: `conic-gradient(#10b981 0% ${txSuccessPct}%, #ef4444 ${txSuccessPct}% ${failedEndPct}%, #9ca3af ${failedEndPct}% 100%)` }}
                            >
                                <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-2xl font-black text-gray-800">{txTotal}</span>
                                    <span className="text-xs text-gray-500 font-medium">Tổng giao dịch</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 mt-8 w-full max-w-[220px] mx-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                        <span className="text-sm font-semibold text-gray-600">Thành công</span>
                                    </div>                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                        <span className="text-sm font-semibold text-gray-600">Thất bại</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                                        <span className="text-sm font-semibold text-gray-600">Hoàn tiền</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{txRefundedPct}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Thống kê danh mục */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Thống kê sản phẩm theo danh mục</h3>
                            <div className="space-y-6">
                                {stats.categoryStats.map((category: any, index: number) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <img src={category.image || "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop"} alt={category.name} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                                                <span>{category.name}</span>
                                                <span>{category.count} sản phẩm ({category.percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                                <div 
                                                    className={`h-2.5 rounded-full ${category.color}`} 
                                                    style={{ width: `${category.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 4. RECENT ORDERS LIST */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h3>
                            <button onClick={() => navigate('/admin/orders')} className="text-sm font-semibold text-primary hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <table className="w-full min-w-[700px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6">Mã ĐH</th>
                                        <th className="text-left p-4">Khách hàng</th>
                                        <th className="text-left p-4">Ngày đặt</th>
                                        <th className="text-right p-4">Tổng tiền</th>
                                        <th className="text-center p-4">Trạng thái</th>
                                        <th className="text-right p-4 pr-6">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentOrders.map((order: any, index: number) => (
                                        <tr key={index} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                            <td className="p-4 pl-6 font-bold text-primary">#{order.id}</td>
                                            <td className="p-4 font-semibold text-gray-800">{order.customer}</td>
                                            <td className="p-4 text-sm text-gray-600">{order.date}</td>
                                            <td className="p-4 text-right font-bold text-gray-800">{order.total.toLocaleString('vi-VN')}đ</td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs font-bold px-3 py-1 border rounded-full ${getStatusColor(order.status)}`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <button className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-white border rounded-lg shadow-sm hover:shadow">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    {totalPages > 1 && (
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
        </div>
    );
}