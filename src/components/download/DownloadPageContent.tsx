import Link from 'next/link';
import { FileText, ChevronLeft, Home, AlertCircle } from 'lucide-react';

interface DownloadPageContentProps {
  fileName: string;
  fileSize: number;
  itemTitle: string;
  itemType: 'article' | 'post';
  subjectName?: string;
  backLink: string;
}

function formatFileSize(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
}

export default function DownloadPageContent({
  fileName,
  fileSize,
  itemTitle,
  itemType,
  subjectName,
  backLink,
}: DownloadPageContentProps) {
  return (
    <div className="mt-8 space-y-5">
      {/* File metadata — real data only */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5">
            <FileText size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">معلومات الملف</h2>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="mb-1 text-xs font-bold text-gray-500">اسم الملف</dt>
            <dd className="bidi-plaintext break-words font-semibold text-gray-900" dir="auto">
              {fileName}
            </dd>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="mb-1 text-xs font-bold text-gray-500">حجم الملف</dt>
            <dd className="font-semibold text-gray-900">{formatFileSize(fileSize)}</dd>
          </div>

          {subjectName && (
            <div className="rounded-xl bg-gray-50 p-4">
              <dt className="mb-1 text-xs font-bold text-gray-500">المادة الدراسية</dt>
              <dd className="font-semibold text-gray-900">{subjectName}</dd>
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-4">
            <dt className="mb-1 text-xs font-bold text-gray-500">المصدر</dt>
            <dd className="font-semibold text-gray-900">
              <Link href={backLink} className="text-blue-600 hover:underline">
                {itemTitle}
              </Link>
            </dd>
          </div>
        </dl>
      </div>

      {/* Functional tip — specific to the action the user is about to take */}
      <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          إذا لم يبدأ التحميل تلقائياً، اضغط زر التحميل أعلاه. في حال استمرار المشكلة يمكنك
          التواصل معنا عبر صفحة{' '}
          <Link href="/contact" className="font-bold underline">
            الاتصال
          </Link>
          .
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backLink}
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-blue-600"
        >
          <ChevronLeft size={16} />
          العودة إلى {itemType === 'post' ? 'المنشور' : 'المقال'}
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-700"
        >
          <Home size={16} />
          الصفحة الرئيسية
        </Link>
      </div>

      <p className="px-4 text-center text-xs text-gray-500">
        جميع الحقوق محفوظة لأصحابها. يُتاح هذا المحتوى للأغراض التعليمية فقط. للإبلاغ
        عن انتهاك لحقوق الملكية{' '}
        <Link href="/copyright" className="underline">
          تواصل معنا
        </Link>
        .
      </p>
    </div>
  );
}
