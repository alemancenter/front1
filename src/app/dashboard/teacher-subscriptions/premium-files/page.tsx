"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Search, ShieldCheck, ShieldOff, UploadCloud } from 'lucide-react';
import { teacherSubscriptionService, type TeacherPremiumVaultFile, type TeacherAcademicClass, type TeacherAcademicSubject, type TeacherAcademicSemester } from '@/lib/api/services/teacher-subscription';

const categories = [
  { value: '', label: 'كل التصنيفات' },
  { value: 'exam', label: 'امتحان' },
  { value: 'answer_key', label: 'نموذج إجابة' },
  { value: 'plan', label: 'خطة' },
  { value: 'content_analysis', label: 'تحليل محتوى' },
  { value: 'worksheet', label: 'ورقة عمل' },
  { value: 'remedial_plan', label: 'خطة علاجية' },
  { value: 'question_bank', label: 'بنك أسئلة' },
  { value: 'final_review', label: 'مراجعة نهائية' },
];

const countries = [
  { value: 'jo', label: 'الأردن' },
  { value: 'sa', label: 'السعودية' },
  { value: 'eg', label: 'مصر' },
  { value: 'ps', label: 'فلسطين' },
];

export default function PremiumTeacherFilesAdminPage() {
  const [items, setItems] = useState<TeacherPremiumVaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const [filters, setFilters] = useState({
    country: 'jo',
    q: '',
    active: 'true',
    category: '',
    subject: '',
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    grade_name: '',
    grade_level: '',
    subject_id: '',
    subject_name: '',
    semester_id: '',
    semester_name: '',
    category: 'exam',
  });

  const [classes, setClasses] = useState<TeacherAcademicClass[]>([]);
  const [subjects, setSubjects] = useState<TeacherAcademicSubject[]>([]);
  const [semesters, setSemesters] = useState<TeacherAcademicSemester[]>([]);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await teacherSubscriptionService.adminListPremiumFiles(filters);
      setItems(response?.data || []);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحميل ملفات الخزنة');
    } finally {
      setLoading(false);
    }
  }


  function selectedCountryId() {
    const map: Record<string, string> = { jo: '1', sa: '2', eg: '3', ps: '4' };
    return map[filters.country] || '1';
  }

  function getSelectedFileType() {
    if (!file?.name) return '';
    const parts = file.name.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  async function loadClasses() {
    setAcademicLoading(true);
    try {
      const data = await teacherSubscriptionService.adminAcademicClasses(selectedCountryId());
      setClasses(data);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر جلب الصفوف من قاعدة البيانات');
    } finally {
      setAcademicLoading(false);
    }
  }

  async function handleClassChange(value: string) {
    const selectedClass = classes.find((item) => String(item.id) === value || String(item.grade_level) === value);
    const gradeLevel = selectedClass?.id ? String(selectedClass.id) : value;

    setForm({
      ...form,
      grade_level: gradeLevel,
      grade_name: selectedClass?.grade_name || '',
      subject_id: '',
      subject_name: '',
      semester_id: '',
      semester_name: '',
    });
    setSubjects([]);
    setSemesters([]);

    if (!gradeLevel) return;

    setAcademicLoading(true);
    try {
      const data = await teacherSubscriptionService.adminAcademicSubjectsByClass(gradeLevel, selectedCountryId());
      setSubjects(data);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر جلب المواد المرتبطة بالصف');
    } finally {
      setAcademicLoading(false);
    }
  }

  async function handleSubjectChange(value: string) {
    const selectedSubject = subjects.find((item) => String(item.id) === value);

    setForm({
      ...form,
      subject_id: value,
      subject_name: selectedSubject?.subject_name || '',
      semester_id: '',
      semester_name: '',
    });
    setSemesters([]);

    if (!value) return;

    setAcademicLoading(true);
    try {
      const data = await teacherSubscriptionService.adminAcademicSemestersBySubject(value, selectedCountryId(), form.grade_level);
      setSemesters(data);
    } catch (error: any) {
      toast.error(error?.message || 'تعذر جلب الفصول الدراسية المرتبطة بالمادة');
    } finally {
      setAcademicLoading(false);
    }
  }

  function handleSemesterChange(value: string) {
    const selectedSemester = semesters.find((item) => String(item.id) === value);
    setForm({
      ...form,
      semester_id: value,
      semester_name: selectedSemester?.semester_name || '',
    });
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadClasses();
    setForm((previous) => ({
      ...previous,
      grade_level: '',
      grade_name: '',
      subject_id: '',
      subject_name: '',
      semester_id: '',
      semester_name: '',
    }));
    setSubjects([]);
    setSemesters([]);
  }, [filters.country]);

  async function upload() {
    if (!file) {
      toast.error('يرجى اختيار ملف للرفع');
      return;
    }
    if (!form.grade_level || !form.grade_name) {
      toast.error('يرجى اختيار الصف من القائمة');
      return;
    }
    if (!form.subject_id || !form.subject_name.trim()) {
      toast.error('يرجى اختيار المادة المرتبطة بالصف');
      return;
    }
    if (!form.semester_id || !form.semester_name.trim()) {
      toast.error('يرجى اختيار الفصل الدراسي');
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('country', filters.country);
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    const autoFileType = getSelectedFileType();
    if (autoFileType) data.append('file_type', autoFileType);

    setUploading(true);
    try {
      await teacherSubscriptionService.adminUploadPremiumVaultFile(data);
      toast.success('تم رفع ملف Premium الخاص بالمعلمين');
      setFile(null);
      setForm({
        title: '',
        description: '',
        grade_name: '',
        grade_level: '',
        subject_id: '',
        subject_name: '',
        semester_id: '',
        semester_name: '',
        category: 'exam',
          });
      setSubjects([]);
      setSemesters([]);
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر رفع الملف');
    } finally {
      setUploading(false);
    }
  }

  async function archiveFile(item: TeacherPremiumVaultFile) {
    const reason = window.prompt('سبب أرشفة الملف', '') || '';
    if (!window.confirm('هل تريد أرشفة هذا الملف؟ لن يظهر للمعلمين بعد الأرشفة.')) return;
    setSavingId(item.id);
    try {
      await teacherSubscriptionService.adminArchivePremiumVaultFile(item.id, reason, filters.country);
      toast.success('تمت أرشفة الملف');
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر أرشفة الملف');
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(item: TeacherPremiumVaultFile, active: boolean) {
    setSavingId(item.id);
    try {
      await teacherSubscriptionService.adminUpdatePremiumVaultFile(item.id, {
        country: filters.country,
        title: item.title,
        description: item.description,
        grade_level: item.grade_level,
        grade_name: item.grade_name,
        subject_id: item.subject_id,
        subject_name: item.subject_name,
        semester_id: item.semester_id,
        semester_name: item.semester_name,
        category: item.category,
        file_type: item.file_type,
        is_active: active,
      });
      toast.success(active ? 'تم تفعيل الملف' : 'تم إيقاف الملف');
      await load();
    } catch (error: any) {
      toast.error(error?.message || 'تعذر تحديث الملف');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">خزنة ملفات المعلمين Premium</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          هذه الملفات خاصة ومحفوظة في مسار غير عام، ولا يمكن تحميلها إلا عبر اشتراك معلم نشط ومطابقة المادة.
        </p>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-emerald-900 dark:text-emerald-100">
          <UploadCloud className="h-5 w-5" />
          رفع ملف Premium جديد
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none dark:border-emerald-900 dark:bg-slate-950" placeholder="عنوان الملف" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <select className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-emerald-900 dark:bg-slate-950" value={form.grade_level} onChange={(e) => handleClassChange(e.target.value)} disabled={academicLoading}>
            <option value="">اختر الصف من قاعدة البيانات</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.grade_name}</option>
            ))}
          </select>

          <select className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-emerald-900 dark:bg-slate-950" value={form.subject_id} onChange={(e) => handleSubjectChange(e.target.value)} disabled={!form.grade_level || academicLoading}>
            <option value="">اختر المادة المرتبطة بالصف</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.subject_name}</option>
            ))}
          </select>

          <select className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-emerald-900 dark:bg-slate-950" value={form.semester_id} onChange={(e) => handleSemesterChange(e.target.value)} disabled={!form.subject_id || academicLoading}>
            <option value="">اختر الفصل الدراسي</option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>{semester.semester_name}</option>
            ))}
          </select>

          <select className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-emerald-900 dark:bg-slate-950" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.filter((item) => item.value).map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </select>

          <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 dark:border-emerald-900 dark:bg-slate-950 dark:text-slate-200">
            نوع الملف: {getSelectedFileType() || 'يحدد تلقائيًا بعد اختيار الملف'}
          </div>

          <input className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none dark:border-emerald-900 dark:bg-slate-950 md:col-span-2" placeholder="وصف مختصر" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="file" className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none dark:border-emerald-900 dark:bg-slate-950" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>

        <button onClick={upload} disabled={uploading} className="mt-4 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60">
          {uploading ? 'جاري الرفع...' : 'رفع إلى خزنة المعلمين'}
        </button>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-5">
          <select value={filters.country} onChange={(event) => setFilters({ ...filters, country: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950">
            {countries.map((country) => <option key={country.value} value={country.value}>{country.label}</option>)}
          </select>
          <input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950" placeholder="بحث..." />
          <input value={filters.subject} onChange={(event) => setFilters({ ...filters, subject: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none dark:border-slate-800 dark:bg-slate-950" placeholder="المادة..." />
          <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950">
            {categories.map((category) => <option key={category.value || 'all'} value={category.value}>{category.label}</option>)}
          </select>
          <select value={filters.active} onChange={(event) => setFilters({ ...filters, active: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950">
            <option value="">كل الحالات</option>
            <option value="true">نشط</option>
            <option value="false">موقوف</option>
          </select>
        </div>
        <button onClick={load} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900">
          <Search className="h-4 w-4" />
          بحث وتحديث
        </button>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-600" /></div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm font-bold text-slate-500">لا توجد ملفات في خزنة المعلمين بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 dark:border-slate-800">
                  <th className="py-3">الملف</th>
                  <th>المادة</th>
                  <th>الصف</th>
                  <th>الفصل</th>
                  <th>التصنيف</th>
                  <th>التحميلات</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800">
                    <td className="py-4">
                      <div className="font-black text-slate-900 dark:text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.original_filename}</div>
                    </td>
                    <td>{item.subject_name}</td>
                    <td>{item.grade_name || '-'}</td>
                    <td>{item.semester_name || '-'}</td>
                    <td>{categories.find((c) => c.value === item.category)?.label || item.category}</td>
                    <td>{item.download_count}</td>
                    <td>{item.is_active ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700"><ShieldCheck className="h-3 w-3" />نشط</span> : <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700"><ShieldOff className="h-3 w-3" />موقوف</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`/dashboard/teacher-subscriptions/premium-files/${item.id}`} className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
                          تفاصيل
                        </a>
                        <button disabled={savingId === item.id} onClick={() => toggleActive(item, !item.is_active)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100">
                          {item.is_active ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button disabled={savingId === item.id} onClick={() => archiveFile(item)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
                          أرشفة
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
