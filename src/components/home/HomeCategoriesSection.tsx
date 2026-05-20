'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesColumn,
  FlaskConical,
  FolderOpen,
  Grid3X3,
  Languages,
  LibraryBig,
  Landmark,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/types';
import type { HomeCountry } from './HomeTypes';

type HomeCategoriesSectionProps = {
  country: HomeCountry;
  categories?: Category[];
};

const fallbackCategories = [
  { name: 'الرياضيات', slug: 'math', count: '12,456 ملف', icon: Grid3X3, color: 'text-blue-600 bg-blue-50' },
  { name: 'المنهاج الأردني', slug: 'curriculum', count: 'كافة الصفوف', icon: LibraryBig, color: 'text-indigo-600 bg-indigo-50' },
  { name: 'تقارير الأداء', slug: 'reports', count: '35 تقرير', icon: ChartNoAxesColumn, color: 'text-violet-600 bg-violet-50' },
  { name: 'دورات المعلمين', slug: 'teachers', count: '120 دورة', icon: BriefcaseBusiness, color: 'text-blue-600 bg-blue-50' },
  { name: 'التربية الإسلامية', slug: 'islamic', count: '5,678 ملف', icon: Landmark, color: 'text-emerald-600 bg-emerald-50' },
  { name: 'اللغة العربية', slug: 'arabic', count: '11,034 ملف', icon: Languages, color: 'text-green-600 bg-green-50' },
  { name: 'العلوم', slug: 'science', count: '9,215 ملف', icon: FlaskConical, color: 'text-cyan-600 bg-cyan-50' },
  { name: 'اللغة الإنجليزية', slug: 'english', count: '8,732 ملف', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
];

const icons: LucideIcon[] = [Grid3X3, LibraryBig, ChartNoAxesColumn, BriefcaseBusiness, Landmark, Languages, FlaskConical, BookOpen, Newspaper, FolderOpen];
const colors = ['text-blue-600 bg-blue-50', 'text-violet-600 bg-violet-50', 'text-indigo-600 bg-indigo-50', 'text-emerald-600 bg-emerald-50', 'text-cyan-600 bg-cyan-50'];

export default function HomeCategoriesSection({ country, categories }: HomeCategoriesSectionProps) {
  const parentCategories = useMemo(() => categories?.filter((category) => !category.parent_id && category.is_active !== false).slice(0, 8) || [], [categories]);
  const items = parentCategories.length
    ? parentCategories.map((category, index) => ({
        name: category.name,
        slug: category.slug || String(category.id),
        count: category.news_count ? `${category.news_count} ملف` : 'تصفح المحتوى',
        icon: icons[index % icons.length],
        color: colors[index % colors.length],
      }))
    : fallbackCategories;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7" aria-labelledby="categories-heading">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-700">
            <FolderOpen className="h-6 w-6" />
            <h2 id="categories-heading" className="text-2xl font-black text-slate-950">تصفح الأقسام التعليمية حسب المادة والمحتوى</h2>
          </div>
          <p className="text-sm font-medium text-slate-500">اختر القسم الذي يناسب احتياجك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.slug}
              href={`/${country.code}/posts/category/${item.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 transition group-hover:text-blue-700">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.count}</p>
                </div>
              </div>
              <span className="text-blue-600 opacity-0 transition group-hover:opacity-100">←</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link href={`/${country.code}/posts`} className="inline-flex items-center justify-center rounded-xl bg-blue-50 px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100">
          استكشف جميع الأقسام ←
        </Link>
      </div>
    </section>
  );
}
