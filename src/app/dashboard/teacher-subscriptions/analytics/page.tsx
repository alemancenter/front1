"use client";

import { useEffect, useState } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { teacherSubscriptionService, type TeacherUsageAnalytics, type TeacherMetricItem } from '@/lib/api/services/teacher-subscription';

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<TeacherUsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherSubscriptionService.adminUsageAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">تحليلات استخدام اشتراكات المعلمين</h1>
      <div className="grid gap-4 md:grid-cols-5">
        <Stat title="التحميلات" value={data?.total_downloads || 0} />
        <Stat title="عمليات AI" value={data?.total_ai_generations || 0} />
        <Stat title="ملفات Premium" value={data?.total_premium_files || 0} />
        <Stat title="المعلمون" value={data?.total_teachers || 0} />
        <Stat title="الأجهزة النشطة" value={data?.active_devices || 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Metric title="أكثر المواد استخدامًا" items={data?.top_subjects || []} />
        <Metric title="أكثر التصنيفات استخدامًا" items={data?.top_categories || []} />
        <Metric title="أكثر الملفات تحميلًا" items={data?.top_downloaded_files || []} />
        <Metric title="أكثر المعلمين نشاطًا" items={data?.most_active_teachers || []} />
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900"><BarChart3 className="mb-2 h-6 w-6 text-emerald-600" /><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-2xl font-black">{value}</div></div>;
}

function Metric({ title, items }: { title: string; items: TeacherMetricItem[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-black">{title}</h2>
      <div className="space-y-3">
        {items.length === 0 ? <div className="text-sm text-slate-500">لا توجد بيانات.</div> : items.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
            <span className="font-bold">{item.label || '-'}</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
