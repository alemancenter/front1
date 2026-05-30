'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/useStore';
import { authService } from '@/lib/api/services';
import { API_CONFIG } from '@/lib/api/config';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-700" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AlertBox({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  const styles = type === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-red-200 bg-red-50 text-red-700';
  return <div className={`min-w-0 overflow-hidden rounded-2xl border px-3 py-3 text-sm font-bold leading-7 sm:px-4 ${styles}`}>{children}</div>;
}

function FacebookMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [formData, setFormData] = useState({ email: '', password: '', remember: false });
  const justReset = searchParams.get('reset') === '1';
  const googleError = searchParams.get('error') === 'google_auth_failed';
  const facebookError = searchParams.get('error') === 'facebook_auth_failed';

  useEffect(() => {
    const ret = searchParams.get('return');
    if (!ret) return;
    if (ret === '/login' || ret.startsWith('/login?') || ret.startsWith('/login/')) router.replace('/login');
  }, [router, searchParams]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    setServerError('');
    window.location.href = `${API_CONFIG.BASE_URL}/auth/google/redirect`;
  };

  const handleFacebookLogin = () => {
    setIsFacebookLoading(true);
    setServerError('');
    window.location.href = `${API_CONFIG.BASE_URL}/auth/facebook/redirect`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setServerError('');
    try {
      const res = await authService.login({ email: formData.email, password: formData.password });
      const resolvedUser = await authService.me().catch(() => res.user);
      if (!resolvedUser) throw new Error('فشل تحميل بيانات المستخدم');
      login(resolvedUser);
      localStorage.removeItem('security_violation_attempts');
      localStorage.removeItem('security_banned');
      if (!resolvedUser.email_verified_at) {
        router.push('/verify-email');
        return;
      }
      let ret = searchParams.get('return');
      if (ret) {
        try { ret = decodeURIComponent(ret); } catch { ret = null; }
      }
      if (ret && ret.startsWith('/') && !ret.startsWith('//') && !/[<>'"\\]/.test(ret) && ret !== '/login' && !ret.startsWith('/login?') && !ret.startsWith('/login/')) router.push(ret);
      else router.push('/');
    } catch (err: unknown) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : 'فشل تسجيل الدخول، يرجى المحاولة لاحقاً';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0">
      <div className="mb-4 text-center sm:mb-7 sm:text-right">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:mx-0 sm:h-14 sm:w-14 sm:rounded-2xl">
          <ShieldCheck className="h-5 w-5 sm:h-7 sm:w-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">تسجيل الدخول</h1>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600 sm:mt-2 sm:leading-7">أدخل بيانات حسابك للوصول إلى الملفات والمحتوى المحفوظ.</p>
      </div>

      <form onSubmit={handleSubmit} className="min-w-0 space-y-3.5 sm:space-y-4">
        {justReset && <AlertBox type="success"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول بكلمتك الجديدة.</span></AlertBox>}
        {googleError && <AlertBox type="error">فشل تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.</AlertBox>}
        {facebookError && <AlertBox type="error">فشل تسجيل الدخول باستخدام Facebook. يرجى المحاولة مرة أخرى.</AlertBox>}
        {serverError && <AlertBox type="error">{serverError}</AlertBox>}

        <Input label="البريد الإلكتروني" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" leftIcon={<Mail className="h-5 w-5" />} inputSize="lg" variant="filled" error={undefined} required />

        <Input
          label="كلمة المرور"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          inputSize="lg"
          variant="filled"
          rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>}
          required
        />

        <div className="flex flex-col gap-2 text-center min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:text-right">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-600">
            <input type="checkbox" name="remember" checked={formData.remember} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200" />
            تذكرني
          </label>
          <Link href="/forgot-password" className="text-sm font-black text-blue-700 hover:text-blue-800 hover:underline">نسيت كلمة المرور؟</Link>
        </div>

        <Button type="submit" isLoading={isLoading} className="min-h-12 w-full rounded-2xl bg-blue-700 px-3 py-3 text-base font-black hover:bg-blue-800 [&>span]:min-w-0" rightIcon={<ArrowLeft className="h-5 w-5" />}>تسجيل الدخول</Button>
      </form>

      <div className="relative my-5 sm:my-7">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="bg-white px-3 font-bold text-slate-500 sm:px-4">أو تابع باستخدام</span></div>
      </div>

      <div className="space-y-3">
        <Button variant="outline" type="button" className="min-h-12 w-full min-w-0 rounded-2xl border-slate-200 bg-white px-3 py-3 text-sm font-black leading-6 text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:text-base [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:leading-6" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
          {isGoogleLoading ? <div className="ml-2 h-5 w-5 animate-spin rounded-full border-b-2 border-current" /> : <GoogleMark />}
          {isGoogleLoading ? 'جاري التحويل...' : 'تسجيل الدخول باستخدام Google'}
        </Button>
        <Button variant="outline" type="button" className="min-h-12 w-full min-w-0 rounded-2xl border-slate-200 bg-white px-3 py-3 text-sm font-black leading-6 text-slate-800 hover:border-[#1877F2]/30 hover:bg-blue-50 hover:text-[#1877F2] sm:text-base [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:leading-6" onClick={handleFacebookLogin} disabled={isFacebookLoading}>
          {isFacebookLoading ? <div className="ml-2 h-5 w-5 animate-spin rounded-full border-b-2 border-current" /> : <FacebookMark />}
          {isFacebookLoading ? 'جاري التحويل...' : 'تسجيل الدخول باستخدام Facebook'}
        </Button>
      </div>

      <p className="mt-7 text-center text-sm font-bold text-slate-600">ليس لديك حساب؟ <Link href="/register" className="font-black text-blue-700 hover:underline">إنشاء حساب جديد</Link></p>
    </motion.div>
  );
}
