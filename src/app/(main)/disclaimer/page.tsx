'use client';

import { useSettingsStore } from '@/store/useStore';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe } from 'lucide-react';

export default function DisclaimerPage() {
  const { siteName, siteEmail, siteUrl } = useSettingsStore();
  const contactEmail = siteEmail || '';
  const contactSiteUrl = siteUrl || '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="إخلاء المسؤولية"
        current="إخلاء المسؤولية"
        eyebrow={siteName || undefined}
        description="تنبيه واضح حول حدود المسؤولية ودقة المحتوى وطريقة استخدام المواد التعليمية."
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: 18 يناير 2025</p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. الغرض من الموقع</h2>
            <p>
              موقع <strong>{siteName || 'الايمان التعليمي'}</strong> (<a href={contactSiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contactSiteUrl}</a>) هو منصة تعليمية تهدف إلى تقديم محتوى تعليمي محدث ومصمم لدعم العملية التعليمية وفقًا للمنهاج الأردني. جميع المعلومات والمحتويات المقدمة على هذا الموقع هي لأغراض تعليمية وإرشادية فقط.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. دقة المعلومات</h2>
            <p>
              نحن نسعى لضمان دقة وصحة جميع المعلومات المقدمة على الموقع. ومع ذلك، لا نضمن أن تكون جميع المواد والمحتويات خالية تمامًا من الأخطاء أو محدثة بشكل كامل. يتحمل المستخدم مسؤولية التحقق من المعلومات قبل الاعتماد عليها.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. حدود المسؤولية</h2>
            <p>موقع {siteName || 'الايمان التعليمي'} غير مسؤول عن:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>أي أضرار مباشرة أو غير مباشرة قد تنجم عن استخدامك للموقع أو الاعتماد على محتوياته.</li>
              <li>أي خسائر أو أضرار تتعلق بتنزيل المرفقات أو المستندات التعليمية من الموقع.</li>
              <li>أي انقطاع في الخدمة بسبب مشكلات تقنية أو خارجية.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. الروابط الخارجية</h2>
            <p>
              قد يحتوي الموقع على روابط لمواقع إلكترونية خارجية. هذه الروابط توفرها موقع {siteName || 'الايمان التعليمي'} لتسهيل الوصول إلى مصادر إضافية. نحن غير مسؤولين عن محتوى أو سياسات الخصوصية الخاصة بهذه المواقع الخارجية.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. الاستخدام الشخصي وغير التجاري</h2>
            <p>
              جميع المحتويات والمواد التعليمية المقدمة على الموقع مصممة للاستخدام الشخصي وغير التجاري. يُحظر نسخ أو إعادة توزيع أي محتوى دون إذن كتابي مسبق.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. تحديث إخلاء المسؤولية</h2>
            <p>
              قد يتم تحديث هذه الصفحة من وقت لآخر لتعكس تغييرات في السياسات أو اللوائح. يُنصح المستخدمون بمراجعة هذه الصفحة بانتظام للتأكد من فهمهم لأحدث النسخ.
            </p>
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

