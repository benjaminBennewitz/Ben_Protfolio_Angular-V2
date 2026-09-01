/* src/main.ts */

/**
 * @file Startpunkt der Angular-Anwendung.
 * @description Initialisiert die Standalone-App mit Routing und kontrolliertem Initial-Scroll.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { NavigationEnd, Router, provideRouter, withInMemoryScrolling } from '@angular/router';
import { filter, take } from 'rxjs';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/** Entfernt die Start-Sperre erst, nachdem Angular seine erste Navigation abgeschlossen hat. */
function releaseInitialScroll(router: Router): void {
  const release = (): void => {
    const root = document.documentElement;
    const hasFragment = window.location.hash.length > 1;

    if (!hasFragment) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      root.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    window.requestAnimationFrame(() => {
      if (!hasFragment) {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }

      window.requestAnimationFrame(() => {
        root.classList.remove('bp-initial-scroll-reset', 'bp-initial-scroll-pending');
      });
    });
  };

  if (router.navigated) {
    release();
    return;
  }

  router.events
    .pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      take(1),
    )
    .subscribe(() => release());
}

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
})
  .then((appRef) => releaseInitialScroll(appRef.injector.get(Router)))
  .catch((error: unknown) => console.error(error));
