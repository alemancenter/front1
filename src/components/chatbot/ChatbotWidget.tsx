'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bot, MessageSquareText, Send, X, ThumbsUp, ThumbsDown,
  ArrowUpRight, RotateCcw, ChevronLeft, ChevronRight, ArrowRight, BookOpen,
  Paperclip, Smile,
} from 'lucide-react';
import { chatbotService, ChatbotAction, ChatbotContentLink, ChatbotHelpMedia } from '@/lib/api/services/chatbot';

/* ════════════════════════ types ════════════════════════ */
type Role = 'user' | 'assistant';

interface Msg {
  id: string;
  role: Role;
  text: string;
  links?: ChatbotContentLink[];
  actions?: ChatbotAction[];
  suggestions?: string[];
  helpMedia?: ChatbotHelpMedia[];
  messageId?: number;
}

/* ════════════════════════ constants ════════════════════════ */
const GUEST_KEY = 'alemancenter_chatbot_guest_id';
const SESSION_KEY = 'alemancenter_chatbot_session_id';

const WELCOME =
  'أهلاً بك، أنا مساعد المنصة. أساعدك في تسجيل الدخول، تفعيل الحساب، تحميل الملفات، والبحث داخل الموقع. اختر مشكلة شائعة أو اكتب سؤالك مباشرة.';
const WELCOME_CHIPS = ['لا أستطيع تحميل الملفات', 'لا تصلني رسالة التفعيل', 'كتبت البريد خطأ', 'الدخول عبر فيسبوك'];
const EMOJIS = ['🙂', '👍', '✅', '🙏', '📩', '📁', '🔍', '⚠️'];
const PRIMARY = '#0f766e';

const EMAIL_HELP_MEDIA: ChatbotHelpMedia[] = [
  { title: 'لماذا لا تصل رسالة التفعيل؟', image_url: '/assets/chatbot/verification-why-no-message.png', caption: 'أسباب شائعة: بريد خاطئ، قديم، أو صندوق ممتلئ.' },
  { title: 'خطوات تفعيل البريد الصحيحة', image_url: '/assets/chatbot/verification-steps.png', caption: 'افتح الرسالة واضغط رابط التأكيد داخلها.' },
  { title: 'أخطاء شائعة أثناء التفعيل', image_url: '/assets/chatbot/verification-common-mistakes.png', caption: 'الفرق بين السلوك الصحيح والأخطاء الشائعة.' },
];

/* ════════════════════════ helpers ════════════════════════ */
function getGuestId(): string {
  if (typeof window === 'undefined') return '';
  const v = window.localStorage.getItem(GUEST_KEY);
  if (v) return v;
  const id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(GUEST_KEY, id);
  return id;
}

function linkLabel(t: string) {
  return t === 'article' ? 'مقال' : t === 'post' ? 'منشور' : t === 'file' ? 'ملف' : 'رابط';
}

function enhance(input: string, res: { intent?: string; suggestions?: string[]; help_media?: ChatbotHelpMedia[] }) {
  const helpMedia = res.help_media?.length
    ? res.help_media
    : res.intent === 'email_verification_problem' || res.intent === 'auth_register_problem'
      ? EMAIL_HELP_MEDIA
      : [];

  let extra = '';
  let suggestions = res.suggestions ?? [];

  if (res.intent === 'email_verification_problem') {
    extra = [
      'راجع أيضًا:',
      '• إذا كان البريد مكتوبًا خطأ فلن تصل رسالة التفعيل؛ راجعه حرفًا حرفًا.',
      '• افحص Spam/Junk والرسائل الترويجية، ثم انتظر من 2 إلى 5 دقائق.',
      '• إذا كان صندوق البريد ممتلئًا، احذف بعض الرسائل ثم أعد إرسال التفعيل.',
    ].join('\n');
    suggestions = [...new Set([...suggestions, 'كتبت البريد خطأ', 'فحصت البريد غير الهام', 'ما زالت المشكلة موجودة'])].slice(0, 4);
  }
  if (res.intent === 'auth_register_problem') {
    extra = ['نصيحة مهمة:', '• استخدم بريدًا صحيحًا ويمكنك الوصول إليه الآن.', '• بعد وصول الرسالة افتحها واضغط على رابط التأكيد داخلها.'].join('\n');
  }
  if (input.includes('فيس') || input.includes('facebook')) {
    const note = 'إذا لم يعمل زر Facebook، افتح صفحة تسجيل الدخول من متصفح حديث واسمح للنوافذ المنبثقة وملفات الارتباط.';
    extra = extra ? `${extra}\n\n${note}` : note;
  }
  return { helpMedia, extra, suggestions };
}

/* ════════════════════════ rich text renderer ════════════════════════ */
function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let k = 0;

  const flush = () => {
    if (!para.length) return;
    blocks.push(
      <p key={k++} className="text-[13px] leading-[1.9] text-slate-600" style={{ wordBreak: 'break-word' }}>
        {para.join(' ')}
      </p>
    );
    para = [];
  };

  for (const raw of text.split('\n')) {
    const l = raw.trim();
    if (!l) { flush(); continue; }

    // numbered
    const numMatch = l.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      flush();
      blocks.push(
        <div key={k++} className="flex gap-2.5">
          <span className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[11px] font-black text-teal-700">
            {numMatch[1]}
          </span>
          <span className="text-[13px] leading-[1.85] text-slate-600" style={{ wordBreak: 'break-word' }}>{numMatch[2]}</span>
        </div>
      );
      continue;
    }

    // bullet
    const bulMatch = l.match(/^[•\-]\s+(.*)/);
    if (bulMatch) {
      flush();
      blocks.push(
        <div key={k++} className="flex gap-2.5">
          <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-teal-500" />
          <span className="text-[13px] leading-[1.85] text-slate-600" style={{ wordBreak: 'break-word' }}>{bulMatch[1]}</span>
        </div>
      );
      continue;
    }

    // header
    if (l.endsWith(':') && l.length <= 50 && !l.includes('.')) {
      flush();
      blocks.push(<p key={k++} className="pt-1.5 text-[13px] font-extrabold text-slate-800">{l}</p>);
      continue;
    }

    para.push(l);
  }
  flush();

  return <div className="space-y-2" dir="rtl">{blocks}</div>;
}

/* ════════════════════════ help media list ════════════════════════ */
function HelpGuides({ media, onOpen }: { media: ChatbotHelpMedia[]; onOpen: (i: number) => void }) {
  return (
    <div className="mt-3 space-y-1.5" dir="rtl">
      <div className="flex items-center gap-1.5 px-0.5">
        <BookOpen className="h-3.5 w-3.5 text-teal-600" />
        <span className="text-[11px] font-extrabold text-slate-500">دليل مصوّر يشرح الحل</span>
      </div>
      {media.map((item, i) => (
        <button
          key={item.image_url}
          type="button"
          onClick={() => onOpen(i)}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-1.5 text-right transition hover:border-teal-300 hover:bg-teal-50/40"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <Image src={item.image_url} alt={item.title} fill sizes="44px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12.5px] font-bold leading-5 text-slate-800" style={{ wordBreak: 'break-word' }}>{item.title}</span>
            {item.caption && <span className="block text-[11.5px] leading-5 text-slate-400" style={{ wordBreak: 'break-word' }}>{item.caption}</span>}
          </span>
          <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-teal-600" />
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════ image viewer ════════════════════════ */
function ImageViewer({ items, initial, onClose }: { items: ChatbotHelpMedia[]; initial: number; onClose: () => void }) {
  const [i, setI] = useState(initial);
  const item = items[i];
  const n = items.length;

  return (
    <div className="flex flex-col bg-white" style={{ flex: '1 1 0', minHeight: 0 }} dir="rtl">
      {/* bar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 px-2 py-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-bold text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowRight className="h-4 w-4" />
          المحادثة
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-[12.5px] font-extrabold text-slate-800">{item.title}</p>
        <span className="shrink-0 px-2 text-[11px] font-bold text-slate-400">{n > 1 ? `${i + 1}/${n}` : ''}</span>
      </div>

      {/* image */}
      <div className="flex items-center justify-center bg-slate-50 p-4" style={{ flex: '1 1 0', minHeight: 0 }}>
        <Image
          key={item.image_url}
          src={item.image_url}
          alt={item.title}
          width={720}
          height={480}
          sizes="(max-width: 480px) 90vw, 360px"
          className="h-auto max-h-full w-auto max-w-full rounded-xl object-contain shadow-sm"
        />
      </div>

      {/* footer */}
      <div className="shrink-0 space-y-2.5 border-t border-slate-100 px-4 py-3">
        {item.caption && <p className="text-center text-[12px] leading-6 text-slate-500">{item.caption}</p>}
        {n > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {items.map((_, d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setI(d)}
                  className={`h-1.5 rounded-full transition-all ${d === i ? 'w-5 bg-teal-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setI((p) => p - 1)}
                disabled={i === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setI((p) => p + 1)}
                disabled={i === n - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:text-teal-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════ main widget ════════════════════════ */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [sessionId, setSessionId] = useState<number | undefined>();
  const [viewer, setViewer] = useState<{ items: ChatbotHelpMedia[]; index: number } | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'welcome', role: 'assistant', text: WELCOME, suggestions: WELCOME_CHIPS },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    setGuestId(getGuestId());
    const s = Number(window.localStorage.getItem(SESSION_KEY) || '0');
    if (s > 0) setSessionId(s);
  }, []);

  useEffect(() => {
    if (open && !viewer) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  }, [messages, open, viewer]);

  async function send(text: string, options: { echo?: boolean } = {}) {
    const msg = text.trim();
    if (!msg || loading) return;
    const echo = options.echo !== false;
    setInput('');
    setEmojiOpen(false);
    setMessages((p) => {
      const cleared = p.map((m) => ({ ...m, suggestions: [], actions: [] }));
      return echo ? [...cleared, { id: `u_${Date.now()}`, role: 'user', text: msg }] : cleared;
    });
    setLoading(true);
    try {
      const res = await chatbotService.sendMessage({
        message: msg,
        session_id: sessionId,
        guest_id: guestId || getGuestId(),
        page_url: typeof window !== 'undefined' ? window.location.pathname : '',
      });
      setSessionId(res.session_id);
      window.localStorage.setItem(SESSION_KEY, String(res.session_id));
      const { helpMedia, extra, suggestions } = enhance(msg, res);
      setMessages((p) => [
        ...p,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: extra ? `${res.answer}\n\n${extra}` : res.answer,
          links: res.links || [],
          actions: res.actions || [],
          suggestions,
          helpMedia,
          messageId: res.message_id,
        },
      ]);
    } catch {
      setMessages((p) => [...p, { id: `e_${Date.now()}`, role: 'assistant', text: 'تعذّر الاتصال. جرّب مرة أخرى أو افتح صفحة التواصل.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function rate(id: number | undefined, rating: 'helpful' | 'not_helpful') {
    if (!id) return;
    try { await chatbotService.feedback({ message_id: id, rating }); } catch {}
  }

  function reset() {
    window.localStorage.removeItem(SESSION_KEY);
    setSessionId(undefined);
    setViewer(null);
    setEmojiOpen(false);
    setMessages([{ id: `w_${Date.now()}`, role: 'assistant', text: WELCOME, suggestions: WELCOME_CHIPS }]);
  }

  function addEmoji(emoji: string) {
    setInput((value) => `${value}${emoji}`);
    setEmojiOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div className="fixed bottom-5 left-5 z-50 ps-3 print:hidden">
      {/* ═══ panel ═══ */}
      {open && (
        <div
          data-testid="chatbot-panel"
          className="mb-3 flex flex-col overflow-hidden rounded-[28px] bg-white ring-1 ring-slate-200/80"
          style={{ width: 390, height: 620, maxWidth: 'calc(100vw - 24px)', maxHeight: 'calc(100vh - 110px)', boxShadow: '0 24px 70px -12px rgba(15,118,110,0.24)' }}
        >
          {/* ─── header ─── */}
          <div
            className="relative flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-4"
            dir="rtl"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: `linear-gradient(135deg,${PRIMARY},#2563eb)` }}
              >
                <Bot className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold leading-tight text-slate-950">مساعد المنصة</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  متصل الآن
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={reset} title="محادثة جديدة" className="rounded-full p-2 text-teal-700 transition hover:bg-teal-50">
                <RotateCcw className="h-[18px] w-[18px]" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق" className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {/* ─── body ─── */}
          {viewer ? (
            <ImageViewer items={viewer.items} initial={viewer.index} onClose={() => setViewer(null)} />
          ) : (
            <>
              {/* messages */}
              <div
                className="chatbot-scroll flex-1 space-y-4 overflow-y-auto px-6 py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ background: '#fbfbfd' }}
                dir="rtl"
                onScroll={() => setEmojiOpen(false)}
              >
                <div className="flex items-center gap-3 px-2 text-center">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-[12px] font-extrabold text-slate-400">اليوم</span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <p className="px-10 text-center text-[11.5px] font-semibold text-slate-400">نحن متصلون الآن</p>
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isLastBot = !isUser && idx === messages.length - 1;
                  const chips = isLastBot ? (msg.suggestions ?? []).slice(0, 4) : [];

                  return (
                    <div key={msg.id} className="flex flex-col gap-1.5">
                      {/* bubble row — user right, bot left */}
                      <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {!isUser && (
                          <div
                            className="mb-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-white"
                            style={{ background: `linear-gradient(135deg,${PRIMARY},#2563eb)` }}
                          >
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div
                          className={`min-w-0 px-3.5 py-2.5 ${
                            isUser
                              ? 'rounded-[18px] rounded-br-[5px] border border-teal-200 bg-teal-50 text-teal-950 shadow-sm shadow-teal-100'
                              : 'rounded-[18px] rounded-bl-[5px] border border-slate-100 bg-slate-100/90 shadow-sm'
                          }`}
                          style={{ maxWidth: '82%', wordBreak: 'break-word' }}
                        >
                          {isUser ? (
                            <p className="text-[13px] leading-[1.85] text-teal-950" style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{msg.text}</p>
                          ) : (
                            <RichText text={msg.text} />
                          )}

                          {/* help media */}
                          {!isUser && msg.helpMedia && msg.helpMedia.length > 0 && (
                            <HelpGuides media={msg.helpMedia} onOpen={(i) => setViewer({ items: msg.helpMedia!, index: i })} />
                          )}

                          {/* actions — clean full-width list */}
                          {!isUser && msg.actions && msg.actions.length > 0 && (
                            <div className="mt-3 flex flex-col gap-1.5" dir="rtl">
                              {msg.actions.map((a, ai) => {
                                const primary = a.style === 'primary';
                                const cls = primary
                                  ? 'border-teal-300 bg-teal-50 text-teal-900 hover:bg-teal-100'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800';
                                const iconCls = primary ? 'text-teal-700' : 'text-slate-400';
                                if (a.type === 'link' && a.url) {
                                  return (
                                    <Link key={ai} href={a.url} className={`flex items-center justify-between gap-1 rounded-md border px-2 py-1 text-[10px] font-bold transition ${cls}`}>
                                      <span className="min-w-0 leading-5" style={{ wordBreak: 'break-word' }}>{a.label}</span>
                                      <ArrowUpRight className={`h-3.5 w-3.5 shrink-0 ${iconCls}`} />
                                    </Link>
                                  );
                                }
                                return (
                                  <button
                                    key={ai}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => a.type === 'message' && a.message && send(a.message)}
                                    className={`flex items-center justify-between gap-1 rounded-md border px-2 py-1 text-[10px] font-bold transition disabled:opacity-50 ${cls}`}
                                  >
                                    <span className="min-w-0 leading-5" style={{ wordBreak: 'break-word' }}>{a.label}</span>
                                    <ChevronLeft className={`h-3.5 w-3.5 shrink-0 ${iconCls}`} />
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* search results */}
                          {!isUser && msg.links && msg.links.length > 0 && (
                            <div className="mt-3 space-y-1.5" dir="rtl">
                              <p className="px-0.5 text-[11px] font-extrabold text-slate-400">نتائج من الموقع</p>
                              {msg.links.map((l) => (
                                <Link
                                  key={`${l.type}_${l.id}`}
                                  href={l.url}
                                  className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2 transition hover:border-teal-300 hover:bg-teal-50/40"
                                >
                                  <span className="min-w-0 flex-1">
                                    <span className="mb-0.5 inline-block rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold text-slate-500">{linkLabel(l.type)}</span>
                                    <span className="block text-[12.5px] font-bold leading-5 text-slate-800" style={{ wordBreak: 'break-word' }}>{l.title}</span>
                                    {l.description && (
                                      <span
                                        className="block text-[11.5px] leading-5 text-slate-400"
                                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                                      >
                                        {l.description}
                                      </span>
                                    )}
                                  </span>
                                  <ChevronLeft className="h-4 w-4 shrink-0 text-slate-300" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* rating */}
                      {!isUser && msg.messageId && (
                        <div className="flex items-center gap-1" dir="rtl">
                          <span className="text-[11px] text-slate-400">هل أفادك الرد؟</span>
                          <button type="button" onClick={() => rate(msg.messageId, 'helpful')} className="rounded-md p-1 text-slate-300 transition hover:bg-emerald-50 hover:text-emerald-500" aria-label="مفيد">
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={() => rate(msg.messageId, 'not_helpful')} className="rounded-md p-1 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500" aria-label="غير مفيد">
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}

                      {/* suggestion chips */}
                      {chips.length > 0 && (
                        <div className="flex flex-wrap items-start justify-start gap-1.5 pt-1" dir="rtl">
                          {chips.map((s) => {
                            const isShort = s.length <= 28;
                            const primaryChip = isShort && chips.indexOf(s) === 0;
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={loading}
                                onClick={() => send(s, { echo: false })}
                                className={`max-w-full rounded-full border px-2.5 py-1 text-center text-[10.5px] font-bold leading-[1.45] transition disabled:opacity-50 ${
                                  primaryChip
                                    ? 'border-teal-500 bg-teal-50 text-teal-900 shadow-sm shadow-teal-100 hover:bg-teal-100'
                                    : 'border-teal-300 bg-white text-teal-800 hover:border-teal-500 hover:bg-teal-50'
                                } ${isShort ? '' : 'w-full'}`}
                                style={{ wordBreak: 'break-word' }}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* typing */}
                {loading && (
                  <div className="flex items-end" dir="rtl">
                    <div className="rounded-[16px] rounded-bl-[4px] border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-500 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* input */}
              <form
                onSubmit={(e) => { e.preventDefault(); void send(input); }}
                className="shrink-0 border-t border-slate-100 bg-white px-6 py-3"
                dir="rtl"
              >
                <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-slate-100 px-3 py-2 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-100">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    maxLength={1200}
                    data-testid="chatbot-input"
                    className="min-w-0 flex-1 bg-transparent px-1 text-[13.5px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!canSend}
                    aria-label="إرسال"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-teal-700 transition hover:bg-teal-50 active:scale-90 disabled:text-slate-300"
                  >
                    <Send className="h-[18px] w-[18px]" />
                  </button>
                </div>
                <div className="relative mt-2 flex items-center gap-2 px-1">
                  {emojiOpen && (
                    <div
                      className="absolute bottom-9 right-0 z-10 w-[188px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_14px_34px_rgba(15,23,42,0.14)]"
                      dir="ltr"
                    >
                      <div className="grid grid-cols-4 gap-1">
                        {EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addEmoji(emoji)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[16px] transition hover:bg-teal-50"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="إيموجي"
                    aria-expanded={emojiOpen}
                    onClick={() => {
                      setEmojiOpen((value) => !value);
                      inputRef.current?.focus();
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-teal-50 ${emojiOpen ? 'bg-teal-50 text-teal-700' : 'text-slate-300 hover:text-teal-700'}`}
                  >
                    <Smile className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="مرفقات"
                    onClick={() => inputRef.current?.focus()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-teal-50 hover:text-teal-700"
                  >
                    <Paperclip className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* ═══ FAB ═══ */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="مساعد المنصة"
        data-testid="chatbot-fab"
        className="flex h-14 w-14 items-center justify-center rounded-full text-white transition hover:scale-105 active:scale-95"
        style={{ background: `linear-gradient(135deg,${PRIMARY} 0%,#2563eb 100%)`, boxShadow: '0 8px 28px rgba(15,118,110,0.35)' }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquareText className="h-[22px] w-[22px]" />}
      </button>
    </div>
  );
}
