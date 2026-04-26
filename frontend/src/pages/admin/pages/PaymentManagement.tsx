import React, { useState, useMemo, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
type PaymentMethod = 'COD' | 'VNPAY';

type Payment = {
    id: string;
    orderId: string;
    customerName: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    date: string;
};

// Mock data giả lập
const initialPayments: Payment[] = [
    { id: "PAY-1001", orderId: "ORD-1001", customerName: "Nguyễn Văn A", amount: 450000, method: "COD", status: "PENDING", date: "2026-04-20T10:30:00" },
    { id: "PAY-1002", orderId: "ORD-1002", customerName: "Trần Thị B", amount: 1200000, method: "VNPAY", status: "SUCCESS", date: "2026-04-19T15:20:00" },
    { id: "PAY-1003", orderId: "ORD-1003", customerName: "Lê Văn C", amount: 250000, method: "COD", status: "SUCCESS", date: "2026-04-18T09:15:00" },
    { id: "PAY-1004", orderId: "ORD-1004", customerName: "Phạm Thị D", amount: 600000, method: "VNPAY", status: "FAILED", date: "2026-04-20T11:00:00" },
    { id: "PAY-1005", orderId: "ORD-1005", customerName: "Hoàng Văn E", amount: 850000, method: "VNPAY", status: "REFUNDED", date: "2026-04-17T14:45:00" },
];

const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
        case 'SUCCESS': return 'Thành công';
        case 'PENDING': return 'Đang xử lý';
        case 'FAILED': return 'Thất bại';
        case 'REFUNDED': return 'Đã hoàn tiền';
        default: return status;
    }
};

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case 'SUCCESS': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
        case 'REFUNDED': return 'bg-gray-100 text-gray-700 border-gray-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
        case 'COD': return 'local_shipping';
        case 'VNPAY': return 'account_balance_wallet';
        default: return 'payments';
    }
};

export default function PaymentManagement() {
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState("");

    // State quản lý Modal Chi Tiết
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Đặt lại về trang 1 mỗi khi thay đổi bộ lọc tìm kiếm / trạng thái
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const matchSearch = payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || payment.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [payments, searchTerm, statusFilter]);

    // Tính toán dữ liệu cho trang hiện tại
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const currentPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalRevenue = payments.filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
    const successCount = payments.filter(p => p.status === 'SUCCESS').length;
    const pendingCount = payments.filter(p => p.status === 'PENDING').length;

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Thanh Toán</h2>
                    </div>

                    {/* THỐNG KÊ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng doanh thu</p>
                                <h3 className="text-3xl font-black text-emerald-600">{totalRevenue.toLocaleString('vi-VN')}đ</h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">payments</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Giao dịch thành công</p>
                                <h3 className="text-3xl font-black text-blue-600">{successCount}</h3>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đang xử lý</p>
                                <h3 className="text-3xl font-black text-yellow-600">{pendingCount}</h3>
                            </div>
                            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">pending_actions</span>
                            </div>
                        </div>
                    </div>

                    {/* THANH CÔNG CỤ TÌM KIẾM / LỌC */}
                    <div className="bg-white p-4 rounded-t-2xl border border-gray-50 border-b-0 flex flex-col lg:flex-row justify-between gap-4 items-center">
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Tìm mã thanh toán, đơn hàng..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'ALL')}
                                    className="appearance-none w-full px-4 py-2.5 pr-10 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#006c49] focus:ring-1 outline-none text-sm font-semibold text-gray-700 cursor-pointer text-center"
                                >
                                    <option value="ALL" className="text-left">Tất cả trạng thái</option>
                                    <option value="SUCCESS" className="text-left">Thành công</option>
                                    <option value="PENDING" className="text-left">Đang xử lý</option>
                                    <option value="FAILED" className="text-left">Thất bại</option>
                                    <option value="REFUNDED" className="text-left">Đã hoàn tiền</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">expand_more</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* BẢNG DANH SÁCH THANH TOÁN */}
                    <div className="bg-white rounded-b-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6">Mã Giao Dịch</th>
                                        <th className="text-left p-4">Đơn Hàng</th>
                                        <th className="text-left p-4">Khách Hàng</th>
                                        <th className="text-left p-4">Phương Thức</th>
                                        <th className="text-right p-4">Số Tiền</th>
                                        <th className="text-center p-4">Trạng Thái</th>
                                        <th className="text-left p-4">Thời Gian</th>
                                        <th className="text-center p-4 pr-6">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.length === 0 ? (
                                        <tr><td colSpan={8} className="p-8 text-center text-gray-500">Không có giao dịch nào.</td></tr>
                                    ) : (
                                        currentPayments.map((payment) => (
                                            <tr key={payment.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                                <td className="p-4 pl-6 font-bold text-gray-700">{payment.id}</td>
                                                <td className="p-4 font-bold text-[#006c49]">{payment.orderId}</td>
                                                <td className="p-4 font-semibold text-gray-800">{payment.customerName}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-gray-500 text-[18px]">{getMethodIcon(payment.method)}</span>
                                                        <span className="font-semibold text-gray-700 text-sm">{payment.method}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right font-bold text-gray-800">{payment.amount.toLocaleString('vi-VN')}đ</td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                                                        {getStatusLabel(payment.status)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">{new Date(payment.date).toLocaleString('vi-VN')}</td>
                                                <td className="p-4 pr-6 text-center">
                                                    <button 
                                                        onClick={() => { setSelectedPayment(payment); setIsDetailModalOpen(true); }}
                                                        className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-[#006c49] hover:bg-[#006c49]/10 rounded-full transition-colors" title="Xem chi tiết">
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

                    {/* PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 text-sm text-gray-500">
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
                                        className={`px-3 py-1 rounded transition ${currentPage === page ? 'bg-[#006c49] text-white font-bold' : 'border hover:bg-gray-50'}`}
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

            {/* MODAL CHI TIẾT THANH TOÁN */}
            {isDetailModalOpen && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden zoom-in-95 duration-200">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Chi Tiết Giao Dịch</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Mã Giao Dịch</span>
                                <span className="font-bold text-gray-800">{selectedPayment.id}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Đơn Hàng</span>
                                <span className="font-bold text-[#006c49]">{selectedPayment.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Khách Hàng</span>
                                <span className="font-bold text-gray-800">{selectedPayment.customerName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Số Tiền</span>
                                <span className="font-black text-emerald-600 text-lg">{selectedPayment.amount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Phương Thức</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">{getMethodIcon(selectedPayment.method)}</span>
                                    <span className="font-semibold text-gray-800">{selectedPayment.method}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-gray-500 font-semibold text-sm">Thời Gian</span>
                                <span className="font-medium text-gray-800">{new Date(selectedPayment.date).toLocaleString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-gray-500 font-semibold text-sm">Trạng Thái</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(selectedPayment.status)}`}>
                                    {getStatusLabel(selectedPayment.status)}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors shadow-sm">
                                Đóng
                            </button>
                            {['SUCCESS', 'PENDING'].includes(selectedPayment.status) && (
                                <button 
                                    onClick={() => {
                                        alert(`Đã tạo yêu cầu giao hàng cho đơn vị vận chuyển (Mã đơn: ${selectedPayment.orderId})!`);
                                        setIsDetailModalOpen(false);
                                    }} 
                                    className="px-6 py-2 rounded-xl bg-[#006c49] text-white font-bold hover:bg-[#005236] transition-colors shadow-md flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                    Giao hàng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}