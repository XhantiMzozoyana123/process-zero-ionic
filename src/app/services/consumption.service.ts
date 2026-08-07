import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ConsumptionConfigDto,
  UpdateConsumptionConfigDto,
  UserSessionDto,
  ConsumptionStatsDto,
  SessionHeartbeatResponseDto
} from '../models/dtos/consumption-dto.model';

/**
 * Custom header added to all consumption requests so the AuthInterceptor
 * knows not to clear the session or redirect to login on 401 errors.
 * Consumption failures should never kick the user out.
 */
const SKIP_AUTH_REDIRECT_HEADER = new HttpHeaders({
  'X-Skip-Auth-Redirect': 'true'
});

@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  private apiUrl = `${environment.apiUrl}/consumption`;

  constructor(private http: HttpClient) {}

  // ── User Session Endpoints ──

  startSession(deviceInfo?: string): Observable<UserSessionDto> {
    return this.http.post<UserSessionDto>(`${this.apiUrl}/start`, { deviceInfo }, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  endSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/end`, {}, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  heartbeat(sessionId: number): Observable<SessionHeartbeatResponseDto> {
    return this.http.post<SessionHeartbeatResponseDto>(
      `${this.apiUrl}/${sessionId}/heartbeat`,
      {},
      { headers: SKIP_AUTH_REDIRECT_HEADER }
    );
  }

  /**
   * Returns the current user's active session wrapped in an object with hasActiveSession flag.
   * Response shape: { hasActiveSession: boolean, session: UserSessionDto | null }
   */
  getActiveSession(): Observable<{ hasActiveSession: boolean; session: UserSessionDto | null }> {
    return this.http.get<{ hasActiveSession: boolean; session: UserSessionDto | null }>(
      `${this.apiUrl}/active`,
      { headers: SKIP_AUTH_REDIRECT_HEADER }
    );
  }

  getSessionHistory(page: number = 1, pageSize: number = 20): Observable<UserSessionDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<UserSessionDto[]>(`${this.apiUrl}/history`, {
      params,
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  // ── Admin Endpoints ──

  getConfig(): Observable<ConsumptionConfigDto> {
    return this.http.get<ConsumptionConfigDto>(`${this.apiUrl}/config`, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  updateConfig(dto: UpdateConsumptionConfigDto): Observable<ConsumptionConfigDto> {
    return this.http.put<ConsumptionConfigDto>(`${this.apiUrl}/config`, dto, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  deleteConfig(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/config`, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  getAllActiveSessions(): Observable<UserSessionDto[]> {
    return this.http.get<UserSessionDto[]>(`${this.apiUrl}/admin/sessions`, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  forceEndSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/sessions/${sessionId}/force-end`, {}, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }

  getStats(): Observable<ConsumptionStatsDto> {
    return this.http.get<ConsumptionStatsDto>(`${this.apiUrl}/admin/stats`, {
      headers: SKIP_AUTH_REDIRECT_HEADER
    });
  }
}
