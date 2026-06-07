import React, { useState } from 'react';
import { Conversation, formatSidebarTime, highlightMatch } from '../../utils/chatUtils';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    isAdmin: boolean;
}

export default function ChatSidebar({ conversations, activeConversationId, onSelectConversation, isAdmin }: ChatSidebarProps) {
    const [searchConversationTerm, setSearchConversationTerm] = useState('');

    const filteredConversations = conversations.filter(conv => 
        conv.name.toLowerCase().includes(searchConversationTerm.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchConversationTerm.toLowerCase())
    );

    return (
        <div className={`${isAdmin ? 'flex' : 'hidden md:flex'} w-[320px] bg-white border-r border-gray-100 flex-col shrink-0 z-20`}>
            <div className="p-5 border-b border-gray-100">
                <h2 className={`font-bold text-gray-800 ${isAdmin ? 'text-xl' : 'text-2xl'}`}>{isAdmin ? 'Tin nhắn khách hàng' : 'Đoạn chat'}</h2>
                <div className="mt-4 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                    <input 
                        type="text" 
                        placeholder={isAdmin ? "Tìm kiếm khách hàng..." : "Tìm kiếm tin nhắn..."} 
                        value={searchConversationTerm}
                        onChange={(e) => setSearchConversationTerm(e.target.value)}
                        className="w-full bg-gray-100 text-[15px] py-2.5 pl-10 pr-4 rounded-full outline-none focus:bg-gray-200 transition-colors placeholder-gray-500 font-medium" 
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredConversations.length > 0 ? filteredConversations.map(conv => (
                    <div key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-colors ${conv.isActive || conv.id === activeConversationId ? 'bg-emerald-50/70' : 'hover:bg-gray-50'}`}>
                        <div className={`relative shrink-0 ${isAdmin ? 'w-12 h-12 bg-gray-200 text-gray-500' : 'w-14 h-14 bg-emerald-100 text-primary border border-emerald-200 shadow-sm'} rounded-full flex items-center justify-center font-bold overflow-hidden`}>
                            {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" /> : isAdmin ? conv.name.charAt(0).toUpperCase() : <img src="/images/chatbot.png" alt="Admin" className="w-full h-full object-cover" />}
                            {!isAdmin && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ade80] border-2 border-white rounded-full z-10"></span>}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-start mb-0.5">
                                <h3 className={`truncate ${conv.isActive || conv.id === activeConversationId ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'} ${isAdmin ? 'text-[14px]' : 'text-[15px]'}`}>{highlightMatch(conv.name, searchConversationTerm)}</h3>
                                {conv.lastMessageTime && <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{formatSidebarTime(conv.lastMessageTime)}</span>}
                            </div>
                            <div className="flex justify-between items-start gap-1 mt-0.5">
                                <p className={`line-clamp-2 pr-1 flex-1 ${isAdmin ? 'text-[12px]' : 'text-[13px]'} ${(isAdmin && conv.unread > 0) || (!isAdmin && (conv.isActive || conv.id === activeConversationId)) ? 'text-primary font-medium' : 'text-gray-500'}`}>{highlightMatch(conv.lastMessage, searchConversationTerm)}</p>
                                {conv.unread > 0 && <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">{conv.unread}</div>}
                            </div>
                        </div>
                    </div>
                )) : isAdmin ? <div className="p-4 text-center text-gray-500 text-sm">Chưa có khách hàng nào nhắn tin</div> : null}
            </div>
        </div>
    );
}