import { request } from './http/client';
import type { DomainElement, DomainMapEdge, DomainMapElement, WorkspaceSearchElement } from './types';

export const dataFlowsApi = {
  upsertDataFlow: (
    projectId: string,
    payload: {
      flowId?: string;
      name?: string;
      description?: string;
      steps?: unknown[];
      documentationIds?: string[];
      sequenceIds?: string[];
      magicSequenceId?: string;
      magicSequenceSourceKey?: string;
    }
  ) =>
    request<{ ok: boolean; created?: boolean; flow?: unknown }>(
      `/api/projects/${projectId}/data-flows`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  upsertSequence: (
    projectId: string,
    payload: {
      ownerType: 'container' | 'component';
      ownerId: string;
      name: string;
      plantUmlSource: string;
      diagramId?: string;
    }
  ) =>
    request<{
      ok: boolean;
      created?: boolean;
      diagram?: { id: string; name: string; plantUmlSource: string };
      ownerType?: 'container' | 'component';
      ownerId?: string;
    }>(`/api/projects/${projectId}/sequences`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteDataFlow: (projectId: string, flowId: string) =>
    request<{ ok: boolean; flow?: unknown }>(
      `/api/projects/${projectId}/data-flows/${flowId}`,
      { method: 'DELETE' }
    ),
  upsertDataFlowStep: (
    projectId: string,
    flowId: string,
    payload: {
      stepId?: string;
      index?: number;
      name?: string;
      description?: string;
      from?: { id: string; type: string };
      to?: { id: string; type: string };
      endpointIds?: string[];
      channelIds?: string[];
      connections?: { sourceId: string; targetId: string }[];
      parallelGroupId?: string;
      branchKind?: 'parallel' | 'alternative';
      branchArmId?: string;
    }
  ) =>
    request<{ ok: boolean; created?: boolean; flow?: unknown; step?: unknown }>(
      `/api/projects/${projectId}/data-flows/${flowId}/steps`,
      { method: 'POST', body: JSON.stringify(payload) }
    ),
  deleteDataFlowStep: (projectId: string, flowId: string, stepId: string) =>
    request<{ ok: boolean; flow?: unknown; step?: unknown }>(
      `/api/projects/${projectId}/data-flows/${flowId}/steps/${stepId}`,
      { method: 'DELETE' }
    ),
};

export const domainsApi = {
  getDomainMap: () =>
    request<{ domains: DomainMapElement[]; edges: DomainMapEdge[] }>('/api/domain-map'),
  listDomainElements: (params?: {
    level?: 'system' | 'container';
    q?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.level) query.set('level', params.level);
    if (params?.q) query.set('q', params.q);
    if (params?.limit != null) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    const suffix = query.toString() ? `?${query}` : '';
    return request<{ elements: DomainElement[]; hasMore: boolean; total: number }>(
      `/api/domain-elements${suffix}`
    );
  },
  searchWorkspaceElements: (params: {
    projectId: string;
    q: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams({ projectId: params.projectId, q: params.q });
    if (params.limit != null) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));
    return request<{ elements: WorkspaceSearchElement[]; hasMore: boolean; total: number }>(
      `/api/workspace-search?${query}`
    );
  },
};
