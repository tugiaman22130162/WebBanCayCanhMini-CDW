import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";
import TiptapEditor from "./TiptapEditor";

interface EditBlogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    blogId: number | null;
}

export default function EditBlogModal({ isOpen, onClose, onSuccess, blogId }: EditBlogModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        thumbnail: "",
        slug: "",
        readingTime: 5,
        type: "TIPS",
        published: true
    });
    const [originalData, setOriginalData] = useState({
        title: "",
        content: "",
        thumbnail: "",
        slug: "",
        readingTime: 5,
        type: "TIPS",
        published: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    useEffect(() => {
        if (isOpen && blogId) {
            fetchBlogData();
        }
    }, [isOpen, blogId]);

    const fetchBlogData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:8080/api/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;
            const newData = {
                title: data.title || "",
                content: data.content || "",
                thumbnail: data.thumbnail || "",
                slug: data.slug || "",
                readingTime: data.readingTime || 5,
                type: data.type || "TIPS",
                published: data.published ?? true
            };
            setFormData(newData);
            setOriginalData(newData);
            setImageFile(null);
            setImagePreview(data.thumbnail || "");
        } catch (error) {
            console.error("Lỗi lấy dữ liệu blog:", error);
            showErrorToast("Không thể tải dữ liệu bài viết", 2000);
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData) || imageFile !== null;
    }, [formData, originalData, imageFile]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!blogId) return;
        
        if (!formData.content || formData.content === '<p></p>') {
            showErrorToast("Vui lòng nhập nội dung bài viết!", 2000);
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            
            data.append("blog", new Blob([JSON.stringify(formData)], { type: "application/json" }));
            
            if (imageFile) {
                data.append("thumbnail", imageFile);
            }

            await axios.put(`http://localhost:8080/api/blogs/${blogId}`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            showSuccessToast("Cập nhật bài viết thành công!", 2000);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi cập nhật bài viết:", error);
            showErrorToast("Có lỗi xảy ra khi cập nhật.", 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Chỉnh Sửa Bài Viết</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><span className="material-symbols-outlined animate-spin text-4xl text-[#006c49]">autorenew</span></div>
                    ) : (
                    <form id="edit-blog-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]" placeholder="Nhập tiêu đề bài viết"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                                <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]" placeholder="vd: cach-cham-soc-sen-da"/>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Thời gian đọc (phút) <span className="text-red-500">*</span></label>
                                <input type="number" min="1" required value={formData.readingTime} onChange={(e) => setFormData({...formData, readingTime: parseInt(e.target.value) || 1})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49]"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Loại bài viết</label>
                                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] bg-white">
                                    <option value="TIPS">Mẹo (TIPS)</option>
                                    <option value="TREND">Xu hướng (TREND)</option>
                                    <option value="GUIDE">Hướng dẫn (GUIDE)</option>
                                    <option value="PROMOTION">Khuyến mãi (PROMOTION)</option>
                                    <option value="DECOR">Trang trí (DECOR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Trạng thái</label>
                                <select value={formData.published ? "true" : "false"} onChange={(e) => setFormData({...formData, published: e.target.value === "true"})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#006c49] focus:ring-1 focus:ring-[#006c49] bg-white">
                                    <option value="true">Xuất bản</option>
                                    <option value="false">Bản nháp (Ẩn)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Hình ảnh Thumbnail</label>
                            <div className="relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-colors border-gray-300 hover:border-[#006c49] hover:bg-[#006c49]/5 cursor-pointer">
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
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#006c49]/10 text-[#006c49]">
                                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-700">Kéo thả hoặc click để tải ảnh lên</p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                                </div>
                            </div>
                            {imagePreview && (
                                <div className="mt-4 relative w-32 h-24 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setFormData(prev => ({...prev, thumbnail: ""})) }} className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors" title="Xóa ảnh">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-gray-700">Nội dung <span className="text-red-500">*</span></label>
                            <TiptapEditor content={formData.content} onChange={(html) => setFormData({...formData, content: html})} />
                        </div>
                    </form>
                    )}
                </div>
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                        Hủy
                    </button>
                    <button type="submit" form="edit-blog-form" disabled={isSubmitting || isLoading || !hasChanges} className="px-8 py-2.5 rounded-xl bg-[#006c49] text-white font-bold hover:bg-[#005236] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg">
                        {isSubmitting ? <span className="material-symbols-outlined animate-spin text-lg">autorenew</span> : <span className="material-symbols-outlined text-lg">save</span>}
                        Lưu Thay Đổi
                    </button>
                </div>
            </div>
        </div>
    );
}