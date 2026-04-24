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
};

// Mock Data giả lập
const initialCategories: Category[] = [
    { id: 1, name: "Sen đá", description: "Các loại sen đá mini để bàn, dễ chăm sóc.", productCount: 45, status: 'ACTIVE' },
    { id: 2, name: "Terrarium", description: "Hệ sinh thái thu nhỏ trong bình kính thủy tinh.", productCount: 12, status: 'ACTIVE' },
    { id: 3, name: "Cây để bàn", description: "Cây xanh trang trí bàn làm việc, văn phòng.", productCount: 30, status: 'ACTIVE' },
    { id: 4, name: "Chậu gốm sứ", description: "Các loại chậu trồng cây bằng gốm sứ cao cấp.", productCount: 50, status: 'ACTIVE' },
    { id: 5, name: "Phân bón & Đất", description: "Phụ kiện chăm sóc cây trồng chuyên dụng.", productCount: 15, status: 'HIDDEN' },
    { id: 6, name: "Cây phong thủy", description: "Cây mang lại tài lộc, may mắn cho gia chủ.", productCount: 22, status: 'ACTIVE' },
    { id: 7, name: "Dụng cụ làm vườn", description: "Kéo, xẻng, bình tưới nước mini.", productCount: 8, status: 'HIDDEN' },
];

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    
    // States cho bộ lọc & tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<CategoryStatus | 'ALL'>('ALL');
    
    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // States Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    // Xử lý Lọc & Tìm kiếm
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                cat.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || cat.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [categories, searchTerm, statusFilter]);

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
        setCurrentCategory({ name: "", description: "", status: 'ACTIVE' });
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
                status: currentCategory.status as CategoryStatus || 'ACTIVE'
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

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-2 text-gray-800">Quản Lý Danh Mục</h2>
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
                    <div className="bg-white p-4 rounded-t-2xl border border-gray-100 border-b-0 flex flex-col lg:flex-row justify-between gap-4 items-center">
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Search */}
                            <div className="relative w-full sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm danh mục..." 
                                    value={searchTerm}
                                    onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] outline-none text-sm transition-all"
                                />
                            </div>
                            {/* Filter */}
                            <select 
                                value={statusFilter}
                                onChange={(e) => {setStatusFilter(e.target.value as CategoryStatus | 'ALL'); setCurrentPage(1);}}
                                className="px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#406D5E] focus:ring-1 outline-none text-sm font-semibold text-gray-700 cursor-pointer"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="HIDDEN">Đang ẩn</option>
                            </select>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
                            <button onClick={handleImport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span> Nhập
                            </button>
                            <button onClick={handleExport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">download</span> Xuất
                            </button>
                            <button onClick={handleOpenAddModal} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-[#406D5E] text-white font-bold text-sm hover:bg-[#2f5146] transition-colors shadow-md">
                                <span className="material-symbols-outlined text-[18px]">add</span> Thêm mới
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
                                        <th className="text-left p-4 w-1/4">Tên Danh Mục</th>
                                        <th className="text-left p-4">Mô tả</th>
                                        <th className="text-center p-4 w-32">Số sản phẩm</th>
                                        <th className="text-center p-4 w-36">Trạng thái</th>
                                        <th className="text-right p-4 pr-6 w-28">Thao tác</th>
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
                                                <td className="p-4 font-bold text-[#406D5E]">{category.name}</td>
                                                <td className="p-4 text-sm text-gray-600 truncate max-w-[250px]">{category.description || "—"}</td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                                        {category.productCount}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${category.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                        {category.status === 'ACTIVE' ? 'Hoạt động' : 'Đang ẩn'}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    <button onClick={() => handleOpenEditModal(category)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button onClick={() => {setCategoryToDelete(category.id); setIsDeleteModalOpen(true);}} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCategories.length)} trong {filteredCategories.length}
                                </span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                        disabled={currentPage === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button 
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === page ? 'bg-[#406D5E] text-white border border-[#406D5E]' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={currentPage === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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