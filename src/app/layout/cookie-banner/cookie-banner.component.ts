/* src/app/layout/cookie-banner/cookie-banner.component.ts */

/**
 * @file Eigenes Cookie- und Technologie-Banner.
 * @description Informiert über notwendige lokale Technologien ohne externe Consent-Dienstleister.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { SystemToastService } from '../../core/services/system-toast.service';

/** Einzelner Eintrag im Privacy-Control-Panel. */
interface PrivacyControlItem {
  /** Material-Symbol des Eintrags. */
  readonly icon: string;
  /** Sichtbarer Titel des Eintrags. */
  readonly title: string;
  /** Kurzstatus des Eintrags. */
  readonly status: string;
  /** Beschreibung des Eintrags. */
  readonly text: string;
  /** Visueller Status für die Darstellung. */
  readonly state: 'locked' | 'local' | 'off';
}

/** Übersetzte Texte des Cookie-Banners. */
interface CookieBannerTexts {
  /** Zugängliche Beschriftung des Banners. */
  readonly ariaLabel: string;
  /** Kleine technische Beschriftung. */
  readonly eyebrow: string;
  /** Titel des Banners. */
  readonly title: string;
  /** Erklärender Haupttext. */
  readonly text: string;
  /** Label für notwendige Technologien. */
  readonly necessaryLabel: string;
  /** Label für Tracking-Status. */
  readonly trackingLabel: string;
  /** Label für externe Anbieter. */
  readonly externalLabel: string;
  /** Beschriftung zum Öffnen der Details. */
  readonly detailsLabel: string;
  /** Beschriftung zum Zurückkehren zur Übersicht. */
  readonly overviewLabel: string;
  /** Beschriftung des Bestätigungsbuttons. */
  readonly acceptLabel: string;
  /** Zugängliche Beschriftung des globalen Cookie-Buttons. */
  readonly toggleLabel: string;
  /** Toast-Titel beim Öffnen über den globalen Button. */
  readonly openToastTitle: string;
  /** Toast-Text beim Öffnen über den globalen Button. */
  readonly openToastText: string;
  /** Toast-Titel nach Bestätigung. */
  readonly acceptToastTitle: string;
  /** Toast-Text nach Bestätigung. */
  readonly acceptToastText: string;
  /** Privacy-Control-Einträge. */
  readonly controls: readonly PrivacyControlItem[];
}

/** Minimaler eigener Cookie-Hinweis ohne externe Anbieter. */
@Component({
  selector: 'bp-cookie-banner',
  standalone: true,
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent {
  /** Sprachservice für übersetzte Bannertexte. */
  private readonly languageService = inject(LanguageService);

  /** Toast-Service für kurze Privacy-Hinweise. */
  private readonly toastService = inject(SystemToastService);

  /** Schlüssel für die lokale Bestätigung des Hinweises. */
  private readonly storageKey = 'bp-cookie-consent-v1';

  /** Sichtbarkeit des Banners. */
  readonly visible = signal<boolean>(this.shouldShowBanner());

  /** Sichtbarkeit der Detailansicht. */
  readonly detailsOpen = signal<boolean>(false);

  /** Übersetzte Bannertexte der aktiven Sprache. */
  readonly texts = computed<CookieBannerTexts>(() => COOKIE_BANNER_TEXTS[this.languageService.language()]);

  /** Öffnet den Hinweis erneut über das globale Cookie-Icon. */
  reopenBanner(): void {
    this.visible.set(true);
    this.detailsOpen.set(true);
    this.toastService.show({ icon: 'cookie', title: this.texts().openToastTitle, message: this.texts().openToastText, tone: 'privacy' });
  }

  /** Schaltet zwischen kurzer Übersicht und Privacy-Control-Details um. */
  toggleDetails(): void {
    this.detailsOpen.update((isOpen) => !isOpen);
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

/** Übersetzte Inhalte des Cookie-Banners. */
const COOKIE_BANNER_TEXTS: Record<'de' | 'en', CookieBannerTexts> = {
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
