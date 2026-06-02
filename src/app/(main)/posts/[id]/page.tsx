import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Short-link redirect: /posts/{id} → /{countryCode}/posts/{id}
 *
 * Keeps the short `/posts/{id}` form (chatbot results, shared links) working by
 * resolving the visitor's country (cookie, default "jo") and forwarding to the
 * canonical country-scoped post page.
 */

interface Props {
  params: Promise<{ id: string }>;
}

function resolveCountryCode(codeCookie?: string | null, idCookie?: string | null): string {
  if (codeCookie) {
    const n = codeCookie.trim().toLowerCase();
    if (['jo', 'sa', 'eg', 'ps'].includes(n)) return n;
  }
  const id = (idCookie || '').toString().trim();
  return id === '2' ? 'sa' : id === '3' ? 'eg' : id === '4' ? 'ps' : 'jo';
}

export default async function PostShortRedirect({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cc = resolveCountryCode(
    cookieStore.get('country_code')?.value,
    cookieStore.get('country_id')?.value
  );
  redirect(`/${cc}/posts/${id}`);
}
