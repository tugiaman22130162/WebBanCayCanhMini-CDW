import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

interface TerrariumInventoryProps {
    addTrigger: number;
}

export default function TerrariumInventory({ addTrigger }: TerrariumInventoryProps) {
    const [components, setComponents] = useState<any[]>([]);
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

    useEffect(() => {
        if (addTrigger > 0) {
            const initialData = { type: 'CONTAINER' };
            setFormData(initialData);
            setOriginalFormData(initialData);
            setImageFile(null);
            setImagePreview("");
            setIsModalOpen(true);
        }
    }, [addTrigger]);

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
                // Chạy API ngầm để không block UI do upload ảnh tốn thời gian
                axios.put(`http://localhost:8080/api/terrarium-components/${formData.id}`, sendData, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => fetchComponents()).catch(() => {
                    showErrorToast("Lỗi khi cập nhật trên server", 2000);
                });
                setComponents(prev => prev.map(c => c.id === formData.id ? { ...c, ...payload, image: imagePreview || c.image } : c));
                showSuccessToast("Cập nhật nguyên liệu thành công!", 2000);
            } else {
                // Chạy API ngầm
                axios.post("http://localhost:8080/api/terrarium-components", sendData, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => fetchComponents()).catch(() => {
                    showErrorToast("Lỗi khi thêm mới trên server", 2000);
                });
                setComponents(prev => [...prev, { ...payload, id: Date.now(), image: imagePreview || "" }]);
                showSuccessToast("Thêm nguyên liệu thành công!", 2000);
            }
            setIsModalOpen(false);
            setImageFile(null);
            setImagePreview("");
        } catch (error) {
            showErrorToast("Có lỗi xảy ra.", 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComponent = async (id: number) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Bạn có chắc chắn muốn xóa nguyên liệu này không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`http://localhost:8080/api/terrarium-components/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSuccessToast("Đã xóa nguyên liệu thành công!", 2000);
                await fetchComponents();
            } catch (error) {
                showErrorToast("Có lỗi xảy ra khi xóa.", 2000);
            }
        }
    };

    return (
        <div className="space-y-8">
            {['CONTAINER', 'SOIL', 'PLANT'].map((type) => {
                const typeComponents = (Array.isArray(components) ? components : []).filter(c => c.type === type);
                
                return (
                    <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    type === 'CONTAINER' ? 'bg-blue-50 text-blue-600' :
                                    type === 'SOIL' ? 'bg-amber-50 text-amber-600' :
                                    'bg-emerald-50 text-emerald-600'
                                }`}>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {type === 'CONTAINER' ? 'category' : type === 'SOIL' ? 'landscape' : 'potted_plant'}
                                    </span>
                                </div>
                                <h3 className="font-black text-2xl text-gray-800">
                                    {type === 'CONTAINER' ? 'Bình Thủy Tinh' : type === 'SOIL' ? 'Đất / Nền' : 'Cây Trồng'}
                                </h3>
                            </div>
                            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                                {typeComponents.length} phân loại
                            </span>
                        </div>

                        {typeComponents.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Chưa có nguyên liệu nào. Hãy thêm mới!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {typeComponents.map(item => (
                                    <div key={item.id} className="relative group bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full -z-0 transition-transform group-hover:scale-150 duration-500 ${
                                            type === 'CONTAINER' ? 'bg-blue-500' : type === 'SOIL' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}></div>
                                        <div className="absolute top-3 right-3 flex opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
                                            <button onClick={() => {
                                                const itemCopy = { ...item };
                                                setFormData(itemCopy);
                                                setOriginalFormData(itemCopy);
                                                setImageFile(null);
                                                setImagePreview(item.image || "");
                                                setIsModalOpen(true);
                                            }} className="p-2 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer" title="Sửa"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                                            <div className="w-px bg-gray-200 my-1.5"></div>
                                            <button onClick={() => handleDeleteComponent(item.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors cursor-pointer" title="Xóa"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                        </div>
                                        <div className="flex flex-col gap-4 relative z-10">
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                                                {type === 'PLANT' ? (<img src={item.image || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=100&h=100&fit=crop"} alt={item.name} className="w-full h-full object-cover" />) : type === 'SOIL' ? (<div className="w-10 h-10 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: item.cssStyle || '#d7ccc8' }}></div>) : (<span className="material-symbols-outlined text-3xl text-gray-300">category</span>)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-primary transition-colors" title={item.name}>{item.name}</h4>
                                                <p className="text-primary font-black mt-1 text-base">{item.price.toLocaleString('vi-VN')}đ</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-1">Tồn kho: {item.stockQuantity ?? 0}</p>
                                                {type === 'CONTAINER' && (<p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed" title={item.description}>{item.description || "Chưa có mô tả"}</p>)}
                                                {type === 'PLANT' && (<div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="text-xs text-gray-500 flex justify-between"><span className="font-semibold">Tối đa / bình:</span> <span className="text-gray-800 font-medium">{item.maxPerContainer || 1}</span></p><p className="text-xs text-gray-500 flex justify-between"><span className="font-semibold">Ánh sáng:</span> <span className="text-gray-800 font-medium">{item.light || '-'}</span></p><p className="text-xs text-gray-500 flex justify-between"><span className="font-semibold">Độ ẩm:</span> <span className="text-gray-800 font-medium">{item.humidity || '-'}</span></p><p className="text-xs text-gray-500 flex justify-between"><span className="font-semibold">Mức độ:</span> <span className="text-emerald-600 font-bold bg-white px-2 py-0.5 rounded shadow-sm">{item.careLevel || '-'}</span></p></div>)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* MODAL THÊM/SỬA COMPONENT */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center"><h3 className="font-bold text-lg">{formData.id ? 'Sửa' : 'Thêm'} {formData.type === 'CONTAINER' ? 'Bình Thủy Tinh' : formData.type === 'SOIL' ? 'Đất Nền' : formData.type === 'PLANT' ? 'Cây Trồng' : 'Nguyên Liệu'}</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button></div>
                        <form onSubmit={handleSaveComponent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                            <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 border rounded-lg font-bold hover:bg-gray-50 transition-colors">Hủy</button><button type="submit" disabled={isSubmitting || (formData.id && !hasChanges)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-[#2f5146] transition-colors disabled:bg-gray-400 flex items-center gap-2">{isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> : null}{formData.id ? 'Lưu Thay Đổi' : 'Thêm Nguyên Liệu'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}