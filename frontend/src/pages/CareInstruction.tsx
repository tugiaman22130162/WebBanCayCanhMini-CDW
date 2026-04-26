import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function CareInstruction() {
    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pb-24 font-body">
                {/* Hero Section */}
                <div className="relative pt-[84px] h-[350px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/about.png" 
                            alt="Care Instructions" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                    <div className="relative z-10 text-center text-white px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl font-black mb-4">Hướng Dẫn Chăm Sóc</h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-white/90">
                            Bí quyết giữ cho những mầm xanh của bạn luôn tươi tốt và khỏe mạnh.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-5xl mx-[20px] lg:mx-auto mt-16 space-y-16">
                    
                    {/* Mục 1: Terrarium */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 hover:shadow-md transition-shadow">
                        <div className="md:w-1/3 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl">water_drop</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary mb-2">Terrarium</h2>
                            <p className="text-gray-500 text-sm">Hệ sinh thái bình kín/hở</p>
                        </div>
                        <div className="md:w-2/3 grid sm:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-500">water</span> Tưới nước
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Bình kín: Chỉ phun sương 1-2 lần/tháng nếu thấy thành bình hết đọng nước. Bình hở: Tưới phun sương nhẹ 2-3 lần/tuần.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-yellow-500">light_mode</span> Ánh sáng
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Ánh sáng tự nhiên gián tiếp hoặc đèn LED chuyên dụng. Tuyệt đối không để dưới ánh nắng gắt mặt trời sẽ làm "chín" cây.
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-400">thermostat</span> Nhiệt độ & Độ ẩm
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Nhiệt độ phòng lý tưởng từ 18°C - 28°C. Nếu bình kín có quá nhiều hơi nước, hãy mở nắp khoảng 2-3 tiếng để thông thoáng.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mục 2: Sen Đá */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 hover:shadow-md transition-shadow">
                        <div className="md:w-1/3 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl">potted_plant</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary mb-2">Sen Đá</h2>
                            <p className="text-gray-500 text-sm">Cây ưa sáng, chịu hạn tốt</p>
                        </div>
                        <div className="md:w-2/3 grid sm:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-500">water</span> Tưới nước
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Tưới rất ít, 1-2 lần/tuần. Tưới sát gốc, tránh để nước đọng trên lá gây úng. Đợi đất khô hoàn toàn mới tưới tiếp.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-yellow-500">light_mode</span> Ánh sáng
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Cần nhiều ánh sáng, nên phơi nắng sáng sớm (6h-9h). Để trong nhà cần đặt cạnh cửa sổ có nắng chiếu vào.
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-red-400">thermostat</span> Nhiệt độ & Độ ẩm
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Nhiệt độ phát triển lý tưởng từ 15°C - 30°C. Sen đá ưa môi trường khô ráo, thoáng mát. Tránh để nơi có độ ẩm cao kéo dài vì dễ làm cây bị úng nhũn và sinh nấm bệnh.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mục 3: Cây để bàn */}
                    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-10 hover:shadow-md transition-shadow">
                        <div className="md:w-1/3 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-5xl">local_florist</span>
                            </div>
                            <h2 className="text-2xl font-bold text-primary mb-2">Cây Để Bàn</h2>
                            <p className="text-gray-500 text-sm">Lọc không khí, trang trí văn phòng</p>
                        </div>
                        <div className="md:w-2/3 grid sm:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-blue-500">water</span> Tưới nước
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Tưới 1-2 lần/tuần khi thấy bề mặt đất khô (khoảng 2-3cm). Tránh tưới quá đẫm gây úng rễ. Đảm bảo chậu có lỗ thoát nước tốt.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-yellow-500">light_mode</span> Ánh sáng
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Ưa ánh sáng gián tiếp hoặc ánh sáng đèn huỳnh quang văn phòng. Tránh ánh nắng gắt trực tiếp làm cháy lá.
                                </p>
                            </div>
                            <div className="sm:col-span-2">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-emerald-500">eco</span> Vệ sinh lá & Bón phân
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Dùng khăn mềm, ẩm lau nhẹ bề mặt lá 1-2 tuần/lần để cây quang hợp tốt hơn. Có thể bổ sung phân bón dạng lỏng hoặc viên nén mỗi tháng một lần.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lưu ý chung */}
                    <div className="bg-[#E8F1EE] rounded-3xl p-8 md:p-10 border border-[#B7E7D5]">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-[#406D5E] text-3xl">info</span>
                            <h2 className="text-2xl font-bold text-[#406D5E]">Lưu ý chung</h2>
                        </div>
                        <ul className="space-y-4 text-[#2f5146] font-medium">
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                                Luôn kiểm tra độ ẩm của đất trước khi tưới bằng cách chạm nhẹ ngón tay vào bề mặt đất.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg mt-0.5">check_circle</span>
                                Tránh thay đổi môi trường sống (nhiệt độ, ánh sáng) của cây một cách quá đột ngột.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}