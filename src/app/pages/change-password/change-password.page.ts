import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiMessageResponse, AuthService } from 'src/app/services/auth-service';
import { UserDto } from 'src/app/models/dtos/user-dto.model';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: false,
})
export class ChangePasswordPage implements OnInit {
  form!: FormGroup;
  loading = false;
  private currentUser?: UserDto;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: () => {
        this.presentToast('Failed to load user information', 'danger');
      },
    });
  }

  get passwordsMismatch(): boolean {
    const newPassword = this.form.get('newPassword')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    return !!newPassword && !!confirmPassword && newPassword !== confirmPassword;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.passwordsMismatch) {
      await this.presentToast('New passwords do not match', 'danger');
      return;
    }

    if (!this.currentUser) {
      await this.presentToast('User data is not loaded yet', 'danger');
      return;
    }

    this.loading = true;

    const payload: UserDto = {
      userName: this.currentUser.userName || '',
      newEmail: (this.currentUser as UserDto & { email?: string }).newEmail || (this.currentUser as UserDto & { email?: string }).email || '',
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    this.authService.updateCurrentUser(payload).subscribe({
      next: async (res: ApiMessageResponse) => {
        this.loading = false;
        await this.presentToast(res.message || 'Password changed successfully', 'success');
        this.form.reset();
        this.router.navigate(['/account/settings']);
      },
      error: async (err) => {
        this.loading = false;
        await this.presentToast(err?.error?.error || err?.error?.message || 'Failed to change password', 'danger');
      },
    });
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
