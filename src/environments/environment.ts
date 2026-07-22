// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "https://api.processzero.xyz/api",
  google: {
    clientId: '384499091370-4md9khsd5f5g4t0gcej852pmdcg1280a.apps.googleusercontent.com',
    redirectUrl: 'http://processzero.xyz/oauth/google/callback',
    scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
  },
  paypal: {
    clientId: 'AUP2iAN9YP3ORR3zMQWiBEg8_XLPlUFBcfgh_3hgFyZPzHuxa2oSoGpWKvSZ1jIYXpnfwnMhDjGQ546g'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
