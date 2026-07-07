import React, { useState, useEffect } from 'react';
import { Conversation, formatSidebarTime, highlightMatch, isStickerUrl } from '../../utils/chatUtils';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    isAdmin: boolean;
    activeMessages?: any[];
    onDeleteSuccess?: (id: number) => void;
    onConversationCreated?: (conv: any) => void;
}


export default function ChatSidebar({ conversations, activeConversationId, onSelectConversation, isAdmin, activeMessages, onDeleteSuccess, onConversationCreated }: ChatSidebarProps) {
    const [searchConversationTerm, setSearchConversationTerm] = useState('');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [lastMessagesMap, setLastMessagesMap] = useState<Record<number, any>>({});

    useEffect(() => {
        if (isAdmin) {
            const token = localStorage.getItem('token');
            axios.get("http://localhost:8080/api/users", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setAllUsers(res.data))
                .catch(err => console.error("Lỗi lấy danh sách user:", err));
        }
    }, [isAdmin]);

    useEffect(() => {
        const fetchMissingMessages = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const promises = conversations
                .filter(conv => {
                    // Nếu đang mở đoạn chat này hoặc đã fetch rồi thì bỏ qua
                    if (lastMessagesMap[conv.id] || conv.id === activeConversationId) return false;
                    
                    // Rút trích text hiện tại
                    const text = (conv as any).lastMessageContent || (conv as any).last_message_content || (conv as any).lastMessageText || (typeof (conv as any).lastMessage === 'string' ? (conv as any).lastMessage : ((conv as any).lastMessage as any)?.content || ((conv as any).lastMessage as any)?.text) || '';
                    
                    // Nếu text rỗng, hoặc là object nhưng không có content, hoặc hiển thị mặc định là "Chưa có tin nhắn", ta sẽ ngầm gọi API để lấy dữ liệu thật
                    return !text || text === 'Chưa có tin nhắn' || (typeof (conv as any).lastMessage === 'object' && (conv as any).lastMessage !== null && !(conv as any).lastMessage.content && !(conv as any).lastMessage.text);
                })
                .map(async (conv) => {
                    try {
                        const msgRes = await axios.get(`http://localhost:8080/api/messages/conversation/${conv.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const messagesData = Array.isArray(msgRes.data) ? msgRes.data : (msgRes.data.content || []);
                        if (messagesData && messagesData.length > 0) {
                            return { id: conv.id, message: messagesData[messagesData.length - 1] };
                        }
                    } catch (e) {
                        console.error(`Lỗi lấy tin nhắn conversation ${conv.id}:`, e);
                    }
                    return { id: conv.id, message: null };
                });
                
            if (promises.length > 0) {
                const results = await Promise.all(promises);
                setLastMessagesMap(prev => {
                    const next = { ...prev };
                    let hasNew = false;
                    results.forEach(res => {
                        if (res.message) {
                            next[res.id] = res.message;
                            hasNew = true;
                        } else {
                            // Đánh dấu là đã fetch rồi nhưng thực sự không có tin nhắn (tránh fetch lặp lại gây lag)
                            next[res.id] = { text: 'Chưa có tin nhắn', isEmpty: true };
                            hasNew = true;
                        }
                    });
                    return hasNew ? next : prev;
                });
            }
        };
        
        if (conversations.length > 0) fetchMissingMessages();
    }, [conversations, activeConversationId]);

    const getLastMessageDetails = (conv: any) => {
        let lastMsgStr = '';
        let isYou = false;

        if (activeMessages && activeMessages.length > 0 && conv.id === activeConversationId) {
            const lastMsg = activeMessages[activeMessages.length - 1];
            let text = lastMsg.text || lastMsg.content || '';
            if (lastMsg.type === 'IMAGE') text = '[Hình ảnh]';
            else if (lastMsg.type === 'STICKER' || (typeof text === 'string' && isStickerUrl(text))) text = '[Nhãn dán]';
            else if (lastMsg.type === 'ORDER' || (typeof text === 'string' && text.startsWith('ORDER:'))) text = '[Đơn hàng]';
            else if (lastMsg.type === 'LOCATION' || (typeof text === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(text.trim()))) text = '[Vị trí]';
            lastMsgStr = text;
            if (lastMsg.sender === (isAdmin ? 'ADMIN' : 'USER')) {
                isYou = true;
            }
        } else if (lastMessagesMap[conv.id]) {
            const mappedLastMsg = lastMessagesMap[conv.id];
            if (mappedLastMsg.isEmpty) {
                return 'Chưa có tin nhắn';
            }
            let text = mappedLastMsg.text || mappedLastMsg.content || '';
            if (mappedLastMsg.type === 'IMAGE') text = '[Hình ảnh]';
            else if (mappedLastMsg.type === 'STICKER' || (typeof text === 'string' && isStickerUrl(text))) text = '[Nhãn dán]';
            else if (mappedLastMsg.type === 'ORDER' || (typeof text === 'string' && text.startsWith('ORDER:'))) text = '[Đơn hàng]';
            else if (mappedLastMsg.type === 'LOCATION' || (typeof text === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(text.trim()))) text = '[Vị trí]';
            lastMsgStr = text;
            
            const senderId = mappedLastMsg.senderId || mappedLastMsg.sender_id;
            if (mappedLastMsg.sender === (isAdmin ? 'ADMIN' : 'USER') || (isAdmin && senderId !== (conv as any).customerId && senderId !== (conv as any).customer_id) || (!isAdmin && (senderId === (conv as any).customerId || senderId === (conv as any).customer_id))) {
                isYou = true;
            }
        } else {
            lastMsgStr = conv.lastMessageContent || conv.last_message_content || conv.lastMessageText || (typeof conv.lastMessage === 'string' ? conv.lastMessage : (conv.lastMessage as any)?.content || (conv.lastMessage as any)?.text) || '';
            if (typeof lastMsgStr === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(lastMsgStr.trim())) lastMsgStr = '[Vị trí]';
            
            let senderId = conv.lastMessageSenderId || conv.last_message_sender_id;
            if (!senderId && typeof conv.lastMessage === 'object' && conv.lastMessage !== null) {
                senderId = conv.lastMessage.senderId || conv.lastMessage.sender_id;
                let text = conv.lastMessage.text || conv.lastMessage.content || '';
                if (conv.lastMessage.type === 'IMAGE') text = '[Hình ảnh]';
                else if (conv.lastMessage.type === 'STICKER' || (typeof text === 'string' && isStickerUrl(text))) text = '[Nhãn dán]';
                else if (conv.lastMessage.type === 'ORDER' || (typeof text === 'string' && text.startsWith('ORDER:'))) text = '[Đơn hàng]';
                else if (conv.lastMessage.type === 'LOCATION' || (typeof text === 'string' && /^-?\d+\.\d+,-?\d+\.\d+$/.test(text.trim()))) text = '[Vị trí]';
                if (text) lastMsgStr = text;
            }
            
            if (senderId) {
                if (isAdmin && senderId !== (conv as any).customerId && senderId !== (conv as any).customer_id) isYou = true;
                if (!isAdmin && (senderId === (conv as any).customerId || senderId === (conv as any).customer_id)) isYou = true;
            }
        }

        if (isYou && lastMsgStr && lastMsgStr !== 'Chưa có tin nhắn') {
            lastMsgStr = 'Bạn: ' + lastMsgStr;
        }
        return String(lastMsgStr).trim() || 'Chưa có tin nhắn';
    };

    const getConversationDisplayInfo = (conv: any) => {
        let name = conv.name || conv.customerName || conv.userName || conv.user?.fullName;
        let avatar = conv.avatar || conv.customerAvatar || conv.userAvatar || conv.user?.avatar;
        
        if (isAdmin) {
            if (!name && allUsers.length > 0) {
                const customerId = (conv as any).customerId || (conv as any).customer_id;
                const user = allUsers.find(u => u.id === customerId);
                if (user) {
                    name = user.fullName;
                    avatar = user.avatar;
                }
            }
            return { name: name || 'Khách hàng', avatar: avatar || null };
        }
        return { name: 'Quản trị viên - MiniGarden', avatar: '/logo.png' };
    };

    const filteredConversations = conversations.filter(conv => {
        if (isAdmin) {
            const customerId = (conv as any).customerId || (conv as any).customer_id;
            const userObj = allUsers.find(u => u.id === customerId);
            if (userObj && userObj.role === 'ADMIN') {
                return false; // Ẩn hoàn toàn đoạn chat nếu khách hàng thực chất là một ADMIN khác
            }
        }

        const displayInfo = getConversationDisplayInfo(conv);
        const nameMatch = (displayInfo.name || '').toLowerCase().includes(searchConversationTerm.toLowerCase());
        const lastMsgText = getLastMessageDetails(conv);
        const msgMatch = lastMsgText.toLowerCase().includes(searchConversationTerm.toLowerCase());
        return nameMatch || msgMatch;
    });

    const handleDeleteConversation = async (e: React.MouseEvent, convId: number) => {
        e.stopPropagation();
        const result = await Swal.fire({
            title: 'Xóa đoạn chat?',
            text: "Hành động này sẽ xóa toàn bộ tin nhắn. Bạn có chắc chắn không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-red-600',
                cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold mx-2 hover:bg-gray-300'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/conversations/${convId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (onDeleteSuccess) {
                    onDeleteSuccess(convId);
                } else {
                    window.location.reload();
                }
            } catch (error) {
                console.error("Lỗi xóa đoạn chat:", error);
                Swal.fire('Lỗi', 'Không thể xóa đoạn chat này. Vui lòng thử lại sau!', 'error');
            }
        }
    };

    // Tìm kiếm khách hàng (chưa có cuộc hội thoại hiện hành)
    const searchLower = searchConversationTerm.toLowerCase();
    const matchingUsers = isAdmin && searchConversationTerm ? allUsers.filter(u =>
        u.role !== 'ADMIN' &&
        (u.fullName?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower)) &&
        !conversations.some(c => (c as any).customerId === u.id || (c as any).customer_id === u.id)
    ) : [];

    const handleStartNewChat = async (userId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:8080/api/conversations/user/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newConv = res.data;
            
            const userObj = allUsers.find(u => u.id === userId);
            // Format lại dữ liệu để tương thích với Frontend State
            const formattedConv = {
                ...newConv,
                name: userObj?.fullName || 'Khách hàng',
                avatar: userObj?.avatar || null,
                unread: 0,
                isActive: false,
                lastMessage: 'Chưa có tin nhắn'
            };

            if (onConversationCreated) onConversationCreated(formattedConv);
            onSelectConversation(newConv.id);
            setSearchConversationTerm(''); // Xóa thanh tìm kiếm sau khi chọn
        } catch (error) {
            console.error("Lỗi tạo cuộc trò chuyện mới:", error);
            Swal.fire('Lỗi', 'Không thể tạo cuộc trò chuyện', 'error');
        }
    };

    const handleMarkAllAsRead = () => {
        const storageKey = isAdmin ? "adminUnreadCounts" : "userUnreadCounts";
        const readTimesKey = isAdmin ? "adminReadTimes" : "userReadTimes";
        
        const unreadCounts = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const readTimes = JSON.parse(localStorage.getItem(readTimesKey) || "{}");
        
        conversations.forEach(conv => {
            unreadCounts[conv.id] = 0;
            readTimes[conv.id] = new Date().toISOString(); 
        });
        
        localStorage.setItem(storageKey, JSON.stringify(unreadCounts));
        localStorage.setItem(readTimesKey, JSON.stringify(readTimes));
        
        // Bắn sự kiện để các Hook (useAdminChatWebSocket / useChatWebSocket) cập nhật lại giao diện ngay lập tức
        window.dispatchEvent(new Event(isAdmin ? "adminUnreadUpdated" : "userUnreadUpdated"));
    };

    return (
        <div className={`${isAdmin ? 'flex' : 'hidden md:flex'} w-[320px] bg-white border-r border-gray-100 flex-col shrink-0 z-20`}>
            <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <h2 className={`font-bold text-gray-800 ${isAdmin ? 'text-xl' : 'text-2xl'}`}>{isAdmin ? 'Tin nhắn khách hàng' : 'Đoạn chat'}</h2>
                    {conversations.some((c: any) => c.unread > 0) && (
                        <button onClick={handleMarkAllAsRead} className="text-xs text-primary font-bold hover:opacity-80 transition-opacity flex items-center gap-1" title="Đánh dấu tất cả là đã đọc">
                            <span className="material-symbols-outlined text-[16px]">done_all</span> Đọc tất cả
                        </button>
                    )}
                </div>
                {isAdmin && (
                    <div className="mt-4 relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm khách hàng..." 
                            value={searchConversationTerm}
                            onChange={(e) => setSearchConversationTerm(e.target.value)}
                            className="w-full bg-gray-100 text-[15px] py-2.5 pl-10 pr-4 rounded-full outline-none focus:bg-gray-200 transition-colors placeholder-gray-500 font-medium" 
                        />
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {filteredConversations.length > 0 ? filteredConversations.map(conv => {
                    const lastMsgText = getLastMessageDetails(conv);
                    const displayInfo = getConversationDisplayInfo(conv);
                    const isUnread = (conv as any).unread > 0;

                    return (
                    <div key={conv.id} onClick={() => onSelectConversation(conv.id)} className={`group relative flex items-center gap-3 p-3 rounded-[16px] cursor-pointer transition-colors ${(conv as any).isActive || conv.id === activeConversationId ? 'bg-emerald-50/70' : 'hover:bg-gray-50'}`}>
                        <div className="relative shrink-0">
                            <div className={`${isAdmin ? 'w-12 h-12 bg-gray-200 text-gray-500' : 'w-14 h-14 bg-emerald-100 text-primary border border-emerald-200 shadow-sm'} rounded-full flex items-center justify-center font-bold overflow-hidden`}>
                                {displayInfo.avatar ? <img src={displayInfo.avatar} alt={displayInfo.name} className="w-full h-full object-cover" /> : isAdmin ? (displayInfo.name?.charAt(0)?.toUpperCase()) : <img src="/logo.png" alt="Admin" className="w-full h-full object-cover" />}
                            </div>
                            {isAdmin && (conv as any).isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ade80] border-2 border-white rounded-full z-10" title="Đang hoạt động"></span>}
                            {!isAdmin && conv.isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ade80] border-2 border-white rounded-full z-10" title="Đang hoạt động"></span>}
                        </div>
                        <div className="flex-1 overflow-hidden pr-6">
                            <div className="flex justify-between items-start mb-0.5">
                                <h3 className={`truncate ${isUnread ? 'font-black text-gray-900' : ((conv as any).isActive || conv.id === activeConversationId ? 'font-bold text-gray-900' : 'font-semibold text-gray-800')} ${isAdmin ? 'text-[14px]' : 'text-[15px]'}`}>{highlightMatch(displayInfo.name || '', searchConversationTerm)}</h3>
                                {((conv as any).lastMessageTime || conv.lastMessageTime) && <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{formatSidebarTime((conv as any).lastMessageTime || conv.lastMessageTime).replace(/-/g, '/')}</span>}
                            </div>
                            <div className="flex justify-between items-start gap-1 mt-0.5">
                                <p className={`line-clamp-2 pr-1 flex-1 ${isAdmin ? 'text-[12px]' : 'text-[13px]'} ${isUnread ? 'text-gray-900 font-bold' : (((conv as any).isActive || conv.id === activeConversationId) ? 'text-primary font-medium' : 'text-gray-500')}`}>{highlightMatch(lastMsgText, searchConversationTerm)}</p>
                                {isUnread && <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">{(conv as any).unread}</div>}
                            </div>
                        </div>
                        {/* Nút Xóa (Hiển thị khi hover) */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleDeleteConversation(e, conv.id)} 
                                className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm border border-red-100"
                                title="Xóa đoạn chat"
                            >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                )}) : isAdmin && !searchConversationTerm ? <div className="p-4 text-center text-gray-500 text-sm">Chưa có khách hàng nào nhắn tin</div> : null}

                {/* Hiển thị nếu tìm kiếm không ra kết quả nào */}
                {filteredConversations.length === 0 && matchingUsers.length === 0 && searchConversationTerm && isAdmin && (
                    <div className="p-4 text-center text-gray-500 text-sm">Không tìm thấy khách hàng nào.</div>
                )}

                {/* Hiển thị những khách hàng khớp với từ khóa tìm kiếm nhưng chưa nhắn tin bao giờ */}
                {matchingUsers.length > 0 && (
                    <div className="mt-2 border-t border-gray-100 pt-2">
                        <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Khách hàng mới</div>
                        {matchingUsers.map(u => (
                            <div key={`user-${u.id}`} onClick={() => handleStartNewChat(u.id)} className="group flex items-center gap-3 p-3 mx-2 rounded-[16px] cursor-pointer transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100">
                                <div className="relative w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0">
                                    {u.avatar ? <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" /> : u.fullName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden pr-2">
                                    <h3 className="truncate font-bold text-gray-900 text-[14px]">{highlightMatch(u.fullName || '', searchConversationTerm)}</h3>
                                    <p className="truncate text-gray-500 text-[12px] mt-0.5">{highlightMatch(u.email || '', searchConversationTerm)}</p>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}