import React from 'react';

export type Message = {
    id: number;
    text: string;
    type?: string;
    sender: 'USER' | 'ADMIN';
    timestamp: Date;
    isDeleted?: boolean;
    isEdited?: boolean;
    replyToMessageId?: number;
    reaction?: string;
    senderName?: string;
    senderAvatar?: string;
};

export type Conversation = {
    id: number;
    name: string;
    avatar?: string;
    lastMessage: string;
    lastMessageTime?: Date | null;
    unread: number;
    isActive: boolean;
};

export const formatMessageTime = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return isToday ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${date.toLocaleDateString('vi-VN')}`;
};

export const formatSidebarTime = (date: Date) => {
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return isToday ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export const isStickerUrl = (text: string) => typeof text === 'string' && text.startsWith('/assets/stickers/') && text.endsWith('.gif');

export const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escapeRegex = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegex})`, 'gi');
    return text.split(regex).map((part, i) => regex.test(part) ? <span key={i} className="bg-yellow-100 text-gray-900 px-0.5 rounded">{part}</span> : part);
};