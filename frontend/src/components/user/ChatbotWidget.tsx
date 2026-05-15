import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

type Message = {
    text: string;
    isBot: boolean;
};

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { text: "Chào bạn! Mình là Mossy, trợ lý ảo của MiniGarden 🌿. Bạn cần tư vấn về sản phẩm hay cách chăm sóc cây ạ?", isBot: true }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isWaiting, setIsWaiting] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatting]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isWaiting) return;

        const userText = inputValue;

        // Thêm tin nhắn của người dùng
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setInputValue("");
        setIsWaiting(true);

        try {
            // Gọi API Spring Boot Backend
            const response = await axios.post("http://localhost:8080/api/chatbot/ask", { message: userText });
            setMessages(prev => [...prev, { text: response.data.reply, isBot: true }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Xin lỗi, hiện tại Mossy đang gặp chút sự cố kết nối. Bạn vui lòng thử lại sau nhé! 🌿", isBot: true }]);
        } finally {
            setIsWaiting(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* CHAT BOX */}
            {open && (
                <div className={`${isChatting ? 'w-[320px] h-[450px] flex flex-col' : 'w-[280px] p-5'} bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-primary/10 animate-in fade-in slide-in-from-bottom-4 overflow-hidden`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between ${isChatting ? 'p-4 bg-primary text-white' : 'mb-4 gap-3'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-white">
                                <img
                                    src="./images/chatbot.png"
                                    alt="bot"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h6 className={`font-bold text-sm ${isChatting ? 'text-white' : 'text-gray-800'}`}>Trợ lý Mossy</h6>
                                <span className={`text-xs flex items-center gap-1 ${isChatting ? 'text-white/80' : 'text-primary'}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${isChatting ? 'bg-white' : 'bg-primary'}`} />
                                    Đang trực tuyến
                                </span>
                            </div>
                        </div>

                        {isChatting && (
                            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>

                    {!isChatting ? (
                        <>
                            {/* Lời chào ban đầu */}
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                Chào bạn! Bạn cần giúp chọn terrarium hoàn hảo hoặc mẹo chăm sóc không? 🌿
                            </p>

                            {/* Nút Bắt đầu */}
                            <button
                                onClick={() => setIsChatting(true)}
                                className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-container hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Bắt đầu trò chuyện
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Khu vực hiển thị tin nhắn */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.isBot ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm' : 'bg-primary text-white rounded-tr-sm shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isWaiting && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl p-3 text-sm bg-white border border-gray-100 text-gray-500 rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[46px]">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                )}
                                {/* Element ẩn dùng để cuộn trang xuống dưới cùng */}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Thanh Input nhập tin nhắn */}
                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Nhập tin nhắn..."
                                    className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                                    disabled={isWaiting}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isWaiting}
                                    className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2f5146] transition-colors shrink-0 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </form>
                        </>
                    )}
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