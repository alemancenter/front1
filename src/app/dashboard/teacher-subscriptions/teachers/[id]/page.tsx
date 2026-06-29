"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, UserRound, MonitorSmartphone, Download, Sparkles } from 'lucide-react';
import { teacherSubscriptionService, type TeacherAdminDetail } from '@/lib/api/services/teacher-subscription';

export default function TeacherAdminDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<TeacherAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await teacherSubscriptionService.adminTeacherDetail(params.id);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  async function disableDevice(id: number) {
    const note = window.prompt('سبب تعطيل الجهاز', '') || '';
    await teacherSubscriptionService.adminDeactivateTeacherDevice(id, { user_id: Number(params.id), note });
    await load();
  }

  useEffect(() => { load(); }, [params.id]);

  if (loading) return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-3xl bg-gradient-to-l from-emerald-600 to-teal-600 p-6 text-white">
        <UserRound className="mb-3 h-9 w-9" />
        <h1 className="text-2xl font-black">{data?.user?.name || 'تفاصيل المعلم'}</h1>
        <p className="mt-1 text-emerald-50">{data?.user?.email || '-'}</p>
        <p className="mt-2 text-sm text-emerald-50">المادة: {data?.profile?.subject || '-'} / المدرسة: {data?.profile?.school || '-'}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="حالة الاشتراك" value={data?.subscription?.status || '-'} />
        <Card title="الأجهزة" value={String(data?.devices?.length || 0)} />
        <Card title="التحميلات" value={String(data?.downloads?.length || 0)} />
        <Card title="عمليات AI" value={String(data?.ai_generations?.length || 0)} />
      </div>

      <Section title="الأجهزة المرتبطة">
        {(data?.devices || []).length === 0 ? <Empty /> : data?.devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 font-black"><MonitorSmartphone className="h-4 w-4 text-emerald-600" />{device.label || `جهاز #${device.id}`}</div>
              <div className="mt-1 text-xs text-slate-500">الحالة: {device.is_active ? 'نشط' : 'معطل'} / آخر ظهور: {device.last_seen_at || '-'}</div>
            </div>
            {device.is_active && <button onClick={() => disableDevice(device.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">تعطيل</button>}
          </div>
        ))}
      </Section>

      <Section title="آخر التحميلات">
        {(data?.downloads || []).length === 0 ? <Empty /> : data?.downloads.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 font-black"><Download className="h-4 w-4 text-emerald-600" />{item.file_title || item.original_filename}</div>
            <div className="mt-1 text-xs text-slate-500">{item.subject_name || '-'} / {item.category || '-'} / {item.download_code || '-'}</div>
          </div>
        ))}
      </Section>

      <Section title="عمليات AI">
        {(data?.ai_generations || []).length === 0 ? <Empty /> : data?.ai_generations.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 font-black"><Sparkles className="h-4 w-4 text-emerald-600" />{item.title}</div>
            <div className="mt-1 text-xs text-slate-500">{item.tool_type} / {item.model}</div>
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

function Empty() { return <div className="text-sm text-slate-500">لا توجد بيانات.</div>; }
