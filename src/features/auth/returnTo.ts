import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Only a path on this site. An open redirect on a sign-in screen is how a
 * phishing page borrows your domain for the trip.
 */
export function sanitizeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  if (value.includes('\\') || value.includes('\n') || value.includes('\r')) return null;
  try {
    const u = new URL(value, 'http://local.invalid');
    if (u.origin !== 'http://local.invalid') return null;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return null;
  }
}

export function useReturnTo(): string | null {
  const [searchParams] = useSearchParams();
  return useMemo(() => sanitizeReturnTo(searchParams.get('returnTo')), [searchParams]);
}
