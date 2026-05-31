'use client';

import { useSettingsStore } from '@/store/useStore';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe } from 'lucide-react';

export default function TermsOfServicePage() {
  const { siteName, siteEmail, siteUrl } = useSettingsStore();
  const resolvedSiteName = siteName?.trim() || 'الإيمان التعليمي';
  const contactEmail = siteEmail || '';
  const contactSiteUrl = siteUrl || 'https://alemancenter.com';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="شروط الاستخدام"
        current="شروط الاستخدام"
        eyebrow={resolvedSiteName}
        description="القواعد العامة لاستخدام الموقع والمحتوى التعليمي والخدمات المتاحة للمستخدمين."
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: 30 مايو 2026</p>
            <p>
              يرجى قراءة شروط وأحكام الاستخدام بعناية قبل استخدام موقع <strong>{resolvedSiteName}</strong> (<a href={contactSiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contactSiteUrl}</a>). باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. مقدمة</h2>
            <p>
              يهدف موقع {resolvedSiteName} إلى توفير محتوى تعليمي متكامل ومحدث يتماشى مع المنهاج الأردني. يتم تقسيم المحتوى إلى صفوف دراسية، مواد تعليمية، وأقسام مرفقات تهدف لدعم العملية التعليمية. يوفر الموقع أيضًا مقالات تعليمية وأخبار مخصصة للمعلمين والإدارة المدرسية.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. التعريفات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>&quot;الموقع&quot;:</strong> يشير إلى موقع {resolvedSiteName} (<a href={contactSiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contactSiteUrl}</a>).</li>
              <li><strong>&quot;الخدمة&quot;:</strong> تعني جميع المحتويات، المواد التعليمية، والمرفقات التي يوفرها الموقع.</li>
              <li><strong>&quot;المستخدم&quot;:</strong> أي شخص يصل إلى الموقع أو يستخدمه، سواء كان مديرًا، مشرفًا، أو عضوًا.</li>
              <li><strong>&quot;العضوية&quot;:</strong> تعني الحساب المسجل الذي يمكن للمستخدم الوصول من خلاله إلى ميزات محددة.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. الأدوار والصلاحيات</h2>
            <p>يقسم الموقع صلاحيات المستخدمين إلى ثلاث فئات:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>المدير:</strong> يتمتع بكامل الصلاحيات لإدارة المحتوى، المستخدمين، والإعدادات.</li>
              <li><strong>المشرف:</strong> يقتصر دوره على إدارة المقالات (إضافة، تعديل، حذف).</li>
              <li><strong>العضو:</strong> يمكنه التعليق على المقالات وتحميل المرفقات فقط.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. استخدام الخدمة</h2>
            <p>باستخدامك للموقع، فإنك توافق على:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>عدم استخدام الموقع لأي غرض غير قانوني أو ينتهك القوانين الأردنية.</li>
              <li>عدم محاولة اختراق أو تعطيل عمل الموقع.</li>
              <li>استخدام المحتوى المتاح فقط للأغراض التعليمية الشخصية وعدم إعادة توزيعه دون إذن مسبق.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. الملكية الفكرية</h2>
            <p>
              جميع المحتويات المنشورة على الموقع، بما في ذلك النصوص، الصور، والشعارات، هي ملك لموقع {resolvedSiteName} وتحميها قوانين حقوق الملكية الفكرية. يُحظر نسخ أو استخدام أي جزء من الموقع دون إذن كتابي مسبق.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. سياسة المرفقات</h2>
            <p>يحتوي الموقع على مرفقات تعليمية تشمل:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>الخطة الدراسية.</li>
              <li>أوراق العمل وكورسات المواد.</li>
              <li>الاختبارات الشهرية والنهائية.</li>
              <li>الكتب الرسمية ودليل المعلم.</li>
            </ul>
            <p className="mt-2">يُسمح بتنزيل المرفقات للاستخدام الشخصي فقط، ويحظر توزيعها أو استخدامها لأغراض تجارية.</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. حدود المسؤولية</h2>
            <p>لا يتحمل الموقع أي مسؤولية عن:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدامك للمحتوى أو المرفقات.</li>
              <li>أي معلومات غير دقيقة أو غير محدثة على الموقع.</li>
              <li>أي انقطاع في الخدمة بسبب عوامل خارجة عن إرادتنا.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. التعديلات</h2>
            <p>
              يحتفظ موقع {resolvedSiteName} بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعار المستخدمين بأي تغييرات من خلال تحديث هذه الصفحة. استمرارك في استخدام الموقع يعني قبولك للشروط المعدلة.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. القانون الحاكم</h2>
            <p>تُفسر هذه الشروط والأحكام وفقًا لقوانين المملكة الأردنية الهاشمية.</p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">
              إذا كانت لديك أي أسئلة أو اقتراحات، يسعدنا أن نتواصل معك عبر:
            </p>
            <div className="flex flex-col gap-4">
              {contactEmail && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {contactEmail}
                  </a>
                </div>
              )}
              {contactSiteUrl && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <a
                    href={contactSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    {contactSiteUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
