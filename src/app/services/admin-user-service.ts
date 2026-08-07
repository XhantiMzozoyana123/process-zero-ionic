import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationUser } from '../models/entities/application-user.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApplicationUser[]> {
    return this.http.get<ApplicationUser[]>(this.apiUrl);
  }

  getById(id: string): Observable<ApplicationUser> {
    return this.http.get<ApplicationUser>(`${this.apiUrl}/${id}`);
  }

  getBannedUsers(): Observable<ApplicationUser[]> {
    return this.http.get<ApplicationUser[]>(`${this.apiUrl}/banned`);
  }

  banUser(id: string, reason?: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/ban`, { reason: reason || null });
  }

  unbanUser(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/unban`, {});
  }

  isUserBanned(id: string): Observable<{ id: string; isBanned: boolean }> {
    return this.http.get<{ id: string; isBanned: boolean }>(`${this.apiUrl}/${id}/is-banned`);
  }

  impersonateUser(id: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/${id}/impersonate`, {});
  }
}
