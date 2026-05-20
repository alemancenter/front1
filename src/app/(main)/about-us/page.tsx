'use client';

import { useSettingsStore } from '@/store/useStore';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import {
  Eye,
  Target,
  Gift,
  School,
  BookOpen,
  Newspaper, // for 'news'
  Filter,
  Heart,
  Award,
  Users,
  Lightbulb,
  Mail,
  Globe,
} from 'lucide-react';

export default function AboutUsPage() {
  const { siteName, siteEmail, siteUrl } = useSettingsStore();
  const resolvedSiteName = siteName?.trim() || 'الإيمان التعليمي';
  const contactEmail = siteEmail || '';
  const contactSiteUrl = siteUrl || '';

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="من نحن"
        current="من نحن"
        eyebrow={resolvedSiteName}
        description={`مرحبًا بكم في موقع ${resolvedSiteName}، مساحة تعليمية مصممة لدعم الطلاب والمعلمين بمحتوى واضح وسهل الوصول.`}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        {/* Vision & Mission */}
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

        {/* What We Offer */}
        <div className="mb-8 rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:mb-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">ماذا نقدم؟</h2>
          </div>
          <p className="text-slate-600 mb-8">
            يقدم موقع {resolvedSiteName} مجموعة واسعة من الخدمات التعليمية المصممة بعناية، بما في
            ذلك:
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">صفوف دراسية</h3>
                <p className="text-slate-600 text-sm">
                  تغطي جميع الصفوف من التمهيدي حتى الصف الثاني عشر.
                </p>
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

        {/* Our Values */}
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
                <p className="text-slate-600 text-sm">
                  تعزيز بيئة تعليمية تدعم الشراكة بين الطلاب والمعلمين.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">الإبداع</h3>
                <p className="text-slate-600 text-sm">
                  استخدام أدوات وتقنيات حديثة لتحسين تجربة المستخدم.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info (Reusable) */}
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
  );
}

