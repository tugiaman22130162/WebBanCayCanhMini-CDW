import React, { useRef, useEffect } from 'react';
import { Message as ChatMessage } from '../../utils/chatUtils';
import MessageBubble from '../../utils/MessageBubble';

interface MessageListProps {
    messages: ChatMessage[];
    searchMessageTerm: string;
    isTyping: boolean;
    actionMenuOpenId: number | null;
    setActionMenuOpenId: (id: number | null) => void;
    moreMenuOpenId: number | null;
    setMoreMenuOpenId: (id: number | null) => void;
    onReact: (id: number, emoji?: string) => void;
    onReply: (id: number) => void;
    onEdit: (id: number, text: string) => void;
    onDelete: (id: number) => void;
    onRevoke: (id: number) => void;
    isAdmin?: boolean;
    activeConversationAvatar?: string;
    activeConversationName?: string;
}

export default function MessageList({
    messages, searchMessageTerm, isTyping,
    actionMenuOpenId, setActionMenuOpenId,
    moreMenuOpenId, setMoreMenuOpenId,
    onReact, onReply, onEdit, onDelete, onRevoke,
    isAdmin = false, activeConversationAvatar, activeConversationName
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const filteredMessages = messages.filter(msg => 
        msg.text.toLowerCase().includes(searchMessageTerm.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 flex flex-col gap-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            {filteredMessages.map((msg, index) => {
                const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                const isDifferentDay = prevMsg && (
                    msg.timestamp.getDate() !== prevMsg.timestamp.getDate() ||
                    msg.timestamp.getMonth() !== prevMsg.timestamp.getMonth() ||
                    msg.timestamp.getFullYear() !== prevMsg.timestamp.getFullYear()
                );
                const showTimeSeparator = !prevMsg || isDifferentDay || (msg.timestamp.getTime() - prevMsg.timestamp.getTime() > 30 * 60 * 1000);
                
                return (
                    <MessageBubble 
                        key={msg.id} msg={msg} isOwn={msg.sender === (isAdmin ? 'ADMIN' : 'USER')}
                        showTimeSeparator={showTimeSeparator} replyToMsg={messages.find(m => m.id === msg.replyToMessageId)}
                        searchMessageTerm={searchMessageTerm} otherName={msg.senderName || (isAdmin ? (activeConversationName || 'Khách hàng') : 'MiniGarden')} otherAvatar={msg.senderAvatar || (isAdmin ? activeConversationAvatar : '/images/chatbot.png')}
                        actionMenuOpenId={actionMenuOpenId} setActionMenuOpenId={setActionMenuOpenId} moreMenuOpenId={moreMenuOpenId} setMoreMenuOpenId={setMoreMenuOpenId}
                        onReact={onReact} onReply={onReply} onEdit={onEdit} onDelete={onDelete} onRevoke={onRevoke}
                    />
                );
            })}
            
            {isTyping && (
                <div className="flex items-center text-gray-400 text-sm italic animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm relative z-10 overflow-hidden mr-2">
                        {isAdmin && activeConversationAvatar ? (
                            <img src={activeConversationAvatar} alt="User" className="w-full h-full object-cover" />
                        ) : isAdmin && activeConversationName ? (
                            <span className="font-bold text-[14px]">{activeConversationName.charAt(0).toUpperCase()}</span>
                        ) : (
                            <img src="/images/chatbot.png" alt="Admin" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="flex space-x-1 mr-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="ml-1">{isAdmin ? 'Khách hàng đang soạn tin...' : 'Quản trị viên đang soạn tin...'}</span>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}