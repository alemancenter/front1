"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { teacherSubscriptionService, type TeacherOrder } from '@/lib/api/services/teacher-subscription';

export default function TeacherSubscriptionOrdersAdminPage() {
  const [orders, setOrders] = useState<TeacherOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');

  async function load() {
    setLoading(true);
    try {
      const res = await teacherSubscriptionService.adminListOrders(status, 1);
      setOrders(res?.data || []);
    } catch {
      toast.error('تعذر تحميل طلبات الاشتراك');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function approve(id: number) {
    const note = window.prompt('ملاحظة الإدارة عند التفعيل', '') || '';
    try {
      await teacherSubscriptionService.adminApproveOrder(id, note);
      toast.success('تم تفعيل الاشتراك');
      load();
    } catch {
      toast.error('تعذر تفعيل الاشتراك');
    }
  }

  async function reject(id: number) {
    const note = window.prompt('سبب الرفض', '') || '';
    try {
      await teacherSubscriptionService.adminRejectOrder(id, note);
      toast.success('تم رفض الطلب');
      load();
    } catch {
      toast.error('تعذر رفض الطلب');
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">طلبات اشتراك المعلمين</h1>
          <p className="mt-2 text-sm text-slate-500">مراجعة طلبات اشتراك المعلم للفصل الدراسي وتفعيلها يدويًا.</p>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold dark:bg-slate-900"
        >
          <option value="pending">قيد المراجعة</option>
          <option value="approved">مفعلة</option>
          <option value="rejected">مرفوضة</option>
          <option value="">الكل</option>
        </select>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
          </div>
        ) : orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">لا توجد طلبات في هذه الحالة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
                  <th className="py-3">المعلم</th>
                  <th className="py-3">البريد</th>
                  <th className="py-3">طريقة الدفع</th>
                  <th className="py-3">رقم العملية</th>
                  <th className="py-3">المبلغ</th>
                  <th className="py-3">الحالة</th>
                  <th className="py-3">تفاصيل</th>
                  <th className="py-3">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-4 font-bold text-slate-800 dark:text-slate-100">{order.user?.name || order.payer_name || '-'}</td>
                    <td className="py-4 text-slate-500">{order.user?.email || '-'}</td>
                    <td className="py-4">{order.payment_method}</td>
                    <td className="py-4">{order.payment_reference || '-'}</td>
                    <td className="py-4">{order.amount_jod} {order.currency}</td>
                    <td className="py-4">{order.status}</td>
                    <td className="py-4">
                      <a
                        href={`/dashboard/teacher-subscriptions/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                      >
                        <Eye className="h-4 w-4" />
                        تفاصيل
                      </a>
                    </td>
                    <td className="py-4">
                      {order.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => approve(order.id)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                            <CheckCircle2 className="h-4 w-4" />
                            تفعيل
                          </button>
                          <button onClick={() => reject(order.id)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                            <XCircle className="h-4 w-4" />
                            رفض
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">تمت المراجعة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
