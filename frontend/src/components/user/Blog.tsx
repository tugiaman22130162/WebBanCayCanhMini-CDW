import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function BlogSection() {
    const blogs = [
        {
            category: "Cẩm nang",
            title: "5 Bước đơn giản để tạo một Terrarium cho người mới bắt đầu",
            desc: "Việc tạo dựng một hệ sinh thái nhỏ không hề khó như bạn nghĩ. Hãy cùng MiniGarden khám phá quy trình 5 bước...",
            image: "/images/terrarium.png",
        },
        {
            category: "Mẹo nhỏ",
            title: "Làm thế nào để cây trong nhà luôn xanh tốt vào mùa đông",
            desc: "Ánh sáng và độ ẩm là hai yếu tố quan trọng nhất cần kiểm soát khi thời tiết chuyển lạnh...",
            image: "/images/cay_trong_nha.jpg",
        },
        {
            category: "Xu hướng",
            title: "Top 10 loại sen đá dễ chăm nhất cho văn phòng bận rộn",
            desc: "Nếu bạn không có nhiều thời gian, đây là những loài thực vật sinh ra dành cho bạn...",
            image: "/images/sen_da.webp",
        },
    ];

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
                </motion.div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-[-30px]">
                    {blogs.map((blog, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                        >
                            <Link to={`/news/${index + 1}`} className="flex flex-col gap-6 group h-full">
                                {/* Image */}
                                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm transition-shadow duration-500 group-hover:shadow-lg">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
                                        {blog.category}
                                    </span>

                                    <h3 className="text-xl font-bold mt-2 mb-4 group-hover:text-emerald-600 transition-colors cursor-pointer">
                                        {blog.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {blog.desc}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}