'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bot, Check, CheckCircle2, Eye, FileText, Gauge, Layers3, RefreshCw, ShieldCheck, Sparkles, Square, XCircle } from 'lucide-react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { contentAuditService, type ContentAIFixPreview, type ContentQualityBatchItem, type ContentQualityBatchJob } from '@/lib/api/services/content-audit';
import { cn } from '@/lib/utils';
import {
  contentQualityContentTypeOptions,
  contentQualityLevelOptions,
  contentQualityModeOptions,
  contentQualityStrategyOptions,
  contentQualitySmartPresetOptions,
} from '@/features/content-audit/batch-options';
import {
  contentQualityStatusMeta,
  editPathForContentQualityItem,
  formatContentQualityDate,
  htmlToPlainText,
} from '@/features/content-audit/batch-utils';
import type { ContentQualityBatchFormState, ContentQualitySmartPreset } from '@/features/content-audit/batch-types';

export default function ContentQualityBatchPanel() {
  const [payload, setPayload] = useState<ContentQualityBatchFormState>({
    country_code: 'jo',
    content_type: 'all',
    level: 'weak',
    mode: 'fix_preview',
    model_strategy: 'balanced',
    q: '',
    source: 'adsense_readiness',
    preset: 'weak_first',
    limit: 20,
    concurrency: 2,
  });
  const [jobs, setJobs] = useState<ContentQualityBatchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ContentQualityBatchJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activePreview, setActivePreview] = useState<ContentAIFixPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [itemActionKey, setItemActionKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [readinessSummary, setReadinessSummary] = useState({ total: 0, weak: 0, review: 0, ready: 0, no_index: 0, ads_eligible: 0 });
  const [isLoadingReadiness, setIsLoadingReadiness] = useState(false);
  const isLoadingJobsRef = useRef(false);

  const activeJob = useMemo(
    () => selectedJob || jobs.find((job) => ['queued', 'running', 'cancelling'].includes(job.status)) || jobs[0] || null,
    [jobs, selectedJob]
  );

  const selectedPreset = useMemo(
    () => contentQualitySmartPresetOptions.find((option) => option.value === payload.preset) || contentQualitySmartPresetOptions[0],
    [payload.preset]
  );

  const loadReadinessSummary = useCallback(async () => {
    try {
      setIsLoadingReadiness(true);
      const report = await contentAuditService.getAdsenseReadinessQuickReport({
        country: payload.country_code,
        type: payload.content_type,
        level: 'all',
      });
      setReadinessSummary(report.summary);
    } catch {
      // This overview is informational only. Batch creation still validates on the server.
      setReadinessSummary({ total: 0, weak: 0, review: 0, ready: 0, no_index: 0, ads_eligible: 0 });
    } finally {
      setIsLoadingReadiness(false);
    }
  }, [payload.country_code, payload.content_type]);


  const loadJobs = useCallback(async () => {
    if (isLoadingJobsRef.current) return;
    isLoadingJobsRef.current = true;
    try {
      setIsLoading(true);
      const data = await contentAuditService.listQualityBatches();
      setJobs(data);
      if (activeJob?.id) {
        const fresh = data.find((job) => job.id === activeJob.id);
        if (fresh) {
          const detailed = await contentAuditService.getQualityBatch(fresh.id).catch(() => fresh);
          setSelectedJob(detailed);
        }
      }
    } catch (error: any) {
      const messageText = String(error?.message || 'فشل تحميل مهام تحسين المحتوى');
      if (messageText.includes('429') || messageText.includes('Too Many Requests')) {
        setMessage({ type: 'error', text: 'تم إبطاء تحديث حالة المهام مؤقتًا بسبب حد الطلبات. سيستمر التحديث تلقائيًا بعد لحظات.' });
      } else {
        setMessage({ type: 'error', text: messageText });
      }
    } finally {
      setIsLoading(false);
      isLoadingJobsRef.current = false;
    }
  }, [activeJob?.id]);

  useEffect(() => {
    void loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadReadinessSummary();
  }, [loadReadinessSummary]);

  useEffect(() => {
    const hasActive = jobs.some((job) => ['queued', 'running', 'cancelling'].includes(job.status)) || ['queued', 'running', 'cancelling'].includes(activeJob?.status || '');
    if (!hasActive) return;

    let isCancelled = false;
    let timer: number | undefined;

    const schedule = () => {
      if (isCancelled) return;
      const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';
      const delay = isVisible ? 15000 : 45000;
      timer = window.setTimeout(async () => {
        if (!isCancelled && isVisible) {
          await loadJobs();
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      isCancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [activeJob?.status, jobs, loadJobs]);

  const startBatch = async () => {
    try {
      setIsStarting(true);
      setMessage(null);
      const job = await contentAuditService.startQualityBatch({
        ...payload,
        limit: Number(payload.limit),
        concurrency: Number(payload.concurrency),
      });
      setSelectedJob(job);
      setMessage({ type: 'success', text: 'بدأت مهمة تحسين المحتوى. سيتم إنشاء مقترحات بانتظار المراجعة البشرية فقط.' });
      await loadJobs();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل بدء مهمة تحسين المحتوى' });
    } finally {
      setIsStarting(false);
    }
  };

  const cancelBatch = async () => {
    if (!activeJob?.id) return;
    try {
      setIsCancelling(true);
      const job = await contentAuditService.cancelQualityBatch(activeJob.id);
      setSelectedJob(job);
      setMessage({ type: 'success', text: 'تم إرسال طلب إلغاء المهمة. العناصر الجارية ستنتهي بأمان.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل إلغاء المهمة' });
    } finally {
      setIsCancelling(false);
    }
  };

  const openFixPreview = async (item: ContentQualityBatchItem) => {
    if (!item.fix_preview_id && !item.decision_id) {
      setMessage({ type: 'error', text: 'هذا العنصر لا يحتوي على قرار أو معاينة تحسين بعد.' });
      return;
    }
    const key = `${item.content_type}-${item.content_id}-preview`;
    try {
      setItemActionKey(key);
      setIsPreviewLoading(true);
      setMessage(null);
      let preview: ContentAIFixPreview;
      if (item.fix_preview_id) {
        preview = await contentAuditService.getFixPreview(item.fix_preview_id);
      } else {
        preview = await contentAuditService.createAndWaitForFixPreview(item.decision_id!);
      }
      setActivePreview(preview);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل تحميل معاينة التحسين' });
    } finally {
      setIsPreviewLoading(false);
      setItemActionKey(null);
    }
  };

  const applyPreview = async (previewId?: number) => {
    const id = previewId || activePreview?.id;
    if (!id) return;
    try {
      setItemActionKey(`apply-${id}`);

      // Always refresh the preview before applying it. Batch rows can be stale
      // after polling, and applying a preview that is already applied/rejected
      // returns 400 from the API. This keeps the UX clear and prevents noisy
      // Bad Request calls.
      const latestPreview = activePreview?.id === id ? activePreview : await contentAuditService.getFixPreview(id);
      if (latestPreview.status !== 'previewed') {
        setActivePreview(latestPreview);
        setMessage({
          type: 'error',
          text:
            latestPreview.status === 'applied'
              ? 'تم اعتماد هذه المعاينة مسبقًا ولا يمكن اعتمادها مرة أخرى.'
              : latestPreview.status === 'rejected'
                ? 'تم رفض هذه المعاينة مسبقًا. أنشئ معاينة جديدة إذا أردت متابعة التعديل.'
                : latestPreview.status === 'failed'
                  ? 'فشلت هذه المعاينة ولا يمكن اعتمادها. أعد إنشاء المعاينة أولًا.'
                  : 'المعاينة لم تجهز بعد. افتح المعاينة وانتظر اكتمالها قبل الاعتماد.',
        });
        return;
      }

      const updated = await contentAuditService.applyFix(id, 'تم اعتماد التصحيح من مركز تحسين جودة المحتوى الجماعي');
      setActivePreview(updated);
      setMessage({ type: 'success', text: 'تم اعتماد التعديل وتحديث المحتوى بنجاح. يمكنك فتح صفحة التحرير للمراجعة النهائية.' });
      await loadJobs();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل اعتماد التعديل' });
    } finally {
      setItemActionKey(null);
    }
  };

  const rejectPreview = async (previewId?: number) => {
    const id = previewId || activePreview?.id;
    if (!id) return;
    try {
      setItemActionKey(`reject-${id}`);
      const updated = await contentAuditService.rejectFix(id, 'تم رفض التصحيح من مركز تحسين جودة المحتوى الجماعي');
      setActivePreview(updated);
      setMessage({ type: 'success', text: 'تم رفض المعاينة وحفظ القرار في سجل المراجعة.' });
      await loadJobs();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'فشل رفض المعاينة' });
    } finally {
      setItemActionKey(null);
    }
  };

  const currentStatus = activeJob ? contentQualityStatusMeta(activeJob.status) : null;
  const CurrentStatusIcon = currentStatus?.icon;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-6 w-6 text-primary" />
              مركز تحسين جودة المحتوى بالذكاء الاصطناعي
            </CardTitle>
            <CardDescription>
              ابدأ معالجة ذكية من تقرير جاهزية AdSense: اختر عدد العناصر والتوازي، وسيجلب النظام الصفحات الأكثر تأثيرًا على القبول بدل الاختيار العشوائي.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">
              <ShieldCheck className="ml-1 h-3.5 w-3.5" />
              لا نشر تلقائي
            </Badge>
            <Badge variant="success">
              <Layers3 className="ml-1 h-3.5 w-3.5" />
              Pipeline متعدد المراحل
            </Badge>
          </div>
        </div>
        {message && (
          <div className={cn('flex items-center gap-2 rounded-xl p-3 text-sm', message.type === 'success' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700')}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <span>{message.text}</span>
            <button type="button" className="mr-auto" onClick={() => setMessage(null)}>
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="h-5 w-5 text-primary" />
                المعالجة الذكية حسب تقرير جاهزية AdSense
              </h3>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                لا تحتاج معرفة عدد المقالات أو المنشورات الضعيفة. اختر الوضع المناسب، وسيتم جلب العناصر الأعلى أولوية تلقائيًا من تقرير الجاهزية.
              </p>
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
                قاعدة المعالجة المعتمدة: الحد الأدنى 300 كلمة تعليمية، والهدف الأفضل 450 كلمة، مع الالتزام بالمنهاج والصف والمادة أو التصنيف المرتبط بالمحتوى.
              </p>
            </div>
            <Button variant="outline" onClick={loadReadinessSummary} isLoading={isLoadingReadiness} leftIcon={<RefreshCw className="h-4 w-4" />}>
              تحديث ملخص الجاهزية
            </Button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-3">
              <Gauge className="mb-2 h-5 w-5 text-primary" />
              <div className="text-xl font-black">{readinessSummary.total.toLocaleString('ar')}</div>
              <div className="text-xs font-medium text-muted-foreground">إجمالي مفحوص</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <AlertTriangle className="mb-2 h-5 w-5 text-amber-600" />
              <div className="text-xl font-black">{readinessSummary.weak.toLocaleString('ar')}</div>
              <div className="text-xs font-medium text-muted-foreground">ضعيف ويحتاج أولوية</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <FileText className="mb-2 h-5 w-5 text-sky-600" />
              <div className="text-xl font-black">{readinessSummary.review.toLocaleString('ar')}</div>
              <div className="text-xs font-medium text-muted-foreground">يحتاج مراجعة</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />
              <div className="text-xl font-black">{readinessSummary.ads_eligible.toLocaleString('ar')}</div>
              <div className="text-xs font-medium text-muted-foreground">جاهز للإعلانات</div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-4">
            {contentQualitySmartPresetOptions.map((option) => {
              const isActive = payload.preset === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPayload((current) => ({
                    ...current,
                    source: option.value === 'custom_filter' ? 'manual_filter' : 'adsense_readiness',
                    preset: option.value as ContentQualitySmartPreset,
                    level: option.value === 'custom_filter' ? current.level : 'weak',
                  }))}
                  className={cn(
                    'rounded-2xl border p-4 text-right transition hover:border-primary/50 hover:bg-primary/5',
                    isActive ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-bold">{option.label}</span>
                    {isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                  </div>
                  <p className="text-xs leading-6 text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-card/70 p-3 text-sm leading-7 text-muted-foreground">
            الوضع الحالي: <strong className="text-foreground">{selectedPreset.label}</strong> — {selectedPreset.description}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-9">
          <div className="space-y-1 xl:col-span-1">
            <label htmlFor="quality-country" className="text-xs font-medium text-muted-foreground">الدولة</label>
            <select
              id="quality-country"
              name="quality_country"
              value={payload.country_code}
              onChange={(e) => setPayload((current) => ({ ...current, country_code: e.target.value }))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="jo">الأردن</option>
              <option value="sa">السعودية</option>
              <option value="eg">مصر</option>
              <option value="ps">فلسطين</option>
            </select>
          </div>
          <div className="space-y-1 xl:col-span-1">
            <label htmlFor="quality-content-type" className="text-xs font-medium text-muted-foreground">النطاق</label>
            <select
              id="quality-content-type"
              name="quality_content_type"
              value={payload.content_type}
              onChange={(e) => setPayload((current) => ({ ...current, content_type: e.target.value as ContentQualityBatchFormState['content_type'] }))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {contentQualityContentTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 xl:col-span-1">
            <label htmlFor="quality-level" className="text-xs font-medium text-muted-foreground">الأولوية</label>
            <select
              id="quality-level"
              name="quality_level"
              value={payload.level}
              onChange={(e) => setPayload((current) => ({ ...current, level: e.target.value as ContentQualityBatchFormState['level'] }))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {contentQualityLevelOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 xl:col-span-2">
            <label htmlFor="quality-mode" className="text-xs font-medium text-muted-foreground">طريقة المعالجة</label>
            <select
              id="quality-mode"
              name="quality_mode"
              value={payload.mode}
              onChange={(e) => setPayload((current) => ({ ...current, mode: e.target.value as ContentQualityBatchFormState['mode'] }))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {contentQualityModeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div className="space-y-1 xl:col-span-2">
            <label htmlFor="quality-model-strategy" className="text-xs font-medium text-muted-foreground">استراتيجية الموديلات</label>
            <select
              id="quality-model-strategy"
              name="quality_model_strategy"
              value={payload.model_strategy}
              onChange={(e) => setPayload((current) => ({ ...current, model_strategy: e.target.value as ContentQualityBatchFormState['model_strategy'] }))}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              {contentQualityStrategyOptions.map((option) => <option key={option.value} value={option.value}>{option.label} — {option.description}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="quality-limit" className="text-xs font-medium text-muted-foreground">العدد</label>
            <Input
              id="quality-limit"
              name="quality_limit"
              type="number"
              min={1}
              max={500}
              value={payload.limit}
              onChange={(e) => setPayload((current) => ({ ...current, limit: Number(e.target.value) || 50 }))}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="quality-concurrency" className="text-xs font-medium text-muted-foreground">التوازي</label>
            <Input
              id="quality-concurrency"
              name="quality_concurrency"
              type="number"
              min={1}
              max={6}
              value={payload.concurrency}
              onChange={(e) => setPayload((current) => ({ ...current, concurrency: Number(e.target.value) || 2 }))}
            />
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <Input
            id="quality-query"
            name="quality_query"
            placeholder="بحث اختياري داخل العنوان..."
            value={payload.q}
            onChange={(e) => setPayload((current) => ({ ...current, q: e.target.value }))}
          />
          <Button onClick={startBatch} isLoading={isStarting} leftIcon={<Bot className="h-4 w-4" />}>
            بدء المعالجة الذكية
          </Button>
          <Button variant="outline" onClick={loadJobs} isLoading={isLoading} leftIcon={<RefreshCw className="h-4 w-4" />}>
            تحديث المهام
          </Button>
        </div>

        {activeJob ? (
          <div className="rounded-2xl border border-border bg-card/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {currentStatus && CurrentStatusIcon ? (
                    <Badge variant={currentStatus.variant} animated={activeJob.status === 'running'}>
                      <CurrentStatusIcon className="ml-1 h-3.5 w-3.5" />
                      {currentStatus.label}
                    </Badge>
                  ) : null}
                  <span className="text-sm font-semibold">{activeJob.id}</span>
                  <Badge variant="secondary">استراتيجية: {contentQualityStrategyOptions.find((option) => option.value === activeJob.model_strategy)?.label || activeJob.model_strategy}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeJob.successful_items} ناجحة · {activeJob.failed_items} فاشلة · {activeJob.pending_items} بانتظار · بدأ: {formatContentQualityDate(activeJob.started_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {['queued', 'running', 'cancelling'].includes(activeJob.status) ? (
                  <Button variant="outline" onClick={cancelBatch} isLoading={isCancelling} leftIcon={<Square className="h-4 w-4" />}>
                    إلغاء آمن
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="border-sky-500 text-sky-700 hover:bg-sky-600 hover:text-white"
                  onClick={() => void contentAuditService.getQualityBatch(activeJob.id).then(setSelectedJob)}
                >
                  عرض التفاصيل
                </Button>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, activeJob.progress || 0))}%` }} />
            </div>
            <div className="mt-2 text-left text-xs font-semibold text-muted-foreground">{activeJob.progress || 0}%</div>

            {selectedJob?.items?.length ? (
              <div className="mt-4 max-h-80 overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/70 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3 text-right">العنوان</th>
                      <th className="p-3 text-right">النوع</th>
                      <th className="p-3 text-right">قبل/بعد</th>
                      <th className="p-3 text-right">الحالة</th>
                      <th className="p-3 text-right">المراجعة والاعتماد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedJob.items.slice(0, 80).map((item) => {
                      const itemStatus = contentQualityStatusMeta(item.status);
                      const ItemStatusIcon = itemStatus.icon;
                      return (
                        <tr key={`${item.content_type}-${item.content_id}`} className="border-t border-border">
                          <td className="max-w-md p-3 font-medium">{item.title}</td>
                          <td className="p-3">{item.content_type === 'article' ? 'مقال' : 'منشور'}</td>
                          <td className="p-3 font-semibold">{item.score_before}{item.score_after ? ` → ${item.score_after}` : ''}</td>
                          <td className="p-3">
                            <Badge variant={itemStatus.variant}>
                              <ItemStatusIcon className="ml-1 h-3.5 w-3.5" />
                              {itemStatus.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {item.fix_preview_id ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-violet-500 text-violet-700 hover:bg-violet-600 hover:text-white"
                                    onClick={() => void openFixPreview(item)}
                                    isLoading={itemActionKey === `${item.content_type}-${item.content_id}-preview` && isPreviewLoading}
                                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                                  >
                                    عرض المعاينة #{item.fix_preview_id}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="success"
                                    onClick={() => void applyPreview(item.fix_preview_id!)}
                                    isLoading={itemActionKey === `apply-${item.fix_preview_id}`}
                                    leftIcon={<Check className="h-3.5 w-3.5" />}
                                  >
                                    اعتماد
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="border-rose-500 text-rose-700 hover:bg-rose-600 hover:text-white"
                                    onClick={() => void rejectPreview(item.fix_preview_id!)}
                                    isLoading={itemActionKey === `reject-${item.fix_preview_id}`}
                                  >
                                    رفض
                                  </Button>
                                </>
                              ) : item.decision_id ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-violet-500 text-violet-700 hover:bg-violet-600 hover:text-white"
                                  onClick={() => void openFixPreview(item)}
                                  isLoading={itemActionKey === `${item.content_type}-${item.content_id}-preview` && isPreviewLoading}
                                >
                                  إنشاء معاينة من القرار #{item.decision_id}
                                </Button>
                              ) : (
                                <span className="text-muted-foreground">{item.error || item.message || '-'}</span>
                              )}
                              <a className="text-primary underline-offset-4 hover:underline" href={editPathForContentQualityItem(item)} target="_blank" rel="noreferrer">
                                فتح التحرير
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            لا توجد مهام جماعية بعد. ابدأ بدفعة صغيرة 20-50 عنصرًا لاختبار الجودة والتكلفة.
          </div>
        )}


        {activePreview ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-border p-4">
                <div>
                  <h3 className="text-lg font-bold">معاينة التحسين #{activePreview.id}</h3>
                  <p className="text-xs text-muted-foreground">
                    الحالة: {activePreview.status} · النوع: {activePreview.content_type} · المحتوى: {activePreview.content_id}
                  </p>
                </div>
                <button type="button" onClick={() => setActivePreview(null)} className="rounded-lg p-2 hover:bg-muted">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[65vh] overflow-auto p-4">
                {activePreview.fix_summary ? (
                  <div className="mb-4 rounded-xl bg-primary/10 p-3 text-sm text-primary">
                    {activePreview.fix_summary}
                  </div>
                ) : null}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-border p-4">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">قبل التعديل</p>
                    <h4 className="mb-3 font-bold">{activePreview.original_title}</h4>
                    <p className="whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
                      {htmlToPlainText(activePreview.original_content).slice(0, 2500) || 'لا يوجد نص قابل للعرض'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <p className="mb-2 text-xs font-semibold text-emerald-700">بعد التعديل المقترح</p>
                    <h4 className="mb-3 font-bold">{activePreview.fixed_title}</h4>
                    <p className="whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
                      {htmlToPlainText(activePreview.fixed_content).slice(0, 2500) || 'لا يوجد نص قابل للعرض'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
                <p className="text-xs text-muted-foreground">
                  الاعتماد سيستبدل عنوان ومحتوى المقال/المنشور بالنسخة المقترحة. لا يتم ذلك تلقائيًا بدون ضغطك على اعتماد.
                </p>
                <div className="flex items-center gap-2">
                  {activePreview.status === 'previewed' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void rejectPreview()}
                        isLoading={itemActionKey === `reject-${activePreview.id}`}
                      >
                        رفض المعاينة
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void applyPreview()}
                        isLoading={itemActionKey === `apply-${activePreview.id}`}
                        leftIcon={<Check className="h-4 w-4" />}
                      >
                        اعتماد وتحديث المحتوى
                      </Button>
                    </>
                  ) : (
                    <Badge variant={activePreview.status === 'applied' ? 'success' : 'warning'}>
                      {activePreview.status === 'applied' ? 'تم الاعتماد سابقًا' : 'تم إغلاق هذه المعاينة'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
