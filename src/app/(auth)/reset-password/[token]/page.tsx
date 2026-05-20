'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { ArrowLeft, CheckCircle, KeyRound, Lock, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService } from '@/lib/api/services';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-700" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const token = useMemo(() => {
    const t = params?.token;
    if (typeof t === 'string') return t;
    if (Array.isArray(t)) return t[0] ?? '';
    return '';
  }, [params]);

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!token) nextErrors.token = 'رابط إعادة التعيين غير صالح أو منتهي';
    if (!email.trim()) nextErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
    if (!password) nextErrors.password = 'كلمة المرور الجديدة مطلوبة';
    else if (password.length < 8) nextErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (password !== passwordConfirmation) nextErrors.passwordConfirmation = 'كلمتا المرور غير متطابقتين';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await authService.resetPassword({ token, email: email.trim(), password, password_confirmation: passwordConfirmation });
      router.push('/login?reset=1');
    } catch (err: unknown) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : 'فشل إعادة تعيين كلمة المرور، يرجى المحاولة لاحقاً';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-7 text-center sm:text-right">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 sm:mx-0"><KeyRound className="h-7 w-7" /></div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">تحديث كلمة المرور</h1>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-600">اختر كلمة مرور قوية لحسابك، ثم سجّل الدخول من جديد.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.token && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">{errors.token}</div>}
        {serverError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">{serverError}</div>}

        <Input label="البريد الإلكتروني" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" leftIcon={<Mail className="h-5 w-5" />} error={errors.email} inputSize="lg" variant="filled" required />
        <Input label="كلمة المرور الجديدة" type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5" />} error={errors.password} inputSize="lg" variant="filled" required />
        <Input label="تأكيد كلمة المرور" type="password" name="passwordConfirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} placeholder="••••••••" leftIcon={<Lock className="h-5 w-5" />} error={errors.passwordConfirmation} inputSize="lg" variant="filled" required />

        <Button type="submit" isLoading={isLoading} className="h-12 w-full rounded-2xl bg-blue-700 text-base font-black hover:bg-blue-800" rightIcon={<ArrowLeft className="h-5 w-5" />}>تحديث كلمة المرور</Button>
      </form>

      {token && (
        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
          <CheckCircle className="h-4 w-4" />
          تم فتح رابط إعادة التعيين
        </div>
      )}

      <p className="mt-7 text-center text-sm font-bold text-slate-600"><Link href="/login" className="font-black text-blue-700 hover:underline">العودة لتسجيل الدخول</Link></p>
    </motion.div>
  );
}
