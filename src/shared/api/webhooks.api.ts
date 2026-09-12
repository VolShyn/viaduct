import { request } from './http/client';

export type WebhookEvent =
  | 'element.created'
  | 'element.updated'
  | 'element.deleted'
  | 'connection.created'
  | 'connection.updated'
  | 'connection.deleted'
  | 'change_set.status_changed';

export type Webhook = {
  id: string;
  url: string;
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: string;
  lastDeliveryAt: string | null;
  lastStatus: number | null;
  consecutiveFailures: number;
  disabledReason: string | null;
};

export type WebhookDelivery = {
  id: string;
  event: string;
  attempt: number;
  statusCode: number | null;
  error: string | null;
  deliveredAt: string | null;
  createdAt: string;
  nextAttemptAt: string | null;
};

const base = (projectId: string) => `/api/projects/${encodeURIComponent(projectId)}/webhooks`;

export const webhooksApi = {
  list: (projectId: string) =>
    request<{ webhooks: Webhook[]; eventTypes: WebhookEvent[] }>(base(projectId)),
  create: (projectId: string, url: string, events: WebhookEvent[]) =>
    request<{ webhook: Webhook; secret: string; verify: string }>(base(projectId), {
      method: 'POST',
      body: JSON.stringify({ url, events }),
    }),
  setEnabled: (projectId: string, id: string, enabled: boolean) =>
    request<{ webhook: Webhook }>(`${base(projectId)}/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),
  remove: (projectId: string, id: string) =>
    request<{ ok: boolean }>(`${base(projectId)}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  deliveries: (projectId: string, id: string) =>
    request<{ deliveries: WebhookDelivery[] }>(
      `${base(projectId)}/${encodeURIComponent(id)}/deliveries`
    ),
  ping: (projectId: string, id: string) =>
    request<{ deliveries: WebhookDelivery[] }>(
      `${base(projectId)}/${encodeURIComponent(id)}/ping`,
      { method: 'POST' }
    ),
};
