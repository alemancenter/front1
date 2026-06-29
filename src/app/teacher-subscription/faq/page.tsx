const faqs = [
  ['هل الاشتراك لمادة واحدة؟', 'نعم، الاشتراك مخصص لمادة المعلم الأساسية لضمان جودة الملفات وتخصصها.'],
  ['هل يمكن مشاركة الحساب؟', 'لا، الحساب مخصص لصاحب الاشتراك فقط، ويتم تتبع الأجهزة والتحميلات.'],
  ['هل الملفات عامة؟', 'لا، ملفات Premium محفوظة في خزنة خاصة ولا تظهر للعامة.'],
  ['هل يمكن تجديد الاشتراك؟', 'نعم، يمكن للإدارة تجديد الاشتراك لفصل جديد بعد الدفع والموافقة.'],
  ['هل توجد أدوات AI؟', 'نعم، توجد أدوات لإنشاء اختبارات، إجابات، أوراق عمل، خطط علاجية وتحليل محتوى.'],
];

export default function TeacherFAQPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-14" dir="rtl">
      <section className="mx-auto max-w-4xl px-4">
        <h1 className="text-3xl font-black text-slate-900">أسئلة شائعة حول اشتراك المعلم</h1>
        <div className="mt-8 space-y-4">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-black text-slate-900">{q}</h2>
              <p className="mt-2 text-slate-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
