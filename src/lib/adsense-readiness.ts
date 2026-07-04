export interface AdsenseReadinessInput {
  title?: string | null;
  content?: string | null;
  metaDescription?: string | null;
  filesCount?: number;
  isPublished?: boolean;
  hasPolicyRisk?: boolean;
}

export interface AdsenseReadinessResult {
  score: number;
  wordCount: number;
  charCount: number;
  /** Word count AFTER removing known boilerplate/template phrases. */
  uniqueWordCount: number;
  level: 'ready' | 'review' | 'weak';
  shouldIndex: boolean;
  shouldShowAds: boolean;
  reasons: string[];
}

export function stripHtmlToText(value?: string | null): string {
  return (value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Phrases that were auto-injected as "filler" to inflate text density.
 * Content built only from these does NOT count as real value and must not
 * be allowed to unlock ads. Extend this list whenever a new template phrase
 * is discovered. Matching is loose (substring) on the plain text.
 */
const BOILERPLATE_MARKERS: string[] = [
  'ولكي يكون المحتوى أكثر فائدة',
  'من الناحية التحريرية',
  'ويُفضّل تقسيم المحتوى',
  'يمكن أيضًا إضافة أسئلة شائعة',
  'يمثّل موضوع',
  'جانباً مهماً من المحتوى التعليمي',
  'يساعد هذا الملف في تعزيز الفهم العميق',
  'بعد الاطلاع على هذا المحتوى، يتوقع من الطالب',
  'نحن نسعى دائماً لتوفير أفضل الملفات التعليمية',
  'يهدف هذا المقال إلى تقديم معلومات قيمة ومفيدة',
  'من خلال قراءة هذا المقال',
  'نحن ملتزمون بتقديم محتوى عالي الجودة',
  'تحسينات مقترحة للنشر',
  'القيمة التعليمية للمحتوى',
  'Generate generic but valuable-looking text',
  'increase text density for AdSense',
];

/** Remove known boilerplate so we measure only genuinely-authored text. */
export function stripBoilerplate(text: string): string {
  let out = text;
  for (const marker of BOILERPLATE_MARKERS) {
    const idx = out.indexOf(marker);
    if (idx !== -1) {
      // Drop ~200 chars following the marker (crude sentence cut).
      out = out.slice(0, idx) + ' ' + out.slice(idx + marker.length + 200);
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function evaluateAdsenseReadiness(input: AdsenseReadinessInput): AdsenseReadinessResult {
  const text = stripHtmlToText(input.content);
  const uniqueText = stripBoilerplate(text);

  const wordCount = countWords(text);
  const uniqueWordCount = countWords(uniqueText);
  const charCount = text.length;
  const uniqueCharCount = uniqueText.length;

  const title = (input.title || '').trim();
  const meta = (input.metaDescription || '').trim();
  const filesCount = input.filesCount || 0;
  const reasons: string[] = [];
  let score = 0;

  if (title.length >= 20) score += 10;
  else reasons.push('العنوان قصير ويحتاج توضيحاً أكثر.');

  // Score is based on UNIQUE words, not raw words. Filler no longer helps.
  if (uniqueWordCount >= 250) {
    score += 30;
  } else if (uniqueWordCount >= 120) {
    score += 14;
    reasons.push('المحتوى الأصلي متوسط الطول ويحتاج تعزيزاً حقيقياً قبل الإعلانات.');
  } else {
    reasons.push('المحتوى الأصلي (بعد استبعاد القوالب المكررة) قصير جداً — قيمة منخفضة.');
  }

  // Penalise when most of the text is boilerplate.
  const fillerRatio = wordCount > 0 ? 1 - uniqueWordCount / wordCount : 0;
  if (fillerRatio > 0.5 && wordCount > 50) {
    score -= 20;
    reasons.push('أكثر من نصف النص عبارة عن قوالب مكررة — يجب استبدالها بمحتوى أصلي.');
  }

  if (meta.length >= 80) score += 10;
  else reasons.push('وصف meta غير كافٍ أو غير موجود.');

  if (filesCount > 0) score += 12;
  else reasons.push('لا توجد مرفقات أو موارد واضحة مرتبطة بالصفحة.');

  if (input.isPublished !== false) score += 10;
  else reasons.push('المحتوى غير منشور أو غير معتمد.');

  if (!input.hasPolicyRisk) score += 16;
  else reasons.push('يوجد خطر سياسات ويجب المراجعة قبل الإعلانات.');

  if (uniqueCharCount >= 600) score += 12;
  else reasons.push('النص الأصلي أقل من الحد الآمن لعرض الإعلانات.');

  score = Math.max(0, Math.min(100, score));
  const level = score >= 80 ? 'ready' : score >= 60 ? 'review' : 'weak';

  // Gating now requires UNIQUE content, not inflated/filler content.
  const shouldIndex =
    score >= 50 &&
    uniqueWordCount >= 120 &&
    input.isPublished !== false &&
    !input.hasPolicyRisk;

  // NOTE: this was previously score>=78 / uniqueCharCount>=600 /
  // uniqueWordCount>=250 / fillerRatio<=0.4 — a bar most of this site's short
  // "download resource" pages could never clear, which silently suppressed
  // In-Article/Display ads sitewide even when an ad code was configured.
  // Thresholds below still block genuinely thin/templated pages (protecting
  // the AdSense account from a "low value content" policy strike) while
  // letting normal resource pages qualify.
  const shouldShowAds =
    score >= 55 &&
    uniqueCharCount >= 350 &&
    uniqueWordCount >= 140 &&
    fillerRatio <= 0.55 &&
    input.isPublished !== false &&
    !input.hasPolicyRisk;

  return {
    score,
    wordCount,
    charCount,
    uniqueWordCount,
    level,
    shouldIndex,
    shouldShowAds,
    reasons,
  };
}
