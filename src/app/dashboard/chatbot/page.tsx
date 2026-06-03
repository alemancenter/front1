'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot, MessageCircle, Plus, RefreshCw, Save, Search, Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import AccessDenied from '@/components/common/AccessDenied';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import {
  chatbotService,
  ChatbotKnowledgeItem,
  ChatbotSession,
  ChatbotSessionMessage,
} from '@/lib/api/services/chatbot';

// ── intent labels (English intent → Arabic display) ───────────────────────────
const INTENT_LABELS: Record<string, string> = {
  auth_login_problem: 'تسجيل الدخول',
  auth_register_problem: 'إنشاء حساب',
  password_reset_problem: 'استعادة كلمة المرور',
  email_verification_problem: 'تفعيل البريد',
  download_problem: 'مشكلة تحميل',
  download_location: 'مكان الملف',
  search_content: 'بحث محتوى',
  find_grade: 'بحث بالصف',
  find_subject: 'بحث بالمادة',
  find_semester: 'بحث بالفصل',
  request_content: 'طلب ملف',
  contact_support: 'تواصل مع الإدارة',
  general_question: 'سؤال عام',
  permission_problem: 'مشكلة صلاحية',
  file_not_found: 'ملف غير موجود',
  social_login_problem: 'دخول اجتماعي',
  site_error: 'خطأ الموقع',
  profile_problem: 'الملف الشخصي',
  privacy_request: 'طلب خصوصية',
  report_content: 'إبلاغ عن محتوى',
  account_lookup_privacy: 'استعلام حساب',
  country_or_curriculum: 'الدولة / المنهج',
  empty: 'رسالة فارغة',
};

// ── source type → label + colour ─────────────────────────────────────────────
const SOURCE_CFG: Record<string, { label: string; cls: string }> = {
  flow:           { label: 'قاعدة ثابتة',   cls: 'bg-slate-100 text-slate-600' },
  knowledge_base: { label: 'قاعدة المعرفة', cls: 'bg-green-100 text-green-700' },
  content_search: { label: 'بحث المحتوى',   cls: 'bg-amber-100 text-amber-700' },
  ai_guarded_rag: { label: 'ذكاء اصطناعي',  cls: 'bg-purple-100 text-purple-700' },
  validation:     { label: 'تحقق',           cls: 'bg-slate-100 text-slate-600' },
};

const EMPTY_K: ChatbotKnowledgeItem = {
  title: '', question: '', answer: '',
  category: 'general_question', keywords: '',
  country_code: 'all', is_active: true, priority: 10,
};

function fmtDate(s?: string) {
  if (!s) return '—';
  return new Date(s).toLocaleString('ar-JO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DashboardChatbotPage() {
  const { isAuthorized } = usePermissionGuard('manage settings');

  const [activeTab, setActiveTab] = useState<'sessions' | 'knowledge'>('sessions');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [knowledge, setKnowledge] = useState<ChatbotKnowledgeItem[]>([]);

  // session detail
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatbotSession | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // session list filters
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  // knowledge modal (triggered from conversation)
  const [kModal, setKModal] = useState(false);
  const [kForm, setKForm] = useState<ChatbotKnowledgeItem>(EMPTY_K);
  const [kSaving, setKSaving] = useState(false);

  // knowledge tab form
  const [tabK, setTabK] = useState<ChatbotKnowledgeItem>(EMPTY_K);
  const [tabKSaving, setTabKSaving] = useState(false);

  // ── data loading ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [s, k] = await Promise.all([
        chatbotService.sessions(100),
        chatbotService.knowledge('', 200),
      ]);
      setSessions(s);
      setKnowledge(k);
    } catch {
      toast.error('تعذر تحميل بيانات المساعد');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => { void loadData(); }, [loadData]);

  const loadSession = useCallback(async (id: number) => {
    setLoadingDetail(true);
    try {
      const s = await chatbotService.session(id);
      setSelectedSession(s);
    } catch {
      toast.error('تعذر تحميل تفاصيل المحادثة');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) void loadSession(selectedId);
    else setSelectedSession(null);
  }, [selectedId, loadSession]);

  useEffect(() => {
    if (selectedSession) msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedSession]);

  if (!isAuthorized) return <AccessDenied />;

  // ── derived values ────────────────────────────────────────────────────────
  const countries = useMemo(
    () => [...new Set(sessions.map((s) => s.country_code).filter(Boolean))],
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    const q = search.toLowerCase();
    return sessions.filter((s) => {
      if (filterCountry && s.country_code !== filterCountry) return false;
      if (!q) return true;
      return (
        String(s.id).includes(q) ||
        s.last_intent?.toLowerCase().includes(q) ||
        (s.messages ?? []).some((m) => m.message.toLowerCase().includes(q))
      );
    });
  }, [sessions, search, filterCountry]);

  const totalMsgs = useMemo(
    () => sessions.reduce((acc, s) => acc + (s.messages?.length ?? 0), 0),
    [sessions],
  );

  // ── training workflow ─────────────────────────────────────────────────────
  function openTrainModal(msg: ChatbotSessionMessage) {
    const msgs = selectedSession?.messages ?? [];
    const idx = msgs.findIndex((m) => m.id === msg.id);
    const userMsg = msgs.slice(0, idx).reverse().find((m) => m.role === 'user');
    setKForm({
      ...EMPTY_K,
      title: `رد من جلسة #${selectedSession?.id}`,
      question: userMsg?.message ?? '',
      answer: msg.message,
      category: msg.intent ?? 'general_question',
      country_code: selectedSession?.country_code ?? 'all',
    });
    setKModal(true);
  }

  async function saveFromModal() {
    if (!kForm.title?.trim() || !kForm.question?.trim() || !kForm.answer?.trim()) {
      toast.error('العنوان والسؤال والجواب مطلوبة');
      return;
    }
    setKSaving(true);
    try {
      await chatbotService.createKnowledge(kForm);
      toast.success('تمت إضافة المعرفة بنجاح');
      setKModal(false);
      await loadData();
    } catch {
      toast.error('تعذر حفظ عنصر المعرفة');
    } finally {
      setKSaving(false);
    }
  }

  // ── knowledge tab ─────────────────────────────────────────────────────────
  async function saveTabK() {
    if (!tabK.title?.trim() || !tabK.question?.trim() || !tabK.answer?.trim()) {
      toast.error('العنوان والسؤال والجواب مطلوبة');
      return;
    }
    setTabKSaving(true);
    try {
      if (tabK.id) {
        await chatbotService.updateKnowledge(tabK.id, tabK);
        toast.success('تم تحديث عنصر المعرفة');
      } else {
        await chatbotService.createKnowledge(tabK);
        toast.success('تمت إضافة عنصر معرفة جديد');
      }
      setTabK(EMPTY_K);
      await loadData();
    } catch {
      toast.error('تعذر حفظ عنصر المعرفة');
    } finally {
      setTabKSaving(false);
    }
  }

  async function deleteK(id?: number) {
    if (!id) return;
    try {
      await chatbotService.deleteKnowledge(id);
      toast.success('تم حذف عنصر المعرفة');
      await loadData();
    } catch {
      toast.error('تعذر حذف عنصر المعرفة');
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Bot className="h-7 w-7 text-blue-600" />
            مساعد المنصة الذكي
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            مراجعة كافة محادثات الأعضاء المحفوظة في قاعدة البيانات وتدريب البوت من خلال قاعدة المعرفة.
          </p>
        </div>
        <Button onClick={() => void loadData()} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">جلسات محادثة</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{sessions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">رسائل مُسجَّلة</p>
          <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">{totalMsgs}+</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">عناصر قاعدة المعرفة</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{knowledge.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-sm text-slate-500">دول نشطة</p>
          <p className="mt-1 text-3xl font-bold text-purple-600">{countries.length}</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        {(['sessions', 'knowledge'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white shadow dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'sessions' ? `المحادثات والتدريب (${sessions.length})` : `قاعدة المعرفة (${knowledge.length})`}
          </button>
        ))}
      </div>

      {/* ══ Sessions Tab ══ */}
      {activeTab === 'sessions' && (
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]" style={{ minHeight: '72vh' }}>

          {/* Left: sessions list */}
          <div className="flex flex-col gap-3">
            {/* filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في المحادثات..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pe-9 ps-3 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              {countries.length > 1 && (
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="">كل الدول ({sessions.length})</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c.toUpperCase()}</option>
                  ))}
                </select>
              )}
            </div>

            {/* sessions list */}
            <div className="flex flex-col gap-2 overflow-y-auto rounded-xl" style={{ maxHeight: 'calc(72vh - 90px)' }}>
              {filteredSessions.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400 dark:bg-slate-800">
                  لا توجد محادثات
                </div>
              )}
              {filteredSessions.map((session) => {
                const userCount = (session.messages ?? []).filter((m) => m.role === 'user').length;
                const isSelected = selectedId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedId(isSelected ? null : session.id)}
                    className={`w-full rounded-xl border p-3 text-start transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-white">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                        جلسة #{session.id}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {session.country_code}
                      </span>
                    </div>
                    {session.last_intent && session.last_intent !== 'general_question' && (
                      <p className="mt-1 text-xs text-blue-600">
                        {INTENT_LABELS[session.last_intent] ?? session.last_intent}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{userCount} أسئلة</span>
                      <span>{fmtDate(session.updated_at)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: conversation detail */}
          <Card className="flex flex-col overflow-hidden" style={{ minHeight: '72vh' }}>
            {!selectedId ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center text-slate-400">
                <MessageCircle className="h-14 w-14 opacity-20" />
                <p className="text-sm">اختر محادثة من القائمة لعرض جميع رسائلها المحفوظة</p>
                <p className="text-xs text-slate-300">يمكنك إضافة أي رد للبوت مباشرةً إلى قاعدة المعرفة</p>
              </div>
            ) : loadingDetail ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : selectedSession ? (
              <>
                {/* session header */}
                <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-bold text-slate-800 dark:text-white">جلسة #{selectedSession.id}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase dark:bg-slate-700">
                      {selectedSession.country_code}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedSession.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedSession.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                    </span>
                    <span className="text-xs text-slate-400">{fmtDate(selectedSession.created_at)}</span>
                    {selectedSession.user_id ? (
                      <span className="text-xs text-indigo-500">مستخدم #{selectedSession.user_id}</span>
                    ) : (
                      <span className="font-mono text-xs text-slate-400">
                        ضيف: {(selectedSession.guest_id ?? '').slice(0, 24)}…
                      </span>
                    )}
                    <span className="ms-auto text-xs font-semibold text-slate-500">
                      {selectedSession.messages?.length ?? 0} رسالة
                    </span>
                  </div>
                </div>

                {/* messages */}
                <div className="flex-1 overflow-y-auto space-y-5 p-4">
                  {(selectedSession.messages ?? []).map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    const src = SOURCE_CFG[msg.source_type ?? ''];
                    const conf = (msg.confidence ?? 0);
                    return (
                      <div key={msg.id ?? idx} className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>

                        {/* bubble */}
                        <div className={`relative max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700'
                        }`}>
                          {msg.message}
                        </div>

                        {/* meta row */}
                        <div className={`flex flex-wrap items-center gap-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[10px] text-slate-400">{fmtDate(msg.created_at)}</span>

                          {/* role */}
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            isUser ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isUser ? 'مستخدم' : 'المساعد'}
                          </span>

                          {/* intent (assistant only) */}
                          {!isUser && msg.intent && (
                            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                              {INTENT_LABELS[msg.intent] ?? msg.intent}
                            </span>
                          )}

                          {/* source type */}
                          {!isUser && src && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${src.cls}`}>
                              {src.label}
                            </span>
                          )}

                          {/* confidence */}
                          {!isUser && conf > 0 && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              conf >= 0.9 ? 'bg-green-50 text-green-600' :
                              conf >= 0.7 ? 'bg-amber-50 text-amber-600' :
                              'bg-red-50 text-red-600'
                            }`}>
                              ثقة {Math.round(conf * 100)}%
                            </span>
                          )}

                          {/* train button */}
                          {!isUser && (
                            <button
                              onClick={() => openTrainModal(msg)}
                              className="flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 transition hover:bg-blue-100 active:bg-blue-200"
                            >
                              <Plus className="h-2.5 w-2.5" />
                              أضف للمعرفة
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef} />
                </div>
              </>
            ) : null}
          </Card>
        </div>
      )}

      {/* ══ Knowledge Tab ══ */}
      {activeTab === 'knowledge' && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">

          {/* form */}
          <Card>
            <CardHeader>
              <CardTitle>{tabK.id ? 'تعديل عنصر معرفة' : 'إضافة معرفة جديدة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="العنوان"
                value={tabK.title ?? ''}
                onChange={(e) => setTabK({ ...tabK, title: e.target.value })}
                placeholder="عنوان قصير يصف هذه المعرفة"
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  السؤال / المشكلة
                </label>
                <textarea
                  value={tabK.question ?? ''}
                  onChange={(e) => setTabK({ ...tabK, question: e.target.value })}
                  placeholder="اكتب السؤال أو المشكلة التي يطرحها المستخدم"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <Input
                label="التصنيف (intent)"
                value={tabK.category ?? ''}
                onChange={(e) => setTabK({ ...tabK, category: e.target.value })}
                placeholder="مثال: search_content أو email_verification_problem"
              />
              <Input
                label="كلمات مفتاحية (مفصولة بفواصل)"
                value={tabK.keywords ?? ''}
                onChange={(e) => setTabK({ ...tabK, keywords: e.target.value })}
                placeholder="تحميل، ملف، اجتماعيات..."
              />
              <Input
                label="الدولة"
                value={tabK.country_code ?? 'all'}
                onChange={(e) => setTabK({ ...tabK, country_code: e.target.value })}
                placeholder="all / jo / sa / eg / ps"
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  الجواب المعتمد
                </label>
                <textarea
                  value={tabK.answer ?? ''}
                  onChange={(e) => setTabK({ ...tabK, answer: e.target.value })}
                  placeholder="الجواب الذي سيرد به البوت على هذا السؤال"
                  rows={7}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => void saveTabK()} isLoading={tabKSaving}>
                  <Save className="h-4 w-4" />
                  {tabK.id ? 'حفظ التعديل' : 'إضافة'}
                </Button>
                <Button variant="outline" onClick={() => setTabK(EMPTY_K)}>
                  <Plus className="h-4 w-4" />
                  جديد
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* list */}
          <Card>
            <CardHeader><CardTitle>العناصر الحالية ({knowledge.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {knowledge.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400 dark:bg-slate-800">
                  لا توجد عناصر معرفة بعد
                </div>
              )}
              {knowledge.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-700">
                          {item.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                          {item.country_code}
                        </span>
                        {item.is_active === false && (
                          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">معطّل</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.question}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => setTabK(item)}>تعديل</Button>
                      <Button variant="danger" size="sm" onClick={() => void deleteK(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ Knowledge Modal (from conversation) ══ */}
      <Modal
        isOpen={kModal}
        onClose={() => setKModal(false)}
        title="إضافة رد البوت إلى قاعدة المعرفة"
      >
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            بعد الحفظ، سيستخدم البوت هذا الجواب مباشرةً لأسئلة مشابهة — بدلًا من الاعتماد على القواعد الثابتة أو الذكاء الاصطناعي.
          </p>

          <Input
            label="العنوان"
            value={kForm.title ?? ''}
            onChange={(e) => setKForm({ ...kForm, title: e.target.value })}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              السؤال — من رسالة المستخدم (عدّله إن أردت)
            </label>
            <textarea
              value={kForm.question ?? ''}
              onChange={(e) => setKForm({ ...kForm, question: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <Input
            label="التصنيف (intent)"
            value={kForm.category ?? ''}
            onChange={(e) => setKForm({ ...kForm, category: e.target.value })}
          />

          <Input
            label="كلمات مفتاحية (مفصولة بفواصل)"
            value={kForm.keywords ?? ''}
            onChange={(e) => setKForm({ ...kForm, keywords: e.target.value })}
            placeholder="اختياري"
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              الجواب — رد البوت (عدّله وحسّنه)
            </label>
            <textarea
              value={kForm.answer ?? ''}
              onChange={(e) => setKForm({ ...kForm, answer: e.target.value })}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setKModal(false)}>إلغاء</Button>
            <Button onClick={() => void saveFromModal()} isLoading={kSaving}>
              <Save className="h-4 w-4" />
              حفظ في قاعدة المعرفة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
