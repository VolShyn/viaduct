/**
 * Whether the comparator is open, and what it should land on.
 *
 * Full workspace surface like change sets: the rail / diff panel asks for it,
 * the editor page renders it.
 */

import type { CompareRef, CompareSubject } from '@shared/api';

export type CompareOverlaySession = {
  left?: CompareRef | string;
  right?: CompareRef | string;
  subject?: CompareSubject;
  /** Open on the flow player at this alignment/stage index, or a side step index when `stepSide` is set. */
  step?: number;
  /** When set, `step` is an index into that side's flow.steps. */
  stepSide?: 'before' | 'after';
  arm?: 'before' | 'after' | 'both';
  /** Skip the side-picker gate (deep link / already confirmed). */
  ready?: boolean;
} | null;

type Listener = () => void;

type Store = {
  session: CompareOverlaySession;
  listeners: Set<Listener>;
};

const STORE_KEY = '__c4CompareOverlayUi__';

function getStore(): Store {
  const g = globalThis as typeof globalThis & { [STORE_KEY]?: Store };
  const store = (g[STORE_KEY] ??= {
    session: null,
    listeners: new Set(),
  });
  store.session ??= null;
  return store;
}

function emit() {
  getStore().listeners.forEach((l) => l());
}

export function subscribeCompareOverlay(listener: Listener): () => void {
  getStore().listeners.add(listener);
  return () => getStore().listeners.delete(listener);
}

export function getCompareOverlay(): CompareOverlaySession {
  return getStore().session;
}

export function openCompareOverlay(
  next?: NonNullable<CompareOverlaySession>
): void {
  getStore().session = {
    left: next?.left,
    right: next?.right,
    subject: next?.subject ?? 'project',
    step: next?.step,
    stepSide: next?.stepSide,
    arm: next?.arm,
    ready: next?.ready,
  };
  emit();
}

/** Update step/arm while the comparator stays open (deep-link sync). */
export function patchCompareOverlay(
  patch: Partial<NonNullable<CompareOverlaySession>>
): void {
  const cur = getStore().session;
  if (!cur) return;
  getStore().session = { ...cur, ...patch };
  emit();
}

export function closeCompareOverlay(): void {
  if (!getStore().session) return;
  getStore().session = null;
  emit();
}
