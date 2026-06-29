"use client";

import { useEffect, useState } from 'react';
import { Loader2, WalletCards } from 'lucide-react';
import { teacherSubscriptionService, type TeacherFinancialReport } from '@/lib/api/services/teacher-subscription';

export default function TeacherFinanceReportsPage() {
  const [data, setData] = useState<TeacherFinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherSubscriptionService.adminFinancialReport().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">التقارير المالية لاشتراكات المعلمين</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="إجمالي الدخل" value={`${data?.total_revenue_jod || 0} د.أ`} />
        <Card title="دخل الشهر الحالي" value={`${data?.current_month_revenue_jod || 0} د.أ`} />
        <Card title="طلبات مقبولة" value={String(data?.approved_orders || 0)} />
        <Card title="طلبات قيد المراجعة" value={String(data?.pending_orders || 0)} />
        <Card title="طلبات مرفوضة" value={String(data?.rejected_orders || 0)} />
        <Card title="اشتراكات نشطة" value={String(data?.active_subscriptions || 0)} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <WalletCards className="mb-3 h-7 w-7 text-emerald-600" />
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
