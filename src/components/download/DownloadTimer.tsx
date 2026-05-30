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
}: Props) {
  const [views, setViews] = useState<number>(viewsCount);
  const [downloads, setDownloads] = useState<number>(downloadCount);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const hasTrackedRef = useRef(false);
  const { isAuthenticated, user } = useAuthStore();
  const isProfileComplete = !!(user?.country && user?.gender);
  const isEmailVerified = !!user?.email_verified_at;
  const pathname = usePathname();

  useEffect(() => {
    setViews(viewsCount || 0);
    setDownloads(downloadCount || 0);
  }, [viewsCount, downloadCount]);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;

    const trackView = async () => {
      try {
        const response = await apiClient.post<any>(
          API_ENDPOINTS.FILES.INCREMENT_VIEW(fileId),
          { database: countryCode }
        );
        const payload = (response as any)?.data?.data || (response as any)?.data || response;
        if (typeof payload?.views_count === 'number') {
          setViews(payload.views_count);
        }
        if (typeof payload?.download_count === 'number') {
          setDownloads(payload.download_count);
        }
      } catch {
        // Silent fail - view counting is not critical
      }
    };

    trackView();
  }, [fileId, countryCode]);

  const resolveDownloadErrorMessage = (status?: number, code?: string, message?: string): string => {
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

  const handleDownload = async () => {
    setDownloadError(null);

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

    /*
     * Custom download URLs are assumed to be already safe public/signed URLs.
     * Normal article files always go through /api/download/{id}/prepare first,
     * so the user never sees a protected backend API route or raw JSON response.
     */
    if (customDownloadUrl) {
      window.location.assign(customDownloadUrl);
      return;
    }

    setIsPreparingDownload(true);

    try {
      const prepareUrl = `/api/download/${encodeURIComponent(String(fileId))}/prepare?countryCode=${encodeURIComponent(countryCode)}`;

      const response = await fetch(prepareUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = (await response.json().catch(() => null)) as PrepareDownloadResponse | null;

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

      window.location.assign(payload.download_url);
    } catch {
      setDownloadError('حدث خطأ في الاتصال أثناء تجهيز رابط التحميل. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsPreparingDownload(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-2xl mx-auto text-center">
      {/* File Icon */}
      <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <FileText size={40} />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4 break-words whitespace-normal leading-relaxed px-4 bidi-plaintext" dir="auto">{fileName}</h2>
      <div className="flex items-center justify-center gap-4 text-gray-500 mb-4 text-sm">
        <span className="bg-gray-100 px-3 py-1 rounded-full">{fileType || 'FILE'}</span>
        <span>•</span>
        <span>{formatFileSize(fileSize)}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 mb-8">
        <span className="bg-gray-100 px-3 py-1 rounded-full">المشاهدات: {views.toLocaleString('ar-EG')}</span>
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

        {downloadError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-right text-sm leading-7 text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="mt-1 shrink-0 text-rose-600" />
              <span>{downloadError}</span>
            </div>
          </div>
        )}

        {isAuthenticated && !isEmailVerified ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Lock size={24} />
            </div>
            <h3 className="text-lg font-bold text-amber-900">تفعيل البريد الإلكتروني مطلوب</h3>
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
            {isPreparingDownload ? 'جاري تجهيز رابط التحميل...' : 'تحميل الملف الآن'}
          </button>
        )}

        <p className="mt-4 text-sm text-gray-500">
          شكراً لاستخدامكم منصة التعليم. لا تنسى مشاركة الرابط مع أصدقائك!
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative text-center animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">تسجيل الدخول مطلوب</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              يجب أن تكون عضواً مسجلاً للتمكن من تحميل الملفات.<br />
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

      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
        >
          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <button
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

      {/* Safety Note */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-start gap-3 text-right">
        <AlertCircle className="text-gray-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-gray-400 leading-relaxed">
          يتم فحص جميع الملفات آلياً للتأكد من خلوها من الفيروسات. في حال واجهت أي مشكلة في التحميل، يرجى الإبلاغ عنها فوراً.
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
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
