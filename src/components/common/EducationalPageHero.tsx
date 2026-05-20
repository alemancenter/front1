'use client';

import Link from 'next/link';
import Image from '@/components/common/AppImage';
import { BookOpen, FolderOpen, Grid2X2, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';

interface EducationalPageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  compact?: boolean;
  showStudentImage?: boolean;
}

export default function EducationalPageHero({
  title,
  subtitle = 'كل ما يحتاجه الطالب والمعلم في مكان واحد، بمصادر تعليمية منظمة وسهلة الوصول.',
  eyebrow = 'منصة الألمان التعليمية',
  primaryHref = '#content',
  primaryLabel = 'استكشف المحتوى',
  secondaryHref = '/search',
  secondaryLabel = 'تصفح أحدث الملفات',
  compact = false,
  showStudentImage = true,
}: EducationalPageHeroProps) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-white via-blue-50/70 to-slate-50 border-b border-blue-100/70 ${compact ? 'pt-24 pb-10 md:pt-28 md:pb-14' : 'pt-28 pb-16 md:pt-32 md:pb-20'}`} dir="rtl">
      <div className="absolute inset-0 pointer-events-none opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.10)_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className={`grid items-center gap-8 ${showStudentImage ? 'lg:grid-cols-[1fr_0.9fr]' : 'lg:grid-cols-1'}`}>
          <div className="order-2 text-center lg:order-1 lg:text-right">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm lg:mx-0">
              <BookOpen className="h-4 w-4" />
              {eyebrow}
            </div>
            <h1 className="mx-auto max-w-4xl text-3xl font-black leading-[1.25] tracking-tight text-slate-950 sm:text-4xl lg:mx-0 lg:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg lg:mx-0">
              {subtitle}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={primaryHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                <Grid2X2 className="h-4 w-4" />
                {primaryLabel}
              </Link>
              <Link href={secondaryHref} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700">
                <FolderOpen className="h-4 w-4" />
                {secondaryLabel}
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center lg:max-w-xl">
              <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur">
                <ShieldCheck className="mx-auto mb-2 h-5 w-5 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">موثوق</div>
                <div className="text-xs text-slate-500">مصادر دقيقة</div>
              </div>
              <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur">
                <RefreshCw className="mx-auto mb-2 h-5 w-5 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">محدث باستمرار</div>
                <div className="text-xs text-slate-500">جديد كل يوم</div>
              </div>
              <div className="rounded-2xl border border-white bg-white/75 p-3 shadow-sm backdrop-blur">
                <UserRound className="mx-auto mb-2 h-5 w-5 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">سهل الاستخدام</div>
                <div className="text-xs text-slate-500">تصميم عصري</div>
              </div>
            </div>
          </div>

          {showStudentImage && (
            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-[520px]">
                <div className="absolute inset-x-10 bottom-4 h-12 rounded-full bg-blue-900/10 blur-2xl" />
                <Image
                  src="/assets/img/home/hero-student.png"
                  alt="طالب يدرس على منصة الألمان التعليمية"
                  width={760}
                  height={520}
                  priority
                  eager
                  className="relative z-10 h-auto w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
