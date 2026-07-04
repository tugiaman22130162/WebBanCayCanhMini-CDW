import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

interface TerrariumInventoryProps {
    components: any[];
    onEdit: (component: any) => void;
    onDeleteSuccess: () => void;
}

export default function TerrariumInventory({ components, onEdit, onDeleteSuccess }: TerrariumInventoryProps) {

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
                onDeleteSuccess();
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
                                            <button onClick={() => onEdit(item)} className="p-2 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer" title="Sửa"><span className="material-symbols-outlined text-[18px]">edit</span></button>
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

        </div>
    );
}