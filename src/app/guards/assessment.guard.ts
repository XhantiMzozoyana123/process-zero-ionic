import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';
import { AssessmentService } from '../services/assessment-service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private assessmentService: AssessmentService
  ) {}

  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    if (this.authService.isAdmin()) {
      return of(true);
    }

    return this.assessmentService.getMyGlobalResult().pipe(
      map(result => {
        if (result.passed) {
          return true;
        }
        return this.router.createUrlTree(['/account/assessments']);
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/account/assessments']));
      })
    );
  }
}
