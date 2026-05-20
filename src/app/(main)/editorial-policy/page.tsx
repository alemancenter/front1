import StaticPageHeader from '@/components/common/StaticPageHeader';
import { BookOpenCheck, RefreshCw, SearchCheck, MessageSquareWarning } from 'lucide-react';

export const metadata = {
  title: 'سياسة التحرير والمراجعة | الإيمان التعليمي',
  description: 'تعرف على طريقة اختيار ومراجعة وتحديث المحتوى التعليمي المنشور على موقع الإيمان التعليمي.',
  robots: { index: true, follow: true },
};

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="سياسة التحرير والمراجعة"
        current="سياسة التحرير"
        eyebrow="الإيمان التعليمي"
        description="نوضح هنا كيف يتم تنظيم المحتوى التعليمي ومراجعته وتحديثه لضمان تجربة مفيدة وواضحة للطلاب والمعلمين."
      />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <article className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-right text-base leading-8 text-slate-700 prose-headings:font-black prose-headings:text-slate-900 md:text-[17px]">
            <p className="lead">آخر تحديث: 20 مايو 2026</p>
            <p>
              يهدف موقع <strong>الإيمان التعليمي</strong> إلى تقديم محتوى تعليمي منظم وواضح يساعد الطالب والمعلم وولي الأمر على الوصول السريع إلى الملفات والمقالات والموارد المرتبطة بالمنهاج.
            </p>

            <h2>معايير اختيار المحتوى</h2>
            <p>
              نعتمد في نشر المحتوى على مدى ارتباطه بالمنهاج، فائدته التعليمية، وضوح عنوانه، وإمكانية استفادة المستخدم منه في الدراسة أو التحضير أو المراجعة. لا يتم اعتماد الصفحات التي لا تقدم فائدة واضحة أو تحتوي على معلومات مضللة.
            </p>

            <div className="my-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <BookOpenCheck className="mb-3 h-7 w-7 text-blue-700" />
                <h3 className="mb-2 text-lg font-black">محتوى تعليمي واضح</h3>
                <p className="text-sm leading-7">نحرص على أن تكون الصفحات مرتبطة بصف أو مادة أو موضوع واضح.</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <SearchCheck className="mb-3 h-7 w-7 text-emerald-700" />
                <h3 className="mb-2 text-lg font-black">تنظيم وفهرسة</h3>
                <p className="text-sm leading-7">يتم تنظيم المحتوى عبر الأقسام والكلمات والروابط الداخلية لتسهيل الوصول.</p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
                <RefreshCw className="mb-3 h-7 w-7 text-violet-700" />
                <h3 className="mb-2 text-lg font-black">تحديث مستمر</h3>
                <p className="text-sm leading-7">نقوم بتحديث الملفات والمقالات عند توفر معلومات أو نسخ أحدث.</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <MessageSquareWarning className="mb-3 h-7 w-7 text-amber-700" />
                <h3 className="mb-2 text-lg font-black">تصحيح الأخطاء</h3>
                <p className="text-sm leading-7">يمكن للمستخدمين إرسال ملاحظات حول أي خطأ أو ملف غير مناسب للمراجعة.</p>
              </div>
            </div>

            <h2>مراجعة المقالات والملفات</h2>
            <p>
              قبل نشر المحتوى أو تحديثه، تتم مراجعة العنوان، التصنيف، الوصف، وضوح الملف أو المرفق، وسلامة تجربة المستخدم. كما نعمل تدريجيًا على تحسين الصفحات القديمة وإضافة وصف تعليمي أوضح لكل ملف.
            </p>

            <h2>التعامل مع المحتوى القديم</h2>
            <p>
              نظرًا لكثرة الصفحات والملفات التعليمية، قد توجد صفحات قديمة تحتاج إلى تحسين أو تحديث. لذلك نعتمد خطة مراجعة مرحلية تبدأ بالصفحات الأعلى زيارة والأكثر أهمية، ثم تنتقل تدريجيًا إلى باقي المحتوى.
            </p>

            <h2>الإبلاغ عن خطأ</h2>
            <p>
              إذا لاحظت خطأ في صفحة، ملف غير مناسب، رابط تحميل لا يعمل، أو معلومة تحتاج إلى تحديث، يمكنك التواصل معنا عبر صفحة اتصل بنا أو عبر البريد المخصص للدعم.
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
