import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

type PromotionType = 'SHOP' | 'CATEGORY' | 'PRODUCT' | 'SHIPPING';
type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE';

interface EditPromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: { id: number, name: string }[];
    products: { id: number, name: string }[];
    promoData: any | null;
}

export default function EditPromotionModal({ isOpen, onClose, onSuccess, categories, products, promoData }: EditPromotionModalProps) {
    const [currentPromo, setCurrentPromo] = useState<any>({});
    const [originalPromo, setOriginalPromo] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && promoData) {
            const formatted = {
                ...promoData,
                startDate: promoData.startDate ? promoData.startDate.slice(0, 16) : "",
                endDate: promoData.endDate ? promoData.endDate.slice(0, 16) : ""
            };
            setCurrentPromo(formatted);
            setOriginalPromo(formatted);
        }
    }, [isOpen, promoData]);

    // Hàm tính toán tự động: Kiểm tra xem Form có bị thay đổi so với dữ liệu gốc không
    const hasChanges = useMemo(() => {
        if (!isOpen) return false;
        const currentPayload = {
            name: currentPromo.name?.trim() || "",
            description: currentPromo.description || "",
            type: currentPromo.type,
            discountType: currentPromo.discountType,
            discountValue: currentPromo.discountValue || 0,
            minOrderValue: currentPromo.minOrderValue || 0,
            maxDiscountValue: currentPromo.maxDiscountValue || 0,
            isActive: currentPromo.isActive,
            startDate: currentPromo.startDate || "",
            endDate: currentPromo.endDate || "",
            targetId: currentPromo.targetId || "",
            quantity: currentPromo.quantity || 0
        };
        const originalPayload = {
            name: originalPromo.name?.trim() || "",
            description: originalPromo.description || "",
            type: originalPromo.type,
            discountType: originalPromo.discountType,
            discountValue: originalPromo.discountValue || 0,
            minOrderValue: originalPromo.minOrderValue || 0,
            maxDiscountValue: originalPromo.maxDiscountValue || 0,
            isActive: originalPromo.isActive,
            startDate: originalPromo.startDate || "",
            endDate: originalPromo.endDate || "",
            targetId: originalPromo.targetId || "",
            quantity: originalPromo.quantity || 0
        };
        return JSON.stringify(currentPayload) !== JSON.stringify(originalPayload);
    }, [currentPromo, originalPromo, isOpen]);

    const handleSavePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPromo.id || !hasChanges) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const payload = {
                name: currentPromo.name?.trim(),
                description: currentPromo.description,
                type: currentPromo.type,
                discountType: currentPromo.discountType,
                discountValue: currentPromo.discountValue || 0,
                minOrderValue: currentPromo.minOrderValue || 0,
                maxDiscountValue: currentPromo.maxDiscountValue || 0,
                isActive: currentPromo.isActive,
                startDate: currentPromo.startDate?.length === 16 ? `${currentPromo.startDate}:00` : currentPromo.startDate,
                endDate: currentPromo.endDate?.length === 16 ? `${currentPromo.endDate}:00` : currentPromo.endDate,
                targetId: currentPromo.targetId,
                targetName: currentPromo.targetName,
                quantity: currentPromo.quantity || 0
            };

            await axios.put(`http://localhost:8080/api/promotions/${currentPromo.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast("Cập nhật khuyến mãi thành công!", 2000);
            onClose();
            onSuccess();
        } catch (error) {
            console.error("Lỗi khi lưu khuyến mãi:", error);
            showErrorToast("Có lỗi xảy ra khi lưu khuyến mãi.", 2000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-20">
                    <h3 className="font-bold text-lg text-gray-800">Chỉnh Sửa Mã Khuyến Mãi</h3>
                    <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSavePromo} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-32">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Mã Khuyến Mãi (Để trống tự tạo)</label>
                                <input
                                    type="text"
                                    value={currentPromo.name || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, name: e.target.value })}
                                    placeholder="VD: FREESHIP, SALE20 (Tùy chọn)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors uppercase"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Mô tả khuyến mãi</label>
                                <textarea
                                    rows={3}
                                    value={currentPromo.description || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, description: e.target.value })}
                                    placeholder="VD: Giảm 20% cho đơn hàng..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors overflow-y-auto resize-y [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Loại Khuyến Mãi <span className="text-red-500">*</span></label>
                                <CustomSelect
                                    value={currentPromo.type || 'SHOP'}
                                    onChange={(val) => {
                                        if (val !== currentPromo.type) {
                                            setCurrentPromo({ ...currentPromo, type: val as PromotionType, targetId: undefined, targetName: '' });
                                        }
                                    }}
                                    options={[
                                        { value: 'SHOP', label: 'Cho tất cả sản phẩm (Toàn shop)' },
                                        { value: 'CATEGORY', label: 'Cho danh mục' },
                                        { value: 'PRODUCT', label: 'Cho từng sản phẩm' },
                                        { value: 'SHIPPING', label: 'Mã vận chuyển' }
                                    ]}
                                />
                            </div>

                            {currentPromo.type === 'CATEGORY' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Chọn Danh Mục Áp Dụng <span className="text-red-500">*</span></label>
                                    <CustomSelect
                                        value={currentPromo.targetId || ''}
                                        placeholder="-- Chọn danh mục --"
                                        onChange={(val) => {
                                            const id = Number(val);
                                            const name = categories.find(c => c.id === id)?.name;
                                            setCurrentPromo({ ...currentPromo, targetId: id, targetName: name });
                                        }}
                                        options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                                    />
                                </div>
                            )}

                            {currentPromo.type === 'PRODUCT' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">Chọn Sản Phẩm Áp Dụng <span className="text-red-500">*</span></label>
                                    <CustomSelect
                                        value={currentPromo.targetId || ''}
                                        placeholder="-- Chọn sản phẩm --"
                                        onChange={(val) => {
                                            const id = Number(val);
                                            const name = products.find(p => p.id === id)?.name;
                                            setCurrentPromo({ ...currentPromo, targetId: id, targetName: name });
                                        }}
                                        options={products.map(prod => ({ value: prod.id, label: prod.name }))}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Kiểu giảm</label>
                                <CustomSelect
                                    value={currentPromo.discountType || 'PERCENTAGE'}
                                    onChange={(val) => setCurrentPromo({ ...currentPromo, discountType: val as DiscountType })}
                                    options={[
                                        { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                                        { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' },
                                        { value: 'FREE', label: 'Miễn phí (Free)' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Mức giảm {currentPromo.discountType === 'PERCENTAGE' ? '(%)' : currentPromo.discountType === 'FIXED_AMOUNT' ? '(VNĐ)' : '(Bỏ qua nếu FREE)'}
                                </label>
                                <input
                                    type="number"
                                    value={currentPromo.discountValue || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, discountValue: e.target.value === '' ? '' : Number(e.target.value) })}
                                    placeholder="0"
                                    disabled={currentPromo.discountType === 'FREE'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Giá trị đơn tối thiểu (VNĐ)</label>
                                <input
                                    type="number"
                                    value={currentPromo.minOrderValue || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, minOrderValue: e.target.value === '' ? '' : Number(e.target.value) })}
                                    placeholder="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Giảm tối đa (VNĐ) {currentPromo.discountType === 'FIXED_AMOUNT' ? '(Có thể bỏ qua)' : ''}
                                </label>
                                <input
                                    type="number"
                                    value={currentPromo.maxDiscountValue || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, maxDiscountValue: e.target.value === '' ? '' : Number(e.target.value) })}
                                    placeholder="0"
                                    disabled={currentPromo.discountType === 'FREE'}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Số lượng mã</label>
                                <input
                                    type="number"
                                    value={currentPromo.quantity ?? ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                                    placeholder="VD: 100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Trạng thái</label>
                                <CustomSelect
                                    value={currentPromo.isActive ? 'TRUE' : 'FALSE'}
                                    onChange={(val) => setCurrentPromo({ ...currentPromo, isActive: val === 'TRUE' })}
                                    options={[
                                        { value: 'TRUE', label: 'Hoạt động' },
                                        { value: 'FALSE', label: 'Đang ẩn' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={currentPromo.startDate || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors cursor-text"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Thời gian kết thúc <span className="text-red-500">*</span></label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={currentPromo.endDate || ''}
                                    onChange={(e) => setCurrentPromo({ ...currentPromo, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[#406D5E] focus:ring-1 focus:ring-[#406D5E] transition-colors cursor-text"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t bg-white sticky bottom-0 z-20 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                            Hủy Bỏ
                        </button>
                        <button type="submit" disabled={!hasChanges || isSubmitting} className="px-8 py-2.5 rounded-xl bg-[#406D5E] text-white font-bold hover:bg-[#2f5146] transition-colors shadow-lg shadow-[#406D5E]/30 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? (
                                <><span className="material-symbols-outlined animate-spin text-lg">autorenew</span> Đang lưu...</>
                            ) : (
                                <><span className="material-symbols-outlined text-lg">save</span> Lưu thay đổi</>
                            )}
                        </button>
                        </div>
                </form>
            </div>
        </div>
    );
}

function CustomSelect({ value, onChange, options, disabled = false, placeholder = "" }: {
    value: string | number;
    onChange: (val: string | number) => void;
    options: { value: string | number; label: string }[];
    disabled?: boolean;
    placeholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    return (
        <div className={`relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`} ref={ref}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 pr-10 border rounded-lg outline-none transition-all bg-white flex items-center justify-between select-none
                    ${isOpen ? 'border-[#406D5E] ring-1 ring-[#406D5E]' : 'border-gray-300'}
                    ${!disabled ? 'hover:border-gray-400 cursor-pointer' : ''}`}
            >
                <span className={`font-medium truncate ${selectedOption ? 'text-gray-700' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 transition-transform duration-200 pointer-events-none ${isOpen ? 'rotate-180 text-[#406D5E]' : 'text-gray-500'}`}>
                    expand_more
                </span>
            </div>
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 py-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors
                                ${String(value) === String(opt.value) ? 'bg-[#E8F1EE] text-[#406D5E]' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}