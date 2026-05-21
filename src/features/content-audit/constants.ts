export const riskLabels: Record<string, string> = {
  sexual_content: "محتوى جنسي",
  violence: "عنف",
  hate: "كراهية",
  gambling: "مقامرة",
  drugs_or_medicine: "أدوية أو مخدرات",
  unsafe_markup: "كود غير آمن",
  dangerous_external_link: "رابط خارجي خطر",
  macro_file: "ملف Macro",
  thin_content: "محتوى قصير",
  empty_file: "ملف فارغ",
  empty_category: "تصنيف فارغ",
};

export const typeLabels: Record<string, string> = {
  article: "مقال",
  post: "منشور",
  comment: "تعليق",
  file: "ملف",
  category: "تصنيف",
};

export const riskOptions = [
  { value: "", label: "كل المخاطر" },
  { value: "sexual_content", label: "محتوى جنسي" },
  { value: "violence", label: "عنف" },
  { value: "hate", label: "كراهية" },
  { value: "gambling", label: "مقامرة" },
  { value: "drugs_or_medicine", label: "أدوية أو مخدرات" },
  { value: "unsafe_markup", label: "كود غير آمن" },
  { value: "dangerous_external_link", label: "رابط خارجي خطر" },
  { value: "macro_file", label: "ملف Macro" },
  { value: "thin_content", label: "محتوى قصير" },
] as const;

export const typeOptions = [
  { value: "", label: "كل الأنواع" },
  { value: "article", label: "المقالات" },
  { value: "post", label: "المنشورات" },
  { value: "comment", label: "التعليقات" },
  { value: "file", label: "الملفات" },
  { value: "category", label: "التصنيفات" },
] as const;
