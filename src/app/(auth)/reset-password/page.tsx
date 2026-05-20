'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { KeyRound } from 'lucide-react';

export default function ResetPasswordEntryPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[420px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-700" /></div>}>
      <ResetPasswordEntryContent />
    </Suspense>
  );
}

function ResetPasswordEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (!token) return;
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    router.replace(`/reset-password/${encodeURIComponent(token)}${qs}`);
  }, [router, searchParams]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-7 text-center sm:text-right">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 sm:mx-0"><KeyRound className="h-7 w-7" /></div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">إعادة تعيين كلمة المرور</h1>
        <p className="mt-2 text-sm font-medium leading-7 text-slate-600">يرجى فتح رابط إعادة التعيين من بريدك الإلكتروني. سيتم تحويلك تلقائيًا إذا كان الرابط يحتوي على رمز صالح.</p>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm font-bold leading-7 text-blue-800">
        إذا لم يصلك البريد، يمكنك طلب رابط جديد من صفحة <Link href="/forgot-password" className="font-black underline">نسيت كلمة المرور</Link>.
      </div>

      <p className="mt-7 text-center text-sm font-bold text-slate-600"><Link href="/login" className="font-black text-blue-700 hover:underline">العودة لتسجيل الدخول</Link></p>
    </motion.div>
  );
}
