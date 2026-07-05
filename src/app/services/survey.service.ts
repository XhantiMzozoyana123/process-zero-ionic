import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SurveyClientDto } from '../models/dtos/survey-client-dto.model';
import { SurveyResponseSubmissionDto } from '../models/dtos/survey-response-submission-dto.model';
import { SurveyResponseResultDto } from '../models/dtos/survey-response-result-dto.model';
import { SurveySummaryDto } from '../models/dtos/survey-summary-dto.model';
import { SurveyDto } from '../models/dtos/survey-dto.model';
import { SurveysListDto } from '../models/dtos/surveys-list-dto.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiUrl}/surveys`;

  constructor(private http: HttpClient) {}

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  /** GET /api/surveys — Lists all available surveys */
  listSurveys(): Observable<SurveysListDto[]> {
    return this.http.get<SurveysListDto[]>(this.apiUrl);
  }

  /** GET /api/surveys/{id} — Retrieves a specific survey by ID for respondents */
  getSurvey(id: number): Observable<SurveyClientDto> {
    return this.http.get<SurveyClientDto>(`${this.apiUrl}/${id}`);
  }

  /** POST /api/surveys/{id}/submit — Submits a response to a specific survey (AI-gated lead qualification) */
  submitResponse(submission: SurveyResponseSubmissionDto): Observable<SurveyResponseResultDto> {
    return this.http.post<SurveyResponseResultDto>(`${this.apiUrl}/${submission.surveyId}/submit`, submission);
  }

  // ── ADMIN ───────────────────────────────────────────────────────────────────

  /** POST /api/surveys — Creates a new survey */
  createSurvey(survey: SurveyDto): Observable<SurveyDto> {
    return this.http.post<SurveyDto>(this.apiUrl, survey);
  }

  /** PUT /api/surveys/{id} — Updates an existing survey */
  updateSurvey(id: number, survey: SurveyDto): Observable<SurveyDto> {
    return this.http.put<SurveyDto>(`${this.apiUrl}/${id}`, survey);
  }

  /** DELETE /api/surveys/{id} — Deletes a survey (hard delete with cascade) */
  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** GET /api/surveys/for-admin — Gets all surveys for admin dashboard (with response counts) */
  listSurveysForAdmin(): Observable<SurveysListDto[]> {
    return this.http.get<SurveysListDto[]>(`${this.apiUrl}/for-admin`);
  }

  /** GET /api/surveys/{id}/admin — Gets a specific survey for admin editing */
  getSurveyForAdmin(id: number): Observable<SurveyDto> {
    return this.http.get<SurveyDto>(`${this.apiUrl}/${id}/admin`);
  }

  /** GET /api/surveys/{id}/responses — Gets aggregated responses for a specific survey */
  getAllResponses(surveyId: number): Observable<SurveySummaryDto> {
    return this.http.get<SurveySummaryDto>(`${this.apiUrl}/${surveyId}/responses`);
  }

  /** GET /api/surveys/responses/{responseId} — Gets a single response by ID */
  getResponseById(responseId: number): Observable<SurveyResponseResultDto> {
    return this.http.get<SurveyResponseResultDto>(`${this.apiUrl}/responses/${responseId}`);
  }
}