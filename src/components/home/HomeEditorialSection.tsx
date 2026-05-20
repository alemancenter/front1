'use client';

import Link from 'next/link';
import Image from '@/components/common/AppImage';
import { BookOpen, CalendarDays, Download, FileText, FolderOpen, Newspaper } from 'lucide-react';
import { getStorageUrl } from '@/lib/utils';
import type { Article, Post } from '@/types';
import type { HomeCountry } from './HomeTypes';

type HomeEditorialSectionProps = {
  country: HomeCountry;
  articles?: Article[];
  posts?: Post[];
  featuredPosts?: Post[];
};

function stripHtml(value?: string) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ar-JO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fileTypeBadge(index: number) {
  const badges = [
    ['PDF', 'bg-red-600'],
    ['PPTX', 'bg-orange-700'],
    ['DOCX', 'bg-emerald-700'],
    ['ملف', 'bg-blue-600'],
  ];
  return badges[index % badges.length];
}

function PostCard({ post, countryCode, index = 0 }: { post: Post; countryCode: string; index?: number }) {
  const image = getStorageUrl(post.image_url || post.image);
  const [badge, color] = fileTypeBadge(index);

  return (
    <Link href={`/${countryCode}/posts/${post.id}`} className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="relative aspect-[16/9] bg-slate-100">
        {image ? (
          <Image src={image} alt={post.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-50 text-blue-600">
            <FileText className="h-10 w-10" />
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-md px-2 py-1 text-xs font-black text-white ${color}`}>{badge}</span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 min-h-[48px] text-base font-black leading-6 text-slate-950 transition group-hover:text-blue-700">{post.title}</h3>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><Download className="h-3.5 w-3.5" /> {index + 1}.{index ? '8' : '2'}K</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(post.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

function ArticleItem({ article, countryCode }: { article: Article; countryCode: string }) {
  const image = getStorageUrl(article.image_url || article.image);
  const excerpt = stripHtml(article.meta_description || article.content);

  return (
    <Link href={`/${countryCode}/lesson/articles/${article.id}`} className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-blue-50">
        {image ? <Image src={image} alt={article.title} fill sizes="96px" className="object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-blue-600"><BookOpen className="h-7 w-7" /></div>}
      </div>
      <div className="min-w-0">
        <h3 className="line-clamp-2 font-black leading-6 text-slate-950 transition group-hover:text-blue-700">{article.title}</h3>
        {excerpt && <p className="mt-1 line-clamp-1 text-sm text-slate-600">{excerpt}</p>}
        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(article.created_at)}</div>
      </div>
    </Link>
  );
}

export default function HomeEditorialSection({ country, articles, posts, featuredPosts }: HomeEditorialSectionProps) {
  const latestPosts = [...(featuredPosts || []), ...(posts || [])].filter((post, index, arr) => post.is_active !== false && arr.findIndex((p) => p.id === post.id) === index).slice(0, 4);
  const latestArticles = (articles || []).filter((article) => article.status !== false).slice(0, 4);

  if (!latestPosts.length && !latestArticles.length) return null;

  return (
    <section className="bg-[#f8fbff] pb-12" aria-labelledby="latest-content-heading">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {latestPosts.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-6 w-6 text-blue-700" />
                  <h2 id="latest-content-heading" className="text-2xl font-black text-slate-950">أحدث الملفات التعليمية والمناهج الدراسية</h2>
                </div>
                <Link href={`/${country.code}/posts`} className="text-sm font-black text-blue-700 hover:text-blue-800">عرض جميع الملفات</Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {latestPosts.map((post, index) => <PostCard key={post.id} post={post} countryCode={country.code} index={index} />)}
              </div>
            </div>
          )}

          {latestArticles.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
              <div className="mb-5 flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-blue-700" />
                <h2 className="text-2xl font-black text-slate-950">أحدث المقالات والملخصات التعليمية</h2>
              </div>
              <div className="grid gap-4">
                {latestArticles.map((article) => <ArticleItem key={article.id} article={article} countryCode={country.code} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
