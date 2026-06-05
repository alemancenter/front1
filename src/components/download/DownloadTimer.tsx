'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Download,
  CheckCircle,
  FileText,
  AlertCircle,
  Eye,
  X,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { useAuthStore } from '@/store/useStore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProfileCompletionPrompt from '@/components/common/ProfileCompletionPrompt';

interface Props {
  fileId: number | string;
  countryCode: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  customDownloadUrl?: string;
  viewsCount?: number;
  downloadCount?: number;
  /**
   * Mirrors the dashboard "require_login_for_download" setting. When false,
   * downloads are public — the auth modal and email-verification gate are
   * skipped and the prepare endpoint is called anonymously.
   */
  requireLoginForDownload?: boolean;
}

type PrepareDownloadResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  status?: number;
  download_url?: string;
};

export default function DownloadTimer({
  fileId,
  countryCode,
  fileName,
  fileSize,
  fileType,
  customDownloadUrl,
  viewsCount = 0,
  downloadCount = 0,
  requireLoginForDownload = true,
}: Props) {
  const [views, setViews] = useState<number>(viewsCount);
  const [downloads, setDownloads] = useState<number>(downloadCount);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isFBAndroid, setIsFBAndroid] = useState(false);
  const [isFBIOS, setIsFBIOS] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const hasTrackedRef = useRef(false);
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();

  const isProfileComplete = !!(user?.country && user?.gender);
  const isEmailVerified = !!user?.email_verified_at;

  useEffect(() => {
    setViews(viewsCount || 0);
    setDownloads(downloadCount || 0);
  }, [viewsCount, downloadCount]);

  // Detect Facebook / Instagram in-app browser per platform
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isFB = /FBAN|FBAV|FB_IAB|FBIOS|FB4A|Instagram/i.test(ua);
    if (!isFB) return;
    // Android FB WebView can download via direct URL (system download manager)
    // iOS FB WebView cannot download at all — must redirect to Safari
    setIsFBAndroid(/Android/i.test(ua));
    setIsFBIOS(/iPhone|iPad|iPod/i.test(ua));
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // Fallback for older devices
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const trackView = async () => {
      try {
        const response = await apiClient.post<any>(
          API_ENDPOINTS.FILES.INCREMENT_VIEW(fileId),
          { database: countryCode }
        );

        const payload =
          (response as any)?.data?.data ||
          (response as any)?.data ||
          response;

        if (typeof payload?.views_count === 'number') {
          setViews(payload.views_count);
        }

        if (typeof payload?.download_count === 'number') {
          setDownloads(payload.download_count);
        }
      } catch {
        // View counting is not critical.
      }
    };

    trackView();
  }, [fileId, countryCode]);

  const resolveDownloadErrorMessage = (
    status?: number,
    code?: string,
    message?: string
  ): string => {
    const normalizedCode = (code || '').toUpperCase();

    if (normalizedCode === 'AUTH_REQUIRED' || status === 401) {
      return message || 'يرجى تسجيل الدخول أولًا لتحميل الملف.';
    }

    if (normalizedCode === 'EMAIL_NOT_VERIFIED') {
      return message || 'يرجى تأكيد البريد الإلكتروني قبل تحميل الملفات.';
    }

    if (normalizedCode === 'PROFILE_INCOMPLETE') {
      return message || 'يرجى إكمال بيانات الحساب قبل تحميل الملفات.';
    }

    if (normalizedCode === 'FILE_NOT_FOUND' || status === 404) {
      return message || 'الملف غير موجود أو لم يعد متاحًا.';
    }

    if (status === 403) {
      return message || 'حسابك لا يملك صلاحية تحميل هذا الملف.';
    }

    return message || 'تعذر تجهيز رابط التحميل حاليًا. يرجى المحاولة مرة أخرى.';
  };

  const getFileNameFromContentDisposition = (
    disposition: string | null,
    fallbackFileName: string
  ): string => {
    if (!disposition) return fallbackFileName || 'alemancenter-file';

    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1].trim());
      } catch {
        return utf8Match[1].trim();
      }
    }

    const normalMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (normalMatch?.[1]) {
      return normalMatch[1].trim();
    }

    return fallbackFileName || 'alemancenter-file';
  };

  // iOS FB WebView: redirect current page to Safari using the x-safari URL scheme.
  // This opens the SAME page in Safari so the user can click download normally.
  const openCurrentPageInSafari = () => {
    const pageUrl = window.location.href;
    // x-safari-https:// tells iOS to hand the URL off to Safari
    window.location.href = pageUrl.replace(/^https?:\/\//, (m) =>
      m === 'https://' ? 'x-safari-https://' : 'x-safari-http://'
    );
  };

  // Android FB WebView: navigate directly to the signed URL.
  // Android's system download manager intercepts the Content-Disposition: attachment
  // header and saves the file — no blob or anchor.click() needed.
  const downloadViaDirectUrl = (downloadUrl: string) => {
    window.location.href = downloadUrl;
  };

  const downloadFileInsidePage = async (
    downloadUrl: string,
    fallbackFileName: string
  ) => {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: '*/*',
        'X-Requested-With': 'XMLHttpRequest',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      let message = 'تعذر تحميل الملف حاليًا.';

      try {
        const data = await response.json();
        message = data?.message || message;
      } catch {
        // Response is not JSON.
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    const finalFileName = getFileNameFromContentDisposition(
      response.headers.get('content-disposition'),
      fallbackFileName || fileName || 'alemancenter-file'
    );

    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = finalFileName;
    anchor.style.display = 'none';
    anchor.rel = 'noopener';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    // Delay revoke for better compatibility with mobile browsers.
    window.setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 1000);
  };

  const handleDownload = async () => {
    if (isPreparingDownload) return;

    // iOS FB WebView cannot download — hand off to Safari immediately
    if (isFBIOS) {
      openCurrentPageInSafari();
      return;
    }

    setDownloadError(null);

    // When the admin disables the login-for-download gate, skip every auth
    // step so anonymous visitors can download immediately.
    if (requireLoginForDownload) {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      }

      if (!isEmailVerified) {
        setDownloadError('يرجى تأكيد البريد الإلكتروني قبل تحميل الملفات.');
        return;
      }

      if (!isProfileComplete) {
        setShowProfileModal(true);
        return;
      }
    }

    setIsPreparingDownload(true);

    try {
      if (customDownloadUrl) {
        if (isFBAndroid) {
          downloadViaDirectUrl(customDownloadUrl);
        } else {
          await downloadFileInsidePage(customDownloadUrl, fileName || 'alemancenter-file');
        }
        setDownloads((current) => current + 1);
        return;
      }

      const prepareUrl = `/api/download/${encodeURIComponent(
        String(fileId)
      )}/prepare?countryCode=${encodeURIComponent(countryCode)}`;

      const response = await fetch(prepareUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = (await response
        .json()
        .catch(() => null)) as PrepareDownloadResponse | null;

      if (!response.ok || !payload?.success || !payload?.download_url) {
        const message = resolveDownloadErrorMessage(
          response.status,
          payload?.code,
          payload?.message
        );

        setDownloadError(message);

        if (response.status === 401 || payload?.code === 'AUTH_REQUIRED') {
          setShowAuthModal(true);
        }

        return;
      }

      if (isFBAndroid) {
        // Android FB WebView: navigate directly — system download manager handles it
        downloadViaDirectUrl(payload.download_url);
      } else {
        await downloadFileInsidePage(
          payload.download_url,
          fileName || 'alemancenter-file'
        );
      }

      setDownloads((current) => current + 1);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'حدث خطأ في الاتصال أثناء تحميل الملف. يرجى المحاولة مرة أخرى.';

      setDownloadError(message);
    } finally {
      setIsPreparingDownload(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText size={40} />
      </div>

      <h2
        className="text-2xl font-bold text-gray-900 mb-4 break-words whitespace-normal leading-relaxed px-4 bidi-plaintext"
        dir="auto"
      >
        {fileName}
      </h2>

      <div className="flex items-center justify-center gap-4 text-gray-500 mb-4 text-sm">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          {fileType || 'FILE'}
        </span>
        <span>•</span>
        <span>{formatFileSize(fileSize)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 mb-8">
        <span className="bg-gray-100 px-3 py-1 rounded-full">
          المشاهدات: {views.toLocaleString('ar-EG')}
        </span>
        <span className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
          <Eye size={12} className="text-gray-400" />
          التنزيلات: {downloads.toLocaleString('ar-EG')}
        </span>
      </div>

      <div>
        <div className="mb-6 flex items-center justify-center gap-2 text-green-600 font-medium">
          <CheckCircle size={20} />
          <span>رابط التحميل جاهز!</span>
        </div>

        {/* Android FB WebView: small info banner — download works via system manager */}
        {isFBAndroid && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-right text-sm text-blue-800">
            <span className="font-bold">تنبيه: </span>
            سيبدأ التحميل عبر مدير التنزيلات في جهازك تلقائياً.
          </div>
        )}

        {/* iOS FB WebView: one-tap "open in Safari" — blob downloads are impossible on iOS WebView */}
        {isFBIOS && (
          <div className="mb-6 rounded-2xl border-2 border-blue-300 bg-blue-50 p-5 text-right">
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle size={22} className="shrink-0 text-blue-600" />
              <h3 className="font-black text-blue-900">يجب فتح الصفحة في Safari للتحميل</h3>
            </div>
            <p className="mb-4 text-sm leading-7 text-blue-800">
              متصفح فيسبوك على iPhone لا يسمح بتحميل الملفات مباشرة.
              اضغط الزر أدناه لفتح الصفحة في Safari وتحميل الملف بنقرة واحدة.
            </p>
            <button
              type="button"
              onClick={openCurrentPageInSafari}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 mb-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              فتح في Safari وتحميل الملف
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
            >
              {linkCopied ? (
                <><CheckCircle size={16} /> تم نسخ الرابط!</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> نسخ الرابط</>
              )}
            </button>
          </div>
        )}

        {downloadError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-right text-sm leading-7 text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-1 shrink-0 text-rose-600" />
              <span>{downloadError}</span>
            </div>
          </div>
        )}

        {requireLoginForDownload && isAuthenticated && !isEmailVerified ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lock size={24} />
            </div>

            <h3 className="text-lg font-bold text-amber-900">
              تفعيل البريد الإلكتروني مطلوب
            </h3>

            <p className="mt-2 text-sm leading-7 text-amber-800">
              يجب تفعيل بريدك الإلكتروني قبل تحميل الملفات المرفقة.
            </p>

            <Link
              href="/verify-email"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-700 sm:w-auto"
            >
              <Mail size={16} />
              تفعيل البريد الآن
            </Link>
          </div>
        ) : (
          // iOS FB WebView: hide main button — Safari button above handles it
          !isFBIOS && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isPreparingDownload}
              className="inline-flex items-center justify-center gap-3 bg-primary text-white text-lg font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 w-full sm:w-auto transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
            >
              {isPreparingDownload ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Download size={24} />
              )}
              {isPreparingDownload
                ? 'جاري تحميل الملف...'
                : isFBAndroid
                  ? 'تحميل عبر مدير التنزيلات'
                  : 'تحميل الملف الآن'}
            </button>
          )
        )}

        <p className="mt-4 text-sm text-gray-500">
          شكراً لاستخدامكم منصة التعليم. لا تنسى مشاركة الرابط مع أصدقائك!
        </p>
      </div>

      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              تسجيل الدخول مطلوب
            </h3>

            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              يجب أن تكون عضواً مسجلاً للتمكن من تحميل الملفات.
              <br />
              سجّل الدخول أو أنشئ حساباً مجاناً للوصول إلى جميع المواد.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`/login?return=${encodeURIComponent(pathname)}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all"
              >
                <LogIn size={18} />
                تسجيل الدخول
              </Link>

              <Link
                href={`/register?return=${encodeURIComponent(pathname)}`}
                className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-all"
              >
                <UserPlus size={18} />
                إنشاء حساب
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              التسجيل مجاني تماماً ويستغرق أقل من دقيقة
            </p>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
        >
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute -top-3 -left-3 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>

            <ProfileCompletionPrompt
              description="يرجى تحديد دولتك وجنسك لتتمكن من تحميل الملفات"
              onComplete={() => setShowProfileModal(false)}
            />
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 text-right">
        <AlertCircle className="text-gray-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-gray-400 leading-relaxed">
          يتم فحص جميع الملفات آلياً للتأكد من خلوها من الفيروسات. في حال واجهت
          أي مشكلة في التحميل، يرجى الإبلاغ عنها فوراً.
        </p>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}