import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AddPromotionModal from "../../components/admin/AddPromotionModal";
import EditPromotionModal from "../../components/admin/EditPromotionModal";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

type PromotionType = 'SHOP' | 'CATEGORY' | 'PRODUCT' | 'SHIPPING';
type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE';

type PromotionResponse = {
    id: number;
    name: string;
    description: string;
    type: PromotionType;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscountValue: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
    createdAt: string;
    targetId?: number;
    targetName?: string;
};

export default function PromotionManagement() {
    const [promotions, setPromotions] = useState<PromotionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // States bộ lọc
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<{type: PromotionType | 'ALL', isActive: 'ALL' | 'TRUE' | 'FALSE'}>({ type: 'ALL', isActive: 'ALL' });
    const [tempFilters, setTempFilters] = useState<{type: PromotionType | 'ALL', isActive: 'ALL' | 'TRUE' | 'FALSE'}>({ type: 'ALL', isActive: 'ALL' });
    
    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // States Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromotionResponse | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState<number | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
    const [products, setProducts] = useState<{id: number, name: string}[]>([]);

    useEffect(() => {
        fetchPromotions();
        fetchCategoriesAndProducts();
    }, []);

    const fetchCategoriesAndProducts = async () => {
        try {
            const [catRes, prodRes] = await Promise.all([
                axios.get("http://localhost:8080/api/categories").catch(() => ({ data: [] })),
                axios.get("http://localhost:8080/api/products").catch(() => ({ data: [] }))
            ]);
            setCategories(catRes.data.map((c: any) => ({ id: c.id, name: c.name })));
            setProducts(prodRes.data.map((p: any) => ({ id: p.id, name: p.name })));
        } catch (error) {
            console.error("Lỗi tải danh mục/sản phẩm", error);
        }
    };

    const fetchPromotions = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/promotions", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPromotions(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
            showErrorToast("Không thể tải danh sách khuyến mãi!", 2000);
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý Lọc
    const filteredPromos = useMemo(() => {
        return promotions.filter(promo => {
            const matchType = currentFilters.type === 'ALL' || promo.type === currentFilters.type;
            const matchStatus = currentFilters.isActive === 'ALL' || (currentFilters.isActive === 'TRUE' ? promo.isActive : !promo.isActive);
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
    const activePromos = promotions.filter(p => p.isActive).length;
    const shippingPromos = promotions.filter(p => p.type === 'SHIPPING' && p.isActive).length;

    // Handlers
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (promo: PromotionResponse) => {
        setEditingPromo(promo);
        setIsEditModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (promoToDelete !== null) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/promotions/${promoToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Xóa khuyến mãi thành công!", 2000);
                setIsDeleteModalOpen(false);
                setPromoToDelete(null);
                fetchPromotions();
            } catch (error) {
                console.error("Lỗi khi xóa khuyến mãi:", error);
                showErrorToast("Có lỗi xảy ra khi xóa khuyến mãi.", 2000);
            }
        }
    };

    const handleExport = async () => {
        try {
            Swal.fire({
                toast: true,
                position: 'top-end',
                title: 'Đang xuất file Excel...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: { popup: 'mb-6 rounded-full shadow-lg border border-gray-100', title: 'text-sm font-bold text-gray-700' }
            });

            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/promotions/export', {
                responseType: 'blob', 
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Danh_Sach_Khuyen_Mai_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.close();
            showSuccessToast('Xuất file Excel thành công!', 2000);
        } catch (error) {
            Swal.close();
            showErrorToast('Có lỗi xảy ra khi xuất file!', 2000);
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            Swal.fire({
                toast: true,
                position: 'top-end',
                title: 'Đang nạp dữ liệu...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: { popup: 'mb-6 rounded-full shadow-lg border border-gray-100', title: 'text-sm font-bold text-gray-700' }
            });

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/promotions/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            Swal.close();
            showSuccessToast('Nhập dữ liệu thành công!', 2000);
            fetchPromotions();
        } catch (error: any) {
            Swal.close();
            showErrorToast(error.response?.data?.error || 'Vui lòng kiểm tra lại định dạng file!', 2000);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleApplyFilters = () => {
        setCurrentFilters(tempFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = { type: 'ALL' as const, isActive: 'ALL' as const };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    // Helpers hiển thị
    const getTypeLabel = (type: PromotionType) => {
        switch (type) {
            case 'SHOP': return { label: 'Toàn shop', icon: 'storefront', color: 'text-blue-600 bg-blue-50' };
            case 'CATEGORY': return { label: 'Danh mục', icon: 'category', color: 'text-orange-600 bg-orange-50' };
            case 'PRODUCT': return { label: 'Sản phẩm cụ thể', icon: 'local_mall', color: 'text-purple-600 bg-purple-50' };
            case 'SHIPPING': return { label: 'Vận chuyển', icon: 'local_shipping', color: 'text-emerald-600 bg-emerald-50' };
            default: return { label: type, icon: 'sell', color: 'text-gray-600 bg-gray-50' };
        }
    };

    const getDiscountLabel = (type: DiscountType, value: number) => {
        switch (type) {
            case 'PERCENTAGE': return `${value}%`;
            case 'FIXED_AMOUNT': return `${value.toLocaleString('vi-VN')}đ`;
            case 'FREE': return `Miễn phí`;
            default: return `${value}`;
        }
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Khuyến Mãi</h2>
                        
                        <div className="flex gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImportExcel}
                                accept=".xlsx, .xls"
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100 text-sm font-semibold text-gray-700">
                                <span className="material-symbols-outlined text-[18px]">upload</span> Nhập
                            </button>
                            <button onClick={handleExport} className="px-4 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100 text-sm font-semibold text-gray-700">
                                <span className="material-symbols-outlined text-[18px]">download</span> Xuất
                            </button>
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
                                                    {(['ALL', 'SHOP', 'CATEGORY', 'PRODUCT', 'SHIPPING'] as const).map(type => (
                                                        <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="type"
                                                                value={type}
                                                                checked={tempFilters.type === type}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value as any })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{type === 'ALL' ? 'Tất cả' : type === 'SHOP' ? 'Toàn shop' : type === 'CATEGORY' ? 'Danh mục' : type === 'PRODUCT' ? 'Sản phẩm' : 'Vận chuyển'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'TRUE', 'FALSE'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="isActive"
                                                                value={status}
                                                                checked={tempFilters.isActive === status}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, isActive: e.target.value as any })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{status === 'ALL' ? 'Tất cả' : status === 'TRUE' ? 'Hoạt động' : 'Đang ẩn'}</span>
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
                                <p className="text-sm font-semibold text-gray-500 mb-1">Mã vận chuyển</p>
                                <h3 className="text-3xl font-black text-emerald-600">{shippingPromos}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">local_shipping</span>
                            </div>
                        </div>
                    </div>

                    {/* TOOLBAR */}
                    <div className="bg-white p-2 rounded-t-2xl border border-gray-100 border-b-0"></div>

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
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td></tr>
                                    ) : paginatedPromos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">Không tìm thấy mã khuyến mãi nào.</td>
                                        </tr>
                                    ) : (
                                        paginatedPromos.map((promo) => {
                                            const typeInfo = getTypeLabel(promo.type);
                                            const isExpired = new Date(promo.endDate) < new Date();
                                            return (
                                            <tr key={promo.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <span className="font-black text-[#406D5E] bg-[#E8F1EE] px-3 py-1.5 rounded-lg border border-[#406D5E]/20">{promo.name}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeInfo.color}`}>
                                                            <span className="material-symbols-outlined text-[18px]">{typeInfo.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm">{typeInfo.label}</p>
                                                            {promo.targetName && <p className="text-xs text-gray-500 mt-0.5 max-w-[150px] truncate" title={promo.targetName}>{promo.targetName}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-800">
                                                    {getDiscountLabel(promo.discountType, promo.discountValue)}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 font-medium">
                                                    {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                                                        !promo.isActive ? 'text-gray-700 bg-gray-100' : 
                                                        isExpired ? 'text-red-700 bg-red-100' : 
                                                        'text-emerald-700 bg-emerald-100'
                                                    }`}>
                                                        {!promo.isActive ? 'Đang ẩn' : isExpired ? 'Hết hạn' : 'Hoạt động'}
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

            <AddPromotionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchPromotions}
                categories={categories}
                products={products}
            />
            
            <EditPromotionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchPromotions}
                categories={categories}
                products={products}
                promoData={editingPromo}
            />

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