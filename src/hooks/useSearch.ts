'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchParams {
  classId?: string;
  subjectId?: string;
  semester?: string;
  fileType?: string;
  keyword?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'article' | 'lesson';
  description?: string;
  url: string;
}

function toQueryString(params: SearchParams) {
  const searchParams = new URLSearchParams();
  if (params.classId) searchParams.append('class', params.classId);
  if (params.subjectId) searchParams.append('subject', params.subjectId);
  if (params.semester) searchParams.append('semester', params.semester);
  if (params.fileType) searchParams.append('type', params.fileType);
  if (params.keyword) searchParams.append('q', params.keyword);
  return searchParams.toString();
}

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Search endpoint returned ${response.status} ${response.statusText || 'non-JSON response'}`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Search endpoint failed with ${response.status}`);
  }

  return data;
}

export function useSearch() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (params: SearchParams) => {
    const queryString = toQueryString(params);
    if (!queryString) {
      router.push('/search');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?${queryString}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await readJsonResponse(response);

      if (!data.success) {
        throw new Error(data.error || 'فشل في البحث');
      }

      setResults(data.results || []);
      router.push(`/search?${queryString}`);
    } catch (err) {
      setError('تعذر جلب نتائج البحث الآن. سيتم فتح صفحة البحث لمتابعة المحاولة.');
      console.error('Search error:', err);
      router.push(`/search?${queryString}`);
    } finally {
      setIsSearching(false);
    }
  }, [router]);

  const quickSearch = useCallback((params: Omit<SearchParams, 'keyword'>) => {
    performSearch(params);
  }, [performSearch]);

  const keywordSearch = useCallback((keyword: string) => {
    performSearch({ keyword });
  }, [performSearch]);

  return {
    isSearching,
    results,
    error,
    performSearch,
    quickSearch,
    keywordSearch,
    clearResults: () => setResults([]),
    clearError: () => setError(null),
  };
}
