import React, { useState, useRef, useEffect } from 'react';
import { STICKERS } from '../../data/stickers';

interface ChatActionsProps {
    onSendImage: (file: File) => void;
    onSendSticker: (stickerUrl: string) => void;
    onSendOrder?: () => void;
    onSendLocation?: () => void;
    uploadId?: string;
}

export default function ChatActions({ onSendImage, onSendSticker, onSendOrder, onSendLocation, uploadId = "chat-image-upload" }: ChatActionsProps) {
    const [plusMenuOpen, setPlusMenuOpen] = useState(false);
    const [stickerMenuOpen, setStickerMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setPlusMenuOpen(false);
                setStickerMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex items-center gap-1 mb-1 shrink-0" ref={menuRef}>
            <div className="relative">
                <button type="button" onClick={() => { setPlusMenuOpen(!plusMenuOpen); setStickerMenuOpen(false); }} className="text-primary hover:bg-emerald-50 transition-colors w-10 h-10 rounded-full flex items-center justify-center" title="Mở rộng">
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                </button>
                {plusMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 bg-white border border-gray-100 rounded-2xl shadow-xl flex flex-col py-2 z-30 animate-in fade-in zoom-in-95">
                        <button type="button" onClick={() => { setPlusMenuOpen(false); if (onSendOrder) onSendOrder(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700 font-semibold">
                            <span className="material-symbols-outlined text-[20px] text-blue-500">receipt_long</span> Đơn hàng
                        </button>
                        <button type="button" onClick={() => { setPlusMenuOpen(false); if (onSendLocation) onSendLocation(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left text-sm text-gray-700 font-semibold">
                            <span className="material-symbols-outlined text-[20px] text-red-500">location_on</span> Vị trí
                        </button>
                    </div>
                )}
            </div>
            <div className="relative flex items-center justify-center">
                <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id={uploadId}
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            onSendImage(e.target.files[0]);
                            e.target.value = '';
                        }
                    }}
                />
                <label htmlFor={uploadId} className="text-primary hover:bg-emerald-50 transition-colors w-10 h-10 rounded-full flex items-center justify-center cursor-pointer m-0" title="Đính kèm ảnh">
                    <span className="material-symbols-outlined text-[24px]">image</span>
                </label>
            </div>
            <div className="relative">
                <button type="button" onClick={() => { setStickerMenuOpen(!stickerMenuOpen); setPlusMenuOpen(false); }} className="text-primary hover:bg-emerald-50 transition-colors w-10 h-10 rounded-full flex items-center justify-center" title="Nhãn dán">
                    <span className="material-symbols-outlined text-[24px]">mood</span>
                </button>
                {stickerMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl flex flex-col p-3 z-30 animate-in fade-in zoom-in-95">
                        <h4 className="text-sm font-bold text-gray-800 mb-2 px-1">Nhãn dán</h4>
                        <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-48 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {STICKERS.map((stickerUrl, index) => (
                                <button key={index} type="button" onClick={() => { onSendSticker(stickerUrl); setStickerMenuOpen(false); }} className="p-1 hover:bg-gray-50 rounded-xl transition-colors hover:scale-110">
                                    <img src={stickerUrl} alt={`Sticker ${index + 1}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}