export const environment = {
  production: true,
  apiUrl: "https://api.processzero.xyz/api",
  google: {
    clientId: '1016527872417-kbdv2il3hi0ojbu43fs0rtmhl9ujueh6.apps.googleusercontent.com',
    redirectUrl: 'https://processzero.xyz/oauth/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  }
};
 