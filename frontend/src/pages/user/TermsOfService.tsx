import React from "react";
import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const termsData = [
    {
        id: "general",
        title: "1. Quy định chung",
        icon: "gavel",
        content: "Chào mừng bạn đến với MiniGarden. Bằng việc truy cập và mua sắm tại website của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Xin vui lòng đọc kỹ trước khi quyết định mua hàng. MiniGarden có quyền thay đổi, chỉnh sửa hoặc cập nhật các điều khoản này bất cứ lúc nào mà không cần báo trước."
    },
    {
        id: "products",
        title: "2. Thông tin sản phẩm cây cảnh",
        icon: "potted_plant",
        content: "Cây cảnh và Terrarium là sản phẩm tự nhiên, do đó mỗi cây sẽ có hình dáng, kích thước và màu sắc chênh lệch đôi chút so với ảnh mẫu trên website (khoảng 5-10%). Chúng tôi cam kết giao đúng giống cây và đảm bảo cây luôn ở trạng thái khỏe mạnh nhất khi xuất vườn."
    },
    {
        id: "shipping",
        title: "3. Vận chuyển và Đóng gói",
        icon: "local_shipping",
        content: "Vì đặc thù là hàng dễ vỡ (bình thủy tinh, chậu gốm) và cây xanh sống, MiniGarden áp dụng quy trình đóng gói nhiều lớp cực kỳ cẩn thận. Thời gian giao hàng dự kiến từ 1-3 ngày (nội thành) và 3-5 ngày (ngoại tỉnh). Trong một số điều kiện thời tiết khắc nghiệt, chúng tôi có thể xin phép lùi lịch giao để đảm bảo an toàn cho cây."
    },
    {
        id: "return",
        title: "4. Chính sách Đổi trả & Bảo hành",
        icon: "assignment_return",
        content: "Chúng tôi bảo hành 1 ĐỔI 1 hoặc HOÀN TIỀN 100% trong vòng 3 ngày đầu tiên nếu: \n- Cây bị dập nát, gãy cành nặng do quá trình vận chuyển.\n- Bình thủy tinh, chậu gốm bị nứt vỡ.\n*Lưu ý: Quý khách vui lòng quay lại video quá trình mở hộp (unbox) để được hỗ trợ giải quyết khiếu nại nhanh nhất. Các trường hợp cây chết do chăm sóc sai cách sẽ không được bảo hành."
    },
    {
        id: "privacy",
        title: "5. Bảo mật thông tin",
        icon: "shield_lock",
        content: "MiniGarden tôn trọng và cam kết bảo mật tuyệt đối thông tin cá nhân của khách hàng. Thông tin của bạn (Tên, Số điện thoại, Địa chỉ, Email) chỉ được sử dụng cho mục đích xử lý đơn hàng và hỗ trợ chăm sóc khách hàng, hoàn toàn không cung cấp cho bên thứ ba với mục đích thương mại."
    }
];

export default function TermsOfService() {
    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pb-24 font-body">
                {/* Hero Section */}
                <div className="relative pt-[84px] h-[450px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/terms.png" 
                            alt="Điều khoản dịch vụ" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                    <div className="relative z-10 text-center text-white px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                            <span className="material-symbols-outlined text-4xl text-white">gavel</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md">Điều Khoản Dịch Vụ</h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-white/90 drop-shadow-sm">
                            Cam kết minh bạch và bảo vệ quyền lợi của bạn tại MiniGarden.
                        </p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-[-50px] relative z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex justify-center mb-10"
                    >
                        <p className="text-sm font-semibold text-gray-600 italic bg-white/90 backdrop-blur-md py-2.5 px-6 rounded-full shadow-md border border-gray-100">
                            <span className="material-symbols-outlined text-[16px] align-text-bottom mr-2 text-primary">update</span>
                            Cập nhật lần cuối: 25/04/2026
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {termsData.map((term, index) => (
                                <motion.div 
                                    key={term.id} 
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                    className="group bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-50 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all duration-500 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden"
                                >
                                    {/* Background accent */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full -z-0 transition-transform group-hover:scale-125 duration-700 opacity-70"></div>
                                    
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-sm z-10 border border-emerald-100 group-hover:border-primary">
                                        <span className="material-symbols-outlined text-3xl">{term.icon}</span>
                                    </div>
                                    <div className="z-10 flex-1">
                                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                                            {term.title}
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                            {term.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>

                    {/* Image Break Section */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8 }}
                        className="my-16 rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[21/7] relative group shadow-lg"
                    >
                        <img 
                            src="/images/about-1.png" 
                            alt="Mầm xanh vươn lên" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-16">
                            <div className="max-w-lg">
                                <span className="px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block shadow-sm">Tin Cậy</span>
                                <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 drop-shadow-md">
                                    Mọi mầm xanh đều được nâng niu trước khi đến tay bạn.
                                </h3>
                                <p className="text-white/90 font-medium">Bảo vệ môi trường đi đôi với bảo vệ quyền lợi người tiêu dùng.</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact CTA */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 text-center border border-gray-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-0"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">Bạn vẫn còn thắc mắc?</h3>
                            <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg">Đội ngũ CSKH của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn.</p>
                            <Link to="/about" className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-[#2f5146] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Liên hệ ngay <span className="material-symbols-outlined text-[20px]">support_agent</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
}