import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssessmentClientDto,
  AssessmentDto,
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
    return this.http.get<AssessmentDto>(`${this.apiUrl}/admin/global`);
  }

  uploadByProduct(productId: number, assessment: AssessmentDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/admin/product/${productId}`, assessment);
  }

  getByProductForAdmin(productId: number): Observable<AssessmentDto> {
    return this.http.get<AssessmentDto>(`${this.apiUrl}/admin/product/${productId}`);
  }
}
