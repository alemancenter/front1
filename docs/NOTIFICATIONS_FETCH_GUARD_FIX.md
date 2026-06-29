# Notifications Fetch Guard Fix

تم إصلاح ضجيج Failed to fetch notifications:
- عند 403/404 يتم إيقاف polling للإشعارات في نفس الجلسة.
- عند فشل الشبكة يتم تطبيق cooldown تدريجي بدل تكرار الطلبات كل فترة قصيرة.
- لا يتم طباعة console.error متكرر.
- getLatest يستخدم no-store و retries=0 و timeout قصير.
