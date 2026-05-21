export const contentQualityContentTypeOptions = [
  { value: 'all', label: 'المقالات والمنشورات' },
  { value: 'article', label: 'المقالات فقط' },
  { value: 'post', label: 'المنشورات فقط' },
] as const;

export const contentQualityLevelOptions = [
  { value: 'weak', label: 'الضعيفة أولًا' },
  { value: 'review', label: 'تحتاج مراجعة' },
  { value: 'ready', label: 'جاهزة للتحقق' },
] as const;

export const contentQualityModeOptions = [
  { value: 'analyze_only', label: 'تحليل فقط' },
  { value: 'fix_preview', label: 'تحليل + معاينة تحسين' },
  { value: 'full_review', label: 'مراجعة كاملة متعددة المراحل' },
] as const;

export const contentQualityStrategyOptions = [
  { value: 'economy', label: 'اقتصادي', description: 'تحليل واسع وتكلفة أقل' },
  { value: 'balanced', label: 'متوازن', description: 'اختيار مناسب لمعظم الدفعات' },
  { value: 'quality', label: 'جودة عالية', description: 'للصفحات المهمة والمحتوى الضعيف' },
  { value: 'final_review', label: 'مراجعة نهائية', description: 'لأهم الصفحات قبل الاعتماد' },
] as const;


export const contentQualitySmartPresetOptions = [
  {
    value: 'weak_first',
    label: 'الصفحات الأضعف أولًا',
    description: 'يختار تلقائيًا أقل الصفحات درجة من تقرير جاهزية AdSense، مع إعطاء أولوية للصفحات المؤثرة على القبول.',
  },
  {
    value: 'indexed_weak',
    label: 'المفهرسة الضعيفة',
    description: 'يركز على الصفحات الضعيفة التي ما زالت قابلة للفهرسة، لأنها الأكثر حساسية أثناء مراجعة AdSense.',
  },
  {
    value: 'short_file_pages',
    label: 'صفحات الملفات القصيرة',
    description: 'يعالج الصفحات التي تحتوي مرفقات أو ملفات لكن نصها قصير، وهي من أكثر أسباب ضعف القيمة.',
  },
  {
    value: 'custom_filter',
    label: 'اختيار مخصص',
    description: 'استخدم الفلاتر اليدوية القديمة عند الحاجة: الدولة، النوع، الحالة، والبحث.',
  },
] as const;
