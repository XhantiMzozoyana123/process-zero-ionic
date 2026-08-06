import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import {
  Survey,
  SurveyQuestion,
  SurveyResponseResult,
  SurveySummary,
  SurveysList
} from '../models/dtos/survey.model';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private apiUrl = `${environment.apiUrl}/survey`;

  constructor(private http: HttpClient) {}

  // ── PUBLIC ──────────────────────────────────────────────────────────────────

  /** GET /api/survey/{id} — Retrieves a specific survey by ID for respondents */
  getSurvey(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}`);
  }

  /** POST /api/survey/submit — Submits a response to a survey */
  submitResponse(surveyId: number, answers: string[]): Observable<SurveyResponseResult> {
    return this.http.post<SurveyResponseResult>(`${this.apiUrl}/submit`, { surveyId, answers });
  }

  // ── ADMIN ───────────────────────────────────────────────────────────────────

  /** GET /api/survey — Lists all surveys for admin */
  listSurveysForAdmin(): Observable<SurveysList[]> {
    return this.http.get<SurveysList[]>(this.apiUrl);
  }

  /** POST /api/survey — Creates a new survey */
  createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt' | 'uploadedAt'>): Observable<Survey> {
    const backendPayload = {
      Name: survey.name,
      Title: survey.title,
      Description: survey.description,
      Status: survey.status,
      BookingLink: survey.bookingLink,
      // Contact questions (0-6) are auto-prepended by the service; only the
      // business questions (7+) supplied here become SurveyQuestion rows.
      Questions: survey.questions.map(q => ({
        Text: q.text,
        Type: q.type,
        IsRequired: q.required,
        Options: q.type === 'MultipleChoice' ? q.options : undefined
      }))
    };
    return this.http.post<Survey>(this.apiUrl, backendPayload);
  }

  /** PUT /api/survey/{id} — Updates an existing survey */
  updateSurvey(id: number, survey: Partial<Survey>): Observable<Survey> {
    const backendPayload: any = { id };
    if (survey.name !== undefined) backendPayload.Name = survey.name;
    if (survey.title !== undefined) backendPayload.Title = survey.title;
    if (survey.description !== undefined) backendPayload.Description = survey.description;
    if (survey.status !== undefined) backendPayload.Status = survey.status;
    if (survey.bookingLink !== undefined) backendPayload.BookingLink = survey.bookingLink;
    if (survey.questions) {
      backendPayload.Questions = survey.questions.map(q => ({
        Text: q.text,
        Type: q.type,
        IsRequired: q.required,
        Options: q.type === 'MultipleChoice' ? q.options : undefined
      }));
    }
    return this.http.put<Survey>(`${this.apiUrl}/${id}`, backendPayload);
  }

  /** DELETE /api/survey/{id} — Deletes a survey (hard delete with cascade) */
  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** GET /api/survey/{id}/admin — Gets a specific survey for admin editing */
  getSurveyForAdmin(id: number): Observable<Survey> {
    return this.http.get<Survey>(`${this.apiUrl}/${id}/admin`);
  }

  /** GET /api/survey/{id}/responses — Gets aggregated responses for a specific survey */
  getAllResponses(surveyId: number): Observable<SurveySummary> {
    return this.http.get<SurveySummary>(`${this.apiUrl}/${surveyId}/responses`);
  }

  /** GET /api/survey/response/{responseId} — Gets a single response by ID */
  getResponseById(responseId: number): Observable<SurveyResponseResult> {
    return this.http.get<SurveyResponseResult>(`${this.apiUrl}/response/${responseId}`);
  }
}