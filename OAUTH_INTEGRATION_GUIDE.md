# Google OAuth Integration for Relay AI Service

## Overview

This guide explains how to implement and use Google OAuth authentication with the Relay AI email service. The OAuth integration allows users to securely authenticate with Google and connect their email accounts to the Relay service.

## Architecture

### Components

1. **OAuthService** (`oauth.service.ts`)
   - Manages Google OAuth authentication flow
   - Handles token exchange and refresh
   - Stores credentials securely

2. **OAuthInterceptor** (`oauth.interceptor.ts`)
   - Automatically attaches OAuth tokens to HTTP requests
   - Handles token refresh on 401 errors
   - Queues requests during token refresh

3. **OAuthGuard** (`oauth.guard.ts`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to login

4. **OAuth Components**
   - `OAuthLoginComponent`: Google sign-in interface
   - `OAuthCallbackComponent`: Handles OAuth redirect callback

5. **RelayService Integration**
   - `connectOAuthAccount()`: Connect account with OAuth credentials
   - `connectGoogleOAuthAccount()`: Automated Google OAuth flow

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8100/oauth/google/callback` (development)
     - `https://yourproddomain.com/oauth/google/callback` (production)
   - Copy the Client ID and Client Secret

### 2. Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: "https://processzero-api-3.somee.com/api",
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    redirectUrl: 'http://localhost:8100/oauth/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  }
};
```

### 3. Backend Endpoints

Implement the following endpoints on your backend:

```
POST /api/auth/google/exchange-token
- Exchanges Google ID token for access/refresh tokens
- Body: { idToken: string }
- Response: { accessToken: string; refreshToken: string; expiresIn: number }

POST /api/auth/google/callback
- Handles OAuth authorization code callback
- Body: { code: string }
- Response: { accessToken: string; refreshToken: string; expiresIn: number }

POST /api/auth/google/refresh
- Refreshes expired access token
- Body: { refreshToken: string }
- Response: { accessToken: string; expiresIn: number }

POST /api/relay/accounts/connect-oauth
- Connects email account with OAuth credentials
- Body: { emailAddress: string; provider: string; accessToken: string; refreshToken: string }
- Response: RelayEmailAccount
```

### 4. Update App Routes

Add OAuth routes to your routing module:

```typescript
// In app-routing.module.ts
const routes: Routes = [
  {
    path: 'oauth',
    children: [
      {
        path: 'login',
        component: OAuthLoginComponent,
      },
      {
        path: 'google/callback',
        component: OAuthCallbackComponent,
      },
    ],
  },
  // ... other routes
];
```

## Usage

### Basic Usage in Components

#### Example 1: Sign In and Connect Account

```typescript
import { Component, inject } from '@angular/core';
import { OAuthService } from 'src/app/services/oauth.service';
import { RelayService } from 'src/app/services/relay-service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-relay-connect',
  template: `
    <ion-button (click)="connectWithGoogle()">
      <ion-icon slot="start" name="logo-google"></ion-icon>
      Connect Google Account
    </ion-button>
  `
})
export class RelayConnectComponent {
  private oauthService = inject(OAuthService);
  private relayService = inject(RelayService);
  private toastController = inject(ToastController);

  connectWithGoogle(): void {
    // Sign in with Google
    this.oauthService.signInWithGoogle();

    // Listen for OAuth completion
    this.oauthService.getAuthToken$().subscribe((token) => {
      if (token) {
        this.connectAccount();
      }
    });
  }

  private connectAccount(): void {
    this.relayService.connectGoogleOAuthAccount().subscribe({
      next: async (account) => {
        const toast = await this.toastController.create({
          message: `Account connected: ${account.emailAddress}`,
          color: 'success',
          duration: 2000
        });
        await toast.present();
      },
      error: async (err) => {
        const toast = await this.toastController.create({
          message: `Failed to connect: ${err.message}`,
          color: 'danger',
          duration: 2000
        });
        await toast.present();
      }
    });
  }
}
```

#### Example 2: Check Authentication Status

```typescript
import { Component, inject } from '@angular/core';
import { OAuthService } from 'src/app/services/oauth.service';

@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="currentUser$ | async as user">
      <p>Welcome, {{ user.name }}</p>
      <img [src]="user.picture" [alt]="user.name">
    </div>
  `
})
export class UserProfileComponent {
  protected oauthService = inject(OAuthService);
  protected currentUser$ = this.oauthService.getCurrentUser$();
}
```

#### Example 3: Protected Route with OAuth Guard

```typescript
// In app-routing.module.ts
const routes: Routes = [
  {
    path: 'relay',
    component: RelayUserComponent,
    canActivate: [OAuthGuard],
  }
];
```

### OAuth Flow Steps

1. **User Initiates Login**
   ```typescript
   oauthService.signInWithGoogle();
   ```

2. **Google Signs User In**
   - User completes Google authentication
   - OAuth service receives ID token

3. **Token Exchange with Backend**
   - ID token is sent to your backend
   - Backend exchanges for access/refresh tokens
   - Tokens are stored locally

4. **Connect Email Account**
   ```typescript
   relayService.connectGoogleOAuthAccount().subscribe({
     next: (account) => console.log('Account connected', account)
   });
   ```

5. **Automatic Token Refresh**
   - Interceptor detects token expiry
   - Automatically requests new token from backend
   - Retries original request with new token

## API Reference

### OAuthService

```typescript
// Sign in with Google
signInWithGoogle(): void

// Redirect to OAuth consent screen
redirectToGoogleOAuth(): void

// Handle OAuth callback with authorization code
handleOAuthRedirectCallback(code: string): Observable<GoogleAuthToken>

// Get current authentication token
getAuthToken(): GoogleAuthToken | null
getAuthToken$(): Observable<GoogleAuthToken | null>

// Get current user
getCurrentUser(): GoogleOAuthUser | null
getCurrentUser$(): Observable<GoogleOAuthUser | null>

// Check authentication status
isAuthenticated(): boolean
isTokenExpired(): boolean

// Refresh access token
refreshAccessToken(): Observable<GoogleAuthToken>

// Logout
logout(): void
```

### RelayService

```typescript
// Connect account with OAuth credentials
connectOAuthAccount(request: {
  emailAddress: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
}): Observable<RelayEmailAccount>

// Connect using current OAuth session
connectGoogleOAuthAccount(): Observable<RelayEmailAccount>
```

## Security Considerations

1. **Token Storage**
   - Access tokens are stored in localStorage (production should use more secure storage)
   - Refresh tokens should never be stored client-side in production
   - Consider using httpOnly cookies for sensitive tokens

2. **HTTPS**
   - Always use HTTPS in production
   - OAuth callbacks must use HTTPS

3. **CORS**
   - Configure backend CORS to accept requests from your domain
   - Use credentials in requests: `withCredentials: true`

4. **Token Validation**
   - Always validate tokens on the backend
   - Never trust client-side token validation for security decisions

5. **Scope Permissions**
   - Request only necessary Gmail scopes
   - Current scopes:
     - `gmail.send` - Send emails
     - `gmail.readonly` - Read emails

## Troubleshooting

### Issue: "Google OAuth library not loaded"
- Ensure Google scripts are loaded in `index.html` or through OAuthService
- Check browser console for script load errors

### Issue: "Redirect URI mismatch"
- Verify redirect URI matches Google Cloud Console configuration
- Check environment configuration

### Issue: "Token refresh failing"
- Ensure backend token refresh endpoint is implemented
- Check backend logs for errors
- Verify refresh token exists

### Issue: "401 errors persisting"
- Check token expiry time
- Ensure interceptor is registered in AppModule
- Verify OAuth token is being attached to requests

## Example: Complete Relay Email Account Connection Flow

```typescript
import { Component, inject } from '@angular/core';
import { OAuthService } from 'src/app/services/oauth.service';
import { RelayService } from 'src/app/services/relay-service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-connect-email',
  template: `
    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Connect Email Account</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-button 
            expand="block" 
            color="primary"
            [disabled]="connecting"
            (click)="connect()">
            <ion-spinner name="crescent" *ngIf="connecting"></ion-spinner>
            <span *ngIf="!connecting">Connect with Google</span>
          </ion-button>

          <div *ngIf="connected" class="success-message">
            <ion-icon name="checkmark-circle" color="success"></ion-icon>
            <p>{{ email }} connected successfully!</p>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class ConnectEmailComponent {
  private oauthService = inject(OAuthService);
  private relayService = inject(RelayService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  connecting = false;
  connected = false;
  email = '';

  connect(): void {
    this.connecting = true;

    // Step 1: Sign in with Google
    this.oauthService.signInWithGoogle();

    // Step 2: Wait for OAuth completion
    const subscription = this.oauthService.getAuthToken$().subscribe((token) => {
      if (token && !this.connected) {
        // Step 3: Connect to Relay
        this.relayService.connectGoogleOAuthAccount().subscribe({
          next: async (account) => {
            this.email = account.emailAddress || '';
            this.connected = true;
            this.connecting = false;
            subscription.unsubscribe();

            const toast = await this.toastController.create({
              message: 'Email account connected!',
              color: 'success',
              duration: 2000
            });
            await toast.present();

            setTimeout(() => {
              this.router.navigate(['/relay-user']);
            }, 2000);
          },
          error: async (err) => {
            this.connecting = false;
            subscription.unsubscribe();

            const toast = await this.toastController.create({
              message: `Connection failed: ${err.message}`,
              color: 'danger',
              duration: 3000
            });
            await toast.present();
          }
        });
      }
    });
  }
}
```

## Production Deployment

1. **Update Environment Variables**
   - Set production Google OAuth credentials
   - Update redirect URLs to production domain

2. **Backend Deployment**
   - Implement all required OAuth endpoints
   - Validate all tokens server-side
   - Use environment variables for secrets

3. **Frontend Build**
   ```bash
   ng build --prod
   ```

4. **Security Headers**
   - Set appropriate CORS headers
   - Use Content Security Policy (CSP)
   - Enable HSTS

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Sign-In Button](https://developers.google.com/identity/sign-in/web)
