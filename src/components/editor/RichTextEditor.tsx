'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  FileUp,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo2,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';

export type RichTextUploadResult = {
  url: string;
  name?: string;
  alt?: string;
};

type RichTextEditorProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<RichTextUploadResult>;
  onFileUpload?: (file: File) => Promise<RichTextUploadResult>;
};

type UploadingType = 'image' | 'file' | null;

type CommandValue = string | undefined;

type ToolbarButtonProps = {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
};

const buttonBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-background px-2 text-foreground transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50';

const selectBase =
  'h-9 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50';

function ToolbarButton({ title, disabled, onClick, children, active }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`${buttonBase} ${active ? 'border-primary bg-primary/10 text-primary' : ''}`}
      onMouseDown={(event) => {
        event.preventDefault();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function extractMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'حدث خطأ أثناء تنفيذ العملية';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeEditorHtml(html: string) {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<br>' || trimmed === '<div><br></div>' || trimmed === '<p><br></p>') return '';
  return trimmed;
}

function buildTableHtml() {
  return `
    <table class="rich-table" style="width:100%;border-collapse:collapse;margin:1rem 0;text-align:right;">
      <thead>
        <tr>
          <th style="border:1px solid #d1d5db;padding:.5rem;background:#f8fafc;">العنوان</th>
          <th style="border:1px solid #d1d5db;padding:.5rem;background:#f8fafc;">القيمة</th>
          <th style="border:1px solid #d1d5db;padding:.5rem;background:#f8fafc;">ملاحظات</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
        </tr>
        <tr>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
          <td style="border:1px solid #d1d5db;padding:.5rem;">—</td>
        </tr>
      </tbody>
    </table>
  `;
}

function isSafeUrl(url: string) {
  const value = url.trim().toLowerCase();
  return Boolean(value) && !value.startsWith('javascript:') && !value.startsWith('data:text/html');
}

export default function RichTextEditor({
  id = 'rich-text-editor',
  name = 'content',
  value,
  onChange,
  placeholder = 'اكتب المحتوى هنا...',
  minHeight = 420,
  disabled = false,
  className = '',
  onImageUpload,
  onFileUpload,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastHtmlRef = useRef<string>('');
  const selectionRef = useRef<Range | null>(null);
  const [uploading, setUploading] = useState<UploadingType>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const syncFromDom = useCallback(() => {
    const html = normalizeEditorHtml(editorRef.current?.innerHTML || '');
    lastHtmlRef.current = html;
    onChange(html);
  }, [onChange]);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as Element)
      : range.commonAncestorContainer.parentElement;
    if (container && editor.contains(container)) {
      selectionRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    editor.focus();
    if (selectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(selectionRef.current);
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isFocused) return;
    const next = value || '';
    if (next !== lastHtmlRef.current && next !== editor.innerHTML) {
      editor.innerHTML = next;
      lastHtmlRef.current = next;
    }
  }, [value, isFocused]);

  const executeCommand = useCallback(
    (command: string, commandValue?: CommandValue) => {
      if (disabled) return;
      restoreSelection();
      document.execCommand(command, false, commandValue);
      saveSelection();
      syncFromDom();
    },
    [disabled, restoreSelection, saveSelection, syncFromDom]
  );

  const insertHtml = useCallback(
    (html: string) => {
      if (disabled) return;
      restoreSelection();
      document.execCommand('insertHTML', false, html);
      saveSelection();
      syncFromDom();
    },
    [disabled, restoreSelection, saveSelection, syncFromDom]
  );

  const setFormatBlock = (tag: 'P' | 'H1' | 'H2' | 'H3' | 'H4' | 'BLOCKQUOTE' | 'PRE') => {
    executeCommand('formatBlock', tag);
  };

  const setLink = () => {
    if (disabled) return;
    restoreSelection();
    const url = window.prompt('أدخل رابط الصفحة أو الملف');
    if (!url || !isSafeUrl(url)) return;
    executeCommand('createLink', url.trim());
    const selection = window.getSelection();
    const anchor = selection?.anchorNode?.parentElement?.closest('a');
    if (anchor) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      syncFromDom();
    }
  };

  const unlink = () => {
    executeCommand('unlink');
  };

  const clearFormatting = () => {
    executeCommand('removeFormat');
    executeCommand('formatBlock', 'P');
  };

  const handleImageFile = async (file: File) => {
    if (!onImageUpload) return;
    try {
      setUploadError(null);
      setUploading('image');
      restoreSelection();
      const result = await onImageUpload(file);
      if (!result?.url) throw new Error('لم يرجع الخادم رابط الصورة');
      const src = escapeHtml(result.url);
      const alt = escapeHtml(result.alt || result.name || file.name);
      insertHtml(
        `<figure class="editor-image" style="margin:1rem 0;text-align:center;"><img src="${src}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto;border-radius:1rem;display:inline-block;" /><figcaption style="font-size:.875rem;color:#64748b;margin-top:.35rem;">${alt}</figcaption></figure><p><br></p>`
      );
    } catch (error) {
      setUploadError(extractMessage(error));
    } finally {
      setUploading(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleGenericFile = async (file: File) => {
    if (!onFileUpload) return;
    try {
      setUploadError(null);
      setUploading('file');
      restoreSelection();
      const result = await onFileUpload(file);
      if (!result?.url) throw new Error('لم يرجع الخادم رابط الملف');
      const label = escapeHtml(result.name || file.name);
      const href = escapeHtml(result.url);
      insertHtml(`<p><a href="${href}" target="_blank" rel="noopener noreferrer">📎 ${label}</a></p>`);
    } catch (error) {
      setUploadError(extractMessage(error));
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/40 p-2" dir="rtl">
        <select
          className={selectBase}
          disabled={disabled}
          aria-label="نوع النص"
          onMouseDown={saveSelection}
          onChange={(event) => {
            const tag = event.target.value as 'P' | 'H1' | 'H2' | 'H3' | 'H4' | 'BLOCKQUOTE' | 'PRE';
            setFormatBlock(tag);
            event.target.value = '';
          }}
          defaultValue=""
        >
          <option value="" disabled>النمط</option>
          <option value="P">فقرة</option>
          <option value="H1">عنوان 1</option>
          <option value="H2">عنوان 2</option>
          <option value="H3">عنوان 3</option>
          <option value="H4">عنوان 4</option>
          <option value="BLOCKQUOTE">اقتباس</option>
          <option value="PRE">كود</option>
        </select>

        <select
          className={selectBase}
          disabled={disabled}
          aria-label="حجم الخط"
          onMouseDown={saveSelection}
          onChange={(event) => {
            if (event.target.value) executeCommand('fontSize', event.target.value);
            event.target.value = '';
          }}
          defaultValue=""
        >
          <option value="" disabled>الحجم</option>
          <option value="2">صغير</option>
          <option value="3">عادي</option>
          <option value="4">متوسط</option>
          <option value="5">كبير</option>
          <option value="6">كبير جدًا</option>
        </select>

        <ToolbarButton title="عريض" onClick={() => executeCommand('bold')} disabled={disabled}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="مائل" onClick={() => executeCommand('italic')} disabled={disabled}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="تحته خط" onClick={() => executeCommand('underline')} disabled={disabled}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="عنوان 1" onClick={() => setFormatBlock('H1')} disabled={disabled}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="عنوان 2" onClick={() => setFormatBlock('H2')} disabled={disabled}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="عنوان 3" onClick={() => setFormatBlock('H3')} disabled={disabled}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="نص عادي" onClick={() => setFormatBlock('P')} disabled={disabled}>
          <Type className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="قائمة نقطية" onClick={() => executeCommand('insertUnorderedList')} disabled={disabled}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="قائمة مرقمة" onClick={() => executeCommand('insertOrderedList')} disabled={disabled}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="اقتباس" onClick={() => setFormatBlock('BLOCKQUOTE')} disabled={disabled}>
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="كود" onClick={() => setFormatBlock('PRE')} disabled={disabled}>
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="محاذاة يمين" onClick={() => executeCommand('justifyRight')} disabled={disabled}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="توسيط" onClick={() => executeCommand('justifyCenter')} disabled={disabled}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="محاذاة يسار" onClick={() => executeCommand('justifyLeft')} disabled={disabled}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="ضبط كامل" onClick={() => executeCommand('justifyFull')} disabled={disabled}>
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="رابط" onClick={setLink} disabled={disabled}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="إزالة الرابط" onClick={unlink} disabled={disabled}>
          <Link2Off className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="رفع صورة داخل المحتوى"
          onClick={() => {
            saveSelection();
            imageInputRef.current?.click();
          }}
          disabled={disabled || !onImageUpload || uploading !== null}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="رفع ملف داخل المحتوى"
          onClick={() => {
            saveSelection();
            fileInputRef.current?.click();
          }}
          disabled={disabled || !onFileUpload || uploading !== null}
        >
          <FileUp className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="إدراج جدول" onClick={() => insertHtml(buildTableHtml())} disabled={disabled}>
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="خط فاصل" onClick={() => insertHtml('<hr style="margin:1.25rem 0;border:0;border-top:1px solid #e2e8f0;" /><p><br></p>')} disabled={disabled}>
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <label className={`${buttonBase} cursor-pointer`} title="لون النص" aria-label="لون النص">
          <Palette className="h-4 w-4" />
          <input
            type="color"
            className="h-0 w-0 opacity-0"
            aria-label="لون النص"
            disabled={disabled}
            onMouseDown={saveSelection}
            onChange={(event) => executeCommand('foreColor', event.target.value)}
          />
        </label>
        <label className={`${buttonBase} cursor-pointer`} title="لون الخلفية" aria-label="لون الخلفية">
          <Highlighter className="h-4 w-4" />
          <input
            type="color"
            className="h-0 w-0 opacity-0"
            aria-label="لون الخلفية"
            disabled={disabled}
            onMouseDown={saveSelection}
            onChange={(event) => executeCommand('hiliteColor', event.target.value)}
          />
        </label>

        <ToolbarButton title="إزالة التنسيق" onClick={clearFormatting} disabled={disabled}>
          <Trash2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="تراجع" onClick={() => executeCommand('undo')} disabled={disabled}>
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="إعادة" onClick={() => executeCommand('redo')} disabled={disabled}>
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="relative">
        {!value && !isFocused ? (
          <div className="pointer-events-none absolute right-4 top-4 text-sm text-muted-foreground">{placeholder}</div>
        ) : null}
        <div
          ref={editorRef}
          id={id}
          role="textbox"
          aria-multiline="true"
          aria-label={placeholder}
          contentEditable={!disabled}
          suppressContentEditableWarning
          dir="rtl"
          className="prose prose-slate max-w-none rounded-b-2xl bg-background px-4 py-4 text-right font-sans text-base leading-8 text-foreground outline-none focus:ring-0 prose-headings:text-right prose-p:leading-8 prose-img:mx-auto prose-img:rounded-xl disabled:opacity-60"
          style={{ minHeight }}
          onInput={syncFromDom}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          onBlur={() => {
            saveSelection();
            setIsFocused(false);
            syncFromDom();
          }}
          onFocus={() => {
            setIsFocused(true);
            saveSelection();
          }}
        />
      </div>

      <textarea id={`${id}-hidden`} name={name} value={value || ''} readOnly hidden aria-hidden="true" />

      <input
        ref={imageInputRef}
        id={`${id}-image-upload`}
        name={`${name}_image_upload`}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="رفع صورة داخل المحرر"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImageFile(file);
        }}
      />
      <input
        ref={fileInputRef}
        id={`${id}-file-upload`}
        name={`${name}_file_upload`}
        type="file"
        className="hidden"
        aria-label="رفع ملف داخل المحرر"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleGenericFile(file);
        }}
      />

      <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-3 py-2 text-xs text-muted-foreground">
        <span>
          {uploading === 'image'
            ? 'جاري رفع الصورة...'
            : uploading === 'file'
              ? 'جاري رفع الملف...'
              : 'محرر HTML آمن وخفيف بدون jQuery/Summernote وبدون اعتماديات إضافية'}
        </span>
        {uploadError ? <span className="text-red-600">{uploadError}</span> : null}
      </div>
    </div>
  );
}
