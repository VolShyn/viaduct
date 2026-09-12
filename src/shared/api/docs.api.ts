import { request } from './http/client';
import type { ProjectDocumentation } from './types';

export const docsApi = {
  listProjectDocs: (projectId: string, ownerType?: string, ownerId?: string) => {
    const params = new URLSearchParams();
    if (ownerType) params.set('ownerType', ownerType);
    if (ownerId) params.set('ownerId', ownerId);
    const q = params.toString();
    return request<{ docs: ProjectDocumentation[] }>(
      `/api/projects/${projectId}/docs${q ? `?${q}` : ''}`
    );
  },
  createProjectDoc: (
    projectId: string,
    payload: {
      id?: string;
      ownerType: 'system' | 'container' | 'component' | 'code';
      ownerId: string;
      title: string;
      markdown: string;
    }
  ) =>
    request<{ doc: ProjectDocumentation }>(`/api/projects/${projectId}/docs`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProjectDoc: (
    projectId: string,
    docId: string,
    payload: {
      title?: string;
      markdown?: string;
      ownerType?: 'system' | 'container' | 'component' | 'code';
      ownerId?: string;
    }
  ) =>
    request<{ doc: ProjectDocumentation }>(`/api/projects/${projectId}/docs/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProjectDoc: (projectId: string, docId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/docs/${docId}`, {
      method: 'DELETE',
    }),
};
