import Link from 'next/link';
import { Home, ChevronLeft, BookOpen, FileText } from 'lucide-react';
import { getSchoolClass } from '@/lib/academic-data';

async function getClassData(countryCode: string, classId: string) {
  return getSchoolClass(countryCode, classId);
}

export default async function CategoryBreadcrumb({
  countryCode,
  classId,
  subjectId,
  subjectName,
  categoryName,
  semesterName,
}: {
  countryCode: string;
  classId: string;
  subjectId: string;
  categoryId: string;
  subjectName: string;
  categoryName: string;
  semesterName: string;
}) {
  const schoolClass = await getClassData(countryCode, classId);

  const items = [
    { label: 'الرئيسية', href: '/', icon: Home },
    { label: 'الصفوف الدراسية', href: `/${countryCode}/lesson` },
    { label: schoolClass?.grade_name || classId, href: `/${countryCode}/lesson/${classId}` },
    { label: subjectName, href: `/${countryCode}/lesson/subjects/${subjectId}?id=${classId}`, icon: BookOpen },
  ];

  return (
    <nav aria-label="breadcrumb" className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm" dir="rtl">
      <ol className="flex items-center gap-2 overflow-x-auto whitespace-nowrap px-4 py-3 text-sm font-bold text-slate-500 sm:px-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <li key={`${item.href}-${item.label}`} className="flex items-center gap-2">
              {index > 0 && <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />}
              <Link href={item.href} className="inline-flex items-center gap-1.5 rounded-2xl px-2 py-1 transition hover:bg-blue-50 hover:text-blue-700">
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            </li>
          );
        })}
        <li className="flex items-center gap-2 text-slate-900" aria-current="page">
          <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-1.5 text-blue-700">
            <FileText className="h-4 w-4" />
            {categoryName} - {semesterName}
          </span>
        </li>
      </ol>
    </nav>
  );
}
