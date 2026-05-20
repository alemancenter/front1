# AdSense Fix Report

تاريخ التنفيذ: 2026-05-20

## الهدف
رفع جاهزية موقع Alemancenter لقبول Google AdSense عبر إصلاح الثقة، التنقل، تجربة التحميل، سياسات الفهرسة، وقوالب المحتوى قبل الدخول في تحرير 2000+ مقال ومنشور يدويًا.

## إصلاحات الفرنت اند

- إضافة صفحة `/copyright` لحقوق الملكية وطلبات الإزالة.
- إضافة صفحة `/editorial-policy` لسياسة التحرير والمراجعة.
- إضافة الصفحات القانونية الجديدة إلى `sitemap.ts`.
- تحديث `robots.txt` لمنع صفحات التحميل الخدمية من الفهرسة.
- إزالة روابط App Store / Google Play غير الجاهزة من الفوتر واستبدالها ببلوك ثقة قانوني.
- إصلاح fallback اسم الموقع في صفحة من نحن وشروط الاستخدام لمنع ظهور نصوص ناقصة.
- تحويل صفحة `/download/[fileId]` إلى صفحة خدمية `noindex, follow` وإزالة أماكن AdSense منها.
- جعل canonical لصفحة التحميل يشير إلى المقال/المنشور الأصلي عند توفره.
- إضافة helper مركزي `src/lib/adsense-readiness.ts` لتقييم جاهزية الصفحة للإعلانات والفهرسة.
- تطبيق noindex ديناميكي على المقالات والمنشورات الضعيفة جدًا حسب score.
- منع الإعلانات داخل المقال/المنشور إلا إذا تجاوز المحتوى حد الجاهزية الآمن.
- تحسين قالب المقال بإضافة بطاقة معلومات تعليمية قبل التحميل.
- تحسين قالب المنشور بإضافة قسم واضح قبل المحتوى أو المرفقات.
- تعديل نصوص المرفقات حتى لا تظهر كتجربة تحميل مضللة.
- تحويل قسم الخدمات من خدمات رقمية عامة إلى خدمات تعليمية مناسبة لهوية الموقع.
- إضافة صفحة Dashboard جديدة `/dashboard/adsense-readiness` لعرض الصفحات الضعيفة والجاهزة.
- إضافة رابط جاهزية AdSense داخل Sidebar تحت قسم الأمان والمراقبة.

## إصلاحات الباك اند

- إضافة endpoint جديد:

```txt
GET /api/dashboard/content-audit/adsense-readiness
```

- endpoint يدعم:

```txt
type=all|article|post
level=ready|review|weak
q=search text
page
limit
country
```

- التقرير يرجع:

```txt
summary
items[]
score
level
word_count
char_count
files_count
should_index
should_show_ads
issues[]
url
```

## ملاحظات تشغيل

لم يتم تشغيل فحص npm نهائي داخل بيئة الفحص بسبب فشل registry/cache الخاص بحزم npm داخل sandbox، وليس بسبب خطأ كود ظاهر. كما لم يتم تشغيل Go tests لأن المشروع يطلب Go 1.25 والبيئة تحتوي Go 1.23.2 ولا يمكن تحميل toolchain من الإنترنت.

## أوامر التحقق على السيرفر

### Frontend

```bash
cd /var/www/vhosts/alemancenter.com/httpdocs
npm ci --no-audit --no-fund
npm run lint
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build
```

### Backend

```bash
cd /var/www/vhosts/alemancenter.com/api
/usr/local/go/bin/go version
go test ./...
go build ./cmd/server
```

إذا كان السيرفر يستخدم Go أقل من 1.25، ثبّت Go 1.25 أو عدّل toolchain بما يناسب بيئة الإنتاج.
