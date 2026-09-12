import { request } from './http/client';
import type { ProjectDiff } from './types';
import type { FlatC4Model } from '@archivisio/c4-modelizer-sdk';

export type BranchStatus = 'open' | 'merged' | 'abandoned';

export type ProjectBranch = {
  id: string;
  name: string;
  description: string | null;
  status: BranchStatus;
  base_snapshot_id: string;
  /** The trunk version this forked from, when it was made from a named one. */
  fork_snapshot_id: string | null;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  owner: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
};

/**
 * What the two sides could not agree on.
 *
 * `kind` says what the reviewer is being asked, and the options follow from it:
 * a field or text conflict picks a side, a delete that met an edit keeps or
 * drops the element, a reordered flow picks an order, and a reference left
 * pointing at nothing is either restored or dropped.
 */
export type MergeConflictKind = 'field' | 'text' | 'delete-modify' | 'order' | 'dangling';

export type MergeConflict = {
  id: string;
  kind: MergeConflictKind;
  scope: string;
  level?: string;
  ref: string;
  name?: string;
  field?: string;
  base: unknown;
  ours: unknown;
  theirs: unknown;
  options: string[];
  suggestion: string;
  /** delete-modify: which side removed the element. */
  deletedBy?: 'ours' | 'theirs';
  /** dangling: what is missing, and how it is referenced. */
  missingId?: string;
  missingKind?: string;
  /** Recovered from the side that still has it — the model being merged does not. */
  missingName?: string | null;
  via?: string;
  detail?: string;
};

/** A chosen side, or a value typed by hand for a text conflict. */
export type MergeResolution = string | { value: unknown };

export type MergeResolutions = Record<string, MergeResolution>;

export type MergePreview = {
  /** Identity of trunk's content, to be handed back when committing. */
  revision: string;
  fast_forward: boolean;
  clean: boolean;
  conflicts: MergeConflict[];
  resolved: { id: string; choice: string }[];
  /** Trunk → what trunk becomes, so the canvas can draw the merge. */
  diff: ProjectDiff;
};

export type MergeResult = {
  ok: boolean;
  model: FlatC4Model;
  resolved: { id: string; choice: string }[];
  before_snapshot_id: string | null;
};

export type MergeReviewer = {
  gitlab_user_id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  /** The branch author, who cannot approve their own branch. */
  is_author?: boolean;
  /** When they approved this branch, null while it is still on them. */
  approved_at?: string | null;
};

export type MergeApproval = {
  gitlab_user_id: string;
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  approved_at: string;
};

/** Why the viewer has no Approve button — `null` when they do. */
export type MergeApprovalBlock =
  | 'disabled'
  | 'author'
  | 'gitlab_required'
  | 'not_a_reviewer'
  | 'approved';

export type MergeReviewState = {
  required: number;
  approved: number;
  satisfied: boolean;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  reviewers: MergeReviewer[];
  approvals: MergeApproval[];
  /** Approved, then taken out of the pool — the review still happened. */
  approvals_outside_pool?: MergeApproval[];
  can_approve: boolean;
  can_revoke: boolean;
  viewer_in_pool: boolean;
  viewer_is_author: boolean;
  viewer_blocked: MergeApprovalBlock | null;
};

/** A branch plus where it came from — what the editor banner needs. */
export type BranchContext = ProjectBranch & {
  parent: { id: string; name: string | null };
};

export const branchesApi = {
  /* Asked about the project currently open: null means it is not a branch. */
  getBranchContext: (projectId: string) =>
    request<{ branch: BranchContext | null }>(`/api/projects/${projectId}/branches/self`),

  listBranches: (projectId: string) =>
    request<{ branches: ProjectBranch[] }>(`/api/projects/${projectId}/branches`),

  createBranch: (projectId: string, input: { name: string; description?: string; fromSnapshotId?: string }) =>
    request<{ ok: boolean; branch: ProjectBranch }>(`/api/projects/${projectId}/branches`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getBranch: (projectId: string, branchId: string) =>
    request<{ branch: ProjectBranch }>(`/api/projects/${projectId}/branches/${branchId}`),

  /* POST, not GET: resolutions are part of the question, and a preview with
     twenty of them does not belong in a query string. */
  previewMerge: (projectId: string, branchId: string, resolutions: MergeResolutions = {}) =>
    request<MergePreview>(`/api/projects/${projectId}/branches/${branchId}/merge-preview`, {
      method: 'POST',
      body: JSON.stringify({ resolutions }),
    }),

  mergeBranch: (
    projectId: string,
    branchId: string,
    input: { resolutions?: MergeResolutions; expectedRevision?: string }
  ) =>
    request<MergeResult>(`/api/projects/${projectId}/branches/${branchId}/merge`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getMergeReview: (projectId: string, branchId: string) =>
    request<MergeReviewState>(`/api/projects/${projectId}/branches/${branchId}/merge-review`),

  approveBranch: (projectId: string, branchId: string) =>
    request<MergeReviewState>(`/api/projects/${projectId}/branches/${branchId}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  revokeBranchApproval: (projectId: string, branchId: string) =>
    request<MergeReviewState>(`/api/projects/${projectId}/branches/${branchId}/approve`, {
      method: 'DELETE',
    }),

  /* Delete, not abandon: the fork that was never anything. Snapshots and docs
     go with it through the project's foreign keys. */
  deleteBranch: (projectId: string, branchId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/branches/${branchId}`, {
      method: 'DELETE',
    }),

  abandonBranch: (projectId: string, branchId: string) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}/branches/${branchId}/abandon`, {
      method: 'POST',
    }),
};
