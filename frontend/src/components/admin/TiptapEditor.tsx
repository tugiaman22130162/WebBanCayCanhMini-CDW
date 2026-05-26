import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { showErrorToast } from '../../utils/ToastUtils';

interface TiptapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('http://localhost:8080/api/blogs/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            const { url } = response.data;
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        } catch (error) {
            console.error("Lỗi tải ảnh:", error);
            showErrorToast("Tải ảnh thất bại!", 2000);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="flex flex-wrap gap-2 p-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="In đậm"
            >
                <span className="font-extrabold text-[15px]">B</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="In nghiêng"
            >
                <span className="italic font-serif text-[16px]">I</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('strike') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Gạch ngang"
            >
                <span className="line-through text-[15px] font-medium">S</span>
            </button>
            
            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Tiêu đề 1"
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Tiêu đề 2"
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 h-8 flex items-center justify-center rounded-lg font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Tiêu đề 3"
            >
                H3
            </button>
            
            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Danh sách dấu chấm"
            >
                <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Danh sách số"
            >
                <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-gray-300 text-gray-800 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Trích dẫn"
            >
                <span className="material-symbols-outlined text-[20px]">format_quote</span>
            </button>
            
            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>
            
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Tải ảnh lên từ máy tính"
            >
                {isUploading ? <span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span> : <span className="material-symbols-outlined text-[20px]">image</span>}
            </button>

            <div className="w-[1px] h-8 bg-gray-300 mx-1"></div>
            
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                title="Hoàn tác"
            >
                <span className="material-symbols-outlined text-[20px]">undo</span>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                title="Làm lại"
            >
                <span className="material-symbols-outlined text-[20px]">redo</span>
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[250px] p-4 text-gray-800 leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content, { emitUpdate: false });
        }
    }, [content, editor]);

    return (
        <div className="border border-gray-300 rounded-xl focus-within:border-[#006c49] focus-within:ring-1 focus-within:ring-[#006c49] overflow-hidden shadow-sm flex flex-col bg-white transition-all">
            <style>{`
                .ProseMirror h1 { font-size: 1.8em; font-weight: 800; margin-bottom: 0.5em; line-height: 1.2; color: #1f2937; }
                .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.5em; line-height: 1.3; color: #374151; }
                .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.5em; line-height: 1.4; color: #4b5563; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror li p { margin-bottom: 0.2em; }
                .ProseMirror blockquote { border-left: 4px solid #006c49; padding-left: 1em; margin-left: 0; margin-bottom: 1em; font-style: italic; color: #4b5563; background: #f9fafb; padding-top: 0.5em; padding-bottom: 0.5em; border-radius: 0 0.5em 0.5em 0; }
                .ProseMirror p { margin-bottom: 1em; }
                .ProseMirror p:last-child { margin-bottom: 0; }
                .ProseMirror strong { font-weight: 700; color: #111827; }
                .ProseMirror img { width: 100%; height: 400px; object-fit: cover; border-radius: 8px; margin: 1em auto; display: block; border: 1px solid #e5e7eb; }
            `}</style>
            <MenuBar editor={editor} />
            <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full cursor-text" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}