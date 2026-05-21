'use client';

import Link from 'next/link';
import { FolderOpen, Search } from 'lucide-react';

interface CategoryHeaderProps {
  title: string;
  subtitle?: string;
}

export default function CategoryHeader({ title, subtitle }: CategoryHeaderProps) {
  return (
    <section className="border-b border-slate-200 bg-white pt-28" dir="rtl">
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-black text-blue-700">
              <FolderOpen className="h-4 w-4" />
              ملفات القسم
            </div>
            <h1 className="text-2xl font-black leading-9 text-slate-950 md:text-3xl">{title}</h1>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <Link href="/search" prefetch={false} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-5 text-sm font-black text-blue-700 transition hover:bg-blue-100">
            <Search className="h-4 w-4" />
            بحث متقدم
          </Link>
        </div>
      </div>
    </section>
  );
}
