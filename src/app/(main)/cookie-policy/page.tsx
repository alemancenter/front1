'use client';

import { useSettingsStore } from '@/store/useStore';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe } from 'lucide-react';

export default function CookiePolicyPage() {
  const { siteName, siteEmail, siteUrl } = useSettingsStore();
  const contactEmail = siteEmail || '';
  const contactSiteUrl = siteUrl || '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="سياسة ملفات تعريف الارتباط"
        current="سياسة الكوكيز"
        eyebrow={siteName || undefined}
        description="تفاصيل استخدام ملفات الارتباط والخدمات الخارجية وخيارات التحكم المتاحة للزائر."
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: 18 يناير 2025</p>
            <p>
              توضح سياسة ملفات تعريف الارتباط هذه كيفية استخدام موقع <strong>{siteName || 'الايمان التعليمي'}</strong> (<a href={contactSiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{contactSiteUrl}</a>) ملفات تعريف الارتباط (Cookies) لتحسين تجربة المستخدم وتقديم خدمات مخصصة.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. ما هي ملفات تعريف الارتباط؟</h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا. تُستخدم هذه الملفات لتذكر تفضيلاتك وتحسين تجربتك على الموقع.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. كيفية استخدامنا لملفات تعريف الارتباط</h2>
            <p>نستخدم ملفات تعريف الارتباط للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>ملفات تعريف الارتباط الضرورية:</strong> تُستخدم لتمكين الميزات الأساسية مثل التنقل في الموقع والوصول الآمن.</li>
              <li><strong>ملفات تعريف الارتباط التحليلية:</strong> تساعدنا في فهم كيفية استخدام الزوار للموقع لتحسين أدائه.</li>
              <li><strong>ملفات تعريف الارتباط الوظيفية:</strong> تُستخدم لتذكر تفضيلاتك مثل اللغة أو الإعدادات المخصصة.</li>
              <li><strong>ملفات تعريف الارتباط الإعلانية:</strong> تُستخدم لعرض الإعلانات ذات الصلة بناءً على اهتماماتك.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. أنواع ملفات تعريف الارتباط التي نستخدمها</h2>
            <p>يمكن تصنيف ملفات تعريف الارتباط التي نستخدمها إلى نوعين:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>ملفات تعريف الارتباط الدائمة:</strong> تظل هذه الملفات مخزنة على جهازك حتى تنتهي صلاحيتها أو تقوم بحذفها يدويًا.</li>
              <li><strong>ملفات تعريف الارتباط المؤقتة (الجلسات):</strong> تُحذف هذه الملفات تلقائيًا عند إغلاق متصفحك.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. التحكم في ملفات تعريف الارتباط</h2>
            <p>
              يمكنك التحكم في استخدام ملفات تعريف الارتباط أو إيقافها بالكامل من خلال إعدادات متصفحك. ومع ذلك، قد يؤدي ذلك إلى عدم تمكنك من استخدام بعض ميزات الموقع.
            </p>
            <p>للتحكم في ملفات تعريف الارتباط، اتبع الإرشادات الموجودة في إعدادات متصفحك:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>لـ Google Chrome: <a href="https://support.google.com/chrome/answer/95647?hl=ar" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">إرشادات كروم</a></li>
              <li>لـ Mozilla Firefox: <a href="https://support.mozilla.org/ar/kb/حظر-ملفات-تعريف-الارتباط" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">إرشادات فايرفوكس</a></li>
              <li>لـ Safari: <a href="https://support.apple.com/ar-sa/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">إرشادات سفاري</a></li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. ملفات تعريف الارتباط الخارجية</h2>
            <p className="mb-4">
              قد نستخدم خدمات خارجية مثل Google Analytics لتحليل أداء الموقع، وGoogle AdSense لعرض الإعلانات.
              هذه الخدمات قد تضع ملفات تعريف ارتباط خاصة بها لجمع البيانات حول استخدامك للموقع. نحن لا نتحكم في ملفات تعريف الارتباط التي يتم وضعها بواسطة الجهات الخارجية.
            </p>
            <p className="mb-2">
              <strong>Google AdSense:</strong> يستخدم ملف تعريف ارتباط DART لعرض إعلانات مخصصة بناءً على زيارات
              المستخدم السابقة لهذا الموقع ومواقع أخرى. يمكنك إلغاء الاشتراك عبر:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4 mr-4">
              <li>
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  إعدادات إعلانات Google
                </a>
              </li>
              <li>
                <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  aboutads.info
                </a>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. تحديث سياسة ملفات تعريف الارتباط</h2>
            <p>
              قد يتم تحديث سياسة ملفات تعريف الارتباط من وقت لآخر لتلبية المتطلبات القانونية أو التكنولوجية. يُنصح بمراجعة هذه الصفحة بانتظام للحصول على أحدث المعلومات.
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
