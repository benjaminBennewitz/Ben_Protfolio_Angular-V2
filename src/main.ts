/* src/main.ts */

/**
 * @file Startpunkt der Angular-Anwendung.
 * @description Initialisiert die Standalone-App mit Routing und Scroll-Wiederherstellung.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
  ],
}).catch((error: unknown) => console.error(error));
