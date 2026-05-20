import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';
import { safeJsonLd } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `الأسئلة الشائعة | ${siteName}`;
  const description = `إجابات عملية لأكثر الأسئلة شيوعاً حول ${siteName}: إنشاء الحساب، تحميل الملفات، البحث، الخصوصية، والمشاكل التقنية.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/faq',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/faq` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'كيف أقوم بإنشاء حساب جديد؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك إنشاء حساب من زر دخول / تسجيل في أعلى الصفحة. أدخل بياناتك بشكل صحيح، ثم اتبع خطوات التحقق إذا كانت مفعلة في الموقع.',
      },
    },
    {
      '@type': 'Question',
      name: 'لا أستطيع تسجيل الدخول، ماذا أفعل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تأكد من كتابة البريد الإلكتروني وكلمة المرور بشكل صحيح. إذا استمرت المشكلة استخدم خيار استعادة كلمة المرور، أو تواصل معنا من صفحة اتصل بنا مع ذكر البريد المستخدم.',
      },
    },
    {
      '@type': 'Question',
      name: 'نسيت كلمة المرور، كيف أستعيدها؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'من صفحة تسجيل الدخول اختر استعادة كلمة المرور، ثم أدخل بريدك الإلكتروني. ستصلك رسالة تحتوي على رابط إعادة التعيين إذا كان البريد مسجلاً.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أعدل بياناتي الشخصية؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'بعد تسجيل الدخول انتقل إلى حسابك أو لوحة الملف الشخصي، ثم عدل الاسم أو الصورة أو البيانات المتاحة حسب الصلاحيات المفعلة لحسابك.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أراسل الإدارة أو أحد المشرفين؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يمكنك استخدام صفحة اتصل بنا، أو صفحة الأعضاء إذا كانت المراسلة مفعلة. اكتب عنواناً واضحاً للرسالة واشرح المشكلة بالتفصيل.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أختار صفي الدراسي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'من الصفحة الرئيسية أو صفحة الأقسام اختر الصف الدراسي المناسب، ثم ستظهر المواد والأقسام التعليمية المرتبطة به.',
      },
    },
    {
      '@type': 'Question',
      name: 'لا أجد المادة التي أبحث عنها، ما الحل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تأكد أولاً من اختيار الصف الصحيح والدولة أو المنهاج المناسب. إذا كانت المادة غير موجودة فقد لا تكون مضافة بعد، ويمكنك إرسال اقتراح للإدارة.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما أنواع الملفات الموجودة في الموقع؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'يحتوي الموقع على خطط دراسية، أوراق عمل، اختبارات، ملخصات، كتب، أدلة معلم، ومقالات تعليمية حسب الصف والمادة والفصل.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل المحتوى يتم تحديثه باستمرار؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يتم تحديث المحتوى حسب توفر الملفات والمصادر التعليمية. يظهر تاريخ التحديث أو آخر إضافة في بعض الصفحات لمساعدتك في معرفة حداثة الملف.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أحمل ملفاً تعليمياً؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'افتح صفحة الملف المطلوب ثم اضغط زر التحميل. قد يتم توجيهك لصفحة انتظار أو تحقق قبل بدء التحميل حسب إعدادات الموقع.',
      },
    },
    {
      '@type': 'Question',
      name: 'زر التحميل لا يعمل، ماذا أفعل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'جرب تحديث الصفحة، إيقاف مانع الإعلانات مؤقتاً، أو استخدام متصفح آخر. إذا بقيت المشكلة أرسل رابط الملف للإدارة لفحصه.',
      },
    },
    {
      '@type': 'Question',
      name: 'الملف تم تحميله لكنه لا يفتح لدي، ما السبب؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'قد تحتاج إلى تطبيق يدعم صيغة الملف مثل PDF أو Word. تأكد أيضاً أن التحميل اكتمل بالكامل وأن حجم الملف ليس صفراً.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل توجد حدود على التحميل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'قد توجد قيود مؤقتة للحماية من الاستخدام المفرط أو الزيارات الآلية. إذا ظهرت رسالة منع أو خطأ انتظر قليلاً ثم حاول مرة أخرى.',
      },
    },
    {
      '@type': 'Question',
      name: 'كيف أستخدم البحث السريع؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'اكتب كلمة من اسم الدرس أو الملف، ثم اختر المادة والفصل الدراسي ونوع المحتوى عند الحاجة. كلما كانت الخيارات أدق أصبحت النتائج أفضل.',
      },
    },
    {
      '@type': 'Question',
      name: 'لم تظهر نتائج في البحث، ماذا يعني ذلك؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'قد تكون الكلمة مختلفة عن العنوان الموجود في الموقع. جرب كلمة أقصر، أو ابحث باسم المادة فقط، أو غيّر نوع المحتوى والفصل الدراسي.',
      },
    },
    {
      '@type': 'Question',
      name: 'الموقع بطيء على الجوال، ماذا أفعل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تأكد من اتصال الإنترنت، أغلق الصفحات الثقيلة، ثم حدث الصفحة. إذا كان البطء في صفحة محددة فقط أرسل رابطها لنا حتى يتم فحصها.',
      },
    },
    {
      '@type': 'Question',
      name: 'ظهرت صفحة خطأ أو 404، ما الحل؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'قد يكون الرابط قديماً أو تم نقل المحتوى. ارجع للصفحة الرئيسية وابحث عن الملف من جديد، أو أرسل الرابط المعطل من خلال صفحة التواصل.',
      },
    },
    {
      '@type': 'Question',
      name: 'ما أفضل متصفح لاستخدام الموقع؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ننصح باستخدام آخر إصدار من Chrome أو Edge أو Safari على الجوال. المتصفحات القديمة قد لا تعرض بعض العناصر بشكل صحيح.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل بياناتي الشخصية محفوظة؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نستخدم البيانات فقط لتشغيل الحساب والخدمات المرتبطة به وفق سياسة الخصوصية. لا تشارك كلمة مرورك أو بيانات الدخول مع أي شخص.',
      },
    },
    {
      '@type': 'Question',
      name: 'لماذا يستخدم الموقع ملفات تعريف الارتباط؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'تُستخدم لتحسين التجربة، حفظ بعض التفضيلات، قياس الأداء، وتشغيل بعض خدمات الإعلانات أو التحليلات وفق سياسة ملفات تعريف الارتباط.',
      },
    },
    {
      '@type': 'Question',
      name: 'هل يمكنني طلب حذف حسابي أو بياناتي؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'نعم، يمكنك إرسال طلب من صفحة اتصل بنا مع ذكر البريد المرتبط بالحساب. قد نحتاج للتحقق من ملكية الحساب قبل تنفيذ الطلب.',
      },
    },
  ],
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      {children}
    </>
  );
}
