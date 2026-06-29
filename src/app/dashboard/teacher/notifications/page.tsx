"use client";

import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { teacherSubscriptionService, type TeacherNotificationItem } from '@/lib/api/services/teacher-subscription';

export default function TeacherNotificationsPage() {
  const [items, setItems] = useState<TeacherNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    teacherSubscriptionService.teacherNotifications()
      .then((res) => {
        if (!mounted) return;
        setItems(res?.data || []);
        setError(null);
      })
      .catch((error: any) => {
        if (!mounted) return;
        setError(error?.message || 'تعذر تحميل إشعارات المعلم');
        setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">إشعارات المعلم</h1>
      {loading ? <Loader2 className="h-9 w-9 animate-spin text-emerald-600" /> : error ? (
        <div className="rounded-3xl bg-white p-8 text-center text-red-500 shadow-sm dark:bg-slate-900">{error}</div>
      ) : (
        <div className="space-y-3">
          {items.length === 0 ? <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-900">لا توجد إشعارات.</div> : items.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="flex items-center gap-3 font-black">
                <Bell className="h-5 w-5 text-emerald-600" />
                {item.title}
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
