# Google OAuth Integration - Quick Setup

## Files Created

1. **`src/app/services/oauth.service.ts`**
   - Core OAuth service handling Google authentication
   - Token management and refresh logic
   - User session management

2. **`src/app/interceptors/oauth.interceptor.ts`**
   - HTTP interceptor for automatic token attachment
   - Handles 401 errors with token refresh
   - Request queueing during refresh

3. **`src/app/guards/oauth.guard.ts`**
   - Route protection for OAuth-required pages
   - Redirects to login if not authenticated

4. **`src/app/pages/oauth-login/oauth-login.component.ts`**
   - Google Sign-In UI component
   - Supports both One Tap and redirect flows
   - Beautiful modern UI with gradient

5. **`src/app/pages/oauth-callback/oauth-callback.component.ts`**
   - Handles OAuth redirect callback
   - Token exchange completion
   - Error handling

## Files Updated

1. **`src/environments/environment.ts`** & **`environment.prod.ts`**
   - Added Google OAuth configuration
   - Add your Google Client ID and Secret

2. **`src/app/app.module.ts`**
   - Registered OAuthInterceptor in HTTP_INTERCEPTORS

3. **`src/app/services/relay-service.ts`**
   - Added `connectGoogleOAuthAccount()` method
   - Integrated OAuthService dependency
   - Uses stored OAuth credentials to connect email

## Quick Start

### Step 1: Get Google OAuth Credentials
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 credentials
- Copy Client ID and Client Secret

### Step 2: Update Environment
```typescript
// src/environments/environment.ts
export const environment = {
  google: {
    clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUrl: 'http://localhost:8100/oauth/google/callback',
    // ... rest of config
  }
};
```

### Step 3: Add Routes
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'oauth/login',
    component: OAuthLoginComponent,
  },
  {
    path: 'oauth/google/callback',
    component: OAuthCallbackComponent,
  },
  // ... other routes
];
```

### Step 4: Implement Backend Endpoints
- `POST /api/auth/google/exchange-token`
- `POST /api/auth/google/callback`
- `POST /api/auth/google/refresh`

### Step 5: Use in Components

**Initiate OAuth Flow:**
```typescript
constructor(private oauthService: OAuthService) {}

connectEmail() {
  this.oauthService.signInWithGoogle();
}
```

**Connect to Relay:**
```typescript
constructor(private relayService: RelayService) {}

connectToRelay() {
  this.relayService.connectGoogleOAuthAccount().subscribe({
    next: (account) => console.log('Connected:', account),
    error: (err) => console.error('Failed:', err)
  });
}
```

**Protect Route:**
```typescript
{
  path: 'relay',
  component: RelayUserComponent,
  canActivate: [OAuthGuard]  // Requires authentication
}
```

## Key Features

✅ **Two Authentication Flows**
- Google One Tap (auto-popup)
- Standard OAuth redirect (manual)

✅ **Automatic Token Management**
- Access token expiry detection
- Automatic refresh with retry
- Request queueing during refresh

✅ **Secure Credential Storage**
- localStorage for tokens
- JWT parsing (client-side)
- Logout with cleanup

✅ **Modern UI**
- Gradient backgrounds
- Responsive design
- Loading states
- Error handling

✅ **Full Integration**
- HTTP interceptor for all requests
- Guard protection for routes
- Service layer with RelayService
- Complete error handling

## Usage Pattern

```
User clicks "Connect Email"
         ↓
OAuth Login Component
         ↓
Google OAuth Flow
         ↓
Exchange Token with Backend
         ↓
Store Access/Refresh Tokens
         ↓
Connect Account to Relay
         ↓
Use OAuth Token in API Calls
         ↓
Automatic Refresh on Expiry
```

## Testing

1. **Test Google Sign-In:**
   - Click "Connect Email"
   - Complete Google authentication
   - Verify user info appears

2. **Test Token Refresh:**
   - Wait for token expiry (or mock with short expiry)
   - Make API call
   - Verify automatic token refresh occurs

3. **Test Protected Route:**
   - Try accessing `/relay` without login
   - Should redirect to `/oauth/login`
   - After login, should be able to access

## Next Steps

1. Obtain Google OAuth credentials
2. Configure environment files
3. Implement backend OAuth endpoints
4. Add routes to routing module
5. Update components to use OAuth service
6. Test authentication flow
7. Deploy with HTTPS

## Support

For detailed documentation, see: `OAUTH_INTEGRATION_GUIDE.md`

Common Issues:
- "Google OAuth library not loaded" → Check script loading
- "Redirect URI mismatch" → Verify Google Cloud config
- "401 errors" → Check token attachment in requests
