export const environment = {
  production: true,
  apiUrl: "https://api.processzero.xyz/api",
  google: {
    clientId: '1016527872417-u68elhobo3ochv74tpgolkehn2mlnd95.apps.googleusercontent.com',
    redirectUrl: 'https://yourproddomain.com/oauth/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  }
};
 