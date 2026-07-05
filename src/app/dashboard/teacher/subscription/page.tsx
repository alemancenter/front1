"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, ShieldCheck, Clock, MonitorSmartphone, GraduationCap, AlertTriangle, RefreshCw } from 'lucide-react';
import { teacherSubscriptionService, type TeacherSummary } from '@/lib/api/services/teacher-subscription';

// A subscription expiring within this many days shows the renewal banner.
const RENEWAL_WINDOW_DAYS = 14;

export default function TeacherSubscriptionDashboardPage() {
  const [summary, setSummary] = useState<TeacherSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setSummary(await teacherSubscriptionService.me());
    } catch {
      toast.error('تعذر تحميل بيانات الاشتراك');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeDevice(id: number) {
    try {
      await teacherSubscriptionService.deactivateDevice(id);
      toast.success('تم تعطيل الجهاز');
      load();
    } catch {
      toast.error('تعذر تعطيل الجهاز');
    }
  }

  const daysLeft = useMemo(() => {
    const endsAt = summary?.subscription?.ends_at;
    if (!endsAt) return null;
    return Math.ceil((new Date(endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [summary?.subscription?.ends_at]);

  const canRenewNow = summary?.has_active && daysLeft !== null && daysLeft <= RENEWAL_WINDOW_DAYS;
  const subjects = (summary?.subjects || []).filter(Boolean);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">اشتراك المعلم للفصل الدراسي</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">إدارة حالة الاشتراك، المواد، الاستخدام، والأجهزة المرتبطة.</p>
      </div>

      {!summary?.has_active ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3 font-black text-amber-800">
            <Clock className="h-6 w-6" />
            لا يوجد اشتراك نشط حاليًا
          </div>
          <p className="mt-2 text-sm text-amber-700">يمكنك طلب اشتراك الفصل الدراسي بقيمة 25 دينار أردني (حتى 3 مواد).</p>
          <Link href="/teacher/subscribe" className="mt-4 inline-block rounded-2xl bg-amber-600 px-5 py-2 text-sm font-bold text-white">
            طلب الاشتراك
          </Link>
        </div>
      ) : (
        <>
          {canRenewNow && (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3 font-black text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                اشتراكك سينتهي خلال {daysLeft} يوم
              </div>
              <p className="mt-2 text-sm text-amber-700">جدّد الآن للحفاظ على وصولك دون انقطاع لملفات Premium وأدوات AI.</p>
              <Link href="/teacher/subscribe" className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700">
                <RefreshCw className="h-4 w-4" />
                تجديد الاشتراك الآن
              </Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <ShieldCheck className="mb-3 h-7 w-7 text-emerald-600" />
              <div className="text-sm text-slate-500">الحالة</div>
              <div className="mt-1 text-xl font-black text-emerald-700">نشط</div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="text-sm text-slate-500">تحميلات Premium</div>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {summary?.usage?.downloads || 0} / {summary?.subscription?.download_limit || summary?.plan?.download_limit}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="text-sm text-slate-500">عمليات AI</div>
              <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                {summary?.usage?.ai_generations || 0} / {summary?.subscription?.ai_generation_limit || summary?.plan?.ai_generation_limit}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
          <GraduationCap className="h-5 w-5 text-emerald-600" />
          موادي الدراسية
        </h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-slate-500">لم تُسجَّل أي مادة بعد.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span key={subject} className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100">
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">مزايا الباقة</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(summary?.plan_design?.features || []).map((feature) => (
            <div key={feature} className="rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
          <MonitorSmartphone className="h-5 w-5 text-emerald-600" />
          الأجهزة المرتبطة
        </h2>
        <div className="space-y-3">
          {(summary?.devices || []).length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد أجهزة مسجلة بعد.</p>
          ) : (
            summary?.devices?.map((device) => (
              <div key={device.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{device.label || 'جهاز بدون اسم'}</div>
                  <div className="mt-1 max-w-xl truncate text-xs text-slate-500">{device.user_agent}</div>
                </div>
                {device.is_active && (
                  <button onClick={() => removeDevice(device.id)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-700">
                    تعطيل
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">طلبات الاشتراك</h2>
        <div className="space-y-3">
          {(summary?.orders || []).length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد طلبات اشتراك.</p>
          ) : (
            summary?.orders?.map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
                <div className="font-bold">طلب رقم #{order.id}</div>
                <div className="mt-1 text-slate-500">الحالة: {order.status}</div>
                <div className="text-slate-500">المبلغ: {order.amount_jod} {order.currency}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


export function TeacherSubscriptionGuidance() {
  return (
    <div className="mt-6 rounded-3xl bg-emerald-50 p-6 text-sm leading-8 text-emerald-950">
      <h2 className="text-lg font-black">خطوات الاشتراك</h2>
      <ol className="mt-3 list-decimal space-y-2 pr-5">
        <li>اختر حتى 3 مواد دراسية تريد الاشتراك بها.</li>
        <li>نفّذ التحويل اليدوي حسب تعليمات الدفع.</li>
        <li>ارفع إثبات الدفع أو رقم العملية.</li>
        <li>تراجع الإدارة الطلب ثم يتم تفعيل Teacher Pro.</li>
      </ol>
    </div>
  );
}
