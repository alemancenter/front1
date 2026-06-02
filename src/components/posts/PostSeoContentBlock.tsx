import React from 'react';
import { Info, FolderOpen, Tag } from 'lucide-react';

/**
 * PostSeoContentBlock — REWRITTEN (AdSense-safe)
 *
 * Removed the generic "increase text density" filler that was duplicated
 * across every post (this triggered Google "Scaled content abuse").
 *
 * This block now renders ONLY factual, per-post data: the section/category
 * and the related keywords/topics that genuinely differ between posts.
 * If there is no real data to show, it renders NOTHING. Unique value for the
 * page must come from the post `content` itself, not from this block.
 */

interface KeywordItem {
  id?: number;
  keyword: string;
}

interface Props {
  title: string;
  category?: string;
  keywords?: KeywordItem[] | string[];
}

function normalizeKeywords(keywords?: KeywordItem[] | string[]): string[] {
  if (!Array.isArray(keywords)) return [];
  return keywords
    .map((k) => (typeof k === 'string' ? k : k?.keyword || ''))
    .map((k) => k.trim())
    .filter(Boolean);
}

export default function PostSeoContentBlock({ category, keywords }: Props) {
  const kw = normalizeKeywords(keywords).slice(0, 8);
  const hasCategory = Boolean(category?.trim());

  // Nothing real to show — render nothing (no duplicated filler).
  if (!hasCategory && kw.length === 0) return null;

  return (
    <section
      className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/40 p-6 md:p-8"
      aria-label="معلومات المنشور"
    >
      <div className="mb-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">معلومات المنشور</h2>
      </div>

      <dl className="space-y-4">
        {hasCategory && (
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
              <FolderOpen className="h-4 w-4 text-primary" /> القسم:
            </dt>
            <dd className="text-sm font-bold text-gray-900">{category!.trim()}</dd>
          </div>
        )}

        {kw.length > 0 && (
          <div>
            <dt className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-500">
              <Tag className="h-4 w-4 text-primary" /> مواضيع مرتبطة:
            </dt>
            <dd className="flex flex-wrap gap-2">
              {kw.map((k, i) => (
                <span
                  key={`${k}-${i}`}
                  className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold text-blue-700"
                >
                  {k}
                </span>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
