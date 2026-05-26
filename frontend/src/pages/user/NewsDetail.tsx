import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function NewsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [blog, setBlog] = useState<any>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            setIsLoading(true);
            try {
                // Hỗ trợ fetch bằng id (số) hoặc slug (chuỗi)
                const isNumeric = /^\d+$/.test(id || "");
                const url = isNumeric 
                    ? `http://localhost:8080/api/blogs/${id}` 
                    : `http://localhost:8080/api/blogs/slug/${id}`;
                
                const response = await axios.get(url);
                // Đảm bảo lấy đúng object bài viết (phòng trường hợp API bọc trong { data: ... })
                let blogData = response.data?.data || response.data;
                
                // Xử lý trường hợp API vô tình trả về một mảng
                if (Array.isArray(blogData)) {
                    blogData = blogData.length > 0 ? blogData[0] : null;
                }

                // Kiểm tra xem có bị Spring Security trả về cục HTML (trang login) không
                if (typeof blogData === 'string' && blogData.trim().startsWith('<')) {
                    console.log("Mã HTML nhận được từ Server:", blogData.substring(0, 200));
                    throw new Error("API bị chặn bởi Spring Security (Trả về HTML thay vì JSON). Bạn cần cấp quyền permitAll() cho /api/blogs/** trong Backend.");
                }

                // Nếu Backend trả về object báo lỗi nhưng với Status 200 OK
                if (blogData?.error || (blogData?.message && !blogData?.id)) {
                    throw new Error(blogData.error || blogData.message || "Không tìm thấy bài viết");
                }
                
                if (!blogData || typeof blogData !== 'object') {
                    console.log("Dữ liệu lỗi thực tế nhận được:", blogData);
                    throw new Error("Dữ liệu không hợp lệ (Không phải là Object JSON)");
                }
                
                // Nếu bài viết chưa xuất bản thì có thể chặn không cho user xem (tuỳ logic của bạn)
                if (!blogData.published) {
                    // navigate("/"); // Chặn nếu cần
                }
                
                setBlog(blogData);

                // Lấy các bài viết mới nhất (không cần lọc theo type)
                try {
                    const relatedRes = await axios.get(`http://localhost:8080/api/blogs/published`);
                    // Đảm bảo data là một mảng trước khi gọi .filter()
                    const dataList = Array.isArray(relatedRes.data) ? relatedRes.data : (relatedRes.data?.data || []);
                    const related = dataList
                        .filter((b: any) => b.id !== blogData.id)
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 3); // Lấy tối đa 3 bài
                    setRelatedBlogs(related);
                } catch (e) {
                    console.error("Lỗi lấy bài viết liên quan:", e);
                }
                
            } catch (error) {
                console.error("Lỗi lấy chi tiết bài viết:", error);
                setBlog(null);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchBlog();
        window.scrollTo(0, 0);
    }, [id]);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'TIPS': return 'Mẹo';
            case 'TREND': return 'Xu hướng';
            case 'GUIDE': return 'Hướng dẫn';
            case 'PROMOTION': return 'Khuyến mãi';
            case 'DECOR': return 'Trang trí';
            default: return type;
        }
    };

    if (isLoading) {
        return (
            <MainLayout>
                <div className="bg-[#F8F9F5] min-h-screen pt-[120px] pb-24 flex justify-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                        <p className="font-medium">Đang tải bài viết...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!blog) {
        return (
            <MainLayout>
                <div className="bg-[#F8F9F5] min-h-screen pt-[120px] pb-24 flex justify-center items-center">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">article</span>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy bài viết</h2>
                        <p className="text-gray-500 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
                        <Link to="/" className="px-6 py-3 bg-[#006c49] text-white rounded-xl font-bold hover:bg-[#005236] transition-colors shadow-md">
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            {/* Style đồng bộ với Tiptap Editor */}
            <style>{`
                .blog-content h1 { font-size: 1.8em; font-weight: 800; margin-bottom: 0.5em; line-height: 1.2; color: #1f2937; }
                .blog-content h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; line-height: 1.3; color: #374151; }
                .blog-content h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; line-height: 1.4; color: #4b5563; }
                .blog-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .blog-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                .blog-content li p { margin-bottom: 0.2em; }
                .blog-content blockquote { border-left: 4px solid #006c49; padding-left: 1em; margin-left: 0; margin-bottom: 1em; font-style: italic; color: #4b5563; background: #f9fafb; padding-top: 0.5em; padding-bottom: 0.5em; border-radius: 0 0.5em 0.5em 0; }
                .blog-content p { margin-bottom: 1em; }
                .blog-content p:last-child { margin-bottom: 0; }
                .blog-content strong { font-weight: 700; color: #111827; }
                .blog-content img { width: 100%; height: 450px; object-fit: cover; border-radius: 12px; margin: 1.5em auto; display: block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            `}</style>
            <div className="bg-[#F8F9F5] min-h-screen pb-24 font-body selection:bg-primary selection:text-white">
                
                {/* Hero Section - Parallax style */}
                <div className="relative pt-[84px] h-[45vh] min-h-[350px] flex items-end pb-12 justify-center overflow-hidden group">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={blog.thumbnail || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=1200&h=800&fit=crop"} 
                            alt={blog.title} 
                            className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[2s] ease-out" 
                        />
                        {/* Gradient Overlay cực mịn */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-100 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                {getTypeLabel(blog.type)}
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">schedule</span> {blog.readingTime || 5} phút đọc
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg mb-6">
                            {blog.title}
                        </h1>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {blog.authorAvatar ? (
                                    <img src={blog.authorAvatar} alt={blog.authorName} className="w-10 h-10 rounded-full border-2 border-white/50 object-cover shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {blog.authorName ? blog.authorName.charAt(0).toUpperCase() : "AD"}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold text-sm">{blog.authorName || "Admin"}</p>
                                    <p className="text-white/60 text-xs">{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN') : "Đang cập nhật"}</p>
                                </div>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all shadow-lg hover:scale-110">
                                <span className="material-symbols-outlined text-[20px]">share</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 relative z-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                        className="bg-white rounded-[2rem] p-8 md:p-14 shadow-sm border border-emerald-50"
                    >
                        
                        <div 
                            className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
                        />

                        {/* Tags */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary cursor-pointer transition-colors">#{getTypeLabel(blog.type)}</span>
                            <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:border-primary hover:text-primary cursor-pointer transition-colors">#MiniGarden</span>
                        </div>
                    </motion.div>
                </div>

                {/* Related News */}
                {relatedBlogs.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mt-24">
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
                        <Link to="/news" className="text-primary font-bold flex items-center gap-1 text-sm">
                            Xem thêm <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {relatedBlogs.map((news, index) => (
                            <motion.div
                                key={news.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <Link to={`/news/${news.id}`} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 border border-transparent hover:border-emerald-100 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="h-48 sm:h-56 overflow-hidden relative">
                                    <img src={news.thumbnail || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=800&h=600&fit=crop"} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm">
                                        {getTypeLabel(news.type)}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">{news.createdAt ? new Date(news.createdAt).toLocaleDateString('vi-VN') : "Đang cập nhật"}</p>
                                    <h4 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                        {news.title}
                                    </h4>
                                </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
                )}

            </div>
        </MainLayout>
    );
}