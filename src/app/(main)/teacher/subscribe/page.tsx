"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { teacherSubscriptionService, type TeacherPlan, type TeacherSummary, type TeacherPlanDesign } from '@/lib/api/services/teacher-subscription';

const paymentMethods = [
  { value: 'cliq', label: 'CliQ' },
  { value: 'zain_cash', label: 'زين كاش' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'paypal', label: 'PayPal' },
];

export default function TeacherSubscribePage() {
  const [plan, setPlan] = useState<TeacherPlan | null>(null);
  const [design, setDesign] = useState<TeacherPlanDesign | null>(null);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    subject: '',
    school: '',
    city: '',
    phone: '',
    payment_method: 'cliq',
    payer_name: '',
    payment_reference: '',
    payment_proof_url: '',
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [planData, designData, summaryData] = await Promise.all([
          teacherSubscriptionService.getPlan(),
          teacherSubscriptionService.getDesign(),
          teacherSubscriptionService.me().catch(() => null),
        ]);
        if (!mounted) return;
        setPlan(planData);
        setDesign(designData);
        setSummary(summaryData);
      } catch {
        toast.error('تعذر تحميل بيانات الاشتراك');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim()) {
      toast.error('يرجى كتابة المادة التي تريد الاشتراك بها');
      return;
    }

    if (!form.payment_method) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }
    setSubmitting(true);
    try {
      const order = await teacherSubscriptionService.createOrder(form);
      toast.success('تم إرسال طلب الاشتراك بنجاح');
      setSummary((prev) => prev ? { ...prev, orders: [order, ...(prev.orders || [])], can_create_order: false } : prev);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر إرسال طلب الاشتراك');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 font-bold text-slate-600">جاري تحميل بيانات الاشتراك...</p>
        </div>
      </main>
    );
  }

  const hasActive = summary?.has_active;
  const hasPending = summary?.orders?.some((order) => order.status === 'pending');

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20" dir="rtl">
      <section className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">طلب اشتراك المعلم للفصل الدراسي</h1>
          <p className="mt-3 leading-7 text-slate-600">
            السعر: <strong>{plan?.price_jod || 25} دينار أردني</strong> للفصل الدراسي.
            بعد إرسال الطلب ستقوم الإدارة بمراجعة الدفع وتفعيل الاشتراك.
          </p>
        </div>

        {hasActive && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-3 font-black text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
              اشتراكك نشط حاليًا
            </div>
            <p className="mt-2 text-sm text-emerald-700">
              ينتهي الاشتراك في: {summary?.subscription?.ends_at ? new Date(summary.subscription.ends_at).toLocaleDateString('ar-JO') : '-'}
            </p>
            <Link href="/dashboard/teacher/subscription" className="mt-4 inline-block rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white">
              فتح لوحة الاشتراك
            </Link>
          </div>
        )}

        {hasPending && (
          <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 font-black text-amber-800">
              <AlertCircle className="h-6 w-6" />
              لديك طلب اشتراك قيد المراجعة
            </div>
            <p className="mt-2 text-sm text-amber-700">
              لا تحتاج لإرسال طلب جديد. سيتم تفعيل الاشتراك بعد مراجعة الإدارة.
            </p>
          </div>
        )}

        {!hasActive && !hasPending && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-slate-900">بيانات المعلم والدفع</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">المادة <span className="text-red-500">*</span></span>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="مثال: رياضيات، لغة عربية، تربية إسلامية"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">المدرسة</span>
                  <input
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="اختياري"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">المدينة</span>
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="مثال: عمّان"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">رقم الهاتف</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="للتواصل حول الطلب"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">طريقة الدفع</span>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                  >
                    {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">اسم صاحب التحويل</span>
                  <input
                    value={form.payer_name}
                    onChange={(e) => setForm({ ...form, payer_name: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="اختياري"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">رقم العملية أو ملاحظة الدفع</span>
                  <input
                    value={form.payment_reference}
                    onChange={(e) => setForm({ ...form, payment_reference: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="مثال: رقم عملية CliQ أو اسم المحوّل"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">رابط صورة التحويل إن وجد</span>
                  <input
                    value={form.payment_proof_url}
                    onChange={(e) => setForm({ ...form, payment_proof_url: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                    placeholder="رابط صورة أو ملاحظة مؤقتة لحين إضافة رفع الصور"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-2xl bg-emerald-600 px-6 py-3 font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الاشتراك'}
              </button>
            </form>

            <aside className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">بيانات الدفع</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                هذه المرحلة تعمل بنظام مراجعة يدوي. بعد التحويل أرسل بيانات الدفع من النموذج، وستقوم الإدارة بتفعيل الاشتراك.
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                <strong>المبلغ:</strong> 25 دينار أردني<br />
                <strong>المدة:</strong> فصل دراسي واحد<br />
                <strong>الأجهزة:</strong> {design?.limits?.devices || 2} جهازان موثقان<br />
                <strong>ملاحظة:</strong> سيتم إضافة رفع صورة التحويل لاحقًا بشكل مباشر.
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="mb-2 text-sm font-black text-emerald-900">أهم الصلاحيات</div>
                <ul className="space-y-1 text-xs font-semibold text-emerald-800">
                  {(design?.permissions || []).slice(0, 5).map((permission) => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>

              <Link href="/pricing/teacher" className="mt-5 inline-block text-sm font-bold text-emerald-700">
                مراجعة مميزات الاشتراك
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
