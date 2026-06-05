import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

export default function TerrariumRequests() {
    const [designs, setDesigns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDesigns = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:8080/api/terrariums", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Sắp xếp mới nhất lên đầu
            const sortedData = response.data.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setDesigns(sortedData);
        } catch (error) {
            console.error("Lỗi lấy danh sách thiết kế:", error);
            showErrorToast("Không thể tải danh sách yêu cầu.", 3000);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDesigns();
    }, []);

    // Xử lý duyệt / từ chối
    const handleStatusChange = async (id: number, currentStatus: string) => {
        let newStatus = currentStatus;
        let adminReply = "";

        if (currentStatus === 'PENDING') {
            const result = await Swal.fire({
                title: 'Duyệt thiết kế này?',
                text: "Bạn xác nhận thiết kế này khả thi và có thể thực hiện?",
                icon: 'question',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Đồng ý duyệt',
                denyButtonText: `Từ chối`,
                cancelButtonText: 'Đóng',
                customClass: {
                    confirmButton: 'bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold mx-1',
                    denyButton: 'bg-red-500 text-white px-4 py-2 rounded-lg font-bold mx-1',
                    cancelButton: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold mx-1'
                },
                buttonsStyling: false
            });

            if (result.isConfirmed) {
                newStatus = 'APPROVED';
            } else if (result.isDenied) {
                const { value: text } = await Swal.fire({
                    input: 'textarea',
                    inputLabel: 'Lý do từ chối (Gửi cho khách)',
                    inputPlaceholder: 'Ví dụ: Hết bình tròn, cây này không hợp trồng chung...',
                    showCancelButton: true,
                    confirmButtonText: 'Xác nhận từ chối',
                    cancelButtonText: 'Hủy'
                });
                if (!text) return; // Hủy thao tác nếu không nhập
                newStatus = 'REJECTED';
                adminReply = text;
            } else {
                return;
            }
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:8080/api/terrariums/${id}/status`, {
                status: newStatus,
                adminReply: adminReply
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccessToast(`Đã ${newStatus === 'APPROVED' ? 'duyệt' : 'từ chối'} thiết kế!`, 2000);
            fetchDesigns();
        } catch (error) {
            showErrorToast("Có lỗi xảy ra khi cập nhật.", 2000);
        }
    };

    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'ORDERED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    
    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'PENDING': return 'Chờ duyệt';
            case 'APPROVED': return 'Đã duyệt';
            case 'REJECTED': return 'Từ chối';
            case 'ORDERED': return 'Khách đã đặt';
            default: return status;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                        <tr>
                            <th className="text-left p-4 pl-6">ID</th>
                            <th className="text-left p-4">Khách hàng</th>
                            <th className="text-left p-4 w-1/3">Bản thiết kế</th>
                            <th className="text-right p-4">Tổng tiền</th>
                            <th className="text-center p-4">Trạng thái</th>
                            <th className="text-right p-4 pr-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : designs.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Không có yêu cầu thiết kế nào.</td></tr>
                        ) : (
                            designs.map((design) => (
                                <tr key={design.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="p-4 pl-6 font-bold text-gray-600">#{design.id}</td>
                                    <td className="p-4"><p className="font-bold text-gray-800">{design.user?.fullName || 'Khách hàng'}</p><p className="text-xs text-gray-500">{new Date(design.createdAt).toLocaleString('vi-VN')}</p></td>
                                    <td className="p-4"><ul className="text-sm space-y-1 text-gray-700"><li><span className="font-semibold">Bình:</span> {design.containerName}</li><li><span className="font-semibold">Đất nền:</span> {design.soilName}</li><li><span className="font-semibold">Cây:</span> {design.plants}</li></ul>{design.userNote && (<div className="mt-2 bg-yellow-50 text-yellow-800 p-2 rounded text-xs border border-yellow-100"><span className="font-bold">Ghi chú:</span> {design.userNote}</div>)}{design.userImage && (
                                        <div className="mt-2">
                                            <span className="font-bold text-xs text-gray-600">Ảnh minh họa từ khách:</span>
                                            <img 
                                                src={design.userImage} 
                                                alt="Ảnh minh họa" 
                                                className="mt-1 w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:scale-150 transition-transform"
                                                onClick={() => Swal.fire({
                                                    imageUrl: design.userImage,
                                                    imageAlt: 'Ảnh minh họa từ khách hàng',
                                                    showConfirmButton: false,
                                                    backdrop: `rgba(0,0,0,0.7)`
                                                })}
                                            />
                                        </div>
                                    )}{design.adminReply && (<div className="mt-2 bg-red-50 text-red-800 p-2 rounded text-xs border border-red-100"><span className="font-bold">Lý do từ chối:</span> {design.adminReply}</div>)}</td>
                                    <td className="p-4 text-right font-bold text-emerald-600">{design.totalPrice.toLocaleString('vi-VN')}đ</td>
                                    <td className="p-4 text-center"><span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyles(design.status)}`}>{getStatusLabel(design.status)}</span></td>
                                    <td className="p-4 pr-6 text-right">{design.status === 'PENDING' && (<button onClick={() => handleStatusChange(design.id, design.status)} className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-[#2f5146] shadow-sm transition">Xử lý duyệt</button>)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}