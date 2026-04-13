// import React from "react";

// export default function Hero() {
//     return (
//         <section className="relative h-[500px] w-full overflow-hidden bg-surface">

//             {/* Background image */}
//             <div className="absolute inset-0">
//                 <img
//                     src="/images/banner.png"
//                     alt="Hero background"
//                     className="w-full h-full object-cover"
//                 />

//                 {/* Overlay gradient để text dễ đọc */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
//             </div>

//             {/* CONTENT OVERLAY FULL WIDTH */}
//             <div className="relative z-10 h-full flex items-center px-8">
//                 <div className="w-full">

//                     <div className="max-w-2xl lg:max-w-3xl space-y-6">
//                         {/* Title*/}
//                         <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight text-on-surface">
//                             Mang thiên nhiên <br />
//                             <span className="text-primary italic">vào không gian</span>
//                             <br />
//                             của bạn
//                         </h1>

//                         {/* Description*/}
//                         <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl">
//                             Khám phá bộ sưu tập terrarium nghệ thuật và cây cảnh nội thất được thiết kế tinh xảo, mang lại sự cân bằng và cảm hứng cho không gian sống.
//                         </p>

//                         {/* CTA */}
//                         <div className="flex items-center gap-5 pt-2">

//                             <button className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
//                                 Khám phá bộ sưu tập
//                             </button>

//                             <button className="group flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
//                                 Xem video
//                                 <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
//                                     arrow_forward
//                                 </span>
//                             </button>

//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }


import React from "react"
import { Link } from "react-router-dom"

export default function Hero() {
    return (
        <section className="relative h-[500px] w-full overflow-hidden bg-surface">

            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src="/images/banner.png"
                    alt="Hero background"
                    className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
            </div>

            {/* CONTENT */}
            <div className="relative z-10 h-full flex items-center px-8">
                <div className="max-w-2xl lg:max-w-3xl space-y-6">

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.2] tracking-tight text-on-surface">
                        Mang thiên nhiên <br />
                        <span className="text-primary italic">vào không gian</span>
                        <br />
                        của bạn
                    </h1>

                    {/* Description */}
                    <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-xl">
                        Khám phá bộ sưu tập terrarium nghệ thuật và cây cảnh nội thất được thiết kế tinh xảo,
                        mang lại sự cân bằng và cảm hứng cho không gian sống.
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-5 pt-2">

                        <Link
                            to="/products"
                            className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-semibold rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                        >
                            Xem tất cả sản phẩm
                        </Link>

                        {/* SECONDARY CTA */}
                        <button className="group flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                            Xem video
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </button>

                    </div>

                </div>
            </div>
        </section>
    )
}