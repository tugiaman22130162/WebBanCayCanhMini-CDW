import React, { useState, useMemo } from "react";

interface OrderHistoryProps {
    orders: any[];
    onViewDetails: (order: any) => void;
}

export default function OrderHistory({ orders, onViewDetails }: OrderHistoryProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Lấy những đơn hàng đã hoàn tất vòng đời (Đã giao hoặc Đã hủy) và lọc theo từ khóa tìm kiếm
    const historyOrders = useMemo(() => {
        return orders.filter(o => {
            const isCompletedOrCanceled = o.status === 'Đã giao' || o.status === 'Đã hủy';
            if (!isCompletedOrCanceled) return false;

            if (searchTerm.trim() === "") return true;

            const term = searchTerm.toLowerCase();
            const matchId = String(o.id).toLowerCase().includes(term);
            const matchProductName = o.items?.some((item: any) => 
                item.name?.toLowerCase().includes(term)
            );

            return matchId || matchProductName;
        });
    }, [orders, searchTerm]);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-100 pb-4 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 whitespace-nowrap">Lịch Sử Mua Hàng</h2>
                <div className="relative w-full sm:flex-1 sm:max-w-3xl sm:ml-4">
                    <input 
                        type="text" 
                        placeholder="Tìm theo mã đơn, tên sản phẩm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-gray-50 focus:bg-white"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">search</span>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center outline-none"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
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
                        {historyOrders.length > 0 ? (
                            historyOrders.map((order, i) => (
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
                                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Bạn chưa có lịch sử mua hàng.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}