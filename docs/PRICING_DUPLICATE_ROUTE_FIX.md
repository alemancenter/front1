# Pricing duplicate route fix

تم حذف المسار المكرر:
src/app/pricing/teacher/page.tsx

لأن المشروع يحتوي أصلًا على:
src/app/(main)/pricing/teacher/page.tsx

والمساران يخرجان لنفس الرابط /pricing/teacher في Next.js.
تم الحفاظ على صفحة التسويق الصحيحة داخل route group (main)، وإضافة روابط FAQ والسياسة إليها.
