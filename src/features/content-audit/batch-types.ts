import type { ContentQualityBatchMode } from '@/lib/api/services/content-audit';

export type ContentQualityModelStrategy = 'economy' | 'balanced' | 'quality' | 'final_review';
export type ContentQualityBatchSource = 'adsense_readiness' | 'manual_filter';
export type ContentQualitySmartPreset = 'weak_first' | 'indexed_weak' | 'short_file_pages' | 'custom_filter';

export type ContentQualityBatchFormState = {
  country_code: string;
  content_type: 'all' | 'article' | 'post';
  level: 'weak' | 'review' | 'ready';
  mode: ContentQualityBatchMode;
  model_strategy: ContentQualityModelStrategy;
  q: string;
  source: ContentQualityBatchSource;
  preset: ContentQualitySmartPreset;
  limit: number;
  concurrency: number;
};
