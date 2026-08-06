import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    // Include /auth/refresh in the exemption so we don't loop on the refresh call itself
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password|reset-password|verify-2fa|refresh)/.test(req.url);

    const request = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isAuthEndpoint) {
          // Check if the request has the skip-redirect header, meaning failures should
          // never kick the user out (e.g. consumption heartbeats, session init).
          const skipRedirect = request.headers.get('X-Skip-Auth-Redirect') === 'true';
          if (skipRedirect) {
            return throwError(() => error);
          }
          return this.handle401Error(request, next);
        }

        if (error.status === 403 && error.error?.error === 'Account is banned') {
          this.authService.clearSession();
          void this.router.navigate(['/'], { queryParams: { banned: '1' } });
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If we are in impersonation mode, don't clear session or redirect to login.
    // Impersonated user tokens may not have access to all endpoints (e.g. consumption),
    // and we don't want a 401 from those to kick the admin back to the login screen.
    if (this.authService.isImpersonating()) {
      return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized during impersonation' }));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject$.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          // IMPORTANT FIX: The refresh endpoint returns a NEW token in the response.
          // We must save it to localStorage BEFORE retrying the original request.
          const newToken = response?.token || this.authService.getToken();
          if (newToken) {
            this.authService.setToken(newToken);
          }
          this.refreshTokenSubject$.next(newToken);
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject$.next(null);
          // Don't kick the user to the login screen — just surface the error.
          // Long form-filling sessions should not lose their session unexpectedly.
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject$.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(request, token as string));
        })
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (!token) {
      return request;
    }
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}