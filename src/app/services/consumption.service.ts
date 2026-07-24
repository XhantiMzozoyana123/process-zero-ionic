import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ConsumptionConfigDto,
  UpdateConsumptionConfigDto,
  UserSessionDto,
  ConsumptionStatsDto,
  SessionHeartbeatResponseDto
} from '../models/dtos/consumption-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  private apiUrl = `${environment.apiUrl}/consumption`;

  constructor(private http: HttpClient) {}

  // ── User Session Endpoints ──

  startSession(deviceInfo?: string): Observable<UserSessionDto> {
    return this.http.post<UserSessionDto>(`${this.apiUrl}/start`, { deviceInfo });
  }

  endSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/end`, {});
  }

  heartbeat(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${sessionId}/heartbeat`, {});
  }

  getActiveSession(): Observable<any> {
    return this.http.get(`${this.apiUrl}/active`);
  }

  getSessionHistory(page: number = 1, pageSize: number = 20): Observable<UserSessionDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<UserSessionDto[]>(`${this.apiUrl}/history`, { params });
  }

  // ── Admin Endpoints ──

  getConfig(): Observable<ConsumptionConfigDto> {
    return this.http.get<ConsumptionConfigDto>(`${this.apiUrl}/config`);
  }

  updateConfig(dto: UpdateConsumptionConfigDto): Observable<ConsumptionConfigDto> {
    return this.http.put<ConsumptionConfigDto>(`${this.apiUrl}/config`, dto);
  }

  getAllActiveSessions(): Observable<UserSessionDto[]> {
    return this.http.get<UserSessionDto[]>(`${this.apiUrl}/admin/sessions`);
  }

  forceEndSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/sessions/${sessionId}/force-end`, {});
  }

  getStats(): Observable<ConsumptionStatsDto> {
    return this.http.get<ConsumptionStatsDto>(`${this.apiUrl}/admin/stats`);
  }
}