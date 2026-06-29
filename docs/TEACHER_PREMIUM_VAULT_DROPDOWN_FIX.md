# Teacher Premium Vault Dropdown Fix

## ما تم إصلاحه
- إصلاح رفع FormData داخل apiClient حتى لا يتحول الملف إلى JSON.
- صفحة خزنة ملفات Premium أصبحت تستخدم قوائم منسدلة:
  - الصفوف من قاعدة البيانات
  - المواد حسب الصف
  - الفصول الدراسية حسب المادة
- عند الرفع يتم إرسال:
  - grade_level
  - grade_name
  - subject_id
  - subject_name
  - semester_id
  - semester_name

## المسار
/dashboard/teacher-subscriptions/premium-files
