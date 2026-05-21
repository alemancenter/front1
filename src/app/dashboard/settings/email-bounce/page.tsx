'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Mail,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Server,
  XCircle,
  Zap,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import AccessDenied from '@/components/common/AccessDenied';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { cn } from '@/lib/utils';
import {
  emailBounceService,
  BounceEvent,
  BounceStats,
  BounceType,
} from '@/lib/api/services/email-bounce';

/* ─── Labels & styles ─────────────────────────────────────────────────────── */

const bounceTypeLabels: Record<string, string> = {
  hard_bounce: 'ارتداد دائم',
  soft_bounce: 'ارتداد مؤقت',
  unknown:     'غير محدد',
};

const bounceTypeBadge: Record<string, string> = {
  hard_bounce: 'bg-red-100 text-red-700',
  soft_bounce: 'bg-amber-100 text-amber-700',
  unknown:     'bg-slate-100 text-slate-600',
};

const statusLabels: Record<string, string> = {
  active:        'نشط',
  hard_bounce:   'ارتداد دائم',
  soft_bounce:   'ارتداد مؤقت',
  invalid_email: 'بريد غير صالح',
  unsubscribed:  'إلغاء الاشتراك',
};

const statusBadge: Record<string, string> = {
  active:        'bg-emerald-100 text-emerald-700',
  hard_bounce:   'bg-red-100 text-red-700',
  soft_bounce:   'bg-amber-100 text-amber-700',
  invalid_email: 'bg-red-100 text-red-700',
  unsubscribed:  'bg-slate-100 text-slate-600',
};

/* ─── Empty defaults ──────────────────────────────────────────────────────── */

const emptyStats: BounceStats = {
  user_statuses: [],
  events_by_type: [],
  total_events: 0,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

/* ─── Bounce settings form state ──────────────────────────────────────────── */

interface BounceConfig {
  mail_bounce_address: string;
  bounce_processor_enabled: string;
  bounce_imap_host: string;
  bounce_imap_port: string;
  bounce_imap_username: string;
  bounce_imap_password: string;
  bounce_imap_tls: string;
}

const emptyConfig: BounceConfig = {
  mail_bounce_address: '',
  bounce_processor_enabled: 'false',
  bounce_imap_host: '',
  bounce_imap_port: '993',
  bounce_imap_username: '',
  bounce_imap_password: '',
  bounce_imap_tls: 'true',
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function EmailBouncePage() {
  const { isAuthorized } = usePermissionGuard('manage settings');

  const [events, setEvents]             = useState<BounceEvent[]>([]);
  const [stats, setStats]               = useState<BounceStats>(emptyStats);
  const [selectedEmails, setSelected]   = useState<string[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setAction]      = useState(false);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState<BounceType | ''>('');
  const [page, setPage]                 = useState(1);
  const [lastPage, setLastPage]         = useState(1);
  const [total, setTotal]               = useState(0);

  // Settings form
  const [cfg, setCfg]           = useState<BounceConfig>(emptyConfig);
  const [cfgLoading, setCfgLoad] = useState(true);
  const [cfgSaving, setCfgSave]  = useState(false);

  const selectedCount = selectedEmails.length;
  const allSelected   = events.length > 0 && events.every(e => selectedEmails.includes(e.email));

  /* ── Config load & save ────────────────────────────────────────────────── */

  const loadConfig = useCallback(async () => {
    if (!isAuthorized) return;
    setCfgLoad(true);
    try {
      const res = await apiClient.get<{ data: Record<string, string> }>(API_ENDPOINTS.SETTINGS.GET_ALL);
      const s: Record<string, string> = res.data?.data ?? {};
      setCfg({
        mail_bounce_address:      s.mail_bounce_address      ?? '',
        bounce_processor_enabled: s.bounce_processor_enabled ?? 'false',
        bounce_imap_host:         s.bounce_imap_host         ?? '',
        bounce_imap_port:         s.bounce_imap_port         ?? '993',
        bounce_imap_username:     s.bounce_imap_username     ?? '',
        bounce_imap_password:     s.bounce_imap_password     ?? '',
        bounce_imap_tls:          s.bounce_imap_tls          ?? 'true',
      });
    } catch {
      toast.error('تعذّر تحميل إعدادات Bounce');
    } finally {
      setCfgLoad(false);
    }
  }, [isAuthorized]);

  const saveConfig = async () => {
    setCfgSave(true);
    try {
      await apiClient.post(API_ENDPOINTS.SETTINGS.UPDATE, cfg);
      toast.success('تم حفظ الإعدادات بنجاح وكتابتها في ملف .env');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setCfgSave(false);
    }
  };

  useEffect(() => { loadConfig(); }, [loadConfig]);

  /* ── Data loading ───────────────────────────────────────────────────────── */

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        emailBounceService.listEvents({ page, per_page: 25, email: search || undefined, bounce_type: typeFilter || undefined }),
        emailBounceService.stats(),
      ]);

      setEvents(eventsRes?.data ?? []);
      setLastPage(eventsRes?.pagination?.last_page ?? 1);
      setTotal(eventsRes?.pagination?.total ?? 0);
      setStats(statsRes ?? emptyStats);
    } catch {
      toast.error('تعذّر تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized, page, search, typeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Selection helpers ──────────────────────────────────────────────────── */

  const toggleOne = (email: string) =>
    setSelected(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );

  const toggleAll = () =>
    setSelected(allSelected ? [] : events.map(e => e.email));

  /* ── Actions ────────────────────────────────────────────────────────────── */

  const handleMarkHard = async () => {
    if (!selectedCount) return;
    setAction(true);
    try {
      const res = await emailBounceService.markStatus(selectedEmails, 'hard_bounce');
      toast.success(`تم تعليم ${res.updated} بريد كـ ارتداد دائم`);
      setSelected([]);
      loadData();
    } catch { toast.error('فشلت العملية'); }
    finally { setAction(false); }
  };

  const handleMarkSoft = async () => {
    if (!selectedCount) return;
    setAction(true);
    try {
      const res = await emailBounceService.markStatus(selectedEmails, 'soft_bounce');
      toast.success(`تم تعليم ${res.updated} بريد كـ ارتداد مؤقت`);
      setSelected([]);
      loadData();
    } catch { toast.error('فشلت العملية'); }
    finally { setAction(false); }
  };

  const handleReset = async () => {
    if (!selectedCount) return;
    setAction(true);
    try {
      const res = await emailBounceService.resetStatus(selectedEmails);
      toast.success(`تمت إعادة تعيين ${res.updated} بريد إلى نشط`);
      setSelected([]);
      loadData();
    } catch { toast.error('فشلت العملية'); }
    finally { setAction(false); }
  };

  const handleProcessNow = async () => {
    setAction(true);
    try {
      await emailBounceService.processNow();
      toast.success('تم طلب معالجة صندوق الارتداد الآن');
    } catch { toast.error('فشل الطلب'); }
    finally { setAction(false); }
  };

  /* ── Stats helpers ──────────────────────────────────────────────────────── */

  const countByStatus = (status: string) =>
    stats.user_statuses.find(s => s.status === status)?.count ?? 0;

  /* ── Guard ──────────────────────────────────────────────────────────────── */

  if (!isAuthorized) return <AccessDenied />;

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 p-6" dir="rtl">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة البريد المرتد</h1>
          <p className="mt-1 text-sm text-gray-500">
            مراقبة رسائل الارتداد ومنع الإرسال للعناوين الميتة تلقائياً
          </p>
        </div>
        <Button
          onClick={handleProcessNow}
          disabled={actionLoading}
          className="flex items-center gap-2"
        >
          <Zap className="h-4 w-4" />
          معالجة صندوق الارتداد الآن
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Ban className="h-5 w-5 text-red-500" />}
          label="ارتداد دائم"
          value={countByStatus('hard_bounce')}
          color="bg-red-50"
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          label="ارتداد مؤقت"
          value={countByStatus('soft_bounce')}
          color="bg-amber-50"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          label="نشط"
          value={countByStatus('active')}
          color="bg-emerald-50"
        />
        <StatCard
          icon={<Mail className="h-5 w-5 text-blue-500" />}
          label="إجمالي الأحداث"
          value={stats.total_events}
          color="bg-blue-50"
        />
      </div>

      {/* Events table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل أحداث الارتداد</CardTitle>
        </CardHeader>
        <CardContent>

          {/* Filters */}
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input name="field-app-dashboard-settings-email-bounce-page-10030-1"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="بحث بالبريد الإلكتروني..."
                className="pr-9"
              />
            </div>
            <select name="field-app-dashboard-settings-email-bounce-page-316-1"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as BounceType | ''); setPage(1); }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">كل الأنواع</option>
              <option value="hard_bounce">ارتداد دائم</option>
              <option value="soft_bounce">ارتداد مؤقت</option>
              <option value="unknown">غير محدد</option>
            </select>
            <Button variant="outline" onClick={() => loadData()} className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>

          {/* Bulk actions */}
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 px-4 py-2">
              <span className="text-sm font-medium text-blue-800">
                {selectedCount} محدد
              </span>
              <Button size="sm" variant="outline" onClick={handleMarkHard} disabled={actionLoading}
                className="flex items-center gap-1 border-red-200 text-red-700 hover:bg-red-50">
                <XCircle className="h-3.5 w-3.5" /> تعليم ارتداد دائم
              </Button>
              <Button size="sm" variant="outline" onClick={handleMarkSoft} disabled={actionLoading}
                className="flex items-center gap-1 border-amber-200 text-amber-700 hover:bg-amber-50">
                <AlertTriangle className="h-3.5 w-3.5" /> تعليم ارتداد مؤقت
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} disabled={actionLoading}
                className="flex items-center gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <RotateCcw className="h-3.5 w-3.5" /> إعادة تعيين نشط
              </Button>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">جارٍ التحميل...</div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              لا توجد أحداث ارتداد مسجّلة
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">
                      <input name="field-app-dashboard-settings-email-bounce-page-366-2"
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3">البريد الإلكتروني</th>
                    <th className="px-4 py-3">نوع الارتداد</th>
                    <th className="px-4 py-3">كود SMTP</th>
                    <th className="px-4 py-3">تفاصيل التشخيص</th>
                    <th className="px-4 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {events.map(event => (
                    <tr
                      key={event.id}
                      className={cn(
                        'transition-colors',
                        selectedEmails.includes(event.email) ? 'bg-blue-50' : 'hover:bg-gray-50'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input name="field-app-dashboard-settings-email-bounce-page-390-3"
                          type="checkbox"
                          checked={selectedEmails.includes(event.email)}
                          onChange={() => toggleOne(event.email)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800 dir-ltr text-left">
                        {event.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          bounceTypeBadge[event.bounce_type] ?? 'bg-slate-100 text-slate-600'
                        )}>
                          {bounceTypeLabels[event.bounce_type] ?? event.bounce_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {event.smtp_status || '—'}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-xs text-gray-500" title={event.diagnostic_code}>
                        {event.diagnostic_code || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>إجمالي النتائج: {total}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  السابق
                </Button>
                <span className="px-3 py-1.5 text-gray-500">
                  {page} / {lastPage}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= lastPage}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Status breakdown */}
      {stats.user_statuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع حالات المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.user_statuses.map(row => (
                <span
                  key={row.status}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                    statusBadge[row.status] ?? 'bg-gray-100 text-gray-600'
                  )}
                >
                  {statusLabels[row.status] ?? row.status}
                  <span className="font-bold">{row.count.toLocaleString('ar-EG')}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Bounce Mailbox Settings ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-gray-500" />
            <CardTitle>إعدادات صندوق الارتداد (Bounce Mailbox)</CardTitle>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            تُحفظ هذه الإعدادات مباشرةً في ملف <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">.env</code> وتُطبّق فوراً دون إعادة تشغيل.
          </p>
        </CardHeader>
        <CardContent>
          {cfgLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">جارٍ تحميل الإعدادات...</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">

              {/* Bounce address */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  عنوان الارتداد (MAIL_BOUNCE_ADDRESS)
                </label>
                <Input name="field-app-dashboard-settings-email-bounce-page-18681-2"
                  value={cfg.mail_bounce_address}
                  onChange={e => setCfg(p => ({ ...p, mail_bounce_address: e.target.value }))}
                  placeholder="bounce@alemancenter.com"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-gray-400">
                  يُستخدم كـ Envelope Sender (MAIL FROM) حتى ترجع رسائل الفشل لهذا الصندوق.
                </p>
              </div>

              {/* IMAP Host */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  خادم IMAP (BOUNCE_IMAP_HOST)
                </label>
                <Input name="field-app-dashboard-settings-email-bounce-page-19353-3"
                  value={cfg.bounce_imap_host}
                  onChange={e => setCfg(p => ({ ...p, bounce_imap_host: e.target.value }))}
                  placeholder="mail.alemancenter.com"
                  dir="ltr"
                />
              </div>

              {/* IMAP Port */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  المنفذ (BOUNCE_IMAP_PORT)
                </label>
                <Input name="field-app-dashboard-settings-email-bounce-page-19842-4"
                  value={cfg.bounce_imap_port}
                  onChange={e => setCfg(p => ({ ...p, bounce_imap_port: e.target.value }))}
                  placeholder="993"
                  dir="ltr"
                />
              </div>

              {/* IMAP Username */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  اسم المستخدم (BOUNCE_IMAP_USERNAME)
                </label>
                <Input name="field-app-dashboard-settings-email-bounce-page-20327-5"
                  value={cfg.bounce_imap_username}
                  onChange={e => setCfg(p => ({ ...p, bounce_imap_username: e.target.value }))}
                  placeholder="bounce@alemancenter.com"
                  dir="ltr"
                />
              </div>

              {/* IMAP Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  كلمة المرور (BOUNCE_IMAP_PASSWORD)
                </label>
                <Input name="field-app-dashboard-settings-email-bounce-page-20839-6"
                  type="password"
                  value={cfg.bounce_imap_password}
                  onChange={e => setCfg(p => ({ ...p, bounce_imap_password: e.target.value }))}
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>

              {/* TLS toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input name="field-app-dashboard-settings-email-bounce-page-569-4"
                    type="checkbox"
                    className="sr-only peer"
                    checked={cfg.bounce_imap_tls === 'true'}
                    onChange={e => setCfg(p => ({ ...p, bounce_imap_tls: e.target.checked ? 'true' : 'false' }))}
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm font-medium text-gray-700">
                  TLS/SSL مُفعَّل (BOUNCE_IMAP_TLS)
                </span>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input name="field-app-dashboard-settings-email-bounce-page-585-5"
                    type="checkbox"
                    className="sr-only peer"
                    checked={cfg.bounce_processor_enabled === 'true'}
                    onChange={e => setCfg(p => ({ ...p, bounce_processor_enabled: e.target.checked ? 'true' : 'false' }))}
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-300 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                </label>
                <span className="text-sm font-medium text-gray-700">
                  تفعيل المعالج التلقائي (BOUNCE_PROCESSOR_ENABLED)
                </span>
              </div>

              {/* Save button */}
              <div className="sm:col-span-2 flex justify-end pt-2 border-t border-gray-100">
                <Button
                  onClick={saveConfig}
                  disabled={cfgSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {cfgSaving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات في .env'}
                </Button>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

/* ─── StatCard helper ─────────────────────────────────────────────────────── */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 rounded-xl p-4', color)}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value.toLocaleString('ar-EG')}</p>
      </div>
    </div>
  );
}
