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

export function evaluateAdsenseReadiness(input: AdsenseReadinessInput): AdsenseReadinessResult {
  const text = stripHtmlToText(input.content);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const title = (input.title || '').trim();
  const meta = (input.metaDescription || '').trim();
  const filesCount = input.filesCount || 0;
  const reasons: string[] = [];
  let score = 0;

  if (title.length >= 20) score += 10; else reasons.push('العنوان قصير ويحتاج توضيحًا أكثر.');
  if (wordCount >= 300) score += 25; else if (wordCount >= 120) { score += 12; reasons.push('المحتوى متوسط الطول ويحتاج تعزيزًا قبل الإعلانات.'); } else reasons.push('المحتوى قصير جدًا وقد يُصنّف كقيمة منخفضة.');
  if (meta.length >= 80) score += 12; else reasons.push('وصف meta غير كافٍ أو غير موجود.');
  if (filesCount > 0) score += 12; else reasons.push('لا توجد مرفقات أو موارد واضحة مرتبطة بالصفحة.');
  if (input.isPublished !== false) score += 10; else reasons.push('المحتوى غير منشور أو غير معتمد.');
  if (!input.hasPolicyRisk) score += 16; else reasons.push('يوجد خطر سياسات ويجب المراجعة قبل الإعلانات.');
  if (charCount >= 600) score += 15; else reasons.push('النص الفعلي أقل من الحد الآمن لعرض الإعلانات.');

  score = Math.max(0, Math.min(100, score));
  const level = score >= 80 ? 'ready' : score >= 60 ? 'review' : 'weak';
  const shouldIndex = score >= 45 && input.isPublished !== false && !input.hasPolicyRisk;
  const shouldShowAds = score >= 75 && charCount >= 600 && input.isPublished !== false && !input.hasPolicyRisk;

  return { score, wordCount, charCount, level, shouldIndex, shouldShowAds, reasons };
}
