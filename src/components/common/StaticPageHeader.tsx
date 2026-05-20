'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface StaticPageHeaderProps {
  title: string;
  description?: string;
  current: string;
  eyebrow?: string;
}

export default function StaticPageHeader({ title, description, current, eyebrow }: StaticPageHeaderProps) {
  return (
    <header className="border-b border-blue-100/70 bg-gradient-to-b from-blue-50/80 via-white to-white pt-24">
      <div className="container mx-auto px-4 py-7 sm:py-9 lg:py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm sm:text-sm"
        >
          <Link href="/" className="flex items-center gap-1.5 text-slate-600 transition hover:text-blue-700">
            <Home className="h-4 w-4" />
            الرئيسية
          </Link>
          <ChevronLeft className="h-4 w-4 text-slate-300" />
          <span className="text-blue-800">{current}</span>
        </nav>

        <div className="max-w-3xl">
          {eyebrow ? <p className="mb-2 text-xs font-black text-blue-700">{eyebrow}</p> : null}
          <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-slate-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
