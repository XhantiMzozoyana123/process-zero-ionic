import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AgencyService } from '../services/agency-service';
import { AuthService } from '../services/auth-service';

@Injectable({ providedIn: 'root' })
export class AgencyCrmGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private agencyService: AgencyService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    const id = Number(route.paramMap.get('id'));
    if (!id) {
      return this.router.createUrlTree(['/account/dashboard']);
    }

    // Verify the current user can actually view this agency.
    return this.agencyService.getAccess(id).pipe(
      map(access => (access.canView ? true : this.router.createUrlTree(['/account/dashboard']))),
      catchError(() => of(this.router.createUrlTree(['/account/dashboard'])))
    );
  }
}