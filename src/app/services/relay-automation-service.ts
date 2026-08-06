import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import {
  CampaignSummaryDto,
  CampaignDetailDto,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  ImportJobDto,
  ImportStatusDto,
  CampaignJobDto,
  BatchLeadModificationRequest,
  BatchResultDto,
} from '../models/dtos/relay-automation-dto.model';

/**
 * Maps 1:1 to the backend RelayCampaignController
 * ([Route("api/relay/campaigns")], [Authorize(Roles = "Admin")]).
 *
 * Instantly/Lemlist-style campaign lifecycle:
 *   create → import CSV leads (or batch-add from LeadLake) → batch-modify leads
 *          → activate/pause → start → delete.
 *
 * Long-running work (CSV import, campaign run) is queued via Hangfire and returns
 * a job id the UI can poll/track.
 */
@Injectable({
  providedIn: 'root',
})
export class RelayAutomationService {
  private apiUrl = `${environment.apiUrl}/relay/campaigns`;

  constructor(private http: HttpClient) {}

  // ── Campaign CRUD ─────────────────────────────────

  /** GET api/relay/campaigns?skip=&take= */
  listCampaigns(skip = 0, take = 50): Observable<CampaignSummaryDto[]> {
    return this.http.get<CampaignSummaryDto[]>(
      `${this.apiUrl}?skip=${skip}&take=${take}`
    );
  }

  /** GET api/relay/campaigns/{id} */
  getCampaign(campaignId: number): Observable<CampaignDetailDto> {
    return this.http.get<CampaignDetailDto>(`${this.apiUrl}/${campaignId}`);
  }

  /** POST api/relay/campaigns */
  createCampaign(request: CreateCampaignRequest): Observable<CampaignSummaryDto> {
    return this.http.post<CampaignSummaryDto>(this.apiUrl, request);
  }

  /** PUT api/relay/campaigns/{id} */
  updateCampaign(
    campaignId: number,
    request: UpdateCampaignRequest
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${campaignId}`,
      request
    );
  }

  /** POST api/relay/campaigns/{id}/activate */
  activateCampaign(campaignId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${campaignId}/activate`,
      {}
    );
  }

  /** POST api/relay/campaigns/{id}/pause */
  pauseCampaign(campaignId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${campaignId}/pause`,
      {}
    );
  }

  /** DELETE api/relay/campaigns/{id}?removeLeads= */
  deleteCampaign(
    campaignId: number,
    removeLeads = true
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${campaignId}?removeLeads=${removeLeads}`
    );
  }

  // ── CSV import (background job) ────────────────────

  /** POST api/relay/campaigns/{id}/import  (multipart/form-data, field: file) */
  importLeads(campaignId: number, file: File): Observable<ImportJobDto> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<ImportJobDto>(
      `${this.apiUrl}/${campaignId}/import`,
      form
    );
  }

  /** GET api/relay/campaigns/{id}/import/{jobId}/status */
  getImportStatus(campaignId: number, jobId: string): Observable<ImportStatusDto> {
    return this.http.get<ImportStatusDto>(
      `${this.apiUrl}/${campaignId}/import/${jobId}/status`
    );
  }

  // ── Batch lead operations ─────────────────────────

  /** POST api/relay/campaigns/{id}/leads/batch (add / remove / edit, transactional) */
  batchModifyLeads(
    campaignId: number,
    request: BatchLeadModificationRequest
  ): Observable<BatchResultDto> {
    return this.http.post<BatchResultDto>(
      `${this.apiUrl}/${campaignId}/leads/batch`,
      request
    );
  }

  /** Convenience: add a set of RelayLead ids to a campaign. */
  addLeads(campaignId: number, leadIds: number[]): Observable<BatchResultDto> {
    return this.batchModifyLeads(campaignId, { add: leadIds });
  }

  /** Convenience: remove a set of RelayLead ids from a campaign. */
  removeLeads(campaignId: number, leadIds: number[]): Observable<BatchResultDto> {
    return this.batchModifyLeads(campaignId, { remove: leadIds });
  }

  // ── Execution ─────────────────────────────────────

  /** POST api/relay/campaigns/{id}/start → enqueues the sequence engine. */
  startCampaign(
    campaignId: number,
    hangfireQueueName?: string
  ): Observable<CampaignJobDto> {
    return this.http.post<CampaignJobDto>(
      `${this.apiUrl}/${campaignId}/start`,
      hangfireQueueName ? { hangfireQueueName } : {}
    );
  }
}
