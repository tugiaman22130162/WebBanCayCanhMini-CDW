import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import OrderDetailModal from "../../components/admin/OrderDetailModal";
import { useSearchParams } from "react-router-dom";

// Khai báo Type dựa trên Entity Orders của Backend
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

type Order = {
    id: number;
    orderCode: string;
    receiver_name: string;
    phone: string;
    address: string;
    total_price: number;
    status: OrderStatus;
    created_at: string;
    updatedAt?: string;
    items_count: number; // Tổng số lượng sản phẩm trong đơn
};

// Hàm hỗ trợ hiển thị Label và Màu sắc cho trạng thái
const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao';
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
};

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'SHIPPING': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";

    // State quản lý Modal Chi tiết
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const fetchedOrders = response.data.map((o: any) => ({
                id: o.id,
                orderCode: o.orderCode || o.id.toString(),
                receiver_name: o.receiverName,
                phone: o.phone,
                address: o.address,
                total_price: o.totalPrice,
                status: o.status,
                created_at: o.createdAt,
                updatedAt: o.updatedAt,
                items_count: o.items ? o.items.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0
            }));
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Lọc danh sách theo trạng thái
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchSearch = searchTerm === "" ||
                order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.receiver_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [orders, statusFilter, searchTerm]);

    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const currentOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Thống kê
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.total_price, 0);

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-8 flex-1 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Đơn Hàng</h2>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng đơn hàng</p>
                                <h3 className="text-3xl font-black text-gray-800">{totalOrders}</h3>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">shopping_bag</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Chờ xác nhận</p>
                                <h3 className="text-3xl font-black text-yellow-600">{pendingOrders}</h3>
                            </div>
                            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">pending_actions</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Doanh thu (Đã giao)</p>
                                <h3 className="text-3xl font-black text-emerald-600">{revenue.toLocaleString('vi-VN')}đ</h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                        </div>
                    </div>

                    {/* FILTER & TABLE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="p-4 border-b flex gap-2 overflow-x-auto">
                            {(['ALL', 'PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {status === 'ALL' ? 'Tất cả' : getStatusLabel(status as OrderStatus)}
                                </button>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4">Mã ĐH</th>
                                        <th className="text-left p-4">Khách hàng</th>
                                        <th className="text-left p-4">Ngày đặt</th>
                                        {statusFilter === 'DELIVERED' && <th className="text-left p-4">Ngày giao</th>}
                                        {statusFilter === 'CANCELLED' && <th className="text-left p-4">Ngày hủy</th>}
                                        <th className="text-right p-4">Tổng tiền</th>
                                        <th className="text-center p-4">Trạng thái</th>
                                        <th className="text-center p-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={statusFilter === 'DELIVERED' || statusFilter === 'CANCELLED' ? 7 : 6} className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr><td colSpan={statusFilter === 'DELIVERED' || statusFilter === 'CANCELLED' ? 7 : 6} className="p-8 text-center text-gray-500">Không có đơn hàng nào.</td></tr>
                                    ) : (
                                        currentOrders.map((order) => (
                                            <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                                <td className="p-4 font-bold text-primary">{order.orderCode}</td>
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-800">{order.receiver_name}</p>
                                                    <p className="text-xs text-gray-500">{order.phone}</p>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {new Date(order.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                {statusFilter === 'DELIVERED' && (
                                                    <td className="p-4 text-sm text-gray-600">
                                                        {order.updatedAt ? (
                                                            <span className="text-emerald-600 font-semibold">{new Date(order.updatedAt).toLocaleString('vi-VN')}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                {statusFilter === 'CANCELLED' && (
                                                    <td className="p-4 text-sm text-gray-600">
                                                        {order.updatedAt ? (
                                                            <span className="text-red-600 font-semibold">{new Date(order.updatedAt).toLocaleString('vi-VN')}</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                )}
                                                <td className="p-4 text-right font-bold text-emerald-600">{order.total_price.toLocaleString('vi-VN')}đ</td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                                                </td>
                                                <td className="p-4 text-center space-x-2">
                                                    <button
                                                        onClick={() => { setSelectedOrderId(order.id); setIsDetailModalOpen(true); }}
                                                        className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors" title="Xem chi tiết">
                                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            <OrderDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} orderId={selectedOrderId} onSuccess={fetchOrders} />
        </div>
    );
}