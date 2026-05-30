'use client';

import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '16 مايو 2026';

export default function DisclaimerPage() {
  const frontSettings = useFrontSettings();
  const { siteName: storeSiteName, siteEmail: storeSiteEmail, siteUrl: storeSiteUrl } = useSettingsStore();

  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() || storeSiteName?.trim() || 'موقعنا التعليمي';
  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() || storeSiteUrl?.trim() || '';
  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() || storeSiteEmail?.trim() || '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="إخلاء المسؤولية"
        current="إخلاء المسؤولية"
        eyebrow={resolvedSiteName || undefined}
        description="تنبيه واضح حول حدود المسؤولية ودقة المحتوى وطريقة استخدام المواد التعليمية."
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: {LAST_UPDATED}</p>

            {/* 1 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. الغرض من الموقع</h2>
            <p>
              موقع <strong>{resolvedSiteName}</strong>
              {resolvedSiteUrl && (
                <> (<a href={resolvedSiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{resolvedSiteUrl}</a>)</>
              )}{' '}
              هو منصة تعليمية تهدف إلى تقديم محتوى تعليمي محدث ومصمم لدعم العملية التعليمية وفقًا للمنهاج
              الأردني. جميع المعلومات والمحتويات المقدمة على هذا الموقع هي لأغراض تعليمية وإرشادية فقط.
            </p>

            {/* 2 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. دقة المعلومات</h2>
            <p>
              نحن نسعى لضمان دقة وصحة جميع المعلومات المقدمة على الموقع. ومع ذلك، لا نضمن أن تكون جميع
              المواد والمحتويات خالية تمامًا من الأخطاء أو محدثة بشكل كامل. يتحمل المستخدم مسؤولية التحقق
              من المعلومات قبل الاعتماد عليها.
            </p>

            {/* 3 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. حدود المسؤولية</h2>
            <p>موقع {resolvedSiteName} غير مسؤول عن:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>أي أضرار مباشرة أو غير مباشرة قد تنجم عن استخدامك للموقع أو الاعتماد على محتوياته.</li>
              <li>أي خسائر أو أضرار تتعلق بتنزيل المرفقات أو المستندات التعليمية من الموقع.</li>
              <li>أي انقطاع في الخدمة بسبب مشكلات تقنية أو خارجية.</li>
            </ul>

            {/* 4 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. الروابط الخارجية</h2>
            <p>
              قد يحتوي الموقع على روابط لمواقع إلكترونية خارجية لتسهيل الوصول إلى مصادر إضافية. نحن غير
              مسؤولين عن محتوى أو سياسات الخصوصية الخاصة بهذه المواقع.
            </p>

            {/* 5 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. الاستخدام الشخصي وغير التجاري</h2>
            <p>
              جميع المحتويات والمواد التعليمية المقدمة على الموقع مصممة للاستخدام الشخصي وغير التجاري.
              يُحظر نسخ أو إعادة توزيع أي محتوى دون إذن كتابي مسبق.
            </p>

            {/* 6 — حقوق الملكية الفكرية */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. حقوق الملكية الفكرية والمحتوى المنشور</h2>
            <p>
              يحترم موقع <strong>{resolvedSiteName}</strong> حقوق الملكية الفكرية ويلتزم بالقوانين
              المعمول بها. يتضمن الموقع مواد تعليمية متنوعة؛ ونلتزم بالتحقق من ملكية هذه المواد أو
              الحصول على تصريح مناسب لنشرها. يقع على عاتق الناشر الأول مسؤولية التأكد من صحة ملكيته للمحتوى
              قبل رفعه.
            </p>
            <p>
              تنطبق على المحتوى المنشور السياسة التالية:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>المواد الصادرة رسميًا عن وزارة التربية والتعليم الأردنية تُعامَل كمحتوى عام متاح للاستخدام التعليمي.</li>
              <li>المحتوى المقدَّم من معلمين أو مستخدمين يخضع لمراجعة وفق سياسة النشر الداخلية للموقع.</li>
              <li>أي محتوى محمي بحقوق ملكية يُبلَّغ عنه يُراجَع ويُزال خلال المدة القانونية المحددة.</li>
            </ul>

            {/* 7 — DMCA */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. إجراءات إشعار DMCA وإزالة المحتوى</h2>
            <p>
              إذا كنت تعتقد أن أيًّا من المحتويات المنشورة على موقعنا ينتهك حقوق الملكية الفكرية الخاصة
              بك، يُرجى إرسال إشعار رسمي يتضمن العناصر التالية:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>اسمك الكامل وبيانات التواصل (البريد الإلكتروني ورقم الهاتف).</li>
              <li>وصف واضح للعمل المحمي بحقوق الملكية الذي تدّعي انتهاكه.</li>
              <li>الرابط المحدد (URL) للمحتوى الذي تطلب إزالته.</li>
              <li>
                بيان بأنك تؤمن بحسن نية بأن الاستخدام المعترَض عليه غير مرخَّص من صاحب حق الملكية
                أو وكيله أو القانون.
              </li>
              <li>بيان بأن المعلومات الواردة في إشعارك دقيقة وأنك صاحب الحق أو مفوَّض بالتصرف نيابةً عنه.</li>
            </ul>

            <div className="not-prose my-5 flex flex-wrap items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="flex-1 text-sm text-amber-900">
                <p className="font-semibold mb-1">خطوات تقديم الإشعار:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>أرسل الإشعار بالتفاصيل أعلاه إلى بريدنا الإلكتروني.</li>
                  <li>سنرسل تأكيد الاستلام خلال <strong>48 ساعة</strong>.</li>
                  <li>سيُراجَع الإشعار خلال <strong>10 أيام عمل</strong> ويُتخذ القرار المناسب.</li>
                  <li>في حال صحة الإشعار يُزال المحتوى فور التحقق وتُبلَّغ الجهة المعنية.</li>
                </ol>
              </div>
            </div>

            {resolvedContactEmail && (
              <p>
                يُرجى إرسال إشعار DMCA إلى:{' '}
                <a href={`mailto:${resolvedContactEmail}`} className="text-blue-600 hover:underline font-medium">
                  {resolvedContactEmail}
                </a>
              </p>
            )}
            {!resolvedContactEmail && (
              <p>
                يُرجى إرسال إشعار DMCA عبر{' '}
                <Link href="/contact-us" className="text-blue-600 hover:underline font-medium">
                  نموذج التواصل
                </Link>
                .
              </p>
            )}

            {/* 8 — سياسة النشر */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. سياسة التحقق من ملكية الملفات قبل النشر</h2>
            <p>يلتزم الموقع قبل نشر أي ملف أو مادة تعليمية بمراجعة المصدر والتحقق من أحد المعايير التالية:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>صدور المادة رسميًا عن جهة حكومية أو مؤسسة تعليمية معتمدة.</li>
              <li>حصول الناشر على إذن صريح من صاحب الحق بالنشر على المنصة.</li>
              <li>خضوع المادة لترخيص مفتوح (Creative Commons أو ما يعادله) يُجيز إعادة النشر للأغراض التعليمية.</li>
              <li>إنتاج المادة بالكامل من قِبل فريق الموقع أو ناشريه المعتمدين.</li>
            </ul>
            <p>
              المحتوى المخالف لهذه المعايير يُزال فور اكتشافه أو الإبلاغ عنه، ويحتفظ الموقع بحق تعليق
              حساب أي ناشر يُخالف هذه السياسة.
            </p>

            {/* 9 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. تحديث إخلاء المسؤولية</h2>
            <p>
              قد يتم تحديث هذه الصفحة من وقت لآخر لتعكس تغييرات في السياسات أو اللوائح. يُنصح المستخدمون
              بمراجعتها بانتظام للتأكد من فهمهم لأحدث النسخ.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">لأي استفسار أو إبلاغ عن انتهاك لحقوق الملكية:</p>
            <div className="flex flex-col gap-4">
              {resolvedContactEmail ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a href={`mailto:${resolvedContactEmail}`} className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    {resolvedContactEmail}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Link href="/contact-us" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    نموذج التواصل
                  </Link>
                </div>
              )}
              {resolvedSiteUrl && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <a href={resolvedSiteUrl} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    {resolvedSiteUrl}
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
