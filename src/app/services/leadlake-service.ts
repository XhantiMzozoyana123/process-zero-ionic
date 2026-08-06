import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeadLake, LeadLakeIndustry, LeadIntent } from '../models/entities/leadlake.model';
import { environment } from 'src/environments/environment.prod';

type LeadLakePayload = Omit<LeadLake, 'industry' | 'intent'> & {
  industry: number;
  intent?: number;
};

@Injectable({
  providedIn: 'root',
})
export class LeadlakeService {

  private apiUrl = `${environment.apiUrl}/leadlake`;

  private readonly industries = Object.values(LeadLakeIndustry) as LeadLakeIndustry[];
  private readonly intents = Object.values(LeadIntent) as LeadIntent[];

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
   * Create a single lead (Admin only on the backend)
   */
  create(lead: LeadLake): Observable<LeadLake> {
    return this.http.post<LeadLake>(this.apiUrl, this.toPayload(lead));
  }

  /**
   * Update an existing lead (Admin only on the backend)
   */
  update(id: number, lead: LeadLake): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, this.toPayload({ ...lead, id }));
  }

  /**
   * Delete a lead by ID (Admin only on the backend)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add multiple leads in one request
   */
  addBatch(leads: LeadLake[]): Observable<{ added: number }> {
    const payload: LeadLakePayload[] = leads.map((lead) => this.toPayload(lead));
    return this.http.post<{ added: number }>(`${this.apiUrl}/batch`, payload);
  }

  /**
   * Maps a UI LeadLake (string enums) into the payload shape the API expects,
   * converting the industry/intent enums to their numeric backend values.
   */
  private toPayload(lead: LeadLake): LeadLakePayload {
    const { intent, ...rest } = lead;
    const industry = Math.max(0, this.industries.findIndex((value) => value === lead.industry));

    const payload: LeadLakePayload = { ...rest, industry };

    if (intent !== undefined && intent !== null) {
      const intentIndex = this.intents.findIndex((value) => value === intent);
      payload.intent = intentIndex >= 0 ? intentIndex : 0;
    }

    return payload;
  }

}
