import Link from 'next/link';
import {
  Diamond,
  FileText,
  FolderOpen,
  GraduationCap,
  LibraryBig,
  LockKeyhole,
  PlayCircle,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
} from 'lucide-react';
import type { HomeCountry, HomeTrendingSearch } from './HomeTypes';
import QuickSearch from '@/components/search/QuickSearch';

type HomeHeroProps = {
  country: HomeCountry;
  siteName: string;
  showHeroButtons: boolean;
  trendingSearches?: HomeTrendingSearch[];
};

const floatingCards = [
  { icon: GraduationCap, title: 'ملفات شاملة', description: 'جميع المواد الدراسية', className: 'right-[9%] top-[18%]', tone: 'text-blue-700 bg-blue-50' },
  { icon: PlayCircle, title: 'دروس مصورة', description: 'شرح مبسط ومباشر', className: 'right-[9%] top-[43%]', tone: 'text-sky-700 bg-sky-50' },
  { icon: FileText, title: 'اختبارات وتقييمات', description: 'بنك أسئلة شامل', className: 'right-[34%] top-[52%]', tone: 'text-violet-700 bg-violet-50' },
  { icon: LibraryBig, title: 'مكتبة ضخمة', description: 'آلاف الملفات والملخصات', className: 'right-[9%] top-[68%]', tone: 'text-emerald-700 bg-emerald-50' },
];

const trustItems = [
  { icon: ShieldCheck, title: 'محتوى موثوق', description: 'من مصادر رسمية ومعتمدة' },
  { icon: Diamond, title: 'جودة عالية', description: 'ملفات ودروس مميزة' },
  { icon: RefreshCw, title: 'تحديث مستمر', description: 'آخر التحديثات أولاً' },
  { icon: LockKeyhole, title: 'آمن وسهل الاستخدام', description: 'تجربة تعليمية سلسة' },
];

export default function HomeHero({ country, siteName, showHeroButtons, trendingSearches = [] }: HomeHeroProps) {
  const resolvedName = siteName || 'موقع الألمان';

  return (
    <section className="isolate relative overflow-hidden bg-[#f7fbff] px-3 pb-10 pt-[104px] sm:px-5 lg:pt-[124px]" dir="rtl">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_55%,#ffffff_100%)]" />
      <div className="relative mx-auto max-w-[1540px]">
        <div className="relative min-h-[760px] overflow-hidden rounded-[2rem] border border-blue-100/80 bg-white shadow-2xl shadow-blue-100/60 sm:min-h-[780px] lg:min-h-[620px] lg:rounded-[2.3rem]">
          <picture>
            <source
              srcSet="/assets/img/home/premium-education-hero-desktop.avif"
              media="(min-width: 768px)"
              type="image/avif"
            />
            <img
              src="/assets/img/home/premium-education-hero-mobile.avif"
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="async"
              width={768}
              height={900}
              className="absolute inset-0 h-full w-full object-cover object-[left_center]"
            />
          </picture>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_0%,rgba(244,248,255,0.72)_45%,rgba(255,255,255,0.98)_72%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_58%,rgba(37,99,235,0.22),transparent_23%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(248,251,255,0.96)_88%)]" />

          <div className="relative z-10 grid min-h-[620px] items-center gap-8 px-5 pb-8 pt-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-14 lg:pb-10 lg:pt-12">
            <div className="order-2 text-center lg:order-1 lg:text-right">
             <h1
                aria-label={`${resolvedName} - ملفات تعليمية ومناهج دراسية واختبارات للطلاب`}
                className="mx-auto max-w-[330px] break-words text-3xl font-black leading-[1.25] text-[#07194d] [text-wrap:balance] sm:max-w-3xl sm:text-5xl lg:mx-0 lg:max-w-4xl lg:text-6xl"
              >
                {resolvedName}
                <span className="mt-1 block text-blue-700">
                  للملفات التعليمية والمناهج الدراسية
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-[300px] text-sm font-semibold leading-8 text-slate-600 sm:max-w-2xl sm:text-lg lg:mx-0">
               تصفح المناهج، الملخصات، الاختبارات، أوراق العمل والدروس حسب الصف، المادة، الفصل الدراسي والدولة، مع محتوى تعليمي منظم يساعد الطلاب والمعلمين.
              </p>

              {showHeroButtons && (
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Link
                    href={`/${country.code}/posts`}
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-7 text-sm font-black text-white shadow-xl shadow-blue-700/25 transition hover:-translate-y-0.5 hover:bg-blue-800 sm:w-auto sm:min-w-[230px]"
                  >
                    <Rocket className="h-5 w-5" />
                    استكشف المحتوى الآن
                  </Link>
                  <Link
                    href="#sections"
                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white/90 px-7 text-sm font-black text-blue-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white sm:w-auto sm:min-w-[210px]"
                  >
                    <FolderOpen className="h-5 w-5" />
                    تصفح الأقسام
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative order-1 hidden min-h-[430px] lg:order-2 lg:block"
              aria-hidden="true"
            >
              {floatingCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className={`absolute ${card.className} flex min-w-[190px] items-center gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 text-right shadow-xl shadow-blue-950/10 backdrop-blur-xl`}
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{card.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">{card.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-3 lg:col-span-2">
              <div className="mx-auto grid w-full max-w-[calc(100vw-40px)] grid-cols-2 overflow-hidden rounded-2xl border border-blue-100/80 bg-white/82 shadow-lg shadow-blue-950/5 backdrop-blur-xl sm:max-w-5xl sm:grid-cols-4">
                {trustItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className={`flex items-center justify-center gap-3 p-4 ${index !== trustItems.length - 1 ? 'border-l border-blue-100/80' : ''}`}>
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-[#07194d]">{item.title}</div>
                        <div className="mt-0.5 text-xs font-semibold text-slate-500">{item.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mx-auto mt-7 w-full max-w-[calc(100vw-40px)] rounded-[1.6rem] border border-blue-100/90 bg-white/92 p-4 shadow-2xl shadow-blue-100/70 backdrop-blur-xl sm:max-w-[1120px] lg:p-5">
                <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">ابحث عن ملفات تعليمية ومناهج واختبارات</h2>
                    <p className="text-sm text-slate-500">ملفات، دروس، ملخصات، واختبارات</p>
                  </div>
                  <Search className="h-6 w-6 text-blue-700" />
                </div>
                <QuickSearch variant="premium" showTitle={false} className="border-0 bg-transparent p-0 shadow-none" />
                {trendingSearches.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <span className="px-2 text-slate-700">الأكثر بحثاً:</span>
                    {trendingSearches.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        prefetch={false}
                        title={item.resultsCount ? `${item.resultsCount} نتيجة مرتبطة` : item.label}
                        className="rounded-full bg-slate-100 px-4 py-2 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
