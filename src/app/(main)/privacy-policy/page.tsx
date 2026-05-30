'use client';

import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '16 مايو 2026';

export default function PrivacyPolicyPage() {
  const frontSettings = useFrontSettings();
  const { siteName: storeSiteName, siteEmail: storeSiteEmail, siteUrl: storeSiteUrl } = useSettingsStore();

  // useFrontSettings is the authoritative source (populated from backend API on every SSR).
  // The store is a fallback populated only after a settings save or localStorage rehydration.
  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() ||
    storeSiteName?.trim() ||
    'موقعنا التعليمي';

  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() ||
    storeSiteUrl?.trim() ||
    '';

  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() ||
    storeSiteEmail?.trim() ||
    '';

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

    // Fall back to our custom consent banner
    window.dispatchEvent(new CustomEvent('openCookieConsent'));
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="سياسة الخصوصية"
        current="سياسة الخصوصية"
        eyebrow={resolvedSiteName || undefined}
        description="نوضح هنا طريقة التعامل مع البيانات والخصوصية وملفات الارتباط بطريقة مباشرة وقابلة للقراءة."
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: {LAST_UPDATED}</p>
            <p>
              توضح سياسة الخصوصية هذه سياساتنا وإجراءاتنا بشأن جمع معلوماتك واستخدامها والإفصاح عنها عند
              استخدامك للخدمة، وتخبرك بحقوق الخصوصية الخاصة بك وكيف يحميك القانون.
            </p>
            <p>
              نحن نستخدم بياناتك الشخصية لتوفير الخدمة وتحسينها. باستخدام الخدمة، فإنك توافق على جمع
              المعلومات واستخدامها وفقًا لسياسة الخصوصية هذه.
            </p>

            {/* ── التفسير والتعريفات ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">التفسير والتعريفات</h2>
            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">التفسير</h3>
            <p>
              الكلمات التي يبدأ الحرف الأول منها بأحرف كبيرة لها معاني محددة وفقًا للشروط التالية. يجب أن
              يكون للتعريفات التالية نفس المعنى بغض النظر عما إذا كانت تظهر في صيغة المفرد أو الجمع.
            </p>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">التعاريف</h3>
            <p>لأغراض سياسة الخصوصية هذه:</p>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>الحساب</strong> يعني حسابًا فريدًا تم إنشاؤه لك للوصول إلى خدمتنا أو أجزاء من خدمتنا.
              </li>
              <li>
                <strong>الشركة</strong> (المشار إليها باسم &quot;الشركة&quot; أو &quot;نحن&quot; أو &quot;خاصتنا&quot; في هذه الاتفاقية) تشير إلى موقع{' '}
                <strong>{resolvedSiteName}</strong>.
              </li>
              <li>
                <strong>ملفات تعريف الارتباط</strong> هي ملفات صغيرة يتم وضعها على جهازك بواسطة موقع ويب، وتحتوي على تفاصيل سجل تصفحك.
              </li>
              <li>
                <strong>البلد</strong> يشير إلى: الأردن.
              </li>
              <li>
                <strong>الجهاز</strong> يعني أي جهاز يمكنه الوصول إلى الخدمة مثل الكمبيوتر أو الهاتف المحمول أو الجهاز اللوحي.
              </li>
              <li>
                <strong>البيانات الشخصية</strong> هي أي معلومات تتعلق بشخص محدد أو يمكن تحديده.
              </li>
              <li>
                <strong>الخدمة</strong> تشير إلى الموقع الإلكتروني.
              </li>
              <li>
                <strong>الموقع الإلكتروني</strong> يشير إلى موقع <strong>{resolvedSiteName}</strong>، الذي يمكن الوصول إليه من{' '}
                {resolvedSiteUrl ? (
                  <a
                    href={resolvedSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    {resolvedSiteUrl}
                    <ExternalLink className="inline h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link href="/" className="text-blue-600 hover:underline">
                    الصفحة الرئيسية
                  </Link>
                )}
              </li>
            </ul>

            {/* ── جمع البيانات ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">جمع بياناتك الشخصية واستخدامها</h2>
            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">أنواع البيانات التي يتم جمعها</h3>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">البيانات الشخصية</h4>
            <p>
              أثناء استخدام خدمتنا، قد نطلب منك تزويدنا ببعض المعلومات الشخصية التي يمكن استخدامها للاتصال بك
              أو تحديد هويتك. قد تتضمن المعلومات الشخصية القابلة للتحديد، على سبيل المثال لا الحصر:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>الاسم الأول والأخير</li>
              <li>البريد الإلكتروني</li>
              <li>رقم الهاتف</li>
              <li>بيانات الاستخدام</li>
            </ul>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">بيانات الاستخدام</h4>
            <p>يتم جمع بيانات الاستخدام تلقائيًا عند استخدام الخدمة.</p>
            <p>
              قد تتضمن بيانات الاستخدام معلومات مثل عنوان IP لجهازك، ونوع المتصفح وإصداره، وصفحات الخدمة
              التي تزورها، ووقت وتاريخ زيارتك، والوقت الذي تقضيه في تلك الصفحات، ومعرفات الأجهزة الفريدة.
            </p>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">تقنيات التتبع وملفات تعريف الارتباط</h4>
            <p>
              نحن نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتتبع النشاط على خدمتنا وتخزين معلومات
              معينة. لمعرفة المزيد، اطّلع على{' '}
              <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                سياسة ملفات تعريف الارتباط
              </Link>
              .
            </p>

            {/* ── استخدام البيانات ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">استخدام بياناتك الشخصية</h2>
            <p>يجوز للشركة استخدام البيانات الشخصية للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>لتوفير خدمتنا وصيانتها</strong>، بما في ذلك مراقبة استخدام خدمتنا.</li>
              <li><strong>لإدارة حسابك:</strong> لإدارة تسجيلك كمستخدم للخدمة.</li>
              <li><strong>للتواصل معك:</strong> عبر البريد الإلكتروني أو المكالمات الهاتفية أو الرسائل القصيرة.</li>
              <li><strong>لتزويدك بالأخبار:</strong> والعروض الخاصة والمعلومات العامة حول الخدمات.</li>
            </ul>

            {/* ── Google AdSense ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">الإعلانات وGoogle AdSense</h2>
            <p>
              نستخدم Google AdSense لعرض إعلانات على موقعنا. تستخدم Google وشركاؤها ملفات تعريف الارتباط
              أو تقنيات مشابهة لعرض الإعلانات وقياسها وتحسينها، وقد تعتمد هذه الإعلانات على زياراتك لهذا
              الموقع أو مواقع أخرى (الإعلانات المخصصة).
            </p>
            <p>
              يمكنك في أي وقت تعطيل تخصيص الإعلانات أو إدارة طريقة استخدام Google لبياناتك الإعلانية من
              خلال الروابط أدناه:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  إعدادات إعلانات Google
                </a>
              </li>
              <li>
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  كيف تستخدم Google البيانات عند استخدام مواقع شركائها
                </a>
              </li>
              <li>
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  كيف تستخدم Google ملفات تعريف الارتباط
                </a>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                  سياسة ملفات تعريف الارتباط الخاصة بنا
                </Link>
              </li>
            </ul>

            {/* زر إدارة الموافقة */}
            <div className="not-prose mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4">
              <Shield className="h-5 w-5 shrink-0 text-blue-600" />
              <p className="flex-1 text-sm text-slate-700">
                يمكنك مراجعة وتعديل موافقتك على ملفات تعريف الارتباط في أي وقت:
              </p>
              <button
                type="button"
                onClick={openConsentPreferences}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                إدارة تفضيلات الموافقة
              </button>
            </div>

            {/* ── حقوق المستخدمين (GDPR / CCPA) ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">حقوقك بشأن بياناتك الشخصية</h2>
            <p>
              وفقًا للائحة الأوروبية لحماية البيانات (GDPR) وقانون خصوصية المستهلك في كاليفورنيا (CCPA)
              وما يقابلهما من أنظمة حماية البيانات المعمول بها، يحق لك ممارسة الحقوق التالية:
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong>حق الوصول:</strong> يحق لك طلب نسخة من البيانات الشخصية التي نحتفظ بها عنك
                وكيفية معالجتها.
              </li>
              <li>
                <strong>حق التصحيح:</strong> يحق لك طلب تصحيح أي بيانات شخصية غير دقيقة أو غير مكتملة
                نحتفظ بها.
              </li>
              <li>
                <strong>حق الحذف (الحق في النسيان):</strong> يحق لك طلب حذف بياناتك الشخصية عندما لا
                تكون هناك ضرورة مشروعة للاحتفاظ بها.
              </li>
              <li>
                <strong>حق الاعتراض على المعالجة:</strong> يحق لك الاعتراض على معالجة بياناتك لأغراض
                التسويق المباشر أو الإعلانات المخصصة في أي وقت.
              </li>
              <li>
                <strong>حق تقييد المعالجة:</strong> يحق لك طلب تقييد معالجة بياناتك في حالات معينة،
                مثل الطعن في دقتها أو الاعتراض على استخدامها.
              </li>
              <li>
                <strong>حق نقل البيانات:</strong> يحق لك الحصول على بياناتك بصيغة منظمة وقابلة للقراءة
                آليًا، ونقلها إلى جهة أخرى عند الاقتضاء.
              </li>
              <li>
                <strong>حق سحب الموافقة:</strong> عند استناد المعالجة إلى موافقتك، يحق لك سحبها في أي
                وقت دون التأثير على مشروعية المعالجة السابقة.
              </li>
            </ul>
            <p>
              لممارسة أي من هذه الحقوق، يُرجى التواصل معنا عبر البريد الإلكتروني أو نموذج التواصل المتاح
              في الموقع. سنرد على طلبك خلال <strong>30 يومًا</strong> من تاريخ استلامه وفق ما تقتضيه الأنظمة
              المعمول بها.
            </p>
            <p>
              إذا كنت مقيمًا في منطقة الاتحاد الأوروبي ولم تجد ردًا كافيًا، يحق لك تقديم شكوى إلى هيئة
              حماية البيانات المختصة في بلدك.
            </p>

            {/* ── أمان البيانات ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">أمان بياناتك الشخصية</h2>
            <p>
              أمان بياناتك الشخصية مهم بالنسبة لنا، ولكن تذكر أنه لا توجد طريقة نقل عبر الإنترنت أو طريقة
              تخزين إلكتروني آمنة بنسبة 100%. نسعى جاهدين لاستخدام وسائل مقبولة تجاريًا لحماية بياناتك
              الشخصية.
            </p>

            {/* ── التغييرات ── */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">التغييرات على سياسة الخصوصية هذه</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنعلمك بأي تغييرات من خلال نشر سياسة
              الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ &quot;آخر تحديث&quot; في أعلاها.
            </p>
          </div>

          {/* ── التواصل ── */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">
              إذا كانت لديك أي أسئلة أو اقتراحات حول سياسة الخصوصية، يسعدنا التواصل معك عبر:
            </p>
            <div className="flex flex-col gap-4">
              {resolvedContactEmail ? (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a
                    href={`mailto:${resolvedContactEmail}`}
                    className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                  >
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
                  <a
                    href={resolvedSiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 hover:text-blue-600 transition-colors font-medium"
                  >
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
