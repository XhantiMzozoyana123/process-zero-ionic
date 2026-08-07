export interface Meeting {
  id?: number;
  userId?: string;
  clientId?: number;
  productId?: number;
  meetingDate: string; // ISO string
  notes?: string;
  calBookingUid?: string;    // cal.com booking UID
  calMeetingUrl?: string;    // cal.com meeting URL (video link)
  createdAt?: string;
  updatedAt?: string;
  // ── Opportunity fields ──────────────────────────────────
  budget?: number;
  commission?: number;
  opportunityStatus?: OpportunityStatus;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
}

export enum OpportunityStatus {
  Available = 0,
  Claimed = 1,
  InProgress = 2,
  Closed = 3,
  Cancelled = 4
}

export const OpportunityStatusLabels: Record<OpportunityStatus, string> = {
  [OpportunityStatus.Available]: 'Available',
  [OpportunityStatus.Claimed]: 'Claimed',
  [OpportunityStatus.InProgress]: 'In Progress',
  [OpportunityStatus.Closed]: 'Closed',
  [OpportunityStatus.Cancelled]: 'Cancelled'
};
