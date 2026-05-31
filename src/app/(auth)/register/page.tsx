'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, Lock, Loader2, Mail, ShieldCheck, User, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/useStore';
import { authService } from '@/lib/api/services';
import { API_CONFIG } from '@/lib/api/config';

const passwordRequirements = [
  { label: '8 أحرف على الأقل', check: (p: string) => p.length >= 8 },
  { label: 'حرف كبير واحد', check: (p: string) => /[A-Z]/.test(p) },
  { label: 'حرف صغير واحد', check: (p: string) => /[a-z]/.test(p) },
  { label: 'رقم واحد', check: (p: string) => /[0-9]/.test(p) },
];

function emailPreflightMessage(reason?: string, suggestion?: string) {
  if (reason === 'already_used') return 'هذا البريد الإلكتروني متواجد في قاعدة البيانات ولا يمكن استخدامه';
  if (reason === 'disposable_email') return 'لا يمكن استخدام بريد مؤقت لإنشاء الحساب';
  if (reason === 'no_mx') return suggestion ? `هذا البريد لا يستقبل الرسائل. هل تقصد ${suggestion}؟` : 'هذا البريد لا يبدو قادراً على استقبال الرسائل';
  if (reason === 'invalid_format') return 'صيغة البريد الإلكتروني غير صحيحة';
  return 'تعذر قبول هذا البريد للتسجيل';
}

function isGoogleEmail(email: string) {
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  return domain === 'gmail.com' || domain === 'googlemail.com';
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

function AlertBox({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-bold leading-7 text-red-700 sm:px-4">{children}</div>;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [emailPreflight, setEmailPreflight] = useState<{ can_register?: boolean; reason?: string; suggestion?: string } | null>(null);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emailRequestSeqRef = useRef(0);
  const emailPreflightCacheRef = useRef<Record<string, { can_register?: boolean; reason?: string; suggestion?: string }>>({});
  const shouldSuggestGoogleSignup = isGoogleEmail(formData.email) && emailStatus === 'available';

  useEffect(() => {
    const email = formData.email.trim();
    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus('idle');
      setEmailPreflight(null);
      return;
    }
    const cached = emailPreflightCacheRef.current[email];
    if (cached) {
      setEmailPreflight(cached);
      setEmailStatus(cached.can_register ? 'available' : 'taken');
      setErrors(prev => ({ ...prev, email: cached.can_register ? '' : emailPreflightMessage(cached.reason, cached.suggestion) }));
      return;
    }

    setEmailStatus('checking');
    const requestSeq = ++emailRequestSeqRef.current;
    emailDebounceRef.current = setTimeout(async () => {
      try {
        const result = await authService.preflightEmail(email);
        if (requestSeq !== emailRequestSeqRef.current) return;
        emailPreflightCacheRef.current[email] = result;
        setEmailPreflight(result);
        setEmailStatus(result.can_register ? 'available' : 'taken');
        setErrors(prev => ({ ...prev, email: result.can_register ? '' : emailPreflightMessage(result.reason, result.suggestion) }));
      } catch (error: unknown) {
        if (requestSeq !== emailRequestSeqRef.current) return;
        const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message) : '';
        setEmailStatus('idle');
        if (message.includes('الحد') || message.includes('Rate')) {
          setErrors(prev => ({ ...prev, email: 'طلبات فحص البريد كثيرة. يرجى الانتظار قليلًا ثم المتابعة.' }));
        }
      }
    }, 900);
  }, [formData.email]);

  const handleGoogleSignup = () => {
    setIsGoogleLoading(true);
    setServerError('');
    window.location.href = `${API_CONFIG.BASE_URL}/auth/google/redirect`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'البريد الإلكتروني غير صحيح';
    if (!formData.password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (formData.password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    if (!formData.terms) newErrors.terms = 'يجب الموافقة على الشروط والأحكام';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validateForm()) return;
    if (emailStatus === 'taken' || emailPreflight?.can_register === false) return;
    if (emailStatus === 'checking') {
      setErrors((prev) => ({ ...prev, email: 'يرجى الانتظار حتى انتهاء فحص البريد.' }));
      return;
    }
    setIsLoading(true);
    setServerError('');
    try {
      const res = await authService.register({ name: formData.name.trim(), email: formData.email.trim(), password: formData.password, password_confirmation: formData.confirmPassword });
      if (!res.user) throw new Error('فشل إنشاء الحساب، يرجى المحاولة لاحقاً');
      login(res.user);
      router.push('/verify-email');
    } catch (err: unknown) {
      const maybeErrors = typeof err === 'object' && err && 'errors' in err ? (err as { errors?: Record<string, string | string[]> }).errors : undefined;
      const fieldErr = (v: string | string[] | undefined): string => Array.isArray(v) ? (v[0] ?? '') : (v ?? '');
      if (maybeErrors) {
        const next: Record<string, string> = {};
        if (maybeErrors.name) next.name = fieldErr(maybeErrors.name);
        if (maybeErrors.email) next.email = fieldErr(maybeErrors.email);
        if (maybeErrors.password) next.password = fieldErr(maybeErrors.password);
        if (maybeErrors.password_confirmation) next.confirmPassword = fieldErr(maybeErrors.password_confirmation);
        setErrors((prev) => ({ ...prev, ...next }));
        if (Object.keys(next).length > 0) return;
      }
      const message = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : 'فشل إنشاء الحساب، يرجى المحاولة لاحقاً';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'email') setEmailPreflight(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0">
      <div className="mb-4 text-center sm:mb-7 sm:text-right">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:mx-0 sm:h-14 sm:w-14 sm:rounded-2xl"><ShieldCheck className="h-5 w-5 sm:h-7 sm:w-7" /></div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">إنشاء حساب جديد</h1>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600 sm:mt-2 sm:leading-7">ابدأ حسابك للوصول إلى التحميلات، التعليقات، والمحتوى التعليمي المحفوظ.</p>
      </div>

      <form onSubmit={handleSubmit} className="min-w-0 space-y-3 sm:space-y-4">
        {serverError && <AlertBox>{serverError}</AlertBox>}
        <Input label="الاسم الكامل" name="name" value={formData.name} onChange={handleChange} placeholder="أدخل اسمك الكامل" leftIcon={<User className="h-5 w-5" />} error={errors.name} inputSize="lg" variant="filled" required />
        <Input
          label="البريد الإلكتروني"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          leftIcon={<Mail className="h-5 w-5" />}
          rightIcon={
            emailStatus === 'checking' ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> :
            emailStatus === 'available' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> :
            emailStatus === 'taken' ? <XCircle className="h-4 w-4 text-red-500" /> : undefined
          }
          error={errors.email}
          inputSize="lg"
          variant="filled"
          required
        />
        {emailPreflight?.suggestion && (
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, email: emailPreflight.suggestion || prev.email }))}
            className="text-sm font-bold text-blue-700 hover:underline"
          >
            هل تقصد {emailPreflight.suggestion}؟
          </button>
        )}
        {emailStatus === 'available' && (
          <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            البريد صالح مبدئياً ويمكن إرسال رسالة التفعيل إليه.
          </p>
        )}
        {shouldSuggestGoogleSignup && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm font-bold leading-6 text-blue-800">
              لأن بريدك من Google، يمكنك إنشاء الحساب مباشرة بدون انتظار رسالة تفعيل.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
            >
              {isGoogleLoading ? <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" /> : <GoogleMark />}
              التسجيل باستخدام Google مباشرة
            </button>
          </div>
        )}
        <p className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold leading-6 text-amber-800">
          استخدم بريداً تستطيع فتحه الآن. الحساب يحتاج تفعيل البريد، والبريد الممتلئ أو القديم قد يمنع وصول الرابط.
        </p>
        <Input
          label="كلمة المرور"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          leftIcon={<Lock className="h-5 w-5" />}
          rightIcon={<button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>}
          error={errors.password}
          inputSize="lg"
          variant="filled"
          required
        />

        {formData.password && (
          <div className="grid min-w-0 grid-cols-1 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm sm:grid-cols-2">
            {passwordRequirements.map((req) => {
              const ok = req.check(formData.password);
              return (
                <div key={req.label} className={`flex min-w-0 items-center gap-2 font-bold ${ok ? 'text-emerald-700' : 'text-slate-600'}`}>
                  <Check className={`h-4 w-4 ${ok ? 'opacity-100' : 'opacity-45'}`} />
                  {req.label}
                </div>
              );
            })}
          </div>
        )}

        <Input label="تأكيد كلمة المرور" type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5" />} error={errors.confirmPassword} inputSize="lg" variant="filled" required />

        <div>
          <label className="flex min-w-0 cursor-pointer items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200" />
            <span className="min-w-0 text-sm font-bold leading-7 text-slate-600">أوافق على <Link href="/terms-of-service" className="text-blue-700 hover:underline">الشروط والأحكام</Link> و <Link href="/privacy-policy" className="text-blue-700 hover:underline">سياسة الخصوصية</Link></span>
          </label>
          {errors.terms && <p className="mt-1 text-sm font-bold text-red-600">{errors.terms}</p>}
        </div>

        <Button type="submit" isLoading={isLoading} disabled={emailStatus === 'checking' || emailStatus === 'taken'} className="min-h-12 w-full rounded-2xl bg-blue-700 px-3 py-3 text-base font-black hover:bg-blue-800 [&>span]:min-w-0" rightIcon={<ArrowLeft className="h-5 w-5" />}>إنشاء الحساب</Button>
      </form>

      <div className="relative my-5 sm:my-7"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-sm"><span className="bg-white px-3 font-bold text-slate-500 sm:px-4">أو سجل باستخدام</span></div></div>

      <Button variant="outline" type="button" className="min-h-12 w-full min-w-0 rounded-2xl border-slate-200 bg-white px-3 py-3 text-sm font-black leading-6 text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:text-base [&>span]:min-w-0 [&>span]:whitespace-normal [&>span]:leading-6" onClick={handleGoogleSignup} disabled={isGoogleLoading}>
        {isGoogleLoading ? <div className="ml-2 h-5 w-5 animate-spin rounded-full border-b-2 border-current" /> : <GoogleMark />}
        {isGoogleLoading ? 'جاري التحويل...' : 'التسجيل باستخدام Google'}
      </Button>

      <p className="mt-7 text-center text-sm font-bold text-slate-600">لديك حساب بالفعل؟ <Link href="/login" className="font-black text-blue-700 hover:underline">تسجيل الدخول</Link></p>
    </motion.div>
  );
}
