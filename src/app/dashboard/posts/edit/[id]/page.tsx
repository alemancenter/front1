'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from '@/components/common/AppImage';
import { toast } from 'react-hot-toast';
import { Save, FileText, Tag, Image as ImageIcon, Upload, Sparkles, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { uploadEditorFile, uploadEditorImage } from '@/lib/editor/uploads';
import { postsService, categoriesService, articlesService, COUNTRIES } from '@/lib/api/services';
import type { FileItem } from '@/types';
import { getStorageUrl, extractError } from '@/lib/utils';
import { triggerSitemapRegen, countryIdToDatabase } from '@/lib/triggerSitemap';
import { notificationService } from '@/lib/api/services/notifications';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import AccessDenied from '@/components/common/AccessDenied';

type DashboardCountryId = '1' | '2' | '3' | '4';

function normalizeDashboardCountryId(country: unknown, fallback: DashboardCountryId = '1'): DashboardCountryId {
  const value = String(country || '').trim().toLowerCase();
  const byCode: Record<string, DashboardCountryId> = { jo: '1', sa: '2', eg: '3', ps: '4' };
  if (value === '1' || value === '2' || value === '3' || value === '4') return value;
  return byCode[value] || fallback;
}

function parseDashboardPostId(rawId: unknown, countryFallback?: string | null) {
  const raw = String(rawId || '').trim();
  const fallbackCountry = normalizeDashboardCountryId(countryFallback);

  // Review Queue and cross-country reports may generate IDs like "jo:26".
  // The dashboard API expects the numeric ID only, with country passed separately.
  const compositeMatch = raw.match(/^([a-z]{2}|[1-4]):(\d+)$/i);
  if (compositeMatch) {
    return {
      id: compositeMatch[2],
      country: normalizeDashboardCountryId(compositeMatch[1], fallbackCountry),
      isValid: true,
    };
  }

  if (/^\d+$/.test(raw)) {
    return { id: raw, country: fallbackCountry, isValid: true };
  }

  return { id: '', country: fallbackCountry, isValid: false };
}

export default function EditPostPage() {
  const { isAuthorized } = usePermissionGuard('manage posts');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params.id as string;
  const countryParam = searchParams.get('country');
  const parsedRoute = useMemo(() => parseDashboardPostId(rawId, countryParam), [rawId, countryParam]);
  const postId = parsedRoute.id;

  const contentRef = useRef<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<DashboardCountryId>(parsedRoute.country);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<FileItem[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [isTitleDuplicate, setIsTitleDuplicate] = useState(false);
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);
  const [initialTitle, setInitialTitle] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiElapsedSeconds, setAiElapsedSeconds] = useState(0);

  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category_id: number | string;
    meta_description?: string;
    keywords?: string;
    is_active?: boolean;
    is_featured?: boolean;
    image?: File;
    attachments?: File[];
  }>({
    title: '',
    content: '',
    category_id: 0,
    meta_description: '',
    keywords: '',
    is_active: true,
    is_featured: false,
    image: undefined,
    attachments: [],
  });

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories]
  );

  useEffect(() => {
    setSelectedCountry(parsedRoute.country);
  }, [parsedRoute.country]);

  useEffect(() => {
    if (!isAuthorized) return;
    const t = setTimeout(async () => {
      const title = formData.title.trim();
      if (!title) {
        setIsTitleDuplicate(false);
        return;
      }
      if (title === initialTitle) {
        setIsTitleDuplicate(false);
        return;
      }
      setIsCheckingTitle(true);
      try {
        const unique = await postsService.isTitleUnique(title, selectedCountry);
        setIsTitleDuplicate(!unique);
      } catch {
        setIsTitleDuplicate(false);
      } finally {
        setIsCheckingTitle(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [formData.title, selectedCountry, initialTitle, isAuthorized]);

  useEffect(() => {
    const fetchData = async () => {
      if (!parsedRoute.isValid || !postId) {
        toast.error('معرف المنشور غير صحيح');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const post = await postsService.getById(postId, selectedCountry);
        const postCountry = normalizeDashboardCountryId((post as any).country, selectedCountry);
        setSelectedCountry(postCountry);
        const res: unknown = await categoriesService.getAll({
          country: postCountry,
          per_page: 100,
        });
        const data = (res as any)?.data?.data ?? (Array.isArray(res) ? res : (res as any)?.data ?? []);
        const list = (Array.isArray(data) ? data : []).map((c: any) => ({ id: Number(c.id), name: String(c.name) }));
        setCategories(list);
        const postFiles = Array.isArray((post as any).attachments)
          ? (post as any).attachments
          : Array.isArray((post as any).files)
            ? (post as any).files
            : [];
        setExistingAttachments(postFiles.filter((file: any) => file?.file_category !== 'post_image'));
        const imageSrc = getStorageUrl((post as any).image_url || (post as any).image);
        setCurrentImageUrl(imageSrc);
        setInitialTitle(post.title || '');
        setFormData({
          title: post.title || '',
          content: post.content || '',
          category_id: post.category_id || list[0]?.id || 0,
          meta_description: post.meta_description || '',
          keywords: Array.isArray(post.keywords) ? post.keywords.join(',') : (post.keywords || ''),
          is_active: !!post.is_active,
          is_featured: !!post.is_featured,
        });
      } catch (e) {
        console.error(e);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [postId, selectedCountry, parsedRoute.isValid]);

  useEffect(() => {
    if (!isGeneratingAi) { setAiElapsedSeconds(0); return; }
    const startedAt = Date.now();
    setAiElapsedSeconds(0);
    const timer = window.setInterval(() => {
      setAiElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isGeneratingAi]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return <AccessDenied />;
  }

  const canSubmit =
    (formData.title || '').trim() !== '' &&
    (formData.title || '').length <= 60 &&
    !!formData.category_id &&
    !isTitleDuplicate;

  const formatAiWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleAiGenerate = async () => {
    const title = formData.title.trim();
    if (!title || title.length < 3) {
      toast.error('يرجى إدخال عنوان المنشور أولاً (3 أحرف على الأقل)');
      return;
    }
    try {
      setIsGeneratingAi(true);
      const article = await articlesService.generateSEOArticle(title, 'post');
      const content = article?.content_html || article?.content || '';
      if (content) {
        contentRef.current = content;
        setFormData((prev) => ({
          ...prev,
          content,
          ...(!prev.meta_description?.trim() && article.meta_description
            ? { meta_description: article.meta_description }
            : {}),
          ...(!prev.keywords?.trim() && article.keywords?.length
            ? { keywords: article.keywords.join('، ') }
            : {}),
        }));
        toast.success('تم توليد المحتوى بنجاح');
      } else {
        toast.error('فشل توليد المحتوى');
      }
    } catch (error) {
      const errorInfo = extractError(error);
      toast.error(errorInfo.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isTitleDuplicate) return;
    // Read latest content from Summernote via ref (not from React state)
    const latestContent = contentRef.current || formData.content;
    if (!latestContent.trim()) {
      toast.error('يرجى إدخال محتوى المنشور');
      return;
    }
    try {
      setIsSubmitting(true);
      await postsService.update(postId, {
        country: selectedCountry,
        title: formData.title,
        content: latestContent,
        category_id: Number(formData.category_id),
        meta_description: formData.meta_description || undefined,
        keywords: formData.keywords || undefined,
        is_active: !!formData.is_active,
        is_featured: !!formData.is_featured,
        image: formData.image,
        attachments: formData.attachments,
      });
      triggerSitemapRegen(countryIdToDatabase(selectedCountry));
      notificationService.send({
        type: 'post_updated',
        title: `تحديث منشور: ${formData.title}`,
        message: `تم تحديث المنشور "${formData.title}"`,
        action_url: `/${countryIdToDatabase(selectedCountry)}/posts/${postId}`,
      });
      toast.success('تم تعديل المنشور بنجاح');
      router.push('/dashboard/posts');
    } catch (e) {
      console.error(e);
      const errorInfo = extractError(e);
      toast.error(errorInfo.message || 'حدث خطأ أثناء تعديل المنشور');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select name="field-app-dashboard-posts-edit-id-page-16127-1"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value as '1' | '2' | '3' | '4')}
            options={COUNTRIES.map((c) => ({ value: c.id, label: c.name }))}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/posts')}>
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting || isLoading}
            disabled={!canSubmit || isSubmitting || isLoading}
            rightIcon={<Save className="w-4 h-4" />}
            className="px-6"
          >
            حفظ التعديلات
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <style>{`
            .note-editor .dropdown-menu,
            .note-editor .note-dropdown-menu {
              z-index: 3000;
            }
            .note-editor .note-editable {
              direction: rtl;
              text-align: right;
              font-family: Cairo, Tajawal, Almarai, sans-serif;
            }
            .note-editor.note-frame {
              border: 1px solid hsl(var(--border));
              border-radius: 0.75rem;
              overflow: hidden;
            }
            .note-toolbar {
              background-color: hsl(var(--secondary) / 0.5) !important;
              border-bottom: 1px solid hsl(var(--border)) !important;
            }
            .note-statusbar {
              background-color: hsl(var(--secondary) / 0.3) !important;
              border-top: 1px solid hsl(var(--border)) !important;
            }
          `}</style>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <CardTitle>تعديل المنشور</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Input name="field-app-dashboard-posts-edit-id-page-18221-2"
                label="عنوان المنشور"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="أدخل عنوان المنشور"
                error={
                  isTitleDuplicate 
                    ? 'هذا العنوان مستخدم مسبقاً' 
                    : isCheckingTitle 
                      ? 'جاري التحقق...' 
                      : (formData.title || '').length > 60 
                        ? `العنوان طويل جداً (${(formData.title || '').length}/60)` 
                        : undefined
                }
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGeneratingAi}
                  className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border-0 shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0] hover:bg-[position:200%_0] transition-[background-position] duration-[1500ms] ease-in-out" />
                  <div className="relative flex items-center gap-2">
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>انتظار {formatAiWaitTime(aiElapsedSeconds)}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>توليد المحتوى بالذكاء الاصطناعي</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium mb-2">المحتوى</span>
                <RichTextEditor
                  id="post-content"
                  name="content"
                  value={formData.content || ''}
                  placeholder="اكتب المحتوى هنا..."
                  minHeight={420}
                  onChange={(html) => {
                    contentRef.current = html;
                    setFormData((prev) => ({ ...prev, content: html }));
                  }}
                  onImageUpload={uploadEditorImage}
                  onFileUpload={uploadEditorFile}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                <CardTitle>تحسين محركات البحث</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select name="field-app-dashboard-posts-edit-id-page-20818-3"
                label="الفئة"
                value={formData.category_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, category_id: Number((e.target as any).value) }))}
                options={categoryOptions}
              />
              <Input name="field-app-dashboard-posts-edit-id-page-21091-4"
                label="الوصف التعريفي"
                value={formData.meta_description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                placeholder="وصف قصير يظهر لمحركات البحث (اختياري)"
              />
              <Input name="field-app-dashboard-posts-edit-id-page-21397-5"
                label="الكلمات المفتاحية"
                value={formData.keywords || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="اكتب كلمات مفصولة بفاصلة ، مثل: تعليم، دراسة"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <input name="field-app-dashboard-posts-edit-id-page-561-1"
                    type="checkbox"
                    checked={!!formData.is_active}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only peer"
                    id="post-active"
                  />
                  <label htmlFor="post-active" className="relative inline-flex items-center cursor-pointer">
                    <div className="w-11 h-6 bg-muted rounded-full transition-colors peer-checked:bg-primary relative">
                      <span className="absolute top-[2px] right-[2px] h-5 w-5 rounded-full bg-white border border-border transition-all peer-checked:right-[22px]"></span>
                    </div>
                  </label>
                  <span className={`text-sm ${formData.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                    {formData.is_active ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input name="field-app-dashboard-posts-edit-id-page-578-2"
                    type="checkbox"
                    checked={!!formData.is_featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    className="sr-only peer"
                    id="post-featured"
                  />
                  <label htmlFor="post-featured" className="relative inline-flex items-center cursor-pointer">
                    <div className="w-11 h-6 bg-muted rounded-full transition-colors peer-checked:bg-primary relative">
                      <span className="absolute top-[2px] right-[2px] h-5 w-5 rounded-full bg-white border border-border transition-all peer-checked:right-[22px]"></span>
                    </div>
                  </label>
                  <span className={`text-sm ${formData.is_featured ? 'text-info' : 'text-muted-foreground'}`}>
                    {formData.is_featured ? 'مميز' : 'غير مميز'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <CardTitle>الصورة الرئيسية</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentImageUrl ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <Image 
                    src={currentImageUrl} 
                    alt="الصورة الحالية" 
                    width={800}
                    height={400}
                    className="w-full h-auto"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              ) : null}
              <input name="field-app-dashboard-posts-edit-id-page-620-3"
                type="file"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.files?.[0] }))}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <CardTitle>مرفقات</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <input name="field-app-dashboard-posts-edit-id-page-637-4"
                type="file"
                multiple
                onChange={(e) => setFormData((prev) => ({ ...prev, attachments: Array.from(e.target.files || []) }))}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
              />
              {existingAttachments && existingAttachments.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-sm font-medium">المرفقات الحالية</span>
                  <ul className="space-y-1">
                    {existingAttachments.map((att) => (
                      <li key={att.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                        <span className="truncate">{att.file_name}</span>
                        {att.file_url || att.file_path ? (
                          <a
                            href={att.file_url || att.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            عرض
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
