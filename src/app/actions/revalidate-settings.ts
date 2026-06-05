'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateFrontSettings(): Promise<void> {
  // 1) Drop the cached /front/settings fetch so the next server render fetches
  //    the fresh value (used by getFrontSettings()).
  revalidateTag('front-settings', 'max');

  // 2) Bust the layout's render cache so every route that reads settings
  //    server-side (article pages, post pages, download pages...) re-renders
  //    on the next request. Without this, pages with their own `revalidate`
  //    setting (e.g. articles set to 120s ISR) would keep serving stale HTML
  //    even though the underlying fetch was invalidated.
  revalidatePath('/', 'layout');
}
