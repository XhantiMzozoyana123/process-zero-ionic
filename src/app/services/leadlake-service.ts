import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeadLake, LeadLakeIndustry } from '../models/entities/leadlake.model';
import { environment } from 'src/environments/environment';

type LeadLakeBatchPayload = Omit<LeadLake, 'industry'> & {
  industry: number;
};

@Injectable({
  providedIn: 'root',
})
export class LeadlakeService {

  private apiUrl = `${environment.apiUrl}/leadlake`;

  constructor(private http: HttpClient) {}

  /**
   * Get all LeadLake entries
   */
  getAll(): Observable<LeadLake[]> {
    return this.http.get<LeadLake[]>(this.apiUrl);
  }

  /**
   * Get a LeadLake by ID
   */
  getById(id: number): Observable<LeadLake> {
    return this.http.get<LeadLake>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add multiple leads in one request
   */
  addBatch(leads: LeadLake[]): Observable<{ added: number }> {
    const industries = Object.values(LeadLakeIndustry) as LeadLakeIndustry[];
    const payload: LeadLakeBatchPayload[] = leads.map((lead) => ({
      ...lead,
      industry: Math.max(0, industries.findIndex((value) => value === lead.industry))
    }));

    return this.http.post<{ added: number }>(`${this.apiUrl}/batch`, payload);
  }
}
