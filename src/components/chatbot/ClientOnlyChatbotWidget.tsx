'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Load the actual widget code as a separate chunk so the chatbot bundle (with
// its motion / lucide / API service dependencies) is not part of the main JS
// downloaded before LCP.
const ChatbotWidget = dynamic(() => import('./ChatbotWidget'), {
  ssr: false,
  loading: () => null,
});

export default function ClientOnlyChatbotWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Mount only after the browser is idle (or 1.2s have passed) so the widget
    // never competes with the article's LCP render. `requestIdleCallback` is
    // missing in Safari; the timeout fallback covers it.
    let cancelled = false;
    const mount = () => {
      if (!cancelled) setReady(true);
    };

    type IdleWindow = typeof window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === 'function') {
      const handle = w.requestIdleCallback(mount, { timeout: 2000 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(handle);
      };
    }

    const id = window.setTimeout(mount, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  if (!ready) return null;

  return <ChatbotWidget />;
}
