import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

// --- Mock Data ---
const recentOrders = [
    { id: "1001", customer: "Nguyễn Văn A", date: "20/04/2026", total: 450000, status: "PENDING", statusLabel: "Chờ xác nhận", statusColor: "bg-yellow-100 text-yellow-700" },
    { id: "1002", customer: "Trần Thị B", date: "19/04/2026", total: 1200000, status: "SHIPPING", statusLabel: "Đang giao", statusColor: "bg-purple-100 text-purple-700" },
    { id: "1003", customer: "Lê Văn C", date: "18/04/2026", total: 250000, status: "DELIVERED", statusLabel: "Đã giao", statusColor: "bg-emerald-100 text-emerald-700" },
    { id: "1004", customer: "Phạm Thị D", date: "18/04/2026", total: 600000, status: "CANCELLED", statusLabel: "Đã hủy", statusColor: "bg-red-100 text-red-700" },
    { id: "1005", customer: "Hoàng Văn E", date: "17/04/2026", total: 350000, status: "DELIVERED", statusLabel: "Đã giao", statusColor: "bg-emerald-100 text-emerald-700" },
    { id: "1006", customer: "Vũ Thị F", date: "17/04/2026", total: 850000, status: "PENDING", statusLabel: "Chờ xác nhận", statusColor: "bg-yellow-100 text-yellow-700" },
    { id: "1007", customer: "Đặng Văn G", date: "16/04/2026", total: 150000, status: "SHIPPING", statusLabel: "Đang giao", statusColor: "bg-purple-100 text-purple-700" },
];

const categoryStats = [
    { name: "Sen đá", count: 450, percentage: 45, color: "bg-gradient-to-r from-emerald-400 to-emerald-600", image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop" },
    { name: "Terrarium", count: 300, percentage: 30, color: "bg-gradient-to-r from-cyan-400 to-blue-500", image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=100&h=100&fit=crop" },
    { name: "Cây để bàn", count: 250, percentage: 25, color: "bg-gradient-to-r from-amber-400 to-orange-500", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&h=100&fit=crop" },
];

const chartData = [
    { label: "T1", value: 40 },
    { label: "T2", value: 65 },
    { label: "T3", value: 45 },
    { label: "T4", value: 80 },
    { label: "T5", value: 55 },
    { label: "T6", value: 90 },
];

export default function Dashboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const totalPages = Math.ceil(recentOrders.length / itemsPerPage);
    const currentOrders = recentOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            {/* SIDEBAR */}
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <AdminHeader />

                {/* SCROLLABLE AREA */}
                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-4xl font-extrabold mb-2 text-gray-800">Tổng quan</h2>                    </div>

                    {/* 1. STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Doanh thu tháng</p>
                                <h3 className="text-2xl font-black text-gray-800">24.500.000đ</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng khách hàng</p>
                                <h3 className="text-2xl font-black text-gray-800">1,240</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">group</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đơn hàng mới</p>
                                <h3 className="text-2xl font-black text-gray-800">45</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tồn kho cảnh báo</p>
                                <h3 className="text-2xl font-black text-red-500">12</h3>
                            </div>
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">inventory_2</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. CHARTS & CATEGORY PROGRESS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Biểu đồ doanh thu (Giả lập bằng CSS Flexbox) */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Thống kê doanh thu (6 tháng qua)</h3>
                            <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-4">
                                {chartData.map((data, index) => (
                                    <div key={index} className="flex flex-col items-center flex-1 group">
                                        {/* Tooltip khi hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded mb-2 whitespace-nowrap">
                                            {data.value} Tr
                                        </div>
                                        {/* Cột biểu đồ */}
                                        <div className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-colors rounded-t-lg relative" style={{ height: `${data.value}%` }}></div>
                                        {/* Nhãn trục X */}
                                        <span className="text-sm font-semibold text-gray-500 mt-3">{data.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Thống kê danh mục sản phẩm (Progress bar) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Tỷ lệ danh mục</h3>
                            <div className="space-y-6">
                                {categoryStats.map((category, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <img src={category.image} alt={category.name} className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100" />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                                                <span>{category.name}</span>
                                                <span>{category.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div 
                                                    className={`h-2.5 rounded-full ${category.color}`} 
                                                    style={{ width: `${category.percentage}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{category.count} sản phẩm</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. RECENT ORDERS LIST */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h3>
                            <button className="text-sm font-semibold text-primary hover:underline">Xem tất cả</button>
                        </div>
                        <div className="overflow-x-auto">
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
                                    {currentOrders.map((order, index) => (
                                        <tr key={index} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                            <td className="p-4 pl-6 font-bold text-primary">#{order.id}</td>
                                            <td className="p-4 font-semibold text-gray-800">{order.customer}</td>
                                            <td className="p-4 text-sm text-gray-600">{order.date}</td>
                                            <td className="p-4 text-right font-bold text-gray-800">{order.total.toLocaleString('vi-VN')}đ</td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.statusColor}`}>
                                                    {order.statusLabel}
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