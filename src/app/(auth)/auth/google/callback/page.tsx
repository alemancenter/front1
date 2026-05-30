'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useStore';
import { authService } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const errorParam = searchParams.get('error');
      const legacyToken = searchParams.get('token');

      // Security hardening: never keep OAuth tokens in the browser URL.
      // The backend now authenticates the user through HttpOnly cookies and redirects here without ?token=.
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, document.title, '/auth/google/callback');
      }

      if (errorParam) {
        setError('فشل تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.');
        setTimeout(() => router.push('/login?error=google_auth_failed'), 3000);
        return;
      }

      try {
        // Backward compatibility only: if an old backend still sends ?token= once,
        // store it then immediately clean the URL. New backend path does not use this.
        if (legacyToken) {
          await apiClient.persistToken(legacyToken);
        } else {
          await apiClient.restoreFromSession();
        }

        const user = await authService.me(true);
        login(user);

        localStorage.removeItem('security_violation_attempts');
        localStorage.removeItem('security_banned');

        router.replace('/');
      } catch (err) {
        console.error('Failed to finish Google login:', err);
        setError('فشل في جلب بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-muted-foreground">جاري إعادة التوجيه...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
            <p className="text-lg font-medium">جاري تسجيل الدخول...</p>
            <p className="text-sm text-muted-foreground">يرجى الانتظار</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
          <p className="text-lg font-medium">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
