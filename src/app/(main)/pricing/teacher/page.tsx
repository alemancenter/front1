import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Sparkles, FileText, GraduationCap, Wand2 } from 'lucide-react';

const features = [
  'نماذج امتحانات حديثة ومتنوعة للفصل الدراسي',
  'خطط فصلية وتحليل محتوى وخطط علاجية',
  'أوراق عمل وملفات Word/PDF قابلة للطباعة',
  'أدوات AI للمعلم: اختبار، نموذج إجابة، ورقة عمل، خطة علاجية',
  'مكتبة خاصة وسجل استخدام داخل لوحة المعلم',
  'جهازان موثقان لحماية الاشتراك وتقليل المشاركة',
];

export const metadata = {
  title: 'اشتراك المعلم للفصل الدراسي | Alemancenter',
  description: 'اشتراك مدفوع لمعلمي الأردن بقيمة 25 دينار للفصل الدراسي يشمل نماذج امتحانات، خطط، تحليل محتوى، وأدوات AI للمعلم.',
};

export default function TeacherPricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white pt-24 pb-20" dir="rtl">
      <section className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-12">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
                <GraduationCap className="h-4 w-4" />
                مخصص لمعلمي الأردن
              </div>

              <h1 className="mb-5 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                اشتراك المعلم للفصل الدراسي
              </h1>

              <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
                وفر وقتك في التحضير والاختبارات طوال الفصل الدراسي. احصل على نماذج امتحانات،
                خطط، تحليل محتوى، أوراق عمل، وأدوات ذكاء اصطناعي تعليمية مخصصة للمعلم.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold leading-6 text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/teacher/subscribe"
                  className="rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700"
                >
                  اشترك الآن
                </Link>
                <Link
                  href="/contact-us"
                  className="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  تواصل مع الإدارة
                </Link>
                <Link
                  href="/teacher-subscription/faq"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-7 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
                >
                  الأسئلة الشائعة
                </Link>
                <Link
                  href="/teacher-subscription/policy"
                  className="rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  سياسة الاستخدام
                </Link>
              </div>
            </div>

            <aside className="bg-slate-950 p-8 text-white md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-emerald-300" />
                <h2 className="text-2xl font-black">خطة الفصل</h2>
              </div>

              <div className="mb-8 rounded-3xl bg-white/10 p-6">
                <div className="text-sm font-bold text-emerald-200">السعر</div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-6xl font-black">25</span>
                  <span className="mb-2 text-xl font-bold">دينار أردني</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">للفصل الدراسي الواحد</p>
              </div>

              <div className="space-y-4 text-sm font-semibold text-slate-200">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  جهازان موثقان لكل معلم
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-emerald-300" />
                  حتى 300 تحميل Premium في الفصل
                </div>
                <div className="flex items-center gap-3">
                  <Wand2 className="h-5 w-5 text-emerald-300" />
                  حتى 100 عملية AI للمعلم في الفصل
                </div>
              </div>

              <p className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm leading-7 text-emerald-50">
                في المرحلة الأولى يتم الدفع يدويًا عبر الطرق المعتمدة، ثم تقوم الإدارة بمراجعة الطلب وتفعيل الاشتراك.
              </p>
            </aside>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-black text-slate-950">صلاحيات الاشتراك</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                'الوصول إلى منطقة المعلم',
                'تحميل ملفات Premium',
                'تصدير Word/PDF',
                'إنشاء امتحانات AI',
                'إنشاء نماذج إجابة',
                'إنشاء أوراق عمل وخطط علاجية',
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
