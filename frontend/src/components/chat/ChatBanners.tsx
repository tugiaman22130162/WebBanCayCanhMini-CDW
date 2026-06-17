import React from 'react';
import { Message as ChatMessage, isStickerUrl } from '../../utils/chatUtils';

interface ChatBannersProps {
    replyingMessageId: number | null;
    editingMessageId: number | null;
    messages: ChatMessage[];
    activeConversationName?: string;
    isAdmin: boolean;
    onCancelReply: () => void;
    onCancelEdit: () => void;
    setInputText: (text: string) => void;
}

export default function ChatBanners({ replyingMessageId, editingMessageId, messages, activeConversationName, isAdmin, onCancelReply, onCancelEdit, setInputText }: ChatBannersProps) {
    const replyMsg = messages.find(m => m.id === replyingMessageId);
    const editMsg = messages.find(m => m.id === editingMessageId);

    return (
        <>
            {replyingMessageId && replyMsg && (
                <div className={`flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-sm ${isAdmin ? 'mx-4 mt-2' : ''}`}>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-primary text-xs">Đang phản hồi {replyMsg.sender === (isAdmin ? 'ADMIN' : 'USER') ? 'chính bạn' : (replyMsg.senderName || activeConversationName || (isAdmin ? 'Khách hàng' : 'MiniGarden'))}</span>
                        <span className="text-gray-600 truncate">{(replyMsg.type === 'STICKER' || isStickerUrl(replyMsg.text)) ? '[Nhãn dán]' : replyMsg.type === 'IMAGE' ? '[Hình ảnh]' : replyMsg.type === 'ORDER' ? '[Đơn hàng]' : replyMsg.type === 'LOCATION' ? '[Vị trí]' : replyMsg.text}</span>
                    </div>
                    <button onClick={onCancelReply} className="text-gray-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                </div>
            )}

            {editingMessageId && editMsg && (
                <div className={`flex items-center justify-between bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 text-sm ${isAdmin ? 'mx-4 mt-2' : ''}`}>
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-orange-600 text-xs flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">edit</span> Đang chỉnh sửa</span>
                        <span className="text-orange-800 truncate">{editMsg.text}</span>
                    </div>
                    <button onClick={() => { onCancelEdit(); setInputText(''); }} className="text-orange-400 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                </div>
            )}
        </>
    );
}