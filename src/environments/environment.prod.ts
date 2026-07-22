export const environment = {
  production: true,
  apiUrl: "https://api.processzero.xyz/api",
  google: {
    clientId: '384499091370-4md9khsd5f5g4t0gcej852pmdcg1280a.apps.googleusercontent.com',
    redirectUrl: 'https://processzero.xyz/oauth/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  },
  paypal: {
    clientId: 'AUP2iAN9YP3ORR3zMQWiBEg8_XLPlUFBcfgh_3hgFyZPzHuxa2oSoGpWKvSZ1jIYXpnfwnMhDjGQ546g'
  }
};
