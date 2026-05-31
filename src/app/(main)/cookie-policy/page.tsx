'use client';

import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe, Shield, ExternalLink } from 'lucide-react';
// FIX 1: Added Link import — internal navigation must use Next.js <Link>
// for proper client-side routing and to avoid full page reloads.
import Link from 'next/link';

// FIX 2: Date updated to 30 مايو 2026.
 
const LAST_UPDATED = '30 مايو 2026';

// SSR-safe fallback — the Zustand store is never hydrated on the server,
// so storeSiteUrl is always '' during SSR. Without this constant the server
// renders an empty href which Markdown serialises as [](<>) in the HTML
// seen by Google / AdSense reviewers.
const FALLBACK_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://alemancenter.com';

// FIX 3: Hardcoded fallback contact email.
// When the API returns no contact_email / site_email the "التواصل معنا"
// section renders with no email at all — the Mail icon disappears entirely.
// AdSense requires a visible, working contact channel on every page that
// carries ads. The fallback guarantees it is always shown.
const FALLBACK_CONTACT_EMAIL = 'info@alemancenter.com';

export default function CookiePolicyPage() {
  const frontSettings = useFrontSettings();
  const {
    siteName: storeSiteName,
    siteEmail: storeSiteEmail,
    siteUrl: storeSiteUrl,
  } = useSettingsStore();

  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() ||
    storeSiteName?.trim() ||
    'موقعنا التعليمي';

  // resolvedSiteUrl — always has a value (SSR + CSR safe)
  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() ||
    storeSiteUrl?.trim() ||
    FALLBACK_SITE_URL;

  // FIX 3 applied: falls back to FALLBACK_CONTACT_EMAIL instead of ''
  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() ||
    storeSiteEmail?.trim() ||
    FALLBACK_CONTACT_EMAIL;

  const openConsentPreferences = () => {
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

            {/* FIX 4: Added ExternalLink icon next to the site URL anchor —
                consistent with privacy-policy/page.tsx and signals to
                AdSense reviewers that this is a real, clickable external link
                (not dead text that happens to look like a URL). */}
            <p>
              توضح سياسة ملفات تعريف الارتباط هذه كيفية استخدام موقع{' '}
              <strong>{resolvedSiteName}</strong>{' '}
              (
              <a
                href={resolvedSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline"
              >
                {resolvedSiteUrl}
                <ExternalLink className="inline h-3.5 w-3.5" />
              </a>
              ){' '}
              ملفات تعريف الارتباط (Cookies) وتقنيات التتبع المماثلة لتحسين تجربة المستخدم وتقديم خدمات مخصصة.
            </p>

            {/* 1 ── ما هي ملفات تعريف الارتباط */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. ما هي ملفات تعريف الارتباط؟</h2>
            <p>
              ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا. تُستخدم هذه
              الملفات لتذكر تفضيلاتك وتحسين تجربتك وتحليل أنماط الاستخدام. بالإضافة إلى ملفات تعريف الارتباط،
              قد نستخدم تقنيات مشابهة مثل Web Storage و Pixel Tags.
            </p>

            {/* 2 ── أنواع ملفات تعريف الارتباط */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. أنواع ملفات تعريف الارتباط التي نستخدمها</h2>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">أ. حسب المدة الزمنية</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>ملفات الجلسة (Session Cookies):</strong> تُحذف تلقائيًا عند إغلاق المتصفح.
              </li>
              <li>
                <strong>الملفات الدائمة (Persistent Cookies):</strong> تظل مخزنة حتى انتهاء صلاحيتها أو حذفها يدويًا.
              </li>
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

            {/* 3 ── Consent Mode v2 */}
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
              <Shield className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
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

            {/* 4 ── الخدمات الخارجية */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. الخدمات الخارجية وملفاتها</h2>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google Analytics</h3>
            <p>
              نستخدم Google Analytics لتحليل أداء الموقع. تجمع هذه الخدمة بيانات مجهولة الهوية عن
              أنماط الاستخدام. يمكن إلغاء التتبع عبر:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  إضافة إلغاء الاشتراك في Google Analytics
                </a>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google AdSense</h3>
            <p>
              نستخدم Google AdSense لعرض إعلانات. تستخدم Google ملف تعريف DART لعرض إعلانات
              مخصصة بناءً على زياراتك السابقة. يمكن إلغاء الاشتراك عبر:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  إعدادات إعلانات Google
                </a>
              </li>
              <li>
                <a
                  href="https://optout.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  aboutads.info (إلغاء اشتراك موحد)
                </a>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">Google Tag Manager</h3>
            <p>
              نستخدم Google Tag Manager لإدارة الأكواد البرمجية. GTM بحد ذاته لا يجمع بيانات شخصية
              لكنه يتحكم في تحميل الأدوات الأخرى وفق إعدادات الموافقة.
            </p>

            {/* 5 ── التحكم عبر المتصفح */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. التحكم في ملفات تعريف الارتباط عبر المتصفح</h2>
            <p>
              يمكنك التحكم في ملفات تعريف الارتباط أو حذفها من خلال إعدادات متصفحك. لاحظ أن تعطيل
              بعض الملفات قد يؤثر على وظائف الموقع.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647?hl=ar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/ar/kb/حظر-ملفات-تعريف-الارتباط"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/ar-sa/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Apple Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/ar-sa/windows/حذف-ملفات-تعريف-الارتباط-وإدارتها-168dab11-0753-043d-7c16-ede5947fc64d"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>

            {/* 6 ── التحديثات */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. تحديثات سياسة الكوكيز</h2>
            <p>
              قد يتم تحديث هذه السياسة من وقت لآخر لتعكس التغييرات في الخدمات المستخدمة أو المتطلبات
              القانونية. يُنصح بمراجعة هذه الصفحة بانتظام. تاريخ آخر تحديث مذكور في أعلى الصفحة.
            </p>
          </div>

          {/* ── التواصل ── */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">لأي استفسار حول سياسة الكوكيز:</p>
            <div className="flex flex-col gap-4">

              {/* FIX 3: resolvedContactEmail always has a value (FALLBACK_CONTACT_EMAIL).
                  The old code used {resolvedContactEmail && (...)} which hid the email
                  block entirely when the API returned empty strings — leaving the
                  "التواصل معنا" section with only a website URL, which is not a
                  sufficient contact channel for AdSense policy compliance. */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <a
                  href={`mailto:${resolvedContactEmail}`}
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {resolvedContactEmail}
                </a>
              </div>

              {/* FIX 1: internal link to contact-us page added alongside the site URL.
                  Gives AdSense reviewers a second, clearly labelled contact channel. */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <Link
                  href="/contact-us"
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  نموذج التواصل
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Globe className="w-5 h-5" aria-hidden="true" />
                </div>
                <a
                  href={resolvedSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {resolvedSiteUrl}
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
