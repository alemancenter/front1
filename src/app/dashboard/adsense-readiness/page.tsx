'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, EyeOff, Gauge, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';

type ReadinessType = 'all' | 'article' | 'post';
type ReadinessLevel = 'all' | 'ready' | 'review' | 'weak';

type ReadinessItem = {
  id: number;
  type: 'article' | 'post';
  title: string;
  status: string;
  score: number;
  level: 'ready' | 'review' | 'weak';
  word_count: number;
  char_count: number;
  files_count: number;
  should_index: boolean;
  should_show_ads: boolean;
  issues: string[];
  url: string;
};

type ReadinessSummary = {
  total: number;
  ready: number;
  review: number;
  weak: number;
  no_index: number;
  ads_eligible: number;
};

type ReadinessMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  filtered_total?: number;
};

const levelLabels = {
  ready: 'جاهز',
  review: 'يحتاج مراجعة',
  weak: 'ضعيف',
} as const;

const typeLabels = {
  all: 'كل المحتوى',
  article: 'المقالات',
  post: 'المنشورات',
} as const;

const perPageOptions = [50, 100, 200, 500] as const;

const emptySummary: ReadinessSummary = {
  total: 0,
  ready: 0,
  review: 0,
  weak: 0,
  no_index: 0,
  ads_eligible: 0,
};

const emptyMeta: ReadinessMeta = {
  current_page: 1,
  per_page: 100,
  total: 0,
  last_page: 1,
  from: 0,
  to: 0,
};

export default function AdsenseReadinessPage() {
  const [items, setItems] = useState<ReadinessItem[]>([]);
  const [summary, setSummary] = useState<ReadinessSummary>(emptySummary);
  const [meta, setMeta] = useState<ReadinessMeta>(emptyMeta);
  const [type, setType] = useState<ReadinessType>('all');
  const [level, setLevel] = useState<ReadinessLevel>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => [
    { label: 'إجمالي المحتوى المفحوص', value: summary.total, icon: Gauge },
    { label: 'جاهزة للإعلانات', value: summary.ads_eligible, icon: CheckCircle2 },
    { label: 'تحتاج noindex مؤقتًا', value: summary.no_index, icon: EyeOff },
    { label: 'ضعيفة', value: summary.weak, icon: AlertTriangle },
  ], [summary]);

  const loadReport = async (targetPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {
        type,
        page: String(targetPage),
        per_page: String(perPage),
      };
      if (level !== 'all') params.level = level;
      if (query.trim()) params.q = query.trim();

      const res = await apiClient.get<any>(API_ENDPOINTS.CONTENT_AUDIT.ADSENSE_READINESS, params, { cache: 'no-store' } as any);
      const data = res?.data?.data || res?.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setSummary(data.summary || emptySummary);
      setMeta(data.meta || emptyMeta);
      setPage(Number(data.meta?.current_page || targetPage));
    } catch (err: any) {
      setError(err?.message || 'تعذر تحميل تقرير جاهزية AdSense');
    } finally {
      setLoading(false);
    }
  };

  const resetAndLoad = () => {
    setPage(1);
    loadReport(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > meta.last_page || nextPage === page || loading) return;
    setPage(nextPage);
    loadReport(nextPage);
  };

  useEffect(() => {
    setPage(1);
    loadReport(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, level, perPage]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                AdSense Readiness
              </div>
              <h1 className="text-2xl font-black text-slate-950 md:text-3xl">تقرير جاهزية المحتوى لقبول AdSense</h1>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-slate-600">
                التقرير يفحص كل المقالات والمنشورات المطابقة للفلاتر، ثم يعرض النتائج بنظام صفحات حتى تستطيع إدارة آلاف الصفحات بدون تحميل جدول ضخم دفعة واحدة.
              </p>
            </div>
            <button onClick={() => loadReport(page)} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800 disabled:opacity-60">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              تحديث التقرير
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="mb-4 h-6 w-6 text-blue-700" />
                <div className="text-2xl font-black text-slate-950">{stat.value.toLocaleString('ar')}</div>
                <div className="mt-1 text-sm font-bold text-slate-500">{stat.label}</div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[160px_170px_150px_1fr_auto]">
            <select id="adsense-readiness-type" name="type" value={type} onChange={(e) => setType(e.target.value as ReadinessType)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-blue-300">
              <option value="all">الكل</option>
              <option value="article">المقالات</option>
              <option value="post">المنشورات</option>
            </select>
            <select id="adsense-readiness-level" name="level" value={level} onChange={(e) => setLevel(e.target.value as ReadinessLevel)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-blue-300">
              <option value="all">كل الحالات</option>
              <option value="ready">جاهز</option>
              <option value="review">يحتاج مراجعة</option>
              <option value="weak">ضعيف</option>
            </select>
            <select id="adsense-readiness-per-page" name="per_page" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-blue-300">
              {perPageOptions.map((option) => <option key={option} value={option}>{option} في الصفحة</option>)}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input id="adsense-readiness-search" name="q" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') resetAndLoad(); }} placeholder="بحث بعنوان المقال أو المنشور" className="h-11 w-full rounded-xl border border-slate-200 pr-10 pl-3 text-sm font-bold outline-none focus:border-blue-300" />
            </div>
            <button onClick={resetAndLoad} className="h-11 rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-black text-blue-700 transition hover:bg-blue-100">بحث</button>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            يعرض الآن <span className="font-black text-slate-950">{meta.from.toLocaleString('ar')} - {meta.to.toLocaleString('ar')}</span> من <span className="font-black text-slate-950">{meta.total.toLocaleString('ar')}</span> نتيجة مطابقة.
            <span className="mr-2 text-slate-400">({typeLabels[type]} / {level === 'all' ? 'كل الحالات' : levelLabels[level]})</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(page - 1)} disabled={page <= 1 || loading} className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              <ChevronRight className="h-4 w-4" /> السابق
            </button>
            <span className="min-w-28 text-center text-xs font-black text-slate-700">صفحة {page.toLocaleString('ar')} من {meta.last_page.toLocaleString('ar')}</span>
            <button onClick={() => goToPage(page + 1)} disabled={page >= meta.last_page || loading} className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              التالي <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </section>

        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-right text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">العنوان</th>
                  <th className="px-4 py-3">النوع</th>
                  <th className="px-4 py-3">الدرجة</th>
                  <th className="px-4 py-3">الكلمات</th>
                  <th className="px-4 py-3">الملفات</th>
                  <th className="px-4 py-3">الفهرسة/الإعلانات</th>
                  <th className="px-4 py-3">الملاحظات</th>
                  <th className="px-4 py-3">فتح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center font-bold text-slate-500">جاري تحميل التقرير...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center font-bold text-slate-500">لا توجد نتائج مطابقة.</td></tr>
                ) : items.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="align-top hover:bg-slate-50/70">
                    <td className="max-w-sm px-4 py-4 font-black leading-7 text-slate-950">{item.title}</td>
                    <td className="px-4 py-4 font-bold text-slate-600">{item.type === 'article' ? 'مقال' : 'منشور'}</td>
                    <td className="px-4 py-4">
                      <div className="font-black text-slate-950">{item.score}/100</div>
                      <div className="mt-1 text-xs font-bold text-slate-500">{levelLabels[item.level]}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-600">{item.word_count.toLocaleString('ar')}</td>
                    <td className="px-4 py-4 font-bold text-slate-600">{item.files_count.toLocaleString('ar')}</td>
                    <td className="px-4 py-4">
                      <div className="space-y-1 text-xs font-black">
                        <div className={item.should_index ? 'text-emerald-700' : 'text-amber-700'}>{item.should_index ? 'index' : 'noindex مؤقت'}</div>
                        <div className={item.should_show_ads ? 'text-emerald-700' : 'text-slate-500'}>{item.should_show_ads ? 'إعلانات مسموحة' : 'بدون إعلانات'}</div>
                      </div>
                    </td>
                    <td className="max-w-xs px-4 py-4 text-xs font-bold leading-6 text-slate-600">{item.issues?.length ? item.issues.join('، ') : 'لا توجد ملاحظات حرجة'}</td>
                    <td className="px-4 py-4"><Link href={item.url} target="_blank" className="font-black text-blue-700 hover:underline">فتح</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
