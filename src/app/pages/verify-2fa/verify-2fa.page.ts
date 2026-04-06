import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';
import { AssessmentService } from 'src/app/services/assessment-service';
import { AuthResponse } from 'src/app/models/dtos/auth-response.model';

@Component({
  selector: 'app-verify-2fa',
  templateUrl: './verify-2fa.page.html',
  styleUrls: ['./verify-2fa.page.scss'],
  standalone: false
})
export class Verify2faPage implements OnInit {
  userId = '';
  token = '';
  loading = false;
  private returnUrl = '/account';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private assessmentService: AssessmentService,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] || '';
      this.returnUrl = params['returnUrl'] || '/account';
    });

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
    await toast.present();
  }

  verifyCode() {
    if (!this.userId) {
      this.presentToast('Missing user id. Please log in again.', 'danger');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.token.trim()) {
      this.presentToast('Please enter the verification code.', 'danger');
      return;
    }

    this.loading = true;

    this.authService.verify2FA(this.userId, this.token.trim()).subscribe({
      next: async (res: AuthResponse) => {
        this.loading = false;

        if (res.token) {
          this.authService.setToken(res.token);
          localStorage.setItem('userId', this.userId);
          await this.presentToast('Verification successful!', 'success');
          this.redirectAfterLogin();
          return;
        }

        await this.presentToast(res.error || 'Invalid verification code.', 'danger');
      },
      error: async (err) => {
        this.loading = false;
        await this.presentToast(err.error?.error || 'Verification failed.', 'danger');
      }
    });
  }

  private redirectAfterLogin(): void {
    if (this.authService.isAdmin()) {
      this.router.navigateByUrl('/admin');
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
        this.router.navigateByUrl('/account/assessments');
      }
    });
  }
}
