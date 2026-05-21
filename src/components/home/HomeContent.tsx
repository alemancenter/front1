'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen, Headphones, Layers3, School, Users } from 'lucide-react';
import { useSettingsStore, useAuthStore } from '@/store/useStore';
import type { HomeContentProps } from './HomeTypes';
import HomeHero from './HomeHero';



const HomeClassesSection = dynamic(() => import('./HomeClassesSection'), {
  loading: () => <div className="mt-8 h-64 rounded-3xl border border-blue-100 bg-white/70 shadow-sm" aria-hidden="true" />,
});

const HomeEditorialSection = dynamic(() => import('./HomeEditorialSection'), {
  loading: () => <div className="container mx-auto px-4 py-12"><div className="h-72 rounded-3xl border border-blue-100 bg-white/70 shadow-sm" aria-hidden="true" /></div>,
});

const HomeCategoriesSection = dynamic(() => import('./HomeCategoriesSection'), {
  loading: () => <div className="h-72 rounded-3xl border border-blue-100 bg-white/70 shadow-sm" aria-hidden="true" />,
});

const HomeAds = dynamic(() => import('./HomeAds'), {
  loading: () => null,
});

type TrendingCandidate = {
  label: string;
  score: number;
  href: string;
  resultsCount?: number;
};

function cleanTrendingLabel(value: unknown) {
  const text = String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N}\s،,-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text || text.length < 3) return '';
  return text.split(' ').slice(0, 4).join(' ');
}

function buildTrendingSearches({
  country,
  articles = [],
  posts = [],
}: Pick<HomeContentProps, 'country' | 'articles' | 'posts'>) {
  const candidates: TrendingCandidate[] = [];
  const countryCode = country?.code || 'jo';

  articles.forEach((article) => {
    if (!article?.id || !article?.title) return;
    const label = cleanTrendingLabel(article.title);
    if (!label) return;

    const score = Number(article.visit_count || article.views || article.downloads || 0);
    candidates.push({
      label,
      score: score + 100,
      href: `/${countryCode}/lesson/articles/${article.id}`,
      resultsCount: 1,
    });
  });

  posts.forEach((post) => {
    if (!post?.id || !post?.title) return;
    const label = cleanTrendingLabel(post.title);
    if (!label) return;

    const score = Number(post.views_count || post.views || 0);
    candidates.push({
      label,
      score: score + 100,
      href: `/${countryCode}/posts/${post.id}`,
      resultsCount: 1,
    });
  });

  const byHref = new Map<string, TrendingCandidate>();
  candidates.forEach((candidate) => {
    const current = byHref.get(candidate.href);
    if (!current || candidate.score > current.score) byHref.set(candidate.href, candidate);
  });

  return Array.from(byHref.values())
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'ar'))
    .slice(0, 5);
}

export default function HomeContent({
  country,
  classes,
  categories,
  articles,
  posts,
  featuredPosts,
  initialSiteName,
  isLoggedIn = false,
  adSettings,
}: HomeContentProps) {
  const { siteName } = useSettingsStore();
  const { isAuthenticated } = useAuthStore();
  const showHeroButtons = !isLoggedIn && !isAuthenticated;
  const resolvedSiteName = (initialSiteName || siteName || 'موقع الألمان').toString().trim();
  const trendingSearches = useMemo(
    () => buildTrendingSearches({ country, articles, posts }),
    [country, articles, posts]
  );

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'ملف تعليمي', value: '+2.4K', icon: BookOpen },
    { label: 'طالب مستفيد', value: '+50K', icon: Users },
    { label: 'قسم تعليمي', value: '18', icon: School },
    { label: 'دعم ومساعدة', value: '24/7', icon: Headphones },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbff] font-sans text-slate-900" dir="rtl">
      <HomeHero country={country} siteName={resolvedSiteName} showHeroButtons={showHeroButtons} trendingSearches={trendingSearches} />

      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto mt-2 grid max-w-5xl grid-cols-2 rounded-3xl border border-blue-100 bg-white/90 shadow-lg shadow-blue-100/40 backdrop-blur md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`flex items-center justify-center gap-4 p-5 ${index !== stats.length - 1 ? 'border-l border-blue-50' : ''}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-black text-blue-900">{stat.value}</div>
                  <div className="text-sm font-bold text-slate-700">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <HomeClassesSection country={country} classes={classes} mounted={isMounted} adSettings={adSettings} />
      </div>

      <HomeEditorialSection
        country={country}
        articles={articles}
        posts={posts}
        featuredPosts={featuredPosts}
      />

      <div className="container mx-auto px-4 pb-16">
        <div id="sections" className="mb-8">
          <HomeCategoriesSection country={country} categories={categories} />
          <HomeAds mounted={isMounted} adSettings={adSettings} slot="secondary" className="mt-8" />
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-blue-100 bg-blue-50/70 text-center shadow-sm md:grid-cols-4">
          {[
            { title: 'متاح في أي وقت', desc: 'على جميع الأجهزة', icon: Layers3 },
            { title: 'متوافق مع المنهاج', desc: 'حسب وزارة التربية والتعليم', icon: BookOpen },
            { title: 'موارد تعليمية موثوقة', desc: 'مراجعة من اختصاصيين', icon: School },
            { title: 'مجتمع تعليمي داعم', desc: 'تبادل الخبرات والمناقشات', icon: Users },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`flex items-center justify-center gap-4 p-6 ${index !== 3 ? 'border-l border-blue-100' : ''}`}>
                <Icon className="h-8 w-8 text-blue-600" />
                <div className="text-right">
                  <div className="font-black text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-700">{item.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
