import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from 'src/app/services/oauth.service';

@Component({
  selector: 'app-oauth-login',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content class="oauth-login-page">
      <div class="login-container">
        <div class="header">
          <h1>Connect Email Account</h1>
          <p>Sign in with Google to connect your email account</p>
        </div>

        <div class="login-options">
          <div id="google-signin-button" class="signin-button"></div>
          
          <ion-button
            expand="block"
            color="primary"
            size="large"
            (click)="signInWithGoogleRedirect()"
            class="manual-signin">
            <ion-icon slot="start" name="logo-google"></ion-icon>
            Sign In with Google
          </ion-button>

          <p class="divider">OR</p>

          <ion-button
            expand="block"
            fill="outline"
            color="primary"
            (click)="cancel()">
            Cancel
          </ion-button>
        </div>

        <div class="info-section">
          <h3>Why we need access:</h3>
          <ul>
            <li>Send emails from your Gmail account</li>
            <li>Read and manage sent messages</li>
            <li>Track email delivery and engagement</li>
            <li>Manage your email signatures</li>
          </ul>
        </div>

        <div class="security-note">
          <ion-icon name="shield-checkmark-outline"></ion-icon>
          <p>Your credentials are secure and encrypted</p>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .oauth-login-page {
      --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem 1.5rem;
      min-height: 100%;
      gap: 2rem;
    }

    .header {
      text-align: center;
      color: white;

      h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 600;
      }

      p {
        margin: 0.5rem 0 0;
        font-size: 0.95rem;
        opacity: 0.9;
      }
    }

    .login-options {
      width: 100%;
      max-width: 400px;
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    #google-signin-button {
      display: flex;
      justify-content: center;
    }

    .manual-signin {
      margin-top: 1rem;
    }

    .divider {
      text-align: center;
      color: #999;
      margin: 0;
      font-size: 0.85rem;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 40%;
        height: 1px;
        background: #e0e0e0;
      }

      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        width: 40%;
        height: 1px;
        background: #e0e0e0;
      }
    }

    .info-section {
      width: 100%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      color: white;

      h3 {
        margin: 0 0 1rem;
        font-size: 0.95rem;
        font-weight: 600;
      }

      ul {
        margin: 0;
        padding-left: 1.5rem;
        list-style: none;

        li {
          margin: 0.5rem 0;
          font-size: 0.85rem;
          position: relative;
          padding-left: 1rem;

          &::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #38ef7d;
            font-weight: bold;
          }
        }
      }
    }

    .security-note {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 0.85rem;
      margin-bottom: 1rem;

      ion-icon {
        font-size: 1.5rem;
        color: #38ef7d;
      }

      p {
        margin: 0;
      }
    }

    @media (max-width: 640px) {
      .login-container {
        padding: 1.5rem 1rem;
      }

      .login-options {
        max-width: 100%;
      }

      .info-section {
        max-width: 100%;
      }
    }
  `],
})
export class OAuthLoginComponent implements OnInit {
  private oauthService = inject(OAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);

  ngOnInit(): void {
    // Initialize Google Sign-In button if OAuth library is loaded
    const google = (window as any).google;
    if (google) {
      setTimeout(() => {
        this.oauthService.signInWithGoogle();
      }, 100);
    }
  }

  /**
   * Trigger Google OAuth redirect flow
   */
  signInWithGoogleRedirect(): void {
    try {
      this.oauthService.redirectToGoogleOAuth();
    } catch (error) {
      this.showToast('Failed to initiate OAuth flow', 'danger');
    }
  }

  /**
   * Cancel OAuth and go back
   */
  cancel(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/relay-user';
    this.router.navigateByUrl(returnUrl);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
}
