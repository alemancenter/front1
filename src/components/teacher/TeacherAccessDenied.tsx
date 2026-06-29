"use client";

import Link from 'next/link';
import { AlertTriangle, ArrowRight, CreditCard } from 'lucide-react';

export default function TeacherAccessDenied({
  message = 'اشتراك المعلم غير نشط أو تم إيقافه من الإدارة.',
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4" dir="rtl">
      <div className="max-w-2xl rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black text-amber-900 dark:text-amber-100">
          لا يمكنك الوصول إلى منطقة المعلم
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-amber-800 dark:text-amber-200">
          {message}
        </p>

        <p className="mx-auto mt-2 max-w-xl text-xs leading-6 text-amber-700 dark:text-amber-300">
          إذا كنت تعتقد أن هذا خطأ، سجّل خروجًا ثم ادخل مرة أخرى. إذا بقيت المشكلة، تواصل مع الإدارة لمراجعة حالة اشتراكك.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          >
            <ArrowRight className="h-4 w-4" />
            الرجوع للداشبورد
          </Link>

          <Link
            href="/teacher/subscribe"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
          >
            <CreditCard className="h-4 w-4" />
            طلب اشتراك المعلم
          </Link>
        </div>
      </div>
    </div>
  );
}

export function getTeacherAccessErrorMessage(error: any): string {
  if (error?.status === 403 || error?.isForbidden || error?.code === 'TEACHER_SUBSCRIPTION_INACTIVE') {
    return error?.message || 'اشتراك المعلم غير نشط أو تم إيقافه من الإدارة.';
  }

  return error?.message || 'تعذر التحقق من حالة اشتراك المعلم.';
}
