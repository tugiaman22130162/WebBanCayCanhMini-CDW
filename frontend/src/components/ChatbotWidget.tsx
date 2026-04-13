import React, { useState } from "react";

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* CHAT BOX */}
            {open && (
                <div className="w-[280px] bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-primary/10 animate-in fade-in slide-in-from-bottom-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary">
                            <img
                                src="./images/chatbot.png"
                                alt="bot"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div>
                            <h6 className="font-bold text-sm">Trợ lý Mossy</h6>
                            <span className="text-xs text-primary flex items-center gap-1">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                Đang trực tuyến
                            </span>
                        </div>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        Chào bạn! Bạn cần giúp chọn terrarium hoàn hảo hoặc mẹo chăm sóc không? 🌿
                    </p>

                    {/* Button */}
                    <button className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl font-semibold hover:scale-[1.02] transition">
                        Bắt đầu trò chuyện
                    </button>
                </div>
            )}

            {/* FLOAT BUTTON */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition"
            >
                <span className="material-symbols-outlined text-2xl">forum</span>
            </button>
        </div>
    );
}