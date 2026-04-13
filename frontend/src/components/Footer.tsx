const Footer = () => {
    return (
        <footer className="w-full pt-16 pb-8 bg-[#0F4D2E]/90 text-white">
            <div className="mt-[-30px] grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto text-sm">

                {/* Column 1 */}
                <div className="flex flex-col gap-6">
                    <div className="text-xl font-bold">MiniGarden</div>
                    <p className="text-white/80">
                        Cửa hàng chuyên cung cấp giải pháp xanh cho không gian sống hiện đại.
                    </p>
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined cursor-pointer hover:text-emerald-300 transition">
                            social_leaderboard
                        </span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-emerald-300 transition">
                            camera_alt
                        </span>
                        <span className="material-symbols-outlined cursor-pointer hover:text-emerald-300 transition">
                            share
                        </span>
                    </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-emerald-300">
                        Về chúng tôi
                    </h4>
                    <a href="#" className="text-white/80 hover:text-emerald-300 transition">
                        Giới thiệu
                    </a>
                    <a href="#" className="text-white/80 hover:text-emerald-300 transition">
                        Hướng dẫn chăm sóc
                    </a>
                    <a href="#" className="text-white/80 hover:text-emerald-300 transition">
                        Vận chuyển
                    </a>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-emerald-300">
                        Pháp lý
                    </h4>
                    <a href="#" className="text-white/80 hover:text-emerald-300 transition">
                        Điều khoản
                    </a>
                    <a href="#" className="text-white/80 hover:text-emerald-300 transition">
                        Bản tin
                    </a>
                </div>
                {/* Column 4 */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-emerald-300">
                        Liên hệ
                    </h4>
                    <p className="text-white/80">
                        Linh Trung, Thủ Đức, TP. HCM
                    </p>
                    <p className="text-white/80">contact@minigarden.vn</p>
                    <p className="font-bold">0123 456 789</p>
                </div>
            </div>

            {/* Bottom */}
            <div className="max-w-7xl mx-auto px-8 mt-8 pt-8 border-t border-white/10 text-center text-white/50 italic">
                © 2026 MiniGarden. Mọi quyền được bảo lưu.
            </div>
        </footer>
    );
};

export default Footer;