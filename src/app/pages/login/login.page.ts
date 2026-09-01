import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';
import { AssessmentService } from 'src/app/services/assessment-service';
import { AgencyService } from 'src/app/services/agency-service';
import { LoginDto } from 'src/app/models/dtos/login-dto.model';
import { AuthResponse } from 'src/app/models/dtos/auth-response.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginData: LoginDto = { email: '', password: '' };
  loading = false;
  private returnUrl = '/account';

  constructor(
    private authService: AuthService,
    private assessmentService: AssessmentService,
    private agencyService: AgencyService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/account';

    if (this.route.snapshot.queryParamMap.get('banned') === '1') {
      this.presentToast('Your account has been banned. Contact an administrator.', 'danger');
    }

    if (this.authService.isAuthenticated()) {
      void this.router.navigateByUrl(this.returnUrl);
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }

  login() {
    this.loading = true;

    this.authService.login(this.loginData).subscribe({
      next: async (res: AuthResponse) => {
        this.loading = false;

        // Handle 2FA required
        if (res.requires2FA && res.userId) {
          await this.presentToast('2FA required. Redirecting...', 'success');
          this.router.navigate(['/verify-2fa'], { queryParams: { userId: res.userId, returnUrl: this.returnUrl } });
          return;
        }

        // Successful login
        if (res.token) {
          this.authService.setToken(res.token);
          localStorage.setItem('userId', res.userId || '');
          await this.presentToast('Login successful!', 'success');
          this.redirectAfterLogin();
        }

        // Error returned from backend
        if (res.error) {
          await this.presentToast(res.error, 'danger');
        }
      },
      error: async (err) => {
        this.loading = false;
        await this.presentToast('An error occurred. Please try again.', 'danger');
        console.error(err);
      }
    });
  }

  private redirectAfterLogin(): void {
    if (this.authService.isAdmin()) {
      this.router.navigateByUrl('/admin');
      return;
    }

    // Agency-role users (agency login or granted managers) go straight to their CRM workspace.
    if (this.authService.isAgency()) {
      this.agencyService.myAgencies().subscribe({
        next: agencies => {
          if (agencies.length) {
            this.router.navigateByUrl(`/agency-crm/${agencies[0].id}`);
          } else {
            this.router.navigateByUrl('/account/dashboard');
          }
        },
        error: () => this.router.navigateByUrl('/account/dashboard')
      });
      return;
    }

    this.assessmentService.getMyGlobalResult().subscribe({
      next: (result) => {
        if (result.passed) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigateByUrl('/account/assessments');
        }
      },
      error: () => {
        // No prior result — user hasn't taken the assessment yet
        this.router.navigateByUrl('/account/assessments');
      }
    });
  }
}
