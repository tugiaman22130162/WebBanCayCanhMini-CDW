import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function About() {
    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pb-20 font-body">
                {/* Hero Section */}
                <div className="relative pt-[84px] h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src="/images/about.png" alt="About MiniGarden" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                    <div className="relative z-10 text-center text-white px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-6xl font-black mb-4">Câu Chuyện Của MiniGarden</h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-white/90">Hành trình mang mầm xanh và sự bình yên vào không gian sống của bạn.</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-5xl mx-auto px-6 mt-16 space-y-24">
                    {/* Mission */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-primary mb-6">Sứ mệnh của chúng tôi</h2>
                            <p className="text-on-surface-variant leading-relaxed mb-4">
                                Tại MiniGarden, chúng tôi tin rằng thiên nhiên có sức mạnh chữa lành và làm dịu tâm hồn. Giữa cuộc sống đô thị nhộn nhịp và hối hả, một góc xanh nhỏ bé không chỉ là điểm nhấn trang trí mà còn là "trạm sạc" năng lượng tinh thần hiệu quả.
                            </p>
                            <p className="text-on-surface-variant leading-relaxed">
                                Sứ mệnh của chúng tôi là giúp mọi người dễ dàng mang thiên nhiên vào nhà, văn phòng hay bất kỳ không gian nào, thông qua các sản phẩm Terrarium thiết kế thủ công, cây cảnh mini và phụ kiện chất lượng cao.
                            </p>
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-lg h-[300px]">
                            <img src="/images/about-1.png" alt="Sứ mệnh" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        </div>
                    </div>

                    {/* Core Values */}
                    <div>
                        <h2 className="text-3xl font-bold text-center text-primary mb-12">Giá trị cốt lõi</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-3xl">diamond</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Chất lượng</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Mỗi sản phẩm đều được chọn lọc kỹ lưỡng, từ loại đất, giống cây cho đến lọ thủy tinh, đảm bảo độ bền và vẻ đẹp lâu dài.</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-3xl">favorite</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Tận tâm</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Chúng tôi luôn sẵn sàng lắng nghe, tư vấn và hỗ trợ khách hàng trong suốt quá trình thiết kế và chăm sóc cây.</p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:-translate-y-1 transition-all">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-3xl">psychiatry</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Sáng tạo</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">Không ngừng đổi mới trong thiết kế Terrarium, mang đến những tác phẩm nghệ thuật xanh độc đáo và cá nhân hóa.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}