/* src/app/layout/cookie-banner/cookie-banner.component.ts */

/**
 * @file Eigenes Cookie- und Technologie-Banner.
 * @description Informiert über notwendige lokale Technologien ohne externe Consent-Dienstleister.
 */

import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';

/** Einzelner Eintrag im Privacy-Control-Panel. */
interface PrivacyControlItem {
  readonly icon: string;                      // Material-Symbol des Eintrags.
  readonly title: string;                     // Sichtbarer Titel des Eintrags.
  readonly status: string;                    // Kurzstatus des Eintrags.
  readonly text: string;                      // Beschreibung des Eintrags.
  readonly state: 'locked' | 'local' | 'off'; // Visueller Status für die Darstellung.
}

/** Übersetzte Texte des Cookie-Banners. */
interface CookieBannerTexts {
  readonly ariaLabel: string;                       // Zugängliche Beschriftung des Banners.
  readonly eyebrow: string;                         // Kleine technische Beschriftung.
  readonly title: string;                           // Titel des Banners.
  readonly text: string;                            // Erklärender Haupttext.
  readonly necessaryLabel: string;                  // Label für notwendige Technologien.
  readonly trackingLabel: string;                   // Label für Tracking-Status.
  readonly externalLabel: string;                   // Label für externe Anbieter.
  readonly detailsLabel: string;                    // Beschriftung zum Öffnen der Details.
  readonly overviewLabel: string;                   // Beschriftung zum Zurückkehren zur Übersicht.
  readonly acceptLabel: string;                     // Beschriftung des Bestätigungsbuttons.
  readonly toggleLabel: string;                     // Zugängliche Beschriftung des globalen Cookie-Buttons.
  readonly openToastTitle: string;                  // Toast-Titel beim Öffnen über den globalen Button.
  readonly openToastText: string;                   // Toast-Text beim Öffnen über den globalen Button.
  readonly acceptToastTitle: string;                // Toast-Titel nach Bestätigung.
  readonly acceptToastText: string;                 // Toast-Text nach Bestätigung.
  readonly controls: readonly PrivacyControlItem[]; // Privacy-Control-Einträge.
}

/** Minimaler eigener Cookie-Hinweis ohne externe Anbieter. */
@Component({
  selector: 'bp-cookie-banner',
  standalone: true,
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent {
  private readonly languageService = inject(LanguageService);     // Sprachservice für übersetzte Bannertexte.
  private readonly toastService = inject(SystemToastService);     // Toast-Service für kurze Privacy-Hinweise.
  private readonly destroyRef = inject(DestroyRef);               // Lifecycle-Referenz für externe Öffnen-Events.
  private readonly overlayService = inject(GlobalOverlayService); // Overlay-Service für globale Privacy-Auslöser.
  private readonly storageKey = 'bp-cookie-consent-v1';           // Schlüssel für die lokale Bestätigung des Hinweises.
  readonly visible = signal<boolean>(this.shouldShowBanner());    // Sichtbarkeit des Banners.
  readonly detailsOpen = signal<boolean>(false);                  // Sichtbarkeit der Detailansicht.
  readonly texts = computed<CookieBannerTexts>(                   // Übersetzte Bannertexte der aktiven Sprache.
    /** Übersetzte Bannertexte der aktiven Sprache. */
    () => COOKIE_BANNER_TEXTS[this.languageService.language()]
  );

  /** Verbindet Footer-Auslöser mit dem lokalen Banner-Zustand. */
  constructor() {
    this.overlayService.privacyPanelRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(/** Öffnet die Privacy-Details nach einem globalen Auslöser erneut. */() => this.reopenBanner());
  }

  /** Öffnet den Hinweis erneut über den Footer-Eintrag. */
  reopenBanner(): void {
    this.visible.set(true);
    this.detailsOpen.set(true);
    this.toastService.show({ icon: 'cookie', title: this.texts().openToastTitle, message: this.texts().openToastText, tone: 'privacy' });
  }

  /** Schaltet zwischen kurzer Übersicht und Privacy-Control-Details um. */
  toggleDetails(): void {
    this.detailsOpen.update(/** Kehrt den aktuellen Öffnungszustand der Detailansicht um. */(isOpen) => !isOpen);
  }

  /** Speichert die Zustimmung zu notwendigen Technologien und blendet das Banner aus. */
  acceptNecessary(): void {
    this.persistConsent();
    this.visible.set(false);
    this.detailsOpen.set(false);
    this.toastService.show({ icon: 'verified_user', title: this.texts().acceptToastTitle, message: this.texts().acceptToastText, tone: 'success' });
  }

  /** Prüft, ob der lokale Hinweis bereits bestätigt wurde. */
  private shouldShowBanner(): boolean {
    try {
      return localStorage.getItem(this.storageKey) !== 'accepted';
    } catch {
      return true;
    }
  }

  /** Persistiert nur den Hinweisstatus lokal im Browser. */
  private persistConsent(): void {
    try {
      localStorage.setItem(this.storageKey, 'accepted');
    } catch {
      this.visible.set(false);
    }
  }
}

const COOKIE_BANNER_TEXTS: Record<'de' | 'en', CookieBannerTexts> = { // Übersetzte Inhalte des Cookie-Banners.
  de: {
    ariaLabel: 'Privacy-Control-Panel zu notwendigen Technologien',
    eyebrow: 'privacy_controls.exe',
    title: 'Privacy Controls',
    text: 'Dieses Portfolio kommt aktuell ohne Tracking, Marketing-Cookies und externe Consent-Dienste aus. Notwendige lokale Einstellungen sorgen nur dafür, dass Theme, Sprache, Barrierefreiheitsmodi und Hinweise gespeichert bleiben.',
    necessaryLabel: 'Notwendig: aktiv',
    trackingLabel: 'Tracking: aus',
    externalLabel: 'Externe Anbieter: aus',
    detailsLabel: 'Details ansehen',
    overviewLabel: 'Zur Übersicht',
    acceptLabel: 'Alles klar',
    toggleLabel: 'Cookie- und Privacy-Control-Panel öffnen',
    openToastTitle: 'privacy module opened',
    openToastText: 'Du kannst die lokalen Technologie-Hinweise jederzeit erneut ansehen.',
    acceptToastTitle: 'privacy saved',
    acceptToastText: 'Nur notwendige lokale Einstellungen bleiben aktiv.',
    controls: [
      { icon: 'lock', title: 'Notwendige Technologien', status: 'aktiv · nicht deaktivierbar', text: 'Speichern Theme, Sprache, Accessibility-Modi und den Hinweisstatus lokal im Browser.', state: 'locked' },
      { icon: 'tune', title: 'Komfortfunktionen', status: 'lokal · optional', text: 'Personalisieren die Darstellung, ohne Daten an externe Dienste zu senden.', state: 'local' },
      { icon: 'query_stats', title: 'Analyse / Tracking', status: 'nicht aktiv', text: 'Es werden aktuell keine Analytics-, Marketing- oder Profiling-Cookies gesetzt.', state: 'off' },
      { icon: 'hub', title: 'Externe Consent-Dienste', status: 'nicht aktiv', text: 'Das Panel ist bewusst selbst gebaut und nutzt keinen externen Cookie-Dienstleister.', state: 'off' },
    ],
  },
  en: {
    ariaLabel: 'Privacy control panel for necessary technologies',
    eyebrow: 'privacy_controls.exe',
    title: 'Privacy Controls',
    text: 'This portfolio currently runs without tracking, marketing cookies or external consent services. Necessary local settings only keep theme, language, accessibility modes and notices stored in this browser.',
    necessaryLabel: 'Necessary: active',
    trackingLabel: 'Tracking: off',
    externalLabel: 'External providers: off',
    detailsLabel: 'Show details',
    overviewLabel: 'Back to overview',
    acceptLabel: 'Got it',
    toggleLabel: 'Open cookie and privacy control panel',
    openToastTitle: 'privacy module opened',
    openToastText: 'You can review the local technology notice again at any time.',
    acceptToastTitle: 'privacy saved',
    acceptToastText: 'Only necessary local settings remain active.',
    controls: [
      { icon: 'lock', title: 'Necessary technologies', status: 'active · cannot be disabled', text: 'Store theme, language, accessibility modes and notice status locally in this browser.', state: 'locked' },
      { icon: 'tune', title: 'Comfort features', status: 'local · optional', text: 'Personalize the interface without sending data to external services.', state: 'local' },
      { icon: 'query_stats', title: 'Analytics / tracking', status: 'not active', text: 'No analytics, marketing or profiling cookies are currently used.', state: 'off' },
      { icon: 'hub', title: 'External consent services', status: 'not active', text: 'This panel is custom built and does not use an external cookie provider.', state: 'off' },
    ],
  },
};
