import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { COUNTRIES } from '@/lib/api/config';
import EducationalPageHero from '@/components/common/EducationalPageHero';
import { getSchoolClasses } from '@/lib/academic-data';
import { getFrontSettings } from '@/lib/front-settings';
import { canonicalMetadata } from '@/lib/seo';

// Academic structure changes rarely; keep ISR aligned with the backend long-lived cache.
export const revalidate = 86400;

async function getClasses(countryId: string) {
  return getSchoolClasses(countryId);
}

export async function generateMetadata({ params }: { params: Promise<{ countryCode: string }> }): Promise<Metadata> {
  const { countryCode } = await params;
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!country) {
    return { title: 'Page Not Found' };
  }

  const settings = await getFrontSettings();
  const canonical = canonicalMetadata(settings, `/${countryCode}/lesson`);

  return {
    alternates: canonical.alternates,
    openGraph: canonical.openGraph,
    title: `الصفوف الدراسية - ${country.name}`,
    description: `تصفح الصفوف الدراسية المتاحة في ${country.name} للوصول إلى المواد والملفات التعليمية.`,
  };
}

export default async function LessonIndexPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params;
  const country = COUNTRIES.find((c) => c.code === countryCode);
  if (!country) notFound();

  const classes = await getClasses(country.id);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <EducationalPageHero
        title="الصفوف الدراسية"
        subtitle={`اختر الصف الدراسي في ${country.name} للوصول إلى المواد، الفصول، الملفات، والمقالات التعليمية.`}
        primaryHref="#content"
        primaryLabel="اختر صفك الدراسي"
        secondaryHref={`/${countryCode}/posts`}
        secondaryLabel="تصفح المنشورات"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-20 mb-10">
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full w-fit shadow-sm border border-white/50">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            الرئيسية
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">{country.name}</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">الصفوف الدراسية</span>
        </nav>
      </div>

      <div id="content" className="container mx-auto px-4">
        {classes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
            <div className="text-slate-900 font-bold text-xl mb-2">لا توجد صفوف متاحة حالياً</div>
            <div className="text-slate-500">يرجى المحاولة لاحقاً</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/${countryCode}/lesson/${cls.id}`}
                className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-cyan-500/0 to-indigo-600/0 group-hover:from-blue-600/5 group-hover:to-indigo-600/5 transition-colors" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                      {cls.grade_level}
                    </div>
                    <div className="text-slate-300 group-hover:text-blue-600 transition-colors">‹</div>
                  </div>
                  <div className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cls.grade_name}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">عرض المواد الدراسية والملفات</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
