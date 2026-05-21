'use client';

import ContentAIModelCostPanel from '@/components/dashboard/content-audit/ContentAIModelCostPanel';
import AccessDenied from '@/components/common/AccessDenied';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function AICostsPage() {
  const { isAuthorized } = usePermissionGuard('manage content audit');

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">تكلفة الموديلات واستهلاك الذكاء الاصطناعي</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          راقب عدد الطلبات، التوكنات، التكلفة التقديرية، أكثر الموديلات استخدامًا، ونسبة نجاح أو فشل عمليات المعالجة.
        </p>
      </div>

      <ContentAIModelCostPanel />
    </div>
  );
}
