import React, { useState, useEffect } from "react";
import axios from "axios";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productId: string | null;
}

interface Category {
    id: number;
    name: string;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, productId }: EditProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [editProduct, setEditProduct] = useState({
        name: "", description: "", price: "", quantity: "", categoryId: "",
        light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: ""
    });

    // State quản lý ảnh
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Refs để điều khiển chiều cao của textareas
    const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
    const noteRef = React.useRef<HTMLTextAreaElement>(null);

    // Tự động điều chỉnh chiều cao textarea khi dữ liệu load về
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
        if (noteRef.current) {
            noteRef.current.style.height = 'auto';
            noteRef.current.style.height = `${noteRef.current.scrollHeight}px`;
        }
    }, [editProduct.description, editProduct.note, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetail();
        } else {
            // Reset state khi đóng modal
            setEditProduct({
                name: "", description: "", price: "", quantity: "", categoryId: "",
                light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: ""
            });
            setImageFiles([]);
            setImagePreviews([]);
        }
    }, [isOpen, productId]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    const fetchProductDetail = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/products/${productId}`);
            const data = response.data;
            
            // Map dữ liệu từ bảng products, product_details và product_images vào Form
            setEditProduct({
                name: data.name || "",
                description: data.description || "",
                price: data.price?.toString() || "",
                quantity: data.quantity?.toString() || "0",
                categoryId: data.categoryId?.toString() || "",
                light: data.details?.light || "",
                water: data.details?.water || "",
                size: data.details?.size || "",
                origin: data.details?.origin || "",
                temperature: data.details?.temperature || "",
                potType: data.details?.potType || "",
                weight: data.details?.weight?.toString() || "",
                note: data.details?.note || "",
            });
            setImagePreviews(data.images || []);
        } catch (error) {
            console.error("Lỗi lấy chi tiết sản phẩm:", error);
            alert("Không thể tải thông tin chi tiết sản phẩm!");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditProduct(prev => ({ ...prev, [name]: value }));

        // Tự động điều chỉnh chiều cao cho textarea
        if (e.target.tagName.toLowerCase() === 'textarea') {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                alert("Chỉ được phép chọn tối đa 5 ảnh.");
                return;
            }
            setImageFiles(files);
            // Hiển thị ảnh preview thay thế cho ảnh hiện tại
            setImagePreviews(files.map(f => URL.createObjectURL(f)));
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Chỉ đính kèm ảnh mới nếu người dùng có chọn ảnh
            if (imageFiles.length > 0) {
                imageFiles.forEach((file) => {
                    formData.append("images", file);
                });
            }

            // Tạo Payload chứa thông tin Products & ProductDetails
            const productPayload = {
                name: editProduct.name,
                description: editProduct.description,
                price: parseFloat(editProduct.price),
                quantity: parseInt(editProduct.quantity, 10),
                categoryId: parseInt(editProduct.categoryId, 10),
                details: {
                    light: editProduct.light,
                    water: editProduct.water,
                    size: editProduct.size,
                    origin: editProduct.origin,
                    temperature: editProduct.temperature,
                    potType: editProduct.potType,
                    weight: editProduct.weight ? parseFloat(editProduct.weight) : null,
                    note: editProduct.note
                }
            };

            formData.append(
                "product",
                new Blob([JSON.stringify(productPayload)], { type: "application/json" })
            );

            await axios.put(`http://localhost:8080/api/products/${productId}`, formData);

            alert("Cập nhật sản phẩm thành công!");
            onClose();
            onSuccess(); // Refresh danh sách sản phẩm bên ngoài
        } catch (error: any) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            const errorMessage = error.response?.data?.message || error.message;
            alert(`Có lỗi xảy ra: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-center items-center bg-gray-50 relative">
                    <h3 className="text-2xl font-bold text-gray-800">CHỈNH SỬA SẢN PHẨM</h3>
                    <button onClick={onClose} className="absolute right-6 text-gray-500 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* THÔNG TIN CƠ BẢN */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary border-b pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">info</span> Thông tin cơ bản
                            </h4>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label><input required type="text" name="name" value={editProduct.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="VD: Sen đá xanh..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label><input required type="number" name="price" value={editProduct.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tồn kho <span className="text-red-500">*</span></label><input required type="number" name="quantity" value={editProduct.quantity} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                <select required name="categoryId" value={editProduct.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Cập nhật hình ảnh (Tối đa 5 ảnh)</label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-[#2f5146] cursor-pointer" />
                                <p className="text-xs text-orange-600 mt-1 italic">* Để trống nếu bạn muốn giữ nguyên hình ảnh cũ. Chọn ảnh mới sẽ thay thế toàn bộ ảnh hiện tại.</p>
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative w-20 h-20 border rounded-lg overflow-hidden shadow-sm group">
                                                <img src={src} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label><textarea ref={descriptionRef} rows={3} name="description" maxLength={1000} value={editProduct.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden"></textarea></div>
                        </div>

                        {/* CHI TIẾT CHĂM SÓC */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary border-b pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">psychiatry</span> Chi tiết chăm sóc
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Ánh sáng</label><input type="text" name="light" value={editProduct.light} onChange={handleInputChange} placeholder="Nắng bán phần..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tưới nước</label><input type="text" name="water" value={editProduct.water} onChange={handleInputChange} placeholder="2 lần/tuần..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Kích thước</label><input type="text" name="size" value={editProduct.size} onChange={handleInputChange} placeholder="15-20cm" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Xuất xứ</label><input type="text" name="origin" value={editProduct.origin} onChange={handleInputChange} placeholder="Đà Lạt" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Nhiệt độ (°C)</label><input type="text" name="temperature" value={editProduct.temperature} onChange={handleInputChange} placeholder="18-25°C" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Loại chậu</label><input type="text" name="potType" value={editProduct.potType} onChange={handleInputChange} placeholder="Gốm, Nhựa..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Trọng lượng (kg)</label><input type="number" step="0.1" name="weight" value={editProduct.weight} onChange={handleInputChange} placeholder="1.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                            </div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Lưu ý</label><textarea ref={noteRef} rows={2} name="note" maxLength={255} value={editProduct.note} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden"></textarea></div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] disabled:bg-gray-400 transition-colors">
                            {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}