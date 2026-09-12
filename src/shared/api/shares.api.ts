import { request } from './http/client';
import type {
  GitlabGroup,
  GitlabUser,
  Project,
  ProjectAccess,
  ProjectShare,
  ProjectShareLink,
  User,
} from './types';

export const sharesApi = {
  listShares: (projectId: string) =>
    request<{ shares: ProjectShare[] }>(`/api/projects/${projectId}/shares`),
  createShare: (
    projectId: string,
    payload: { type: 'group' | 'user'; gitlabId: string; role: 'view' | 'edit'; label?: string }
  ) =>
    request<{ share: ProjectShare }>(`/api/projects/${projectId}/shares`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateShare: (projectId: string, shareId: string, role: 'view' | 'edit') =>
    request<{ share: ProjectShare }>(`/api/projects/${projectId}/shares/${shareId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteShare: (projectId: string, shareId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/shares/${shareId}`, {
      method: 'DELETE',
    }),
  getShareLink: (projectId: string) =>
    request<{ shareLink: ProjectShareLink | null }>(`/api/projects/${projectId}/share-link`),
  createShareLink: (projectId: string, role: 'view' | 'edit') =>
    request<{ shareLink: ProjectShareLink; created?: boolean }>(
      `/api/projects/${projectId}/share-link`,
      { method: 'POST', body: JSON.stringify({ role }) }
    ),
  updateShareLink: (projectId: string, payload: { role?: 'view' | 'edit'; rotate?: boolean }) =>
    request<{ shareLink: ProjectShareLink }>(`/api/projects/${projectId}/share-link`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteShareLink: (projectId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/share-link`, { method: 'DELETE' }),
  redeemShareLink: (token: string) =>
    request<{ projectId: string; access: ProjectAccess; createdGuest?: boolean }>(
      '/api/share/redeem',
      { method: 'POST', body: JSON.stringify({ token }) }
    ),
  publishShare: (payload: { name?: string; model?: unknown; role: 'view' | 'edit' }) =>
    request<{
      project: Project;
      shareLink: ProjectShareLink;
      user: User;
      createdGuest?: boolean;
    }>('/api/share/publish', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export const gitlabApi = {
  listGitlabGroups: () => request<{ groups: GitlabGroup[] }>('/api/gitlab/groups'),
  searchGitlabUsers: (username: string) =>
    request<{ users: GitlabUser[] }>(`/api/gitlab/users?username=${encodeURIComponent(username)}`),
};
