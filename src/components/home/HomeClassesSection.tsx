'use client';

import Link from 'next/link';
import { ChevronLeft, GraduationCap, Sparkles } from 'lucide-react';
import type { SchoolClass } from '@/types';
import type { HomeAdSettings, HomeCountry } from './HomeTypes';
import HomeAds from './HomeAds';

const classAccents = [
  'border-rose-100 bg-rose-50/70 text-rose-700',
  'border-amber-100 bg-amber-50/70 text-amber-700',
  'border-sky-100 bg-sky-50/70 text-sky-700',
  'border-violet-100 bg-violet-50/70 text-violet-700',
  'border-emerald-100 bg-emerald-50/70 text-emerald-700',
  'border-blue-100 bg-blue-50/70 text-blue-700',
  'border-orange-100 bg-orange-50/70 text-orange-700',
  'border-purple-100 bg-purple-50/70 text-purple-700',
  'border-cyan-100 bg-cyan-50/70 text-cyan-700',
];

type HomeClassesSectionProps = {
  country: HomeCountry;
  classes: SchoolClass[];
  mounted: boolean;
  adSettings?: HomeAdSettings;
};

function classNumber(label: string, fallback: number) {
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
  };

  const found = Object.entries(words).find(([word]) => label.includes(word));
  return found?.[1] || String(fallback + 1);
}

export default function HomeClassesSection({ country, classes, mounted, adSettings }: HomeClassesSectionProps) {
  return (
    <section className="pt-8 lg:pt-12" aria-labelledby="classes-heading">
      <div className="rounded-[1.6rem] border border-blue-100 bg-white/95 p-4 shadow-lg shadow-blue-100/40 sm:p-5 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mb-4 flex items-end justify-between gap-4 lg:mb-5">
          <div className="min-w-0">
            <div className="flex items-start gap-3 text-blue-700">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 lg:h-auto lg:w-auto lg:bg-transparent">
                <GraduationCap className="h-5 w-5 lg:h-6 lg:w-6" />
              </span>
              <div className="min-w-0">
               <h2 id="classes-heading" className="text-xl font-black leading-7 text-slate-950 sm:text-2xl">تصفح الملفات التعليمية حسب الصف الدراسي</h2>
                <p className="mt-1 text-xs font-bold leading-6 text-slate-500 sm:text-sm">
                  ابدأ من صفك للوصول إلى المواد والملفات المناسبة بسرعة
                </p>
              </div>
            </div>
          </div>

          <Link href="/classes" className="hidden shrink-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50 sm:flex">
            عرض كل الصفوف
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>

        {classes.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-8">
              {classes.slice(0, 16).map((schoolClass, index) => {
                const style = classAccents[index % classAccents.length];
                const number = classNumber(schoolClass.grade_name, index);
                return (
                  <Link
                    key={schoolClass.id}
                    href={`/${country.code}/lesson/${schoolClass.id}`}
                    className={`group flex min-h-[92px] flex-col items-center justify-center rounded-2xl border px-3 py-4 text-center shadow-sm transition active:scale-[0.98] lg:min-h-[118px] lg:hover:-translate-y-1 lg:hover:shadow-lg ${style}`}
                  >
                    <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-base font-black shadow-sm lg:h-11 lg:w-11 lg:text-lg">
                      {number}
                    </span>
                    <span className="line-clamp-2 min-h-[38px] text-[13px] font-black leading-5 sm:text-sm">
                      {schoolClass.grade_name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <Link href="/classes" className="mt-4 flex h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-blue-700 transition active:scale-[0.99] sm:hidden">
              <Sparkles className="h-4 w-4" />
              عرض كل الصفوف
            </Link>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">لا توجد صفوف متاحة حالياً</div>
        )}
      </div>

      <HomeAds mounted={mounted} adSettings={adSettings} slot="primary" className="mt-8" />
    </section>
  );
}
