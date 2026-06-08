'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslations } from 'next-intl';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const t = useTranslations('richTextEditor');
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        'aria-label': placeholder ?? t('editorAria'),
        class: 'prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="admin-panel overflow-hidden focus-within:ring-2 focus-within:ring-[#E8922D]">
      <div className="admin-toolbar m-3 flex flex-wrap gap-1 p-2">
        <button
          type="button"
          aria-label={t('toggleBold')}
          title={t('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded-lg px-2.5 py-1.5 text-sm ${editor.isActive('bold') ? 'bg-[#fef3e2] text-[#E8922D]' : 'text-[#6b7280] hover:bg-[#f5f5f4]'}`}
        >
          B
        </button>
        <button
          type="button"
          aria-label={t('toggleItalic')}
          title={t('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded-lg px-2.5 py-1.5 text-sm italic ${editor.isActive('italic') ? 'bg-[#fef3e2] text-[#E8922D]' : 'text-[#6b7280] hover:bg-[#f5f5f4]'}`}
        >
          I
        </button>
        <button
          type="button"
          aria-label={t('toggleBulletList')}
          title={t('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded-lg px-2.5 py-1.5 text-sm ${editor.isActive('bulletList') ? 'bg-[#fef3e2] text-[#E8922D]' : 'text-[#6b7280] hover:bg-[#f5f5f4]'}`}
        >
          List
        </button>
        <button
          type="button"
          aria-label={t('toggleHeading3')}
          title={t('heading3')}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded-lg px-2.5 py-1.5 text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-[#fef3e2] text-[#E8922D]' : 'text-[#6b7280] hover:bg-[#f5f5f4]'}`}
        >
          H3
        </button>
      </div>
      <div className="px-3 pb-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
