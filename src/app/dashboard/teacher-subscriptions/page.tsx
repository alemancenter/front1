"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, ClipboardList, Users, ShieldCheck, MonitorSmartphone, Download, Wand2, Clock } from 'lucide-react';
import { teacherSubscriptionService, type TeacherAdminDashboard } from '@/lib/api/services/teacher-subscription';

const cards = [
  { key: 'orders_pending', title: 'طلبات قيد المراجعة', icon: ClipboardList },
  { key: 'subscriptions_active', title: 'اشتراكات نشطة', icon: ShieldCheck },
  { key: 'teachers_total', title: 'المعلمون المسجلون', icon: Users },
  { key: 'devices_active', title: 'أجهزة نشطة', icon: MonitorSmartphone },
  { key: 'premium_downloads', title: 'تحميلات Premium', icon: Download },
  { key: 'ai_generations', title: 'عمليات AI', icon: Wand2 },
  { key: 'orders_approved', title: 'طلبات مفعلة', icon: ShieldCheck },
  { key: 'orders_rejected', title: 'طلبات مرفوضة', icon: Clock },
];

const links = [
  ['طلبات الاشتراك', '/dashboard/teacher-subscriptions/orders'],
  ['خزنة ملفات Premium', '/dashboard/teacher-subscriptions/premium-files'],
  ['المعلمون المشتركون', '/dashboard/teacher-subscriptions/teachers'],
  ['الاشتراكات', '/dashboard/teacher-subscriptions/subscriptions'],
  ['الأجهزة', '/dashboard/teacher-subscriptions/devices'],
  ['سجل التحميلات', '/dashboard/teacher-subscriptions/downloads'],
  ['عمليات AI', '/dashboard/teacher-subscriptions/ai-generations'],
];

export default function TeacherSubscriptionsAdminDashboard() {
  const [data, setData] = useState<TeacherAdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherSubscriptionService.adminDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">إدارة اشتراكات المعلمين</h1>
        <p className="mt-2 text-sm text-slate-500">مراقبة شاملة للطلبات، الاشتراكات، الأجهزة، التحميلات، وعمليات AI.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, title, icon: Icon }) => (
          <div key={key} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
            <Icon className="mb-3 h-7 w-7 text-emerald-600" />
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{data?.stats?.[key] || 0}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {links.map(([title, href]) => (
          <Link key={href} href={href} className="rounded-2xl bg-white p-4 text-sm font-black text-slate-800 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-900 dark:text-white">
            {title}
          </Link>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">آخر طلبات الاشتراك</h2>
        <div className="space-y-3">
          {(data?.recent_orders || []).length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد طلبات بعد.</p>
          ) : data?.recent_orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 text-sm dark:border-slate-800">
              <div>
                <div className="font-black">طلب #{order.id} - {order.user?.name || order.payer_name || '-'}</div>
                <div className="mt-1 text-slate-500">{order.payment_method} / {order.amount_jod} {order.currency}</div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{order.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
