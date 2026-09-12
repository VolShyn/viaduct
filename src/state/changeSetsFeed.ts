/**
 * "Something moved in this project's change sets."
 *
 * Change sets are the one part of the model that changes without anyone
 * touching the app: an agent reports progress over MCP and the status derives
 * itself from the evidence. The server knows exactly when that happens, so it
 * says so on the collaboration socket instead of every open screen guessing on
 * a timer.
 *
 * The push carries no data on purpose — the screen that cares already knows how
 * to fetch the list, and a second copy of that shape here would be one more
 * thing to keep in step with the API.
 */

export type ChangeSetsPulse = {
  projectId: string;
  /** Server time of the write. Changes on every push, so it drives the effect. */
  at: string;
  /** Which change set moved, when the server knows. */
  changeSetId: string | null;
};

let current: ChangeSetsPulse | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setChangeSetsPulse(pulse: ChangeSetsPulse): void {
  current = pulse;
  emit();
}

/** Called when leaving a project, so the next one does not inherit its pulse. */
export function clearChangeSetsPulse(): void {
  if (!current) return;
  current = null;
  emit();
}

export function subscribeChangeSetsPulse(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChangeSetsPulse(): ChangeSetsPulse | null {
  return current;
}
