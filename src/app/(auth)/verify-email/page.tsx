'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { CheckCircle, AlertTriangle, Mail, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { authService } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/useStore';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login } = useAuthStore();
  const id = searchParams.get('id') ?? '';
  const hash = searchParams.get('token') ?? searchParams.get('hash') ?? '';

  // If has id and hash, show verification result
  const hasVerificationParams = id && hash;

  const [status, setStatus] = useState<'pending' | 'loading' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);
  const resendCooldownKey = `alemancenter_verify_resend_until:${user?.email || 'anonymous'}`;

  // Check if user is already verified
  useEffect(() => {
    if (user?.email_verified_at && !hasVerificationParams) {
      router.push('/');
    }
  }, [user, router, hasVerificationParams]);

  // Restore and handle resend cooldown.
  useEffect(() => {
    const savedUntil = Number(window.localStorage.getItem(resendCooldownKey) || '0');
    if (savedUntil > Date.now()) {
      setCountdown(Math.ceil((savedUntil - Date.now()) / 1000));
    }
  }, [resendCooldownKey]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  // Verify email — called only when the user explicitly clicks the confirm button.
  // NOT triggered automatically on mount so that email security scanners
  // (Outlook Safe Links, Gmail pre-fetch) cannot consume the one-time token
  // before the real user has a chance to act.
  const handleConfirmVerification = async () => {
    if (status === 'loading' || !hasVerificationParams) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await authService.verifyEmail(id, hash);
      try {
        const updatedUser = await authService.me();
        login(updatedUser);
      } catch {
        // non-fatal — user will be refreshed on next navigation
      }
      setStatus('success');
      setMessage(res.message || 'تم تأكيد البريد الإلكتروني بنجاح.');
      setTimeout(() => { router.push('/'); }, 2000);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message)
          : 'فشل تأكيد البريد الإلكتروني';
      setStatus('error');
      setMessage(msg);
    }
  };

  const startResendCooldown = (seconds = 60) => {
    setCountdown(seconds);
    window.localStorage.setItem(resendCooldownKey, String(Date.now() + seconds * 1000));
  };

  const handleResend = async () => {
    if (resendStatus === 'loading' || countdown > 0) return;
    const token = apiClient.getToken();
    if (!token) {
      setResendStatus('error');
      setResendMessage('يرجى تسجيل الدخول أولاً لإعادة إرسال رابط التحقق.');
      return;
    }
    setResendStatus('loading');
    setResendMessage('');
    try {
      const res = await authService.resendVerifyEmail();
      setResendStatus('success');
      setResendMessage(res.message || 'تم إرسال رابط التحقق إلى بريدك الإلكتروني');
      startResendCooldown(60);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message?: string }).message)
          : 'فشل إعادة إرسال رابط التحقق';
      setResendStatus('error');
      setResendMessage(msg.includes('الحد') || msg.includes('Rate') ? 'تم إرسال طلبات كثيرة. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.' : msg);
      startResendCooldown(60);
    }
  };

  const handleCheckVerification = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const updatedUser = await authService.me();

      if (updatedUser.email_verified_at != null && updatedUser.email_verified_at !== '') {
        // Update the user in the store with verified email
        login(updatedUser);

        setResendStatus('success');
        setResendMessage('تم التحقق من بريدك الإلكتروني بنجاح!');

        // Redirect to homepage after 1 second
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setResendStatus('error');
        setResendMessage('لم يتم التحقق من بريدك الإلكتروني بعد');
      }
    } catch (error: any) {
      setResendStatus('error');
      setResendMessage(error.message || 'فشل في التحقق من الحالة');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (changeEmailLoading || countdown > 0) return;
    if (!newEmail.trim()) {
      setResendStatus('error');
      setResendMessage('يرجى إدخال البريد الجديد');
      return;
    }
    try {
      setChangeEmailLoading(true);
      const preflight = await authService.preflightEmail(newEmail.trim());
      if (!preflight.can_register) {
        setResendStatus('error');
        if (preflight.reason === 'already_used') {
          setResendMessage('هذا البريد الإلكتروني متواجد في قاعدة البيانات ولا يمكن استخدامه');
        } else if (preflight.reason === 'disposable_email') {
          setResendMessage('لا يمكن استخدام بريد مؤقت للحساب');
        } else {
          setResendMessage(preflight.suggestion ? `هذا البريد لا يستقبل الرسائل. هل تقصد ${preflight.suggestion}؟` : 'هذا البريد لا يبدو قابلاً لاستقبال رسائل التفعيل');
        }
        return;
      }
      const result = await authService.changeUnverifiedEmail(newEmail.trim());
      login(result.user);
      setShowChangeEmail(false);
      setNewEmail('');
      setResendStatus(result.verification_email_sent ? 'success' : 'error');
      setResendMessage(result.verification_email_sent ? 'تم تغيير البريد وإرسال رابط تفعيل جديد' : 'تم تغيير البريد لكن تعذر إرسال رابط التفعيل. حاول إعادة الإرسال لاحقاً.');
      startResendCooldown(60);
    } catch (error: any) {
      setResendStatus('error');
      const msg = error?.message || 'تعذر تغيير البريد الإلكتروني';
      setResendMessage(String(msg).includes('الحد') || String(msg).includes('Rate') ? 'تم إرسال طلبات كثيرة. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.' : msg);
      startResendCooldown(60);
    } finally {
      setChangeEmailLoading(false);
    }
  };

  // Show verification result page (when clicking link from email)
  if (hasVerificationParams) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">تأكيد البريد الإلكتروني</h1>
          <p className="text-muted-foreground">
            {status === 'pending'
              ? 'اضغط الزر أدناه لتفعيل حسابك'
              : 'نقوم بتأكيد بريدك الإلكتروني لتفعيل حسابك'}
          </p>
        </div>

        {status === 'pending' && (
          <div className="p-4 rounded-lg bg-muted/40 text-sm text-muted-foreground mb-4">
            تم فتح رابط التحقق بنجاح. اضغط &quot;تأكيد البريد الآن&quot; لإتمام التفعيل.
          </div>
        )}

        {status === 'loading' && (
          <div className="p-3 rounded-lg bg-muted/40 text-sm text-muted-foreground">جاري تأكيد البريد الإلكتروني...</div>
        )}

        {status === 'success' && (
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 mt-0.5" />
            <div className="leading-6">{message}</div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-error/10 text-error text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5" />
              <div className="leading-6">{message}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              إذا كان الرابط منتهياً، يمكنك طلب رابط تحقق جديد.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {status === 'pending' && (
            <Button
              type="button"
              className="w-full"
              leftIcon={<CheckCircle className="w-5 h-5" />}
              onClick={handleConfirmVerification}
            >
              تأكيد البريد الآن
            </Button>
          )}

          {status === 'error' && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              leftIcon={<Mail className="w-5 h-5" />}
              onClick={handleResend}
              disabled={resendStatus === 'loading' || countdown > 0}
            >
              {countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : 'إرسال رابط تحقق جديد'}
            </Button>
          )}

          <Button type="button" variant="outline" className="w-full" rightIcon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.push('/login')}>
            الانتقال لتسجيل الدخول
          </Button>
        </div>
      </motion.div>
    );
  }

  // Show waiting for verification page (when redirected before accessing dashboard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold mb-2">تحقق من بريدك الإلكتروني</h1>
              <p className="text-muted-foreground">
                تم إرسال رابط التحقق إلى بريدك الإلكتروني
              </p>
              {user?.email && (
                <p className="text-sm font-medium text-primary mt-2">
                  {user.email}
                </p>
              )}
            </div>

            {/* Message */}
            {(resendStatus === 'success' || resendStatus === 'error') && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                resendStatus === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-red-500/10 text-red-600'
              }`}>
                {resendStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span className="text-sm">{resendMessage}</span>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/50 p-4 rounded-lg text-right space-y-2">
              <p className="text-sm font-medium">الخطوات:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>افتح بريدك الإلكتروني</li>
                <li>ابحث عن رسالة التحقق</li>
                <li>انقر على رابط التحقق</li>
                <li>ارجع إلى هذه الصفحة واضغط &quot;تحقق الآن&quot;</li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckVerification}
                isLoading={loading}
                className="w-full"
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                تحقق الآن
              </Button>

              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resendStatus === 'loading' || countdown > 0}
                className="w-full"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                {countdown > 0
                  ? `إعادة الإرسال بعد ${countdown} ثانية`
                  : 'إعادة إرسال البريد'
                }
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowChangeEmail((value) => !value)}
                className="w-full"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                تغيير البريد الإلكتروني
              </Button>
            </div>

            {showChangeEmail && (
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-right">
                <label className="mb-2 block text-sm font-bold">البريد الإلكتروني الجديد</label>
                <input name="field-app-auth-verify-email-page-319-1"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="example@email.com"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
                <Button
                  onClick={handleChangeEmail}
                  isLoading={changeEmailLoading}
                  disabled={changeEmailLoading || countdown > 0}
                  className="mt-3 w-full"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  {countdown > 0 ? `انتظر ${countdown} ثانية` : 'حفظ البريد وإرسال رابط جديد'}
                </Button>
              </div>
            )}

            {/* Help Text */}
            <p className="text-xs text-muted-foreground">
              لم تستلم البريد؟ تحقق من مجلد الرسائل غير المرغوب فيها (Spam)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
