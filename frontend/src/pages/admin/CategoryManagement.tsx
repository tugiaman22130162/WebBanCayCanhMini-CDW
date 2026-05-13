import React, { useState, useMemo, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";


type Category = {
    id: number;
    name: string;
    description: string;
    productCount: number;
    image: string;
};

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCategories: 0,
        totalProducts: 0,
        activeProducts: 0
    });
    

    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // States Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
    const [originalCategory, setOriginalCategory] = useState<Partial<Category>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilter, setCurrentFilter] = useState<'ALL' | 'ACTIVE' | 'EMPTY'>('ALL');
    const [tempFilter, setTempFilter] = useState<'ALL' | 'ACTIVE' | 'EMPTY'>('ALL');

    useEffect(() => {
        fetchCategories();
        fetchStatistics();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            // Lấy cả danh sách danh mục và sản phẩm để tự đếm số lượng
            const [categoriesRes, productsRes] = await Promise.all([
                axios.get("http://localhost:8080/api/categories"),
                axios.get("http://localhost:8080/api/products").catch(() => ({ data: [] }))
            ]);

            const products = productsRes.data;

            const formattedData = categoriesRes.data.map((item: any) => {
                // Đếm số sản phẩm thuộc danh mục này
                const count = products.filter((p: any) => 
                    p.category?.id === item.id || 
                    p.categoryName === item.name ||
                    p.category?.name === item.name ||
                    p.category === item.name
                ).length;

                return {
                    id: item.id,
                    name: item.name,
                    description: item.description || "",
                    productCount: item.productCount || item.products?.length || count,
                    image: item.image_url || item.image || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"
                };
            });
            setCategories(formattedData.sort((a: any, b: any) => a.id - b.id));
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/categories/statistics");
            setStats(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy thống kê danh mục:", error);
        }
    };


    // Xử lý Lọc
    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchFilter = currentFilter === 'ALL' 
                ? true 
                : currentFilter === 'ACTIVE' 
                    ? cat.productCount > 0 
                    : cat.productCount === 0;
            return matchFilter;
        });
    }, [categories, currentFilter]);

    const handleApplyFilter = () => {
        setCurrentFilter(tempFilter);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setTempFilter('ALL');
        setCurrentFilter('ALL');
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

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
    const { totalCategories, activeProducts, activeCategories, totalProducts } = stats as any;
    const activeCount = activeProducts !== undefined ? activeProducts : activeCategories;
    const hiddenProducts = Math.max(0, totalProducts - (activeCount || 0));

    const showToast = (icon: 'success' | 'error', title: string) => {
        Swal.fire({
            toast: true,
            position: 'bottom',
            icon: icon,
            title: title,
            timer: 2000,
            showConfirmButton: false,
            width: 'auto',
            padding: '0.5em 1em',
            customClass: {
                popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                title: 'text-sm font-bold text-gray-700',
            }
        });
    };

    // Handlers
    const handleExport = async () => {
        try {
            Swal.fire({
                toast: true,
                position: 'bottom',
                title: 'Đang xuất file Excel...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: {
                    popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                    title: 'text-sm font-bold text-gray-700',
                }
            });

            const token = localStorage.getItem('token'); // Thêm token vào
            const response = await axios.get('http://localhost:8080/api/categories/export', {
                responseType: 'blob', 
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Danh_Sach_Danh_Muc_${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.close();
            showToast('success', 'Xuất file Excel thành công!');
        } catch (error) {
            Swal.close();
            showToast('error', 'Có lỗi xảy ra khi xuất file!');
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
                position: 'bottom',
                title: 'Đang nạp dữ liệu...',
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
                customClass: {
                    popup: 'mb-6 rounded-full shadow-lg border border-gray-100',
                    title: 'text-sm font-bold text-gray-700',
                }
            });

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8080/api/categories/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });

            Swal.close();
            showToast('success', 'Nhập danh mục từ Excel thành công!');
            fetchCategories();
            fetchStatistics();
        } catch (error: any) {
            Swal.close();
            showToast('error', error.response?.data?.error || 'Vui lòng kiểm tra lại định dạng file!');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleOpenAddModal = () => {
        setModalMode('ADD');
        setCurrentCategory({ name: "", description: "", image: "" });
        setOriginalCategory({});
        setImageFile(null);
        setImagePreview("");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setModalMode('EDIT');
        setCurrentCategory({ ...category });
        setOriginalCategory({ ...category });
        setImageFile(null);
        setImagePreview(category.image || "");
        setIsModalOpen(true);
    };

    // Tính toán xem có sự thay đổi dữ liệu nào không
    const hasChanges = useMemo(() => {
        if (modalMode === 'ADD') {
            return (currentCategory.name?.trim() || '') !== '';
        }
        return currentCategory.name !== originalCategory.name ||
            (currentCategory.description || "") !== (originalCategory.description || "") ||
            currentCategory.image !== originalCategory.image ||
            imageFile !== null;
    }, [currentCategory, originalCategory, imageFile, modalMode]);

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();

        // Bỏ qua nếu đang sửa mà không có dữ liệu nào thay đổi
        if (modalMode === 'EDIT') {
            const isChanged = 
                currentCategory.name !== originalCategory.name ||
                (currentCategory.description || "") !== (originalCategory.description || "") ||
                currentCategory.image !== originalCategory.image ||
                imageFile !== null; // Nếu có chọn ảnh mới thì là có thay đổi
            
            if (!isChanged) {
                setIsModalOpen(false); // Chỉ đóng form lại, không báo gì cả
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            
            const payload = {
                name: currentCategory.name,
                description: currentCategory.description,
                image_url: currentCategory.image || ""
            };

            const formData = new FormData();
            formData.append(
                "category", 
                new Blob([JSON.stringify(payload)], { type: "application/json" })
            );

            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (modalMode === 'ADD') {
                await axios.post("http://localhost:8080/api/categories", formData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
                });
                showToast('success', "Thêm danh mục thành công!");
            } else {
                await axios.put(`http://localhost:8080/api/categories/${currentCategory.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
                });
                showToast('success', "Cập nhật danh mục thành công!");
            }
            setIsModalOpen(false);
            fetchCategories();
            fetchStatistics(); // Làm mới số liệu thống kê sau khi lưu
        } catch (error) {
            console.error("Lỗi khi lưu danh mục:", error);
            showToast('error', "Có lỗi xảy ra khi lưu danh mục.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete !== null) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/categories/${categoryToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('success', "Xóa danh mục thành công!");
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
                fetchCategories();
                fetchStatistics(); // Làm mới số liệu thống kê sau khi xóa
            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                showToast('error', "Có lỗi xảy ra khi xóa danh mục.");
            }
        }
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Danh Mục</h2>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImportExcel}
                                accept=".xlsx, .xls"
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">upload</span> Nhập
                            </button>
                            <button onClick={handleExport} className="px-4 py-2.5 flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">download</span> Xuất
                            </button>
                            {/* Nút Bộ Lọc */}
                            <div className="relative">
                                <button 
                                    onClick={() => { setTempFilter(currentFilter); setIsFilterPanelOpen(!isFilterPanelOpen); }}
                                    className="px-4 py-2.5 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-200 text-sm font-semibold text-gray-700"
                                >
                                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    Bộ lọc
                                </button>

                                {/* Popup Bộ Lọc */}
                                {isFilterPanelOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                            <h4 className="font-bold text-gray-800">Lọc danh mục</h4>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-xl">close</span>
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái sản phẩm</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'ACTIVE', 'EMPTY'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={tempFilter === status}
                                                                onChange={(e) => setTempFilter(e.target.value as any)}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                                                            />
                                                            <span className="text-gray-700">{status === 'ALL' ? 'Tất cả' : status === 'ACTIVE' ? 'Đang có sản phẩm' : 'Trống (Không có SP)'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-3 flex justify-end gap-2 rounded-b-2xl border-t border-gray-100">
                                            <button onClick={handleClearFilter} className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white hover:bg-gray-100 transition text-gray-700">Xóa lọc</button>
                                            <button onClick={handleApplyFilter} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-[#2f5146] transition">Áp dụng</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button onClick={handleOpenAddModal} className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold hover:bg-[#2f5146] transition-colors shadow-sm whitespace-nowrap">
                                Thêm Danh Mục
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                                <p className="text-sm font-semibold text-gray-500 mb-1">Sản phẩm hoạt động</p>
                                <h3 className="text-3xl font-black text-blue-600">{activeCount || 0}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Sản phẩm đang ẩn</p>
                                <h3 className="text-3xl font-black text-gray-600">{hiddenProducts}</h3>
                            </div>
                            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">visibility_off</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng sản phẩm</p>
                                <h3 className="text-3xl font-black text-purple-600">{totalProducts}</h3>
                            </div>
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">inventory_2</span>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6 w-16">ID</th>
                                        <th className="text-left p-4 w-1/4">Danh Mục</th>
                                        <th className="text-left p-4">Mô tả</th>
                                        <th className="text-center p-4 w-32">Số sản phẩm</th>
                                        <th className="text-right p-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Đang tải dữ liệu...</td></tr>
                                    ) : paginatedCategories.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Không tìm thấy danh mục nào.</td>
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
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden zoom-in-95 duration-200">
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
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Hình ảnh</label>
                                <div className="relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-colors border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                const file = e.target.files[0];
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }} 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    />
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-700">Kéo thả hoặc click để tải ảnh lên</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                                    </div>
                                </div>
                                {imagePreview && (
                                    <div className="mt-4 relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button" 
                                                onClick={() => { 
                                                    setImageFile(null); 
                                                    setImagePreview(""); 
                                                    setCurrentCategory(prev => ({ ...prev, image: "" }));
                                                }} 
                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                title="Xóa ảnh"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                            <div className="pt-4 mt-2 border-t flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" disabled={isSubmitting || !hasChanges} className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-primary/30">
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                                            Đang Lưu...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">save</span>
                                            {modalMode === 'ADD' ? 'Lưu danh mục' : 'Lưu thay đổi'}
                                        </>
                                    )}
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
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleDeleteConfirm} className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-md">
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}