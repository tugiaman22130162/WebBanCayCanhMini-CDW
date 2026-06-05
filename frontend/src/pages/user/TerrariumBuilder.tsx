import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/user/Header";
import Footer from "../../components/user/Footer";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/ToastUtils";

type ContainerType = { id: string; name: string; price: number; cssStyle: string; description: string; };
type SoilType = { id: string; name: string; price: number; cssStyle: string; };
type Plant = { id: string; name: string; price: number; image: string; light: string; humidity: string; careLevel: string; }
type PlantInstance = Plant & { instanceId: string };

const TerrariumBuilder: React.FC = () => {
    const [containers, setContainers] = useState<ContainerType[]>([]);
    const [soils, setSoils] = useState<SoilType[]>([]);
    const [plants, setPlants] = useState<Plant[]>([]);

    // --- SELECTED STATES ---
    const [selectedContainer, setSelectedContainer] = useState<ContainerType | null>(null);
    const [selectedSoil, setSelectedSoil] = useState<SoilType | null>(null);
    const [selectedPlants, setSelectedPlants] = useState<PlantInstance[]>([]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [designNote, setDesignNote] = useState("");
    const [designImageFile, setDesignImageFile] = useState<File | null>(null);
    const [designImagePreview, setDesignImagePreview] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, isLoading } = useAuth();

    // Chuyển hướng nếu chưa đăng nhập
    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để có thể sử dụng tính năng Tự thiết kế Terrarium bạn nhé!',
                confirmButtonText: 'Đăng nhập ngay',
                showCancelButton: true,
                cancelButtonText: 'Đóng',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    cancelButton: 'bg-error text-on-error font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
                } else {
                    navigate('/'); // Nếu bấm Đóng thì đưa về trang chủ để không kẹt ở Loading
                }
            });
        }
    }, [isLoading, isLoggedIn, navigate, location.pathname, location.search]);

    // Lấy dữ liệu API
    useEffect(() => {
        setIsFetching(true);
        axios.get("http://localhost:8080/api/terrarium-components").then(res => {
            const data = Array.isArray(res.data) ? res.data : [];
            const c = data.filter((x: any) => x.type === 'CONTAINER');
            const s = data.filter((x: any) => x.type === 'SOIL');
            const p = data.filter((x: any) => x.type === 'PLANT');
            
            setContainers(c);
            setSoils(s);
            setPlants(p);

            // Set Mặc định
            if(c.length > 0) setSelectedContainer(c[0]);
            if(s.length > 0) setSelectedSoil(s[0]);
            if(p.length > 0) setSelectedPlants([{ ...p[0], instanceId: `${p[0].id}-${Date.now()}` }]);
        }).catch(err => {
            console.error("Lỗi tải tài nguyên thiết kế:", err);
        }).finally(() => {
            setIsFetching(false);
        });
    }, []);
    
    // Tham chiếu để giới hạn khu vực kéo thả
    const constraintsRef = useRef<HTMLDivElement>(null);

    // --- XỬ LÝ LỰA CHỌN CÂY ---
    const handleAddPlant = (plant: Plant) => {
        if (selectedPlants.length >= 3) {
            Swal.fire({
                icon: 'warning',
                title: 'Giới hạn không gian',
                text: 'Không gian bình có hạn! Bạn chỉ có thể chọn tối đa 3 cây.',
                confirmButtonText: 'Đã hiểu',
                confirmButtonColor: '#006c49'
            });
            return;
        }
        const newPlantInstance: PlantInstance = { ...plant, instanceId: `${plant.id}-${Date.now()}-${Math.random()}` };
        setSelectedPlants([...selectedPlants, newPlantInstance]);
    };

    const handleRemovePlant = (plantId: string) => {
        const index = selectedPlants.map(p => p.id).lastIndexOf(plantId);
        if (index !== -1) {
            const newPlants = [...selectedPlants];
            newPlants.splice(index, 1);
            setSelectedPlants(newPlants);
        }
    };

    // --- TÍNH TỔNG TIỀN ---
    const totalPrice = (selectedContainer?.price || 0) + (selectedSoil?.price || 0) + selectedPlants.reduce((sum, p) => sum + p.price, 0);

    // --- LẤY THÔNG TIN CHĂM SÓC ---
    // Hiển thị thông tin của cây đầu tiên được chọn, nếu không có thì để trống
    const careInfo = selectedPlants.length > 0 ? selectedPlants[0] : null;

    // --- XỬ LÝ THÊM VÀO GIỎ HÀNG ---
    const handleSaveDesign = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'Yêu cầu đăng nhập',
                text: 'Vui lòng đăng nhập để lưu bản thiết kế Terrarium.',
                confirmButtonText: 'Đăng nhập ngay',
                showCancelButton: true,
                cancelButtonText: 'Đóng',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    cancelButton: 'bg-error text-on-error font-bold py-2.5 px-6 rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] transition-all mx-2',
                    popup: 'bg-surface rounded-xl shadow-2xl border border-outline-variant',
                    title: 'text-primary font-bold text-2xl',
                    htmlContainer: 'text-on-surface-variant font-medium'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login?redirect=/builder");
                }
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const plantNames = selectedPlants.reduce((acc, p) => {
                acc[p.name] = (acc[p.name] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const plantsStr = Object.entries(plantNames).map(([name, count]) => `${count}x ${name}`).join(", ");

            const payload = {
                containerName: selectedContainer?.name,
                containerPrice: selectedContainer?.price,
                soilName: selectedSoil?.name,
                soilPrice: selectedSoil?.price,
                plants: plantsStr,
                plantsPrice: selectedPlants.reduce((sum, p) => sum + p.price, 0),
                totalPrice: totalPrice,
                userNote: designNote
            };

            const formData = new FormData();
            formData.append("design", new Blob([JSON.stringify(payload)], { type: "application/json" }));
            if (designImageFile) {
                formData.append("image", designImageFile);
            }

            await axios.post("http://localhost:8080/api/terrariums", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showSuccessToast("Đã gửi yêu cầu thiết kế thành công!", 2500);
            setDesignNote("");
            setDesignImageFile(null);
            setDesignImagePreview("");
        } catch (error) {
            console.error("Lỗi lưu thiết kế:", error);
            showErrorToast("Lỗi gửi bản thiết kế. Vui lòng thử lại sau.", 2500);
        } finally {
            setIsSubmitting(false);
        }
    };

    if(isLoading || !isLoggedIn || isFetching) {
        return (
            <div className="min-h-screen bg-[#F8F9F5] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">autorenew</span>
                <p className="ml-2 font-bold text-gray-500">Đang tải tài nguyên thiết kế...</p>
            </div>
        )
    }

    if(!selectedContainer || !selectedSoil || plants.length === 0) {
        return (
            <div className="bg-background text-on-surface font-body flex flex-col min-h-screen">
                <Header />
                <main className="pt-[85px] flex-1 flex flex-col items-center justify-center text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có nguyên liệu thiết kế</h2>
                    <p className="text-gray-500">Hiện tại cửa hàng đang cập nhật các nguyên liệu. Bạn vui lòng quay lại sau nhé!</p>
                    <button onClick={() => navigate('/products')} className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-[#2f5146] transition-colors">
                        Xem các sản phẩm khác
                    </button>
                </main>
                <Footer />
            </div>
        )
    }

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
                            {containers.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => setSelectedContainer(c)}
                                    className={`py-3 px-2 text-sm font-semibold rounded-xl transition-all border-2 ${selectedContainer?.id === c.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-600'}`}
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
                            {soils.map(s => (
                                <div key={s.id} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setSelectedSoil(s)}>
                                    <div 
                                        className={`w-12 h-12 rounded-full shadow-inner transition-transform ${selectedSoil?.id === s.id ? 'ring-4 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`} 
                                        style={{ backgroundColor: s.cssStyle }}
                                        title={s.name + ` (+${s.price.toLocaleString()}đ)`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chọn Cây */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-gray-800">3. Chọn Cây Mini</p>
                            <span className="text-xs font-bold text-primary">Đã chọn: {selectedPlants.length}/3 cây</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {plants.map(plant => {
                                const quantity = selectedPlants.filter(p => p.id === plant.id).length;
                                return (
                                    <div 
                                        key={plant.id} 
                                        onClick={() => quantity === 0 && handleAddPlant(plant)}
                                        className={`relative rounded-2xl p-2 transition-all border-2 bg-white ${quantity > 0 ? 'border-primary shadow-md' : 'border-gray-100 hover:border-gray-300 cursor-pointer'}`}
                                    >
                                        <div className="aspect-square bg-gray-50 rounded-xl flex items-center justify-center mb-2 overflow-hidden p-2">
                                            <img src={plant.image} alt={plant.name} className="w-full h-full object-contain drop-shadow-md" />
                                        </div>
                                        <p className="text-xs font-bold text-center text-gray-800 line-clamp-1">{plant.name}</p>
                                        <p className="text-[10px] font-semibold text-center text-emerald-600 mb-1">+{plant.price.toLocaleString('vi-VN')}đ</p>
                                        
                                        {/* Bộ điều khiển số lượng */}
                                        {quantity > 0 && (
                                            <div className="absolute top-2 right-2 flex items-center bg-white border border-primary rounded-lg shadow-sm overflow-hidden z-10">
                                                <button onClick={(e) => { e.stopPropagation(); handleRemovePlant(plant.id); }} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">remove</span>
                                                </button>
                                                <span className="w-4 text-center text-xs font-bold text-gray-800">{quantity}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleAddPlant(plant); }} className="w-6 h-6 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                                                    <span className="material-symbols-outlined text-[14px] font-bold">add</span>
                                                </button>
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
                        <div className="mt-4">
                            <label className="block text-sm font-bold text-gray-800 mb-2">Ảnh minh họa ý tưởng</label>
                            <div className="flex items-center gap-4">
                                {designImagePreview && (
                                    <div className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                        <img src={designImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => { setDesignImageFile(null); setDesignImagePreview(""); }}
                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                title="Xóa ảnh"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="relative flex-1 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex flex-col items-center justify-center bg-gray-50 hover:bg-primary/5 cursor-pointer transition-colors">
                                    <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) { setDesignImageFile(e.target.files[0]); setDesignImagePreview(URL.createObjectURL(e.target.files[0])); } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
                                    <span className="text-xs text-gray-500 mt-1 font-medium">Tải ảnh lên</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tổng tiền & Đặt hàng */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-4">
                            <p className="text-sm font-bold text-gray-500">Tổng cộng</p>
                            <p className="text-3xl font-black text-primary">
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <button onClick={handleSaveDesign} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-md hover:bg-[#2f5146] hover:shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:bg-gray-400">
                            {isSubmitting ? <span className="material-symbols-outlined animate-spin">autorenew</span> : <span className="material-symbols-outlined">save</span>}
                            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu thiết kế"}
                        </button>
                    </div>
                </aside>

                {/* CENTER - PREVIEW (XEM TRƯỚC) */}
                <section className="flex-1 relative bg-[#DCE3DE] flex items-center justify-center p-10 overflow-hidden min-h-[500px] lg:min-h-0 shadow-inner">
                    {/* Hiệu ứng Ánh sáng nền */}
                    <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-300/40 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-lime-300/30 blur-[100px] rounded-full pointer-events-none" />

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
                        <div ref={constraintsRef} className={`relative bg-gradient-to-r from-white/20 via-white/5 to-white/20 border-2 border-white/60 shadow-[inset_0_0_20px_rgba(255,255,255,0.6),inset_10px_0_40px_rgba(255,255,255,0.3),inset_-10px_0_30px_rgba(255,255,255,0.3),0_20px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden flex flex-col justify-end transition-all duration-700 ease-in-out mb-10 ${selectedContainer.cssStyle}`}>
                            
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
                                        key={plant.instanceId}
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
                                style={{ backgroundColor: selectedSoil.cssStyle }} 
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
                                <div className="flex justify-between items-center text-sm"><span className="text-emerald-700 font-medium">Mức độ:</span><span className="font-bold text-primary px-2 py-0.5 bg-white rounded-md shadow-sm">{careInfo.careLevel}</span></div>
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
                            {selectedContainer.description}
                        </p>
                    </div>
                </aside>
            </main>
            
            <Footer />
        </div>
    );
};

export default TerrariumBuilder;