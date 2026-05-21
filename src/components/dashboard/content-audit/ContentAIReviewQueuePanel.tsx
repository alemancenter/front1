'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, RefreshCw, XCircle } from 'lucide-react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { contentAuditService, type ContentAIFixPreview, type ContentAIReviewQueueItem, type PaginationMeta } from '@/lib/api/services/content-audit';
import { htmlToPlainText, getEditPathForContent } from '@/features/content-audit/batch-utils';

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'previewed': return 'warning';
    case 'applied': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'previewed': return 'بانتظار المراجعة';
    case 'applied': return 'معتمد';
    case 'rejected': return 'مرفوض';
    case 'pending': return 'قيد التجهيز';
    case 'failed': return 'فشل';
    default: return status;
  }
}

export default function ContentAIReviewQueuePanel() {
  const [items, setItems] = useState<ContentAIReviewQueueItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('previewed');
  const [loading, setLoading] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<ContentAIFixPreview | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canPrev = page > 1;
  const canNext = useMemo(() => meta ? page < meta.last_page : false, [meta, page]);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await contentAuditService.listReviewQueue({ page, per_page: 10, status });
      setItems(result.data || []);
      setMeta(result.meta);
    } catch (err) {
      const fallbackMessage = 'تعذر تحميل قائمة المراجعة البشرية. تأكد من رفع آخر نسخة للباك اند وتشغيل endpoint review-queue.';
      setItems([]);
      setMeta(undefined);
      setLoadError(err instanceof Error && err.message ? err.message : fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const openPreview = async (id: number) => {
    setActionId(id);
    try {
      setSelectedPreview(await contentAuditService.getFixPreview(id));
    } finally {
      setActionId(null);
    }
  };

  const apply = async (id: number) => {
    setActionId(id);
    setMessage(null);
    try {
      await contentAuditService.applyFix(id, 'اعتماد من قائمة مراجعة المحتوى');
      setMessage('تم اعتماد المعاينة وتحديث المحتوى.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذر اعتماد المعاينة');
    } finally {
      setActionId(null);
    }
  };

  const reject = async (id: number) => {
    setActionId(id);
    setMessage(null);
    try {
      await contentAuditService.rejectFix(id, 'رفض من قائمة مراجعة المحتوى');
      setMessage('تم رفض المعاينة.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذر رفض المعاينة');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-lg">قائمة المراجعة البشرية</CardTitle>
          <CardDescription>اعتماد أو رفض المعاينات قبل نشر أي تعديل على المحتوى.</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={load} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <select
            id="review-queue-status"
            name="review_queue_status"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          >
            <option value="previewed">بانتظار المراجعة</option>
            <option value="applied">المعتمدة</option>
            <option value="rejected">المرفوضة</option>
            <option value="all">الكل</option>
          </select>
          {(message || loadError) && (
            <div className={loadError ? 'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive' : 'rounded-lg bg-muted px-3 py-2 text-sm'}>
              {loadError || message}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    <Badge variant="info">{item.content_type} #{item.content_id}</Badge>
                    {typeof item.score === 'number' && <Badge variant="primary">Score {item.score}</Badge>}
                  </div>
                  <h4 className="font-semibold leading-relaxed">{item.fixed_title || item.original_title}</h4>
                  {item.fix_summary && <p className="text-sm text-muted-foreground">{item.fix_summary}</p>}
                  <p className="text-xs text-muted-foreground">Model: {item.model || '-'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => openPreview(item.id)} isLoading={actionId === item.id} leftIcon={<Eye className="h-4 w-4" />}>
                    عرض المعاينة
                  </Button>
                  {item.status === 'previewed' && (
                    <>
                      <Button type="button" size="sm" variant="success" onClick={() => apply(item.id)} isLoading={actionId === item.id} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                        اعتماد
                      </Button>
                      <Button type="button" size="sm" variant="danger" onClick={() => reject(item.id)} isLoading={actionId === item.id} leftIcon={<XCircle className="h-4 w-4" />}>
                        رفض
                      </Button>
                    </>
                  )}
                  <a className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted" href={getEditPathForContent(item.content_type, item.content_id, item.country_code)}>
                    فتح التحرير
                  </a>
                </div>
              </div>
            </div>
          ))}
          {!loading && items.length === 0 && (
            <p className="rounded-xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">لا توجد معاينات ضمن هذا الفلتر.</p>
          )}
        </div>

        {selectedPreview && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-semibold">معاينة #{selectedPreview.id}</h4>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPreview(null)}>إغلاق</Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold">قبل</p>
                <div className="max-h-64 overflow-auto rounded-xl bg-background p-3 text-sm leading-7">
                  {htmlToPlainText(selectedPreview.original_content).slice(0, 2000)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">بعد</p>
                <div className="max-h-64 overflow-auto rounded-xl bg-background p-3 text-sm leading-7">
                  {htmlToPlainText(selectedPreview.fixed_content).slice(0, 2000)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
          <span>الإجمالي: {meta?.total ?? items.length}</span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" disabled={!canPrev} onClick={() => setPage((value) => Math.max(1, value - 1))}>السابق</Button>
            <Button type="button" variant="ghost" size="sm" disabled={!canNext} onClick={() => setPage((value) => value + 1)}>التالي</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
