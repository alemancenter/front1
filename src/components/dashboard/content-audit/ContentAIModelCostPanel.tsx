'use client';

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { contentAuditService, type ContentAIModelCostResponse } from '@/lib/api/services/content-audit';

function money(value?: number) {
  return `$${Number(value || 0).toFixed(4)}`;
}

function numberFormat(value?: number) {
  return new Intl.NumberFormat('ar').format(Number(value || 0));
}

export default function ContentAIModelCostPanel() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<ContentAIModelCostResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await contentAuditService.getModelCosts({ days });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل تكلفة الموديلات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            تكلفة الموديلات
          </CardTitle>
          <CardDescription>متابعة الضغط والتكلفة التقديرية للذكاء الاصطناعي.</CardDescription>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={load} isLoading={loading} leftIcon={<RefreshCw className="h-4 w-4" />}>
          تحديث
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="block text-sm font-medium text-muted-foreground" htmlFor="model-cost-days">
          الفترة
        </label>
        <select
          id="model-cost-days"
          name="model_cost_days"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        >
          <option value={1}>آخر 24 ساعة</option>
          <option value={7}>آخر 7 أيام</option>
          <option value={30}>آخر 30 يومًا</option>
          <option value={90}>آخر 90 يومًا</option>
        </select>

        {error && <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">التكلفة</p>
            <p className="text-xl font-bold">{money(data?.summary.estimated_cost_usd)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">الطلبات</p>
            <p className="text-xl font-bold">{numberFormat(data?.summary.total_runs)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Input Tokens</p>
            <p className="text-lg font-bold">{numberFormat(data?.summary.input_tokens)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Output Tokens</p>
            <p className="text-lg font-bold">{numberFormat(data?.summary.output_tokens)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {(data?.models || []).slice(0, 6).map((item) => (
            <div key={`${item.model}-${item.model_strategy}-${item.task_type}`} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold break-all">{item.model}</p>
                <Badge variant={item.failed_runs > 0 ? 'warning' : 'success'}>{numberFormat(item.runs)}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{item.task_type} · {item.model_strategy}</p>
              <p className="mt-2 font-semibold">{money(item.estimated_cost_usd)}</p>
            </div>
          ))}
          {!loading && (!data?.models || data.models.length === 0) && (
            <p className="rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">لا توجد سجلات تكلفة بعد.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
