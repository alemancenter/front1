"use client";

import { useEffect, useState } from 'react';
import { Loader2, Library } from 'lucide-react';
import { teacherSubscriptionService, type TeacherLibraryItem } from '@/lib/api/services/teacher-subscription';
import TeacherAccessDenied, { getTeacherAccessErrorMessage } from '@/components/teacher/TeacherAccessDenied';

export default function TeacherLibraryPage() {
  const [items, setItems] = useState<TeacherLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    teacherSubscriptionService.library()
      .then((res) => {
        if (!mounted) return;
        setItems(res?.data || []);
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

  if (accessError) {
    return <TeacherAccessDenied message={accessError} />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">مكتبتي</h1>
      {loading ? <Loader2 className="h-9 w-9 animate-spin text-emerald-600" /> : items.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm dark:bg-slate-900">لم تحفظ أي عناصر بعد.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <Library className="mb-3 h-7 w-7 text-emerald-600" />
              <h2 className="font-black text-slate-900 dark:text-white">{item.title}</h2>
              <p className="mt-2 text-xs text-slate-500">{item.category || item.source_type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
