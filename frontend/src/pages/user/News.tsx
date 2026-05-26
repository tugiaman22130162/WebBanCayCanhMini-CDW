import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";

type Blog = {
    id: number;
    title: string;
    thumbnail: string;
    slug: string;
    readingTime: number;
    type: string;
    createdAt: string;
    authorName: string;
    authorAvatar: string;
    content: string;
};

export default function News() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:8080/api/blogs/published");
                const dataList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
                const sortedBlogs = dataList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBlogs(sortedBlogs);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách bài viết:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogs();
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "TIPS": return "Mẹo";
            case "TREND": return "Xu hướng";
            case "GUIDE": return "Hướng dẫn";
            case "PROMOTION": return "Khuyến mãi";
            case "DECOR": return "Trang trí";
            default: return type;
        }
    };

    const truncateText = (text: string, length: number) => {
        if (!text) return "Chưa có mô tả cho bài viết này...";
        const plainText = text.replace(/<[^>]+>/g, "");
        if (plainText.length <= length) return plainText;
        return plainText.substring(0, length) + "...";
    };

    const filteredBlogs = useMemo(() => {
        if (activeTab === "ALL") return blogs;
        return blogs.filter((b) => b.type === activeTab);
    }, [blogs, activeTab]);

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "TIPS", label: "Mẹo (TIPS)" },
        { id: "TREND", label: "Xu hướng (TREND)" },
        { id: "GUIDE", label: "Hướng dẫn (GUIDE)" },
        { id: "DECOR", label: "Trang trí (DECOR)" },
        { id: "PROMOTION", label: "Khuyến mãi (PROMOTION)" },
    ];

    return (
        <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">
            <Header />

            {/* PAGE HEADER */}
            <header className="bg-white pt-28 pb-8 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <motion.nav
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex text-sm text-gray-500 mb-8"
                    >
                        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-800 font-semibold truncate">Blog & Kiến thức</span>
                    </motion.nav>
                    <h2 className="text-4xl font-bold text-on-surface mb-2">Blog & Kiến thức</h2>
                    <p className="text-on-surface-variant max-w-2xl">
                        Cập nhật những xu hướng, mẹo chăm sóc cây và các tin tức mới nhất từ MiniGarden.
                    </p>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <section className="px-6 py-12 max-w-7xl mx-auto flex-1 w-full">
                
                {/* Tabs Lọc */}
                <div className="flex flex-wrap items-center gap-3 mb-10 pb-4 border-b border-gray-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-primary"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">article</span>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có bài viết nào</h2>
                        <p>Hãy quay lại sau nhé!</p>
                    </div>
                ) : (
                    <>
                        {/* Bố cục Grid giống với Home và Sản Phẩm Bán Chạy */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {paginatedBlogs.map((blog, index) => (
                                <motion.div
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link to={`/news/${blog.slug || blog.id}`} className="flex flex-col gap-6 group h-full">
                                        {/* Image Container */}
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm transition-shadow duration-500 group-hover:shadow-lg relative">
                                            <img
                                                src={blog.thumbnail || "https://images.unsplash.com/photo-1614594975525-e45190c55d40?w=800&h=600&fit=crop"}
                                                alt={blog.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-primary shadow-sm">
                                                {getTypeLabel(blog.type)}
                                            </div>
                                        </div>

                                        {/* Content Container */}
                                        <div className="flex flex-col flex-1">
                                            <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("vi-VN") : "Đang cập nhật"}
                                            </span>

                                            <h3 className="text-xl font-bold mt-2 mb-4 group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                                {blog.title}
                                            </h3>

                                            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                                                {truncateText(blog.content, 120)}
                                            </p>

                                            {/* Author Info */}
                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                                                {blog.authorAvatar ? (
                                                    <img src={blog.authorAvatar} alt={blog.authorName} className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-100" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm border border-emerald-200">
                                                        {blog.authorName ? blog.authorName.charAt(0).toUpperCase() : "AD"}
                                                    </div>
                                                )}
                                                <span className="text-sm font-bold text-gray-600">{blog.authorName || "Admin"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center mt-16 text-sm text-gray-500">
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">chevron_left</span>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm font-bold ${
                                                currentPage === page ? "bg-primary text-white scale-110" : "bg-white border border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>
                    
            <Footer />
        </div>
    );
}