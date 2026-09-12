/**
 * Where this tab was pointed when it loaded.
 *
 * Captured at import, before anything has had a chance to rewrite the address
 * bar. The editor keeps its level and its element in the fragment, and by the
 * time a sign-in redirect decides to remember where you were, the fragment on
 * screen may already have been rebuilt from a model that failed to load —
 * which is how a link to a container came back as a link to the system.
 *
 * Only the fragment: the path is react-router's to report, and it is accurate.
 */
export const ENTRY_HASH = typeof window === 'undefined' ? '' : window.location.hash;
