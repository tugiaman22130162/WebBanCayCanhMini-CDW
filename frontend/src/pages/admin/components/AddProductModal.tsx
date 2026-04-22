import React, { useState, useEffect } from "react";
import axios from "axios";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Category {
    id: number;
    name: string;
    description?: string;
    slug?: string;
    image_url?: string;
}

export default function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [newProduct, setNewProduct] = useState({
        name: "", description: "", price: "", quantity: "", categoryId: "",
        light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: ""
    });

    // State quản lý ảnh
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/categories");
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));

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
            if (imageFiles.length + files.length > 5) {
                alert("Chỉ được phép chọn tối đa 5 ảnh.");
                return;
            }
            const newFiles = [...imageFiles, ...files].slice(0, 5);
            setImageFiles(newFiles);
            setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (imageFiles.length === 0) {
            alert("Vui lòng chọn ít nhất 1 hình ảnh sản phẩm.");
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // 1. Thêm các file ảnh vào formData
            imageFiles.forEach((file) => {
                formData.append("images", file);
            });

            // 2. Tạo Data dạng JSON Blob cho Backend
            const productPayload = {
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                quantity: parseInt(newProduct.quantity, 10),
                categoryId: parseInt(newProduct.categoryId, 10),
                details: {
                    light: newProduct.light,
                    water: newProduct.water,
                    size: newProduct.size,
                    origin: newProduct.origin,
                    temperature: newProduct.temperature,
                    potType: newProduct.potType,
                    weight: newProduct.weight ? parseFloat(newProduct.weight) : null,
                    note: newProduct.note
                }
            };

            formData.append(
                "product",
                new Blob([JSON.stringify(productPayload)], { type: "application/json" })
            );

            // 3. Gửi Request lên Backend
            await axios.post("http://localhost:8080/api/products", formData);

            alert("Thêm sản phẩm thành công!");
            onClose();
            setNewProduct({ name: "", description: "", price: "", quantity: "", categoryId: "", light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: "" });
            setImageFiles([]);
            setImagePreviews([]);
            onSuccess(); // Refresh list products
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Có lỗi xảy ra khi thêm sản phẩm. Vui lòng kiểm tra lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b flex justify-center items-center bg-gray-50 relative">
                    <h3 className="text-2xl font-bold text-gray-800">THÊM SẢN PHẨM</h3>
                    <button onClick={onClose} className="absolute right-6 text-gray-500 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-primary border-b pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">info</span> Thông tin cơ bản
                            </h4>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label><input required type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="VD: Sen đá xanh..." /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label><input required type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tồn kho <span className="text-red-500">*</span></label><input required type="number" name="quantity" value={newProduct.quantity} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                <select required name="categoryId" value={newProduct.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Hình ảnh sản phẩm (Tối đa 5) <span className="text-red-500">*</span></label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-[#2f5146] cursor-pointer" disabled={imageFiles.length >= 5} />
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative w-20 h-20 border rounded-lg overflow-hidden shadow-sm group">
                                                <img src={src} alt="preview" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả sản phẩm</label><textarea rows={3} name="description" value={newProduct.description} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden"></textarea></div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-primary border-b pb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">psychiatry</span> Chi tiết chăm sóc
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Ánh sáng</label><input type="text" name="light" value={newProduct.light} onChange={handleInputChange} placeholder="Nắng bán phần..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Tưới nước</label><input type="text" name="water" value={newProduct.water} onChange={handleInputChange} placeholder="2 lần/tuần..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Kích thước</label><input type="text" name="size" value={newProduct.size} onChange={handleInputChange} placeholder="15-20cm" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Xuất xứ</label><input type="text" name="origin" value={newProduct.origin} onChange={handleInputChange} placeholder="Đà Lạt" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Nhiệt độ (°C)</label><input type="text" name="temperature" value={newProduct.temperature} onChange={handleInputChange} placeholder="18-25°C" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Loại chậu</label><input type="text" name="potType" value={newProduct.potType} onChange={handleInputChange} placeholder="Gốm, Nhựa..." className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                                <div><label className="block text-sm font-semibold mb-1 text-gray-700">Trọng lượng (kg)</label><input type="number" step="0.1" name="weight" value={newProduct.weight} onChange={handleInputChange} placeholder="1.5" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
                            </div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Lưu ý</label><textarea rows={2} name="note" value={newProduct.note} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden"></textarea></div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] disabled:bg-gray-400 transition-colors">
                            {isSubmitting ? "Đang lưu..." : "Lưu Sản Phẩm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}