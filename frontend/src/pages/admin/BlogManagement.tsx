import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AddBlogModal from "../../components/admin/AddBlogModal";
import EditBlogModal from "../../components/admin/EditBlogModal";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import { useSearchParams } from "react-router-dom";

type BlogStatus = 'ALL' | 'PUBLISHED' | 'DRAFT';
type BlogType = 'ALL' | 'TIPS' | 'TREND' | 'GUIDE' | 'PROMOTION' | 'DECOR';

interface Blog {
    id: number;
    title: string;
    thumbnail: string;
    slug: string;
    readingTime: number;
    type: string;
    published: boolean;
    createdAt: string;
}

export default function BlogManagement() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get("search") || "";
    const [statusFilter, setStatusFilter] = useState<BlogStatus>('ALL');
    const [typeFilter, setTypeFilter] = useState<BlogType>('ALL');

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ status: 'ALL' as BlogStatus, type: 'ALL' as BlogType });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState<number | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState<number | null>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/blogs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const formattedData = response.data.map((b: any) => ({
                id: b.id,
                title: b.title,
                thumbnail: b.thumbnail || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop",
                slug: b.slug,
                readingTime: b.readingTime,
                type: b.type,
                published: b.published,
                createdAt: b.createdAt
            }));
            
            // Sắp xếp theo ngày mới nhất
            formattedData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
            setBlogs(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách blog:", error);
            showErrorToast("Không thể tải danh sách bài viết", 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (blogToDelete !== null) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/blogs/${blogToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Xóa bài viết thành công!", 2000);
                setIsDeleteModalOpen(false);
                setBlogToDelete(null);
                fetchBlogs();
            } catch (error) {
                console.error("Lỗi khi xóa bài viết:", error);
                showErrorToast("Có lỗi xảy ra khi xóa", 2000);
            }
        }
    };

    const handleApplyFilters = () => {
        setStatusFilter(tempFilters.status);
        setTypeFilter(tempFilters.type);
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setTempFilters({ status: 'ALL', type: 'ALL' });
        setStatusFilter('ALL');
        setTypeFilter('ALL');
        setIsFilterPanelOpen(false);
        setCurrentPage(1);
    };

    const filteredBlogs = useMemo(() => {
        return blogs.filter(b => {
            const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                b.slug.toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'ALL' || (statusFilter === 'PUBLISHED' ? b.published : !b.published);
            const matchType = typeFilter === 'ALL' || b.type === typeFilter;
            return matchSearch && matchStatus && matchType;
        });
    }, [blogs, searchTerm, statusFilter, typeFilter]);

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusLabel = (published: boolean) => published ? 'Đã xuất bản' : 'Bản nháp';
    const getStatusColor = (published: boolean) => published ? 'text-emerald-700 bg-emerald-100' : 'text-gray-700 bg-gray-100';

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'TIPS': return 'Mẹo';
            case 'TREND': return 'Xu hướng';
            case 'GUIDE': return 'Hướng dẫn';
            case 'PROMOTION': return 'Khuyến mãi';
            case 'DECOR': return 'Trang trí';
            default: return type;
        }
    };

    return (
        <div className="h-screen bg-[#F8F9F5] text-gray-800 flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Bài Viết</h2>

                        <div className="flex gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setTempFilters({ status: statusFilter, type: typeFilter });
                                        setIsFilterPanelOpen(true);
                                    }}
                                    className="px-6 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100"
                                >
                                    <span className="material-symbols-outlined text-lg">filter_list</span>
                                    Bộ lọc
                                </button>

                                {isFilterPanelOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border z-20 animate-in fade-in slide-in-from-top-2">
                                        <div className="p-5 border-b flex justify-between items-center">
                                            <h4 className="font-bold text-gray-800">Bộ lọc</h4>
                                            <button onClick={() => setIsFilterPanelOpen(false)} className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition">
                                                <span className="material-symbols-outlined text-xl">close</span>
                                            </button>
                                        </div>
                                        <div className="p-5 space-y-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input type="radio" name="status" value={status} checked={tempFilters.status === status} onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value as any })} className="w-4 h-4 text-[#006c49] focus:ring-[#006c49] cursor-pointer" />
                                                            <span>{status === 'ALL' ? 'Tất cả' : status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Loại bài viết</label>
                                                <div className="space-y-2">
                                                    {(['ALL', 'TIPS', 'TREND', 'GUIDE', 'PROMOTION', 'DECOR'] as const).map(type => (
                                                        <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input type="radio" name="type" value={type} checked={tempFilters.type === type} onChange={(e) => setTempFilters({ ...tempFilters, type: e.target.value as any })} className="w-4 h-4 text-[#006c49] focus:ring-[#006c49] cursor-pointer" />
                                                            <span>{type === 'ALL' ? 'Tất cả' : getTypeLabel(type)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                                            <button onClick={handleClearFilters} className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white hover:bg-gray-100 transition">Xóa lọc</button>
                                            <button onClick={handleApplyFilters} className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#006c49] text-white hover:bg-[#005236] transition">Áp dụng</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 rounded-xl bg-[#006c49] text-white font-bold hover:bg-[#005236] transition-colors shadow-sm">
                                Viết bài mới
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Tổng bài viết</p>
                                <h3 className="text-3xl font-black text-gray-800">{blogs.length}</h3>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">article</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Đã xuất bản</p>
                                <h3 className="text-3xl font-black text-emerald-600">
                                    {blogs.filter(b => b.published).length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">public</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl flex items-center justify-between shadow-sm border border-gray-50">
                            <div>
                                <p className="text-sm font-semibold text-gray-500 mb-1">Bản nháp</p>
                                <h3 className="text-3xl font-black text-yellow-600">
                                    {blogs.filter(b => !b.published).length}
                                </h3>
                            </div>
                            <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">edit_note</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="text-left p-4 pl-6">ID</th>
                                        <th className="text-left p-4 w-1/3">Bài viết</th>
                                        <th className="text-left p-4">Phân loại</th>
                                        <th className="text-center p-4">Thời gian đọc</th>
                                        <th className="text-center p-4">Trạng thái</th>
                                        <th className="text-right p-4 pr-6">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải bài viết...</td></tr>
                                    ) : paginatedBlogs.length === 0 ? (
                                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không tìm thấy bài viết nào.</td></tr>
                                    ) : (
                                        paginatedBlogs.map((blog) => (
                                            <tr key={blog.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                                                <td className="p-4 pl-6 font-bold text-gray-600">#{blog.id}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={blog.thumbnail} alt={blog.title} className="w-16 h-12 rounded-lg object-cover border border-gray-100 shrink-0" />
                                                        <div>
                                                            <span className="font-bold text-[#006c49] line-clamp-2" title={blog.title}>{blog.title}</span>
                                                            <span className="text-xs text-gray-400 mt-1 block">Ngày tạo: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                                                        {getTypeLabel(blog.type)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-sm font-semibold text-gray-700">
                                                    {blog.readingTime} phút
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(blog.published)}`}>
                                                        {getStatusLabel(blog.published)}
                                                    </span>
                                                </td>
                                                <td className="p-4 pr-6 text-right space-x-2">
                                                    <button 
                                                        onClick={() => { setEditingBlogId(blog.id); setIsEditModalOpen(true); }}
                                                        className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition" 
                                                        title="Chỉnh sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-gray-500 group-hover:text-[#006c49] transition-colors">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {setBlogToDelete(blog.id); setIsDeleteModalOpen(true);}}
                                                        className="group px-2 py-1 text-sm rounded hover:bg-red-50 transition" 
                                                        title="Xóa"
                                                    >
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 text-sm text-gray-500">
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 transition"
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
                                    className="px-3 py-1 rounded border disabled:opacity-50 hover:bg-gray-50 transition"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* MODALS */}
            <AddBlogModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchBlogs} />
            <EditBlogModal isOpen={isEditModalOpen} onClose={() => {setIsEditModalOpen(false); setEditingBlogId(null);}} onSuccess={fetchBlogs} blogId={editingBlogId} />

            {/* DELETE MODAL */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden zoom-in-95 duration-200 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">delete_forever</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6 text-sm">
                            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
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