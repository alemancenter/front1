نسخة نهائية كاملة لرفيق المنصة:
- شكل رفيق المنصة المتحرك.
- تلميحات حسب الصفحة login/register/verify/download/search/article/class.
- صندوق دردشة صغير وثابت.
- صور thumbnails صغيرة ومعاينة داخل صندوق الشات فقط.
- ClientOnlyChatbotWidget بدون next/dynamic لتجنب Turbopack module factory.
- منع SSR rendering عبر mounted guard.

Patched files:
- src/app/(auth)/AuthLayoutClient.tsx
- src/app/(main)/layout.tsx
