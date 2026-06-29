"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, Download, Wand2, Library, MonitorSmartphone } from 'lucide-react';
import { teacherSubscriptionService, type TeacherWorkspaceSummary } from '@/lib/api/services/teacher-subscription';
import TeacherAccessDenied, { getTeacherAccessErrorMessage } from '@/components/teacher/TeacherAccessDenied';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<TeacherWorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    teacherSubscriptionService.workspace()
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setAccessError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setAccessError(getTeacherAccessErrorMessage(error));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>;
  }

  if (accessError) {
    return <TeacherAccessDenied message={accessError} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-3xl bg-gradient-to-l from-emerald-600 to-teal-600 p-7 text-white shadow-sm">
        <h1 className="text-3xl font-black">منطقة المعلم</h1>
        <p className="mt-2 text-emerald-50">مادتك في الاشتراك: <strong>{data?.subject || 'غير محددة'}</strong></p>
        <p className="mt-1 text-sm text-emerald-50">ينتهي الاشتراك: <strong>{data?.subscription?.ends_at ? new Date(data.subscription.ends_at).toLocaleDateString('ar') : '-'}</strong></p>
        <p className="mt-1 text-sm text-emerald-50">هنا تصل إلى ملفاتك، امتحاناتك، خططك، مكتبتك، وأدواتك التعليمية.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Stat title="تحميلات Premium" value={`${data?.usage?.downloads || 0} / ${data?.limits?.premium_downloads || 300}`} icon={<Download />} />
        <Stat title="المتبقي من التحميلات" value={`${Math.max((data?.limits?.premium_downloads || 300) - (data?.usage?.downloads || 0), 0)}`} icon={<Download />} />
        <Stat title="عمليات AI" value={`${data?.usage?.ai_generations || 0} / ${data?.limits?.ai_generations || 100}`} icon={<Wand2 />} />
        <Stat title="مكتبتي" value={`${data?.stats?.library_items || 0}`} icon={<Library />} />
        <Stat title="الأجهزة" value={`${data?.limits?.devices || 2}`} icon={<MonitorSmartphone />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(data?.quick_links || []).map((link) => (
          <Link key={link.href} href={link.href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
            <BookOpen className="mb-4 h-8 w-8 text-emerald-600" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{link.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="mb-3 h-7 w-7 text-emerald-600">{icon}</div>
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-1 text-xl font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
