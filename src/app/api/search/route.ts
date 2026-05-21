import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api/config';
import { ssrFetch } from '@/lib/api/ssr-fetch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'article' | 'lesson';
  description?: string;
  url: string;
  date: string;
}

function emptySearchResponse(query: string | null, warning?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      results: [],
      data: [],
      total: 0,
      warning,
      filters: { query },
    },
    { status }
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const classId = searchParams.get('class');
  const subjectId = searchParams.get('subject');
  const semester = searchParams.get('semester');
  const fileType = searchParams.get('type');
  const query = searchParams.get('q')?.trim() || '';
  const country = searchParams.get('country') || 'jo';

  if (!query && !classId && !subjectId && !semester && !fileType) {
    return emptySearchResponse(query);
  }

  try {
    const backendParams = new URLSearchParams();
    if (classId) backendParams.append('class_id', classId);
    if (subjectId) backendParams.append('subject_id', subjectId);
    if (semester) backendParams.append('semester_id', semester);
    if (fileType) backendParams.append('file_category', fileType);
    if (query) backendParams.append('q', query);
    if (country) backendParams.append('country', country);

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const headers: HeadersInit = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const apiKey = process.env.FRONTEND_API_KEY;
    if (apiKey) headers['X-Frontend-Key'] = apiKey;
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await ssrFetch(`${API_CONFIG.INTERNAL_URL}/articles?${backendParams.toString()}`, {
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Search API] Backend search failed', {
        status: response.status,
        statusText: response.statusText,
        query,
      });

      return emptySearchResponse(query, 'تعذر تحميل نتائج البحث حاليًا.');
    }

    const data = await response.json();
    const articles = Array.isArray(data.data) ? data.data : [];

    const results: SearchResult[] = articles.map((article: any) => {
      let category = article.file_category;
      if (!category && Array.isArray(article.files) && article.files.length > 0) {
        category = article.files[0]?.category;
      }

      const type = mapCategoryToType(category);
      const pathSegment = type === 'post' ? 'posts' : 'lesson/articles';

      return {
        id: String(article.id),
        title: article.title || 'بدون عنوان',
        type,
        description: article.meta_description || article.description || extractExcerpt(article.content),
        url: `/${country}/${pathSegment}/${article.id}`,
        date: article.created_at ? new Date(article.created_at).toLocaleDateString('ar-JO') : '',
      };
    });

    return NextResponse.json({
      success: true,
      results,
      data: results,
      total: data.meta?.total || results.length,
      filters: {
        class: classId,
        subject: subjectId,
        semester,
        type: fileType,
        query,
      },
    });
  } catch (error) {
    console.error('[Search API] Request failed', error);
    return emptySearchResponse(query, 'تعذر تحميل نتائج البحث حاليًا.');
  }
}

function mapCategoryToType(category: string): 'post' | 'article' | 'lesson' {
  const map: Record<string, 'post' | 'article' | 'lesson'> = {
    study_plan: 'lesson',
    worksheet: 'lesson',
    exam: 'lesson',
    book: 'lesson',
    record: 'article',
    article: 'article',
    post: 'post',
  };
  return map[category] || 'article';
}

function extractExcerpt(html?: string): string {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 150 ? `${text.substring(0, 150)}...` : text;
}
