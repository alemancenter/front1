'use client';

import Link from 'next/link';
import { motion } from '@/lib/motion-lite';
import { BookOpen, CheckCircle2, FileText, GraduationCap, Layers3, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayoutClient({
  children,
  siteName,
}: {
  children: React.ReactNode;
  siteName: string;
}) {
  const resolvedName = siteName?.trim() ? siteName.trim() : 'موقع الألمان';
  const initial = resolvedName.trim().charAt(0).toUpperCase() || 'أ';

  return (
    <main className="relative isolate min-h-dvh w-full max-w-full overflow-x-clip bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_42%,#ffffff_100%)] font-sans text-slate-950" dir="rtl">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.12)_1px,transparent_0)] [background-size:30px_30px]" />
      <div className="pointer-events-none absolute -right-28 top-8 -z-10 h-56 w-56 rounded-full bg-blue-200/35 blur-3xl sm:h-80 sm:w-80" />
      <div className="pointer-events-none absolute -left-28 bottom-8 -z-10 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-[1480px] grid-cols-1 items-stretch px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[minmax(460px,0.88fr)_1.12fr] lg:gap-8 lg:px-8 lg:py-8">
        <section className="order-2 flex min-h-[calc(100dvh-2rem)] min-w-0 flex-col items-center justify-center lg:order-1 lg:min-h-0">
          <div className="w-full max-w-[480px] min-w-0 py-2 sm:py-4 lg:py-0">
            <Link href="/" className="mb-3 inline-flex w-full min-w-0 items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-3 py-3 shadow-sm backdrop-blur transition hover:border-blue-200 hover:shadow-md sm:mb-5 sm:w-auto sm:px-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-black text-white shadow-lg shadow-blue-700/20 sm:h-12 sm:w-12 sm:rounded-2xl">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-black text-slate-950 sm:text-lg">{resolvedName}</div>
                <div className="text-xs font-bold text-slate-500">بوابة المستقبل التعليمية</div>
              </div>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full min-w-0 rounded-[1.25rem] border border-white/80 bg-white/95 p-4 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:rounded-[2rem] sm:p-7"
            >
              {children}
            </motion.div>
          </div>
        </section>

        <aside className="order-1 hidden overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/70 p-4 shadow-[0_30px_100px_-55px_rgba(37,99,235,0.45)] backdrop-blur-xl lg:flex lg:items-stretch">
          <div className="relative flex w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#071a3f] via-[#0c3b91] to-[#0b5cff] p-8 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_36%)]" />
            <div className="absolute left-8 top-8 h-32 w-32 rounded-full border border-white/10" />
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex w-full flex-col justify-between">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  حساب واحد للوصول إلى مواردك التعليمية
                </div>

                <h1 className="max-w-xl text-4xl font-black leading-[1.25] tracking-tight xl:text-5xl">
                  تجربة دخول آمنة ومنظمة لمنصة تعليمية احترافية
                </h1>
                <p className="mt-5 max-w-lg text-base leading-8 text-white/78">
                  سجّل دخولك للوصول إلى الملفات، حفظ المحتوى، متابعة التعليقات، وتحميل المرفقات التعليمية ضمن بيئة واضحة وآمنة.
                </p>
              </div>

              <div className="my-8 grid grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, title: 'حماية الحساب', text: 'جلسات آمنة وتحقق من الهوية' },
                  { icon: FileText, title: 'تحميل الملفات', text: 'وصول منظم للمرفقات التعليمية' },
                  { icon: BookOpen, title: 'محتوى موثوق', text: 'منشورات وموارد تعليمية محدثة' },
                  { icon: Layers3, title: 'تجربة موحدة', text: 'تنقل واضح بين الصفحات' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-black">{item.title}</div>
                      <div className="mt-1 text-xs leading-6 text-white/65">{item.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.75rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-black">منصة تعليمية جاهزة للنمو</div>
                    <div className="text-sm text-white/65">واجهة احترافية مناسبة لملايين الزيارات</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { value: 'آمن', label: 'دخول وحسابات' },
                    { value: 'سريع', label: 'تصفح وتحميل' },
                    { value: 'منظم', label: 'موارد وصفحات' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/10 px-3 py-3">
                      <div className="text-lg font-black">{stat.value}</div>
                      <div className="mt-1 text-[11px] text-white/62">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-white/70">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                <span>لا نشارك بياناتك مع أطراف إعلانية، وإعلانات الموقع مستقلة عن حسابك.</span>
                <LockKeyhole className="mr-auto h-4 w-4 text-white/55" />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
