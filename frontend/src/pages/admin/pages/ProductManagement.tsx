import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";

type Product = {
    id: string;
    name: string;
    price: string;
    stock: number;
    category: string;
    status: string;
    statusColor: string;
    image: string;
};

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // State quản lý Modal Thêm Sản Phẩm
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);

    // State quản lý Modal Xóa Sản Phẩm
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State quản lý Bộ lọc
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({ status: "all", category: "all" });
    const [tempFilters, setTempFilters] = useState({ status: "all", category: "all" });
    const [allCategories, setAllCategories] = useState<string[]>(['all']);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchProducts();
        fetchAllCategories();
    }, []);

    const fetchAllCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/categories");
            // The response.data is an array of Category objects {id, name, ...}
            const categoryNames = response.data.map((cat: any) => cat.name);
            setAllCategories(['all', ...categoryNames]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách danh mục:", error);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/products");

            const formattedData: Product[] = response.data.map((item: any) => {
                const stock = item.quantity ?? item.stock ?? 0;
                let status = "Còn hàng";
                let statusColor = "text-emerald-700 bg-emerald-100";

                if (stock === 0) {
                    status = "Hết hàng";
                    statusColor = "text-red-700 bg-red-100";
                } else if (stock <= 5) {
                    status = "Sắp hết";
                    statusColor = "text-yellow-700 bg-yellow-100";
                }

                return {
                    id: item.id?.toString(),
                    name: item.name,
                    price: item.price ? item.price.toLocaleString("vi-VN") + "đ" : "0đ",
                    stock: stock,
                    category: item.categoryName || item.category?.name || item.category || "Chưa phân loại",
                    status: status,
                    statusColor: statusColor,
                    image: (item.images && item.images.length > 0) ? item.images[0] : "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"
                };
            });

            setProducts(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`http://localhost:8080/api/products/${productToDelete}`);
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Có lỗi xảy ra khi xóa sản phẩm.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApplyFilters = () => {
        setCurrentFilters(tempFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    const handleClearFilters = () => {
        const clearedFilters = { status: "all", category: "all" };
        setTempFilters(clearedFilters);
        setCurrentFilters(clearedFilters);
        setIsFilterPanelOpen(false);
        setCurrentPage(1); // Reset về trang 1 khi xóa lọc
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportExcel = () => {
        if (products.length === 0) {
            alert("Không có dữ liệu để xuất!");
            return;
        }

        // Tạo cấu trúc dữ liệu cho Excel
        const exportData = products.map((p, index) => ({
            "STT": index + 1,
            "ID Sản phẩm": p.id,
            "Tên sản phẩm": p.name,
            "Danh mục": p.category,
            "Giá": p.price,
            "Tồn kho": p.stock,
            "Trạng thái": p.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSanPham");

        XLSX.writeFile(workbook, "DanhSachSanPham.xlsx");
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const arrayBuffer = evt.target?.result;
                const wb = XLSX.read(arrayBuffer, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                console.log("Dữ liệu từ Excel:", data);
                alert(`Đã đọc thành công ${data.length} sản phẩm từ file Excel!\n(Vui lòng mở Console F12 để xem cấu trúc dữ liệu. Để lưu thực tế, cần tạo API thêm hàng loạt ở Backend).`);
                
                // Ví dụ khi có API Backend:
                // await axios.post("http://localhost:8080/api/products/batch", data);
                // fetchProducts();

            } catch (error) {
                console.error("Lỗi khi import file Excel:", error);
                alert("Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra lại định dạng file!");
            } finally {
                // Reset lại input để có thể chọn lại đúng file đó vào lần sau
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const statusMatch = currentFilters.status === 'all' || p.status === currentFilters.status;
            const categoryMatch = currentFilters.category === 'all' || p.category === currentFilters.category;
            return statusMatch && categoryMatch;
        });
    }, [products, currentFilters]);

    // Tính toán dữ liệu cho trang hiện tại
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />

                <main className="p-8 flex-1 overflow-y-auto">
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Sản Phẩm</h2>

                        <div className="flex gap-3">
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                ref={fileInputRef} 
                                onChange={handleImportExcel} 
                                className="hidden" 
                            />
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100 text-sm font-semibold text-gray-700">
                                <span className="material-symbols-outlined text-[18px]">upload</span> Nhập
                            </button>
                            <button onClick={handleExportExcel} className="px-4 py-3 rounded-xl bg-white flex items-center gap-2 hover:bg-gray-50 transition shadow-sm border border-gray-100 text-sm font-semibold text-gray-700">
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
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Trạng thái</label>
                                                <div className="space-y-2">
                                                    {(['all', 'Còn hàng', 'Sắp hết', 'Hết hàng'] as const).map(status => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="status"
                                                                value={status}
                                                                checked={tempFilters.status === status}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{status === 'all' ? 'Tất cả' : status}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase text-gray-500 mb-3">Danh mục</label>
                                                <div className="space-y-2">
                                                    {allCategories.map(category => (
                                                        <label key={category} className="flex items-center gap-2 cursor-pointer text-sm">
                                                            <input
                                                                type="radio"
                                                                name="category"
                                                                value={category}
                                                                checked={tempFilters.category === category}
                                                                onChange={(e) => setTempFilters({ ...tempFilters, category: e.target.value })}
                                                                className="w-4 h-4 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                                            />
                                                            <span>{category === 'all' ? 'Tất cả' : category}</span>
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
                            <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-[#2f5146] transition-colors">
                                Thêm Sản Phẩm
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <Stat title="Tổng Sản Phẩm" value={totalProducts} icon="inventory_2" iconBgColor="bg-blue-50" iconTextColor="text-blue-600" color="text-on-surface" />
                        <Stat title="Sắp Hết Hàng" value={lowStock} icon="warning" iconBgColor="bg-yellow-50" iconTextColor="text-yellow-600" color="text-yellow-600" />
                        <Stat title="Hết Hàng" value={outOfStock} icon="error" iconBgColor="bg-red-50" iconTextColor="text-red-600" color="text-red-500" />
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-gray-100 text-on-surface-variant text-xs uppercase">
                                    <tr>
                                        <th className="text-left p-4">Sản phẩm</th>
                                        <th className="text-left p-4">Danh mục</th>
                                        <th className="text-left p-4">Giá</th>
                                        <th className="text-left p-4">Tồn kho</th>
                                        <th className="text-left p-4">Trạng thái</th>
                                        <th className="text-right p-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-on-surface-variant">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-on-surface-variant">Chưa có sản phẩm nào</td>
                                        </tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-on-surface-variant">Không tìm thấy sản phẩm nào khớp.</td>
                                        </tr>
                                    ) : (
                                        currentProducts.map((p, i) => (
                                            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover" />
                                                    <div>
                                                        <p className="font-bold">{p.name}</p>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-on-surface-variant">{p.category}</td>
                                                <td className="p-4 font-bold">{p.price}</td>
                                                <td className="p-4 text-sm">{p.stock}</td>
                                                <td className="p-4">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${p.statusColor}`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button onClick={() => { setEditingProductId(p.id); setIsEditModalOpen(true); }} className="group px-2 py-1 text-sm rounded hover:bg-gray-100 transition" title="Chỉnh sửa">
                                                        <span className="material-symbols-outlined text-[20px] align-middle text-gray-500 group-hover:text-primary transition-colors">edit</span>
                                                    </button>
                                                    <button onClick={() => { setProductToDelete(p.id); setIsDeleteDialogOpen(true); }} className="group px-2 py-1 text-sm rounded hover:bg-red-50 transition" title="Xóa">
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

            {/* MODAL THÊM SẢN PHẨM */}
            <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchProducts} />
            <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchProducts} productId={editingProductId} />

            {/* MODAL XÓA SẢN PHẨM */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận xóa sản phẩm</h3>
                            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này sẽ ẩn sản phẩm khỏi danh sách.</p>

                            <div className="flex justify-center gap-3">
                                <button onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button onClick={handleDeleteProduct} disabled={isDeleting} className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:bg-red-300 transition-colors">
                                    {isDeleting ? "Đang xóa..." : "Xác Nhận Xóa"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

type StatProps = {
    title: string;
    value: string | number;
    color?: string;
    icon: string;
    iconBgColor?: string;
    iconTextColor?: string;
};

function Stat({ title, value, color = "text-primary", icon, iconBgColor = "bg-gray-50", iconTextColor = "text-gray-600" }: StatProps) {
    return (
        <div className="bg-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
                <p className="text-xs uppercase text-on-surface-variant font-semibold mb-1">{title}</p>
                <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
            </div>
            <div className={`w-12 h-12 ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
        </div>
    );
}