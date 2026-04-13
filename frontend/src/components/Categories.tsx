import React from "react";

export default function Categories() {
    return (
        <section className="mt-[30px] pt-6 pb-20 px-8 bg-surface-container-lowest overflow-hidden">
            <div className="max-w-7xl mx-auto">

                {/* Title */}
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">
                        Danh mục sản phẩm
                    </h2>
                    <p className="text-on-surface-variant">
                        Những lựa chọn tuyệt vời cho khu vườn mini của bạn
                    </p>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:h-[620px]">

                    {/* LEFT BIG CARD */}
                    <div className="group md:col-span-8 relative overflow-hidden rounded-2xl bg-surface-container-lowest h-full transition-all duration-500 hover:shadow-2xl">

                        <img
                            src="/images/terrarium.png"
                            alt="Terrarium"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-8">
                            <h3 className="text-3xl font-bold text-white mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                Terrarium
                            </h3>

                            <p className="text-white/80 mb-4 whitespace-nowrap translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                Hệ sinh thái khép kín đầy nghệ thuật trong lọ thủy tinh.
                            </p>

                            <a href="#" className="text-white font-semibold underline translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                Xem chi tiết
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="md:col-span-4 flex flex-col gap-6 h-full">

                        {/* CARD 1 */}
                        <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-surface-container-lowest transition-all duration-500 hover:shadow-xl">

                            <img
                                src="/images/cay_de_ban.webp"
                                alt="Cây để bàn"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    Cây để bàn
                                </h3>

                                <p className="text-white/80 whitespace-nowrap text-sm translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                    Mang thiên nhiên xanh mát vào không gian làm việc.
                                </p>

                                <a href="#" className="text-white font-semibold underline translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                    Xem chi tiết
                                </a>
                            </div>
                        </div>

                        {/* CARD 2 */}
                        <div className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-surface-container-lowest transition-all duration-500 hover:shadow-xl">

                            <img
                                src="/images/sen_da.webp"
                                alt="Sen đá"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                <h3 className="text-xl font-bold text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    Sen đá
                                </h3>

                                <p className="text-white/80 whitespace-nowrap text-sm translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                    Nhỏ xinh, dễ chăm sóc, hoàn hảo cho mọi góc nhỏ.
                                </p>

                                <a href="#" className="text-white font-semibold underline translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-900">
                                    Xem chi tiết
                                </a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
