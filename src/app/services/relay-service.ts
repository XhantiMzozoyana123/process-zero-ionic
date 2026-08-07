import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { 
  RelayCampaign, 
  RelaySequence, 
  RelayEmailVariant, 
  RelayLead, 
  RelayCampaignLead, 
  RelayEmailAccount, 
  OverallStatisticsDto, 
  AccountStatisticsDto, 
  LeadStatisticsDto, 
  RelayEmail, 
  VariantStatisticsDto,
  CampaignStatisticsDto,
  RelayAccountResponseDto,
  RelayAccountStatisticsSummaryDto,
  RelayEmailReplyDto,
  UpsertContactResponseDto
} from './../models/dtos/relay-dto.model';

@Injectable({
  providedIn: 'root'
})
export class RelayService {
  private apiUrl = `${environment.apiUrl}/relay`;
  private googleAuthApiUrl = `${environment.apiUrl}/googleauth`;
  private inboxApiUrl = `${environment.apiUrl}/relayinbox`;

  constructor(private http: HttpClient) {}

  // Campaigns
  getCampaigns(): Observable<RelayCampaign[]> {
    return this.http.get<RelayCampaign[]>(`${this.apiUrl}/campaigns`);
  }

  getCampaign(id: number): Observable<RelayCampaign> {
    return this.http.get<RelayCampaign>(`${this.apiUrl}/campaigns/${id}`);
  }

  createCampaign(campaign: RelayCampaign): Observable<RelayCampaign> {
    return this.http.post<RelayCampaign>(`${this.apiUrl}/campaigns`, campaign);
  }

  updateCampaign(id: number, campaign: RelayCampaign): Observable<RelayCampaign> {
    return this.http.put<RelayCampaign>(`${this.apiUrl}/campaigns/${id}`, campaign);
  }

  deleteCampaign(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${id}`);
  }

  startCampaign(id: number): Observable<RelayCampaign> {
    return this.http.post<RelayCampaign>(`${this.apiUrl}/campaigns/${id}/start`, {});
  }

  pauseCampaign(id: number): Observable<RelayCampaign> {
    return this.http.post<RelayCampaign>(`${this.apiUrl}/campaigns/${id}/pause`, {});
  }

  completeCampaign(id: number): Observable<RelayCampaign> {
    return this.http.post<RelayCampaign>(`${this.apiUrl}/campaigns/${id}/complete`, {});
  }

  getCampaignStatistics(id: number): Observable<CampaignStatisticsDto> {
    return this.http.get<CampaignStatisticsDto>(`${this.apiUrl}/campaigns/${id}/statistics`);
  }

  exportCampaignData(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/campaigns/${id}/export`, { responseType: 'blob' });
  }

  // Sequences
  getCampaignSequences(campaignId: number): Observable<RelaySequence[]> {
    return this.http.get<RelaySequence[]>(`${this.apiUrl}/campaigns/${campaignId}/sequences`);
  }

  createSequence(sequence: RelaySequence): Observable<RelaySequence> {
    return this.http.post<RelaySequence>(`${this.apiUrl}/sequences`, sequence);
  }

  getSequence(id: number): Observable<RelaySequence> {
    return this.http.get<RelaySequence>(`${this.apiUrl}/sequences/${id}`);
  }

  updateSequence(id: number, sequence: RelaySequence): Observable<RelaySequence> {
    return this.http.put<RelaySequence>(`${this.apiUrl}/sequences/${id}`, sequence);
  }

  deleteSequence(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sequences/${id}`);
  }

  reorderSequences(campaignId: number, sequenceIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/campaigns/${campaignId}/reorder-sequences`, sequenceIds);
  }

  // Variants
  getSequenceVariants(sequenceId: number): Observable<RelayEmailVariant[]> {
    return this.http.get<RelayEmailVariant[]>(`${this.apiUrl}/sequences/${sequenceId}/variants`);
  }

  createEmailVariant(variant: RelayEmailVariant): Observable<RelayEmailVariant> {
    return this.http.post<RelayEmailVariant>(`${this.apiUrl}/variants`, variant);
  }

  updateEmailVariant(id: number, variant: RelayEmailVariant): Observable<RelayEmailVariant> {
    return this.http.put<RelayEmailVariant>(`${this.apiUrl}/variants/${id}`, variant);
  }

  deleteEmailVariant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/variants/${id}`);
  }

  getVariantStatistics(sequenceId: number): Observable<VariantStatisticsDto[]> {
    return this.http.get<VariantStatisticsDto[]>(`${this.apiUrl}/sequences/${sequenceId}/statistics`);
  }

  // Leads
  getLeads(): Observable<RelayLead[]> {
    return this.http.get<RelayLead[]>(`${this.apiUrl}/leads`);
  }

  getLead(id: number): Observable<RelayLead> {
    return this.http.get<RelayLead>(`${this.apiUrl}/leads/${id}`);
  }

  getLeadByEmail(email: string): Observable<RelayLead> {
    return this.http.get<RelayLead>(`${this.apiUrl}/leads/email/${encodeURIComponent(email)}`);
  }

  createLead(lead: RelayLead): Observable<RelayLead> {
    return this.http.post<RelayLead>(`${this.apiUrl}/leads`, lead);
  }

  updateLead(id: number, lead: RelayLead): Observable<RelayLead> {
    return this.http.put<RelayLead>(`${this.apiUrl}/leads/${id}`, lead);
  }

  deleteLead(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/leads/${id}`);
  }

  importLeads(leads: RelayLead[]): Observable<{ message: string; importedCount: number }> {
    return this.http.post<{ message: string; importedCount: number }>(`${this.apiUrl}/leads/import`, leads);
  }

  markLeadAsInvalid(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/leads/${id}/mark-invalid`, {});
  }

  addLeadToCampaign(campaignId: number, leadId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/campaigns/${campaignId}/leads/${leadId}`, {});
  }

  removeLeadFromCampaign(campaignId: number, leadId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}/leads/${leadId}`);
  }

  getCampaignLeads(campaignId: number): Observable<RelayCampaignLead[]> {
    return this.http.get<RelayCampaignLead[]>(`${this.apiUrl}/campaigns/${campaignId}/leads`);
  }

  getCampaignLeadById(id: number): Observable<RelayCampaignLead> {
    return this.http.get<RelayCampaignLead>(`${this.apiUrl}/campaign-leads/${id}`);
  }

  updateCampaignLeadStatus(id: number, status: string): Observable<RelayCampaignLead> {
    return this.http.put<RelayCampaignLead>(`${this.apiUrl}/campaign-leads/${id}/status`, status);
  }

  pauseCampaignLead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/campaign-leads/${id}/pause`, {});
  }

  resumeCampaignLead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/campaign-leads/${id}/resume`, {});
  }

  // Accounts
  getRelayAccounts(): Observable<RelayAccountResponseDto[]> {
    return this.http.get<RelayAccountResponseDto[]>(`${this.apiUrl}/accounts`);
  }

  getHealthyRelayAccounts(): Observable<RelayAccountResponseDto[]> {
    return this.http.get<RelayAccountResponseDto[]>(`${this.apiUrl}/accounts/healthy`);
  }

  getRelayAccount(id: number): Observable<RelayAccountResponseDto> {
    return this.http.get<RelayAccountResponseDto>(`${this.apiUrl}/accounts/${id}`);
  }

  getEmailAccounts(): Observable<RelayAccountResponseDto[]> {
    return this.getRelayAccounts();
  }

  getEmailAccount(id: number): Observable<RelayAccountResponseDto> {
    return this.http.get<RelayAccountResponseDto>(`${this.apiUrl}/accounts/${id}`);
  }

  createEmailAccount(account: RelayEmailAccount): Observable<RelayEmailAccount> {
    return this.http.post<RelayEmailAccount>(`${this.apiUrl}/accounts`, account);
  }

  updateEmailAccount(id: number, account: RelayEmailAccount): Observable<RelayEmailAccount> {
    return this.http.put<RelayEmailAccount>(`${this.apiUrl}/accounts/${id}`, account);
  }

  deleteEmailAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounts/${id}`);
  }

  testEmailAccountConnection(id: number): Observable<{ message?: string; accountId?: number; error?: string }> {
    return this.http.post<{ message?: string; accountId?: number; error?: string }>(`${this.apiUrl}/accounts/${id}/test`, {});
  }

  refreshOAuthTokens(id: number): Observable<RelayEmailAccount> {
    return this.http.post<RelayEmailAccount>(`${this.apiUrl}/accounts/${id}/refresh`, {});
  }

  checkAccountHealth(id: number): Observable<RelayAccountResponseDto> {
    return this.http
      .post<{ account: RelayAccountResponseDto }>(`${this.apiUrl}/accounts/${id}/health-check`, {})
      .pipe(map((response) => response.account));
  }

  deactivateRelayAccount(accountId: number, reason?: string): Observable<{ message: string; account: RelayAccountResponseDto }> {
    return this.http.post<{ message: string; account: RelayAccountResponseDto }>(`${this.apiUrl}/accounts/deactivate`, {
      accountId,
      reason,
    });
  }

  reactivateRelayAccount(accountId: number): Observable<{ message: string; account: RelayAccountResponseDto }> {
    return this.http.post<{ message: string; account: RelayAccountResponseDto }>(`${this.apiUrl}/accounts/reactivate`, {
      accountId,
    });
  }

  deleteRelayAccount(accountId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/accounts/${accountId}`);
  }

  getGoogleAuthUrl(): Observable<{ authUrl: string; state: string }> {
    return this.http.get<{ authUrl: string; state: string }>(`${this.googleAuthApiUrl}/auth-url`);
  }

  exchangeGoogleAuthCallback(request: { code: string; state: string }): Observable<{
    id: number;
    emailAddress: string;
    displayName: string;
    connectedAt: string;
  }> {
    return this.http.post<{
      id: number;
      emailAddress: string;
      displayName: string;
      connectedAt: string;
    }>(`${this.googleAuthApiUrl}/callback-exchange`, request);
  }

  autoRefreshExpiringTokens(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/accounts/auto-refresh-tokens`, {});
  }

  addEmailAccountToCampaign(campaignId: number, accountId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/campaigns/${campaignId}/accounts/${accountId}`, {});
  }

  removeEmailAccountFromCampaign(campaignId: number, accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/campaigns/${campaignId}/accounts/${accountId}`);
  }

  getCampaignEmailAccounts(campaignId: number): Observable<RelayEmailAccount[]> {
    return this.http.get<RelayEmailAccount[]>(`${this.apiUrl}/campaigns/${campaignId}/accounts`);
  }

  // Analytics
  getRelayAccountStatisticsSummary(): Observable<RelayAccountStatisticsSummaryDto> {
    return this.http.get<RelayAccountStatisticsSummaryDto>(`${this.apiUrl}/statistics`);
  }

  getOverallStatistics(): Observable<OverallStatisticsDto> {
    return this.http.get<OverallStatisticsDto>(`${this.apiUrl}/statistics`);
  }

  getAccountStatistics(accountId: number): Observable<AccountStatisticsDto> {
    return this.http.get<AccountStatisticsDto>(`${this.apiUrl}/accounts/${accountId}/statistics`);
  }

  getLeadStatistics(leadId: number): Observable<LeadStatisticsDto> {
    return this.http.get<LeadStatisticsDto>(`${this.apiUrl}/leads/${leadId}/statistics`);
  }

  getCampaignEmails(campaignId: number): Observable<RelayEmail[]> {
    return this.http.get<RelayEmail[]>(`${this.apiUrl}/campaigns/${campaignId}/emails`);
  }

  getEmail(id: number): Observable<RelayEmail> {
    return this.http.get<RelayEmail>(`${this.apiUrl}/emails/${id}`);
  }

  getLeadEmails(leadId: number): Observable<RelayEmail[]> {
    return this.http.get<RelayEmail[]>(`${this.apiUrl}/leads/${leadId}/emails`);
  }

  markEmailDelivered(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/${id}/delivered`, {});
  }

  // Email Sending & Scheduling
  processPendingEmails(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/process-pending`, {});
  }

  scheduleCampaignEmails(campaignId: number): Observable<{ message: string; campaignId: number }> {
    return this.http.post<{ message: string; campaignId: number }>(`${this.apiUrl}/campaigns/${campaignId}/schedule-emails`, {});
  }

  sendTestEmail(request: { variantId: number; testEmailAddress: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/send-test`, request);
  }

  cancelScheduledEmail(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/${id}/cancel`, {});
  }

  retryFailedEmail(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emails/${id}/retry`, {});
  }

  // Public tracking
  trackEmailOpen(emailId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/track/open/${emailId}`, { responseType: 'blob' });
  }

  trackEmailClick(emailId: number, destinationUrl: string): Observable<unknown> {
    const utf8Bytes = new TextEncoder().encode(destinationUrl);
    const binary = Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join('');
    const base64Url = btoa(binary);
    return this.http.get(`${this.apiUrl}/track/click/${emailId}?url=${encodeURIComponent(base64Url)}`);
  }

  trackEmailReply(emailId: number): Observable<{ message?: string; error?: string }> {
    return this.http.post<{ message?: string; error?: string }>(`${this.apiUrl}/track/reply/${emailId}`, {});
  }

  trackEmailBounce(emailId: number, reason: string): Observable<{ message?: string; error?: string }> {
    return this.http.post<{ message?: string; error?: string }>(
      `${this.apiUrl}/track/bounce/${emailId}?reason=${encodeURIComponent(reason)}`,
      {}
    );
  }

  unsubscribeLead(leadId: number): Observable<{ message?: string; leadId?: number; error?: string }> {
    return this.http.get<{ message?: string; leadId?: number; error?: string }>(`${this.apiUrl}/unsubscribe/${leadId}`);
  }

  // Relay Inbox
  getUnreadReplies(): Observable<RelayEmailReplyDto[]> {
    return this.http.get<RelayEmailReplyDto[]>(`${this.inboxApiUrl}/unread`);
  }

  getRepliesByLead(leadLakeId: number): Observable<RelayEmailReplyDto[]> {
    return this.http.get<RelayEmailReplyDto[]>(`${this.inboxApiUrl}/lead/${leadLakeId}`);
  }

  getRepliesByRelayAccount(
    relayAccountId: number,
    pageNumber?: number,
    pageSize: number = 20
  ): Observable<RelayEmailReplyDto[]> {
    let url = `${this.inboxApiUrl}/relay/${relayAccountId}?pageSize=${pageSize}`;
    if (pageNumber != null) {
      url += `&pageNumber=${pageNumber}`;
    }
    return this.http.get<RelayEmailReplyDto[]>(url);
  }

  markReplyAsRead(emailReplyId: number): Observable<string> {
    return this.http.put(`${this.inboxApiUrl}/${emailReplyId}/mark-read`, null, { responseType: 'text' });
  }

  markRepliesAsReadBatch(emailReplyIds: number[]): Observable<string> {
    return this.http.put(`${this.inboxApiUrl}/mark-read-batch`, emailReplyIds, { responseType: 'text' });
  }

  addTagsToReply(emailReplyId: number, tags: string[]): Observable<string> {
    return this.http.put(`${this.inboxApiUrl}/${emailReplyId}/tags`, tags, { responseType: 'text' });
  }

  syncEmailReplies(relayAccountId: number, maxResults: number = 20): Observable<string> {
    return this.http.post(`${this.inboxApiUrl}/relay/${relayAccountId}/sync?maxResults=${maxResults}`, null, { responseType: 'text' });
  }

  syncAllEmailReplies(maxResults: number = 20): Observable<string> {
    return this.http.post(`${this.inboxApiUrl}/sync-all?maxResults=${maxResults}`, null, { responseType: 'text' });
  }

  searchReplies(searchTerm: string): Observable<RelayEmailReplyDto[]> {
    return this.http.get<RelayEmailReplyDto[]>(`${this.inboxApiUrl}/search?searchTerm=${encodeURIComponent(searchTerm)}`);
  }

  upsertContactFromReply(
    emailReplyId: number,
    contactStatus: string = 'Active'
  ): Observable<UpsertContactResponseDto> {
    return this.http.post<UpsertContactResponseDto>(
      `${this.inboxApiUrl}/admin/upsert-contact?emailReplyId=${emailReplyId}&contactStatus=${encodeURIComponent(contactStatus)}`,
      null
    );
  }
}
