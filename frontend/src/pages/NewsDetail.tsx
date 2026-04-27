import React, { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const mockRelatedNews = [
    {
        id: "2",
        title: "Top 5 cây để bàn giúp 'healing' tâm hồn chạy deadline",
        image: "/images/cay_de_ban.webp",
        category: "Góc Chữa Lành",
        date: "24/04/2026"
    },
    {
        id: "3",
        title: "Hướng dẫn set up góc làm việc chuẩn Aesthetic với Terrarium",
        image: "/images/terrarium.png",
        category: "Tips & Tricks",
        date: "20/04/2026"
    }
];

export default function NewsDetail() {
    const { id } = useParams();

    // Reset scroll khi đổi bài viết
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    return (
        <MainLayout>
            <div className="bg-[#F8F9F5] min-h-screen pb-24 font-body selection:bg-primary selection:text-white">
                
                {/* Hero Section - Parallax style */}
                <div className="relative pt-[84px] h-[60vh] min-h-[500px] flex items-end pb-24 justify-center overflow-hidden group">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="/images/banner.png" 
                            alt="News Cover" 
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out" 
                        />
                        {/* Gradient Overlay cực mịn */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 w-full max-w-4xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                Xu Hướng Gen Z
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">schedule</span> 5 phút đọc
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg mb-6">
                            Bí quyết chọn Terrarium hợp mệnh giúp thu hút "Năng lượng vũ trụ"
                        </h1>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="https://i.pravatar.cc/150?u=admin" alt="Author" className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
                                <div>
                                    <p className="text-white font-bold text-sm">Thảo Nguyễn</p>
                                    <p className="text-white/60 text-xs">27 Tháng 04, 2026</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all shadow-lg hover:scale-110">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section - Pull up overlapping design */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-[-60px] relative z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-[2rem] p-8 md:p-14 shadow-2xl shadow-emerald-900/5 border border-emerald-50"
                    >
                        
                        <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
                            <p className="text-xl md:text-2xl text-gray-800 font-semibold leading-relaxed mb-8">
                                Góc làm việc quá nhàm chán? Cần một chút "vitamin xanh" để healing tâm hồn sau chuỗi ngày chạy deadline ngập mặt? Vậy thì một chiếc bình Terrarium mini chắc chắn là chân ái dành cho bạn!
                            </p>

                            <p className="mb-6">
                                Terrarium không chỉ đơn thuần là một món đồ trang trí, nó là một hệ sinh thái thu nhỏ, nơi thiên nhiên tự vận hành và sinh trưởng mà bạn chẳng cần phải nhọc công chăm sóc. Đối với Gen Z, một thế hệ luôn bận rộn nhưng lại cực kỳ yêu cái đẹp và chú trọng sức khỏe tinh thần, Terrarium chính là "bảo bối" không thể thiếu trên bàn làm việc.
                            </p>

                            <div className="my-10 rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] shadow-md group relative">
                                <img src="/images/about-1.png" alt="Terrarium góc làm việc" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-lg text-gray-700 shadow-sm">
                                    Góc chill xịn xò cùng Terrarium
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-gray-800 mt-10 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span> 
                                Chọn bình theo "Hệ" phong thủy
                            </h2>
                            <p className="mb-6">
                                Bạn là hệ Lửa (Mệnh Hỏa) tràn đầy nhiệt huyết hay hệ Nước (Mệnh Thủy) mềm mại uyển chuyển? Việc chọn các tiểu cảnh bên trong bình kính (như màu cát nền, loại rêu, hay tượng trang trí) hợp với bản mệnh không chỉ giúp góc nhìn thêm hài hòa mà còn thu hút những nguồn năng lượng tích cực, may mắn trong học tập và công việc.
                            </p>

                            <blockquote className="border-l-4 border-primary bg-emerald-50/50 p-6 rounded-r-2xl my-8 italic text-gray-700 font-semibold shadow-sm">
                                "Một mầm xanh nhỏ bé vươn lên mỗi ngày cũng đủ để nhắc nhở chúng ta rằng: Cứ kiên nhẫn, rồi những điều tốt đẹp sẽ nở hoa."
                            </blockquote>

                            <p>
                                Hãy ghé qua bộ sưu tập mới nhất của MiniGarden để tự tay "bắt" cho mình một vũ trụ xanh bé nhỏ nhé. Đừng quên, mỗi chiếc bình đều là độc bản, giống như chính bạn vậy!
                            </p>
                        </div>

                        {/* Tags */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary cursor-pointer transition-colors">#Terrarium</span>
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary cursor-pointer transition-colors">#GenZLifestyle</span>
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary cursor-pointer transition-colors">#Healing</span>
                        </div>
                    </motion.div>
                </div>

                {/* Related News */}
                <div className="max-w-5xl mx-auto px-6 mt-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center justify-between mb-8"
                    >
                        <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">local_fire_department</span>
                            Có thể bạn sẽ thích
                        </h3>
                        <Link to="/" className="text-primary font-bold hover:underline flex items-center gap-1 text-sm">
                            Xem thêm <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {mockRelatedNews.map((news, index) => (
                            <motion.div
                                key={news.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <Link to={`/news/${news.id}`} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 border border-transparent hover:border-emerald-100 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-48 sm:h-56 overflow-hidden relative">
                                    <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm">
                                        {news.category}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">{news.date}</p>
                                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                        {news.title}
                                    </h4>
                                </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </MainLayout>
    );
}