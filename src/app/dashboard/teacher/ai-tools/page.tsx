"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Sparkles, Download } from 'lucide-react';
import { teacherSubscriptionService, type TeacherAIGenerateResult, type TeacherWorkspaceSummary } from '@/lib/api/services/teacher-subscription';

const tools = [
  { value: 'exam', label: 'إنشاء اختبار' },
  { value: 'answer_key', label: 'إنشاء نموذج إجابة' },
  { value: 'worksheet', label: 'إنشاء ورقة عمل' },
  { value: 'remedial_plan', label: 'إنشاء خطة علاجية' },
  { value: 'content_analysis', label: 'إنشاء تحليل محتوى' },
];

export default function TeacherAIToolsPage() {
  const [form, setForm] = useState({
    tool_type: 'exam',
    title: '',
    prompt: '',
    grade: '',
    semester: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TeacherAIGenerateResult | null>(null);
  const [workspace, setWorkspace] = useState<TeacherWorkspaceSummary | null>(null);

  useEffect(() => {
    let mounted = true;
    teacherSubscriptionService.workspace()
      .then((data) => {
        if (mounted) setWorkspace(data);
      })
      .catch(() => {
        if (mounted) setWorkspace(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function generate() {
    if (!form.title.trim()) {
      toast.error('يرجى كتابة عنوان المخرج');
      return;
    }
    setLoading(true);
    try {
      const data = await teacherSubscriptionService.generateAI({
        tool_type: form.tool_type,
        title: form.title,
        prompt: form.prompt,
        grade: form.grade,
        semester: form.semester,
      });
      setResult(data);
      toast.success('تم إنشاء المخرج الذكي');
    } catch (error: any) {
      toast.error(error?.message || 'تعذر إنشاء المخرج الذكي');
    } finally {
      setLoading(false);
    }
  }

  async function exportResult(format: 'word' | 'pdf') {
    if (!result?.id) return;
    try {
      await teacherSubscriptionService.exportAI(result.id, format);
      toast.success('بدأ التصدير');
    } catch (error: any) {
      toast.error(error?.message || 'تعذر التصدير');
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">أدوات المعلم الذكية</h1>
        <p className="mt-2 text-sm text-slate-500">إنشاء نماذج امتحانات، إجابات، أوراق عمل، خطط علاجية وتحليل محتوى ضمن حدود اشتراكك. المادة مقفلة حسب مادة الاشتراك ولا يمكن تغييرها يدويًا.</p>
      </div>

      <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900 md:grid-cols-2">
        <select className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" value={form.tool_type} onChange={(e) => setForm({ ...form, tool_type: e.target.value })}>
          {tools.map((tool) => <option key={tool.value} value={tool.value}>{tool.label}</option>)}
        </select>
        <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" placeholder="الصف" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          المادة حسب الاشتراك: {workspace?.subject || 'يتم تحديدها تلقائيًا من اشتراكك'}
        </div>
        <input className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-950" placeholder="الفصل" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
        <textarea className="min-h-[140px] rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800 dark:bg-slate-950 md:col-span-2" placeholder="تفاصيل إضافية للمعلم..." value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} />

        <button onClick={generate} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          إنشاء
        </button>
      </div>

      {result && (
        <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">{result.title}</h2>
            <div className="flex gap-2">
              <button onClick={() => exportResult('word')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                <Download className="h-4 w-4" /> Word
              </button>
              <button onClick={() => exportResult('pdf')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                <Download className="h-4 w-4" /> PDF/طباعة
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 leading-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100">{result.output}</pre>
        </div>
      )}
    </div>
  );
}
