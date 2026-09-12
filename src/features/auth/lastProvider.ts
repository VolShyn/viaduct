/**
 * Which way someone signed in last time, remembered in this browser.
 *
 * Google, GitHub and SSO are separate people here, so pressing
 * the wrong button lands you in your *other* workspace, empty. That reads as
 * "my projects are gone" rather than "wrong button", and it arrives as a
 * support email. A hint on the button that worked last time costs nothing and
 * heads off most of it.
 */
export type AuthProvider = 'gitlab' | 'google' | 'github';

const STORAGE_KEY = 'c4-last-auth-provider';

export function readLastProvider(): AuthProvider | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'gitlab' || raw === 'google' || raw === 'github' ? raw : null;
  } catch {
    /* A browser that refuses storage just gets no hint. */
    return null;
  }
}

export function rememberProvider(provider: AuthProvider): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, provider);
  } catch {
    /* Not worth failing a sign-in over. */
  }
}
