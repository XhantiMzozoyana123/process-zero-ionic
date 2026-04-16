import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

import { AppModule } from './app/app.module';

inject();
injectSpeedInsights();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
