import Link from 'next/link';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  created_at: string;
  visit_count: number;
}

interface Props {
  articles: Article[];
  countryCode: string;
}

export default function RelatedArticles({ articles, countryCode }: Props) {
  if (!articles || articles.length === 0) return null;

  return (
    <aside className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-black text-slate-950">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <FileText className="h-5 w-5" />
        </span>
        مقالات ذات صلة
      </h3>
      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${countryCode}/lesson/articles/${article.id}`}
            className="group block rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/70"
          >
            <h4 className="mb-3 line-clamp-2 text-sm font-black leading-6 text-slate-800 transition-colors group-hover:text-blue-700">
              {article.title}
            </h4>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{new Date(article.created_at).toLocaleDateString('ar-JO')}</span>
              </div>
              <ArrowLeft
                size={14}
                className="text-slate-300 transition-all group-hover:text-blue-700 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
