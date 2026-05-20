'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from '@/lib/motion-lite';
import { 
  Search as SearchIcon, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Filter, 
  ArrowLeft,
  Calendar,
  Layers,
  FileQuestion,
  Book,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import AnimatedSection from '@/components/ui/AnimatedSection';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'article' | 'lesson';
  description?: string;
  url: string;
  date: string;
}

async function readSearchJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Search endpoint returned ${response.status} ${response.statusText || 'non-JSON response'}`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Search endpoint failed with ${response.status}`);
  }

  return data;
}

// Helper for random-like consistent colors
const getCardColor = (index: number) => {
  const colors = [
    { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-200', hover: 'hover:border-blue-300' },
    { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-200', hover: 'hover:border-purple-300' },
    { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-200', hover: 'hover:border-green-300' },
    { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-200', hover: 'hover:border-orange-300' },
    { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-200', hover: 'hover:border-red-300' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-200', hover: 'hover:border-indigo-300' },
    { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-200', hover: 'hover:border-teal-300' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500', border: 'border-fuchsia-200', hover: 'hover:border-fuchsia-300' },
  ];
  return colors[index % colors.length];
};

function SearchHeader({
  resultCount,
  criteriaList
}: {
  resultCount: number | null,
  criteriaList: { label: string, value: string }[]
}) {
  return (
    <section className="relative overflow-hidden border-b border-blue-100/70 bg-gradient-to-br from-white via-blue-50/70 to-slate-50 pt-28 pb-16 md:pt-32 md:pb-20" dir="rtl">
      <div className="absolute inset-0 pointer-events-none opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.10)_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm"
          >
            <SearchIcon className="h-4 w-4" />
            البحث التعليمي
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black leading-[1.25] tracking-tight text-slate-950 md:text-5xl"
          >
            نتائج البحث
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 md:text-lg"
          >
            {resultCount !== null
              ? `تم العثور على ${resultCount} نتيجة مطابقة لبحثك`
              : 'جاري البحث في المصادر التعليمية...'
            }
          </motion.div>

          {criteriaList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-wrap justify-center gap-3"
            >
              {criteriaList.map((criteria, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-4 py-2 text-sm text-slate-700 shadow-sm"
                >
                  <span className="text-slate-400">{criteria.label}:</span>
                  <span className="font-black text-blue-700">{criteria.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classId = searchParams.get('class');
  const subjectId = searchParams.get('subject');
  const semester = searchParams.get('semester');
  const fileType = searchParams.get('type');
  const query = searchParams.get('q');

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (classId) params.append('class', classId);
        if (subjectId) params.append('subject', subjectId);
        if (semester) params.append('semester', semester);
        if (fileType) params.append('type', fileType);
        if (query) params.append('q', query);

        const response = await fetch(`/api/search?${params.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await readSearchJson(response);
        
        if (data.success) {
          setResults(data.results);
        } else {
          setError(data.error || 'حدث خطأ أثناء البحث');
        }
        
      } catch (err) {
        setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [classId, subjectId, semester, fileType, query]);

  const getSearchCriteria = () => {
    const criteria = [];
    if (classId) criteria.push({ label: 'الصف', value: classId });
    if (subjectId) criteria.push({ label: 'المادة', value: subjectId });
    if (semester) criteria.push({ label: 'الفصل', value: semester });
    if (fileType) criteria.push({ label: 'النوع', value: fileType });
    if (query) criteria.push({ label: 'بحث', value: query });
    return criteria;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'lesson': return <GraduationCap className="w-6 h-6" />;
      case 'article': return <BookOpen className="w-6 h-6" />;
      case 'post': return <FileText className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const criteriaList = getSearchCriteria();

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchHeader resultCount={isLoading ? null : results.length} criteriaList={criteriaList} />

      <div className="container mx-auto px-4 py-12 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <AnimatedSection delay={0.2} className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800">تصفية النتائج</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">نوع الملف</label>
                  <div className="space-y-2">
                    {[
                      { id: 'plan', label: 'الخطط الدراسية', icon: FileText },
                      { id: 'worksheet', label: 'أوراق العمل', icon: FileCheck },
                      { id: 'exam', label: 'الاختبارات', icon: FileQuestion },
                      { id: 'book', label: 'الكتب المدرسية', icon: Book }
                    ].map((type) => (
                      <Link 
                        key={type.id} 
                        href={`/search?${new URLSearchParams({
                            ...(classId && {class: classId}),
                            ...(subjectId && {subject: subjectId}),
                            ...(semester && {semester: semester}),
                            ...(query && {q: query}),
                            type: type.id
                        }).toString()}`}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                          fileType === type.id 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <type.icon className={`w-4 h-4 ${fileType === type.id ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium">{type.label}</span>
                        {fileType === type.id && <div className="mr-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            <AnimatedSection delay={0.3}>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg animate-pulse h-48">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                          <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
                          <div className="h-3 bg-slate-100 rounded-lg w-full mt-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-red-100 p-12 text-center shadow-lg">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">عذراً، حدث خطأ</h3>
                  <p className="text-slate-600 mb-6">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-lg shadow-red-500/20"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-12 text-center shadow-lg">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                    <SearchIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد نتائج</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    لم نتمكن من العثور على أي نتائج تطابق معايير البحث الخاصة بك. حاول تغيير معايير البحث أو استخدام كلمات مفتاحية مختلفة.
                  </p>
                  <Link 
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    العودة للصفحة الرئيسية
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((result, index) => {
                    const color = getCardColor(index);
                    return (
                      <Link
                        key={result.id}
                        href={result.url}
                        className={`group block p-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-100/50 ${color.hover} shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${color.bg} ${color.text} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            {getIconForType(result.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {result.title}
                            </h3>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                              {result.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4 mt-auto">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {result.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" />
                                {result.type === 'lesson' ? 'درس' : result.type === 'article' ? 'مقال' : 'منشور'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
