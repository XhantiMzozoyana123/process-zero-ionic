import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiMessageResponse, AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false
})
export class ForgotPasswordPage {

  email: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }

  sendResetLink() {
    if (!this.email) {
      this.presentToast('Please enter your email', 'danger');
      return;
    }

    this.loading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: async (res: ApiMessageResponse) => {
        this.loading = false;
        await this.presentToast(res.message || 'Password reset email sent', 'success');
        this.router.navigate(['/login']); // Redirect to login page
      },
      error: async (err) => {
        this.loading = false;
        console.error(err);
        await this.presentToast(err.error?.error || 'Failed to send reset email', 'danger');
      }
    });
  }
}
