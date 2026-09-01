/* src/main.ts */

/**
 * @file Startpunkt der Angular-Anwendung.
 * @description Initialisiert die Standalone-App mit Routing und Scroll-Wiederherstellung.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/** Setzt einen echten Seitenreload vor Angular zuverlässig an den Dokumentanfang. */
function resetInitialScrollPosition(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  if (window.location.hash) {
    return;
  }

  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  root.scrollTop = 0;

  if (document.body) {
    document.body.scrollTop = 0;
  }

  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}

resetInitialScrollPosition();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'top',
      }),
    ),
  ],
}).catch((error: unknown) => console.error(error));
