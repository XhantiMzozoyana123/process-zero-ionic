import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LeadLake } from '../models/entities/leadlake.model';

export interface ExtractScrapeResponse {
  message: string;
  leads: LeadLake[];
}

export interface ExtractHealthResponse {
  status: string;
  service: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExtractService {
  private apiUrl = `${environment.apiUrl}/extract`;

  constructor(private http: HttpClient) {}

  scrapeLeads(keyword: string, location: string, pages: number = 1): Observable<ExtractScrapeResponse> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('location', location)
      .set('pages', String(pages));

    return this.http.post<ExtractScrapeResponse>(`${this.apiUrl}/scrape`, null, { params });
  }

  health(): Observable<ExtractHealthResponse> {
    return this.http.get<ExtractHealthResponse>(`${this.apiUrl}/health`);
  }
}
