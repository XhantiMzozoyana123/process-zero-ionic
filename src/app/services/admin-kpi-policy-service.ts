import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KpiPolicy } from '../models/entities/kpi-policy.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminKpiPolicyService {
  private apiUrl = `${environment.apiUrl}/kpipolicy`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<KpiPolicy[]> {
    return this.http.get<KpiPolicy[]>(this.apiUrl);
  }

  getById(id: number): Observable<KpiPolicy> {
    return this.http.get<KpiPolicy>(`${this.apiUrl}/${id}`);
  }

  create(policy: KpiPolicy): Observable<KpiPolicy> {
    return this.http.post<KpiPolicy>(this.apiUrl, policy);
  }

  update(id: number, policy: KpiPolicy): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, policy);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
