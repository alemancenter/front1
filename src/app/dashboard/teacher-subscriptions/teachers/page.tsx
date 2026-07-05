"use client";

import { useEffect, useState } from 'react';
import { Loader2, Search, Eye } from 'lucide-react';
import { teacherSubscriptionService, parseTeacherProfileSubjects, type TeacherProfile } from '@/lib/api/services/teacher-subscription';

export default function TeacherSubscriptionsTeachersPage() {
  const [items, setItems] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await teacherSubscriptionService.adminListTeachers({ q });
      setItems(res?.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function removeMembership(userId: number) {
    const note = window.prompt('سبب حذف عضوية المعلم من Teacher Pro', '') || '';
    if (!window.confirm('هل أنت متأكد؟ سيتم إيقاف اشتراك المعلم وإزالة دور Teacher Pro وتعطيل أجهزته، دون حذف حساب المستخدم.')) return;
    await teacherSubscriptionService.adminRemoveTeacherMembership(userId, note);
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">المعلمون المشتركون</h1>
      <div className="flex gap-2 rounded-3xl bg-white p-3 shadow-sm dark:bg-slate-900">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 outline-none dark:border-slate-800 dark:bg-slate-950" placeholder="بحث باسم المعلم، البريد، المادة، المدرسة..." />
        <button onClick={load} className="rounded-2xl bg-emerald-600 px-5 text-white"><Search className="h-5 w-5" /></button>
      </div>
      <Table loading={loading} items={items} onRemove={removeMembership} />
    </div>
  );
}

function Table({ loading, items, onRemove }: { loading: boolean; items: TeacherProfile[]; onRemove: (userId: number) => void }) {
  if (loading) return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;
  return (
    <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
      <table className="w-full min-w-[850px] text-right text-sm">
        <thead><tr className="border-b text-slate-500"><th className="py-3">المعلم</th><th>البريد</th><th>المادة</th><th>المدرسة</th><th>الهاتف</th><th>المدينة</th><th>إجراء</th></tr></thead>
        <tbody>{items.map((item) => (
          <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
            <td className="py-4 font-bold">{item.user?.name || '-'}</td><td>{item.user?.email || '-'}</td><td>{parseTeacherProfileSubjects(item).join('، ') || '-'}</td><td>{item.school || '-'}</td><td>{item.phone || '-'}</td><td>{item.city || '-'}</td><td><a href={`/dashboard/teacher-subscriptions/teachers/${item.user_id}`} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><Eye className="inline h-4 w-4" /> تفاصيل</a>
                  <button onClick={() => onRemove(item.user_id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">حذف العضوية</button></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
