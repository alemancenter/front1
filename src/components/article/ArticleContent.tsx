'use client';

import { AlertCircle, BookOpen, CheckCircle, Download, FileText, Info, Lock, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ArticleAds from '@/components/ads/ArticleAds';
import InArticleAd from '@/components/ads/InArticleAd';
import { sanitizeRichHtml } from '@/lib/sanitize-html';
import { useAuthStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';

interface File {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  file_category?: string;
}

interface Props {
  content: string;
  files: File[];
  className?: string;
  backLink?: string;
  adSettings?: {
    googleAdsDesktop: string;
    googleAdsMobile: string;
    googleAdsDesktop2: string;
    googleAdsMobile2: string;
  };
  showInlineAd?: boolean;
  inArticleAdCode?: string;
  title?: string;
  subject?: string;
  category?: string;
  sectionName?: string;
  requireLoginForDownload?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export default function ArticleContent({ content, files, className, adSettings, showInlineAd, inArticleAdCode, title, subject, category, sectionName, requireLoginForDownload }: Props) {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const frontSettings = useFrontSettings();
  // Prefer the server-passed prop, fall back to the live client-side context.
  // The client value keeps the gate accurate even when the page HTML was
  // generated before the admin toggled the download setting.
  const requireLoginResolved =
    typeof requireLoginForDownload === 'boolean'
      ? requireLoginForDownload
      : String(frontSettings?.require_login_for_download ?? 'true').trim().toLowerCase() !== 'false';
  const canDownloadDirectly = !requireLoginResolved || isAuthenticated;

  const trustedIframeOrigins = [
    'www.youtube.com',
    'youtube.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
    'vimeo.com',
    'www.google.com',
    'maps.google.com',
    'www.dailymotion.com',
    'dailymotion.com',
  ];

  const processedContent = sanitizeRichHtml(content, trustedIframeOrigins);
  const paragraphMatches = Array.from(processedContent.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi));
  const secondParagraph = paragraphMatches[1] ?? paragraphMatches[0];
  const splitIndex = secondParagraph ? secondParagraph.index! + secondParagraph[0].length : -1;
  const contentBeforeAd = splitIndex > 0 ? processedContent.slice(0, splitIndex) : processedContent;
  const contentAfterAd = splitIndex > 0 ? processedContent.slice(splitIndex) : '';

  return (
    <div className={className}>

      <section className="mb-8 rounded-[1.35rem] border border-emerald-100 bg-emerald-50/50 p-4 text-right sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
          <Info className="h-5 w-5 text-emerald-700" />
          معلومات تعليمية قبل التحميل
        </div>
        <div className="grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <span className="mb-1 block text-xs text-slate-500">عنوان المحتوى</span>
            <strong className="line-clamp-2 text-slate-950">{title || 'محتوى تعليمي'}</strong>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <span className="mb-1 block text-xs text-slate-500">القسم التعليمي</span>
            <strong className="text-slate-950">{sectionName || subject || category || 'موارد تعليمية'}</strong>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <span className="mb-1 block text-xs text-slate-500">عدد المرفقات</span>
            <strong className="text-slate-950">{files?.length || 0} ملف</strong>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <span className="mb-1 block text-xs text-slate-500">طريقة الاستخدام</span>
            <strong className="text-slate-950">للمراجعة والدراسة والتحضير الصفي</strong>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-950"><BookOpen className="h-4 w-4 text-blue-700" /> للطالب</div>
            <p className="text-sm leading-7 text-slate-600">استخدم المحتوى للمراجعة وفهم الفكرة العامة قبل الاعتماد على الملف المرفق.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-950"><CheckCircle className="h-4 w-4 text-emerald-700" /> للمعلم</div>
            <p className="text-sm leading-7 text-slate-600">يمكن الاستفادة منه في التحضير أو دعم الحصة بأنشطة وملفات مرتبطة بالمنهاج.</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-950"><FileText className="h-4 w-4 text-violet-700" /> قبل التحميل</div>
            <p className="text-sm leading-7 text-slate-600">راجع وصف المحتوى والمعلومات الأساسية ثم حمّل الملف عند الحاجة للاستخدام التعليمي الشخصي.</p>
          </div>
        </div>
      </section>

      <div className="rich-content prose mb-10 max-w-none text-right text-base leading-8 text-slate-700 prose-headings:scroll-mt-28 prose-headings:text-right prose-headings:font-black prose-headings:text-slate-950 prose-p:leading-8 prose-a:font-bold prose-a:text-blue-700 prose-img:mx-auto prose-img:rounded-2xl prose-img:shadow-sm sm:text-[17px]">
        <div dangerouslySetInnerHTML={{ __html: contentBeforeAd }} />
        {showInlineAd && splitIndex > 0 ? (
          <div className="not-prose my-8">
            {inArticleAdCode ? (
              <InArticleAd code={inArticleAdCode} />
            ) : adSettings ? (
              <ArticleAds adSettings={adSettings} position="content-mid" />
            ) : null}
          </div>
        ) : null}
        {contentAfterAd ? <div dangerouslySetInnerHTML={{ __html: contentAfterAd }} /> : null}
      </div>

      {files && files.length > 0 ? (
        <div className="mb-8 rounded-[1.25rem] border border-blue-100/70 bg-blue-50/40 p-4 sm:p-5">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
            <FileText className="text-blue-700" />
            المرفقات
          </h3>
          <div className="grid gap-4">
            {files.map((file, index) => (
              <div
                key={file.id || `file-${index}`}
                className="group rounded-2xl border border-blue-100/70 bg-white p-4 transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-700">
                      <span className="text-sm font-black uppercase">{file.file_type || 'PDF'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="bidi-plaintext mb-1 whitespace-normal break-words font-bold text-slate-950 transition-colors group-hover:text-blue-700" dir="auto">
                        {file.file_name || 'ملف للتحميل'}
                      </h4>
                      <p className="text-sm font-medium text-slate-600">
                        {formatFileSize(file.file_size || 0)} • {file.file_category || 'ملف'}
                      </p>
                    </div>
                  </div>

                  {canDownloadDirectly ? (
                    <Link
                      href={`/download/${file.id}`}
                      aria-label={`تحميل ${file.file_name || 'الملف'}`}
                      rel="nofollow"
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 font-bold text-white shadow-lg shadow-blue-700/20 transition-colors hover:bg-blue-800"
                    >
                      <Download size={18} aria-hidden="true" />
                      <span className="hidden sm:inline">تحميل</span>
                    </Link>
                  ) : (
                    <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                      <Lock size={14} />
                      <span className="hidden sm:inline">مقيد</span>
                    </div>
                  )}
                </div>

                {!canDownloadDirectly ? (
                  <div className="mt-3 flex flex-col items-center gap-2 border-t border-blue-50 pt-3 sm:flex-row">
                    <p className="flex items-center gap-1 text-xs font-medium text-slate-600 sm:flex-1">
                      <Lock size={12} />
                      يتطلب التحميل تسجيل دخول مجاني لتنظيم الوصول وحماية الملفات، مع بقاء معلومات الصفحة متاحة للقراءة.
                    </p>
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Link
                        href={`/login?return=${encodeURIComponent(pathname)}`}
                        rel="nofollow"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-black text-white transition-all hover:bg-blue-800 sm:flex-none"
                      >
                        <LogIn size={14} />
                        تسجيل الدخول
                      </Link>
                      <Link
                        href={`/register?return=${encodeURIComponent(pathname)}`}
                        rel="nofollow"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-4 py-2 text-xs font-black text-blue-700 transition-all hover:bg-blue-50 sm:flex-none"
                      >
                        <UserPlus size={14} />
                        إنشاء حساب
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-7 text-amber-900">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p>
          جميع الحقوق محفوظة للموقع. يرجى ذكر المصدر عند النقل. المحتوى التعليمي متاح للاستخدام
          الشخصي والتعليمي فقط.
        </p>
      </div>
    </div>
  );
}
