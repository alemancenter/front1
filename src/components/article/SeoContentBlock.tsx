import React from 'react';
import { Info, FileText, BookOpen, Download } from 'lucide-react';

/**
 * SeoContentBlock — REWRITTEN (AdSense-safe)
 *
 * This block renders ONLY a factual summary built strictly from data that
 * genuinely differs per file (subject, grade, semester, file type, size,
 * count). If there is not enough real data to say something specific, the
 * block renders NOTHING — an empty block is better than a duplicated one.
 * The real unique value must come from the `content` field (the actual
 * description of the file), not from this component.
 */

export interface ArticleFileMeta {
  name?: string;
  file_name?: string;
  extension?: string;
  type?: string;
  size?: number; // bytes
}

interface Props {
  title: string;
  subject?: string;
  category?: string;
  sectionName?: string;
  gradeName?: string;
  semesterName?: string;
  files?: ArticleFileMeta[];
}

function formatSize(bytes?: number): string | null {
  if (!bytes || bytes <= 0) return null;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} ميغابايت`;
  return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
}

function fileTypeLabel(file?: ArticleFileMeta): string | null {
  if (!file) return null;
  const raw = (file.extension || file.type || file.name || file.file_name || '')
    .toString()
    .toLowerCase();
  if (raw.includes('pdf')) return 'PDF';
  if (raw.includes('doc')) return 'Word';
  if (raw.includes('ppt')) return 'PowerPoint';
  if (raw.includes('xls')) return 'Excel';
  return null;
}

/**
 * Build a factual one-line description from real fields only.
 * Every clause is conditional — nothing is invented.
 */
function buildFactualSummary(p: Props): string | null {
  const parts: string[] = [];

  const subjectPart = p.subject?.trim();
  const gradePart = p.gradeName?.trim();
  const semesterPart = p.semesterName?.trim();

  if (subjectPart) {
    let s = `ملف في مادة ${subjectPart}`;
    if (gradePart) s += ` — ${gradePart}`;
    if (semesterPart) s += `، ${semesterPart}`;
    parts.push(s);
  } else if (p.sectionName?.trim()) {
    parts.push(`ملف ضمن قسم ${p.sectionName.trim()}`);
  }

  const files = Array.isArray(p.files) ? p.files : [];
  if (files.length > 0) {
    const first = files[0];
    const typeLabel = fileTypeLabel(first);
    const sizeLabel = formatSize(first.size);
    const fileBits: string[] = [];
    fileBits.push(
      files.length === 1
        ? 'يحتوي على ملف واحد للتحميل'
        : `يحتوي على ${files.length} ملفات للتحميل`,
    );
    if (typeLabel) fileBits.push(`بصيغة ${typeLabel}`);
    if (sizeLabel && files.length === 1) fileBits.push(`(${sizeLabel})`);
    parts.push(fileBits.join(' '));
  }

  if (parts.length === 0) return null;
  return parts.join('، ') + '.';
}

export default function SeoContentBlock(props: Props) {
  const summary = buildFactualSummary(props);

  // No real distinguishing data — render nothing rather than duplicate filler.
  if (!summary) return null;

  const files = Array.isArray(props.files) ? props.files : [];
  const fileType = fileTypeLabel(files[0]);
  const fileSize = formatSize(files[0]?.size);

  return (
    <section
      className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/40 p-6 md:p-8"
      aria-label="ملخص الملف"
    >
      <div className="mb-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">ملخص هذا الملف</h2>
      </div>

      <p className="text-sm leading-relaxed text-gray-700">{summary}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {props.subject?.trim() && (
          <div className="rounded-xl border border-blue-100 bg-white p-3">
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <BookOpen className="h-3.5 w-3.5 text-primary" /> المادة
            </dt>
            <dd className="text-sm font-bold text-gray-900">{props.subject.trim()}</dd>
          </div>
        )}
        {props.gradeName?.trim() && (
          <div className="rounded-xl border border-blue-100 bg-white p-3">
            <dt className="mb-1 text-xs font-bold text-gray-500">الصف</dt>
            <dd className="text-sm font-bold text-gray-900">{props.gradeName.trim()}</dd>
          </div>
        )}
        {props.semesterName?.trim() && (
          <div className="rounded-xl border border-blue-100 bg-white p-3">
            <dt className="mb-1 text-xs font-bold text-gray-500">الفصل الدراسي</dt>
            <dd className="text-sm font-bold text-gray-900">{props.semesterName.trim()}</dd>
          </div>
        )}
        {fileType && (
          <div className="rounded-xl border border-blue-100 bg-white p-3">
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <FileText className="h-3.5 w-3.5 text-primary" /> صيغة الملف
            </dt>
            <dd className="text-sm font-bold text-gray-900">{fileType}</dd>
          </div>
        )}
        {fileSize && files.length === 1 && (
          <div className="rounded-xl border border-blue-100 bg-white p-3">
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <Download className="h-3.5 w-3.5 text-primary" /> الحجم
            </dt>
            <dd className="text-sm font-bold text-gray-900">{fileSize}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
