import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AssessmentClientDto,
  AssessmentDto,
  AdminSubmissionResultDto,
  SubmissionDto,
  SubmissionResultDto
} from '../models/dtos/assessment-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = `${environment.apiUrl}/assessment`;

  constructor(private http: HttpClient) {}

  getGlobal(): Observable<AssessmentClientDto> {
    return this.http.get<AssessmentClientDto>(`${this.apiUrl}/global`);
  }

  getMyGlobalResult(): Observable<SubmissionResultDto> {
    return this.http.get<SubmissionResultDto>(`${this.apiUrl}/global/my-result`);
  }

  getMyProductResult(productId: number): Observable<SubmissionResultDto> {
    return this.http.get<SubmissionResultDto>(`${this.apiUrl}/product/${productId}/my-result`);
  }

  /** Returns all assessment results for the current user across all products */
  getAllMyResults(): Observable<SubmissionResultDto[]> {
    return this.http.get<SubmissionResultDto[]>(`${this.apiUrl}/my-results`);
  }

  getByProduct(productId: number): Observable<AssessmentClientDto> {
    return this.http.get<AssessmentClientDto>(`${this.apiUrl}/product/${productId}`);
  }

  submitGlobal(submission: SubmissionDto): Observable<SubmissionResultDto> {
    return this.http.post<SubmissionResultDto>(`${this.apiUrl}/global/submit`, submission);
  }

  submitByProduct(productId: number, submission: SubmissionDto): Observable<SubmissionResultDto> {
    return this.http.post<SubmissionResultDto>(`${this.apiUrl}/product/${productId}/submit`, submission);
  }

  uploadGlobal(assessment: AssessmentDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/global`, assessment);
  }

  getGlobalForAdmin(): Observable<AssessmentDto> {
    // Backend no longer exposes GET /admin/global; global is handled as productId 0.
    return this.http.get<AssessmentDto>(`${this.apiUrl}/admin/product/0`);
  }

  uploadByProduct(productId: number, assessment: AssessmentDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/product/${productId}`, assessment);
  }

  getByProductForAdmin(productId: number): Observable<AssessmentDto> {
    return this.http.get<AssessmentDto>(`${this.apiUrl}/admin/product/${productId}`);
  }

  /** Admin: get all assessments for all products */
  getAllAssessmentsForAdmin(): Observable<AssessmentDto[]> {
    return this.http.get<AssessmentDto[]>(`${this.apiUrl}/admin/all`);
  }

  /** Admin: get all users' assessment results */
  getAllUsersResults(): Observable<AdminSubmissionResultDto[]> {
    return this.http.get<AdminSubmissionResultDto[]>(`${this.apiUrl}/admin/results`);
  }

  /** Admin: get a specific user's global assessment result */
  getUserGlobalResultForAdmin(userId: string): Observable<AdminSubmissionResultDto> {
    const encodedUserId = encodeURIComponent(userId);

    // Try common route variants to support backend/controller drift.
    return this.http.get<any>(`${this.apiUrl}/admin/global/result/${encodedUserId}`).pipe(
      catchError(() =>
        this.http.get<any>(`${this.apiUrl}/admin/global/results/${encodedUserId}`).pipe(
          catchError(() =>
            this.http.get<any>(`${this.apiUrl}/admin/result/global/${encodedUserId}`).pipe(
              catchError((err) => throwError(() => err))
            )
          )
        )
      )
    );
  }
}
