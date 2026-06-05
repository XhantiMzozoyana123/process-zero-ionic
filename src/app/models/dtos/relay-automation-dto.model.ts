// DTOs for the RelayCampaignController (api/relay/campaigns).
// These mirror the backend records/DTOs 1:1 (System.Text.Json camelCase).

// ── Campaign lifecycle ──────────────────────────────

/** GET api/relay/campaigns (list) — one card per campaign. */
export interface CampaignSummaryDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  activeLeadCount: number;
  totalLeadCount: number;
  createdAt: string;
  // RelayCampaign scheduling / throttling columns
  dailySendLimit?: number;
  startDate?: string | null;
  endDate?: string | null;
}

/** GET api/relay/campaigns/{id} — full detail with lead breakdown. */
export interface CampaignDetailDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  totalLeadCount: number;
  activeLeadCount: number;
  completedLeadCount: number;
  repliedLeadCount: number;
  createdAt: string;
  updatedAt?: string;
  // RelayCampaign scheduling / throttling columns
  dailySendLimit?: number;
  startDate?: string | null;
  endDate?: string | null;
}

/**
 * A/B email message variant — the actual subject + HTML body sent for a step.
 * `weight` controls the A/B split (e.g. 50 / 50).
 */
export interface CreateEmailVariantRequest {
  subject: string;
  htmlBody: string;
  variantName?: string; // "A", "B", ...
  weight?: number; // A/B split (default 50)
}

/** A single touch in a sequence cadence (a step holds one or more A/B variants). */
export interface CreateSequenceStepRequest {
  name: string;
  stepOrder: number; // send order within the sequence
  delayDays?: number; // wait before this step (0 = send immediately)
  isActive?: boolean;
  variants?: CreateEmailVariantRequest[];
}

/** An email cadence: campaign -> sequences -> steps -> variants. */
export interface CreateSequenceRequest {
  name: string;
  messageRotationEnabled?: boolean;
  inboxRotationEnabled?: boolean;
  steps?: CreateSequenceStepRequest[];
}

/**
 * POST api/relay/campaigns — builds the full campaign graph in one transaction:
 * campaign -> sequences -> steps -> A/B variants, plus sending inboxes and enrolled leads.
 * Only `name` is required; every collection is optional.
 */
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  dailySendLimit?: number;
  startDate?: string | null;
  endDate?: string | null;
  sequences?: CreateSequenceRequest[];
  inboxAccountIds?: number[];
  leadIds?: number[];
}


export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  dailySendLimit?: number;
  startDate?: string | null;
  endDate?: string | null;
}


// ── CSV import (background job) ──────────────────────

/** 202 response when a CSV import is enqueued. */
export interface ImportJobDto {
  jobId: string;
  message: string;
}

/** GET .../import/{jobId}/status — progress of a running import. */
export interface ImportStatusDto {
  jobId?: string;
  campaignId?: number;
  status?: string; // Pending | Processing | Completed | Failed
  totalRows?: number;
  processedRows?: number;
  importedCount?: number;
  failedCount?: number;
  message?: string;
  isComplete?: boolean;
  startedAt?: string;
  completedAt?: string;
}

// ── Campaign execution ──────────────────────────────

/** 202 response when a campaign run is enqueued to Hangfire. */
export interface CampaignJobDto {
  hangfireJobId: string;
  message: string;
  queue: string;
}

export interface StartCampaignRequest {
  hangfireQueueName?: string;
}

// ── Batch lead modification (add / remove / edit) ────

export type CampaignLeadStatus =
  | 'Pending'
  | 'Active'
  | 'Replied'
  | 'Completed'
  | 'Bounced'
  | 'Unsubscribed';

export interface BatchLeadEditItem {
  leadId: number;
  currentSequenceStepId?: number | null;
  status?: CampaignLeadStatus | string | null;
  replied?: boolean | null;
  unsubscribed?: boolean | null;
  completed?: boolean | null;
}

export interface BatchLeadModificationRequest {
  add?: number[];
  remove?: number[];
  edit?: BatchLeadEditItem[];
}

/** POST .../leads/batch result — mirrors backend BatchResultDto(Added, Removed, Updated, Errors). */
export interface BatchResultDto {
  added?: number;
  removed?: number;
  updated?: number;
  errors?: string[];
}


