import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * Mirrors the backend SearchDto used by ProcessZero.Web ExtractController.
 *
 *   public class SearchDto
 *   {
 *       public string Keywords { get; set; }
 *       public int PageViewLimit { get; set; }
 *       public string ContainerUrl { get; set; }
 *   }
 *
 * ASP.NET Core serializes these as camelCase JSON by default.
 */
export interface SearchDto {
  keywords: string;
  pageViewLimit: number;
  containerUrl: string;
}

export interface ExtractRunResponse {
  message: string;
}

export interface ExtractBatchResponse {
  message: string;
  count: number;
}

export interface ExtractHealthResponse {
  status: string;
  time: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExtractService {
  private apiUrl = `${environment.apiUrl}/extract`;

  constructor(private http: HttpClient) {}

  /**
   * Run a single extraction pipeline (POST /api/extract/run).
   * Scrapes Yellow Pages and saves new leads to LeadLake.
   */
  run(searchDto: SearchDto): Observable<ExtractRunResponse> {
    return this.http.post<ExtractRunResponse>(`${this.apiUrl}/run`, searchDto);
  }

  /**
   * Queue a batch of extraction jobs (POST /api/extract/batch).
   */
  batch(searches: SearchDto[]): Observable<ExtractBatchResponse> {
    return this.http.post<ExtractBatchResponse>(`${this.apiUrl}/batch`, searches);
  }

  /**
   * Health check for the extract service (GET /api/extract/health).
   */
  health(): Observable<ExtractHealthResponse> {
    return this.http.get<ExtractHealthResponse>(`${this.apiUrl}/health`);
  }
}
