'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  Filter,
  Grid2X2,
  Layers3,
  ListFilter,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from 'lucide-react';

export interface CategoryArticleFile {
  id: number;
  file_type?: string;
  file_path?: string;
  file_category?: string;
  file_name?: string;
  title?: string;
}

export interface CategoryArticleItem {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
  visit_count?: number;
  views?: number;
  meta_description?: string;
  description?: string;
  content?: string;
  files?: CategoryArticleFile[];
  file_type?: string;
  file_name?: string;
}

type SortKey = 'newest' | 'oldest' | 'views' | 'title';

const pageSizeOptions = [8, 12, 16, 20];

function cleanText(value?: string) {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSummary(article: CategoryArticleItem) {
  const summary = cleanText(article.meta_description || article.description || article.content);
  if (!summary) return 'ملف تعليمي منظم ضمن هذا القسم، يمكنك فتح البطاقة للوصول إلى التفاصيل والتحميل عند توفر الملفات.';
  return summary.length > 96 ? `${summary.slice(0, 96)}...` : summary;
}

function getFileType(article: CategoryArticleItem) {
  const file = article.files?.[0];
  return (file?.file_type || article.file_type || 'محتوى').toString().replace('.', '').toUpperCase();
}

function getFileIcon(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('pdf')) return FileText;
  if (normalized.includes('doc')) return FileType;
  if (normalized.includes('xls')) return FileSpreadsheet;
  if (normalized.includes('png') || normalized.includes('jpg') || normalized.includes('jpeg') || normalized.includes('webp')) return FileImage;
  if (normalized.includes('zip') || normalized.includes('rar')) return FileArchive;
  return FileText;
}

function getTypeTone(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.includes('pdf')) return 'bg-red-100 text-red-800 border-red-200';
  if (normalized.includes('doc')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (normalized.includes('xls')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (normalized.includes('ppt')) return 'bg-orange-100 text-orange-800 border-orange-200';
  return 'bg-violet-100 text-violet-800 border-violet-200';
}

function formatDate(date?: string) {
  if (!date) return 'غير محدد';
  try {
    return new Date(date).toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

function compactNumber(value: number) {
  try {
    return new Intl.NumberFormat('ar-JO', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0);
  } catch {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return String(value || 0);
  }
}

function parseTime(value?: string) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export default function CategoryArticlesGridClient({
  articles,
  countryCode,
  categoryName,
  subjectName,
}: {
  articles: CategoryArticleItem[];
  countryCode: string;
  categoryName: string;
  subjectName: string;
}) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const totalFiles = useMemo(
    () => articles.reduce((sum, article) => sum + Math.max(article.files?.length || 0, article.file_type ? 1 : 0), 0),
    [articles]
  );

  const totalViews = useMemo(
    () => articles.reduce((sum, article) => sum + Number(article.visit_count || article.views || 0), 0),
    [articles]
  );

  const lastUpdated = useMemo(() => {
    const newest = [...articles].sort((a, b) => parseTime(b.updated_at || b.created_at) - parseTime(a.updated_at || a.created_at))[0];
    return formatDate(newest?.updated_at || newest?.created_at);
  }, [articles]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((article) => set.add(getFileType(article)));
    return Array.from(set).filter(Boolean);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = articles.filter((article) => {
      const matchesQuery = !normalizedQuery || `${article.title} ${getSummary(article)}`.toLowerCase().includes(normalizedQuery);
      const matchesType = type === 'all' || getFileType(article) === type;
      return matchesQuery && matchesType;
    });

    filtered.sort((a, b) => {
      if (sort === 'oldest') return parseTime(a.created_at) - parseTime(b.created_at);
      if (sort === 'views') return Number(b.visit_count || b.views || 0) - Number(a.visit_count || a.views || 0);
      if (sort === 'title') return a.title.localeCompare(b.title, 'ar');
      return parseTime(b.created_at) - parseTime(a.created_at);
    });

    return filtered;
  }, [articles, query, type, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedArticles = filteredArticles.slice((safePage - 1) * pageSize, safePage * pageSize);

  const updateFilter = (callback: () => void) => {
    callback();
    setPage(1);
  };

  return (
    <section id="content" className="space-y-6" dir="rtl">
      <div className="overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-sm">
        <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-l from-blue-50/80 via-white to-slate-50 p-4 sm:p-5 lg:p-6">
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-700/10 px-3 py-1.5 text-xs font-black text-blue-700">
                <Sparkles className="h-4 w-4" />
                {categoryName}
              </div>
              <h2 className="mx-auto mt-3 max-w-3xl text-2xl font-black leading-9 tracking-tight text-slate-950 sm:text-3xl lg:mx-0">
                {categoryName} - {subjectName}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-500 lg:mx-0">
                تصفح الملفات التعليمية بواجهة منظمة، مع بحث وفرز سريع للوصول للمحتوى المطلوب بدون تشتت.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 bg-white/95 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Layers3 className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="text-xl font-black leading-6 text-slate-950">{articles.length}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-500">إجمالي المحتوى</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-white/95 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FileText className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="text-xl font-black leading-6 text-slate-950">{totalFiles}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-500">عدد الملفات</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white/95 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Eye className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="text-xl font-black leading-6 text-slate-950">{compactNumber(totalViews)}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-500">المشاهدات</div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white/95 p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><CalendarDays className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-black leading-6 text-slate-950">{lastUpdated}</div>
                    <div className="mt-0.5 text-[11px] font-bold text-slate-500">آخر تحديث</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-white p-4 lg:grid-cols-[1fr_180px_180px_130px] lg:p-5">
          <label className="relative block" htmlFor="category-search-query">
            <span className="sr-only">بحث في محتوى القسم</span>
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              id="category-search-query"
              value={query}
              onChange={(event) => updateFilter(() => setQuery(event.target.value))}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pr-12 pl-4 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              placeholder="ابحث في خطط الدروس..."
            />
          </label>
          <label className="relative block" htmlFor="category-file-type-filter">
            <span className="sr-only">تصفية حسب نوع الملف</span>
            <ListFilter className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select id="category-file-type-filter" value={type} onChange={(event) => updateFilter(() => setType(event.target.value))} className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="all">كل الأنواع</option>
              {availableTypes.map((fileType) => <option key={fileType} value={fileType}>{fileType}</option>)}
            </select>
          </label>
          <label className="relative block" htmlFor="category-sort-filter">
            <span className="sr-only">ترتيب نتائج المحتوى</span>
            <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select id="category-sort-filter" value={sort} onChange={(event) => updateFilter(() => setSort(event.target.value as SortKey))} className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="newest">الأحدث أولاً</option>
              <option value="oldest">الأقدم أولاً</option>
              <option value="views">الأكثر مشاهدة</option>
              <option value="title">حسب العنوان</option>
            </select>
          </label>
          <button type="button" onClick={() => updateFilter(() => { setQuery(''); setType('all'); setSort('newest'); })} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
            <Filter className="h-4 w-4" />
            تصفية
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-black text-slate-900">
            <Grid2X2 className="h-5 w-5 text-blue-700" />
            عرض {paginatedArticles.length} من {filteredArticles.length} محتوى
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <label htmlFor="category-page-size" className="text-xs font-bold text-slate-600">عدد العناصر في الصفحة</label>
            <select id="category-page-size" value={pageSize} onChange={(event) => updateFilter(() => setPageSize(Number(event.target.value)))} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none">
              {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </div>
        </div>

        {paginatedArticles.length ? (
          <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:p-6">
            {paginatedArticles.map((article, index) => {
              const fileType = getFileType(article);
              const Icon = getFileIcon(fileType);
              const href = `/${countryCode}/lesson/articles/${article.id}`;
              const tone = getTypeTone(fileType);

              return (
                <Link key={`${article.id}-${safePage}-${index}`} href={href} className="group relative flex min-h-[245px] flex-col rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5">
                  <div className="absolute left-4 top-4 flex items-center gap-2 text-slate-300 transition group-hover:text-blue-500">
                    <Star className="h-4 w-4" />
                    <span className="h-1 w-1 rounded-full bg-current" />
                    <span className="h-1 w-1 rounded-full bg-current" />
                    <span className="h-1 w-1 rounded-full bg-current" />
                  </div>

                  <div className="mb-4 flex items-start justify-between gap-3 pl-16">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${tone}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${tone}`}>{fileType}</span>
                    </div>
                  </div>

                  <h3 className="line-clamp-2 text-base font-black leading-7 text-slate-950 transition group-hover:text-blue-700">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-500">{getSummary(article)}</p>

                  <div className="mt-auto pt-5">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-600">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(article.created_at)}</span>
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{compactNumber(Number(article.visit_count || article.views || 0))}</span>
                      <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{article.files?.length || (article.file_type ? 1 : 0)}</span>
                    </div>
                    <div className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-50 text-sm font-black text-slate-700 transition group-hover:bg-blue-700 group-hover:text-white">
                      عرض المحتوى
                      <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300"><Search className="h-8 w-8" /></div>
            <h3 className="text-xl font-black text-slate-950">لا توجد نتائج مطابقة</h3>
            <p className="mt-2 text-sm text-slate-500">جرّب تقليل شروط البحث أو الرجوع إلى كل الأنواع.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-bold text-slate-600">صفحة {safePage} من {totalPages}</div>
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                const number = idx + Math.max(1, Math.min(safePage - 2, Math.max(1, totalPages - 4)));
                return (
                  <button key={number} type="button" onClick={() => setPage(number)} className={`h-11 min-w-[2.75rem] rounded-2xl px-4 text-sm font-black transition ${number === safePage ? 'bg-blue-700 text-white shadow-lg shadow-blue-700/20' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                    {number}
                  </button>
                );
              })}
              <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={safePage === totalPages} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
