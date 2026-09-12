/**
 * Whether the branch list is open, and which branch it should land on.
 *
 * A full workspace surface like the change-set catalog, so the flag lives
 * outside the component that opens it: the version rail asks for it, the editor
 * page renders it, and neither owns the other.
 */

type BranchesOverlaySession = {
  selectedId?: string;
} | null;

type Listener = () => void;

type Store = {
  session: BranchesOverlaySession;
  listeners: Set<Listener>;
};

const STORE_KEY = '__c4BranchesOverlayUi__';

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

export function subscribeBranchesOverlay(listener: Listener): () => void {
  getStore().listeners.add(listener);
  return () => getStore().listeners.delete(listener);
}

export function getBranchesOverlay(): BranchesOverlaySession {
  return getStore().session;
}

export function openBranchesOverlay(
  next?: NonNullable<BranchesOverlaySession>
): void {
  getStore().session = { selectedId: next?.selectedId };
  emit();
}

export function closeBranchesOverlay(): void {
  if (!getStore().session) return;
  getStore().session = null;
  emit();
}
