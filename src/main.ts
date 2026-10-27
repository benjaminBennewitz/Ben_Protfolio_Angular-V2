/* src/main.ts */

/**
 * @file main.ts
 * @description Einstiegspunkt der Angular-Anwendung.
 * Initialisiert den Router und koordiniert das Scroll-Verhalten beim Seitenstart,
 * um unerwünschte Scrollsprünge während der ersten Navigation zu vermeiden.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { NavigationEnd, Router, provideRouter, withInMemoryScrolling } from '@angular/router';
import { filter, take } from 'rxjs';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

/**
 * Setzt die initiale Scrollposition vollständig auf den Seitenanfang zurück.
 *
 * @returns Kein Rückgabewert.
 */
function resetInitialScrollPosition(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * Entfernt die CSS-Klassen der initialen Scroll-Sperre.
 *
 * @returns Kein Rückgabewert.
 */
function removeInitialScrollClasses(): void {
  document.documentElement.classList.remove(
    'bp-initial-scroll-reset',
    'bp-initial-scroll-pending',
  );
}

/**
 * Korrigiert die Startposition und gibt die Scroll-Sperre verzögert frei.
 *
 * @returns Kein Rückgabewert.
 */
function scheduleInitialScrollRelease(): void {
  const hasFragment = window.location.hash.length > 1;

  if (!hasFragment) {
    resetInitialScrollPosition();
  }

  window.requestAnimationFrame(() => {
    if (!hasFragment) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
    // CSS-Sperre erst nach der Scrollkorrektur entfernen.
    window.requestAnimationFrame(removeInitialScrollClasses);
  });
}

/**
 * Hebt die initiale Scroll-Sperre nach der ersten Router-Navigation auf.
 *
 * @param router - Angular Router zur Überwachung der Navigation.
 * @returns Kein Rückgabewert.
 */
function releaseInitialScroll(router: Router): void {
  if (router.navigated) {
    scheduleInitialScrollRelease();
    return;
  }

  router.events
    .pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      take(1),
    )
    .subscribe(scheduleInitialScrollRelease);
}

// Angular-Anwendung mit Router und konfiguriertem Scroll-Verhalten starten.
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
  // Initiale Scroll-Sperre nach erfolgreichem Bootstrap freigeben.
  .then((appRef) => releaseInitialScroll(appRef.injector.get(Router)))
  .catch((error: unknown) => console.error(error));