import React, { useState, useEffect, useMemo } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TerrariumRequests from "../../components/admin/TerrariumRequests";
import TerrariumInventory from "../../components/admin/TerrariumInventory";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

export default function TerrariumManagement() {
    const [activeTab, setActiveTab] = useState<'requests' | 'components'>('requests');
    const [components, setComponents] = useState<any[]>([]);

    // State quản lý modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({ type: 'CONTAINER' });
    const [originalFormData, setOriginalFormData] = useState<any>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CONTAINER_SHAPES = [
        { value: 'w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-[160px]', label: 'Bình tròn (Cầu)' },
        { value: 'w-[260px] sm:w-[280px] h-[320px] sm:h-[360px] rounded-[40px]', label: 'Bình hình học (Đa giác)' },
        { value: 'w-[180px] sm:w-[200px] h-[360px] sm:h-[400px] rounded-t-[100px] rounded-b-[30px]', label: 'Bình trụ cao' },
    ];

    const SOIL_COLORS = [
        { value: '#5d4037', label: 'Nâu sẫm (Đất mùn)' },
        { value: '#d7ccc8', label: 'Trắng xám (Sỏi Akadama)' },
        { value: '#455a64', label: 'Đen xám (Đá núi lửa)' },
        { value: '#8d6e63', label: 'Nâu đỏ (Đất nung)' },
        { value: '#ffcc80', label: 'Vàng cát (Cát sa mạc)' },
        { value: '#a1887f', label: 'Nâu nhạt (Xơ dừa)' }
    ];

    const fetchComponents = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/terrarium-components");
            setComponents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu components:", error);
            setComponents([]);
        }
    };

    useEffect(() => {
        fetchComponents();
    }, []);

    const handleOpenAddModal = () => {
        const initialData = { type: 'CONTAINER', name: '', price: '', stockQuantity: '' };
        setFormData(initialData);
        setOriginalFormData(initialData);
        setImageFile(null);
        setImagePreview("");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: any) => {
        const itemCopy = { ...item };
        setFormData(itemCopy);
        setOriginalFormData(itemCopy);
        setImageFile(null);
        setImagePreview(item.image || "");
        setIsModalOpen(true);
    };

    const hasChanges = useMemo(() => {
        if (!formData.id) {
            return true;
        }
        return JSON.stringify(formData) !== JSON.stringify(originalFormData) || imageFile !== null;
    }, [formData, originalFormData, imageFile]);

    const handleSaveComponent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const payload = { ...formData };
            if (payload.stockQuantity === undefined) payload.stockQuantity = 0;

            const sendData = new FormData();
            sendData.append("component", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            
            if (imageFile) {
                sendData.append("image", imageFile);
            }

            if (formData.id) {
                await axios.put(`http://localhost:8080/api/terrarium-components/${formData.id}`, sendData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Cập nhật nguyên liệu thành công!", 2000);
            } else {
                await axios.post("http://localhost:8080/api/terrarium-components", sendData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Thêm nguyên liệu thành công!", 2000);
            }
            fetchComponents();
            setIsModalOpen(false);
        } catch (error) {
            showErrorToast("Có lỗi xảy ra.", 2000);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="h-screen bg-background text-on-surface flex overflow-hidden font-[Plus_Jakarta_Sans]">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="p-8 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-800">Quản Lý Terrarium</h2>
                        {activeTab === 'components' && (
                            <button onClick={handleOpenAddModal} className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-[#2f5146] transition">
                                Thêm Nguyên Liệu
                            </button>
                        )}
                    </div>

                    {/* TABS */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button onClick={() => setActiveTab('requests')} className={`pb-3 px-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Yêu Cầu Thiết Kế
                        </button>
                        <button onClick={() => setActiveTab('components')} className={`pb-3 px-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'components' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            Kho Nguyên Liệu
                        </button>
                    </div>

                    {/* NỘI DUNG TAB */}
                    {activeTab === 'requests' ? (
                        <TerrariumRequests />
                    ) : (
                        <TerrariumInventory 
                            components={components}
                            onEdit={handleOpenEditModal}
                            onDeleteSuccess={fetchComponents}
                        />
                    )}
                </main>
            </div>

            {/* MODAL THÊM/SỬA COMPONENT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50 shrink-0">
                            <h3 className="font-bold text-lg text-gray-800">{formData.id ? 'Sửa' : 'Thêm'} {formData.type === 'CONTAINER' ? 'Bình Thủy Tinh' : formData.type === 'SOIL' ? 'Đất Nền' : formData.type === 'PLANT' ? 'Cây Trồng' : 'Nguyên Liệu'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSaveComponent} className="p-6 space-y-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <div><label className="block text-sm font-bold mb-1">Loại</label><div className="relative"><select disabled={!!formData.id} value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className={`appearance-none w-full p-2 pr-8 border rounded-lg outline-none ${formData.id ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}><option value="CONTAINER">Bình</option><option value="SOIL">Đất Nền</option><option value="PLANT">Cây</option></select><span className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 material-symbols-outlined">expand_more</span></div></div>
                            <div><label className="block text-sm font-bold mb-1">Tên</label><input type="text" required value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg outline-none" /></div>
                            <div><label className="block text-sm font-bold mb-1">Giá (VNĐ)</label><input type="number" required value={formData.price ?? ''} onWheel={event => event.currentTarget.blur()} onChange={(e) => setFormData({...formData, price: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full p-2 border rounded-lg outline-none" /></div>
                            <div><label className="block text-sm font-bold mb-1">Số lượng tồn kho</label><input type="number" required value={formData.stockQuantity ?? ''} onWheel={event => event.currentTarget.blur()} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full p-2 border rounded-lg outline-none" /></div>
                            {formData.type === 'CONTAINER' && (<><div><label className="block text-sm font-bold mb-1">Mô tả / Mẹo (Hiển thị cho User)</label><textarea value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg outline-none"></textarea></div><div><label className="block text-sm font-bold mb-1">Hình dáng bình</label><select value={formData.cssStyle || ''} onChange={(e) => setFormData({...formData, cssStyle: e.target.value})} className="w-full p-2 border rounded-lg outline-none"><option value="">-- Chọn hình dáng --</option>{CONTAINER_SHAPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                            {formData.cssStyle && (
                                <div>
                                    <label className="block text-sm font-bold mb-1">Demo Hình Dáng</label>
                                    <div className="flex items-center justify-center p-4 bg-[#DCE3DE] rounded-xl border border-gray-200 overflow-hidden h-56 relative shadow-inner">
                                        <div className={`relative bg-gradient-to-r from-white/30 via-white/10 to-white/30 border-2 border-white/70 shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_10px_20px_rgba(0,0,0,0.1)] backdrop-blur-md overflow-hidden ${formData.cssStyle}`} style={{ transform: 'scale(0.4)', transformOrigin: 'center' }}>
                                            <div className="absolute inset-y-0 left-[8%] w-[12%] bg-gradient-to-r from-white/60 to-transparent rounded-full blur-md pointer-events-none transform -skew-x-6" />
                                            <div className="absolute inset-y-0 right-[5%] w-[8%] bg-gradient-to-l from-white/20 to-transparent rounded-full blur-sm pointer-events-none" />
                                            <div className="absolute inset-0 bg-blue-100/20 mix-blend-overlay" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            </>)}
                            {formData.type === 'SOIL' && (<div><label className="block text-sm font-bold mb-1">Màu sắc tự nhiên</label><div className="flex gap-2 items-center"><div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner shrink-0" style={{ backgroundColor: formData.cssStyle || '#5d4037' }}></div><select value={formData.cssStyle || ''} onChange={(e) => setFormData({...formData, cssStyle: e.target.value})} className="flex-1 p-2 border rounded-lg outline-none"><option value="">-- Chọn màu sắc --</option>{SOIL_COLORS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div></div>)}
                            {formData.type === 'PLANT' && (<>
                                <div>
                                    <label className="block text-sm font-bold mb-1">Hình ảnh Cây (Chỉ được chọn 1 ảnh)</label>
                                    <div className="flex items-center gap-4">
                                        {(imagePreview || formData.image) && (
                                            <img src={imagePreview || formData.image} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                                        )}
                                        <input type="file" accept="image/*" multiple={false} onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                setImagePreview(URL.createObjectURL(e.target.files[0]));
                                            }
                                            e.target.value = '';
                                        }} className="flex-1 p-2 border rounded-lg outline-none text-sm" />
                                    </div>
                                </div>
                                <div><label className="block text-sm font-bold mb-1">Số lượng tối đa trong 1 bình</label><input type="number" min="1" required value={formData.maxPerContainer ?? ''} onWheel={event => event.currentTarget.blur()} onChange={(e) => setFormData({...formData, maxPerContainer: e.target.value === '' ? undefined : Number(e.target.value)})} className="w-full p-2 border rounded-lg outline-none" /></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold mb-1">Ánh sáng</label><input type="text" placeholder="Trung bình, Yếu..." value={formData.light || ''} onChange={(e) => setFormData({...formData, light: e.target.value})} className="w-full p-2 border rounded-lg outline-none" /></div><div><label className="block text-sm font-bold mb-1">Độ ẩm</label><input type="text" placeholder="Cao, Thấp..." value={formData.humidity || ''} onChange={(e) => setFormData({...formData, humidity: e.target.value})} className="w-full p-2 border rounded-lg outline-none" /></div></div><div><label className="block text-sm font-bold mb-1">Mức độ chăm sóc</label><input type="text" placeholder="Dễ, Trung bình..." value={formData.careLevel || ''} onChange={(e) => setFormData({...formData, careLevel: e.target.value})} className="w-full p-2 border rounded-lg outline-none" /></div></>)}
                            <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-white py-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 border rounded-lg font-bold hover:bg-gray-50 transition-colors">Hủy</button>
                                <button type="submit" disabled={isSubmitting || (formData.id && !hasChanges)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-[#2f5146] transition-colors disabled:bg-gray-400 flex items-center gap-2">
                                    {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : null}
                                    {formData.id ? 'Lưu Thay Đổi' : 'Thêm Nguyên Liệu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}