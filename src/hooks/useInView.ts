import { useEffect, useRef, useState } from 'react';

/**
 * Returns a ref and a boolean that becomes true once the element enters the viewport.
 * After the first intersection the observer is disconnected — the value never goes back to false.
 * rootMargin defaults to '300px 0px' so content starts loading 300 px before becoming visible.
 */
export function useInView(rootMargin = '300px 0px') {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // SSR / very old browsers fallback
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
