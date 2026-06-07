import React, { useRef, useEffect } from 'react';
import ChatBanners from './ChatBanners';
import ChatActions from '../../components/chat/ChatActions';
import { Message as ChatMessage } from '../../utils/chatUtils';

interface MessageInputAreaProps {
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    activeConversationName?: string;
    uploadId?: string;
    placeholder?: string;
    inputText: string;
    setInputText: (text: string) => void;
    replyingMessageId: number | null;
    editingMessageId: number | null;
    messages: ChatMessage[];
    onCancelReply: () => void;
    onCancelEdit: () => void;
    onSendMessage: (e?: React.FormEvent) => void;
    onSendSticker: (url: string) => void;
    onSendImage: (file: File) => void;
    onSendOrder?: () => void;
    sendTypingStatus: (isTyping: boolean) => void | Promise<void>;
}

export default function MessageInputArea({
    isLoggedIn = true, isAdmin = false, activeConversationName, uploadId = "chat-image-upload", placeholder = "Aa",
    inputText, setInputText,
    replyingMessageId, editingMessageId, messages,
    onCancelReply, onCancelEdit,
    onSendMessage, onSendSticker, onSendImage, onSendOrder,
    sendTypingStatus
}: MessageInputAreaProps) {
    const typingTimeoutRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (replyingMessageId || editingMessageId) {
            textareaRef.current?.focus();
        }
    }, [replyingMessageId, editingMessageId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(e.target.value);
        if (!typingTimeoutRef.current) sendTypingStatus(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        await sendTypingStatus(false);
        onSendMessage(e);
    };

    const handleSendSticker = async (url: string) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        await sendTypingStatus(false);
        onSendSticker(url);
    };

    const handleSendImage = async (file: File) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        await sendTypingStatus(false);
        onSendImage(file);
    };

    return (
        <div className="p-4 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-2">
            <ChatBanners 
                replyingMessageId={replyingMessageId} editingMessageId={editingMessageId} 
                messages={messages} isAdmin={isAdmin} activeConversationName={activeConversationName}
                onCancelReply={onCancelReply} onCancelEdit={onCancelEdit} setInputText={setInputText} 
            />

            {!isLoggedIn && !isAdmin ? (
                <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-[24px] border border-gray-100">
                    <p className="text-gray-500 text-[15px] font-medium mb-3">Bạn cần đăng nhập để gửi tin nhắn</p>
                    <button 
                        type="button"
                        onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} 
                        className="bg-primary text-white font-bold py-2.5 px-8 rounded-full hover:bg-[#2f5146] transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    <ChatActions onSendImage={handleSendImage} onSendSticker={handleSendSticker} onSendOrder={onSendOrder} uploadId={uploadId} />
                    <textarea
                        ref={textareaRef} value={inputText} onChange={handleInputChange}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                        placeholder={placeholder} rows={1}
                        className="flex-1 bg-gray-100 text-[15px] px-5 py-3 rounded-[24px] outline-none focus:bg-gray-200 transition-all text-gray-800 placeholder-gray-500 resize-none max-h-32 min-h-[44px] leading-relaxed mb-1"
                    />
                    <button type="submit" disabled={!inputText.trim()} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 mb-1 ${inputText.trim() ? 'text-primary hover:bg-emerald-50' : 'text-gray-300 cursor-not-allowed'}`}>
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                </form>
            )}
        </div>
    );
}