import { Component, OnInit } from '@angular/core';  // <-- Add OnInit
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';
import { RegisterDto } from 'src/app/models/dtos/register-dto.model';
import { AuthResponse } from 'src/app/models/dtos/auth-response.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  registerData: RegisterDto = { userName: '', firstName: '', lastName: '', email: '', phoneNumber: '', password: '' };
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {} // <-- implement OnInit

  async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }

  register() {
    this.loading = true;

    this.authService.register(this.registerData).subscribe({
      next: async (res: AuthResponse) => {
        this.loading = false;

        if (res.message) {
          await this.presentToast('Registration successful!', 'success');
          this.router.navigate(['/login']);
        } else if (res.error) {
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
}
