'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateFrontSettings(): Promise<void> {
  revalidateTag('front-settings');
}
