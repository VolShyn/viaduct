/**
 * Whether the change-set catalog is open, and which row it should land on.
 *
 * The catalog is a full workspace surface like the service catalog, so the flag
 * lives outside the component that opens it: the version rail asks for it, the
 * editor page renders it, and neither owns the other.
 */

type ChangeSetsOverlaySession = {
  selectedId?: string;
} | null;

type Listener = () => void;

type Store = {
  session: ChangeSetsOverlaySession;
  listeners: Set<Listener>;
};

const STORE_KEY = '__c4ChangeSetsOverlayUi__';

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

export function subscribeChangeSetsOverlay(listener: Listener): () => void {
  getStore().listeners.add(listener);
  return () => getStore().listeners.delete(listener);
}

export function getChangeSetsOverlay(): ChangeSetsOverlaySession {
  return getStore().session;
}

export function openChangeSetsOverlay(
  next?: NonNullable<ChangeSetsOverlaySession>
): void {
  getStore().session = { selectedId: next?.selectedId };
  emit();
}

export function closeChangeSetsOverlay(): void {
  if (!getStore().session) return;
  getStore().session = null;
  emit();
}
