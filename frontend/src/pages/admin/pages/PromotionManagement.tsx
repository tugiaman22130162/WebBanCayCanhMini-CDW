import React, { useState, useMemo, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

type PromoType = 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCT' | 'SHIPPING';
type PromoStatus = 'ACTIVE' | 'EXPIRED' | 'HIDDEN';

type Promotion = {
    id: number;
    code: string;
    type: PromoType;
    value: number; 
    valueType: 'PERCENT' | 'FIXED';
    targetProduct?: string; 
    expiryDate: string;
    status: PromoStatus;
};

// Mock Data giả lập
const initialPromos: Promotion[] = [
    { id: 1, code: "MINIGARDEN10", type: 'ALL_PRODUCTS', value: 10, valueType: 'PERCENT', expiryDate: "2026-12-31", status: 'ACTIVE' },
    { id: 2, code: "FREESHIP", type: 'SHIPPING', value: 30000, valueType: 'FIXED', expiryDate: "2026-05-01", status: 'ACTIVE' },
    { id: 3, code: "SENDA20", type: 'SPECIFIC_PRODUCT', value: 20, valueType: 'PERCENT', targetProduct: "Sen đá mix color", expiryDate: "2026-04-30", status: 'ACTIVE' },
    { id: 4, code: "TET2026", type: 'ALL_PRODUCTS', value: 50000, valueType: 'FIXED', expiryDate: "2026-02-20", status: 'EXPIRED' },
];

export default function PromotionManagement() {
    const [promotions, setPromotions] = useState<Promotion[]>(initialPromos);
    
    // States bộ lọc
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<{type: PromoType | 'ALL', status: PromoStatus | 'ALL'}>({ type: 'ALL', status: 'ALL' });
    const [tempFilters, setTempFilters] = useState<{type: PromoType | 'ALL', status: PromoStatus | 'ALL'}>({ type: 'ALL', status: 'ALL' });
    
    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // States Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [currentPromo, setCurrentPromo] = useState<Partial<Promotion>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState<number | null>(null);

    // Xử lý Lọc
    const filteredPromos = useMemo(() => {
        return promotions.filter(promo => {
            const matchType = currentFilters.type === 'ALL' || promo.type === currentFilters.type;
            const matchStatus = currentFilters.status === 'ALL' || promo.status === currentFilters.status;
            return matchType && matchStatus;
        });
    }, [promotions, currentFilters]);

    // Xử lý Phân trang
    const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
    const paginatedPromos = filteredPromos.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // Đảm bảo không bị kẹt ở trang trống khi xóa/lọc
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Thống kê
    const totalPromos = promotions.length;
    const activePromos = promotions.filter(p => p.status === 'ACTIVE').length;
    const shippingPromos = promotions.filter(p => p.type === 'SHIPPING' && p.status === 'ACTIVE').length;

    // Handlers
    const handleExport = () => {
        alert("Đã xuất danh sách mã khuyến mãi ra file Excel thành công!");
    };

    const handleImport = () => {
        alert("Đã nhập dữ liệu mã khuyến mãi từ file thành công!");
    };

    const handleOpenAddModal = () => {
        setModalMode('ADD');
        setCurrentPromo({ 
            code: "", 
            type: 'ALL_PRODUCTS', 
            value: 0, 
            valueType: 'PERCENT', 
            expiryDate: "", 
            status: 'ACTIVE' 
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (promo: Promotion) => {
        setModalMode('EDIT');
        setCurrentPromo({ ...promo });
        setIsModalOpen(true);
    };

    const handleSavePromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'ADD') {
            const newId = promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1;
            const newPromo: Promotion = {
                id: newId,
                code: (currentPromo.code || "").toUpperCase(),
                type: currentPromo.type || 'ALL_PRODUCTS',
                value: Number(currentPromo.value) || 0,
                valueType: currentPromo.valueType || 'PERCENT',
                targetProduct: currentPromo.type === 'SPECIFIC_PRODUCT' ? currentPromo.targetProduct : undefined,
                expiryDate: currentPromo.expiryDate || "",
                status: currentPromo.status || 'ACTIVE'
            };
            setPromotions([newPromo, ...promotions]);
        } else {
            setPromotions(promotions.map(p => p.id === currentPromo.id ? { 
                ...p, 
                ...currentPromo,
                code: (currentPromo.code || "").toUpperCase(),
                targetProduct: currentPromo.type === 'SPECIFIC_PRODUCT' ? currentPromo.targetProduct : undefined,
            } as Promotion : p));
        }
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (promoToDelete !== null) {
            setPromotions(promotions.filter(p => p.id !== promoToDelete));
            setIsDeleteModalOpen(false);
            setPromoToDelete(null);
        }
    };

    const handleApplyFilters = () => {
        setCurrentFilters(tempFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = { type: 'ALL' as const, status: 'ALL' as const };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    // Helpers hiển thị
    const getTypeLabel = (type: PromoType) => {
        switch (type) {
            case 'ALL_PRODUCTS': return { label: 'Toàn shop', icon: 'storefront', color: 'text-blue-600 bg-blue-50' };
            case 'SPECIFIC_PRODUCT': return { label: 'Sản phẩm cụ thể', icon: 'local_mall', color: 'text-purple-600 bg-purple-50' };
            case 'SHIPPING': return { label: 'Vận chuyển', icon: 'local_shipping', color: 'text-emerald-600 bg-emerald-50' };
        }
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Khuyến Mãi</h2>
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setTempFilters(currentFilters);
                                        setIsFilterPanelOpen(true);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100"
                                >
                                    <span className="material-symbols-outlined text-lg">filter_list</span>
                                    Bộ lọc
                                </button>

                                {isFilterPanelOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-5 border-b">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-gray-800">Bộ lọc</h4>
                                                <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition">
                                                    <span className="material-symbols-outlined text-xl">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Loại khuyến mãi</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'ALL_PRODUCTS', 'SPECIFIC_PRODUCT', 'SHIPPING'] as const).map(type => (
                                                        <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="type"
                                                                value={type}
                                                                checked={tempFilters.type === type}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value as any })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{type === 'ALL' ? 'Tất cả' : type === 'ALL_PRODUCTS' ? 'Toàn shop' : type === 'SPECIFIC_PRODUCT' ? 'Sản phẩm cụ thể' : 'Vận chuyển'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'ACTIVE', 'EXPIRED', 'HIDDEN'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={tempFilters.status === status}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as any })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{status === 'ALL' ? 'Tất cả' : status === 'ACTIVE' ? 'Hoạt động' : status === 'EXPIRED' ? 'Hết hạn' : 'Đang ẩn'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                                            <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white hover:bg-gray-100 transition">Xóa lọc</button>
                                            <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-[#2f5146] transition">Áp dụng</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleOpenAddModal} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-[#2f5146] transition-colors shadow-sm">
                                Tạo mã mới
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng mã khuyến mãi</p>
                                <h3 className="text-3xl font-black text-gray-800">{totalPromos}</h3>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">confirmation_number</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Mã đang hoạt động</p>
                                <h3 className="text-3xl font-black text-blue-600">{activePromos}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Mã Freeship</p>
                                <h3 className="text-3xl font-black text-emerald-600">{shippingPromos}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">local_shipping</span>
                            </div>
                        </div>
                    </div>

                    {/* TOOLBAR */}
                    <div className="bg-white p-4 rounded-t-2xl border border-gray-100 border-b-0 flex justify-end gap-4 items-center">
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                            <button onClick={handleImport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span> Nhập
                            </button>
                            <button onClick={handleExport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">download</span> Xuất
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6">Mã (Code)</th>
                                        <th className="text-left p-4">Loại Khuyến Mãi</th>
                                        <th className="text-left p-4">Mức Giảm</th>
                                        <th className="text-left p-4">Hạn Sử Dụng</th>
                                        <th className="text-left p-4">Trạng thái</th>
                                        <th className="text-right p-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedPromos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">Không tìm thấy mã khuyến mãi nào.</td>
                                        </tr>
                                    ) : (
                                        paginatedPromos.map((promo) => {
                                            const typeInfo = getTypeLabel(promo.type);
                                            return (
                                            <tr key={promo.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <span className="font-black text-[#406D5E] bg-[#E8F1EE] px-3 py-1.5 rounded-lg border border-[#406D5E]/20">{promo.code}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                                                            <span className="material-symbols-outlined text-[18px]">{typeInfo.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{typeInfo.label}</p>
                                                            {promo.type === 'SPECIFIC_PRODUCT' && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[150px]">{promo.targetProduct}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-800">
                                                    {promo.valueType === 'PERCENT' ? `${promo.value}%` : `${promo.value.toLocaleString('vi-VN')}đ`}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 font-medium">
                                                    {new Date(promo.expiryDate).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                                        promo.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-100' : 
                                                        promo.status === 'EXPIRED' ? 'text-red-700 bg-red-100' : 
                                                        'text-gray-700 bg-gray-100'
                                                    }`}>
                                                        {promo.status === 'ACTIVE' ? 'Hoạt động' : promo.status === 'EXPIRED' ? 'Hết hạn' : 'Đang ẩn'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => handleOpenEditModal(promo)} className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition" title="Chỉnh sửa">
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-gray-500 group-hover:text-primary transition-colors">edit</span>
                                                    </button>
                                                    <button onClick={() => {setPromoToDelete(promo.id); setIsDeleteModalOpen(true);}} className="group px-2 py-1 text-sm rounded hover:bg-red-50 transition" title="Xóa">
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-red-500 group-hover:text-red-700 transition-colors">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        )})
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

            {/* MODAL THÊM/SỬA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden zoom-in-95 duration-200">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {modalMode === 'ADD' ? 'Tạo Mã Khuyến Mãi Mới' : 'Chỉnh Sửa Mã Khuyến Mãi'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSavePromo} className="p-6 space-y-4">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Mã Khuyến Mãi (Code) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required
                                        value={currentPromo.code || ''}
                                        onChange={(e) => setCurrentPromo({...currentPromo, code: e.target.value})}
                                        placeholder="VD: FREESHIP, SALE20..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] uppercase"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Loại Khuyến Mãi <span className="text-red-500">*</span></label>
                                    <select 
                                        value={currentPromo.type || 'ALL_PRODUCTS'}
                                        onChange={(e) => setCurrentPromo({...currentPromo, type: e.target.value as PromoType})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] bg-white cursor-pointer"
                                    >
                                        <option value="ALL_PRODUCTS">Cho tất cả sản phẩm (Toàn shop)</option>
                                        <option value="SPECIFIC_PRODUCT">Cho từng sản phẩm (Sản phẩm cụ thể)</option>
                                        <option value="SHIPPING">Mã vận chuyển (Freeship)</option>
                                    </select>
                                </div>

                                {currentPromo.type === 'SPECIFIC_PRODUCT' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm áp dụng <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            required
                                            value={currentPromo.targetProduct || ''}
                                            onChange={(e) => setCurrentPromo({...currentPromo, targetProduct: e.target.value})}
                                            placeholder="VD: Sen đá mix color..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Kiểu giảm</label>
                                    <select 
                                        value={currentPromo.valueType || 'PERCENT'}
                                        onChange={(e) => setCurrentPromo({...currentPromo, valueType: e.target.value as 'PERCENT' | 'FIXED'})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] bg-white cursor-pointer"
                                    >
                                        <option value="PERCENT">Phần trăm (%)</option>
                                        <option value="FIXED">Số tiền cố định (VNĐ)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Mức giảm <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        required
                                        value={currentPromo.value || ''}
                                        onChange={(e) => setCurrentPromo({...currentPromo, value: Number(e.target.value)})}
                                        placeholder={currentPromo.valueType === 'PERCENT' ? "VD: 10" : "VD: 30000"}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Hạn sử dụng <span className="text-red-500">*</span></label>
                                    <input 
                                        type="date" 
                                        required
                                        value={currentPromo.expiryDate || ''}
                                        onChange={(e) => setCurrentPromo({...currentPromo, expiryDate: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Trạng thái</label>
                                    <select 
                                        value={currentPromo.status || 'ACTIVE'}
                                        onChange={(e) => setCurrentPromo({...currentPromo, status: e.target.value as PromoStatus})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] bg-white cursor-pointer"
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="HIDDEN">Đang ẩn</option>
                                        <option value="EXPIRED">Đã hết hạn</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-[#406D5E] text-white font-bold hover:bg-[#2f5146] transition-colors shadow-md">
                                    {modalMode === 'ADD' ? 'Tạo mã' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN XÓA */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Bạn có chắc chắn muốn xóa mã khuyến mãi này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleDeleteConfirm} className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-md">
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}