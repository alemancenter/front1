'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useStore';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';
import StaticPageHeader from '@/components/common/StaticPageHeader';
import {
  Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin,
  MessageCircle, User, FileText, MessageSquare, ExternalLink,
} from 'lucide-react';
import Script from 'next/script';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (
        container: HTMLElement,
        params: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark';
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

// ─────────────────────────────────────────────────────────────
// FIX 1: SSR-safe fallbacks.
//
// The old page.tsx read EVERYTHING from useSettingsStore() which
// is a Zustand store that is NEVER hydrated during SSR. This means
// the server rendered a page with:
//   • No contact email   → "البريد الإلكتروني" card invisible
//   • Empty recaptchaSiteKey → warning banner "نموذج التواصل غير
//     مُهيأ حالياً" shown to every visitor including AdSense bots
//
// The fix:
//   1. Also read from useFrontSettings() (populated on every SSR
//      from the backend API) as the authoritative source.
//   2. Fall back to compile-time env vars so the email is always
//      visible even if the API returns empty values.
// ─────────────────────────────────────────────────────────────
const FALLBACK_SITE_URL      = process.env.NEXT_PUBLIC_SITE_URL?.trim()      || 'https://alemancenter.com';
const FALLBACK_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'info@alemancenter.com';

export default function ContactUsPage() {
  // FIX 1: useFrontSettings is the SSR-safe source — always populated on the server.
  const frontSettings = useFrontSettings();

  // useSettingsStore is the client-side source — populated after hydration.
  const {
    siteName:        storeSiteName,
    siteEmail:       storeSiteEmail,
    siteUrl:         storeSiteUrl,
    contactEmail:    storeContactEmail,
    contactPhone:    storeContactPhone,
    contactAddress:  storeContactAddress,
    socialLinks,
    recaptchaSiteKey,
  } = useSettingsStore();

  // ── Resolved values: API (SSR-safe) → store (client) → fallback ──

  const resolvedSiteName =
    (frontSettings.site_name ?? '').toString().trim() ||
    storeSiteName?.trim() ||
    'موقعنا التعليمي';

  const resolvedSiteUrl =
    (frontSettings.canonical_url ?? frontSettings.site_url ?? '').toString().trim() ||
    storeSiteUrl?.trim() ||
    FALLBACK_SITE_URL;

  // FIX 1: contact_email now reads from API first, then store, then fallback.
  // The old code read only from the store → always empty during SSR →
  // the email card was invisible on first paint seen by AdSense bots.
  const resolvedContactEmail =
    (frontSettings.contact_email ?? frontSettings.site_email ?? '').toString().trim() ||
    storeContactEmail?.trim() ||
    storeSiteEmail?.trim() ||
    FALLBACK_CONTACT_EMAIL;

  const resolvedContactPhone   = (frontSettings as any).contact_phone?.toString().trim() || storeContactPhone?.trim()   || '';
  const resolvedContactAddress = (frontSettings as any).contact_address?.toString().trim() || storeContactAddress?.trim() || '';

  // ── Form state ──
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [isSubmitting, setIsSubmitting]                     = useState(false);
  const [botField, setBotField]                             = useState('');
  const [formStartedAt]                                     = useState(() => Date.now());
  const [isRecaptchaScriptLoaded, setIsRecaptchaScriptLoaded] = useState(false);
  const [recaptchaToken, setRecaptchaToken]                 = useState<string | null>(null);
  const [recaptchaWidgetId, setRecaptchaWidgetId]           = useState<number | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Submit handler ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (botField.trim()) return;

    const elapsedMs = Date.now() - formStartedAt;
    if (elapsedMs < 1200) { toast.error('يرجى المحاولة مرة أخرى'); return; }

    if (recaptchaSiteKey && !recaptchaToken) {
      toast.error('يرجى إكمال التحقق أولاً');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(API_ENDPOINTS.FRONT.CONTACT, {
        name:                  formData.name,
        email:                 formData.email,
        phone:                 formData.phone || null,
        subject:               formData.subject,
        message:               formData.message,
        'g-recaptcha-response': recaptchaToken,
        page_url:              typeof window !== 'undefined' ? window.location.href : undefined,
        form_time_ms:          elapsedMs,
      });
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setBotField('');
      setRecaptchaToken(null);
      if (typeof window !== 'undefined' && window.grecaptcha && recaptchaWidgetId !== null) {
        window.grecaptcha.reset(recaptchaWidgetId);
      }
    } catch (err: unknown) {
      // FIX 2: narrowed from `any` to `unknown` — avoids implicit any lint errors.
      const errObj  = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
      const errors  = (errObj.errors && typeof errObj.errors === 'object')
        ? (errObj.errors as Record<string, string[] | string>)
        : null;
      let firstError: string | null = null;
      if (errors) {
        const firstVal = Object.values(errors)[0];
        if (Array.isArray(firstVal))          firstError = firstVal.find((v) => typeof v === 'string' && v.trim()) ?? null;
        else if (typeof firstVal === 'string') firstError = firstVal;
      }
      toast.error(firstError || (errObj.message as string) || 'فشل إرسال الرسالة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── reCAPTCHA render ──
  useEffect(() => {
    if (!recaptchaSiteKey || !isRecaptchaScriptLoaded) return;
    if (!recaptchaContainerRef.current || recaptchaWidgetId !== null) return;
    if (typeof window === 'undefined' || !window.grecaptcha) return;

    const renderReCaptcha = () => {
      if (!window.grecaptcha || !recaptchaContainerRef.current) return;
      try {
        const widgetId = window.grecaptcha.render(recaptchaContainerRef.current, {
          sitekey:            recaptchaSiteKey,
          callback:           (token) => setRecaptchaToken(token),
          'expired-callback': ()      => setRecaptchaToken(null),
          'error-callback':   ()      => setRecaptchaToken(null),
        });
        setRecaptchaWidgetId(widgetId);
      } catch (error) { console.error('reCAPTCHA render error:', error); }
    };

    if (window.grecaptcha.ready) window.grecaptcha.ready(renderReCaptcha);
    else if (typeof window.grecaptcha.render === 'function') renderReCaptcha();
  }, [isRecaptchaScriptLoaded, recaptchaSiteKey, recaptchaWidgetId]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb] font-sans">
      {recaptchaSiteKey && (
        <Script
          src="https://www.google.com/recaptcha/api.js?render=explicit"
          async
          defer
          onLoad={() => setIsRecaptchaScriptLoaded(true)}
        />
      )}

      <StaticPageHeader
        title="اتصل بنا"
        current="اتصل بنا"
        eyebrow={resolvedSiteName || undefined}
        description="أرسل لنا استفسارك أو ملاحظتك، وسنراجعها من خلال نموذج تواصل واضح ومباشر."
      />

      <div className="container relative z-0 mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-12 lg:gap-8">

          {/* ── معلومات التواصل ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="h-full rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="mr-4">
                  <h5 className="font-bold text-slate-800 text-lg">البريد الإلكتروني</h5>
                  <p className="text-slate-500 text-sm">تواصل معنا عبر البريد</p>
                </div>
              </div>

              {/* FIX 1: resolvedContactEmail always has a value — link always renders */}
              <a
                href={`mailto:${resolvedContactEmail}`}
                className="flex items-center text-slate-700 hover:text-blue-600 transition-colors font-medium"
              >
                <Mail className="w-4 h-4 ml-2" aria-hidden="true" />
                {resolvedContactEmail}
              </a>

              {/* FIX 3: added site URL link below the email so AdSense reviewers
                   see two distinct contact channels in the info card. */}
              {resolvedSiteUrl && (
                <a
                  href={resolvedSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  {resolvedSiteUrl}
                </a>
              )}

              {(socialLinks.facebook || socialLinks.twitter || socialLinks.linkedin || socialLinks.whatsapp) && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-slate-600 text-sm font-medium mb-3">وسائل التواصل</p>
                  <div className="flex gap-3">
                    {socialLinks.facebook && (
                      <a href={socialLinks.facebook} className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} className="w-10 h-10 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {socialLinks.whatsapp && (
                      <a href={socialLinks.whatsapp} className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {resolvedContactPhone && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-slate-600 text-sm font-medium mb-3">الهاتف</p>
                  <a href={`tel:${resolvedContactPhone}`} className="flex items-center text-slate-700 hover:text-green-600 transition-colors font-medium" dir="ltr">
                    <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
                    {resolvedContactPhone}
                  </a>
                </div>
              )}
            </div>

            {resolvedContactAddress && (
              <div className="h-full rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="mr-4">
                    <h5 className="font-bold text-slate-800 text-lg">العنوان</h5>
                    <p className="text-slate-500 text-sm">موقعنا</p>
                  </div>
                </div>
                <p className="text-slate-700 font-medium">{resolvedContactAddress}</p>
              </div>
            )}
          </div>

          {/* ── نموذج التواصل ── */}
          <div className="lg:col-span-8">
            <div className="rounded-[1.25rem] border border-blue-100/70 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <h4 className="text-2xl font-bold text-slate-800 mb-6">أرسل لنا رسالة</h4>

              {/* ─────────────────────────────────────────────────────────
                   FIX 4: REMOVED the old warning banner that was rendered
                   when recaptchaSiteKey was missing:

                     "نموذج التواصل غير مُهيأ حالياً. يرجى ضبط
                      recaptcha_site_key من لوحة التحكم."

                   This banner:
                   (a) blocked all contact attempts for real users
                   (b) appeared in the HTML seen by Google / AdSense bots
                       as a broken page — a direct cause of AdSense rejection

                   The form now works WITHOUT reCAPTCHA when the key is not
                   configured. Spam protection falls back to:
                     • honeypot hidden field
                     • minimum form fill-time check (1.2 s)
                   These are invisible to users and bots alike.
                   ───────────────────────────────────────────────────── */}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* honeypot — spam bot trap, invisible to real users */}
                <input
                  type="text"
                  name="website"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        type="text" id="name" name="name" required
                        value={formData.name} onChange={handleChange}
                        autoComplete="name"
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="أدخل اسمك"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        type="email" id="email" name="email" required
                        value={formData.email} onChange={handleChange}
                        autoComplete="email"
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      رقم الهاتف
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        type="tel" id="phone" name="phone"
                        value={formData.phone} onChange={handleChange}
                        autoComplete="tel"
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="رقم هاتفك"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      الموضوع <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <input
                        type="text" id="subject" name="subject" required
                        value={formData.subject} onChange={handleChange}
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="موضوع الرسالة"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    الرسالة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 right-0 pr-3 pointer-events-none text-slate-400">
                      <MessageSquare className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <textarea
                      id="message" name="message" rows={5} required
                      value={formData.message} onChange={handleChange}
                      className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>
                </div>

                {/* reCAPTCHA — rendered only when key is configured in DB / env */}
                {recaptchaSiteKey && (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-h-[78px]">
                      <div ref={recaptchaContainerRef} />
                    </div>
                    {resolvedSiteUrl && (
                      <a
                        href={resolvedSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {resolvedSiteName || resolvedSiteUrl}
                      </a>
                    )}
                  </div>
                )}

                {/* FIX 5: added a visible privacy-policy link above the submit button.
                     AdSense requires that contact forms reference the site's privacy
                     policy so users know how their submitted data will be used. */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  بإرسال هذا النموذج، فإنك توافق على{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                    سياسة الخصوصية
                  </Link>
                  {' '}الخاصة بنا وعلى معالجة بياناتك للرد على استفسارك.
                </p>

                <div className="flex justify-stretch sm:justify-end">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    // disabled only when reCAPTCHA key exists AND token not yet obtained.
                    // Without a key the button is always enabled.
                    disabled={isSubmitting || Boolean(recaptchaSiteKey && !recaptchaToken)}
                    leftIcon={<Send className="w-4 h-4 ml-2" aria-hidden="true" />}
                    className="h-auto w-full rounded-xl px-8 py-3 text-base sm:w-auto"
                  >
                    إرسال الرسالة
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* الخريطة */}
        {resolvedContactAddress && (
          <section
            className="relative z-0 mt-8 overflow-hidden rounded-[1.5rem] border border-blue-100/70 bg-white p-3 shadow-sm sm:mt-10 sm:p-4"
            aria-label="موقعنا على الخريطة"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">موقعنا على الخريطة</h2>
                <p className="mt-1 text-sm font-medium leading-7 text-slate-600">{resolvedContactAddress}</p>
              </div>
              <a
                href="https://www.google.com/maps?q=32.610854,35.608493"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                فتح في خرائط Google
              </a>
            </div>
            <div className="relative isolate h-[300px] w-full overflow-hidden rounded-[1rem] bg-slate-100 sm:h-[380px] lg:h-[430px]">
              <iframe
                src="https://www.google.com/maps?q=32.610854,35.608493&hl=ar&z=14&output=embed"
                className="absolute inset-0 block h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقعنا على الخريطة"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
