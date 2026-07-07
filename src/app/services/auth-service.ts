import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { RegisterDto } from '../models/dtos/register-dto.model';
import { LoginDto } from '../models/dtos/login-dto.model';
import { UserDto } from '../models/dtos/user-dto.model';
import { ResetPasswordDto } from '../models/dtos/password-reset-dto.model';
import { AuthResponse } from '../models/dtos/auth-response.model';
import { environment } from 'src/environments/environment';

export interface ApiMessageResponse {
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // change to your API

  constructor(private http: HttpClient) {}

  register(model: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, model);
  }

  login(model: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, model);
  }

  verify2FA(userId: string, token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-2fa`, { userId, token });
  }

  forgotPassword(email: string): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(model: ResetPasswordDto): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/reset-password`, model);
  }

  getCurrentUser() {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }

  updateCurrentUser(model: UserDto): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.apiUrl}/me`, model);
  }

  logout() {
    this.clearSession();
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true;
    }

    const payload = this.decodeToken(token);
    if (!payload || typeof payload['exp'] !== 'number') {
      return true;
    }

    return payload['exp'] * 1000 <= Date.now();
  }

  private decodeToken(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodeToken(token);
    if (!payload) return null;
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ?? payload['role'];
    return typeof role === 'string' ? role : null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  refreshToken(): Observable<ApiMessageResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/refresh`, { token });
  }
}
