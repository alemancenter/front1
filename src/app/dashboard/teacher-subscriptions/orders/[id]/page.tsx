"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, ReceiptText, XCircle } from 'lucide-react';
import { teacherSubscriptionService, type TeacherOrderDetail } from '@/lib/api/services/teacher-subscription';

function formatDate(value?: string) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function TeacherOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<TeacherOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const order = data?.order;

  async function load() {
    setLoading(true);
    try {
      const res = await teacherSubscriptionService.adminGetOrderDetail(params.id);
      setData(res);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحميل تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function approve() {
    if (!order) return;
    const note = window.prompt('ملاحظة الإدارة عند التفعيل', '') || '';
    try {
      await teacherSubscriptionService.adminApproveOrder(order.id, note);
      toast.success('تم قبول الطلب وتفعيل الاشتراك');
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر قبول الطلب');
    }
  }

  async function reject() {
    if (!order) return;
    const note = window.prompt('سبب الرفض', '') || '';
    if (!note.trim()) {
      toast.error('يجب كتابة سبب الرفض');
      return;
    }
    try {
      await teacherSubscriptionService.adminRejectOrder(order.id, note);
      toast.success('تم رفض الطلب');
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر رفض الطلب');
    }
  }

  if (loading) {
    return <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />;
  }

  if (!order) {
    return <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-900">الطلب غير موجود.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">تفاصيل طلب اشتراك المعلم #{order.id}</h1>
          <p className="mt-2 text-sm text-slate-500">مراجعة بيانات المعلم، الدفع، وإثبات التحويل قبل اتخاذ القرار.</p>
        </div>
        <button onClick={() => router.push('/dashboard/teacher-subscriptions/orders')} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
          رجوع للطلبات
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card title="الحالة" value={order.status || '-'} />
        <Card title="المبلغ" value={`${order.amount_jod || 0} ${order.currency || 'JOD'}`} />
        <Card title="طريقة الدفع" value={order.payment_method || '-'} />
        <Card title="تاريخ الطلب" value={formatDate(order.created_at)} />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">بيانات المعلم</h2>
          <Info label="الاسم" value={order.user?.name || '-'} />
          <Info label="البريد" value={order.user?.email || '-'} />
          <Info label="المادة" value={data?.profile?.subject || '-'} />
          <Info label="المدرسة" value={data?.profile?.school || '-'} />
          <Info label="المدينة" value={data?.profile?.city || '-'} />
          <Info label="الهاتف" value={order.phone || data?.profile?.phone || '-'} />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-black text-slate-900 dark:text-white">بيانات الدفع</h2>
          <Info label="اسم الدافع" value={order.payer_name || '-'} />
          <Info label="رقم العملية / المرجع" value={order.payment_reference || '-'} />
          <Info label="ملاحظة الإدارة" value={order.admin_note || '-'} />
          <Info label="تمت المراجعة" value={order.reviewed_at ? formatDate(order.reviewed_at) : 'لم تتم بعد'} />

          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-2 font-black">
              <ReceiptText className="h-5 w-5 text-emerald-600" />
              إثبات الدفع
            </div>
            {data?.has_proof ? (
              <div className="space-y-3">
                <a
                  href={`/backend-api/dashboard/teacher-subscriptions/orders/${order.id}/proof`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  فتح إثبات الدفع
                </a>
                <div className="text-xs text-slate-500">{data.proof_filename || 'payment proof'}</div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">لم يتم رفع إثبات دفع لهذا الطلب.</p>
            )}
          </div>
        </div>
      </section>

      {order.status === 'pending' && (
        <div className="flex flex-wrap gap-3 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <button onClick={approve} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            قبول وتفعيل الاشتراك
          </button>
          <button onClick={reject} className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 hover:bg-red-100">
            <XCircle className="h-5 w-5" />
            رفض الطلب
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900"><div className="text-sm text-slate-500">{title}</div><div className="mt-2 text-xl font-black text-slate-900 dark:text-white">{value}</div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex border-b border-slate-100 py-3 text-sm dark:border-slate-800"><span className="w-36 text-slate-500">{label}</span><span className="font-bold text-slate-900 dark:text-white">{value}</span></div>;
}
