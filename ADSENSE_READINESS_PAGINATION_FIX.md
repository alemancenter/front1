# AdSense Readiness Pagination Fix

## المشكلة
كانت صفحة `/dashboard/adsense-readiness` تعرض 30 عنصرًا فقط عند اختيار "الكل" لأن الباك اند كان يجلب صفحة واحدة من المقالات وصفحة واحدة من المنشورات ثم يحسب الملخص من هذه النتائج المحدودة فقط.

## الإصلاح
- إضافة pagination احترافي في الواجهة: `page`, `per_page` مع خيارات 50/100/200/500.
- عرض `from/to/total/last_page` داخل الواجهة.
- تحديث الباك اند ليحسب الملخص على كل المقالات والمنشورات المطابقة للفلاتر وليس على الصفحة الحالية فقط.
- تطبيق pagination بعد الفلترة والتقييم حتى تظهر كل النتائج عبر صفحات.

## المسارات المعدلة
- Frontend: `src/app/dashboard/adsense-readiness/page.tsx`
- Backend: `internal/handlers/contentaudit/handler.go`

## الاستخدام
افتح:

```txt
/dashboard/adsense-readiness
```

ثم اختر عدد العناصر في الصفحة وتصفح بين الصفحات حتى تصل لكل المحتوى.
