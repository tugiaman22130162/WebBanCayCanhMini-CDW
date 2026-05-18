import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";

interface CheckoutAddressProps {
    shippingAddress: string;
    setShippingAddress: (id: string) => void;
    addresses: any[];
    setAddresses: (addresses: any[]) => void;
    showToast: (icon: 'success' | 'error' | 'warning', title: string) => void;
}

export default function CheckoutAddress({ shippingAddress, setShippingAddress, addresses, setAddresses, showToast }: CheckoutAddressProps) {
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [addressModalMode, setAddressModalMode] = useState<'ADD' | 'EDIT'>('ADD');
    const [newAddress, setNewAddress] = useState({
        id: '', name: '', phone: '', province: '', district: '', ward: '', street: '', type: 'Nhà riêng', isDefault: false, provinceId: 0, districtId: 0, wardCode: ''
    });

    const [provinces, setProvinces] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [wards, setWards] = useState<any[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number>(0);
    const [selectedWardId, setSelectedWardId] = useState<string>("");

    // Gọi qua Backend Spring Boot
    const GHN_API_BASE = "http://localhost:8080/api/ghn";

    const fetchAddresses = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const response = await axios.get("http://localhost:8080/api/addresses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAddresses(response.data);
            
            // Tự động chọn địa chỉ nếu chưa chọn
            if (!shippingAddress || shippingAddress === "home") {
                const defaultAddr = response.data.find((a: any) => a.isDefault);
                if (defaultAddr) {
                    setShippingAddress(String(defaultAddr.id));
                } else if (response.data.length > 0) {
                    setShippingAddress(String(response.data[0].id));
                }
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách địa chỉ:", error);
        }
    };

    useEffect(() => {
        fetchAddresses();
        // Lấy danh sách Tỉnh/Thành từ GHN
        axios.get(`${GHN_API_BASE}/provinces`)
            .then(res => {
                if (res.data.code === 200) setProvinces(res.data.data);
            })
            .catch(console.error);
    }, []);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedProvinceId(id);
        setSelectedDistrictId(0);
        setSelectedWardId("");
        const name = provinces.find(p => p.ProvinceID === id)?.ProvinceName || '';
        setNewAddress({ ...newAddress, province: name, provinceId: id, district: '', districtId: 0, ward: '', wardCode: '' });
        setDistricts([]);
        setWards([]);
        if (id) {
            axios.get(`${GHN_API_BASE}/districts`, {
                params: { province_id: id }
            })
                .then(res => {
                    if (res.data.code === 200) setDistricts(res.data.data);
                })
                .catch(console.error);
        }
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedDistrictId(id);
        setSelectedWardId("");
        const name = districts.find(d => d.DistrictID === id)?.DistrictName || '';
        setNewAddress({ ...newAddress, district: name, districtId: id, ward: '', wardCode: '' });
        setWards([]);
        if (id) {
            axios.get(`${GHN_API_BASE}/wards`, {
                params: { district_id: id }
            })
                .then(res => {
                    if (res.data.code === 200) setWards(res.data.data);
                })
                .catch(console.error);
        }
    };

    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedWardId(id);
        const name = wards.find(w => w.WardCode === id)?.WardName || '';
        setNewAddress({ ...newAddress, ward: name, wardCode: id });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const payload = {
            receiverName: newAddress.name,
            phone: newAddress.phone,
            province: newAddress.province,
            district: newAddress.district,
            ward: newAddress.ward,
            provinceId: newAddress.provinceId,
            districtId: newAddress.districtId,
            wardCode: newAddress.wardCode,
            street: newAddress.street,
            type: newAddress.type === 'Nhà riêng' ? 'HOME' : newAddress.type === 'Công ty' ? 'COMPANY' : 'OTHER',
            isDefault: newAddress.isDefault
        };

        try {
            if (addressModalMode === 'ADD') {
                const res = await axios.post("http://localhost:8080/api/addresses", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setShippingAddress(String(res.data.id));
                showToast('success', 'Đã thêm địa chỉ mới thành công!');
            } else {
                await axios.put(`http://localhost:8080/api/addresses/${newAddress.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast('success', 'Đã cập nhật địa chỉ thành công!');
            }
            setIsAddressModalOpen(false);
            fetchAddresses();
        } catch (error) {
            showToast('error', 'Có lỗi xảy ra khi lưu địa chỉ!');
        }
    };

    const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        Swal.fire({
            title: 'Xóa địa chỉ?',
            text: "Bạn có chắc chắn muốn xóa địa chỉ này?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-red-600',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-3 hover:bg-gray-300'
            },
            buttonsStyling: false
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem("token");
                try {
                    await axios.delete(`http://localhost:8080/api/addresses/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (String(shippingAddress) === String(id)) {
                        setShippingAddress("");
                    }
                    showToast('success', 'Đã xóa địa chỉ!');
                    fetchAddresses();
                } catch (error) {
                    showToast('error', 'Có lỗi xảy ra khi xóa địa chỉ!');
                }
            }
        });
    };

    const handleEditAddress = (addr: any, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setAddressModalMode('EDIT');
        setNewAddress({ 
            ...addr, 
            name: addr.receiverName || addr.name,
            type: addr.type === 'HOME' ? 'Nhà riêng' : addr.type === 'COMPANY' ? 'Công ty' : 'Địa chỉ khác',
            isDefault: addr.isDefault || false,
            provinceId: addr.provinceId || 0,
            districtId: addr.districtId || 0,
            wardCode: addr.wardCode || ''
        });
        
        const pId = addr.provinceId || provinces.find(p => p.ProvinceName === addr.province)?.ProvinceID || 0;
        setSelectedProvinceId(pId);
        
        if (pId) {
            axios.get(`${GHN_API_BASE}/districts?province_id=${pId}`)
                .then(res => {
                    if (res.data.code === 200) {
                        setDistricts(res.data.data);
                        const dId = addr.districtId || res.data.data.find((d: any) => d.DistrictName === addr.district)?.DistrictID || 0;
                        setSelectedDistrictId(dId);
                        if (dId) {
                            axios.get(`${GHN_API_BASE}/wards?district_id=${dId}`)
                                .then(wRes => {
                                    if (wRes.data.code === 200) {
                                        setWards(wRes.data.data);
                                        const wId = addr.wardCode || wRes.data.data.find((w: any) => w.WardName === addr.ward)?.WardCode || "";
                                        setSelectedWardId(String(wId));
                                    }
                                });
                        } else {
                            setSelectedWardId("");
                        }
                    }
                });
        } else {
            setSelectedDistrictId(0);
            setSelectedWardId("");
        }
        setIsAddressModalOpen(true);
    };
    
    const handleOpenAddAddress = () => {
        setAddressModalMode('ADD');
        setNewAddress({ id: '', name: '', phone: '', province: '', district: '', ward: '', street: '', type: 'Nhà riêng', isDefault: false, receiverName: '', provinceId: 0, districtId: 0, wardCode: '' } as any);
        setSelectedProvinceId(0);
        setSelectedDistrictId(0);
        setSelectedWardId("");
        setDistricts([]);
        setWards([]);
        setIsAddressModalOpen(true);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#406D5E]">Địa chỉ giao hàng</h2>
                    <button 
                        onClick={handleOpenAddAddress}
                        className="flex bg-info-bg rounded-[10px] items-center gap-2 text-sm font-semibold text-[#406D5E] hover:text-[#2f5146] px-3 py-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        <span>Thêm địa chỉ</span>
                    </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.length === 0 ? (
                        <div className="col-span-2 text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            Chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ!
                        </div>
                    ) : addresses.map(addr => (
                        <label key={addr.id} className="relative cursor-pointer group">
                            <input type="radio" name="shippingAddress" value={addr.id} checked={String(shippingAddress) === String(addr.id)} onChange={(e) => setShippingAddress(e.target.value)} className="absolute opacity-0 w-0 h-0" />
                            <div className={`p-4 rounded-lg border-2 transition-all h-full flex flex-col ${String(shippingAddress) === String(addr.id) ? 'border-[#406D5E] bg-[#E8F1EE]' : 'border-gray-200 bg-gray-50 hover:border-gray-400'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined">{addr.type === 'HOME' ? 'home' : addr.type === 'COMPANY' ? 'apartment' : 'location_on'}</span>
                                        {addr.type === 'HOME' ? 'Nhà riêng' : addr.type === 'COMPANY' ? 'Công ty' : 'Địa chỉ khác'}
                                        {addr.isDefault && (
                                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Mặc định</span>
                                        )}
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0">
                                        {String(shippingAddress) === String(addr.id) && <div className="w-3 h-3 rounded-full bg-[#406D5E]"></div>}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800 mb-1">{addr.receiverName || addr.name} - {addr.phone}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button type="button" onClick={(e) => handleEditAddress(addr, e)} className="text-sm font-semibold text-[#406D5E] hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
                                    </button>
                                    <button type="button" onClick={(e) => handleDeleteAddress(addr.id, e)} className="text-sm font-semibold text-red-500 hover:underline flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
                                    </button>
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {isAddressModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-50 duration-300">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold text-lg text-[#406D5E]">{addressModalMode === 'ADD' ? 'Địa chỉ giao hàng mới' : 'Chỉnh sửa địa chỉ'}</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Loại địa chỉ</label><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addrType" value="Nhà riêng" checked={newAddress.type === 'Nhà riêng'} onChange={(e) => setNewAddress({...newAddress, type: e.target.value})} className="accent-primary" /><span className="text-sm font-medium">Nhà riêng</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addrType" value="Công ty" checked={newAddress.type === 'Công ty'} onChange={(e) => setNewAddress({...newAddress, type: e.target.value})} className="accent-primary" /><span className="text-sm font-medium">Công ty</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addrType" value="Địa chỉ khác" checked={newAddress.type === 'Địa chỉ khác'} onChange={(e) => setNewAddress({...newAddress, type: e.target.value})} className="accent-primary" /><span className="text-sm font-medium">Khác</span></label></div></div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Họ và tên</label><input type="text" placeholder="Nguyễn Văn A" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" required /></div>
                            <div><label className="block text-sm font-semibold mb-1 text-gray-700">Số điện thoại</label><input type="tel" placeholder="0987654321" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} pattern="[0-9]{10}" maxLength={10} title="Vui lòng nhập đúng 10 chữ số" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" required /></div>
                            <div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">Tỉnh/Thành phố</label>
                                        <select value={selectedProvinceId || ""} onChange={handleProvinceChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white" required>
                                            <option value="" disabled>Chọn Tỉnh/Thành</option>
                                            {provinces.map(p => (
                                                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">Quận/Huyện</label>
                                        <select value={selectedDistrictId || ""} onChange={handleDistrictChange} disabled={!selectedProvinceId} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white disabled:bg-gray-100" required>
                                            <option value="" disabled>Chọn Quận/Huyện</option>
                                            {districts.map(d => (
                                                <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">Phường/Xã</label>
                                        <select value={selectedWardId || ""} onChange={handleWardChange} disabled={!selectedDistrictId} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white disabled:bg-gray-100" required>
                                            <option value="" disabled>Chọn Phường/Xã</option>
                                            {wards.map(w => (
                                                <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Địa chỉ cụ thể (Số nhà, Tên đường...)</label>
                                <input type="text" placeholder="VD: 123 Đường ABC" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-2" required />
                                <label className="flex items-center gap-2 cursor-pointer mt-4">
                                    <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 accent-primary" />
                                    <span className="text-sm font-medium text-gray-700">Đặt làm địa chỉ mặc định</span>
                                </label>
                            </div>
                            <div className="pt-4 mt-2 border-t flex justify-end gap-3"><button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Hủy</button><button type="submit" className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-[#2f5146] transition-colors">{addressModalMode === 'ADD' ? 'Lưu địa chỉ' : 'Cập nhật'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}