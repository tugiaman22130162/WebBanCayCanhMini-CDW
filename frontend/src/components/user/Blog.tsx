import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function BlogSection() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:8080/api/blogs/published");
                const dataList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                const sortedBlogs = dataList
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);
                setBlogs(sortedBlogs);
            } catch (error) {
                console.error("Lỗi khi lấy bài viết cho trang chủ:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogs();
    }, []);

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

    const truncateText = (text: string, length: number) => {
        if (!text) return "Chưa có mô tả cho bài viết này...";
        const plainText = text.replace(/<[^>]+>/g, '');
        if (plainText.length <= length) return plainText;
        return plainText.substring(0, length) + "...";
    };

    return (
        <section className="mt-[30px] py-10 px-8 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end mb-16"
                >
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Blog & Kiến thức
                        </h2>
                        <p className="text-gray-600">
                            Chia sẻ kinh nghiệm làm vườn tại gia
                        </p>
                    </div>
                    <Link
                                            to="/news"
                                            className="px-6 py-2 rounded-full font-semibold text-white 
                                        bg-gradient-to-r from-emerald-500 to-emerald-600
                                        hover:from-emerald-600 hover:to-emerald-700
                                        shadow-md hover:shadow-lg hover:shadow-emerald-300/40
                                        active:scale-95
                                        transition-all duration-300 flex items-center gap-2 group"
                                        >
                                            Xem tất cả
                                        </Link>
                </motion.div>

                {/* Blog Grid */}
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải bài viết...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-[-30px]">
                        {blogs.map((blog, index) => (
                            <motion.div
                                key={blog.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <Link to={`/news/${blog.slug || blog.id}`} className="flex flex-col gap-6 group h-full">
                                    {/* Image */}
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm transition-shadow duration-500 group-hover:shadow-lg">
                                        <img
                                            src={blog.thumbnail || "/images/terrarium.png"}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
                                            {getTypeLabel(blog.type)}
                                        </span>

                                        <h3 className="text-xl font-bold mt-2 mb-4 group-hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2">
                                            {blog.title}
                                        </h3>

                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {truncateText(blog.content, 120)}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}