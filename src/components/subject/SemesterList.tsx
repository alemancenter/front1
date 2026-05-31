import Link from 'next/link';
import { BookMarked, ClipboardList, FileCheck2, FileText, FolderOpen, NotebookTabs } from 'lucide-react';
import { getSubjectSemesters, type AcademicSemester } from '@/lib/academic-data';

interface FileCategory {
  id: number | string;
  name: string;
  slug?: string;
  files_count?: number;
  articles_count?: number;
}

interface Semester extends AcademicSemester {
  file_categories?: FileCategory[];
}

export const STANDARD_CATEGORIES = [
  { id: 'plans', name: 'خطط الدراسة', slug: 'plans', icon: NotebookTabs, tone: 'blue' },
  { id: 'papers', name: 'أوراق عمل', slug: 'papers', icon: FileText, tone: 'emerald' },
  { id: 'tests', name: 'اختبارات', slug: 'tests', icon: FileCheck2, tone: 'rose' },
  { id: 'books', name: 'المقررات الدراسية', slug: 'books', icon: BookMarked, tone: 'amber' },
  { id: 'records', name: 'السجلات', slug: 'records', icon: ClipboardList, tone: 'cyan' },
];

const toneClass: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:bg-blue-100/70',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/70',
  rose: 'bg-rose-50 text-rose-700 border-rose-100 hover:border-rose-300 hover:bg-rose-100/70',
  amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300 hover:bg-amber-100/70',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:border-cyan-300 hover:bg-cyan-100/70',
};

async function getSemesters(countryCode: string, subjectId: string) {
  const data = await getSubjectSemesters(countryCode, subjectId);
  return data.semesters;
}

export default async function SemesterList({
  countryCode,
  subjectId,
  subjectName,
  initialSemesters,
}: {
  countryCode: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  initialSemesters?: Semester[];
}) {
  const semesters = initialSemesters ?? await getSemesters(countryCode, subjectId);

  if (!semesters.length) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
        <FolderOpen className="mx-auto mb-4 h-14 w-14 text-slate-300" />
        <p className="text-lg font-bold text-slate-800">لا توجد فصول دراسية متاحة حالياً</p>
        <p className="mt-1 text-sm text-slate-500">سيتم عرض الفصول والتصنيفات هنا عند إضافتها.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {semesters.map((semester) => (
        <section key={semester.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-blue-900/5">
          <div className="border-b border-slate-100 bg-gradient-to-l from-blue-50 via-white to-slate-50 p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-bold text-blue-700">
                  <BookMarked className="h-4 w-4" />
                  {subjectName}
                </div>
                <h2 className="mt-3 text-xl font-black text-slate-950 md:text-2xl">
                  {semester.semester_name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">اختر نوع المحتوى الذي تريد تصفحه لهذا الفصل.</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
                {STANDARD_CATEGORIES.length} تصنيفات متاحة
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5 md:p-6">
            {STANDARD_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/${countryCode}/lesson/subjects/${subjectId}/articles/${semester.id}/${cat.id}`}
                  className={`group rounded-2xl border p-4 text-center transition-all ${toneClass[cat.tone]}`}
                >
                  <Icon className="mx-auto mb-3 h-7 w-7 transition group-hover:scale-110" />
                  <div className="text-sm font-black">{cat.name}</div>
                  <div className="mt-1 text-xs opacity-75">عرض الملفات</div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
