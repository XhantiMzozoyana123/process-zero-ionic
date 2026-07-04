import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SurveyClientDto } from '../models/dtos/survey-client-dto.model';
import { SurveyResponseSubmissionDto } from '../models/dtos/survey-response-submission-dto.model';
import { SurveyResponseResultDto } from '../models/dtos/survey-response-result-dto.model';
import { SurveySummaryDto } from '../models/dtos/survey-summary-dto.model';
import { SurveyDto } from '../models/dtos/survey-dto.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiUrl}/survey`;

  constructor(private http: HttpClient) {}

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  /** GET /api/survey — Retrieves the current survey for public respondents */
  getSurvey(): Observable<SurveyClientDto> {
    return this.http.get<SurveyClientDto>(this.apiUrl);
  }

  /** POST /api/survey/submit — Submits a survey response (AI-gated lead qualification) */
  submitResponse(submission: SurveyResponseSubmissionDto): Observable<SurveyResponseResultDto> {
    return this.http.post<SurveyResponseResultDto>(`${this.apiUrl}/submit`, submission);
  }

  // ── ADMIN ───────────────────────────────────────────────────────────────────

  /** GET /api/survey/admin/responses — Gets aggregated summary of all responses */
  getAllResponses(): Observable<SurveySummaryDto> {
    return this.http.get<SurveySummaryDto>(`${this.apiUrl}/admin/responses`);
  }

  /** GET /api/survey/admin/responses/{responseId} — Gets a single response by ID */
  getResponseById(responseId: number): Observable<SurveyResponseResultDto> {
    return this.http.get<SurveyResponseResultDto>(`${this.apiUrl}/admin/responses/${responseId}`);
  }

  /** PUT /api/survey/admin — Creates or updates the global survey */
  uploadSurvey(survey: SurveyDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin`, survey);
  }

  /** GET /api/survey/admin/survey — Gets the current survey for admin editing */
  getSurveyForAdmin(): Observable<SurveyDto> {
    return this.http.get<SurveyDto>(`${this.apiUrl}/admin/survey`);
  }
}