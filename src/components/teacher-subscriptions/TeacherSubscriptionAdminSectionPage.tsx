"use client";

import { useEffect, useState } from 'react';
import { Loader2, UserRound } from 'lucide-react';
import { teacherSubscriptionService } from '@/lib/api/services/teacher-subscription';

type AdminSection = 'subscriptions' | 'devices' | 'downloads' | 'ai-generations';

type Column = {
  key: string;
  label: string;
};

function displayUser(item: any) {
  const user = item?.user;
  if (user?.name || user?.email) {
    return (
      <div className="min-w-[180px]">
        <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
          <UserRound className="h-4 w-4 text-emerald-600" />
          {user.name || `مستخدم #${item?.user_id || '-'}`}
        </div>
        <div className="mt-1 text-xs text-slate-500">{user.email || '-'}</div>
      </div>
    );
  }

  return (
    <div className="min-w-[160px]">
      <div className="font-bold text-slate-700 dark:text-slate-200">مستخدم #{item?.user_id || '-'}</div>
      <div className="mt-1 text-xs text-slate-400">لم يتم تحميل بيانات المستخدم</div>
    </div>
  );
}

function displayCell(item: any, column: string) {
  const value = item?.[column];

  if (column === 'user') {
    return displayUser(item);
  }

  if (column === 'status') {
    const labels: Record<string, string> = {
      active: 'نشط',
      expired: 'منتهي',
      cancelled: 'موقوف',
      pending: 'قيد المراجعة',
      approved: 'مقبول',
      rejected: 'مرفوض',
    };
    const classes: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700',
      approved: 'bg-emerald-50 text-emerald-700',
      pending: 'bg-amber-50 text-amber-700',
      expired: 'bg-slate-100 text-slate-700',
      cancelled: 'bg-red-50 text-red-700',
      rejected: 'bg-red-50 text-red-700',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-black ${classes[value] || 'bg-slate-100 text-slate-700'}`}>
        {labels[value] || value || '-'}
      </span>
    );
  }

  if (column === 'watermark_applied') {
    return value ? (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">مطبق</span>
    ) : (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">غير مطبق</span>
    );
  }

  if (column === 'is_active') {
    return value ? (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">نشط</span>
    ) : (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">معطل</span>
    );
  }

  if (column === 'category') {
    const labels: Record<string, string> = {
      exam: 'امتحان',
      answer_key: 'نموذج إجابة',
      plan: 'خطة',
      content_analysis: 'تحليل محتوى',
      worksheet: 'ورقة عمل',
      remedial_plan: 'خطة علاجية',
      question_bank: 'بنك أسئلة',
      final_review: 'مراجعة نهائية',
    };
    return labels[value] || value || '-';
  }

  if ((column === 'created_at' || column === 'starts_at' || column === 'ends_at' || column === 'last_seen_at') && value) {
    try {
      return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
    } catch {
      return String(value);
    }
  }

  if ((column === 'ip_hash' || column === 'user_agent_hash') && value) {
    return (
      <span className="font-mono text-xs text-slate-500">
        {String(value).slice(0, 16)}...
      </span>
    );
  }

  if (column === 'price_jod') {
    return `${value ?? '-'} د.أ`;
  }

  return String(value ?? '-');
}

const pageConfig: Record<AdminSection, { title: string; loader: () => Promise<any>; columns: Column[] }> = {
  subscriptions: {
    title: 'الاشتراكات',
    loader: () => teacherSubscriptionService.adminListSubscriptions({}),
    columns: [
      { key: 'id', label: 'رقم الاشتراك' },
      { key: 'user', label: 'المعلم' },
      { key: 'status', label: 'الحالة' },
      { key: 'price_jod', label: 'السعر' },
      { key: 'starts_at', label: 'تاريخ البداية' },
      { key: 'ends_at', label: 'تاريخ الانتهاء' },
    ],
  },
  devices: {
    title: 'الأجهزة المرتبطة',
    loader: () => teacherSubscriptionService.adminListDevices({}),
    columns: [
      { key: 'id', label: 'رقم الجهاز' },
      { key: 'user', label: 'المعلم' },
      { key: 'label', label: 'اسم الجهاز' },
      { key: 'is_active', label: 'الحالة' },
      { key: 'last_seen_at', label: 'آخر ظهور' },
    ],
  },
  downloads: {
    title: 'سجل تحميلات Premium',
    loader: () => teacherSubscriptionService.adminListDownloads({}),
    columns: [
      { key: 'id', label: 'رقم العملية' },
      { key: 'user', label: 'المعلم' },
      { key: 'file_title', label: 'الملف' },
      { key: 'subject_name', label: 'المادة' },
      { key: 'category', label: 'التصنيف' },
      { key: 'download_code', label: 'رمز التحميل' },
      { key: 'watermark_applied', label: 'Watermark' },
      { key: 'ip_hash', label: 'IP Hash' },
      { key: 'created_at', label: 'تاريخ التحميل' },
    ],
  },
  'ai-generations': {
    title: 'عمليات AI للمعلمين',
    loader: () => teacherSubscriptionService.adminListAIGenerations({}),
    columns: [
      { key: 'id', label: 'رقم العملية' },
      { key: 'user', label: 'المعلم' },
      { key: 'tool_type', label: 'الأداة' },
      { key: 'title', label: 'العنوان' },
      { key: 'model', label: 'الموديل' },
      { key: 'created_at', label: 'التاريخ' },
    ],
  },
};

export default function TeacherSubscriptionAdminSectionPage({ section }: { section: AdminSection }) {
  const config = pageConfig[section];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const res = await config.loader();
      setItems(res?.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [section]);

  async function cancelSubscription(id: number) {
    const note = window.prompt('سبب إيقاف الاشتراك', '') || '';
    if (!window.confirm('هل أنت متأكد من إيقاف هذا الاشتراك؟ سيتم إزالة دور Teacher Pro إذا لم يكن لدى المعلم اشتراك نشط آخر.')) return;
    await teacherSubscriptionService.adminCancelSubscription(id, note);
    await reload();
  }

  async function renewSubscription(id: number) {
    const days = Number(window.prompt('عدد أيام التجديد', '150') || '150');
    const note = window.prompt('ملاحظة التجديد', '') || '';
    if (!window.confirm('هل تريد تجديد هذا الاشتراك؟')) return;
    await teacherSubscriptionService.adminRenewSubscription(id, { extra_days: days, admin_note: note });
    await reload();
  }

  async function deactivateDevice(item: any) {
    const note = window.prompt('سبب تعطيل الجهاز', '') || '';
    if (!window.confirm('هل تريد تعطيل هذا الجهاز؟')) return;
    await teacherSubscriptionService.adminDeactivateTeacherDevice(item.id, { user_id: item.user_id, note });
    await reload();
  }

  async function runMaintenance() {
    await teacherSubscriptionService.adminRunExpiryMaintenance();
    await reload();
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{config.title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          يتم عرض اسم المعلم والبريد بدل أرقام المستخدمين لتسهيل المراجعة الإدارية.
        </p>
        {section === 'subscriptions' && (
          <button onClick={runMaintenance} className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white dark:bg-white dark:text-slate-900">
            فحص الاشتراكات المنتهية
          </button>
        )}
      </div>

      {loading ? (
        <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <table className="w-full min-w-[1000px] text-right text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                {config.columns.map((column) => (
                  <th key={column.key} className="py-3">{column.label}</th>
                ))}
                {(section === 'subscriptions' || section === 'devices') && <th className="py-3">إجراء</th>}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + ((section === 'subscriptions' || section === 'devices') ? 1 : 0)} className="py-10 text-center text-slate-500">
                    لا توجد بيانات.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                    {config.columns.map((column) => (
                      <td key={column.key} className="py-4 align-top">{displayCell(item, column.key)}</td>
                    ))}
                    {section === 'devices' && (
                      <td className="py-4 align-top">
                        {item.is_active ? (
                          <button
                            type="button"
                            onClick={() => deactivateDevice(item)}
                            className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                          >
                            تعطيل الجهاز
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">معطل</span>
                        )}
                      </td>
                    )}
                    {section === 'subscriptions' && (
                      <td className="py-4 align-top">
                        <div className="flex gap-2">
                          {item.status === 'active' && (
                            <button
                              onClick={() => cancelSubscription(item.id)}
                              className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                            >
                              إيقاف
                            </button>
                          )}
                          <button
                            onClick={() => renewSubscription(item.id)}
                            className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            تجديد
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
