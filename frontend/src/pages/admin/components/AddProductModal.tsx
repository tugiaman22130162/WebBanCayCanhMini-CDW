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
        light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: "",
        care_watering: "", care_sunlight: "", care_fertilizing: ""
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
                    note: newProduct.note,
                    care_instruction: {
                        watering: newProduct.care_watering,
                        sunlight: newProduct.care_sunlight,
                        fertilizing: newProduct.care_fertilizing
                    }
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
            setNewProduct({ name: "", description: "", price: "", quantity: "", categoryId: "", light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: "", care_watering: "", care_sunlight: "", care_fertilizing: "" });
            setImageFiles([]);
            setImagePreviews([]);
            onSuccess(); // Refresh list products
        } catch (error: any) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            const errorMessage = error.response?.data?.message || error.message;
            alert(`Có lỗi xảy ra: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* HEADER */}
                <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">add_circle</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-800">Thêm Sản Phẩm Mới</h3>
                            <p className="text-xs text-gray-500 font-medium">Nhập thông tin chi tiết cho sản phẩm của bạn</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
                        
                        {/* COL 1: THÔNG TIN CƠ BẢN & HÌNH ẢNH */}
                        <div className="xl:col-span-7 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                    <span className="material-symbols-outlined text-primary">inventory_2</span> Thông tin chung
                                </h4>
                                
                                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label><input required type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="VD: Sen đá xanh..." /></div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label><input required type="number" min="0" name="price" value={newProduct.price} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="0" /></div>
                                    <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Tồn kho <span className="text-red-500">*</span></label><input required type="number" min="0" name="quantity" value={newProduct.quantity} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="0" /></div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                    <select required name="categoryId" value={newProduct.categoryId} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Mô tả sản phẩm</label><textarea rows={4} name="description" value={newProduct.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none" placeholder="Nhập mô tả chi tiết..."></textarea></div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                    <span className="material-symbols-outlined text-primary">imagesmode</span> Hình ảnh sản phẩm
                                </h4>
                                
                                <div className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${imageFiles.length >= 5 ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer'}`}>
                                    <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={imageFiles.length >= 5} title={imageFiles.length >= 5 ? "Đã đạt tối đa 5 ảnh" : "Chọn ảnh"} />
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${imageFiles.length >= 5 ? 'bg-gray-200 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                                        <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-700">Kéo thả hoặc click để tải ảnh lên</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (Tối đa 5 ảnh)</p>
                                    </div>
                                </div>

                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                                <img src={src} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => handleRemoveImage(index)} className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors transform scale-75 group-hover:scale-100">
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {imageFiles.length < 5 && (
                                            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center bg-gray-50 cursor-pointer transition-colors">
                                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                <span className="material-symbols-outlined text-gray-400">add</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* COL 2: THÔNG SỐ VÀ CHĂM SÓC */}
                        <div className="xl:col-span-5 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                    <span className="material-symbols-outlined text-primary">psychiatry</span> Thông số chi tiết
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ánh sáng</label><input type="text" name="light" value={newProduct.light} onChange={handleInputChange} placeholder="Nắng bán phần..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tưới nước</label><input type="text" name="water" value={newProduct.water} onChange={handleInputChange} placeholder="2 lần/tuần..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kích thước</label><input type="text" name="size" value={newProduct.size} onChange={handleInputChange} placeholder="15-20cm" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Xuất xứ</label><input type="text" name="origin" value={newProduct.origin} onChange={handleInputChange} placeholder="Đà Lạt" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nhiệt độ (°C)</label><input type="text" name="temperature" value={newProduct.temperature} onChange={handleInputChange} placeholder="18-25°C" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại chậu</label><input type="text" name="potType" value={newProduct.potType} onChange={handleInputChange} placeholder="Gốm, Nhựa..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Trọng lượng (kg)</label><input type="number" step="0.1" min="0" name="weight" value={newProduct.weight} onChange={handleInputChange} placeholder="1.5" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lưu ý</label><textarea rows={2} name="note" value={newProduct.note} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none" placeholder="Lưu ý khi vận chuyển hoặc trưng bày..."></textarea></div>
                            </div>

                            <div className="bg-[#f0f8f5] p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200/50 pb-3">
                                    <span className="material-symbols-outlined">spa</span> Hướng dẫn chăm sóc
                                </h4>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Tưới nước <span className="text-red-500">*</span></label><textarea required rows={2} name="care_watering" value={newProduct.care_watering} onChange={handleInputChange} placeholder="Mô tả cách tưới nước..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Ánh sáng <span className="text-red-500">*</span></label><textarea required rows={2} name="care_sunlight" value={newProduct.care_sunlight} onChange={handleInputChange} placeholder="Mô tả nhu cầu ánh sáng..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Bón phân <span className="text-red-500">*</span></label><textarea required rows={2} name="care_fertilizing" value={newProduct.care_fertilizing} onChange={handleInputChange} placeholder="Mô tả cách bón phân..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-8 py-5 border-t bg-white sticky bottom-0 z-20 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                            Hủy Bỏ
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] disabled:bg-gray-400 transition-colors flex items-center gap-2 shadow-lg shadow-primary/30">
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                                    Đang Lưu...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">save</span>
                                    Lưu Sản Phẩm
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}