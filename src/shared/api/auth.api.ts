import { request } from './http/client';
import type {
  AccessRequestPayload,
  ApiTokenScope,
  ApiTokenStatus,
  AuthProviders,
  SupportPayload,
  User,
} from './types';

export function isGuestUser(user: User | null | undefined): boolean {
  return user?.kind === 'guest';
}

/**
 * Signed in through GitLab — the only kind that has groups to share with.
 * A Google account shares by link, which is the mechanism built for people
 * outside the organisation in the first place.
 */
export function hasGitlabIdentity(user: User | null | undefined): boolean {
  return user?.kind === 'gitlab';
}

/**
 * Branded login page; optional safe relative returnTo after OAuth.
 * `expired` marks the trip as one the person did not choose to make, so the
 * screen can say why they are looking at it.
 */
export function loginPagePath(
  returnTo?: string | null,
  opts?: { expired?: boolean }
): string {
  const params = new URLSearchParams();
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    params.set('returnTo', returnTo);
  }
  if (opts?.expired) params.set('expired', '1');
  const query = params.toString();
  return query ? `/login?${query}` : '/login';
}

export const authApi = {
  me: (opts?: { idle?: boolean }) =>
    request<{ user: User | null; providers?: AuthProviders }>('/api/me', undefined, {
      idle: opts?.idle,
    }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  getApiToken: () => request<ApiTokenStatus>('/api/auth/api-token'),
  createApiToken: (name?: string, scopes?: ApiTokenScope[]) =>
    request<{
      id: string;
      token: string;
      name: string;
      createdAt: string;
      expiresAt: string | null;
      scopes: string;
      hint: string;
    }>('/api/auth/api-token', {
      method: 'POST',
      body: JSON.stringify({
        ...(name ? { name } : {}),
        ...(scopes?.length ? { scopes } : {}),
      }),
    }),
  revokeApiToken: (id: string) =>
    request<{ ok: boolean }>(`/api/auth/api-token/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  revokeAllApiTokens: () =>
    request<{ ok: boolean }>('/api/auth/api-token', { method: 'DELETE' }),
  loginUrl: '/api/auth/gitlab',
};

export const supportApi = {
  requestAccess: (payload: AccessRequestPayload) =>
    request<{ ok: boolean }>('/api/access-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  sendSupportMessage: (payload: SupportPayload) =>
    request<{ ok: boolean }>('/api/support', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export { onUnauthorized } from './http/client';
