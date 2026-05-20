'use client';

import { useSettingsStore } from '@/store/useStore';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import { Mail, Globe } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '16 مايو 2026';

export default function PrivacyPolicyPage() {
  const { siteName, siteEmail, siteUrl } = useSettingsStore();
  const contactEmail = siteEmail || '';
  const contactSiteUrl = siteUrl || '';

  const openConsentPreferences = () => {
    const win = window as Window & {
      ckyShowPreferenceCenter?: () => void;
      ckyShowConsent?: () => void;
      CookieYes?: {
        renew?: () => void;
        show?: () => void;
      };
    };

    if (typeof win.ckyShowPreferenceCenter === 'function') {
      win.ckyShowPreferenceCenter();
      return;
    }
    if (typeof win.ckyShowConsent === 'function') {
      win.ckyShowConsent();
      return;
    }
    if (typeof win.CookieYes?.renew === 'function') {
      win.CookieYes.renew();
      return;
    }
    if (typeof win.CookieYes?.show === 'function') {
      win.CookieYes.show();
      return;
    }

    window.location.href = '/cookie-policy';
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="سياسة الخصوصية"
        current="سياسة الخصوصية"
        eyebrow={siteName || undefined}
        description="نوضح هنا طريقة التعامل مع البيانات والخصوصية وملفات الارتباط بطريقة مباشرة وقابلة للقراءة."
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="prose max-w-none text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-slate-900 prose-a:font-bold prose-a:text-blue-700 prose-ul:leading-8 md:text-[17px]">
            <p className="lead">آخر تحديث: {LAST_UPDATED}</p>
            <p>
              توضح سياسة الخصوصية هذه سياساتنا وإجراءاتنا بشأن جمع معلوماتك واستخدامها والإفصاح عنها عند
              استخدامك للخدمة وتخبرك بحقوق الخصوصية الخاصة بك وكيف يحميك القانون.
            </p>
            <p>
              نحن نستخدم بياناتك الشخصية لتوفير الخدمة وتحسينها. باستخدام الخدمة، فإنك توافق على جمع
              المعلومات واستخدامها وفقًا لسياسة الخصوصية هذه.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">التفسير والتعريفات</h2>
            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">التفسير</h3>
            <p>
              الكلمات التي يبدأ الحرف الأول منها بأحرف كبيرة لها معاني محددة وفقًا للشروط التالية. يجب
              أن يكون للتعريفات التالية نفس المعنى بغض النظر عما إذا كانت تظهر في صيغة المفرد أو الجمع.
            </p>

            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">التعاريف</h3>
            <p>لأغراض سياسة الخصوصية هذه:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>الحساب</strong> يعني حسابًا فريدًا تم إنشاؤه لك للوصول إلى خدمتنا أو أجزاء من
                خدمتنا.
              </li>
              <li>
                <strong>الشركة</strong> (المشار إليها باسم &quot;الشركة&quot; أو &quot;نحن&quot; أو &quot;خاصتنا&quot; في هذه
                الاتفاقية) تشير إلى موقع {siteName || 'الايمان التعليمي'}.
              </li>
              <li>
                <strong>ملفات تعريف الارتباط</strong> هي ملفات صغيرة يتم وضعها على جهاز الكمبيوتر الخاص بك
                أو الجهاز المحمول أو أي جهاز آخر بواسطة موقع ويب، وتحتوي على تفاصيل سجل تصفحك على هذا
                الموقع من بين العديد من استخداماته.
              </li>
              <li>
                <strong>البلد</strong> يشير إلى: الأردن
              </li>
              <li>
                <strong>الجهاز</strong> يعني أي جهاز يمكنه الوصول إلى الخدمة مثل الكمبيوتر أو الهاتف
                المحمول أو الجهاز الرقمي الكمبيوتر اللوحي.
              </li>
              <li>
                <strong>البيانات الشخصية</strong> هي أي معلومات تتعلق بشخص محدد أو يمكن تحديده.
              </li>
              <li>
                <strong>الخدمة</strong> تشير إلى الموقع الإلكتروني.
              </li>
              <li>
                <strong>الموقع الإلكتروني</strong> يشير إلى موقع {siteName || 'الايمان التعليمي'}، الذي يمكن الوصول
                إليه من{' '}
                <a href={contactSiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {contactSiteUrl}
                </a>
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">جمع بياناتك الشخصية واستخدامها</h2>
            <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3">أنواع البيانات التي يتم جمعها</h3>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">البيانات الشخصية</h4>
            <p>
              أثناء استخدام خدمتنا، قد نطلب منك تزويدنا ببعض المعلومات الشخصية التي يمكن استخدامها للاتصال
              بك أو تحديد هويتك. قد تتضمن المعلومات الشخصية القابلة للتحديد، على سبيل المثال لا الحصر:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>الاسم الأول والأخير</li>
              <li>رقم الهاتف</li>
              <li>بيانات الاستخدام</li>
            </ul>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">بيانات الاستخدام</h4>
            <p>يتم جمع بيانات الاستخدام تلقائيًا عند استخدام الخدمة.</p>
            <p>
              قد تتضمن بيانات الاستخدام معلومات مثل عنوان بروتوكول الإنترنت الخاص بجهازك (على سبيل المثال،
              عنوان IP)، ونوع المتصفح، وإصدار المتصفح، وصفحات الخدمة التي تزورها، ووقت وتاريخ زيارتك،
              والوقت الذي تقضيه في تلك الصفحات، ومعرفات الأجهزة الفريدة وغيرها من بيانات التشخيص.
            </p>

            <h4 className="text-lg font-bold text-slate-800 mt-4 mb-2">تقنيات التتبع وملفات تعريف الارتباط</h4>
            <p>
              نحن نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتتبع النشاط على خدمتنا وتخزين
              معلومات معينة. تقنيات التتبع المستخدمة هي إشارات وعلامات وبرامج نصية لجمع المعلومات وتتبعها
              وتحسين خدمتنا وتحليلها.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">استخدام بياناتك الشخصية</h2>
            <p>يجوز للشركة استخدام البيانات الشخصية للأغراض التالية:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>لتوفير خدمتنا وصيانتها</strong>، بما في ذلك مراقبة استخدام خدمتنا.</li>
              <li><strong>لإدارة حسابك:</strong> لإدارة تسجيلك كمستخدم للخدمة.</li>
              <li><strong>للتواصل معك:</strong> للتواصل معك عبر البريد الإلكتروني أو المكالمات الهاتفية أو الرسائل القصيرة.</li>
              <li><strong>لتزويدك بالأخبار:</strong> والعروض الخاصة والمعلومات العامة حول السلع والخدمات.</li>
            </ul>

            {/* Google AdSense section — placed prominently before security section per AdSense policy guidance */}
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">الإعلانات وGoogle AdSense</h2>
            <p>
              نستخدم Google AdSense لعرض إعلانات على موقعنا. تستخدم Google وشركاؤها ملفات تعريف الارتباط
              أو تقنيات مشابهة لعرض الإعلانات وقياسها وتحسينها، وقد تعتمد هذه الإعلانات على زياراتك لهذا
              الموقع أو مواقع وتطبيقات أخرى (الإعلانات المخصصة).
            </p>
            <p>
              يمكنك في أي وقت تعطيل تخصيص الإعلانات أو إدارة طريقة استخدام Google لبياناتك الإعلانية
              من خلال الروابط أدناه. وقد تستمر بعض الإعلانات غير المخصصة في الظهور بناءً على محتوى الصفحة
              أو موقعك الجغرافي العام.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                إدارة أو تعطيل تخصيص الإعلانات:{' '}
                <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  إعدادات إعلانات Google
                </a>
              </li>
              <li>
                معرفة كيفية استخدام Google للبيانات:{' '}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  كيف تستخدم Google البيانات عند استخدام مواقع شركائها
                </a>
              </li>
              <li>
                معرفة المزيد عن ملفات تعريف الارتباط لدى Google:{' '}
                <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  كيف تستخدم Google ملفات تعريف الارتباط
                </a>
              </li>
              <li>
                مراجعة سياسة ملفات تعريف الارتباط الخاصة بنا:{' '}
                <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                  سياسة ملفات تعريف الارتباط
                </Link>
              </li>
            </ul>
            <p>
              يمكنك أيضًا إدارة موافقتك على ملفات تعريف الارتباط مباشرةً من خلال أداة الموافقة في موقعنا:
            </p>
            <button
              type="button"
              onClick={openConsentPreferences}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              إدارة تفضيلات الموافقة
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">أمان بياناتك الشخصية</h2>
            <p>
              أمان بياناتك الشخصية مهم بالنسبة لنا، ولكن تذكر أنه لا توجد طريقة نقل عبر الإنترنت أو طريقة
              تخزين إلكتروني آمنة بنسبة 100%. وبينما نسعى جاهدين لاستخدام وسائل مقبولة تجاريًا لحماية
              بياناتك الشخصية، لا يمكننا ضمان أمانها المطلق.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">التغييرات على سياسة الخصوصية هذه</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية الخاصة بنا من وقت لآخر. سنعلمك بأي تغييرات من خلال نشر سياسة
              الخصوصية الجديدة على هذه الصفحة وتحديث تاريخ &quot;آخر تحديث&quot; في أعلى هذه الصفحة.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6">التواصل معنا</h2>
            <p className="text-slate-600 mb-6">
              إذا كانت لديك أي أسئلة أو اقتراحات حول سياسة الخصوصية، يسعدنا التواصل معك عبر:
            </p>
            <div className="flex flex-col gap-4">
              {contactEmail ? (
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
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Link href="/contact" className="text-slate-700 hover:text-blue-600 transition-colors font-medium">
                    نموذج التواصل
                  </Link>
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
