'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  MessageCircle,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ExternalLink,
  RotateCcw,
  ImageIcon,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  chatbotService,
  ChatbotAction,
  ChatbotContentLink,
  ChatbotHelpMedia,
} from '@/lib/api/services/chatbot';
import { getRafiqHint, RafiqHint } from './assistantHints';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  links?: ChatbotContentLink[];
  actions?: ChatbotAction[];
  suggestions?: string[];
  helpMedia?: ChatbotHelpMedia[];
  messageId?: number;
  aiUsed?: boolean;
  aiModel?: string;
}

const GUEST_KEY = 'alemancenter_chatbot_guest_id';
const SESSION_KEY = 'alemancenter_chatbot_session_id';
const RAFIQ_DISMISS_KEY = 'alemancenter_rafiq_dismiss_until';
const DISMISS_MS = 6 * 60 * 60 * 1000;

const RAFIQ_SOUND_KEY_PREFIX = 'alemancenter_rafiq_sound_played';

function shouldPlayRafiqSound(pathname: string) {
  const path = pathname.toLowerCase();
  return (
    path === '/' ||
    /^\/(jo|sa|eg|ps)?\/?$/.test(path) ||
    path.includes('/login') ||
    path.includes('/register') ||
    path.includes('/signup')
  );
}

function playRafiqSoftClick() {
  try {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const now = audioContext.currentTime;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    gain.connect(audioContext.destination);

    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.15);

    window.setTimeout(() => {
      void audioContext.close().catch(() => undefined);
    }, 280);
  } catch {
    // Browsers may block audio before user interaction. Ignore safely.
  }
}

function tryPlayRafiqAppearSound(pathname: string) {
  if (typeof window === 'undefined') return;
  if (!shouldPlayRafiqSound(pathname)) return;

  const soundKey = `${RAFIQ_SOUND_KEY_PREFIX}:${pathname || '/'}`;
  if (window.localStorage.getItem(soundKey) === '1') return;

  window.localStorage.setItem(soundKey, '1');
  window.setTimeout(playRafiqSoftClick, 350);
}



const EMAIL_HELP_MEDIA: ChatbotHelpMedia[] = [
  {
    title: 'لماذا لا تصل رسالة التفعيل؟',
    image_url: '/assets/chatbot/verification-why-no-message.png',
    caption: 'أسباب شائعة مثل كتابة البريد بشكل خاطئ، استخدام بريد قديم، أو امتلاء صندوق البريد.',
  },
  {
    title: 'خطوات تفعيل البريد بشكل صحيح',
    image_url: '/assets/chatbot/verification-steps.png',
    caption: 'افتح الرسالة واضغط على رابط تأكيد البريد الإلكتروني داخلها.',
  },
  {
    title: 'أخطاء شائعة أثناء التفعيل',
    image_url: '/assets/chatbot/verification-common-mistakes.png',
    caption: 'لا يكفي إعادة الإرسال أو كتابة تم فقط؛ يجب الضغط على رابط التأكيد.',
  },
];

function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(GUEST_KEY);
  if (existing) return existing;
  const next = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(GUEST_KEY, next);
  return next;
}

function linkLabel(type: string): string {
  switch (type) {
    case 'article':
      return 'مقال';
    case 'post':
      return 'منشور';
    case 'file':
      return 'ملف';
    default:
      return 'رابط';
  }
}

function RafiqAvatar({ compact = false }: { compact?: boolean }) {
  const boxSize = compact ? 'h-10 w-10 rounded-2xl' : 'h-16 w-16 rounded-[1.65rem]';
  const iconSize = compact ? 'h-5 w-5' : 'h-8 w-8';

  return (
    <div className={`rafiq-float relative ${boxSize} shrink-0 bg-gradient-to-br from-teal-500 via-blue-600 to-indigo-500 p-1 text-white shadow-2xl`}>
      <div className="relative flex h-full w-full items-center justify-center rounded-[inherit] bg-white/15 backdrop-blur-sm">
        <BookOpen className={iconSize} />
        <span className="rafiq-eye absolute left-[30%] top-[31%] h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
        <span className="rafiq-eye absolute right-[30%] top-[31%] h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
        <span className="absolute bottom-[24%] h-1.5 w-5 rounded-full bg-white/85" />
        {!compact && (
          <span className="rafiq-wave absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-[11px] shadow-lg ring-2 ring-white dark:ring-slate-900">
            ✨
          </span>
        )}
      </div>
      {!compact && (
        <span className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900">
          <Sparkles className="h-3 w-3 text-white" />
        </span>
      )}
    </div>
  );
}

function buildLocalBotEnhancement(
  inputMessage: string,
  response: {
    intent?: string;
    answer?: string;
    suggestions?: string[];
    help_media?: ChatbotHelpMedia[];
  }
) {
  const normalized = inputMessage.trim().toLowerCase();
  const isVerification =
    response.intent === 'email_verification_problem' ||
    response.intent === 'auth_register_problem' ||
    normalized.includes('تفعيل') ||
    normalized.includes('رسالة التفعيل');

  const helpMedia =
    response.help_media && response.help_media.length > 0
      ? response.help_media
      : isVerification
        ? EMAIL_HELP_MEDIA
        : [];

  let extraNote = '';
  let suggestions = response.suggestions || [];

  if (response.intent === 'email_verification_problem') {
    extraNote = [
      'تنبيهات مهمة:',
      '• إذا كان البريد مكتوبًا خطأ فلن تصلك الرسالة أصلًا.',
      '• إذا كان البريد قديمًا أو لا تستطيع الوصول إليه، استخدم بريدًا نشطًا أو تواصل مع الإدارة.',
      '• إذا كان صندوق البريد ممتلئًا، احذف بعض الرسائل ثم أعد المحاولة.',
      '• بعد وصول الرسالة يجب فتحها والضغط على رابط تأكيد البريد الإلكتروني؛ لا يكفي إعادة الإرسال أو كتابة "تم" فقط.',
    ].join('\n');

    const extraSuggestions = [
      'كتبت البريد خطأ',
      'لا أستطيع الوصول إلى بريدي',
      'صندوق البريد ممتلئ',
      'وصلت الرسالة، ماذا أفعل؟',
    ];
    suggestions = [...new Set([...(response.suggestions || []), ...extraSuggestions])].slice(0, 4);
  }

  if (response.intent === 'auth_register_problem') {
    extraNote = [
      'نصيحة مهمة قبل إنشاء الحساب:',
      '• استخدم بريدًا صحيحًا يمكنك الوصول إليه الآن.',
      '• بعد وصول رسالة التفعيل، افتحها واضغط على رابط تأكيد البريد الإلكتروني.',
    ].join('\n');
  }

  if (normalized.includes('فيس') || normalized.includes('facebook')) {
    const facebookNote =
      'معلومة إضافية: إذا كان زر Facebook ظاهرًا في صفحة تسجيل الدخول، يمكنك استخدامه مباشرة بجانب Google.';
    extraNote = extraNote ? `${extraNote}\n\n${facebookNote}` : facebookNote;
  }

  return { helpMedia, extraNote, suggestions };
}

export default function ChatbotWidget() {
  const [clientReady, setClientReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [rafiqHint, setRafiqHint] = useState<RafiqHint>(() => getRafiqHint(''));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [previewImage, setPreviewImage] = useState<ChatbotHelpMedia | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'أهلًا بك، أنا رفيق المنصة. أستطيع مساعدتك في تصفح الصفوف، البحث عن الملفات التعليمية، أو حل أي مشكلة تواجهك داخل الموقع.',
      suggestions: ['أريد البحث عن ملف تعليمي', 'كيف أستخدم الموقع؟', 'عرض الصفوف التعليمية'],
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!clientReady) return;

    setGuestId(getGuestId());

    const savedSession = Number(window.localStorage.getItem(SESSION_KEY) || '0');
    if (savedSession > 0) setSessionId(savedSession);

    const pageUrl = window.location.pathname + window.location.search;
    setRafiqHint(getRafiqHint(pageUrl));

    const dismissUntil = Number(window.localStorage.getItem(RAFIQ_DISMISS_KEY) || '0');
    const shouldShowHint = Date.now() > dismissUntil;
    setHintVisible(shouldShowHint);

    if (shouldShowHint) {
      tryPlayRafiqAppearSound(window.location.pathname || '/');
    }
  }, [clientReady]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, previewImage]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    setInput('');
    setPreviewImage(null);
    setOpen(true);
    setHintVisible(false);

    setMessages((prev) => [
      ...prev.map((item) => ({ ...item, suggestions: [], actions: [] })),
      { id: `u_${Date.now()}`, role: 'user', text: message },
    ]);
    setLoading(true);

    try {
      const response = await chatbotService.sendMessage({
        message,
        session_id: sessionId,
        guest_id: guestId || getGuestId(),
        page_url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      });

      setSessionId(response.session_id);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SESSION_KEY, String(response.session_id));
      }

      const enhancement = buildLocalBotEnhancement(message, response);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: enhancement.extraNote ? `${response.answer}\n\n${enhancement.extraNote}` : response.answer,
          links: response.links || [],
          actions: response.actions || [],
          suggestions: enhancement.suggestions,
          helpMedia: enhancement.helpMedia,
          messageId: response.message_id,
          aiUsed: response.ai_used,
          aiModel: response.ai_model,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          text: 'تعذر الاتصال بالمساعد الآن. جرّب مرة أخرى، أو استخدم صفحة التواصل إذا كانت المشكلة مستعجلة.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openRafiqWithMessage(message?: string) {
    playRafiqSoftClick();
    setOpen(true);
    setHintVisible(false);
    if (message) {
      setTimeout(() => void send(message), 50);
    }
  }

  function dismissRafiqHint() {
    setHintVisible(false);
    window.localStorage.setItem(RAFIQ_DISMISS_KEY, String(Date.now() + DISMISS_MS));
  }

  async function rate(messageId: number | undefined, rating: 'helpful' | 'not_helpful') {
    if (!messageId) return;
    try {
      await chatbotService.feedback({ message_id: messageId, rating });
    } catch {}
  }

  function handleAction(action: ChatbotAction) {
    if (action.type === 'message' && action.message) {
      void send(action.message);
    }
  }

  function resetChat() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }

    setSessionId(undefined);
    setPreviewImage(null);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        text: 'أهلًا بك، أنا رفيق المنصة. أستطيع مساعدتك في تصفح الصفوف، البحث عن الملفات التعليمية، أو حل أي مشكلة تواجهك داخل الموقع.',
        suggestions: ['أريد البحث عن ملف تعليمي', 'كيف أستخدم الموقع؟', 'عرض الصفوف التعليمية'],
      },
    ]);
  }

  if (!clientReady) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes rafiq-float {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }
        @keyframes rafiq-wave {
          0%, 100% { transform: rotate(0deg) scale(1); }
          30% { transform: rotate(14deg) scale(1.06); }
          60% { transform: rotate(-9deg) scale(0.98); }
        }
        @keyframes rafiq-glow {
          0%, 100% { box-shadow: 0 16px 34px rgba(15, 118, 110, 0.28); }
          50% { box-shadow: 0 20px 46px rgba(37, 99, 235, 0.42); }
        }
        @keyframes rafiq-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes rafiq-pop {
          0% { opacity: 0; transform: translateY(8px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rafiq-float { animation: rafiq-float 3.2s ease-in-out infinite, rafiq-glow 3.8s ease-in-out infinite; }
        .rafiq-wave { animation: rafiq-wave 2.6s ease-in-out infinite; transform-origin: 70% 70%; }
        .rafiq-eye { animation: rafiq-blink 4.8s ease-in-out infinite; transform-origin: center; }
        .rafiq-pop { animation: rafiq-pop 180ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .rafiq-float, .rafiq-wave, .rafiq-eye, .rafiq-pop { animation: none !important; }
        }
      `}</style>

      <div className="fixed bottom-4 left-4 z-50 w-auto max-w-[calc(100vw-1rem)] print:hidden sm:bottom-5 sm:left-5" dir="rtl">
        {open && (
          <div className="relative mb-3 flex h-[min(76vh,600px)] w-[370px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:mb-4">
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-l from-teal-600 to-blue-600 px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-2">
                <RafiqAvatar compact />
                <div className="min-w-0">
                  <div className="truncate font-bold">رفيق المنصة</div>
                  <div className="truncate text-xs text-blue-100">رفيقك الذكي داخل المنصة</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={resetChat} className="rounded-xl p-2 hover:bg-white/15" aria-label="بدء محادثة جديدة" title="بدء محادثة جديدة">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-white/15" aria-label="إغلاق المساعد">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-3 dark:bg-slate-950">
              {messages.map((message, index) => {
                const isLatestAssistant = message.role === 'assistant' && index === messages.length - 1;
                const visibleSuggestions = isLatestAssistant ? (message.suggestions || []).filter(Boolean).slice(0, 4) : [];

                return (
                  <div key={message.id} className={message.role === 'user' ? 'text-left' : 'text-right'}>
                    <div className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'}`}>
                      {message.aiUsed && (
                        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                          رد محسّن بالذكاء الاصطناعي
                        </div>
                      )}

                      <div className="whitespace-pre-line">{message.text}</div>

                      {message.helpMedia && message.helpMedia.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-2 dark:border-blue-900/60 dark:bg-blue-950/20">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs font-bold text-blue-800 dark:text-blue-200">
                              <ImageIcon className="h-3.5 w-3.5" />
                              شرح مصور
                            </div>
                            <span className="text-[10px] text-slate-500">اختر صورة واحدة</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {message.helpMedia.slice(0, 3).map((item) => (
                              <button
                                key={`${message.id}_${item.image_url}`}
                                type="button"
                                onClick={() => setPreviewImage(item)}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white text-center shadow-sm transition hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900"
                              >
                                <div className="h-14 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                                </div>
                                <div className="line-clamp-2 px-1.5 py-1 text-[10px] font-bold leading-4 text-slate-700 dark:text-slate-100">
                                  {item.title}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, actionIndex) => {
                            const actionClass = action.style === 'primary'
                              ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-50 text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-100';

                            if (action.type === 'link' && action.url) {
                              return (
                                <Link key={`${action.label}_${actionIndex}`} href={action.url} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${actionClass}`}>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  {action.label}
                                </Link>
                              );
                            }

                            return (
                              <button key={`${action.label}_${actionIndex}`} type="button" disabled={loading} onClick={() => handleAction(action)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${actionClass}`}>
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {message.links && message.links.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-300">نتائج مقترحة من الموقع ({message.links.length})</div>
                          {message.links.map((link) => (
                            <Link key={`${link.type}_${link.id}`} href={link.url} className="block rounded-xl border border-slate-200 p-2 text-right transition hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                              <span className="mb-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 dark:bg-blue-950 dark:text-blue-200">{linkLabel(link.type)}</span>
                              <span className="block font-semibold text-slate-900 dark:text-white">{link.title}</span>
                              {link.description && <span className="line-clamp-2 text-xs text-slate-500">{link.description}</span>}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {message.role === 'assistant' && message.messageId && (
                      <div className="mt-1 flex justify-start gap-1 text-slate-400">
                        <button type="button" onClick={() => rate(message.messageId, 'helpful')} className="rounded-lg p-1 hover:text-green-600" aria-label="الرد مفيد">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => rate(message.messageId, 'not_helpful')} className="rounded-lg p-1 hover:text-red-600" aria-label="الرد غير مفيد">
                          <ThumbsDown className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {visibleSuggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {visibleSuggestions.map((suggestion) => (
                          <button key={suggestion} type="button" disabled={loading} onClick={() => send(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري تجهيز الرد...
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {previewImage && (
              <div className="absolute inset-x-3 bottom-[70px] top-[62px] z-20 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                  <div className="min-w-0 truncate text-xs font-bold text-slate-900 dark:text-white">{previewImage.title}</div>
                  <button type="button" onClick={() => setPreviewImage(null)} className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="إغلاق الصورة">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-2 dark:bg-slate-950">
                  <img
                    src={previewImage.image_url}
                    alt={previewImage.title}
                    className="mx-auto max-h-full w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain dark:border-slate-700"
                  />
                </div>
              </div>
            )}

            <form className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب سؤالك أو المشكلة..."
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                maxLength={1200}
              />
              <button type="submit" disabled={!canSend} className="rounded-2xl bg-blue-600 px-4 text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="إرسال">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {hintVisible && !open && (
          <div className="rafiq-pop mb-2 w-[min(82vw,260px)] rounded-2xl border border-slate-200 bg-white p-2.5 text-right shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:w-[300px] sm:p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <RafiqAvatar compact />
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white sm:text-sm">{rafiqHint.title}</div>
                  <div className="hidden text-[11px] font-semibold text-teal-600 dark:text-teal-300 sm:block">رفيقك الذكي حسب الصفحة</div>
                </div>
              </div>
              <button type="button" onClick={dismissRafiqHint} aria-label="إخفاء رفيق" className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="line-clamp-2 text-[11px] leading-5 text-slate-600 dark:text-slate-300 sm:text-[12.5px] sm:leading-6">{rafiqHint.message}</p>
            {rafiqHint.quick_actions?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rafiqHint.quick_actions.slice(0, 2).map((action, index) => (
                  <button
                    key={`${action.label}_${index}`}
                    type="button"
                    onClick={() => openRafiqWithMessage(action.message || action.label)}
                    className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 transition hover:border-teal-400 hover:bg-teal-100 sm:px-2.5 sm:py-1 sm:text-[10.5px]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          {!open && !hintVisible && (
            <div className="rafiq-pop mb-2 hidden max-w-[190px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right text-[11px] leading-5 text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:block">
              <div className="font-extrabold text-teal-700 dark:text-teal-300">رفيق المنصة</div>
              <div>مرحبًا، أنا رفيقك.</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => open ? setOpen(false) : openRafiqWithMessage()}
            aria-label={open ? 'إغلاق رفيق المنصة' : 'فتح رفيق المنصة'}
            data-testid="chatbot-fab"
            className="group relative flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-transparent transition hover:scale-105 active:scale-95 sm:h-16 sm:w-16 sm:rounded-[1.65rem]"
            title="رفيق المنصة"
          >
            {open ? (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-2xl dark:bg-white dark:text-slate-900">
                <X className="h-6 w-6" />
              </span>
            ) : (
              <RafiqAvatar />
            )}
            {!open && !hintVisible && (
              <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
