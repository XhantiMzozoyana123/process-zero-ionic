import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth-service';

@Injectable({
  providedIn: 'root'
})
export class ImpersonationGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkImpersonation();
  }

  canActivateChild(_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkImpersonation();
  }

  canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.checkImpersonation();
  }

  private checkImpersonation(): boolean | UrlTree {
    // Allow access if we have a user token in impersonation mode (admin has impersonated)
    if (this.authService.isImpersonating()) {
      return true;
    }

    // If not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    // If authenticated but not impersonating, they shouldn't be here
    // Redirect to account dashboard
    return this.router.createUrlTree(['/account/dashboard']);
  }
}