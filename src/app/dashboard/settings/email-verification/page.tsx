'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle2,
  MailWarning,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react';
import AccessDenied from '@/components/common/AccessDenied';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { cn } from '@/lib/utils';
import {
  emailVerificationService,
  EmailVerificationStats,
  EmailVerificationUser,
} from '@/lib/api/services/email-verification';

const statusLabels: Record<string, string> = {
  pending: 'بانتظار الفحص',
  deliverable: 'قابل للإرسال',
  invalid_format: 'صيغة خاطئة',
  no_mx: 'دومين لا يستقبل',
  send_failed: 'فشل الإرسال',
  bounced: 'مرتد',
  manual_invalid: 'غير صالح يدويًا',
};

const statusClasses: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  deliverable: 'bg-emerald-100 text-emerald-700',
  invalid_format: 'bg-red-100 text-red-700',
  no_mx: 'bg-red-100 text-red-700',
  send_failed: 'bg-amber-100 text-amber-700',
  bounced: 'bg-red-100 text-red-700',
  manual_invalid: 'bg-red-100 text-red-700',
};

const emptyStats: EmailVerificationStats = {
  unverified: 0,
  pending: 0,
  reminder_1: 0,
  reminder_2: 0,
  reminder_3: 0,
  exhausted: 0,
  invalid: 0,
  bounced: 0,
  send_failed: 0,
  ready_for_reminder: 0,
};

export default function EmailVerificationDashboardPage() {
  const { isAuthorized } = usePermissionGuard('manage settings');
  const [users, setUsers] = useState<EmailVerificationUser[]>([]);
  const [stats, setStats] = useState<EmailVerificationStats>(emptyStats);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  const [only, setOnly] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const selectedCount = selectedIds.length;
  const allVisibleSelected = users.length > 0 && users.every((user) => selectedIds.includes(user.id));

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [list, nextStats] = await Promise.all([
        emailVerificationService.list({
          search,
          email_status: emailStatus,
          only,
          page,
          per_page: 25,
        }),
        emailVerificationService.stats(),
      ]);
      setUsers(list.data || []);
      setStats(nextStats || emptyStats);
      setLastPage(list.pagination?.last_page || 1);
      setTotal(list.pagination?.total || 0);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحميل بيانات التحقق من البريد');
    } finally {
      setLoading(false);
    }
  }, [emailStatus, isAuthorized, only, page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [emailStatus, only, search]);

  const runAction = async (fn: () => Promise<any>, successMessage: string) => {
    try {
      setActionLoading(true);
      await fn();
      toast.success(successMessage);
      setSelectedIds([]);
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تنفيذ العملية');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !users.some((user) => user.id === id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...users.map((user) => user.id)])));
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteFiltered = () => {
    if (total <= 0) return;
    const typed = window.prompt(`سيتم حذف ${total} حساب غير مؤكد مطابق للفلاتر الحالية. اكتب DELETE للتأكيد.`);
    if (typed !== 'DELETE') return;

    runAction(
      async () => {
        const result = await emailVerificationService.deleteFiltered({
          search,
          email_status: emailStatus,
          only,
        });
        toast.success(`تم حذف ${result.deleted} حساب غير مؤكد`);
      },
      'تم تنفيذ الحذف الجماعي'
    );
  };

  const statCards = useMemo(
    () => [
      { label: 'غير مؤكدين', value: stats.unverified, icon: MailWarning },
      { label: 'جاهزون للتذكير', value: stats.ready_for_reminder, icon: Send },
      { label: 'بعد 3 رسائل', value: stats.exhausted, icon: AlertTriangle },
      { label: 'إيميلات غير صالحة', value: stats.invalid + stats.bounced, icon: ShieldAlert },
    ],
    [stats]
  );

  if (isAuthorized === null) {
    return <div className="p-8 text-center text-muted-foreground">جاري التحقق من الصلاحيات...</div>;
  }

  if (!isAuthorized) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تذكيرات تحقق البريد</h1>
          <p className="text-sm text-muted-foreground">
            فرز المستخدمين غير المؤكدين، إرسال 3 تذكيرات كحد أقصى، وتعليم الإيميلات غير الصالحة للمراجعة أو الحذف.
          </p>
        </div>
        <Button
          onClick={() => runAction(() => emailVerificationService.sendReminders({ limit: 100 }), 'تمت معالجة التذكيرات الجاهزة')}
          disabled={actionLoading}
          className="gap-2"
        >
          <Send size={16} />
          إرسال الجاهزين
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold">{item.value}</p>
              </div>
              <item.icon className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الإيميلات غير المؤكدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="بحث بالاسم أو البريد"
                className="pr-10"
              />
            </div>
            <select
              value={emailStatus}
              onChange={(event) => setEmailStatus(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">كل الحالات</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={only}
              onChange={(event) => setOnly(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">كل غير المؤكدين</option>
              <option value="ready">جاهزون للتذكير</option>
              <option value="exhausted">أرسلنا 3 رسائل</option>
              <option value="invalid">غير صالح أو مرتد</option>
            </select>
            <Button variant="outline" onClick={loadData} disabled={loading} className="gap-2">
              <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
              تحديث
            </Button>
          </div>

          <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800">حذف جماعي حسب الفلتر الحالي</p>
              <p className="text-xs text-red-700">
                يحذف كل الحسابات غير المؤكدة المطابقة للفلاتر الحالية، وليس الصفحة الحالية فقط. عدد النتائج الحالي: {total}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleDeleteFiltered}
              disabled={actionLoading || loading || total <= 0}
              className="gap-2"
            >
              <Trash2 size={16} />
              حذف كل النتائج
            </Button>
          </div>

          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-3">
              <span className="text-sm font-medium">المحدد: {selectedCount}</span>
              <Button
                size="sm"
                onClick={() => runAction(() => emailVerificationService.sendReminders({ user_ids: selectedIds, force: true }), 'تم إرسال التذكيرات للمحدد')}
                disabled={actionLoading}
                className="gap-2"
              >
                <Send size={14} />
                إرسال للمحدد
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runAction(() => emailVerificationService.markInvalid(selectedIds, 'Marked invalid by dashboard'), 'تم تعليم المحدد كغير صالح')}
                disabled={actionLoading}
                className="gap-2"
              >
                <XCircle size={14} />
                تعليم غير صالح
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runAction(() => emailVerificationService.clearStatus(selectedIds), 'تمت إعادة حالة المحدد')}
                disabled={actionLoading}
                className="gap-2"
              >
                <CheckCircle2 size={14} />
                إعادة الحالة
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  if (window.confirm('سيتم حذف المستخدمين غير المؤكدين المحددين فقط. هل تريد المتابعة؟')) {
                    runAction(() => emailVerificationService.deleteUsers(selectedIds), 'تم حذف المستخدمين المحددين');
                  }
                }}
                disabled={actionLoading}
                className="gap-2"
              >
                <Trash2 size={14} />
                حذف المحدد
              </Button>
            </div>
          )}

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="w-12 p-3 text-right">
                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} />
                  </th>
                  <th className="p-3 text-right">المستخدم</th>
                  <th className="p-3 text-right">حالة البريد</th>
                  <th className="p-3 text-right">التذكيرات</th>
                  <th className="p-3 text-right">آخر إرسال</th>
                  <th className="p-3 text-right">الإجراء المقترح</th>
                  <th className="p-3 text-right">سبب الفشل</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">جاري التحميل...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">لا توجد نتائج مطابقة</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-border">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleOne(user.id)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <span className={cn('inline-flex rounded-full px-2 py-1 text-xs font-medium', statusClasses[user.email_status] || statusClasses.pending)}>
                          {statusLabels[user.email_status] || user.email_status}
                        </span>
                      </td>
                      <td className="p-3">{user.reminder_count} / 3</td>
                      <td className="p-3 text-muted-foreground">
                        {user.last_reminder_sent_at ? new Date(user.last_reminder_sent_at).toLocaleString('ar') : 'لم يرسل'}
                      </td>
                      <td className="p-3 text-muted-foreground">{actionLabel(user.recommended_action)}</td>
                      <td className="max-w-[260px] truncate p-3 text-muted-foreground" title={user.last_error || ''}>
                        {user.last_error || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">إجمالي النتائج: {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {lastPage}</span>
              <Button variant="outline" disabled={page >= lastPage || loading} onClick={() => setPage((value) => value + 1)}>
                التالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function actionLabel(action: string): string {
  switch (action) {
    case 'review_delete':
      return 'مراجعة ثم حذف أو تصحيح البريد';
    case 'review_smtp_or_mark_invalid':
      return 'راجع SMTP أو علّم البريد كغير صالح';
    case 'review_delete_or_disable':
      return 'لم يؤكد بعد 3 رسائل';
    case 'send_reminder':
      return 'إرسال تذكير';
    default:
      return action || '-';
  }
}
