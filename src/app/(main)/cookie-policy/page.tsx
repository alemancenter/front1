'use client';

import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe, Shield } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '16 مايو 2026';

export default function CookiePolicyPage() {
  const frontSettings = useFrontSettings();
  const { siteName: storeSiteName, siteEmail: storeSiteEmail, siteUrl: storeSiteUrl } = useSettingsStore();

  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() || storeSiteName?.trim() || 'موقعنا التعليمي';
  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() || storeSiteUrl?.trim() || '';
  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() || storeSiteEmail?.trim() || '';

  const openConsentPreferences = () => {
    const win = window as Window & {
      ckyShowPreferenceCenter?: () => void;
      ckyShowConsent?: () => void;
      CookieYes?: { renew?: () => void; show?: () => void };
    };
    if (typeof win.ckyShowPreferenceCenter === 'function') { win.ckyShowPreferenceCenter(); return; }
    if (typeof win.ckyShowConsent === 'function') { win.ckyShowConsent(); return; }
    if (typeof win.CookieYes?.renew === 'function') { win.CookieYes.renew(); return; }
    if (typeof win.CookieYes?.show === 'function') { win.CookieYes.show(); return; }
    window.dispatchEvent(new CustomEvent('openCookieConsent'));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="سياسة ملفات تعريف الارتباط"
        current="سياسة الكوكيز"
        eyebrow={resolvedSiteName || undefined}
        description="تفاصيل استخدام ملفات الارتباط والخدمات الخارجية وخيارات التحكم المتاحة للزائر."
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: {LAST_UPDATED}</p>
            <p>
              توضح سياسة ملفات تعريف الارتباط هذه كيفية استخدام موقع <strong>{resolvedSiteName}</strong>
              {resolvedSiteUrl && (
                <> (<a href={resolvedSiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{resolvedSiteUrl}</a>)</>
              )}{' '}
              ملفات تعريف الارتباط (Cookies) وتقنيات التتبع المماثلة لتحسين تجربة المستخدم وتقديم خدمات مخصصة.
            </p>

            {/* 1 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. ما هي ملفات تعريف الارتباط؟</h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا. تُستخدم هذه
              الملفات لتذكر تفضيلاتك وتحسين تجربتك وتحليل أنماط الاستخدام. بالإضافة إلى ملفات تعريف الارتباط،
              قد نستخدم تقنيات مشابهة مثل Web Storage و Pixel Tags.
            </p>

            {/* 2 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. أنواع ملفات تعريف الارتباط التي نستخدمها</h2>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">أ. حسب المدة الزمنية</h3>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>ملفات الجلسة (Session Cookies):</strong> تُحذف تلقائيًا عند إغلاق المتصفح.</li>
              <li><strong>الملفات الدائمة (Persistent Cookies):</strong> تظل مخزنة حتى انتهاء صلاحيتها أو حذفها يدويًا.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">ب. حسب الغرض</h3>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>الضرورية (Always Active):</strong> مطلوبة لعمل الموقع الأساسي كالمصادقة وحفظ
                جلسة تسجيل الدخول وإعدادات الخصوصية. لا يمكن تعطيلها.
              </li>
              <li>
                <strong>التحليلية / الإحصائية:</strong> تجمع معلومات مجهولة الهوية حول كيفية استخدام
                الزوار للموقع (عدد الزيارات، الصفحات الأكثر زيارةً، مدة الجلسة). المزود: Google Analytics.
              </li>
              <li>
                <strong>الإعلانية:</strong> تُستخدم لعرض إعلانات مخصصة بناءً على اهتماماتك وسلوك
                التصفح. المزود: Google AdSense (ملف تعريف DART).
              </li>
              <li>
                <strong>الوظيفية:</strong> تتذكر تفضيلاتك مثل اللغة والمنطقة والإعدادات المخصصة.
              </li>
              <li>
                <strong>الأداء:</strong> تُساعد في قياس أوقات التحميل وتحسين استجابة الموقع.
              </li>
            </ul>

            {/* 3 — Google Consent Mode v2 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. موافقة الكوكيز وضوابط الخصوصية</h2>
            <p>
              يطبّق موقعنا <strong>Google Consent Mode v2</strong> الذي يضبط جميع إشارات الموافقة على
              &quot;مرفوض&quot; افتراضيًا قبل تحميل أي أداة تسويقية. لا تُجمع بيانات إعلانية أو تحليلية إلا
              بعد حصول الموقع على موافقة صريحة منك.
            </p>
            <p>
              عند زيارتك الأولى يظهر بانر للموافقة يتيح لك اختيار فئات الكوكيز التي توافق عليها. يمكنك
              في أي وقت مراجعة اختياراتك أو تغييرها:
            </p>
            <div className="not-prose my-4 flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
              <Shield className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="flex-1 text-sm text-slate-700">
                إدارة تفضيلات الموافقة على ملفات تعريف الارتباط:
              </p>
              <button
                type="button"
                onClick={openConsentPreferences}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                إدارة الموافقة
              </button>
            </div>

            {/* 4 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. الخدمات الخارجية وملفاتها</h2>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google Analytics</h3>
            <p>
              نستخدم Google Analytics لتحليل أداء الموقع. تجمع هذه الخدمة بيانات مجهولة الهوية عن
              أنماط الاستخدام. يمكن إلغاء التتبع عبر:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">إضافة إلغاء الاشتراك في Google Analytics</a></li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google AdSense</h3>
            <p>
              نستخدم Google AdSense لعرض إعلانات. تستخدم Google ملف تعريف DART لعرض إعلانات
              مخصصة بناءً على زياراتك السابقة. يمكن إلغاء الاشتراك عبر:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li><a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">إعدادات إعلانات Google</a></li>
              <li><a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aboutads.info (إلغاء اشتراك موحد)</a></li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google Tag Manager</h3>
            <p>
              نستخدم Google Tag Manager لإدارة الأكواد البرمجية. GTM بحد ذاته لا يجمع بيانات شخصية
              لكنه يتحكم في تحميل الأدوات الأخرى وفق إعدادات الموافقة.
            </p>

            {/* 5 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. التحكم في ملفات تعريف الارتباط عبر المتصفح</h2>
            <p>
              يمكنك التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات متصفحك. لاحظ أن تعطيل
              بعض الملفات قد يؤثر على وظائف الموقع.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><a href="https://support.google.com/chrome/answer/95647?hl=ar" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/ar/kb/حظر-ملفات-تعريف-الارتباط" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/ar-sa/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/ar-sa/windows/حذف-ملفات-تعريف-الارتباط-وإدارتها-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            </ul>

            {/* 6 */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. تحديثات سياسة الكوكيز</h2>
            <p>
              قد يتم تحديث هذه السياسة من وقت لآخر لتعكس التغييرات في الخدمات المستخدمة أو المتطلبات
              القانونية. يُنصح بمراجعة هذه الصفحة بانتظام. تاريخ آخر تحديث مذكور في أعلى الصفحة.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">لأي استفسار حول سياسة الكوكيز:</p>
            <div className="flex flex-col gap-4">
              {resolvedContactEmail && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a href={`mailto:${resolvedContactEmail}`} className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    {resolvedContactEmail}
                  </a>
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
              {!resolvedContactEmail && !resolvedSiteUrl && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Link href="/contact-us" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    نموذج التواصل
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
