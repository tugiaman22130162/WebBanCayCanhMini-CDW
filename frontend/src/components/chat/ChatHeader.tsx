import React from 'react';

interface ChatHeaderProps {
    avatar?: string;
    name?: string;
    searchMessageTerm: string;
    setSearchMessageTerm: (term: string) => void;
    isAdmin: boolean;
}

export default function ChatHeader({ avatar, name, searchMessageTerm, setSearchMessageTerm, isAdmin }: ChatHeaderProps) {
    return (
        <div className={`bg-white border-b border-gray-100 ${isAdmin ? 'p-4 flex items-center gap-3 shrink-0' : 'p-4 sm:p-5 flex items-center justify-between shrink-0 z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]'}`}>
            <div className={`flex items-center ${isAdmin ? '' : 'gap-3.5'}`}>
                <div className={`${isAdmin ? 'w-10 h-10 bg-gray-200 text-gray-500' : 'w-11 h-11 bg-emerald-50 text-primary shadow-inner border border-emerald-100'} rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden`}>
                    {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : isAdmin ? name?.charAt(0).toUpperCase() : <img src="/images/chatbot.png" alt="Admin" className="w-full h-full object-cover" />}
                </div>
                <div className={isAdmin ? 'flex-1 ml-3' : ''}>
                    <h1 className={`font-bold text-gray-800 leading-tight ${isAdmin ? '' : 'text-lg'}`}>{name || (isAdmin ? 'Khách hàng' : 'Quản trị viên')}</h1>
                    {!isAdmin && (
                        <p className="text-[13px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span> Đang hoạt động
                        </p>
                    )}
                </div>
            </div>
            <div className={`relative hidden sm:block ${isAdmin ? 'w-56 ml-auto' : ''}`}>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                <input 
                    type="text" 
                    placeholder="Tìm tin nhắn..." 
                    value={searchMessageTerm}
                    onChange={(e) => setSearchMessageTerm(e.target.value)}
                    className="w-full bg-gray-100 text-[14px] py-2 pl-10 pr-4 rounded-full outline-none focus:bg-gray-200 transition-colors placeholder-gray-500 font-medium" 
                />
            </div>
        </div>
    );
}