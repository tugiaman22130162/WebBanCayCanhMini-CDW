import React, { useState, useEffect } from "react";

interface MyOrdersProps {
    orders: any[];
    onViewDetails: (order: any) => void;
    onViewHistory: () => void;
}

export default function MyOrders({ orders, onViewDetails, onViewHistory }: MyOrdersProps) {
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('Tất cả');
    const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
    const ordersItemsPerPage = 5;

    useEffect(() => {
        setOrdersCurrentPage(1);
    }, [orderStatusFilter]);

    const filteredOrders = orders.filter(order =>
        orderStatusFilter === 'Tất cả' || order.status === orderStatusFilter
    );

    const ordersTotalPages = Math.ceil(filteredOrders.length / ordersItemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (ordersCurrentPage - 1) * ordersItemsPerPage,
        ordersCurrentPage * ordersItemsPerPage
    );

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 mb-[30px]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">Đơn Hàng Của Tôi</h2>
                <button
                    onClick={onViewHistory}
                    className="text-sm font-bold text-primary hover:text-primary-container transition-colors hover:underline"
                >Lịch sử mua hàng</button>
            </div>

            {/* THẺ TAB BỘ LỌC TRẠNG THÁI */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 mt-2 overflow-x-auto hide-scrollbar">
                <div className="relative flex justify-between items-center w-full min-w-[600px] max-w-3xl mx-auto px-4 sm:px-8">
                    {/* Thanh nền */}
                    <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 rounded-full"></div>

                    {/* Các mốc trạng thái */}
                    {[
                        { label: 'Tất cả', icon: 'apps' },
                        { label: 'Chờ xác nhận', icon: 'pending_actions' },
                        { label: 'Đã xác nhận', icon: 'task_alt' },
                        { label: 'Đang giao', icon: 'local_shipping' },
                        { label: 'Đã giao', icon: 'inventory' },
                        { label: 'Đã hủy', icon: 'cancel' }
                    ].map((step) => {
                        const isActive = orderStatusFilter === step.label;
                        const count = step.label === 'Tất cả' ? orders.length : orders.filter(o => o.status === step.label).length;
                        return (
                            <button
                                key={step.label}
                                onClick={() => setOrderStatusFilter(step.label)}
                                className="relative z-10 flex flex-col items-center gap-2 group outline-none"
                            >
                                <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'bg-primary border-primary/20 text-white shadow-md scale-110' : 'bg-white border-gray-200 text-gray-400 group-hover:border-primary/30 group-hover:text-primary'}`}>
                                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{step.icon}</span>
                                    {count > 0 && (step.label === 'Chờ xác nhận' || step.label === 'Đã xác nhận' || step.label === 'Đang giao') && (
                                        <span className={`absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 flex items-center justify-center text-[11px] font-black rounded-full shadow-md border-2 border-white transition-all duration-300 ${isActive ? 'bg-red-500 text-white scale-110' : 'bg-gray-400 text-white group-hover:bg-red-400 group-hover:scale-110'}`}>
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold absolute top-14 whitespace-nowrap transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`}>{step.label}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="h-6"></div> {/* Khoảng trống cho label */}
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                        <tr>
                            <th className="text-left p-4">Mã Đơn</th>
                            <th className="text-left p-4">Ngày Đặt</th>
                            <th className="text-right p-4">Tổng Tiền</th>
                            <th className="text-center p-4">Trạng Thái</th>
                            <th className="text-center p-4">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedOrders.length > 0 ? (
                            paginatedOrders.map((order, i) => (
                                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="p-4 font-bold text-[#406D5E]">{order.id}</td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">{order.date}</td>
                                    <td className="p-4 text-right font-bold text-gray-800">{order.total.toLocaleString('vi-VN')}đ</td>
                                    <td className="p-4 text-center">
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${order.statusColor}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => onViewDetails(order)}
                                            className="w-8 h-8 inline-flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors" title="Xem chi tiết"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Không có đơn hàng nào ở trạng thái này.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PHÂN TRANG */}
            {ordersTotalPages > 1 && (
                <div className="flex justify-center items-center mt-6 text-sm text-gray-500">
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            onClick={() => setOrdersCurrentPage(p => Math.max(1, p - 1))}
                            disabled={ordersCurrentPage === 1}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            ‹
                        </button>
                        {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setOrdersCurrentPage(page)}
                                className={`px-3 py-1 rounded transition ${ordersCurrentPage === page ? 'bg-primary text-white font-bold' : 'border hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setOrdersCurrentPage(p => Math.min(ordersTotalPages, p + 1))}
                            disabled={ordersCurrentPage === ordersTotalPages}
                            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}