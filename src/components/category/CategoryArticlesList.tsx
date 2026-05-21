import Link from 'next/link';
import { FileText, Search } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import CategoryArticlesGridClient, { CategoryArticleItem } from './CategoryArticlesGridClient';

interface ArticleFile {
  id: number;
  file_type?: string;
  file_path?: string;
  file_category?: string;
  file_name?: string;
  title?: string;
}

interface Article {
  id: number;
  title: string;
  created_at: string;
  updated_at?: string;
  visit_count?: number;
  views?: number;
  meta_description?: string;
  description?: string;
  content?: string;
  files?: ArticleFile[];
  file_type?: string;
  file_name?: string;
}

// Maps URL slug → actual file_category value stored in the database
const CATEGORY_MAP: Record<string, string> = {
  plans:   'study_plan',
  papers:  'worksheet',
  tests:   'exam',
  books:   'book',
  records: 'record',
};

function extractArticles(response: any): Article[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.data?.data?.data)) return response.data.data.data;
  return [];
}

async function getArticles(
  countryCode: string,
  subjectId: string,
  semesterId: string,
  categoryId: string
): Promise<Article[]> {
  const fileCategory = CATEGORY_MAP[categoryId] ?? categoryId;

  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.ARTICLES.LIST_PUBLIC,
      {
        database: countryCode,
        subject_id: subjectId,
        semester_id: semesterId,
        file_category: fileCategory,
        per_page: 80,
      },
      { next: { revalidate: 60 } } as any
    );

    return extractArticles(response);
  } catch (err) {
    console.error('Error fetching articles:', err);
    return [];
  }
}

export default async function CategoryArticlesList({
  countryCode,
  subjectId,
  semesterId,
  categoryId,
  categoryName,
  subjectName,
}: {
  countryCode: string;
  classId: string;
  subjectId: string;
  semesterId: string;
  categoryId: string;
  categoryName: string;
  subjectName: string;
}) {
  const articles = await getArticles(countryCode, subjectId, semesterId, categoryId);

  if (!articles.length) {
    return (
      <div id="content" className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12" dir="rtl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
          <FileText className="h-10 w-10" />
        </div>
        <h3 className="mb-2 text-2xl font-black text-slate-950">لا توجد محتويات حالياً</h3>
        <p className="mx-auto max-w-md text-sm leading-7 text-slate-500">لم يتم إضافة أي ملفات أو مقالات في هذا القسم بعد. يمكنك العودة لاحقاً أو استخدام البحث للوصول إلى محتوى مشابه.</p>
        <Link href="/search" prefetch={false} prefetch={false} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
          <Search className="h-4 w-4" />
          بحث متقدم
        </Link>
      </div>
    );
  }

  return (
    <CategoryArticlesGridClient
      articles={articles as CategoryArticleItem[]}
      countryCode={countryCode}
      categoryName={categoryName}
      subjectName={subjectName}
    />
  );
}
