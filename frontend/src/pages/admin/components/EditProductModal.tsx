import React, { useState, useEffect, useMemo } from "react";
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

const initialProductState = {
    name: "", description: "", price: "", quantity: "", categoryId: "",
    light: "", water: "", size: "", origin: "", temperature: "", potType: "", weight: "", note: "",
    care_watering: "", care_sunlight: "", care_fertilizing: ""
};

export default function EditProductModal({ isOpen, onClose, onSuccess, productId }: EditProductModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    const [editProduct, setEditProduct] = useState(initialProductState);
    const [originalProduct, setOriginalProduct] = useState(initialProductState);

    // State quản lý ảnh
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Refs để điều khiển chiều cao của textareas
    const descriptionRef = React.useRef<HTMLTextAreaElement>(null);
    const noteRef = React.useRef<HTMLTextAreaElement>(null);
    const careWateringRef = React.useRef<HTMLTextAreaElement>(null);
    const careSunlightRef = React.useRef<HTMLTextAreaElement>(null);
    const careFertilizingRef = React.useRef<HTMLTextAreaElement>(null);

    // Tự động điều chỉnh chiều cao textarea khi dữ liệu load về
    useEffect(() => {
        const refs = [descriptionRef, noteRef, careWateringRef, careSunlightRef, careFertilizingRef];
        refs.forEach(ref => {
            if (ref.current) {
                ref.current.style.height = 'auto';
                ref.current.style.height = `${ref.current.scrollHeight}px`;
            }
        });
    }, [
        editProduct.description, editProduct.note, 
        editProduct.care_watering, editProduct.care_sunlight, editProduct.care_fertilizing, 
        isOpen
    ]);

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
            setEditProduct(initialProductState);
            setOriginalProduct(initialProductState);
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
            const fetchedData = {
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
                care_watering: data.details?.care_instruction?.watering || "",
                care_sunlight: data.details?.care_instruction?.sunlight || "",
                care_fertilizing: data.details?.care_instruction?.fertilizing || ""
            };
            setEditProduct(fetchedData);
            setOriginalProduct(fetchedData);
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
                    note: editProduct.note,
                    care_instruction: {
                        watering: editProduct.care_watering,
                        sunlight: editProduct.care_sunlight,
                        fertilizing: editProduct.care_fertilizing
                    }
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

    // Tính toán xem có sự thay đổi dữ liệu nào không
    const hasChanges = useMemo(() => {
        const isFormChanged = Object.keys(editProduct).some(
            (key) => editProduct[key as keyof typeof editProduct] !== originalProduct[key as keyof typeof originalProduct]
        );
        return isFormChanged || imageFiles.length > 0;
    }, [editProduct, originalProduct, imageFiles]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* HEADER */}
                <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined">edit_square</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-800">Chỉnh Sửa Sản Phẩm</h3>
                            <p className="text-xs text-gray-500 font-medium">Cập nhật thông tin chi tiết cho sản phẩm</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-12 gap-6">
                        
                        {/* COL 1: THÔNG TIN CƠ BẢN & HÌNH ẢNH */}
                        <div className="xl:col-span-7 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-50 pb-3">
                                    <span className="material-symbols-outlined text-primary">inventory_2</span> Thông tin chung
                                </h4>
                                
                                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Tên sản phẩm <span className="text-red-500">*</span></label><input required type="text" name="name" value={editProduct.name} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="VD: Sen đá xanh..." /></div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></label><input required type="number" min="0" name="price" value={editProduct.price} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="0" /></div>
                                    <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Tồn kho <span className="text-red-500">*</span></label><input required type="number" min="0" name="quantity" value={editProduct.quantity} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" placeholder="0" /></div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                                    <select required name="categoryId" value={editProduct.categoryId} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div><label className="block text-sm font-semibold mb-1.5 text-gray-700">Mô tả sản phẩm</label><textarea ref={descriptionRef} rows={4} maxLength={1000} name="description" value={editProduct.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none" placeholder="Nhập mô tả chi tiết..."></textarea></div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">imagesmode</span> Cập nhật hình ảnh
                                    </h4>
                                </div>
                                
                                <p className="text-xs text-orange-600 font-semibold bg-orange-50 p-3 rounded-lg border border-orange-100 leading-relaxed">
                                    * Để trống nếu bạn muốn giữ nguyên hình ảnh cũ. Chọn ảnh mới sẽ thay thế toàn bộ ảnh hiện tại.
                                </p>
                                
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
                                            </div>
                                        ))}
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
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ánh sáng</label><input type="text" name="light" value={editProduct.light} onChange={handleInputChange} placeholder="Nắng bán phần..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tưới nước</label><input type="text" name="water" value={editProduct.water} onChange={handleInputChange} placeholder="2 lần/tuần..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Kích thước</label><input type="text" name="size" value={editProduct.size} onChange={handleInputChange} placeholder="15-20cm" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Xuất xứ</label><input type="text" name="origin" value={editProduct.origin} onChange={handleInputChange} placeholder="Đà Lạt" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nhiệt độ (°C)</label><input type="text" name="temperature" value={editProduct.temperature} onChange={handleInputChange} placeholder="18-25°C" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Loại chậu</label><input type="text" name="potType" value={editProduct.potType} onChange={handleInputChange} placeholder="Gốm, Nhựa..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Trọng lượng (kg)</label><input type="number" step="0.1" min="0" name="weight" value={editProduct.weight} onChange={handleInputChange} placeholder="1.5" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm" /></div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Lưu ý</label><textarea ref={noteRef} rows={2} maxLength={255} name="note" value={editProduct.note} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none" placeholder="Lưu ý khi vận chuyển hoặc trưng bày..."></textarea></div>
                            </div>

                            <div className="bg-[#f0f8f5] p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-5">
                                <h4 className="font-bold text-emerald-800 flex items-center gap-2 border-b border-emerald-200/50 pb-3">
                                    <span className="material-symbols-outlined">spa</span> Hướng dẫn chăm sóc
                                </h4>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Tưới nước <span className="text-red-500">*</span></label><textarea ref={careWateringRef} required rows={2} name="care_watering" value={editProduct.care_watering} onChange={handleInputChange} placeholder="Mô tả cách tưới nước..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Ánh sáng <span className="text-red-500">*</span></label><textarea ref={careSunlightRef} required rows={2} name="care_sunlight" value={editProduct.care_sunlight} onChange={handleInputChange} placeholder="Mô tả nhu cầu ánh sáng..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                    <div><label className="block text-xs font-bold text-emerald-700 uppercase mb-1.5">Bón phân <span className="text-red-500">*</span></label><textarea ref={careFertilizingRef} required rows={2} name="care_fertilizing" value={editProduct.care_fertilizing} onChange={handleInputChange} placeholder="Mô tả cách bón phân..." className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm resize-none"></textarea></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="px-8 py-5 border-t bg-white sticky bottom-0 z-20 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                            Hủy Bỏ
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
                                    Lưu Thay Đổi
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}