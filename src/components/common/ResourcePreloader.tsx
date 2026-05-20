'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function runWhenIdle(callback: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  globalThis.setTimeout(callback, timeout);
}

// Routes to prefetch when the browser is idle on the home page
const HOME_PREFETCH = [
  '/jo/posts/category/101',
  '/jo/posts',
];

// Routes to prefetch on any page after a short delay
const GLOBAL_PREFETCH = [
  '/about-us',
  '/contact-us',
];

export default function ResourcePreloader() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Prefetch global routes after the page is idle
    runWhenIdle(() => {
      GLOBAL_PREFETCH.forEach(route => router.prefetch(route));
    }, 3000);

    if (pathname !== '/') return;

    // Prefetch home-specific routes sooner
    runWhenIdle(() => {
      HOME_PREFETCH.forEach(route => router.prefetch(route));
    }, 1500);
  }, [pathname, router]);

  return null;
}
