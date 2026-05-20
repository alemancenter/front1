'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from '@/lib/motion-lite';
import { ArrowLeft, CheckCircle, Mail, ShieldQuestion } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authService } from '@/lib/api/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validate = () => {
    if (!email.trim()) {
      setEmailError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('صيغة البريد الإلكتروني غير صحيحة');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessMessage(res.message || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err: unknown) {
      const message = typeof err === 'object' && err && 'message' in err ? String((err as { message?: string }).message) : 'فشل إرسال رابط إعادة التعيين، يرجى المحاولة لاحقاً';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-5 text-center sm:mb-7 sm:text-right">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:mx-0 sm:h-14 sm:w-14 sm:rounded-2xl"><ShieldQuestion className="h-5 w-5 sm:h-7 sm:w-7" /></div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">نسيت كلمة المرور؟</h1>
        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600 sm:mt-2 sm:leading-7">أدخل بريدك الإلكتروني وسنرسل لك رابطًا آمنًا لإعادة تعيين كلمة المرور.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-7 text-red-700">{serverError}</div>}
        {successMessage && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-7 text-emerald-800">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>{successMessage}</div>
          </div>
        )}

        <Input label="البريد الإلكتروني" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" leftIcon={<Mail className="h-5 w-5" />} error={emailError} inputSize="lg" variant="filled" required />

        <Button type="submit" isLoading={isLoading} className="h-12 w-full rounded-2xl bg-blue-700 text-base font-black hover:bg-blue-800" rightIcon={<ArrowLeft className="h-5 w-5" />}>إرسال رابط إعادة التعيين</Button>
      </form>

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-7 text-blue-800">
        تأكد من مراجعة البريد غير المرغوب فيه إذا لم يصلك الرابط خلال دقائق.
      </div>

      <p className="mt-7 text-center text-sm font-bold text-slate-600">تذكرت كلمة المرور؟ <Link href="/login" className="font-black text-blue-700 hover:underline">العودة لتسجيل الدخول</Link></p>
    </motion.div>
  );
}
