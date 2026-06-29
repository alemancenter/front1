"use client";

import { useEffect, useState } from 'react';
import { Download, Loader2, ShieldCheck } from 'lucide-react';
import { teacherSubscriptionService, type TeacherPremiumDownloadLog } from '@/lib/api/services/teacher-subscription';
import TeacherAccessDenied, { getTeacherAccessErrorMessage } from '@/components/teacher/TeacherAccessDenied';

const categoryLabels: Record<string, string> = {
  exam: 'امتحان',
  answer_key: 'نموذج إجابة',
  plan: 'خطة',
  content_analysis: 'تحليل محتوى',
  worksheet: 'ورقة عمل',
  remedial_plan: 'خطة علاجية',
  question_bank: 'بنك أسئلة',
  final_review: 'مراجعة نهائية',
};

function formatDate(value?: string) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('ar', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatSize(value?: number) {
  if (!value) return '-';
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export default function TeacherDownloadsPage() {
  const [items, setItems] = useState<TeacherPremiumDownloadLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    teacherSubscriptionService.downloads()
      .then((res) => {
        if (!mounted) return;
        setItems(res?.data || []);
        setAccessError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setAccessError(getTeacherAccessErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (accessError) {
    return <TeacherAccessDenied message={accessError} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">سجل التحميلات</h1>
        <p className="mt-2 text-sm text-slate-500">كل تحميل Premium يتم تسجيله برمز تحميل خاص لحماية الملفات ومراجعة الاستخدام.</p>
      </div>

      {loading ? (
        <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
      ) : items.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm dark:bg-slate-900">لا توجد تحميلات Premium مسجلة بعد.</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
                <th className="py-3">الملف</th>
                <th>المادة</th>
                <th>التصنيف</th>
                <th>الحجم</th>
                <th>رمز التحميل</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                  <td className="py-4">
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      {item.file_title || item.original_filename || `ملف #${item.premium_file_id || item.id}`}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{item.original_filename || '-'}</div>
                  </td>
                  <td>{item.subject_name || '-'}</td>
                  <td>{categoryLabels[item.category] || item.category || '-'}</td>
                  <td>{formatSize(item.file_size)}</td>
                  <td>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {item.download_code || '-'}
                    </span>
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
