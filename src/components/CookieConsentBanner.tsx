'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Shield, Check, ChevronLeft } from 'lucide-react';
import { applyConsent, rehydrateConsent, getStoredConsent } from '@/lib/cookie-consent';

type View = 'banner' | 'settings';

interface Category {
  id: 'analytics' | 'advertisement' | 'functional' | 'performance';
  label: string;
  description: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'analytics',
    label: 'الإحصاءات والتحليل',
    description: 'تساعدنا في فهم كيفية استخدام الزوار للموقع (Google Analytics).',
  },
  {
    id: 'advertisement',
    label: 'الإعلانات',
    description: 'تُستخدم لعرض إعلانات مناسبة لاهتماماتك (Google AdSense).',
  },
  {
    id: 'functional',
    label: 'وظيفية',
    description: 'تُحسّن تجربة الاستخدام كحفظ التفضيلات واللغة.',
  },
  {
    id: 'performance',
    label: 'الأداء',
    description: 'تُساعد في قياس سرعة الموقع وتحسين أدائه.',
  },
];

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [view, setView] = useState<View>('banner');
  const [custom, setCustom] = useState<Record<string, boolean>>({
    analytics: true,
    advertisement: true,
    functional: true,
    performance: true,
  });

  useEffect(() => {
    setMounted(true);
    const stored = getStoredConsent();
    if (stored) {
      rehydrateConsent();
    } else {
      setShow(true);
    }

    const handleReopen = () => {
      setView('banner');
      setShow(true);
    };
    window.addEventListener('openCookieConsent', handleReopen);
    return () => window.removeEventListener('openCookieConsent', handleReopen);
  }, []);

  if (!mounted || !show) return null;

  const handleAcceptAll = () => {
    applyConsent('accepted');
    setShow(false);
  };

  const handleRejectAll = () => {
    applyConsent('rejected');
    setShow(false);
  };

  const handleSaveCustom = () => {
    const selected = CATEGORIES.filter((c) => custom[c.id]).map((c) => c.id);
    const allSelected = selected.length === CATEGORIES.length;
    const noneSelected = selected.length === 0;
    applyConsent(
      allSelected ? 'accepted' : noneSelected ? 'rejected' : 'custom',
      ['necessary', ...selected] as any,
    );
    setShow(false);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="إعدادات ملفات تعريف الارتباط"
      style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      className="fixed inset-x-0 bottom-0 z-[2147483647] px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="relative z-[2147483647] mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 ring-1 ring-black/5">

        {/* ── Banner view ── */}
        {view === 'banner' && (
          <div className="p-4 sm:p-5">
            {/* Header row */}
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                🍪
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                نستخدم ملفات تعريف الارتباط (الكوكيز)
              </h2>
            </div>

            {/* Description */}
            <p className="mb-4 text-xs leading-relaxed text-slate-500 sm:text-sm sm:leading-7">
              نستخدم الكوكيز لتحسين تجربتك، وتحليل استخدام الموقع، وعرض إعلانات ملائمة. يمكنك
              الموافقة على الكل أو تخصيص اختياراتك. لمزيد من التفاصيل اطّلع على{' '}
              <Link
                href="/cookie-policy"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                سياسة الكوكيز
              </Link>{' '}
              و
              <Link
                href="/privacy-policy"
                className="me-1 font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
              >
                سياسة الخصوصية
              </Link>
              .
            </p>

            {/* Buttons — right-to-left order: accept → reject → customize */}
            <div className="flex flex-wrap-reverse items-center gap-2 sm:flex-wrap">
              <button
                onClick={() => setView('settings')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
              >
                <Shield className="h-3.5 w-3.5" />
                تخصيص
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:px-4 sm:text-sm"
              >
                رفض غير الضرورية
              </button>
              <button
                onClick={handleAcceptAll}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 sm:px-5 sm:text-sm"
              >
                قبول الكل
              </button>
            </div>
          </div>
        )}

        {/* ── Settings view ── */}
        {view === 'settings' && (
          <div className="flex flex-col divide-y divide-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">تخصيص إعدادات الكوكيز</h2>
              </div>
              <button
                onClick={() => setView('banner')}
                aria-label="رجوع"
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft className="h-3.5 w-3.5 rotate-180 rtl:rotate-0" />
                رجوع
              </button>
            </div>

            {/* Necessary — always on */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">ضرورية دائماً</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  مطلوبة لعمل الموقع الأساسي — لا يمكن تعطيلها.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                <Check className="h-3 w-3" />
                مفعّلة
              </span>
            </div>

            {/* Optional categories */}
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3 sm:px-5">
                <div className="min-w-0 flex-1 pe-4">
                  <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{cat.description}</p>
                </div>
                <button
                  role="switch"
                  dir="ltr"
                  aria-checked={custom[cat.id]}
                  onClick={() =>
                    setCustom((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    custom[cat.id] ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      custom[cat.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-5">
              <button
                onClick={handleAcceptAll}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                قبول الكل
              </button>
              <button
                onClick={handleSaveCustom}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                حفظ اختياراتي
              </button>
              <button
                onClick={handleRejectAll}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                رفض الكل
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
