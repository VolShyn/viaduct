import { request } from './http/client';
import type { CompareRef, CompareResult, CompareSubject } from './types';

/** Serialize a side the way GET /compare expects it. */
export function formatCompareRef(side: CompareRef | string): string {
  if (typeof side === 'string') return side;
  return `${side.projectId}@${side.ref}`;
}

export function parseCompareRef(raw: string): CompareRef | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const value = raw.trim();
  if (value.startsWith('branch:')) {
    const branchId = value.slice('branch:'.length).trim();
    if (!branchId) return null;
    return { projectId: branchId, ref: 'current' };
  }
  const at = value.lastIndexOf('@');
  if (at <= 0 || at === value.length - 1) return null;
  return { projectId: value.slice(0, at), ref: value.slice(at + 1) };
}

export const compareApi = {
  compare: (
    projectId: string,
    left: CompareRef | string,
    right: CompareRef | string,
    subject: CompareSubject = 'project'
  ) => {
    const params = new URLSearchParams({
      left: formatCompareRef(left),
      right: formatCompareRef(right),
      subject,
    });
    return request<CompareResult>(`/api/projects/${projectId}/compare?${params}`);
  },
};
