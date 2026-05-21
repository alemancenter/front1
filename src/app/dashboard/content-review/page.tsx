'use client';

import ContentAIReviewQueuePanel from '@/components/dashboard/content-audit/ContentAIReviewQueuePanel';
import AccessDenied from '@/components/common/AccessDenied';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';

export default function ContentReviewPage() {
  const { isAuthorized } = usePermissionGuard('manage content audit');

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">قائمة المراجعة البشرية</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          راجع معاينات التحسين قبل وبعد، ثم اعتمد أو ارفض التعديلات مع إمكانية فتح صفحة التحرير اليدوي لكل محتوى.
        </p>
      </div>

      <ContentAIReviewQueuePanel />
    </div>
  );
}
