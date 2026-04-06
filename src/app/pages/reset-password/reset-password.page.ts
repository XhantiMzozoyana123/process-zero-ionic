import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiMessageResponse, AuthService } from 'src/app/services/auth-service';
import { ResetPasswordDto } from 'src/app/models/dtos/password-reset-dto.model';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false
})
export class ResetPasswordPage implements OnInit {

  newPassword: string = '';
  confirmPassword: string = '';
  token: string = '';
  userId: string = '';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Get token and userId from query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.userId = params['id'] || '';
    });
  }

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }

  resetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.presentToast('Please fill in all fields', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Passwords do not match', 'danger');
      return;
    }

    this.loading = true;

    const model: ResetPasswordDto = {
      id: this.userId,
      token: this.token,
      newPassword: this.newPassword
    };

    this.authService.resetPassword(model).subscribe({
      next: async (res: ApiMessageResponse) => {
        this.loading = false;
        await this.presentToast(res.message || 'Password reset successful', 'success');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        this.loading = false;
        console.error(err);
        await this.presentToast(err.error?.error || 'Failed to reset password', 'danger');
      }
    });
  }
}
