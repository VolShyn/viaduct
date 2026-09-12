import type { Location } from 'react-router-dom';

/**
 * Where someone was standing when they pressed sign in.
 *
 * The auth screens are reached from the landing page, from inside the app,
 * and straight from a bookmark, and only the first of those has somewhere
 * obvious to go back to. Rather than guess from history depth — which would
 * offer "back" to a page the person never saw — the landing's own links say
 * so in the navigation state, and the screens believe nothing else.
 */
export const FROM_LANDING = { from: 'landing' } as const;

export function cameFromLanding(location: Location): boolean {
  const state = location.state as { from?: unknown } | null;
  return state?.from === 'landing';
}
