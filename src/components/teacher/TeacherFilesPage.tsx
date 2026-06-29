"use client";

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Search, BookmarkPlus, FileText, Download } from 'lucide-react';
import {
  teacherSubscriptionService,
  type TeacherPremiumFile,
  TEACHER_PREMIUM_CATEGORY_GROUPS,
  type TeacherPremiumCategoryKey,
} from '@/lib/api/services/teacher-subscription';
import TeacherAccessDenied, { getTeacherAccessErrorMessage } from '@/components/teacher/TeacherAccessDenied';

const categoryLabels: Record<TeacherPremiumCategoryKey | 'all', string> = {
  all: 'كل الملفات',
  exams: 'نماذج الامتحانات',
  exam: 'نماذج الامتحانات',
  answer_key: 'نماذج الإجابة',
  plans: 'الخطط',
  plan: 'الخطط',
  content_analysis: 'تحليل المحتوى',
  worksheets: 'أوراق العمل',
  worksheet: 'أوراق العمل',
  remedial_plan: 'خطط علاجية',
  question_bank: 'بنوك أسئلة',
  final_review: 'مراجعات نهائية',
};

const filterTabs: { key: TeacherPremiumCategoryKey | 'all'; label: string }[] = [
  { key: 'all', label: 'كل الملفات' },
  { key: 'exam', label: 'نماذج الامتحانات' },
  { key: 'answer_key', label: 'نماذج الإجابة' },
  { key: 'plan', label: 'الخطط' },
  { key: 'content_analysis', label: 'تحليل المحتوى' },
  { key: 'worksheet', label: 'أوراق العمل' },
  { key: 'remedial_plan', label: 'خطط علاجية' },
  { key: 'question_bank', label: 'بنوك أسئلة' },
  { key: 'final_review', label: 'مراجعات نهائية' },
];

type TeacherFilesPageProps = {
  category?: TeacherPremiumCategoryKey | 'all';
  title?: string;
};

export default function TeacherFilesPage({ category = 'all', title = 'ملفات المعلم' }: TeacherFilesPageProps) {
  const [items, setItems] = useState<TeacherPremiumFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [activeCategory, setActiveCategory] = useState<TeacherPremiumCategoryKey | 'all'>(category);
  const [accessError, setAccessError] = useState<string | null>(null);

  const apiCategory = useMemo(() => {
    if (activeCategory === 'all') return '';
    return TEACHER_PREMIUM_CATEGORY_GROUPS[activeCategory as TeacherPremiumCategoryKey] || activeCategory;
  }, [activeCategory]);

  async function load() {
    setLoading(true);
    try {
      const res = await teacherSubscriptionService.files({ category: apiCategory, q, country: 'jo' });
      setItems(res?.data || []);
      setAccessError(null);
    } catch (error: any) {
      const message = getTeacherAccessErrorMessage(error);
      if (error?.status === 403 || error?.isForbidden || error?.code === 'TEACHER_SUBSCRIPTION_INACTIVE') {
        setAccessError(message);
      } else {
        toast.error(error?.message || 'تعذر تحميل ملفات المعلم');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setActiveCategory(category);
  }, [category]);

  useEffect(() => {
    load();
  }, [apiCategory]);

  async function save(file: TeacherPremiumFile) {
    try {
      await teacherSubscriptionService.saveLibraryItem({
        item_type: 'teacher_premium_file',
        item_id: file.id,
        title: file.file_name,
        source_type: 'teacher_premium_vault',
        category: file.premium_category,
        country: 'jo',
      });
      toast.success('تم الحفظ في مكتبتي');
    } catch (error: any) {
      toast.error(error?.message || 'تعذر حفظ الملف');
    }
  }

  async function download(file: TeacherPremiumFile) {
    setDownloadingId(file.id);
    try {
      await teacherSubscriptionService.downloadPremiumFile(file.id, 'jo');
      toast.success('بدأ تحميل الملف');
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحميل الملف');
    } finally {
      setDownloadingId(null);
    }
  }

  if (accessError) {
    return <TeacherAccessDenied message={accessError} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">تظهر هنا ملفات الخزنة الخاصة بمادة اشتراكك فقط، ولا يمكن تحميلها كرابط عام.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
              activeCategory === tab.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 rounded-3xl bg-white p-3 shadow-sm dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') load();
            }}
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 pr-12 outline-none dark:border-slate-800 dark:bg-slate-950"
            placeholder="بحث ذكي: عنوان الملف، المادة، الصف، الفصل، التصنيف..."
          />
        </div>
        <button onClick={load} className="rounded-2xl bg-emerald-600 px-6 font-black text-white">بحث</button>
      </div>

      {loading ? (
        <div className="flex min-h-[250px] items-center justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm dark:bg-slate-900">
          لا توجد ملفات Premium لهذه المادة أو التصنيف بعد.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((file) => (
            <div key={file.id} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <FileText className="mb-3 h-8 w-8 text-emerald-600" />
              <h2 className="line-clamp-2 min-h-[3rem] font-black text-slate-900 dark:text-white">{file.file_name}</h2>
              <div className="mt-3 space-y-1 text-xs font-semibold text-slate-500">
                <div>المادة: {file.subject_name || file.premium_subject || '-'}</div>
                <div>الفصل: {file.semester_name || '-'}</div>
                <div>التصنيف: {categoryLabels[file.premium_category as keyof typeof categoryLabels] || file.premium_category || '-'}</div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => download(file)}
                  disabled={downloadingId === file.id}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-center text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {downloadingId === file.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  تحميل
                </button>
                <button
                  type="button"
                  onClick={() => save(file)}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title="حفظ في مكتبتي"
                >
                  <BookmarkPlus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
