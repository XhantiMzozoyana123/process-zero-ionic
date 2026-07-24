import { ErrorHandler, Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomErrorHandler implements ErrorHandler {
  constructor(private zone: NgZone) {}

  handleError(error: any): void {
    this.zone.run(() => {
      console.error('[GlobalError]', error);
      // Route stays alive — no redirect that could blank the app
    });
  }
}