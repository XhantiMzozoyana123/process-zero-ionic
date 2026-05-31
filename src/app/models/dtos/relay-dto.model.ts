export interface RelayCampaign {
  id?: number;
  name: string;
  sentToday?: number;
  dailySendLimit?: number;
  timeZone?: string;
  sendingWindowStart?: number;
  sendingWindowEnd?: number;
  sendingDays?: string;
  minutesBetweenEmails?: number;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  sequences?: RelaySequence[];
  campaignLeads?: RelayCampaignLead[];
  campaignEmailAccounts?: RelayCampaignEmailAccount[];
}

export interface RelaySequence {
  id?: number;
  campaignId: number;
  stepNumber: number;
  delayDays: number;
  stepType?: string;
  isActive?: boolean;
  emailVariants?: RelayEmailVariant[];
}

export interface RelayEmailVariant {
  id?: number;
  sequenceId: number;
  variantName: string;
  subject: string;
  body: string;
  trafficPercentage?: number;
  totalSent?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalReplied?: number;
  isActive?: boolean;
}

export interface RelayLead {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  jobTitle?: string;
  phone?: string;
  linkedInUrl?: string;
  websiteUrl?: string;
  location?: string;
  country?: string;
  industry?: string;
  companySize?: string;
  customField1?: string;
  customField2?: string;
  customField3?: string;
  tags?: string;
  timeZone?: string;
  isUnsubscribed?: boolean;
  isInvalid?: boolean;
}

export interface RelayCampaignLead {
  id?: number;
  campaignId: number;
  leadId: number;
  status?: string;
  currentSequenceStep?: number;
  emailsSent?: number;
  emailsOpened?: number;
  emailsClicked?: number;
  emailsReplied?: number;
  emailsBounced?: number;
  assignedVariant?: string;
}

export interface RelayCampaignEmailAccount {
  id?: number;
  campaignId?: number;
  emailAccountId?: number;
}

export interface RelayEmailAccount {
  id?: number;
  userId?: string;
  emailAddress?: string;
  displayName?: string;
  provider?: number | string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  isActive?: boolean;
  dailySendLimit?: number;
  sentToday?: number;
  reputationScore?: number;
  healthStatus?: number | string;
  healthCheckError?: string;
  lastHealthCheckAt?: string;
}

export interface RelayEmail {
  id?: number;
  campaignId?: number;
  leadId?: number;
  sequenceId?: number;
  variantId?: number;
  emailAccountId?: number;
  subject?: string;
  body?: string;
  status?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
  bouncedAt?: string;
  openCount?: number;
  clickCount?: number;
  providerMessageId?: string;
  threadId?: string;
  attemptCount?: number;
  errorMessage?: string;
  bounceReason?: string;
}

export interface CampaignStatisticsDto {
  campaignId: number;
  campaignName?: string;
  totalLeads?: number;
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
  bounceRate?: number;
  unsubscribeRate?: number;
}

export interface VariantStatisticsDto {
  variantId: number;
  variantName?: string;
  totalSent?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalReplied?: number;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
}

export interface OverallStatisticsDto {
  totalCampaigns?: number;
  activeCampaigns?: number;
  totalLeads?: number;
  totalEmailAccounts?: number;
  totalEmailsSent?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalReplied?: number;
  totalBounced?: number;
  overallOpenRate?: number;
  overallClickRate?: number;
  overallReplyRate?: number;
  overallBounceRate?: number;
}

export interface AccountStatisticsDto {
  accountId: number;
  emailAddress?: string;
  totalEmailsSent?: number;
  totalDelivered?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalReplied?: number;
  totalBounced?: number;
  reputationScore?: number;
  healthStatus?: string;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
  bounceRate?: number;
}

export interface LeadStatisticsDto {
  leadId: number;
  email?: string;
  totalCampaigns?: number;
  totalEmailsSent?: number;
  totalOpened?: number;
  totalClicked?: number;
  totalReplied?: number;
  totalBounced?: number;
  lastEmailDate?: string;
  openRate?: number;
  clickRate?: number;
  replyRate?: number;
}

export interface RelayAccountResponseDto {
  id: number;
  emailAddress: string;
  displayName: string;
  isActive: boolean;
  healthStatus: number;
  sentToday: number;
  dailySendLimit: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelayAccountStatisticsSummaryDto {
  totalAccounts: number;
  healthyAccounts: number;
  warningAccounts: number;
  criticalAccounts: number;
  totalSentToday: number;
  totalDailyCapacity: number;
  capacityUsedPercentage: number;
  message: string;
}

export interface LeadLakeDto {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  job?: string;
  location?: string;
  userId?: string;
}

export interface RelayEmailReplyDto {
  id: number;
  relayEmailAccountId: number;
  leadLakeId: number;
  messageId: string;
  fromEmail: string;
  subject: string;
  body: string;
  receivedDate: string;
  isRead: boolean;
  userId: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
  lead?: LeadLakeDto;
}

export interface UpsertContactResponseDto {
  message: string;
  contact: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    status: string;
  };
}
