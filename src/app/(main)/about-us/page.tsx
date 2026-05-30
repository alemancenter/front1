'use client';

import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import {
  Eye,
  Target,
  Gift,
  School,
  BookOpen,
  Newspaper,
  Filter,
  Heart,
  Award,
  Users,
  Lightbulb,
  Mail,
  Globe,
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AboutUsPage() {
  const frontSettings = useFrontSettings();
  const { siteName: storeSiteName, siteEmail: storeSiteEmail, siteUrl: storeSiteUrl, contactEmail: storeContactEmail, contactPhone: storeContactPhone, contactAddress: storeContactAddress } = useSettingsStore();

  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() || storeSiteName?.trim() || 'موقعنا التعليمي';
  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() || storeSiteUrl?.trim() || '';
  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() || storeContactEmail?.trim() || storeSiteEmail?.trim() || '';
  const resolvedContactPhone =
    (frontSettings.contact_phone ?? '').toString().trim() || storeContactPhone?.trim() || '';
  const resolvedContactAddress =
    (frontSettings.contact_address ?? '').toString().trim() || storeContactAddress?.trim() || '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="من نحن"
        current="من نحن"
        eyebrow={resolvedSiteName}
        description={`مرحبًا بكم في موقع ${resolvedSiteName}، مساحة تعليمية مصممة لدعم الطلاب والمعلمين بمحتوى واضح وسهل الوصول.`}
      />

      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">

        {/* هوية المؤسسة */}
        <div className="mb-8 rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">هويتنا</h2>
          </div>
          <p className="text-slate-600 leading-relaxed mb-4">
            <strong>{resolvedSiteName}</strong> منصة تعليمية إلكترونية أردنية متخصصة في توفير المحتوى
            التعليمي للطلاب والمعلمين وفق المنهاج الدراسي الأردني. نعمل على تقديم موارد تعليمية
            عالية الجودة تشمل المناهج الدراسية وأوراق العمل والاختبارات والأخبار التربوية.
          </p>
          <div className="flex flex-col gap-3 text-sm">
            {resolvedSiteUrl && (
              <div className="flex items-center gap-2 text-slate-600">
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <a
                  href={resolvedSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors font-medium inline-flex items-center gap-1"
                >
                  {resolvedSiteUrl}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
            {resolvedContactEmail && (
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`mailto:${resolvedContactEmail}`} className="hover:text-blue-600 transition-colors font-medium">
                  {resolvedContactEmail}
                </a>
              </div>
            )}
            {resolvedContactPhone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                <a href={`tel:${resolvedContactPhone}`} className="hover:text-blue-600 transition-colors font-medium" dir="ltr">
                  {resolvedContactPhone}
                </a>
              </div>
            )}
            {resolvedContactAddress && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{resolvedContactAddress}</span>
              </div>
            )}
            {!resolvedContactEmail && !resolvedSiteUrl && (
              <div className="flex items-center gap-2 text-slate-600">
                <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                <Link href="/contact-us" className="hover:text-blue-600 transition-colors font-medium">
                  نموذج التواصل المباشر
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* الرؤية والرسالة */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="h-full rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">رؤيتنا</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              نسعى إلى أن نكون المصدر الأول للمحتوى التعليمي الموثوق والشامل، متماشين مع المنهاج
              الأردني، مع تسهيل الوصول إلى المواد التعليمية والاختبارات والمقالات الإرشادية للطلاب
              والمعلمين على حد سواء.
            </p>
          </div>
          <div className="h-full rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">رسالتنا</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              تقديم تجربة تعليمية متكاملة تعتمد على توفير موارد تعليمية عالية الجودة تساهم في تحسين
              أداء الطلاب والمعلمين وتطوير البيئة التعليمية بشكل عام.
            </p>
          </div>
        </div>

        {/* ما نقدم */}
        <div className="mb-8 rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:mb-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">ماذا نقدم؟</h2>
          </div>
          <p className="text-slate-600 mb-8">
            يقدم موقع {resolvedSiteName} مجموعة واسعة من الخدمات التعليمية المصممة بعناية، بما في ذلك:
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">صفوف دراسية</h3>
                <p className="text-slate-600 text-sm">تغطي جميع الصفوف من التمهيدي حتى الصف الثاني عشر.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">مواد دراسية</h3>
                <ul className="text-slate-600 text-sm list-disc list-inside space-y-1">
                  <li>الخطة الدراسية</li>
                  <li>أوراق العمل والكورسات</li>
                  <li>الاختبارات الشهرية والنهائية</li>
                  <li>الكتب الرسمية ودليل المعلم</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">أخبار تربوية</h3>
                <p className="text-slate-600 text-sm">
                  تشمل آخر أخبار وزارة التربية والتعليم، وأخبار المعلمين، والمقالات الإرشادية.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">تصفية المحتوى</h3>
                <p className="text-slate-600 text-sm">
                  أدوات بحث وتصنيف متقدمة تتيح للمستخدمين الوصول إلى المحتوى المناسب بسهولة.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* قيمنا */}
        <div className="mb-8 rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:mb-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">قيمنا</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">الجودة</h3>
                <p className="text-slate-600 text-sm">تقديم محتوى تعليمي متميز ودقيق.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">التعاون</h3>
                <p className="text-slate-600 text-sm">تعزيز بيئة تعليمية تدعم الشراكة بين الطلاب والمعلمين.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">الإبداع</h3>
                <p className="text-slate-600 text-sm">استخدام أدوات وتقنيات حديثة لتحسين تجربة المستخدم.</p>
              </div>
            </div>
          </div>
        </div>

        {/* التواصل */}
        <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">التواصل معنا</h2>
          </div>
          <p className="text-slate-600 mb-6">
            إذا كانت لديك أي أسئلة أو اقتراحات، يسعدنا أن نتواصل معك عبر:
          </p>
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
  );
}
