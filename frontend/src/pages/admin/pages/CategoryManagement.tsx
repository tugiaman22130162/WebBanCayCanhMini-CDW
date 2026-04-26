import React, { useState, useMemo } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

type CategoryStatus = 'ACTIVE' | 'HIDDEN';

type Category = {
    id: number;
    name: string;
    description: string;
    productCount: number;
    status: CategoryStatus;
    image: string;
};

// Mock Data giả lập
const initialCategories: Category[] = [
    { id: 1, name: "Sen đá", description: "Các loại sen đá mini để bàn, dễ chăm sóc.", productCount: 45, status: 'ACTIVE', image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=100&h=100&fit=crop" },
    { id: 2, name: "Terrarium", description: "Hệ sinh thái thu nhỏ trong bình kính thủy tinh.", productCount: 12, status: 'ACTIVE', image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=100&h=100&fit=crop" },
    { id: 3, name: "Cây để bàn", description: "Cây xanh trang trí bàn làm việc, văn phòng.", productCount: 30, status: 'ACTIVE', image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&h=100&fit=crop" },
    { id: 4, name: "Chậu gốm sứ", description: "Các loại chậu trồng cây bằng gốm sứ cao cấp.", productCount: 50, status: 'ACTIVE', image: "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop" },
    { id: 5, name: "Phân bón & Đất", description: "Phụ kiện chăm sóc cây trồng chuyên dụng.", productCount: 15, status: 'HIDDEN', image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=100&h=100&fit=crop" },
    { id: 6, name: "Cây phong thủy", description: "Cây mang lại tài lộc, may mắn cho gia chủ.", productCount: 22, status: 'ACTIVE', image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=100&h=100&fit=crop" },
    { id: 7, name: "Dụng cụ làm vườn", description: "Kéo, xẻng, bình tưới nước mini.", productCount: 8, status: 'HIDDEN', image: "https://images.unsplash.com/photo-1416879598553-3b2d18919af4?w=100&h=100&fit=crop" },
];

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    
    // States quản lý Bộ lọc
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({ status: 'ALL' });
    const [tempFilters, setTempFilters] = useState({ status: 'ALL' });

    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // States Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    // Xử lý Lọc
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchStatus = currentFilters.status === 'ALL' || cat.status === currentFilters.status;
            return matchStatus;
        });
    }, [categories, currentFilters]);

    // Xử lý Phân trang
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    // Đảm bảo không bị kẹt ở trang trống khi xóa/lọc
    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Thống kê
    const totalCategories = categories.length;
    const activeCategories = categories.filter(c => c.status === 'ACTIVE').length;
    const hiddenCategories = categories.filter(c => c.status === 'HIDDEN').length;

    // Handlers
    const handleExport = () => {
        alert("Đã xuất danh sách danh mục ra file Excel thành công!");
    };

    const handleImport = () => {
        alert("Đã nhập dữ liệu danh mục từ file thành công!");
    };

    const handleOpenAddModal = () => {
        setModalMode('ADD');
        setCurrentCategory({ name: "", description: "", status: 'ACTIVE', image: "" });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setModalMode('EDIT');
        setCurrentCategory({ ...category });
        setIsModalOpen(true);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (modalMode === 'ADD') {
            const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
            const newCat: Category = {
                id: newId,
                name: currentCategory.name || "Danh mục mới",
                description: currentCategory.description || "",
                productCount: 0,
            status: currentCategory.status as CategoryStatus || 'ACTIVE',
            image: currentCategory.image || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"
            };
            setCategories([newCat, ...categories]);
        } else {
            setCategories(categories.map(c => c.id === currentCategory.id ? { ...c, ...currentCategory } as Category : c));
        }
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (categoryToDelete !== null) {
            setCategories(categories.filter(c => c.id !== categoryToDelete));
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleApplyFilters = () => {
        setCurrentFilters(tempFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        const clearedFilters = { status: 'ALL' };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Danh Mục</h2>
                        
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
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'ACTIVE', 'HIDDEN'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={tempFilters.status === status}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{status === 'ALL' ? 'Tất cả' : status === 'ACTIVE' ? 'Hoạt động' : 'Đang ẩn'}</span>
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
                                Thêm Danh Mục
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng danh mục</p>
                                <h3 className="text-3xl font-black text-[#406D5E]">{totalCategories}</h3>
                            </div>
                            <div className="w-12 h-12 bg-emerald-50 text-[#406D5E] rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">category</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đang hoạt động</p>
                                <h3 className="text-3xl font-black text-blue-600">{activeCategories}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đang ẩn</p>
                                <h3 className="text-3xl font-black text-gray-600">{hiddenCategories}</h3>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">visibility_off</span>
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
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6 w-16">ID</th>
                                        <th className="text-left p-4 w-1/4">Danh Mục</th>
                                        <th className="text-left p-4">Mô tả</th>
                                        <th className="text-center p-4 w-32">Số sản phẩm</th>
                                        <th className="text-left p-4">Trạng thái</th>
                                        <th className="text-right p-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">Không tìm thấy danh mục nào.</td>
                                        </tr>
                                    ) : (
                                        paginatedCategories.map((category) => (
                                            <tr key={category.id} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-gray-700">#{category.id}</td>
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                                                    <span className="font-bold text-[#406D5E]">{category.name}</span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 truncate max-w-[250px]">{category.description || "—"}</td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        {category.productCount}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${category.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-100' : 'text-gray-700 bg-gray-100'}`}>
                                                        {category.status === 'ACTIVE' ? 'Hoạt động' : 'Đang ẩn'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => handleOpenEditModal(category)} className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition" title="Chỉnh sửa">
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-gray-500 group-hover:text-primary transition-colors">edit</span>
                                                    </button>
                                                    <button onClick={() => {setCategoryToDelete(category.id); setIsDeleteModalOpen(true);}} className="group px-2 py-1 text-sm rounded hover:bg-red-50 transition" title="Xóa">
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-red-500 group-hover:text-red-700 transition-colors">delete</span>
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

            {/* MODAL THÊM/SỬA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden zoom-in-95 duration-200">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {modalMode === 'ADD' ? 'Thêm Danh Mục Mới' : 'Chỉnh Sửa Danh Mục'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Tên danh mục <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    required
                                    value={currentCategory.name || ''}
                                    onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                                    placeholder="VD: Cây phong thủy"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Hình ảnh (URL)</label>
                                <input 
                                    type="text" 
                                    value={currentCategory.image || ''}
                                    onChange={(e) => setCurrentCategory({...currentCategory, image: e.target.value})}
                                    placeholder="Nhập đường dẫn hình ảnh..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả</label>
                                <textarea 
                                    rows={3}
                                    value={currentCategory.description || ''}
                                    onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                                    placeholder="Nhập mô tả ngắn cho danh mục..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] resize-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Trạng thái</label>
                                <select 
                                    value={currentCategory.status || 'ACTIVE'}
                                    onChange={(e) => setCurrentCategory({...currentCategory, status: e.target.value as CategoryStatus})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] bg-white cursor-pointer"
                                >
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="HIDDEN">Đang ẩn</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-[#406D5E] text-white font-bold hover:bg-[#2f5146] transition-colors shadow-md">
                                    {modalMode === 'ADD' ? 'Tạo mới' : 'Lưu thay đổi'}
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
                            Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
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