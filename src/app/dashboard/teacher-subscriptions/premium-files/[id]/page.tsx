"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { teacherSubscriptionService, type TeacherPremiumFileDetail } from '@/lib/api/services/teacher-subscription';

export default function PremiumFileDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<TeacherPremiumFileDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherSubscriptionService.adminGetPremiumVaultFileDetail(params.id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;

  const file = data?.file;

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{file?.title || 'تفاصيل ملف Premium'}</h1>
        <p className="mt-2 text-sm text-slate-500">مراجعة الملف، التحميلات، وسجل التدقيق.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="المادة" value={file?.subject_name || '-'} />
        <Card title="التصنيف" value={file?.category || '-'} />
        <Card title="التحميلات" value={String(file?.download_count || 0)} />
        <Card title="الحالة" value={file?.is_active ? 'نشط' : 'موقوف'} />
      </div>

      <Section title="آخر التحميلات">
        {(data?.downloads || []).length === 0 ? <Empty /> : data?.downloads.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
            <div className="font-black">{item.file_title || item.original_filename}</div>
            <div className="mt-1 text-slate-500">المعلم: {item.user?.name || item.user_id} / الرمز: {item.download_code}</div>
          </div>
        ))}
      </Section>

      <Section title="سجل التدقيق">
        {(data?.audit_logs || []).length === 0 ? <Empty /> : data?.audit_logs.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
            <div className="font-black">{item.action}</div>
            <div className="mt-1 text-slate-500">{item.note || '-'} / {item.actor?.name || item.actor_id || '-'}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-xl font-black">{value}</div></div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900"><h2 className="mb-4 text-lg font-black">{title}</h2><div className="space-y-3">{children}</div></div>;
}

function Empty() {
  return <p className="text-sm text-slate-500">لا توجد بيانات.</p>;
}
