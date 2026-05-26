'use client';

import ContentQualityBatchPanel from '@/components/dashboard/content-audit/ContentQualityBatchPanel';
import AccessDenied from '@/components/common/AccessDenied';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function ContentQualityPage() {
  const { isAuthorized } = usePermissionGuard('manage content audit');

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">مركز تحسين جودة المحتوى بالذكاء الاصطناعي</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          شغّل دفعات التحليل والتحسين وفق قاعدة تعليمية واضحة: لا يعتمد النظام أي تحسين يقل عن 300 كلمة، ويستهدف 450 كلمة مبنية على المنهاج والصف والمادة أو التصنيف المحدد.
        </p>
      </div>

      <ContentQualityBatchPanel />
    </div>
  );
}
