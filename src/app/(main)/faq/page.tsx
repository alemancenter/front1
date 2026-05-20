'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Download,
  FileQuestion,
  Filter,
  KeyRound,
  Mail,
  MessageCircle,
  Search,
  ShieldCheck,
  UserRound,
  Wifi,
} from 'lucide-react';
import StaticPageHeader from '@/components/common/StaticPageHeader';

type FaqCategory = 'all' | 'account' | 'content' | 'downloads' | 'search' | 'technical' | 'privacy';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  question: string;
  answer: string;
}

const categories: Array<{ id: FaqCategory; label: string; icon: ReactNode }> = [
  { id: 'all', label: 'الكل', icon: <CircleHelp className="h-4 w-4" /> },
  { id: 'account', label: 'الحساب', icon: <UserRound className="h-4 w-4" /> },
  { id: 'content', label: 'المحتوى', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'downloads', label: 'التحميل', icon: <Download className="h-4 w-4" /> },
  { id: 'search', label: 'البحث', icon: <Search className="h-4 w-4" /> },
  { id: 'technical', label: 'مشاكل تقنية', icon: <Wifi className="h-4 w-4" /> },
  { id: 'privacy', label: 'الخصوصية', icon: <ShieldCheck className="h-4 w-4" /> },
];

const faqs: FaqItem[] = [
  {
    id: 'create-account',
    category: 'account',
    question: 'كيف أقوم بإنشاء حساب جديد؟',
    answer:
      'يمكنك إنشاء حساب من زر دخول / تسجيل في أعلى الصفحة. أدخل بياناتك بشكل صحيح، ثم اتبع خطوات التحقق إذا كانت مفعلة في الموقع.',
  },
  {
    id: 'login-problem',
    category: 'account',
    question: 'لا أستطيع تسجيل الدخول، ماذا أفعل؟',
    answer:
      'تأكد من كتابة البريد الإلكتروني وكلمة المرور بشكل صحيح. إذا استمرت المشكلة استخدم خيار استعادة كلمة المرور، أو تواصل معنا من صفحة اتصل بنا مع ذكر البريد المستخدم.',
  },
  {
    id: 'forgot-password',
    category: 'account',
    question: 'نسيت كلمة المرور، كيف أستعيدها؟',
    answer:
      'من صفحة تسجيل الدخول اختر استعادة كلمة المرور، ثم أدخل بريدك الإلكتروني. ستصلك رسالة تحتوي على رابط إعادة التعيين إذا كان البريد مسجلاً.',
  },
  {
    id: 'change-profile',
    category: 'account',
    question: 'كيف أعدل بياناتي الشخصية؟',
    answer:
      'بعد تسجيل الدخول انتقل إلى حسابك أو لوحة الملف الشخصي، ثم عدل الاسم أو الصورة أو البيانات المتاحة حسب الصلاحيات المفعلة لحسابك.',
  },
  {
    id: 'message-admin',
    category: 'account',
    question: 'كيف أراسل الإدارة أو أحد المشرفين؟',
    answer:
      'يمكنك استخدام صفحة اتصل بنا، أو صفحة الأعضاء إذا كانت المراسلة مفعلة. اكتب عنواناً واضحاً للرسالة واشرح المشكلة بالتفصيل.',
  },
  {
    id: 'choose-class',
    category: 'content',
    question: 'كيف أختار صفي الدراسي؟',
    answer:
      'من الصفحة الرئيسية أو صفحة الأقسام اختر الصف الدراسي المناسب، ثم ستظهر المواد والأقسام التعليمية المرتبطة به.',
  },
  {
    id: 'find-subject',
    category: 'content',
    question: 'لا أجد المادة التي أبحث عنها، ما الحل؟',
    answer:
      'تأكد أولاً من اختيار الصف الصحيح والدولة أو المنهاج المناسب. إذا كانت المادة غير موجودة فقد لا تكون مضافة بعد، ويمكنك إرسال اقتراح للإدارة.',
  },
  {
    id: 'content-types',
    category: 'content',
    question: 'ما أنواع الملفات الموجودة في الموقع؟',
    answer:
      'يحتوي الموقع على خطط دراسية، أوراق عمل، اختبارات، ملخصات، كتب، أدلة معلم، ومقالات تعليمية حسب الصف والمادة والفصل.',
  },
  {
    id: 'content-update',
    category: 'content',
    question: 'هل المحتوى يتم تحديثه باستمرار؟',
    answer:
      'نعم، يتم تحديث المحتوى حسب توفر الملفات والمصادر التعليمية. يظهر تاريخ التحديث أو آخر إضافة في بعض الصفحات لمساعدتك في معرفة حداثة الملف.',
  },
  {
    id: 'wrong-file',
    category: 'content',
    question: 'وجدت ملفاً خاطئاً أو رابطاً غير مناسب، كيف أبلغ عنه؟',
    answer:
      'أرسل رابط الصفحة من خلال صفحة اتصل بنا مع وصف المشكلة، مثل: الملف لا يفتح، العنوان غير صحيح، أو الملف لا يخص المادة المختارة.',
  },
  {
    id: 'download-file',
    category: 'downloads',
    question: 'كيف أحمل ملفاً تعليمياً؟',
    answer:
      'افتح صفحة الملف المطلوب ثم اضغط زر التحميل. قد يتم توجيهك لصفحة انتظار أو تحقق قبل بدء التحميل حسب إعدادات الموقع.',
  },
  {
    id: 'download-not-working',
    category: 'downloads',
    question: 'زر التحميل لا يعمل، ماذا أفعل؟',
    answer:
      'جرب تحديث الصفحة، إيقاف مانع الإعلانات مؤقتاً، أو استخدام متصفح آخر. إذا بقيت المشكلة أرسل رابط الملف للإدارة لفحصه.',
  },
  {
    id: 'file-not-open',
    category: 'downloads',
    question: 'الملف تم تحميله لكنه لا يفتح لدي، ما السبب؟',
    answer:
      'قد تحتاج إلى تطبيق يدعم صيغة الملف مثل PDF أو Word. تأكد أيضاً أن التحميل اكتمل بالكامل وأن حجم الملف ليس صفراً.',
  },
  {
    id: 'download-limit',
    category: 'downloads',
    question: 'هل توجد حدود على التحميل؟',
    answer:
      'قد توجد قيود مؤقتة للحماية من الاستخدام المفرط أو الزيارات الآلية. إذا ظهرت رسالة منع أو خطأ انتظر قليلاً ثم حاول مرة أخرى.',
  },
  {
    id: 'quick-search',
    category: 'search',
    question: 'كيف أستخدم البحث السريع؟',
    answer:
      'اكتب كلمة من اسم الدرس أو الملف، ثم اختر المادة والفصل الدراسي ونوع المحتوى عند الحاجة. كلما كانت الخيارات أدق أصبحت النتائج أفضل.',
  },
  {
    id: 'no-results',
    category: 'search',
    question: 'لم تظهر نتائج في البحث، ماذا يعني ذلك؟',
    answer:
      'قد تكون الكلمة مختلفة عن العنوان الموجود في الموقع. جرب كلمة أقصر، أو ابحث باسم المادة فقط، أو غيّر نوع المحتوى والفصل الدراسي.',
  },
  {
    id: 'popular-searches',
    category: 'search',
    question: 'ما المقصود بالأكثر بحثاً؟',
    answer:
      'هي كلمات أو ملفات تظهر بناءً على تفاعل الزوار والمحتوى الأكثر استخداماً، وتساعدك في الوصول السريع لما يبحث عنه الطلاب غالباً.',
  },
  {
    id: 'slow-site',
    category: 'technical',
    question: 'الموقع بطيء على الجوال، ماذا أفعل؟',
    answer:
      'تأكد من اتصال الإنترنت، أغلق الصفحات الثقيلة، ثم حدث الصفحة. إذا كان البطء في صفحة محددة فقط أرسل رابطها لنا حتى يتم فحصها.',
  },
  {
    id: 'page-error',
    category: 'technical',
    question: 'ظهرت صفحة خطأ أو 404، ما الحل؟',
    answer:
      'قد يكون الرابط قديماً أو تم نقل المحتوى. ارجع للصفحة الرئيسية وابحث عن الملف من جديد، أو أرسل الرابط المعطل من خلال صفحة التواصل.',
  },
  {
    id: 'browser-support',
    category: 'technical',
    question: 'ما أفضل متصفح لاستخدام الموقع؟',
    answer:
      'ننصح باستخدام آخر إصدار من Chrome أو Edge أو Safari على الجوال. المتصفحات القديمة قد لا تعرض بعض العناصر بشكل صحيح.',
  },
  {
    id: 'ads-issue',
    category: 'technical',
    question: 'الإعلانات تغطي المحتوى أو تظهر بشكل مزعج، ماذا أفعل؟',
    answer:
      'أرسل لقطة شاشة ورابط الصفحة من خلال اتصل بنا. سنراجع موضع الإعلان خصوصاً على الجوال حتى لا يؤثر على قراءة المحتوى.',
  },
  {
    id: 'privacy-data',
    category: 'privacy',
    question: 'هل بياناتي الشخصية محفوظة؟',
    answer:
      'نستخدم البيانات فقط لتشغيل الحساب والخدمات المرتبطة به وفق سياسة الخصوصية. لا تشارك كلمة مرورك أو بيانات الدخول مع أي شخص.',
  },
  {
    id: 'cookies',
    category: 'privacy',
    question: 'لماذا يستخدم الموقع ملفات تعريف الارتباط؟',
    answer:
      'تُستخدم لتحسين التجربة، حفظ بعض التفضيلات، قياس الأداء، وتشغيل بعض خدمات الإعلانات أو التحليلات وفق سياسة ملفات تعريف الارتباط.',
  },
  {
    id: 'delete-account',
    category: 'privacy',
    question: 'هل يمكنني طلب حذف حسابي أو بياناتي؟',
    answer:
      'نعم، يمكنك إرسال طلب من صفحة اتصل بنا مع ذكر البريد المرتبط بالحساب. قد نحتاج للتحقق من ملكية الحساب قبل تنفيذ الطلب.',
  },
];

const categoryLabels = categories.reduce<Record<FaqCategory, string>>((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {} as Record<FaqCategory, string>);

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(faqs[0]?.id ?? '');

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      return `${faq.question} ${faq.answer}`.toLowerCase().includes(normalizedQuery);
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      <StaticPageHeader
        title="الأسئلة الشائعة"
        current="الأسئلة الشائعة"
        description="إجابات عملية لأكثر المشاكل والأسئلة التي قد تواجه الطلاب والأعضاء أثناء استخدام الموقع."
      />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
              <label htmlFor="faq-search" className="mb-2 block text-sm font-black text-slate-900">
                ابحث في الأسئلة
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
                <input
                  id="faq-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="اكتب مشكلتك أو سؤالك..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-900">
                <Filter className="h-4 w-4 text-blue-600" />
                التصنيفات
              </div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(category.id);
                        setOpenId('');
                      }}
                      className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition lg:justify-start ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-200'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {category.icon}
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-blue-100/70 bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white shadow-sm">
              <MessageCircle className="mb-3 h-7 w-7" />
              <h2 className="text-lg font-black">لم تجد إجابتك؟</h2>
              <p className="mt-2 text-sm font-medium leading-7 text-blue-50">
                أرسل لنا وصف المشكلة مع رابط الصفحة أو صورة الخطأ حتى نتمكن من مساعدتك بدقة.
              </p>
              <Link
                href="/contact-us"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-blue-800 transition hover:bg-blue-50"
              >
                <Mail className="h-4 w-4" />
                تواصل معنا
              </Link>
            </div>
          </aside>

          <section className="space-y-4">
            <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-blue-700">
                    {categoryLabels[activeCategory]}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">مركز المساعدة</h2>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-800">
                  {filteredFaqs.length} سؤال
                </div>
              </div>
            </div>

            {filteredFaqs.length > 0 ? (
              <div className="space-y-3">
                {filteredFaqs.map((faq) => {
                  const isOpen = openId === faq.id;

                  return (
                    <article
                      key={faq.id}
                      className="overflow-hidden rounded-[1.25rem] border border-blue-100/70 bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? '' : faq.id)}
                        className="flex w-full items-start justify-between gap-4 p-5 text-right transition hover:bg-blue-50/50 sm:p-6"
                        aria-expanded={isOpen}
                      >
                        <span className="flex min-w-0 gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <FileQuestion className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-base font-black leading-7 text-slate-950 sm:text-lg">
                              {faq.question}
                            </span>
                            <span className="mt-1 block text-xs font-bold text-blue-700">
                              {categoryLabels[faq.category]}
                            </span>
                          </span>
                        </span>
                        <ChevronDown
                          className={`mt-2 h-5 w-5 shrink-0 text-slate-400 transition ${
                            isOpen ? 'rotate-180 text-blue-700' : ''
                          }`}
                        />
                      </button>

                      {isOpen ? (
                        <div className="border-t border-blue-50 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                          <p className="text-sm font-medium leading-8 text-slate-600 sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-amber-100 bg-amber-50 p-6 text-center">
                <AlertCircle className="mx-auto mb-3 h-9 w-9 text-amber-600" />
                <h3 className="text-lg font-black text-amber-950">لا توجد نتائج مطابقة</h3>
                <p className="mt-2 text-sm font-bold leading-7 text-amber-800">
                  جرّب كلمة أبسط أو اختر تصنيفاً آخر، ويمكنك التواصل معنا إذا كانت المشكلة غير موجودة.
                </p>
              </div>
            )}
          </section>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/login"
            className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <KeyRound className="mb-3 h-7 w-7 text-blue-700" />
            <h3 className="font-black text-slate-950">الدخول للحساب</h3>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
              استخدم هذه الصفحة عند مواجهة مشاكل في الدخول أو استعادة كلمة المرور.
            </p>
          </Link>
          <Link
            href="/classes"
            className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <BookOpen className="mb-3 h-7 w-7 text-blue-700" />
            <h3 className="font-black text-slate-950">تصفح الصفوف</h3>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
              ابدأ من الصف الدراسي للوصول إلى المواد والملفات بطريقة منظمة.
            </p>
          </Link>
          <Link
            href="/contact-us"
            className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <Mail className="mb-3 h-7 w-7 text-blue-700" />
            <h3 className="font-black text-slate-950">الدعم والتواصل</h3>
            <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
              أرسل تفاصيل المشكلة لفريق الموقع عند تعطل رابط أو وجود ملف غير مناسب.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
