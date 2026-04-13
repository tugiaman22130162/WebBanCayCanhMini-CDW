export default function BlogSection() {
    const blogs = [
        {
            category: "Cẩm nang",
            title: "5 Bước đơn giản để tạo một Terrarium cho người mới bắt đầu",
            desc: "Việc tạo dựng một hệ sinh thái nhỏ không hề khó như bạn nghĩ. Hãy cùng MiniGarden khám phá quy trình 5 bước...",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA1sLQXXWS5prOYCSxEImxCnebDOcSZesXEpUfqpAHqk2I5vjfjpPbB0rrrua2PQkrHiUvaOzw8D-aWIKHHSU2zj7lAXQZZW_b8IliwLISmT0h43gsMx85pu433JKjOJqcl7XtsRExs1CsCN0N7YTIMX1oIp22GmMZBeLnJUvc8wH0_DWzyVnmToh2LQXDFsuBm6dyVwWTA89xgfFq1jwIuzcb9NU-sJVhKeV16PXkvAckngzKaZtaQyPNwJ6sWowpdWIVmOB4ETAo",
        },
        {
            category: "Mẹo nhỏ",
            title: "Làm thế nào để cây trong nhà luôn xanh tốt vào mùa đông",
            desc: "Ánh sáng và độ ẩm là hai yếu tố quan trọng nhất cần kiểm soát khi thời tiết chuyển lạnh...",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuASglI_rCSjj-qRMReqi2hmLL2D3cTuDOCciSW1-gj2qiW6IcWqj-ofCuMVk4z6NvyxnhUrggWCsvsjm3MksOdJrIbPTN8EjUP-ulcnuwHNX-PUilWHuEI2UuSM7fENXTj5WreGHVY8AUDjW01rUbjjqYCx5F4pewv1-IMyf0zMmpWLNzzTbE1Eg-05OTr6DzjXtRLUHihc9KxofsdLKgQhFO4WtrdVbpuIl795xtb1bjUSrBhfdERRKQtRUqyrCO-FNFr0Nwu1P2U",
        },
        {
            category: "Xu hướng",
            title: "Top 10 loại sen đá dễ chăm nhất cho văn phòng bận rộn",
            desc: "Nếu bạn không có nhiều thời gian, đây là những loài thực vật sinh ra dành cho bạn...",
            image:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuA0U37RQ5R1fhio_2lRMpDMI5Lz_h2DjCgA1aed5JkirhYmNFuv590IbFI4Zi6hHXMACZQkK9t5dNGq70It7fMJJcT3o-1WtjvwMrEJBA4nodH7a77C5nwrvlBYf8oFdBm3sAmRDwURQ33RmZX27JkdI-ndyLMqL06aLdyWlWuL8brxOmV6ESy3UJ8zKsCFlO7V9qU3cXy-YLYHY5-0jR2frHoER_L_FRvefr7bvlqC0qzYx6mSvTpW9i41oTrE6oRg8-NrTplh7xM",
        },
    ];

    return (
        <section className="mt-[30px] py-10 px-8 bg-surface-container-lowest">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">
                            Blog & Kiến thức
                        </h2>
                        <p className="text-gray-600">
                            Chia sẻ kinh nghiệm làm vườn tại gia
                        </p>
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-[-30px]">
                    {blogs.map((blog, index) => (
                        <article key={index} className="flex flex-col gap-6 group">
                            {/* Image */}
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">
                                    {blog.category}
                                </span>

                                <h3 className="text-xl font-bold mt-2 mb-4 hover:text-emerald-600 transition-colors cursor-pointer">
                                    {blog.title}
                                </h3>

                                <p className="text-gray-600 text-sm line-clamp-3">
                                    {blog.desc}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}