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
export class AdminGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAdmin();
  }

  canActivateChild(_childRoute: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAdmin();
  }

  canMatch(_route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.checkAdmin();
  }

  private checkAdmin(): boolean | UrlTree {
    // If admin is impersonating a user, allow access by switching back to admin token
    if (this.authService.isImpersonating()) {
      this.authService.switchToAdmin();
    }

    // Admin must be authenticated and have Admin role
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }

    // Not authenticated - go to login
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    // Authenticated but not admin - go to account dashboard
    return this.router.createUrlTree(['/account/dashboard']);
  }
}
