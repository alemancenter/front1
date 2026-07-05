"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle2, AlertCircle, GraduationCap, Plus, X } from 'lucide-react';
import {
  teacherSubscriptionService,
  type TeacherPlan,
  type TeacherSummary,
  type TeacherPlanDesign,
  TEACHER_MAX_SUBJECTS,
} from '@/lib/api/services/teacher-subscription';

const paymentMethods = [
  { value: 'cliq', label: 'CliQ' },
  { value: 'zain_cash', label: 'زين كاش' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'paypal', label: 'PayPal' },
];

// A subscription expiring within this many days can be renewed early
// without waiting for it to lapse.
const RENEWAL_WINDOW_DAYS = 14;

export default function TeacherSubscribePage() {
  const [plan, setPlan] = useState<TeacherPlan | null>(null);
  const [design, setDesign] = useState<TeacherPlanDesign | null>(null);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subjects, setSubjects] = useState<string[]>(['']);
  const [form, setForm] = useState({
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

        // Pre-fill from an existing profile — handy both for first-time
        // completion and for quick renewal of an expiring subscription.
        const existingSubjects = (summaryData?.subjects || []).filter(Boolean);
        if (existingSubjects.length > 0) setSubjects(existingSubjects);
        if (summaryData?.profile) {
          setForm((prev) => ({
            ...prev,
            school: summaryData.profile?.school || prev.school,
            city: summaryData.profile?.city || prev.city,
            phone: summaryData.profile?.phone || prev.phone,
          }));
        }
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

  const maxSubjects = design?.limits?.subjects || TEACHER_MAX_SUBJECTS;

  const daysLeft = useMemo(() => {
    const endsAt = summary?.subscription?.ends_at;
    if (!endsAt) return null;
    return Math.ceil((new Date(endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }, [summary?.subscription?.ends_at]);

  const isRenewal = Boolean(summary?.has_active);
  const canRenewNow = isRenewal && daysLeft !== null && daysLeft <= RENEWAL_WINDOW_DAYS;

  function updateSubject(index: number, value: string) {
    setSubjects((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function addSubjectField() {
    setSubjects((prev) => (prev.length >= maxSubjects ? prev : [...prev, '']));
  }

  function removeSubjectField(index: number) {
    setSubjects((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanSubjects = subjects.map((s) => s.trim()).filter(Boolean);
    if (cleanSubjects.length === 0) {
      toast.error('يرجى كتابة مادة واحدة على الأقل تريد الاشتراك بها');
      return;
    }
    if (cleanSubjects.length > maxSubjects) {
      toast.error(`الحد الأقصى ${maxSubjects} مواد ضمن الاشتراك الواحد`);
      return;
    }
    if (!form.payment_method) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }
    setSubmitting(true);
    try {
      const order = await teacherSubscriptionService.createOrder({ ...form, subjects: cleanSubjects });
      toast.success(isRenewal ? 'تم إرسال طلب التجديد بنجاح' : 'تم إرسال طلب الاشتراك بنجاح');
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
  const showForm = (!hasActive && !hasPending) || canRenewNow;

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20" dir="rtl">
      <section className="container mx-auto max-w-5xl px-4">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">
            {canRenewNow ? 'تجديد اشتراك المعلم للفصل الدراسي' : 'طلب اشتراك المعلم للفصل الدراسي'}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">
            السعر: <strong>{plan?.price_jod || 25} دينار أردني</strong> للفصل الدراسي، ويغطي حتى{' '}
            <strong>{maxSubjects} مواد دراسية</strong>. بعد إرسال الطلب ستقوم الإدارة بمراجعة الدفع وتفعيل الاشتراك.
          </p>
        </div>

        {hasActive && (
          <div className={`mb-6 rounded-3xl border p-6 ${canRenewNow ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <div className={`flex items-center gap-3 font-black ${canRenewNow ? 'text-amber-800' : 'text-emerald-800'}`}>
              <CheckCircle2 className="h-6 w-6" />
              اشتراكك نشط حاليًا
            </div>
            <p className={`mt-2 text-sm ${canRenewNow ? 'text-amber-700' : 'text-emerald-700'}`}>
              ينتهي الاشتراك في: {summary?.subscription?.ends_at ? new Date(summary.subscription.ends_at).toLocaleDateString('ar-JO') : '-'}
              {daysLeft !== null && daysLeft >= 0 ? ` (بعد ${daysLeft} يوم)` : ''}
            </p>
            {canRenewNow && (
              <p className="mt-2 text-sm font-bold text-amber-800">
                اشتراكك على وشك الانتهاء — يمكنك تجديده الآن مباشرة من النموذج أدناه دون فقدان الوصول.
              </p>
            )}
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

        {showForm && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-black text-slate-900">بيانات المعلم والدفع</h2>

              <div className="mb-5">
                <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  المواد الدراسية <span className="text-red-500">*</span>
                  <span className="font-normal text-slate-400">(حتى {maxSubjects} مواد ضمن نفس الاشتراك)</span>
                </span>
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={subject}
                        onChange={(e) => updateSubject(index, e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                        placeholder={index === 0 ? 'مثال: رياضيات' : `مادة إضافية ${index + 1} (اختياري)`}
                      />
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubjectField(index)}
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-600"
                          aria-label="حذف المادة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {subjects.length < maxSubjects && (
                  <button
                    type="button"
                    onClick={addSubjectField}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة مادة أخرى ({subjects.length}/{maxSubjects})
                  </button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                {submitting ? 'جاري إرسال الطلب...' : isRenewal ? 'إرسال طلب التجديد' : 'إرسال طلب الاشتراك'}
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
                <strong>المواد:</strong> حتى {maxSubjects} مواد ضمن الاشتراك نفسه<br />
                <strong>الأجهزة:</strong> {design?.limits?.devices || 2} جهازان موثقان<br />
                <strong>ملاحظة:</strong> سيتم إضافة رفع صورة التحويل لاحقًا بشكل مباشر.
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="mb-2 text-sm font-black text-emerald-900">أبرز مزايا الاشتراك</div>
                <ul className="space-y-1.5 text-xs font-semibold text-emerald-800">
                  {(design?.features || []).slice(0, 6).map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {feature}
                    </li>
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
