export interface RafiqQuickAction {
  label: string;
  message: string;
}

export interface RafiqHint {
  title: string;
  message: string;
  quick_actions: RafiqQuickAction[];
  variant?: 'welcome' | 'auth' | 'verify' | 'download' | 'search' | 'class' | 'content' | 'default';
}

const HOME_HINT: RafiqHint = {
  title: 'رفيق المنصة',
  variant: 'welcome',
  message: 'أهلًا بك، أساعدك بالبحث والتصفح بسرعة.',
  quick_actions: [
    { label: 'عرض الصفوف', message: 'أريد تصفح الصفوف التعليمية' },
    { label: 'البحث عن ملف', message: 'أريد البحث عن ملف تعليمي' },
    { label: 'كيف أستخدم الموقع؟', message: 'كيف أستخدم الموقع؟' },
  ],
};

const DEFAULT_HINT: RafiqHint = {
  title: 'رفيق المنصة',
  variant: 'default',
  message: 'أنا هنا للمساعدة حسب الصفحة.',
  quick_actions: [
    { label: 'أبحث عن ملف', message: 'أريد البحث عن ملف تعليمي' },
    { label: 'مشكلة في الدخول', message: 'لا أستطيع تسجيل الدخول' },
    { label: 'مشكلة تفعيل البريد', message: 'لا تصلني رسالة التفعيل' },
  ],
};

function cleanPath(pageUrl = '') {
  try {
    const url = pageUrl.startsWith('http') ? new URL(pageUrl) : null;
    return (url ? url.pathname : pageUrl.split('?')[0].split('#')[0]).toLowerCase();
  } catch {
    return pageUrl.split('?')[0].split('#')[0].toLowerCase();
  }
}

function isHomePath(path: string) {
  return path === '' || path === '/' || /^\/(jo|sa|eg|ps)?\/?$/.test(path);
}

export function getRafiqHint(pageUrl = ''): RafiqHint {
  const path = cleanPath(pageUrl);

  // الصفحة الرئيسية: ترحيب فقط، بدون رسائل مشاكل.
  if (isHomePath(path)) {
    return HOME_HINT;
  }

  if (path.includes('/login')) {
    return {
      title: 'رفيق تسجيل الدخول',
      variant: 'auth',
      message: 'تحتاج مساعدة في الدخول؟',
      quick_actions: [
        { label: 'لا أستطيع تسجيل الدخول', message: 'لا أستطيع تسجيل الدخول' },
        { label: 'نسيت كلمة المرور', message: 'نسيت كلمة المرور' },
        { label: 'البريد غير مفعل', message: 'البريد غير مفعل' },
      ],
    };
  }

  if (path.includes('/register') || path.includes('/signup')) {
    return {
      title: 'رفيق إنشاء الحساب',
      variant: 'auth',
      message: 'استخدم بريدًا صحيحًا لتأكيد الحساب.',
      quick_actions: [
        { label: 'خطوات إنشاء الحساب', message: 'ما هي الخطوات الصحيحة لإنشاء حساب؟' },
        { label: 'لا تصلني رسالة التفعيل', message: 'لا تصلني رسالة التفعيل' },
        { label: 'الدخول عبر فيسبوك', message: 'هل أستطيع الدخول عبر الفيس بوك؟' },
      ],
    };
  }

  if (path.includes('verify') || path.includes('verification') || path.includes('/email/')) {
    return {
      title: 'رفيق تفعيل البريد',
      variant: 'verify',
      message: 'لم تصلك رسالة التفعيل؟ افحص Spam/Junk.',
      quick_actions: [
        { label: 'شرح التفعيل بالصور', message: 'لا تصلني رسالة التفعيل' },
        { label: 'كتبت البريد خطأ', message: 'كتبت البريد الإلكتروني خطأ' },
        { label: 'صندوق البريد ممتلئ', message: 'صندوق البريد ممتلئ' },
      ],
    };
  }

  if (path.includes('/download') || path.includes('/file')) {
    return {
      title: 'رفيق التحميل',
      variant: 'download',
      message: 'مشكلة تحميل؟ تأكد من الدخول وتفعيل البريد.',
      quick_actions: [
        { label: 'لا أستطيع التحميل', message: 'لا أستطيع تحميل ملف' },
        { label: 'أين أجد الملف؟', message: 'عملت تحميل ولا أعرف أين أجد الملف' },
        { label: 'لا أملك صلاحية', message: 'تظهر رسالة لا تملك صلاحية' },
      ],
    };
  }

  if (path.includes('/search')) {
    return {
      title: 'رفيق البحث',
      variant: 'search',
      message: 'للبحث الأفضل: المادة + الصف + الفصل.',
      quick_actions: [
        { label: 'أريد ملفًا تعليميًا', message: 'أريد البحث عن ملف تعليمي' },
        { label: 'طريقة البحث', message: 'كيف أبحث عن ملف تعليمي؟' },
        { label: 'لم أجد الملف', message: 'لا أجد الملف المطلوب في الموقع' },
      ],
    };
  }

  if (path.includes('/classes') || path.includes('/class')) {
    return {
      title: 'رفيق الصفوف',
      variant: 'class',
      message: 'اختر الصف ثم المادة والفصل.',
      quick_actions: [
        { label: 'اختيار الصف', message: 'كيف أختار الصف والمادة؟' },
        { label: 'أبحث عن مادة', message: 'أريد البحث حسب المادة والصف' },
        { label: 'لم أجد الملف', message: 'لم أجد الملف الذي أبحث عنه' },
      ],
    };
  }

  if (path.includes('/article') || path.includes('/post') || path.includes('/lesson')) {
    return {
      title: 'رفيق المحتوى',
      variant: 'content',
      message: 'أساعدك بملفات مشابهة أو رابط لا يعمل.',
      quick_actions: [
        { label: 'ملفات مشابهة', message: 'أريد ملفات مشابهة لهذا المحتوى' },
        { label: 'رابط لا يعمل', message: 'رابط التحميل لا يعمل' },
        { label: 'إبلاغ عن خطأ', message: 'أريد الإبلاغ عن ملف خاطئ' },
      ],
    };
  }

  return DEFAULT_HINT;
}
