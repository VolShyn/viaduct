import { useFlatC4Store } from '@archivisio/c4-modelizer-sdk';
import { attachDeclaredTagsToBrowser } from '@/features/tags/declaredTags';

/**
 * Drop the guest/local canvas and any browser-only leftovers.
 * Community edition has no collab persist gate — just clear the flat store.
 */
const DECLARED_TAGS_KEY = 'c4-declared-tags';

const EMPTY_MODEL = {
  viewLevel: 'system' as const,
  systems: [],
  containers: [],
  components: [],
  codeElements: [],
  activeSystemId: undefined,
  activeContainerId: undefined,
  activeComponentId: undefined,
};

export function clearSessionLocalState(): void {
  useFlatC4Store.getState().setModel({ ...EMPTY_MODEL });

  try {
    useFlatC4Store.persist.clearStorage();
  } catch {
    /* private mode / missing storage */
  }

  try {
    window.localStorage.removeItem(DECLARED_TAGS_KEY);
  } catch {
    /* ignore */
  }
  attachDeclaredTagsToBrowser();
}
