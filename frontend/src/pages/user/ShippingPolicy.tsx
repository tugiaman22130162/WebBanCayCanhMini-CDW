import React from "react";
import MainLayout from "../../layouts/MainLayout";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const shippingData = [
    {
        id: "fees",
        title: "1. Phí vận chuyển",
        icon: "payments",
        content: "MiniGarden áp dụng mức phí vận chuyển đồng giá 30.000đ cho tất cả các đơn hàng tiêu chuẩn trên toàn quốc. Đặc biệt, MIỄN PHÍ GIAO HÀNG (Freeship) cho các đơn hàng có tổng giá trị từ 500.000đ trở lên."
    },
    {
        id: "time",
        title: "2. Thời gian giao hàng",
        icon: "schedule",
        content: "- Khu vực nội thành TP.HCM: Giao hàng trong vòng 1-2 ngày làm việc.\n- Khu vực ngoại thành và các tỉnh/thành khác: Giao hàng từ 3-5 ngày làm việc.\n*Lưu ý: Thời gian giao hàng không tính các ngày Chủ nhật, Lễ, Tết. Đối với sản phẩm Terrarium thiết kế riêng, thời gian chuẩn bị có thể kéo dài thêm 1-2 ngày."
    },
    {
        id: "packaging",
        title: "3. Quy cách đóng gói an toàn",
        icon: "inventory_2",
        content: "Vì đặc thù là cây xanh sống và bình thủy tinh/gốm sứ dễ vỡ, mỗi sản phẩm tại MiniGarden đều được đóng gói theo quy chuẩn nghiêm ngặt 4 lớp:\n1. Bọc giấy mềm giữ ẩm cho rễ cây.\n2. Cố định cây trong chậu bằng lớp màng bọc chuyên dụng.\n3. Quấn nhiều lớp xốp chống sốc (bubble wrap) quanh bình/chậu.\n4. Đóng gói trong thùng carton cứng cáp và dán tem 'Hàng Dễ Vỡ'."
    },
    {
        id: "tracking",
        title: "4. Theo dõi tình trạng đơn hàng",
        icon: "location_on",
        content: "Ngay sau khi đơn hàng được giao cho đơn vị vận chuyển, bạn sẽ nhận được một email/tin báo chứa Mã vận đơn. Bạn có thể sử dụng mã này để tra cứu trực tiếp trên website của đối tác giao hàng hoặc xem ngay trong mục 'Đơn hàng của tôi' trên trang cá nhân."
    },
    {
        id: "issues",
        title: "5. Xử lý sự cố khi nhận hàng",
        icon: "support_agent",
        content: "Nếu gói hàng có dấu hiệu móp méo, ướt sũng hoặc nghi ngờ cây bên trong bị hỏng hóc, vui lòng khoan từ chối nhận hàng. Hãy nhận hàng, quay lại video toàn bộ quá trình mở hộp (unbox) rõ nét và liên hệ ngay với Hotline/Fanpage của MiniGarden trong vòng 24h. Chúng tôi cam kết bảo hành 1 đổi 1 hoặc hoàn tiền nhanh chóng cho các trường hợp rủi ro do quá trình vận chuyển."
    }
];

export default function ShippingPolicy() {
    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pb-24 font-body">
                {/* Hero Section */}
                <div className="relative pt-[84px] h-[450px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=1600&q=80" 
                            alt="Chính sách vận chuyển" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                    </div>
                    <div className="relative z-10 text-center text-white px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/30">
                            <span className="material-symbols-outlined text-4xl text-white">local_shipping</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md">Chính Sách Vận Chuyển</h1>
                        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto text-white/90 drop-shadow-sm">
                            Giao hàng nhanh chóng, đóng gói cẩn thận, đảm bảo mầm xanh luôn khỏe mạnh.
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
                        {shippingData.map((term, index) => (
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
                            src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=1200&q=80" 
                            alt="Đóng gói an toàn" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-16">
                            <div className="max-w-lg">
                                <span className="px-4 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block shadow-sm">Cam kết</span>
                                <h3 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 drop-shadow-md">
                                    Mỗi chậu cây đều được đóng gói như một món quà.
                                </h3>
                                <p className="text-white/90 font-medium">Bảo vệ an toàn tối đa cho mầm xanh trên mọi nẻo đường.</p>
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
                            <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-4">Bạn có yêu cầu giao hỏa tốc?</h3>
                            <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg">Liên hệ ngay với MiniGarden để được hỗ trợ sắp xếp các chuyến xe trong ngày (chỉ áp dụng nội thành).</p>
                            <Link to="/about" className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-[#2f5146] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                Liên hệ hỗ trợ <span className="material-symbols-outlined text-[20px]">support_agent</span>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </MainLayout>
    );
}