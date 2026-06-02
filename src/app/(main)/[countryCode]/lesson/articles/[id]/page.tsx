import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import { safeJsonLd } from '@/lib/utils';
import ArticleHeader from '@/components/article/ArticleHeader';
import ArticleContent from '@/components/article/ArticleContent';
import ArticleContentWrapper from '@/components/article/ArticleContentWrapper';
import SidebarAdWrapper from '@/components/article/SidebarAdWrapper';
import RelatedArticles from '@/components/article/RelatedArticles';
import SeoContentBlock from '@/components/article/SeoContentBlock';
import ArticleComments from '@/components/article/ArticleComments';
import ArticleAds from '@/components/ads/ArticleAds';
import { STANDARD_CATEGORIES } from '@/components/subject/SemesterList';
import { getFrontSettings } from '@/lib/front-settings';
import { getAdLimit, shouldShowAds } from '@/lib/ads-policy';
import { evaluateAdsenseReadiness } from '@/lib/adsense-readiness';

interface Props {
  params: Promise<{
    countryCode: string;
    id: string;
  }>;
}

// Use ISR with revalidation for better performance
export const revalidate = 120;

// Cached fetch functions - prevents duplicate API calls between generateMetadata and page render
const getArticle = async (id: string, countryCode: string) => {
  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.ARTICLES.SHOW_PUBLIC(id),
      { database: countryCode },
      { next: { revalidate: 120 } } as any
    );
    const { data: article, content_with_keywords, author_details, comments, related_articles } = response.data;
    return {
      ...article,
      content: content_with_keywords || article.content,
      author: author_details || article.author,
      comments: comments || [],
      relatedArticles: related_articles || []
    };
  } catch (err) {
    console.error('Error fetching article:', err);
    return null;
  }
};

const getPublicSettings = async (): Promise<Record<string, string | null>> => {
  return getFrontSettings();
};

const getAdStatus = async (id: string, countryCode: string): Promise<{ eligible: boolean; adsense_risk: string }> => {
  try {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.ARTICLES.AD_STATUS(id),
      { country: countryCode },
      { next: { revalidate: 120 } } as any
    );
    return response.data ?? { eligible: true, adsense_risk: 'none' };
  } catch {
    return { eligible: true, adsense_risk: 'none' };
  }
};

// Generate Metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode, id } = await params;
  const [article, settings] = await Promise.all([
    getArticle(id, countryCode),
    getPublicSettings(),
  ]);

  if (!article) {
    return {
      title: 'مقال غير موجود',
    };
  }

  // Locale mapping
  const localeMap: Record<string, string> = { sa: 'ar_SA', eg: 'ar_EG', ps: 'ar_PS', jo: 'ar_JO' };
  const ogLocale = localeMap[countryCode] || 'ar_JO';

  // Title processing
  const pageTitle = article.title?.trim();
  const siteName = (settings.site_name || (settings as any).siteName || '').toString().trim();
  const resolvedSiteName = siteName || 'منصة التعليم';
  const metaTitle = article.meta_title ? `${pageTitle} - ${article.meta_title}` : `${pageTitle} | ${resolvedSiteName}`;

  // Description
  const description = article.meta_description || article.title;
  const readiness = evaluateAdsenseReadiness({
    title: article.title,
    content: article.content,
    metaDescription: article.meta_description,
    filesCount: Array.isArray(article.files) ? article.files.length : 0,
    isPublished: article.status === 1,
  });

  // Image processing
  const fallbackOgImage = '/assets/img/front-pages/icons/articles_default_image.webp';
  const rawImageUrl = article.image_url || article.image || fallbackOgImage;

  const rawBaseUrl = (settings.canonical_url || (settings as any).site_url || '').toString().trim();
  let baseUrl: string | undefined;
  if (rawBaseUrl) {
    const withProtocol = /^https?:\/\//i.test(rawBaseUrl) ? rawBaseUrl : `https://${rawBaseUrl}`;
    try {
      const url = new URL(withProtocol);
      baseUrl = url.origin;
    } catch {
      baseUrl = undefined;
    }
  }

  const ogImage = rawImageUrl.startsWith('http')
    ? rawImageUrl
    : baseUrl
      ? `${baseUrl}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`
      : rawImageUrl;
  const ogImageSecure = ogImage.replace(/^http:\/\//i, 'https://');

  // Keywords
  const keywordsList = article.keywords?.map((k: any) => k.keyword) || [];

  // Twitter Handle Logic
  const rawTwitter = (settings as any).twitter_handle || (settings as any).site_twitter_handle || '';
  const siteTwitterHandle = rawTwitter
    ? (rawTwitter.startsWith('@') ? rawTwitter : `@${rawTwitter}`)
    : undefined;
  const authorTwitterHandle = article.author?.twitter_handle 
    ? (article.author.twitter_handle.startsWith('@') ? article.author.twitter_handle : `@${article.author.twitter_handle}`) 
    : undefined;

  // Construct full section name (Class - Subject - Semester)
  const sectionParts = [
    article.schoolClass?.grade_name,
    article.subject?.subject_name || article.subject?.name,
    article.semester?.semester_name
  ].filter(Boolean);
  const sectionName = sectionParts.length > 0 ? sectionParts.join(' - ') : (article.subject?.name || '');

  return {
    title: metaTitle,
    description: description,
    keywords: keywordsList,
    robots: {
      index: readiness.shouldIndex,
      follow: true,
      'max-image-preview': 'large',
    },
    openGraph: {
      title: article.title,
      description: description,
      url: baseUrl ? `${baseUrl}/${countryCode}/lesson/articles/${id}` : `/${countryCode}/lesson/articles/${id}`,
      siteName: resolvedSiteName,
      locale: ogLocale,
      type: 'article',
      publishedTime: article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author?.name || 'Admin'],
      section: sectionName,
      tags: keywordsList,
      images: [
        {
          url: ogImage,
          secureUrl: ogImageSecure,
          width: 800,
          height: 600,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: [ogImageSecure],
      site: siteTwitterHandle,
      creator: authorTwitterHandle,
    },
    alternates: {
      canonical: `/${countryCode}/lesson/articles/${id}`,
    },
    other: {
      'article:published_time': article.created_at,
      'article:modified_time': article.updated_at,
      'article:author': article.author?.name || 'Admin', // Could be a URL to profile
      'article:section': sectionName,
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { countryCode, id } = await params;

  // Fetch article, settings, and ad eligibility in parallel
  const [article, settings, adStatus] = await Promise.all([
    getArticle(id, countryCode),
    getPublicSettings(),
    getAdStatus(id, countryCode),
  ]);

  const siteNameRuntime = (settings.site_name || (settings as any).siteName || '').toString().trim();
  const resolvedSiteName = siteNameRuntime || 'منصة التعليم';

  const rawBaseUrlRuntime = (settings.canonical_url || (settings as any).site_url || '').toString().trim();
  let baseUrl: string | undefined;
  if (rawBaseUrlRuntime) {
    const withProtocol = /^https?:\/\//i.test(rawBaseUrlRuntime) ? rawBaseUrlRuntime : `https://${rawBaseUrlRuntime}`;
    try {
      const url = new URL(withProtocol);
      baseUrl = url.origin;
    } catch {
      baseUrl = undefined;
    }
  }

  if (!article) {
    notFound();
  }

  const categoryName = STANDARD_CATEGORIES.find(c => c.id === article.file_category)?.name || article.file_category || 'مقال';

  // Extract ad settings for article page
  const adSettings = {
    googleAdsDesktop: settings.google_ads_desktop_article || '',
    googleAdsMobile: settings.google_ads_mobile_article || '',
    googleAdsDesktop2: settings.google_ads_desktop_article_2 || '',
    googleAdsMobile2: settings.google_ads_mobile_article_2 || '',
  };
  const articlePlainText = (article.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const articleReadiness = evaluateAdsenseReadiness({
    title: article.title,
    content: article.content,
    metaDescription: article.meta_description,
    filesCount: Array.isArray(article.files) ? article.files.length : 0,
    isPublished: article.status === 1,
    hasPolicyRisk: !adStatus.eligible || adStatus.adsense_risk === 'high',
  });
  const articleAdLimit = getAdLimit(articlePlainText.length);
  const showArticleAds = articleReadiness.shouldShowAds && shouldShowAds({
    hasApprovedContent: article.status === 1,
    hasPolicyRisk: !adStatus.eligible || adStatus.adsense_risk === 'high',
    contentLength: articlePlainText.length,
  });

  // Image processing for JSON-LD
  const fallbackOgImage = '/assets/img/front-pages/icons/articles_default_image.webp';
  const rawImageUrl = article.image_url || article.image || fallbackOgImage;
  const ogImage = rawImageUrl.startsWith('http')
    ? rawImageUrl
    : baseUrl
      ? `${baseUrl}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`
      : rawImageUrl;

  // Construct full section name (Class - Subject - Semester)
  const sectionParts = [
    article.schoolClass?.grade_name,
    article.subject?.subject_name || article.subject?.name,
    article.semester?.semester_name
  ].filter(Boolean);
  const sectionName = sectionParts.length > 0 ? sectionParts.join(' - ') : (article.subject?.name || '');

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.meta_title ? `${article.title} - ${article.meta_title}` : article.title,
    image: [ogImage],
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author?.name || 'Admin',
      url: (baseUrl ? `${baseUrl}/members` : '/members') + (article.author?.id ? `?user_id=${article.author.id}` : ''),
    },
    publisher: {
      '@type': 'Organization',
      name: resolvedSiteName,
      logo: {
        '@type': 'ImageObject',
        url: baseUrl ? `${baseUrl}/logo.png` : '/logo.png',
      },
    },
    description: article.meta_description || article.title,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': baseUrl ? `${baseUrl}/${countryCode}/lesson/articles/${id}` : `/${countryCode}/lesson/articles/${id}`
    },
    keywords: article.keywords?.map((k: any) => k.keyword).join(', '),
    articleSection: sectionName,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] pb-16">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* Header */}
      <ArticleHeader
        title={article.title}
        category={categoryName}
        date={article.created_at}
        views={article.visit_count || 0}
        author={article.author?.name}
        subject={article.subject?.subject_name || article.subject?.name}
        countryCode={countryCode}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:py-10">
        
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-8">
          {/* Right Column: Article Content (8 cols) */}
          <article className="min-w-0 lg:col-span-8">
            <div className="rounded-[1.35rem] border border-blue-100/70 bg-white p-4 shadow-sm sm:p-6 md:p-8 lg:p-10">

              <ArticleContentWrapper>
                <ArticleContent
                  content={article.content}
                  files={article.files}
                  backLink={`/${countryCode}/lesson/articles/${article.id}`}
                  adSettings={adSettings}
                  showInlineAd={showArticleAds && articleAdLimit >= 1}
                  title={article.title}
                  subject={article.subject?.subject_name || article.subject?.name}
                  category={categoryName}
                  sectionName={sectionName}
                />

                {/* Factual file summary — populated from real article data */}
                <SeoContentBlock
                  title={article.title}
                  subject={article.subject?.subject_name || article.subject?.name}
                  category={categoryName}
                  sectionName={sectionName}
                  gradeName={article.schoolClass?.grade_name}
                  semesterName={article.semester?.semester_name}
                  files={article.files}
                />

                {showArticleAds && articleAdLimit >= 2 && (
                  <ArticleAds adSettings={adSettings} position="content-bottom" />
                )}
              </ArticleContentWrapper>

              {/* Keywords */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 border-t border-blue-50 pt-8">
                  <h3 className="mb-4 text-lg font-black text-slate-950">الكلمات المفتاحية</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword: any, index: number) => (
                      <a
                        key={keyword.id || `keyword-${index}`}
                        href={`/${countryCode}/lesson/articles/keyword/${encodeURIComponent(keyword.keyword)}`}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        {keyword.keyword}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <ArticleComments 
                articleId={article.id} 
                countryCode={countryCode} 
                authorId={article.author?.id}
              />
            </div>
          </article>

          {/* Left Column: Sidebar (4 cols) */}
          <SidebarAdWrapper adSettings={showArticleAds && articleAdLimit >= 2 ? adSettings : undefined}>
            {/* Related Articles Widget */}
            <RelatedArticles articles={article.relatedArticles} countryCode={countryCode} />
          </SidebarAdWrapper>

        </div>
      </main>
    </div>
  );
}
