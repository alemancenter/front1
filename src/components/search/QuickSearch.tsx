'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Calendar, FileText, School, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from '@/lib/motion-lite';
import { useSearch } from '@/hooks/useSearch';
import { useCountryStore } from '@/store/useStore';
import { schoolClassesService, apiClient, API_ENDPOINTS } from '@/lib/api/services';
import { cn } from '@/lib/utils';

interface QuickSearchProps {
  onSearch?: () => void;
  className?: string;
  showTitle?: boolean;
  variant?: 'default' | 'premium';
}

interface Option {
  id: string;
  name: string;
}

export default function QuickSearch({ onSearch, className, showTitle = true, variant = 'default' }: QuickSearchProps) {
  const router = useRouter();
  const { quickSearch, performSearch, isSearching, error } = useSearch();
  const { country } = useCountryStore();
  
  const [keyword, setKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('');

  const [classes, setClasses] = useState<Option[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [semesters, setSemesters] = useState<Option[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!country.id) return;
      setIsLoadingClasses(true);
      try {
        const data = await schoolClassesService.getPublicAll(country.id);
        if (Array.isArray(data)) {
          setClasses(data.map((item: any) => ({
            id: String(item.id),
            name: item.grade_name || item.name
          })));
        }
      } catch {
        // Keep the search usable even if this optional request fails.
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [country.id]);

  useEffect(() => {
    if (!selectedClass) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const data = await schoolClassesService.getPublicById(selectedClass);
        if (data && Array.isArray(data.subjects)) {
          setSubjects(data.subjects.map((item: any) => ({
            id: String(item.id),
            name: item.subject_name || item.name || item.title || item.label || 'مادة بدون اسم'
          })));
        } else {
          setSubjects([]);
        }
      } catch {
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedSubject) {
      setSemesters([]);
      setSelectedSemester('');
      return;
    }

    const fetchSemesters = async () => {
      setIsLoadingSemesters(true);
      try {
        const response = await apiClient.get<any>(
          API_ENDPOINTS.FILTER.SEMESTERS_BY_SUBJECT(selectedSubject),
          { database: country.code }
        );
        const data = response.data;
        let semestersList: any[] = [];
        if (Array.isArray(data)) semestersList = data;
        else if (data?.data?.semesters) semestersList = data.data.semesters;
        else if (Array.isArray(data?.data)) semestersList = data.data;
        else if (data?.semesters) semestersList = data.semesters;

        setSemesters(semestersList.map((item: any) => ({
          id: String(item.id),
          name: item.semester_name || item.name || item.title || item.label || `فصل دراسي ${item.id}`
        })));
      } catch {
        setSemesters([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    fetchSemesters();
  }, [selectedSubject, country.code]);

  const fileTypes = [
    { id: 'plan', name: 'خطط الدراسة' },
    { id: 'analysis', name: 'تحليل المحتوى' },
    { id: 'exam', name: 'اختبارات' },
    { id: 'book', name: 'كتب ودوسيات' },
    { id: 'worksheet', name: 'أوراق عمل' },
  ];

  const handleSearch = () => {
    const params = {
      classId: selectedClass,
      subjectId: selectedSubject,
      semester: selectedSemester,
      fileType: selectedFileType,
      keyword: keyword.trim(),
    };

    if (isSearchDisabled) {
      router.push('/search');
      onSearch?.();
      return;
    }

    if (params.keyword) performSearch(params);
    else quickSearch(params);
    onSearch?.();
  };

  const isSearchDisabled = !keyword.trim() && !selectedClass && !selectedSubject && !selectedSemester && !selectedFileType;

  if (variant === 'premium') {
    const selectClass = 'h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400';

    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cn('text-slate-900', className)}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[2.2fr_1fr_1fr_1fr_1fr_64px_128px] xl:items-center">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              name="keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="ابحث عن درس، ملف، ملخص أو اختبار..."
              className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm font-black text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select name="field-components-search-quicksearch-176-2" aria-label="اختر الصف" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)} disabled={isLoadingClasses} className={selectClass}>
            <option value="">{isLoadingClasses ? 'جاري التحميل...' : 'اختر الصف'}</option>
            {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>

          <select name="field-components-search-quicksearch-181-3" aria-label="نوع المحتوى" value={selectedFileType} onChange={(event) => setSelectedFileType(event.target.value)} className={selectClass}>
            <option value="">نوع المحتوى</option>
            {fileTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>

          <select name="field-components-search-quicksearch-186-4" aria-label="ترتيب النتائج" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} disabled={!selectedClass || isLoadingSubjects} className={selectClass}>
            <option value="">{isLoadingSubjects ? 'جاري التحميل...' : 'المادة'}</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>

          <select name="field-components-search-quicksearch-191-5" aria-label="الفصل الدراسي" value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)} disabled={!selectedSubject || isLoadingSemesters} className={selectClass}>
            <option value="">{isLoadingSemesters ? 'جاري التحميل...' : 'الفصل الدراسي'}</option>
            {semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
          </select>

          <button
            type="button"
            aria-label="اقتراحات ذكية"
            className="hidden h-14 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm transition hover:bg-blue-100 xl:inline-flex"
          >
            <Sparkles className="h-6 w-6" />
          </button>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-wait disabled:bg-blue-400"
          >
            <Search className="h-5 w-5" />
            {isSearching ? 'بحث...' : 'بحث'}
          </button>
        </div>

        {error && <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600">{error}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cn('bg-card rounded-2xl shadow-lg border border-border p-6 text-foreground', className)}>
      {showTitle && (
        <div className="mb-6 flex items-center justify-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold text-center text-foreground">بحث سريع</h3>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-2"><School className="w-6 h-6" /></div>
          <select id="qs-class" name="classId" aria-label="اختر الصف" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={isLoadingClasses} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-green-500/30 focus:border-green-500 disabled:bg-muted disabled:text-muted-foreground">
            <option value="">{isLoadingClasses ? 'جاري التحميل...' : 'اختر صف'}</option>
            {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-2"><BookOpen className="w-6 h-6" /></div>
          <select id="qs-subject" name="subjectId" aria-label="اختر المادة" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedClass || isLoadingSubjects} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-muted disabled:text-muted-foreground">
            <option value="">{isLoadingSubjects ? 'جاري التحميل...' : 'اختر المادة'}</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mx-auto mb-2"><Calendar className="w-6 h-6" /></div>
          <select id="qs-semester" name="semesterId" aria-label="اختر الفصل الدراسي" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} disabled={!selectedSubject || isLoadingSemesters} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 disabled:bg-muted disabled:text-muted-foreground">
            <option value="">{isLoadingSemesters ? 'جاري التحميل...' : 'اختر فصل دراسي'}</option>
            {semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
          </select>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-2"><FileText className="w-6 h-6" /></div>
          <select id="qs-file-type" name="fileType" aria-label="تصنيف الملف" value={selectedFileType} onChange={(e) => setSelectedFileType(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500">
            <option value="">تصنيف الملف</option>
            {fileTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm text-center">{error}</div>}

      <div className="text-center">
        <button onClick={handleSearch} disabled={isSearchDisabled || isSearching} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center mx-auto gap-2">
          <Search className="w-5 h-5" />
          {isSearching ? 'جاري البحث...' : 'ابحث الآن'}
        </button>
        {isSearchDisabled && <p className="text-sm text-muted-foreground mt-3">اختر على الأقل خيار واحد للبحث</p>}
      </div>
    </motion.div>
  );
}
