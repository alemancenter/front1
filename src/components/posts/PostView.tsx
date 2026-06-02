'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  Clipboard,
  Download,
  Eye,
  Facebook,
  FileText,
  Folder,
  Home,
  Info,
  Lock,
  LogIn,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Send,
  Share2,
  Tag,
  Twitter,
  User,
  UserPlus,
} from 'lucide-react';
import { formatFileSize, getStorageUrl } from '@/lib/utils';
import { postsService } from '@/lib/api/services';
import { commentsService } from '@/lib/api/services/comments';
import { useAuthStore } from '@/store/useStore';
import { useInView } from '@/hooks/useInView';
import Image from '@/components/common/AppImage';
import Badge from '@/components/ui/Badge';
import PostSeoContentBlock from './PostSeoContentBlock';
import ResponsiveAd from '@/components/ads/ResponsiveAd';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import { sanitizeRichHtml } from '@/lib/sanitize-html';
import { shouldShowAds, getAdLimit } from '@/lib/ads-policy';
import { evaluateAdsenseReadiness } from '@/lib/adsense-readiness';

interface PostViewProps {
  post: any;
  countryCode: string;
  currentUrl?: string;
  adSettings?: {
    googleAdsDesktop: string;
    googleAdsMobile: string;
    googleAdsDesktop2: string;
    googleAdsMobile2: string;
  };
}

function getPostFiles(post: any): any[] {
  if (Array.isArray(post?.attachments)) return post.attachments;
  if (Array.isArray(post?.files)) return post.files;
  return [];
}

function isPostImageFile(file: any): boolean {
  return String(file?.file_category || '').toLowerCase() === 'post_image';
}

function isPlaceholderImage(path: string | undefined): boolean {
  if (!path) return false;
  try { return new URL(path).hostname === 'via.placeholder.com'; } catch { return false; }
}

function getPostImagePath(post: any): string | undefined {
  if (post?.image_url && !isPlaceholderImage(post.image_url)) return post.image_url;
  if (post?.image && !isPlaceholderImage(post.image)) return post.image;
  const imageFile = getPostFiles(post).find(isPostImageFile);
  const filePath = imageFile?.file_url || imageFile?.file_path;
  return isPlaceholderImage(filePath) ? undefined : filePath;
}

function cleanText(value?: string) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDate(date?: string) {
  if (!date) return 'غير محدد';
  try {
    return new Date(date).toLocaleDateString('ar-JO', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date;
  }
}

function compactNumber(value: number) {
  try { return new Intl.NumberFormat('ar-JO', { notation: 'compact', maximumFractionDigits: 1 }).format(value || 0); } catch { return String(value || 0); }
}

function normalizeKeywords(keywords: any, countryCode: string) {
  const list: { key: string; label: string; href: string }[] = [];
  if (typeof keywords === 'string') {
    keywords.split(/[,،;؛]+/).forEach((kw: string) => {
      const label = kw.trim();
      if (label) list.push({ key: label, label, href: `/${countryCode}/posts/keyword/${encodeURIComponent(label)}` });
    });
  } else if (Array.isArray(keywords)) {
    keywords.forEach((k: any) => {
      const label = (typeof k === 'string' ? k : k.keyword || '').toString().trim();
      if (label) list.push({ key: String(k.id || label), label, href: `/${countryCode}/posts/keyword/${encodeURIComponent(label)}` });
    });
  }
  return list;
}

function getFileTone(fileType?: string) {
  const normalized = String(fileType || '').toLowerCase();
  if (normalized.includes('pdf')) return 'border-red-200 bg-red-50 text-red-700';
  if (normalized.includes('doc')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (normalized.includes('xls')) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized.includes('ppt')) return 'border-orange-200 bg-orange-50 text-orange-700';
  return 'border-violet-200 bg-violet-50 text-violet-700';
}

export default function PostView({ post, countryCode, currentUrl, adSettings }: PostViewProps) {
  const { isAuthenticated } = useAuthStore();
  const frontSettings = useFrontSettings();
  const adClient = (frontSettings?.adsense_client || '').toString();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const [comments, setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentSuccessMessage, setCommentSuccessMessage] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [freshPostFiles, setFreshPostFiles] = useState<any[] | null>(null);
  const [copied, setCopied] = useState(false);

  const { ref: commentsRef, inView: commentsInView } = useInView();

  const featuredImagePath = getPostImagePath(post);
  const featuredImageSrc = getStorageUrl(featuredImagePath);
  const postAttachments = (freshPostFiles ?? getPostFiles(post)).filter((file) => !isPostImageFile(file));
  const summary = post.meta_description || post.description || cleanText(post.content).slice(0, 180) || 'منشور تعليمي منظم ضمن المنصة، يعرض المحتوى والملفات المرتبطة بطريقة واضحة وسهلة التصفح.';
  const keywords = normalizeKeywords(post.keywords, countryCode);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return currentUrl || '';
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&display=popup`,
      'facebook-share',
      'width=626,height=436'
    );
  };
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(post.title || '')}`,
      'twitter-share',
      'width=600,height=400'
    );
  };
  const shareOnWhatsApp = () => {
    const text = post.title ? `${post.title}\n${getShareUrl()}` : getShareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const contentMetrics = useMemo(() => {
    const plainText = cleanText(post.content || '');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const charCount = plainText.length;
    return { wordCount, charCount, hasMinimumContent: wordCount >= 300 };
  }, [post.content]);

  const adPolicy = useMemo(() => {
    const readiness = evaluateAdsenseReadiness({
      title: post.title,
      content: post.content,
      metaDescription: post.meta_description,
      filesCount: postAttachments.length,
      isPublished: post.is_active !== false && post.status !== 'draft' && post.status !== 'pending',
    });
    const showAds = readiness.shouldShowAds && shouldShowAds({
      hasApprovedContent: post.is_active !== false && post.status !== 'draft' && post.status !== 'pending',
      contentLength: contentMetrics.charCount,
    });
    const adLimit = getAdLimit(contentMetrics.charCount);
    return { showAds, adLimit, readiness };
  }, [post.title, post.content, post.meta_description, postAttachments.length, post.is_active, post.status, contentMetrics.charCount]);

  const { contentWithIds, toc } = useMemo(() => {
    let content = sanitizeRichHtml(post.content || '', [
      'www.youtube.com', 'youtube.com', 'youtube-nocookie.com',
      'player.vimeo.com', 'vimeo.com',
      'www.google.com', 'maps.google.com',
      'www.dailymotion.com', 'dailymotion.com',
    ]);
    const headers: { id: string; text: string; level: number }[] = [];
    let index = 0;
    content = content.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match: string, tag: string, attrs: string, text: string) => {
      const id = `section-${index++}`;
      const clean = text.replace(/<[^>]*>/g, '');
      headers.push({ id, text: clean, level: parseInt(tag.substring(1)) });
      return `<${tag} id="${id}"${attrs}>${text}</${tag}>`;
    });
    return { contentWithIds: content, toc: headers };
  }, [post.content]);

  useEffect(() => {
    const incrementView = async () => {
      try {
        const { API_ENDPOINTS } = await import('@/lib/api/config');
        const { apiClient } = await import('@/lib/api/client');
        await apiClient.post(API_ENDPOINTS.POSTS.INCREMENT_VIEW(post.id), { country: countryCode }, { cache: 'no-store' });
      } catch {}
    };
    incrementView();
  }, [post.id, countryCode]);

  useEffect(() => {
    const categoryId = post.category?.id || post.category_id;
    let active = true;
    async function fetchRelated() {
      if (!categoryId) return;
      try {
        const res = await postsService.getAll({ category_id: categoryId, per_page: 6, country: countryCode }, { next: { revalidate: 3600 } } as any);
        const apiRes = res as any;
        const apiData = apiRes?.data?.data || apiRes?.data || [];
        const filtered = (Array.isArray(apiData) ? apiData : []).filter((p: any) => p.id !== post.id).slice(0, 4);
        if (active) setRelatedPosts(filtered);
      } catch {}
    }
    fetchRelated();
    return () => { active = false; };
  }, [post.category, post.category_id, post.id, countryCode]);

  useEffect(() => {
    let cancelled = false;
    const refreshFiles = async () => {
      if (!post.id) return;
      try {
        const freshPost = await postsService.getById(post.id, countryCode);
        const files = getPostFiles(freshPost);
        if (!cancelled && files.length > 0) setFreshPostFiles(files);
      } catch {}
    };
    refreshFiles();
    return () => { cancelled = true; };
  }, [post.id, countryCode]);

  useEffect(() => { setIsMounted(true); }, []);

  // Lazy-load comments: only fetch when the comments section scrolls near the viewport.
  useEffect(() => {
    if (!commentsInView || !post.id) return;
    async function fetchComments() {
      try {
        const res = await commentsService.getAll(countryCode, { commentable_id: post.id, commentable_type: 'App\\Models\\Post', per_page: 50 });
        setComments(res.data || []);
      } catch {}
    }
    fetchComments();
  }, [commentsInView, post.id, countryCode]);

  const handleCommentSubmit = async () => {
    if (!commentBody.trim() || !isAuthenticated) return;
    setIsSubmitting(true);
    try {
      await commentsService.create(countryCode, { body: commentBody, commentable_id: post.id, commentable_type: 'App\\Models\\Post' });
      setCommentBody('');
      setCommentSuccessMessage('تم إرسال التعليق وسيظهر بعد مراجعته.');
    } catch {
      alert('حدث خطأ أثناء إرسال التعليق. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fbff] font-sans text-slate-950" dir="rtl">
      <section className="relative overflow-hidden border-b border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_42%,#ffffff_100%)] pt-28 pb-14 lg:pt-32 lg:pb-18">
        <div className="absolute inset-0 pointer-events-none opacity-60 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.12)_1px,transparent_0)] [background-size:30px_30px]" />
        <div className="absolute -right-24 top-6 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -left-24 bottom-6 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4">
          <nav aria-label="breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 shadow-sm transition hover:text-blue-700">
              <Home className="h-4 w-4" />
              الرئيسية
            </Link>
            <ChevronLeft className="h-4 w-4 text-slate-400" />
            <Link href={`/${countryCode}/posts`} className="rounded-full border border-white/80 bg-white/80 px-3 py-2 shadow-sm transition hover:text-blue-700">المنشورات</Link>
            {post.category && (
              <>
                <ChevronLeft className="h-4 w-4 text-slate-400" />
                <Link href={`/${countryCode}/posts/category/${post.category.id}`} className="rounded-full bg-blue-50 px-3 py-2 text-blue-700 shadow-sm">{post.category.name}</Link>
              </>
            )}
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 lg:order-1">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-2 text-sm font-black text-blue-700 shadow-sm">
                <BookOpen className="h-4 w-4" />
                منشور تعليمي
              </div>
              <h1 className="max-w-5xl text-3xl font-black leading-[1.25] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl xl:text-6xl">{post.title}</h1>
              <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-slate-600 lg:text-lg">{summary}</p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: User, label: 'الكاتب', value: post.author?.name || 'فريق التحرير' },
                  { icon: CalendarDays, label: 'تاريخ النشر', value: formatDate(post.created_at) },
                  { icon: Eye, label: 'المشاهدات', value: compactNumber(Number(post.views || post.visit_count || 0)) },
                  { icon: Paperclip, label: 'المرفقات', value: `${postAttachments.length} ملف` },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[1.35rem] border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></div>
                      <div className="text-xs font-bold text-slate-500">{item.label}</div>
                      <div className="mt-1 line-clamp-2 text-sm font-black text-slate-950">{item.value}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#post-content" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
                  <FileText className="h-4 w-4" />
                  قراءة المنشور
                </a>
                <a href="#attachments" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700">
                  <Download className="h-4 w-4" />
                  عرض المرفقات
                </a>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative mx-auto max-w-[620px]">
                <div className="absolute -left-8 top-8 h-48 w-48 rounded-full bg-blue-200/35 blur-3xl" />
                <div className="absolute bottom-8 right-8 h-52 w-52 rounded-full bg-emerald-200/25 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-4 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.42)] backdrop-blur-xl">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-slate-100 bg-gradient-to-br from-[#071a3f] via-[#0c3b91] to-[#0b5cff]">
                    {featuredImageSrc ? (
                      <Image src={featuredImageSrc} alt={`صورة توضيحية للمنشور: ${post.title}`} fill priority fetchPriority="high" sizes="(max-width: 1024px) 100vw, 620px" className="object-cover" />
                    ) : (
                      <div className="flex h-full flex-col justify-between p-6 text-white">
                        <div className="inline-flex w-fit rounded-full bg-white/12 px-3 py-1 text-xs font-black">{post.category?.name || 'تعليم'}</div>
                        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/10"><FileText className="h-14 w-14" /></div>
                        <div className="text-center text-xl font-black">منشور تعليمي منظم</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    {[
                      { value: contentMetrics.wordCount, label: 'كلمة' },
                      { value: postAttachments.length, label: 'مرفق' },
                      { value: toc.length, label: 'عنوان فرعي' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <div className="text-lg font-black text-slate-950">{stat.value}</div>
                        <div className="mt-1 text-xs font-bold text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="space-y-8 lg:col-span-8">
            <article id="post-content" className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 md:px-8">
                <div className="flex flex-wrap gap-2">
                  {[
                    { href: '#post-content', label: 'المحتوى' },
                    { href: '#attachments', label: 'المرفقات' },
                    { href: '#keywords', label: 'الكلمات' },
                    { href: '#comments', label: 'التعليقات' },
                  ].map((item) => (
                    <a key={item.href} href={item.href} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">{item.label}</a>
                  ))}
                </div>
              </div>

              <div className="p-5 md:p-8 lg:p-10">
                {isMounted && adPolicy.showAds && adPolicy.adLimit >= 1 && (
                  <div className="mb-8 rounded-[1.75rem] border border-slate-100 bg-slate-50 p-4">
                    <ResponsiveAd adClient={adClient} desktopCode={adSettings?.googleAdsDesktop || undefined} mobileCode={adSettings?.googleAdsMobile || undefined} />
                  </div>
                )}

                <section className="mb-8 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/60 p-5 text-right">
                  <div className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Info className="h-5 w-5 text-emerald-700" />معلومات قبل قراءة المنشور أو تحميل المرفقات</div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['نوع الصفحة', 'منشور تعليمي'],
                      ['القسم', post.category?.name || 'موارد تعليمية'],
                      ['المرفقات', `${postAttachments.length} ملف`],
                      ['حالة الوصول', postAttachments.length > 0 ? 'واضحة حسب تسجيل الدخول' : 'قراءة مباشرة'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/80 bg-white/90 p-4">
                        <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
                        <strong className="text-sm text-slate-950">{value}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm font-medium leading-7 text-slate-700">
                    تم تنظيم هذه الصفحة لتقديم معلومات واضحة للقارئ قبل أي إجراء تحميل. المرفقات، إن وجدت، مخصصة للاستخدام التعليمي الشخصي، وننصح بقراءة وصف المنشور أولًا ثم استخدام الملف بما يخدم الدراسة أو التحضير.
                  </p>
                </section>

                <div className="rich-content max-w-none text-right" dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                <PostSeoContentBlock
                  title={post.title}
                  category={post.category?.name}
                  keywords={post.keywords}
                />

                {postAttachments.length > 0 && (
                  <section id="attachments" className="mt-10 rounded-[2rem] border border-slate-100 bg-slate-50/80 p-5 md:p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><Paperclip className="h-6 w-6" /></div>
                      <div>
                        <h2 className="text-xl font-black text-slate-950">المرفقات والملفات</h2>
                        <p className="text-sm font-medium text-slate-600">ملفات مرتبطة بالمنشور. يظهر خيار التحميل بوضوح حسب حالة تسجيل الدخول وصلاحية الوصول.</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {postAttachments.map((file: any) => {
                        const tone = getFileTone(file.file_type);
                        return (
                          <div key={file.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 flex-1 items-start gap-4">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${tone}`}>
                                  {String(file.file_type || 'FILE').replace('.', '').slice(0, 4).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="line-clamp-2 text-base font-black leading-7 text-slate-950">{file.file_name || 'ملف للتحميل'}</h3>
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{file.file_type || 'ملف'}</span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1" dir="ltr">{formatFileSize(file.file_size || 0)}</span>
                                  </div>
                                </div>
                              </div>

                              {isAuthenticated ? (
                                <Link href={`/download/${file.id}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
                                  <Download className="h-4 w-4" />
                                  تحميل الملف
                                </Link>
                              ) : (
                                <div className="flex flex-col gap-3 sm:items-end">
                                  <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600"><Lock className="h-4 w-4" />يتطلب تسجيل دخول مجاني</div>
                                  <div className="flex gap-2">
                                    <Link href={`/login?return=${encodeURIComponent(pathname)}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 text-xs font-black text-white transition hover:bg-blue-800"><LogIn className="h-3.5 w-3.5" />دخول</Link>
                                    <Link href={`/register?return=${encodeURIComponent(pathname)}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 text-xs font-black text-blue-700 transition hover:bg-blue-50"><UserPlus className="h-3.5 w-3.5" />حساب جديد</Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {keywords.length > 0 && (
                  <section id="keywords" className="mt-10 border-t border-slate-100 pt-8">
                    <div className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Tag className="h-5 w-5 text-blue-700" />الكلمات الدلالية</div>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map(({ key, label, href }) => <Link key={key} href={href} className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-700 hover:text-white">{label}</Link>)}
                    </div>
                  </section>
                )}

                <div className="mt-10 rounded-[2rem] border border-blue-100 bg-gradient-to-l from-blue-50 to-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-xl font-black text-white">{post.author?.name ? post.author.name[0].toUpperCase() : 'A'}</div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{post.author?.name || 'فريق التحرير'}</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">كاتب ومحرر في المنصة، يعمل على تنظيم المحتوى التعليمي وتسهيل الوصول إليه للطلاب والمعلمين.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {isMounted && adPolicy.showAds && adPolicy.adLimit >= 2 && (
              <div className="rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm">
                <ResponsiveAd adClient={adClient} desktopCode={adSettings?.googleAdsDesktop2 || undefined} mobileCode={adSettings?.googleAdsMobile2 || undefined} />
              </div>
            )}

            {relatedPosts.length > 0 && (
              <section className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-slate-950">اقرأ أيضاً</h2>
                  {post.category && <Link href={`/${countryCode}/posts/category/${post.category.id}`} className="text-sm font-black text-blue-700 hover:underline">عرض القسم</Link>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedPosts.map((related: any) => (
                    <Link key={related.id} href={`/${countryCode}/posts/${related.id}`} className="group rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50">
                      <h3 className="line-clamp-2 text-base font-black leading-7 text-slate-950 transition group-hover:text-blue-700">{related.title}</h3>
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-600"><CalendarDays className="h-4 w-4" />{formatDate(related.created_at)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section id="comments" ref={commentsRef} className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950"><MessageSquare className="h-6 w-6 text-blue-700" />التعليقات</h2>
                <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-blue-700">{comments.length} تعليق</div>
              </div>

              <div className="mb-6 rounded-[1.5rem] border border-blue-100 bg-blue-50/60 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-base font-black text-slate-950"><Send className="h-4 w-4 text-blue-700" />اكتب تعليقك</h3>
                {isMounted && isAuthenticated ? (
                  <>
                    <label htmlFor="comment-body" className="sr-only">نص التعليق</label>
                    <textarea id="comment-body" name="comment-body" value={commentBody} onChange={(e) => { setCommentBody(e.target.value); setCommentSuccessMessage(null); }} placeholder="شاركنا رأيك حول هذا المنشور..." className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
                    {commentSuccessMessage && <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700"><CheckCircle className="h-4 w-4" />{commentSuccessMessage}</div>}
                    <div className="mt-4 flex justify-end"><button onClick={handleCommentSubmit} disabled={isSubmitting || !commentBody.trim()} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'جاري الإرسال...' : 'إرسال التعليق'}</button></div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center">
                    <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-slate-600"><Info className="h-5 w-5" />يجب تسجيل الدخول لإضافة تعليق</div>
                    <Link href={`/login?return=${encodeURIComponent(pathname)}`} className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-700 px-5 text-sm font-black text-white transition hover:bg-blue-800">تسجيل الدخول</Link>
                  </div>
                )}
              </div>

              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment, idx) => (
                    <div key={comment.id || `comment-${idx}`} id={comment.id ? `comment-${comment.id}` : undefined} className="flex gap-4 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">{comment.user?.name ? comment.user.name[0].toUpperCase() : 'U'}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2"><span className="font-black text-slate-950">{comment.user?.name || 'مستخدم'}</span>{(comment.user?.id === post.author?.id || comment.user?.id === post.author_id) && <Badge variant="outline" className="border-blue-200 bg-blue-50 text-xs text-blue-700">الكاتب</Badge>}</div>
                          <span className="text-xs font-bold text-slate-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="leading-7 text-slate-700">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <MessageSquare className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                  <h3 className="text-lg font-black text-slate-700">لا توجد تعليقات بعد</h3>
                  <p className="mt-1 text-sm font-bold text-slate-500">كن أول من يعلق على هذا المنشور.</p>
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-black text-slate-950">ملخص المنشور</h2>
                <div className="space-y-3">
                  {[
                    ['القسم', post.category?.name || 'غير محدد'],
                    ['الكاتب', post.author?.name || 'فريق التحرير'],
                    ['تاريخ النشر', formatDate(post.created_at)],
                    ['المرفقات', `${postAttachments.length} ملف`],
                    ['الكلمات', `${keywords.length} كلمة`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-bold text-slate-600">{label}</span>
                      <span className="text-left font-black text-slate-950">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {toc.length > 0 && (
                <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-lg font-black text-slate-950">محتويات الصفحة</h2>
                  <div className="space-y-2">
                    {toc.map((item) => <a key={item.id} href={`#${item.id}`} className={`block rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 ${item.level === 3 ? 'mr-4' : ''}`}>{item.text}</a>)}
                  </div>
                </div>
              )}

              {post.category && (
                <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Folder className="h-5 w-5 text-blue-700" />عن القسم</h2>
                  <p className="text-sm font-medium leading-7 text-slate-600">{post.category.description || 'تصفح جميع المنشورات والموارد المرتبطة بهذا القسم.'}</p>
                  <Link href={`/${countryCode}/posts/category/${post.category.id}`} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-50 text-sm font-black text-slate-800 transition hover:bg-blue-700 hover:text-white">تصفح القسم</Link>
                </div>
              )}

              <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950"><Share2 className="h-5 w-5 text-blue-700" />مشاركة المنشور</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={shareOnFacebook} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-blue-50 text-sm font-black text-blue-700 transition hover:bg-blue-700 hover:text-white">
                    <Facebook className="h-4 w-4" />فيسبوك
                  </button>
                  <button onClick={shareOnTwitter} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-sky-50 text-sm font-black text-sky-700 transition hover:bg-sky-600 hover:text-white">
                    <Twitter className="h-4 w-4" />تويتر
                  </button>
                  <button onClick={shareOnWhatsApp} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700 transition hover:bg-emerald-600 hover:text-white">
                    <MessageCircle className="h-4 w-4" />واتساب
                  </button>
                  <button onClick={copyLink} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 text-sm font-black text-slate-700 transition hover:bg-slate-800 hover:text-white">
                    <Clipboard className="h-4 w-4" />{copied ? 'تم النسخ' : 'نسخ الرابط'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
