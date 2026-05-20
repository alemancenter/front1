'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, GraduationCap, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from '@/lib/motion-lite';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS, COUNTRIES } from '@/lib/api/config';

interface SchoolClass {
  id: number;
  grade_name: string;
  grade_level: number;
  slug?: string;
  subjects_count?: number;
  description?: string;
}

const accents = [
  'border-blue-100 bg-blue-50/80 text-blue-700',
  'border-emerald-100 bg-emerald-50/80 text-emerald-700',
  'border-amber-100 bg-amber-50/80 text-amber-700',
  'border-rose-100 bg-rose-50/80 text-rose-700',
  'border-violet-100 bg-violet-50/80 text-violet-700',
  'border-cyan-100 bg-cyan-50/80 text-cyan-700',
];

function getClassNumber(label: string, fallback: number) {
  const match = label.match(/\d+/);
  if (match) return match[0];

  const words: Record<string, string> = {
    الأول: '1',
    الثاني: '2',
    الثالث: '3',
    الرابع: '4',
    الخامس: '5',
    السادس: '6',
    السابع: '7',
    الثامن: '8',
    التاسع: '9',
    العاشر: '10',
    الحادي: '11',
    الثاني_عشر: '12',
  };

  const found = Object.entries(words).find(([word]) => label.includes(word.replace('_', ' ')));
  return found?.[1] || String(fallback + 1);
}

export default function ClassesPage() {
  const [selectedDatabase, setSelectedDatabase] = useState('jo');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedCountry = COUNTRIES.find((country) => country.code === selectedDatabase) || COUNTRIES[0];

  const loadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<{ data: SchoolClass[] } | SchoolClass[]>(
        API_ENDPOINTS.FRONTEND.CLASSES,
        { database: selectedDatabase }
      );

      const data = response.data;
      if (Array.isArray(data)) setClasses(data);
      else if (data && 'data' in data && Array.isArray(data.data)) setClasses(data.data);
      else setClasses([]);
    } catch (err: any) {
      setError(err?.message || 'فشل في تحميل الصفوف الدراسية');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDatabase]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const filteredClasses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((cls) => cls.grade_name.toLowerCase().includes(query));
  }, [classes, searchQuery]);

  const totalSubjects = classes.reduce((sum, cls) => sum + Number(cls.subjects_count || 0), 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fbff] pb-16 pt-24" dir="rtl">
      <section className="border-b border-blue-100 bg-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl text-center lg:text-right">
              <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">
                <GraduationCap className="h-4 w-4" />
                الأقسام التعليمية
              </div>
              <h1 className="mx-auto max-w-[320px] text-3xl font-black leading-tight text-slate-950 md:max-w-none md:text-4xl lg:mx-0">اختر صفك الدراسي</h1>
              <p className="mx-auto mt-3 max-w-[320px] text-sm font-semibold leading-7 text-slate-500 md:max-w-2xl md:text-base lg:mx-0">
                صفحة مخصصة للوصول السريع إلى المواد والملفات التعليمية حسب الصف والدولة، بتجربة أوضح وأسهل على الجوال.
              </p>
            </div>

            <div className="grid w-full gap-2 text-center sm:grid-cols-3 lg:min-w-[360px] lg:max-w-[420px]">
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 shadow-sm">
                <div className="text-xl font-black text-blue-900">{classes.length}</div>
                <div className="text-xs font-bold text-slate-500">صف</div>
              </div>
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 shadow-sm">
                <div className="text-xl font-black text-blue-900">{totalSubjects || '-'}</div>
                <div className="text-xs font-bold text-slate-500">مادة</div>
              </div>
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 shadow-sm">
                <div className="truncate text-lg font-black text-blue-900 sm:text-xl">{selectedCountry.name}</div>
                <div className="text-xs font-bold text-slate-500">الدولة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-5">
        <div className="rounded-[1.4rem] border border-blue-100 bg-white p-4 shadow-lg shadow-blue-100/40">
          <div className="grid gap-3 md:grid-cols-[1fr_230px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input name="field-app-main-classes-page-132-1"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث عن صف دراسي..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-14 text-right text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="relative block">
              <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <select name="field-app-main-classes-page-143-2"
                value={selectedDatabase}
                onChange={(event) => setSelectedDatabase(event.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-14 text-right text-sm font-black text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                aria-label="اختر الدولة"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
              <span className="text-sm font-bold">جاري تحميل الصفوف...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <p className="mb-4 text-sm font-bold text-red-600">{error}</p>
            <button onClick={loadClasses} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white">
              إعادة المحاولة
            </button>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <GraduationCap className="mx-auto mb-4 h-14 w-14 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">{searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد صفوف دراسية'}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {filteredClasses.map((cls, index) => {
              const accent = accents[index % accents.length];
              const classNumber = getClassNumber(cls.grade_name, index);
              return (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}>
                  <Link
                    href={`/${selectedDatabase}/lesson/${cls.id}`}
                    className={`group flex min-h-[136px] flex-col justify-between rounded-3xl border p-4 shadow-sm transition active:scale-[0.98] hover:-translate-y-1 hover:shadow-lg ${accent}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-lg font-black shadow-sm">
                        {classNumber}
                      </span>
                      <ChevronLeft className="mt-1 h-5 w-5 opacity-60 transition group-hover:-translate-x-1 group-hover:opacity-100" />
                    </div>

                    <div>
                      <h2 className="line-clamp-2 min-h-[44px] text-base font-black leading-6 text-slate-950">{cls.grade_name}</h2>
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <BookOpen className="h-4 w-4" />
                        <span>{cls.subjects_count || 0} مادة دراسية</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </main>
  );
}
