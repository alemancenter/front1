export type ScriptAttributes = Record<string, string | boolean | undefined>;

const loadedScripts = new Set<string>();

export function loadScriptOnce(id: string, src: string, attrs: ScriptAttributes = {}) {
  if (typeof window === 'undefined') return;
  if (!id || !src) return;
  if (loadedScripts.has(id) || document.getElementById(id)) return;

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === false) return;
    if (value === true) {
      script.setAttribute(key, '');
      return;
    }
    script.setAttribute(key, String(value));
  });

  loadedScripts.add(id);
  document.head.appendChild(script);
}

export function runAfterIdle(callback: () => void, timeout = 2500) {
  if (typeof window === 'undefined') return;

  const run = () => {
    if ('requestIdleCallback' in window) {
      (window as Window & {
        requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      }).requestIdleCallback?.(() => callback(), { timeout });
      return;
    }

    globalThis.setTimeout(callback, timeout);
  };

  if (document.readyState === 'complete') {
    run();
    return;
  }

  window.addEventListener('load', run, { once: true });
}

export function runOnFirstInteraction(callback: () => void, fallbackDelay = 3500) {
  if (typeof window === 'undefined') return;

  let didRun = false;
  const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart', 'scroll'];
  const fallbackTimer = globalThis.setTimeout(run, fallbackDelay);

  function cleanup() {
    events.forEach((eventName) => window.removeEventListener(eventName, run));
    globalThis.clearTimeout(fallbackTimer);
  }

  function run() {
    if (didRun) return;
    didRun = true;
    cleanup();
    callback();
  }

  events.forEach((eventName) => window.addEventListener(eventName, run, { once: true, passive: true }));
}
