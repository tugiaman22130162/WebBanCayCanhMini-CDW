import React, { useState } from 'react';
import { isStickerUrl, highlightMatch, formatMessageTime, Message } from './chatUtils';
import axios from 'axios';
import OrderMessageCard from '../components/chat/OrderMessageCard';

interface MessageBubbleProps {
    msg: Message;
    isOwn: boolean;
    showTimeSeparator: boolean;
    replyToMsg?: Message;
    searchMessageTerm: string;
    otherName: string;
    otherAvatar?: string;
    actionMenuOpenId: number | null;
    setActionMenuOpenId: (id: number | null) => void;
    moreMenuOpenId: number | null;
    setMoreMenuOpenId: (id: number | null) => void;
    onReact: (id: number, emoji?: string) => void;
    onReply: (id: number) => void;
    onEdit: (id: number, text: string) => void;
    onDelete: (id: number) => void;
    onRevoke: (id: number) => void;
}

export default function MessageBubble({
    msg, isOwn, showTimeSeparator, replyToMsg, searchMessageTerm,
    otherName, otherAvatar, actionMenuOpenId, setActionMenuOpenId,
    moreMenuOpenId, setMoreMenuOpenId, onReact, onReply, onEdit, onDelete, onRevoke
}: MessageBubbleProps) {
    const isSticker = !msg.isDeleted && (msg.type === 'STICKER' || isStickerUrl(msg.text));
    const isImage = !msg.isDeleted && msg.type === 'IMAGE';
    const isOrder = !msg.isDeleted && msg.type === 'ORDER';

    const [showHistory, setShowHistory] = useState(false);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const handleToggleHistory = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showHistory) {
            setShowHistory(false);
            return;
        }
        setShowHistory(true);
        if (historyList.length === 0) {
            setIsLoadingHistory(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:8080/api/messages/${msg.id}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistoryList(res.data);
            } catch (error) {
                console.error("Lỗi lấy lịch sử chỉnh sửa", error);
            } finally {
                setIsLoadingHistory(false);
            }
        }
    };

    return (
        <React.Fragment>
            {showTimeSeparator && (
                <div className="text-center my-4">
                    <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        {formatMessageTime(msg.timestamp)}
                    </span>
                </div>
            )}
            <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-primary flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm relative z-10 overflow-hidden mb-1">
                            {otherAvatar ? (
                                <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-[14px]">{otherName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                    )}

                    <div className={`flex flex-col gap-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                        {/* Lịch sử chỉnh sửa tách riêng nằm trên bong bóng */}
                        {!msg.isDeleted && showHistory && (
                            <div className={`mb-1 rounded-2xl p-3 max-w-full text-[13px] animate-in fade-in slide-in-from-bottom-2 shadow-sm ${isOwn ? 'bg-emerald-50/80 border border-emerald-100 text-gray-800' : 'bg-gray-100/80 border border-gray-200 text-gray-800'}`}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setShowHistory(false); }} 
                                    className="mt-3 w-full py-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
                                >
                                    Ẩn lịch sử chỉnh sửa
                                </button>
                                <div className="flex flex-col gap-3">
                                    {isLoadingHistory ? (
                                        <div className="text-center py-2"><span className="material-symbols-outlined animate-spin text-[20px] text-gray-400">autorenew</span></div>
                                    ) : historyList.length > 0 ? (
                                        historyList.map((h: any, idx: number) => (
                                            <div key={h.id} className={`${idx !== historyList.length - 1 ? 'border-b border-gray-200/50 pb-3' : ''}`}>
                                                <p className="whitespace-pre-wrap font-medium">{h.oldContent}</p>
                                                <p className="text-[10px] mt-1.5 text-gray-500">{h.editedAt ? new Date(h.editedAt).toLocaleString('vi-VN') : ''}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-2 text-gray-500">Không có lịch sử</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={`flex items-center gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`relative p-3 text-[15px] leading-relaxed flex flex-col ${msg.reaction ? 'mb-3' : ''} ${msg.isDeleted ? 'bg-gray-100 text-gray-500 italic border border-gray-200 rounded-2xl' : (isSticker || isImage || isOrder) ? 'bg-transparent p-0' : isOwn ? 'bg-primary text-white rounded-[20px] rounded-br-sm shadow-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-[20px] rounded-bl-sm shadow-sm'}`}>
                                
                                {!msg.isDeleted && msg.replyToMessageId && (
                                    <div className={`rounded-lg p-2 mb-2 text-xs border ${(isSticker || isImage || isOrder) ? 'bg-white border-gray-200 text-gray-600 shadow-sm mt-2' : isOwn ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                        <span className="font-bold">{replyToMsg?.sender === msg.sender ? 'Bạn' : (replyToMsg?.senderName || otherName)}: </span>
                                        <span className="truncate inline-block max-w-[150px] align-bottom">
                                            {replyToMsg?.type === 'STICKER' ? '[Nhãn dán]' : replyToMsg?.type === 'IMAGE' ? '[Hình ảnh]' : replyToMsg?.type === 'ORDER' ? '[Đơn hàng]' : (replyToMsg?.text || 'Tin nhắn đã thu hồi')}
                                        </span>
                                    </div>
                                )}

                            {isSticker ? (
                                <img src={msg.text} alt="Sticker" className="w-32 h-32 object-contain drop-shadow-sm" />
                            ) : isImage ? (
                                <img src={msg.text} alt="Hình ảnh" className="max-w-[200px] sm:max-w-[250px] rounded-2xl object-cover shadow-sm border border-gray-100 cursor-pointer" />
                            ) : isOrder ? (
                                <OrderMessageCard orderId={Number(msg.text.replace('ORDER:', ''))} />
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.isDeleted ? 'Tin nhắn đã bị thu hồi' : highlightMatch(msg.text, searchMessageTerm)}</p>
                            )}
                            
                            {!msg.isDeleted && (
                                <div className={`flex items-center gap-1 mt-1.5 justify-end ${(isSticker || isImage || isOrder) ? 'text-gray-400 drop-shadow-md' : isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                    {msg.isEdited && (
                                        <span 
                                            className="text-[10px] font-medium cursor-pointer hover:underline"
                                            onClick={handleToggleHistory}
                                        >
                                            (Đã sửa)
                                        </span>
                                    )}
                                    <p className="text-[11px] font-medium">{msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            )}

                            {!msg.isDeleted && msg.reaction && (
                                <div className={`absolute -bottom-4 right-4 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 text-[14px] shadow-sm z-20 cursor-pointer hover:scale-110 transition-transform`} onClick={() => onReact(msg.id, undefined)}>
                                    {msg.reaction}
                                </div>
                            )}

                            {!msg.isDeleted && (
                                <div className={`absolute -bottom-3 -right-2 z-20`}>
                                    <button type="button" title="Thả cảm xúc" onClick={(e) => { e.stopPropagation(); setActionMenuOpenId(actionMenuOpenId === msg.id ? null : msg.id); setMoreMenuOpenId(null); }} className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-primary flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[14px]">add_reaction</span>
                                    </button>
                                    {actionMenuOpenId === msg.id && (
                                        <div className="absolute bottom-full mb-1 right-0 bg-white border border-gray-100 rounded-full px-2 py-1 shadow-lg flex gap-1 z-30">
                                            {['👍', '❤️', '😂', '😮', '😢'].map(emoji => (
                                                <button type="button" key={emoji} onClick={(e) => { e.stopPropagation(); onReact(msg.id, emoji); setActionMenuOpenId(null); }} className="hover:scale-125 transition-transform text-lg">{emoji}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!msg.isDeleted && (
                            <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-20 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                <button type="button" title="Phản hồi" onClick={() => onReply(msg.id)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[16px]">reply</span></button>
                                <div className="relative">
                                    <button type="button" title="Thêm" onClick={() => { setMoreMenuOpenId(moreMenuOpenId === msg.id ? null : msg.id); setActionMenuOpenId(null); }} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-primary flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[16px]">more_vert</span></button>
                                    {moreMenuOpenId === msg.id && (
                                        <div className={`absolute top-full mt-2 ${isOwn ? 'right-0' : 'left-0'} bg-white border border-gray-100 rounded-xl shadow-lg flex flex-col overflow-hidden z-30 w-36`}>
                                            {isOwn && (<><button type="button" onClick={() => onEdit(msg.id, msg.text)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"><span className="material-symbols-outlined text-[16px]">edit</span> Chỉnh sửa</button><button type="button" onClick={() => onRevoke(msg.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors w-full text-left"><span className="material-symbols-outlined text-[16px]">undo</span> Thu hồi</button></>)}
                                            <button type="button" onClick={() => onDelete(msg.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"><span className="material-symbols-outlined text-[16px]">delete</span> Xóa</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}