import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

// --- DATA MẪU (MOCK DATA) ---
const CONTAINERS = [
    { id: 'round', name: 'Bình tròn', price: 150000, style: 'w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] rounded-[160px]', desc: 'Bình tròn giúp giữ độ ẩm không khí cực tốt, hoàn hảo cho rêu và các loại cây ưa ẩm nhiệt đới.' },
    { id: 'geo', name: 'Hình học', price: 250000, style: 'w-[260px] sm:w-[280px] h-[320px] sm:h-[360px] rounded-[40px]', desc: 'Thiết kế góc cạnh hiện đại, dễ thoát hơi nước, phù hợp với không gian tối giản và sen đá.' },
    { id: 'tall', name: 'Bình trụ', price: 180000, style: 'w-[180px] sm:w-[200px] h-[360px] sm:h-[400px] rounded-t-[100px] rounded-b-[30px]', desc: 'Bình trụ cao phù hợp với các loại cây thân thẳng, tạo điểm nhấn thanh lịch.' }
];

const SOILS = [
    { id: 's1', name: 'Đất nền mùn', price: 20000, color: '#5d4037' },
    { id: 's2', name: 'Sỏi Akadama', price: 35000, color: '#d7ccc8' },
    { id: 's3', name: 'Đá núi lửa', price: 40000, color: '#455a64' }
];

type Plant = { id: string; name: string; price: number; image: string; light: string; humidity: string; level: string; }
const PLANTS: Plant[] = [
    { id: 'p1', name: 'Cẩm Nhung xanh', price: 35000, image: '/images/cam_nhung_xanh.png', light: 'Trung bình', humidity: 'Cao', level: 'Dễ' },
    { id: 'p2', name: 'Rêu đuôi chồn', price: 25000, image: '/images/reu_duoi_chon.png', light: 'Yếu', humidity: 'Rất cao', level: 'Trung bình' },
    { id: 'p3', name: 'Cây trường sinh', price: 30000, image: '/images/cay_truong_sinh.png', light: 'Yếu', humidity: 'Cao', level: 'Dễ' },
    { id: 'p4', name: 'Sen đá hồng', price: 40000, image: '/images/sen_da_hong.png', light: 'Mạnh', humidity: 'Thấp', level: 'Trung bình' }
];

const TerrariumBuilder: React.FC = () => {
    // --- STATES ---
    const [selectedContainer, setSelectedContainer] = useState(CONTAINERS[0]);
    const [selectedSoil, setSelectedSoil] = useState(SOILS[0]);
    const [selectedPlants, setSelectedPlants] = useState<Plant[]>([PLANTS[0]]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [designNote, setDesignNote] = useState("");
    
    // Tham chiếu để giới hạn khu vực kéo thả
    const constraintsRef = useRef<HTMLDivElement>(null);

    // --- XỬ LÝ LỰA CHỌN CÂY ---
    const handleTogglePlant = (plant: Plant) => {
        if (selectedPlants.find(p => p.id === plant.id)) {
            // Bỏ chọn nếu đã có
            setSelectedPlants(selectedPlants.filter(p => p.id !== plant.id));
        } else {
            // Thêm mới (Giới hạn tối đa 3 cây)
            if (selectedPlants.length >= 3) {
                alert("Không gian bình có hạn! Bạn chỉ có thể chọn tối đa 3 cây.");
                return;
            }
            setSelectedPlants([...selectedPlants, plant]);
        }
    };

    // --- TÍNH TỔNG TIỀN ---
    const totalPrice = selectedContainer.price + selectedSoil.price + selectedPlants.reduce((sum, p) => sum + p.price, 0);

    // --- LẤY THÔNG TIN CHĂM SÓC ---
    // Hiển thị thông tin của cây đầu tiên được chọn, nếu không có thì để trống
    const careInfo = selectedPlants.length > 0 ? selectedPlants[0] : null;

    // --- XỬ LÝ THÊM VÀO GIỎ HÀNG ---
    const handleAddToCart = () => {
        const customTerrarium = {
            container: selectedContainer.name,
            soil: selectedSoil.name,
            plants: selectedPlants.map(p => p.name).join(", "),
            note: designNote,
            total: totalPrice
        };
        console.log("Đã thêm Terrarium tự thiết kế vào giỏ:", customTerrarium);
        alert("Đã thêm Terrarium thiết kế vào giỏ hàng thành công!\n" + (designNote ? `Ghi chú của bạn: ${designNote}` : ""));
    };

    return (
        <div className="bg-background text-on-surface font-body flex flex-col min-h-screen">
            <Header />

            <main className="pt-[84px] flex-1 flex flex-col lg:flex-row">
                {/* SIDEBAR TRÁI - CÁC TÙY CHỌN */}
                <aside className="w-full lg:w-[400px] bg-white border-r border-gray-100 p-6 md:p-8 flex flex-col gap-8 shadow-sm z-10 overflow-y-auto">
                    <div>
                        <h1 className="text-3xl font-extrabold text-primary mb-1">
                            Thiết Kế Terrarium
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Tự tay tạo nên hệ sinh thái thu nhỏ của riêng bạn
                        </p>
                    </div>

                    {/* Chọn Bình */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">1. Chọn loại bình</p>
                            <span className="text-xs font-bold text-primary">{selectedContainer.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {CONTAINERS.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedContainer(c)}
                                    className={`py-3 px-2 text-sm font-semibold rounded-xl transition-all border-2 ${selectedContainer.id === c.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-600'}`}
                                >
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Nền */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">2. Chọn đất nền</p>
                            <span className="text-xs font-bold text-primary">{selectedSoil.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex gap-4">
                            {SOILS.map(s => (
                                <div key={s.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setSelectedSoil(s)}>
                                    <div 
                                        className={`w-12 h-12 rounded-full shadow-inner transition-transform ${selectedSoil.id === s.id ? 'ring-4 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`} 
                                        style={{ backgroundColor: s.color }}
                                        title={s.name}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Cây */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">3. Chọn Cây Mini</p>
                            <span className="text-xs font-bold text-primary">Tối đa 3 cây</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {PLANTS.map(plant => {
                                const isSelected = selectedPlants.some(p => p.id === plant.id);
                                return (
                                    <div 
                                        key={plant.id} 
                                        onClick={() => handleTogglePlant(plant)}
                                        className={`relative rounded-2xl p-2 cursor-pointer transition-all border-2 bg-white ${isSelected ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden p-2">
                                            <img src={plant.image} alt={plant.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                        <p className="text-xs font-bold text-center text-gray-800 line-clamp-1">{plant.name}</p>
                                        <p className="text-[10px] font-semibold text-center text-emerald-600">+{plant.price.toLocaleString('vi-VN')}đ</p>
                                        
                                        {/* Dấu check khi được chọn */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Yêu cầu thiết kế */}
                    <div>
                        <p className="text-sm font-bold text-gray-800 mb-3">4. Yêu cầu thiết kế (Tùy chọn)</p>
                        <textarea
                            rows={3}
                            placeholder="Ví dụ: Trồng cây sen đá ở chính giữa, rêu phủ xung quanh..."
                            value={designNote}
                            onChange={(e) => setDesignNote(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                        ></textarea>
                    </div>

                    {/* Tổng tiền & Đặt hàng */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-4">
                            <p className="text-sm font-bold text-gray-500">Tổng cộng</p>
                            <p className="text-3xl font-black text-primary">
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <button onClick={handleAddToCart} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-md hover:bg-[#2f5146] hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                            <span className="material-symbols-outlined">shopping_bag</span>
                            Thêm vào giỏ hàng
                        </button>
                    </div>
                </aside>

                {/* CENTER - PREVIEW (XEM TRƯỚC) */}
                <section className="flex-1 relative bg-[#F8F9F5] flex items-center justify-center p-10 overflow-hidden min-h-[500px] lg:min-h-0">
                    {/* Hiệu ứng Ánh sáng nền */}
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-200/40 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lime-200/30 blur-[100px] rounded-full pointer-events-none" />

                    {/* Bộ điều khiển Zoom */}
                    <div className="absolute top-6 right-6 z-40 flex flex-col bg-white/80 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-gray-100">
                        <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm mb-1" title="Phóng to">
                            <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                        </button>
                        <div className="text-center text-[10px] font-bold text-gray-500 py-1">
                            {Math.round(zoomLevel * 100)}%
                        </div>
                        <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm" title="Thu nhỏ">
                            <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                        </button>
                        <div className="w-full h-px bg-gray-200 my-1"></div>
                        <button onClick={() => setZoomLevel(1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors shadow-sm" title="Đặt lại">
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                        </button>
                    </div>

                    {/* TERRARIUM MOCKUP */}
                    <div className="relative flex items-end justify-center mx-auto h-[460px] w-full transition-transform duration-300 ease-out" style={{ transform: `scale(${zoomLevel})` }}>
                        
                        {/* Bóng đổ dưới đáy bình (Realism: 2 lớp bóng, 1 đậm ở giữa, 1 nhạt lan tỏa) */}
                        <div className="absolute bottom-4 w-[160px] h-6 bg-black/30 blur-md rounded-[100%] pointer-events-none" />
                        <div className="absolute bottom-2 w-[260px] h-12 bg-black/10 blur-xl rounded-[100%] pointer-events-none" />

                        {/* Hình dáng kính (Container) */}
                        <div ref={constraintsRef} className={`relative bg-gradient-to-r from-white/20 via-white/5 to-white/20 border border-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),inset_10px_0_40px_rgba(255,255,255,0.2),inset_-10px_0_30px_rgba(255,255,255,0.2),0_20px_40px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md overflow-hidden flex flex-col justify-end transition-all duration-700 ease-in-out mb-10 ${selectedContainer.style}`}>
                            
                            {/* Hiệu ứng phản chiếu của kính (Glare cong 3D) */}
                            <div className="absolute inset-y-0 left-[8%] w-[12%] bg-gradient-to-r from-white/40 to-transparent rounded-full blur-md pointer-events-none z-30 transform -skew-x-6" />
                            <div className="absolute inset-y-0 right-[5%] w-[8%] bg-gradient-to-l from-white/20 to-transparent rounded-full blur-sm pointer-events-none z-30" />
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-white/20 via-transparent to-transparent rotate-[30deg] pointer-events-none z-30 mix-blend-overlay" />

                            {/* Hiệu ứng giọt sương (Dew drops / Condensation) */}
                            <div className="absolute inset-0 z-30 pointer-events-none opacity-40 mix-blend-overlay" style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px), radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                                backgroundSize: '16px 24px, 10px 14px',
                                backgroundPosition: '0 0, 8px 12px'
                            }} />

                            {/* Lớp Cây (Plants) - Nằm bên trong bình, trên lớp đất */}
                            <div className="absolute bottom-[26%] left-0 w-full flex justify-center items-end px-4 z-20 pointer-events-none">
                            <AnimatePresence>
                                {selectedPlants.map((plant, index) => (
                                    <motion.img
                                        key={plant.id}
                                        src={plant.image}
                                        alt={plant.name}
                                        drag
                                        dragConstraints={constraintsRef}
                                        dragElastic={0.1}
                                        dragMomentum={false}
                                        whileDrag={{ scale: 1.15, cursor: "grabbing" }}
                                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                                            animate={{ y: 15, opacity: 1, scale: 1 }}
                                        exit={{ y: 50, opacity: 0, scale: 0.8 }}
                                        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                                        className="w-24 sm:w-32 object-contain origin-bottom drop-shadow-[0_15px_10px_rgba(0,0,0,0.5)] pointer-events-auto cursor-grab"
                                            style={{ 
                                                zIndex: selectedPlants.length - index,
                                            marginLeft: index > 0 ? '-30px' : '0',
                                            filter: 'contrast(1.05) brightness(0.95)'
                                            }}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                            {/* Lớp Đất nền (Soil) - Có độ sâu 3D và vân đất */}
                            <div 
                                className="w-full h-[28%] transition-colors duration-700 z-10 relative shadow-[inset_0_20px_20px_-10px_rgba(0,0,0,0.6)]" 
                                style={{ backgroundColor: selectedSoil.color }} 
                            >
                                {/* Vân đất dạng nhiễu và bóng viền */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_50%,_rgba(0,0,0,0.8)_100%)] mix-blend-multiply opacity-80" />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-20" />
                                <div className="absolute top-0 w-full h-1.5 bg-black/40 blur-[1px]" /> 
                            </div>
                        </div>
                    </div>
                </section>

                {/* RIGHT SIDEBAR - INFO */}
                <aside className="w-full lg:w-[320px] bg-white border-l border-gray-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm z-10">
                    <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                        <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 border-b border-emerald-200/50 pb-2">
                            <span className="material-symbols-outlined text-[20px]">psychiatry</span>
                            Mức độ chăm sóc
                        </h3>
                        {careInfo ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Ánh sáng:</span><span className="font-bold text-gray-800">{careInfo.light}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Độ ẩm:</span><span className="font-bold text-gray-800">{careInfo.humidity}</span></div>
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Mức độ:</span><span className="font-bold text-primary px-2 py-0.5 bg-white rounded-md shadow-sm">{careInfo.level}</span></div>
                            </div>
                        ) : (
                            <p className="text-sm text-emerald-700 font-medium">Hãy chọn ít nhất 1 loại cây để xem thông tin chăm sóc chi tiết.</p>
                        )}
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-gray-500">info</span>
                            Mẹo nhỏ
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {selectedContainer.desc}
                        </p>
                    </div>
                </aside>
            </main>
            
            <Footer />
        </div>
    );
};

export default TerrariumBuilder;