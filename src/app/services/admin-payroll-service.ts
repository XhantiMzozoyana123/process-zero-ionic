import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PayrollGenerateResponse } from '../models/entities/payroll.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AdminPayrollService {
  private apiUrl = `${environment.apiUrl}/payroll`;

  constructor(private http: HttpClient) {}

  generateMonthlyReport(): Observable<PayrollGenerateResponse> {
    return this.http.post<PayrollGenerateResponse>(`${this.apiUrl}/generate-monthly-report`, {});
  }

  downloadReport(fileName: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/download/${encodeURIComponent(fileName)}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  getDownloadUrl(fileName: string): string {
    return `${this.apiUrl}/download/${encodeURIComponent(fileName)}`;
  }
}
