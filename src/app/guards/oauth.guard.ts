import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OAuthService } from '../services/oauth.service';

@Injectable({
  providedIn: 'root',
})
export class OAuthGuard implements CanActivate {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.oauthService.isAuthenticated()) {
      return true;
    }

    // Redirect to login if not authenticated
    this.router.navigate(['/oauth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
