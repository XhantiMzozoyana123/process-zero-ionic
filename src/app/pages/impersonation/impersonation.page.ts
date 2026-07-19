import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-impersonation',
  templateUrl: './impersonation.page.html',
  styleUrls: ['./impersonation.page.scss'],
  standalone: false
})
export class ImpersonationPage {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  switchBackToAdmin(): void {
    this.authService.switchToAdmin();
    void this.router.navigate(['/admin/dashboard']);
  }
}
