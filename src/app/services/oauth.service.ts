import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface GoogleAuthToken {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  tokenType: string;
  scope: string;
  idToken?: string;
}

export interface GoogleOAuthUser {
  email: string;
  name: string;
  picture?: string;
  id_token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OAuthService {
  private http = inject(HttpClient);

  private authToken$ = new BehaviorSubject<GoogleAuthToken | null>(this.getStoredToken());
  private currentUser$ = new BehaviorSubject<GoogleOAuthUser | null>(this.getStoredUser());

  constructor() {
    this.initializeGoogleOAuth();
  }

  /**
   * Initialize Google OAuth 2.0 library
   */
  private initializeGoogleOAuth(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.loadGoogleClientLibrary();
    };
    document.head.appendChild(script);
  }

  /**
   * Load Google API client library for OAuth tokens
   */
  private loadGoogleClientLibrary(): void {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogleClient();
    };
    document.head.appendChild(script);
  }

  /**
   * Initialize Google API Client
   */
  private initializeGoogleClient(): void {
    const gapi = (window as any).gapi;
    if (gapi && gapi.client) {
      gapi.client.init({
        clientId: environment.google.clientId,
        scope: environment.google.scope,
        discoveryDocs: environment.google.discoveryDocs,
      });
    }
  }

  /**
   * Trigger Google OAuth Sign-In flow
   */
  signInWithGoogle(): void {
    const google = (window as any).google;
    if (!google) {
      console.error('Google OAuth library not loaded');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.google.clientId,
      callback: (response: any) => this.handleGoogleCallback(response),
      auto_select: false,
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      }
    );

    // Trigger the One Tap UI or full redirect if needed
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback to redirect flow if One Tap not shown
        this.redirectToGoogleOAuth();
      }
    });
  }

  /**
   * Redirect to Google OAuth consent screen for email access
   */
  redirectToGoogleOAuth(): void {
    const params = new URLSearchParams({
      client_id: environment.google.clientId,
      redirect_uri: environment.google.redirectUrl,
      response_type: 'code',
      scope: environment.google.scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Handle Google OAuth callback from ID token
   */
  private handleGoogleCallback(response: any): void {
    if (response.credential) {
      // Decode JWT to get user info
      const decodedToken = this.decodeJwt(response.credential);
      const user: GoogleOAuthUser = {
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        id_token: response.credential,
      };

      // Store the ID token and user info
      this.currentUser$.next(user);
      this.storeUser(user);

      // Exchange ID token for access/refresh tokens via backend
      this.exchangeTokenWithBackend(response.credential).subscribe({
        next: (token) => {
          this.authToken$.next(token);
          this.storeToken(token);
        },
        error: (err) => console.error('Failed to exchange token', err),
      });
    }
  }

  /**
   * Exchange Google ID token with backend for access/refresh tokens
   */
  private exchangeTokenWithBackend(idToken: string): Observable<GoogleAuthToken> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/google/exchange-token`, { idToken })
      .pipe(
        map((response) => ({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || null,
          expiresIn: response.expiresIn || 3600,
          tokenType: response.tokenType || 'Bearer',
          scope: environment.google.scope,
        })),
        tap((token) => {
          this.authToken$.next(token);
          this.storeToken(token);
        }),
        catchError((err) => {
          console.error('Token exchange failed:', err);
          return throwError(() => new Error('Failed to exchange Google token'));
        })
      );
  }

  /**
   * Handle OAuth callback from redirect (authorization code flow)
   */
  handleOAuthRedirectCallback(code: string): Observable<GoogleAuthToken> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/google/callback`, { code })
      .pipe(
        map((response) => ({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn || 3600,
          tokenType: response.tokenType || 'Bearer',
          scope: environment.google.scope,
        })),
        tap((token) => {
          this.authToken$.next(token);
          this.storeToken(token);
        }),
        catchError((err) => {
          console.error('OAuth callback failed:', err);
          return throwError(() => new Error('OAuth authentication failed'));
        })
      );
  }

  /**
   * Get current auth token
   */
  getAuthToken(): GoogleAuthToken | null {
    return this.authToken$.value;
  }

  /**
   * Get auth token as observable
   */
  getAuthToken$(): Observable<GoogleAuthToken | null> {
    return this.authToken$.asObservable();
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): GoogleOAuthUser | null {
    return this.currentUser$.value;
  }

  /**
   * Get current user as observable
   */
  getCurrentUser$(): Observable<GoogleOAuthUser | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.authToken$.value;
    return token !== null && token !== undefined;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.authToken$.value;
    if (!token) return true;

    const expiryTime = this.getTokenExpiryTime();
    return expiryTime <= new Date();
  }

  /**
   * Get token expiry time
   */
  private getTokenExpiryTime(): Date {
    const token = this.authToken$.value;
    if (!token) return new Date(0);

    const expiryMs = this.getTokenIssuedTime().getTime() + token.expiresIn * 1000;
    return new Date(expiryMs);
  }

  /**
   * Get token issued time from storage
   */
  private getTokenIssuedTime(): Date {
    const issuedTimeStr = localStorage.getItem('oauth_token_issued_at');
    return issuedTimeStr ? new Date(issuedTimeStr) : new Date();
  }

  /**
   * Refresh access token
   */
  refreshAccessToken(): Observable<GoogleAuthToken> {
    const token = this.authToken$.value;
    if (!token || !token.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<any>(`${environment.apiUrl}/auth/google/refresh`, {
        refreshToken: token.refreshToken,
      })
      .pipe(
        map((response) => ({
          accessToken: response.accessToken,
          refreshToken: token.refreshToken,
          expiresIn: response.expiresIn || 3600,
          tokenType: response.tokenType || 'Bearer',
          scope: token.scope,
        })),
        tap((newToken) => {
          this.authToken$.next(newToken);
          this.storeToken(newToken);
        }),
        catchError((err) => {
          console.error('Token refresh failed:', err);
          this.logout();
          return throwError(() => new Error('Token refresh failed'));
        })
      );
  }

  /**
   * Logout and clear stored credentials
   */
  logout(): void {
    this.authToken$.next(null);
    this.currentUser$.next(null);
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('oauth_user');
    localStorage.removeItem('oauth_token_issued_at');

    // Sign out from Google
    const google = (window as any).google;
    if (google && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: GoogleAuthToken): void {
    localStorage.setItem('oauth_token', JSON.stringify(token));
    localStorage.setItem('oauth_token_issued_at', new Date().toISOString());
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): GoogleAuthToken | null {
    const tokenStr = localStorage.getItem('oauth_token');
    return tokenStr ? JSON.parse(tokenStr) : null;
  }

  /**
   * Store user info in localStorage
   */
  private storeUser(user: GoogleOAuthUser): void {
    localStorage.setItem('oauth_user', JSON.stringify(user));
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): GoogleOAuthUser | null {
    const userStr = localStorage.getItem('oauth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Decode JWT token (client-side, not for security validation)
   */
  private decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Failed to decode JWT:', err);
      return {};
    }
  }
}
