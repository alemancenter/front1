'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AccessDenied from '@/components/common/AccessDenied';
import { usePermissionGuard } from '@/hooks/usePermissionGuard';
import { chatbotService, ChatbotKnowledgeItem, ChatbotSession } from '@/lib/api/services/chatbot';

const emptyKnowledge: ChatbotKnowledgeItem = {
  title: '',
  question: '',
  answer: '',
  category: 'general_question',
  keywords: '',
  country_code: 'all',
  is_active: true,
  priority: 10,
};

export default function DashboardChatbotPage() {
  const { isAuthorized } = usePermissionGuard('manage settings');
  const [activeTab, setActiveTab] = useState<'sessions' | 'knowledge'>('sessions');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatbotSession[]>([]);
  const [knowledge, setKnowledge] = useState<ChatbotKnowledgeItem[]>([]);
  const [form, setForm] = useState<ChatbotKnowledgeItem>(emptyKnowledge);

  const latestQuestions = useMemo(() => sessions.flatMap((session) => (session.messages || []).filter((message) => message.role === 'user').map((message) => ({ session, message }))).slice(0, 20), [sessions]);

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoading(true);
    try {
      const [sessionData, knowledgeData] = await Promise.all([
        chatbotService.sessions(50),
        chatbotService.knowledge('', 100),
      ]);
      setSessions(sessionData);
      setKnowledge(knowledgeData);
    } catch {
      toast.error('تعذر تحميل بيانات المساعد');
    } finally {
      setLoading(false);
    }
  }, [isAuthorized]);

  useEffect(() => { void loadData(); }, [loadData]);

  if (!isAuthorized) return <AccessDenied />;

  async function saveKnowledge() {
    if (!form.title?.trim() || !form.question?.trim() || !form.answer?.trim()) {
      toast.error('العنوان والسؤال والجواب مطلوبة');
      return;
    }
    try {
      if (form.id) {
        await chatbotService.updateKnowledge(form.id, form);
        toast.success('تم تحديث عنصر المعرفة');
      } else {
        await chatbotService.createKnowledge(form);
        toast.success('تمت إضافة عنصر معرفة جديد');
      }
      setForm(emptyKnowledge);
      await loadData();
    } catch {
      toast.error('تعذر حفظ عنصر المعرفة');
    }
  }

  async function deleteKnowledge(id?: number) {
    if (!id) return;
    try {
      await chatbotService.deleteKnowledge(id);
      toast.success('تم حذف عنصر المعرفة');
      await loadData();
    } catch {
      toast.error('تعذر حذف عنصر المعرفة');
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white"><Bot className="h-7 w-7 text-blue-600" /> مساعد المنصة الذكي</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">إدارة محادثات الأعضاء وقاعدة المعرفة التي يعتمد عليها البوت قبل أي ذكاء اصطناعي.</p>
        </div>
        <Button onClick={() => void loadData()} disabled={loading} variant="outline"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> تحديث</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><div className="text-sm text-slate-500">المحادثات</div><div className="mt-2 text-3xl font-bold">{sessions.length}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-slate-500">عناصر المعرفة</div><div className="mt-2 text-3xl font-bold">{knowledge.length}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-sm text-slate-500">آخر أسئلة ظاهرة</div><div className="mt-2 text-3xl font-bold">{latestQuestions.length}</div></CardContent></Card>
      </div>

      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
        <button onClick={() => setActiveTab('sessions')} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'sessions' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}>المحادثات والأسئلة</button>
        <button onClick={() => setActiveTab('knowledge')} className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold ${activeTab === 'knowledge' ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-500'}`}>قاعدة المعرفة</button>
      </div>

      {activeTab === 'sessions' && (
        <Card>
          <CardHeader><CardTitle>آخر محادثات المساعد</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {sessions.length === 0 && <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500 dark:bg-slate-800">لا توجد محادثات بعد.</div>}
            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                  <span>جلسة #{session.id} — {session.country_code}</span>
                  <span>{new Date(session.updated_at).toLocaleString('ar')}</span>
                </div>
                <div className="space-y-2">
                  {(session.messages || []).map((message) => (
                    <div key={message.id} className={`rounded-xl px-3 py-2 text-sm ${message.role === 'user' ? 'bg-blue-50 text-blue-950 dark:bg-blue-950 dark:text-blue-100' : 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                      <strong>{message.role === 'user' ? 'العضو: ' : 'المساعد: '}</strong>{message.message}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'knowledge' && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <Card>
            <CardHeader><CardTitle>{form.id ? 'تعديل معرفة' : 'إضافة معرفة جديدة'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان" />
              <Input value={form.question || ''} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="السؤال أو المشكلة" />
              <Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="التصنيف / intent" />
              <Input value={form.keywords || ''} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="كلمات مفتاحية مفصولة بفواصل" />
              <Input value={form.country_code || 'all'} onChange={(e) => setForm({ ...form, country_code: e.target.value })} placeholder="country_code: all / jo / sa / eg / ps" />
              <textarea value={form.answer || ''} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="الجواب المعتمد الذي سيرد به البوت" className="min-h-40 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
              <div className="flex gap-2">
                <Button onClick={() => void saveKnowledge()}><Save className="h-4 w-4" /> حفظ</Button>
                <Button variant="outline" onClick={() => setForm(emptyKnowledge)}><Plus className="h-4 w-4" /> جديد</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>العناصر الحالية</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {knowledge.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.question}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setForm(item)}>تعديل</Button>
                      <Button variant="danger" size="sm" onClick={() => void deleteKnowledge(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
