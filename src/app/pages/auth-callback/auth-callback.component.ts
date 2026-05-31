import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RelayService } from 'src/app/services/relay-service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content>
      <div class="callback-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Completing Google account connection...</p>
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
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly relayService = inject(RelayService);

  private readonly googleOauthStateKey = 'relay.google.oauth.state';

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.redirectToRelay('error', undefined, error);
      return;
    }

    if (!code || !state) {
      this.redirectToRelay('error', undefined, 'Missing authorization code or state token.');
      return;
    }

    const expectedState = sessionStorage.getItem(this.googleOauthStateKey);
    if (!expectedState || expectedState !== state) {
      this.redirectToRelay('error', undefined, 'State token mismatch. Please try connecting again.');
      return;
    }

    this.relayService.exchangeGoogleAuthCallback({ code, state }).subscribe({
      next: (result) => {
        this.redirectToRelay('success', result.emailAddress);
      },
      error: (err) => {
        this.redirectToRelay(
          'error',
          undefined,
          err?.error?.error || 'Google OAuth callback exchange failed.'
        );
      },
    });
  }

  private redirectToRelay(outcome: 'success' | 'error', email?: string, message?: string): void {
    sessionStorage.removeItem(this.googleOauthStateKey);

    void this.router.navigate(['/account/relay-user'], {
      queryParams: {
        oauth: outcome,
        email,
        message,
      },
      replaceUrl: true,
    });
  }
}