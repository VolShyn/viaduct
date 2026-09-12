/**
 * Community: catalog / flows run against the in-browser flat store.
 */
export function useCatalogProject(_options?: {
  enabled?: boolean;
  projectId?: string | null;
  projectMode?: boolean;
  embedded?: boolean;
  user?: unknown;
  authLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setModel?: (m: any) => void;
  requireAuth?: boolean;
  [key: string]: unknown;
}) {
  return {
    projectId: null as string | null,
    projectName: null as string | null,
    loading: false,
    loadError: null as string | null,
    error: null as string | null,
    access: 'owner' as 'owner' | 'edit' | 'view',
    signInRequired: false,
    isLocal: true,
    canWrite: true,
    handleRenameProject: async (_name: string) => {},
    model: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setModel: (_m: any) => {},
  };
}
