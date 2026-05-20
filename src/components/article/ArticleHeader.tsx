import Link from 'next/link';
import { BookOpen, Calendar, ChevronLeft, Eye, FileText, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  category: string;
  date: string;
  views: number;
  author?: string;
  subject?: string;
  className?: string;
  countryCode: string;
}

export default function ArticleHeader({
  title,
  category,
  date,
  views,
  author,
  subject,
  className,
}: Props) {
  return (
    <header
      className={cn(
        'relative overflow-hidden border-b border-blue-100/70 bg-gradient-to-b from-blue-50/80 via-white to-white pt-24',
        className
      )}
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-blue-200 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 py-7 sm:py-9 lg:py-10">
        <nav className="mb-5 flex max-w-full flex-wrap items-center gap-2 overflow-hidden text-xs font-bold text-slate-500 sm:text-sm">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-slate-700 shadow-sm transition hover:text-blue-700"
          >
            <Home size={14} />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft size={14} className="text-slate-300" />
          {subject ? (
            <>
              <span className="max-w-full truncate rounded-full border border-blue-100 bg-white px-3 py-1.5 text-slate-700 shadow-sm">
                {subject}
              </span>
              <ChevronLeft size={14} className="text-slate-300" />
            </>
          ) : null}
          <span className="max-w-full truncate rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-blue-700">
            {category}
          </span>
        </nav>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
          <FileText className="h-4 w-4" />
          محتوى تعليمي
        </div>

        <h1 className="mt-5 max-w-5xl break-words text-2xl font-black leading-[1.45] text-slate-950 [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        <div className="mt-6 grid min-w-0 gap-2 text-sm text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-2 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-700">
              <User size={16} />
            </div>
            <span className="min-w-0 truncate font-bold text-slate-900">{author || 'المسؤول'}</span>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-2 shadow-sm">
            <Calendar size={16} className="text-blue-600" />
            <span suppressHydrationWarning>
              {new Date(date).toLocaleDateString('ar-JO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-blue-100/70 bg-white px-4 py-2 shadow-sm">
            <Eye size={16} className="text-blue-600" />
            <span>{views} مشاهدة</span>
          </div>

          {subject ? (
            <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-blue-700 shadow-sm">
              <BookOpen size={16} />
              <span className="min-w-0 truncate font-bold">{subject}</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
