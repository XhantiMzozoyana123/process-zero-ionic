import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { OAuthService } from '../services/oauth.service';

@Injectable()
export class OAuthInterceptor implements HttpInterceptor {
  private oauthService = inject(OAuthService);
  private isRefreshing = false;
  private refreshTokenSubject$ = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add token to request if available
    const token = this.oauthService.getAuthToken();
    if (token) {
      request = this.addToken(request, token.accessToken);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add OAuth token to request header
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Handle 401 errors by refreshing token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject$.next(null);

      return this.oauthService.refreshAccessToken().pipe(
        switchMap((token) => {
          this.isRefreshing = false;
          this.refreshTokenSubject$.next(token.accessToken);
          return next.handle(this.addToken(request, token.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.oauthService.logout();
          return throwError(() => err);
        })
      );
    } else {
      // Wait for token refresh to complete
      return this.refreshTokenSubject$.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(request, token as string));
        })
      );
    }
  }
}
