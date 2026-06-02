import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Short-link redirect: /articles/{id} → /{countryCode}/lesson/articles/{id}
 *
 * The chatbot and older shared links use the short `/articles/{id}` form, while
 * the real article page lives under the country-scoped route. This bridge keeps
 * those links working by resolving the visitor's country (cookie, default "jo")
 * and forwarding to the canonical path.
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

export default async function ArticleShortRedirect({ params }: Props) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cc = resolveCountryCode(
    cookieStore.get('country_code')?.value,
    cookieStore.get('country_id')?.value
  );
  redirect(`/${cc}/lesson/articles/${id}`);
}
