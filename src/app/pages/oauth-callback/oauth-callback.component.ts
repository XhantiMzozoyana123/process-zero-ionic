import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { OAuthService } from 'src/app/services/oauth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content>
      <div class="callback-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Completing OAuth authentication...</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .callback-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
    }
  `],
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private oauthService = inject(OAuthService);
  private toastController = inject(ToastController);

  ngOnInit(): void {
    this.handleCallback();
  }

  private handleCallback(): void {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      const error = params['error'];
      const returnUrl = params['state'] || '/relay-user';

      if (error) {
        this.handleError(error);
        return;
      }

      if (code) {
        this.oauthService.handleOAuthRedirectCallback(code).subscribe({
          next: async () => {
            await this.showToast('OAuth authentication successful!', 'success');
            this.router.navigateByUrl(returnUrl);
          },
          error: async (err) => {
            await this.showToast('OAuth authentication failed: ' + err.message, 'danger');
            this.router.navigate(['/oauth/login']);
          },
        });
      }
    });
  }

  private handleError(errorCode: string): void {
    const errorMessages: { [key: string]: string } = {
      access_denied: 'OAuth access was denied',
      invalid_scope: 'Invalid OAuth scope requested',
      invalid_request: 'Invalid OAuth request',
      server_error: 'OAuth server error',
      temporarily_unavailable: 'OAuth service temporarily unavailable',
    };

    const message = errorMessages[errorCode] || 'Unknown OAuth error';
    this.showToast(message, 'danger');
    this.router.navigate(['/oauth/login']);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }
}
