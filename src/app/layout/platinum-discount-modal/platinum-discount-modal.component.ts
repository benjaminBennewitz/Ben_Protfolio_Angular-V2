/* src/app/layout/platinum-discount-modal/platinum-discount-modal.component.ts */

/**
 * @file Platin-Abschluss-Popup des Portfolio-Achievement-Systems.
 * @description Würdigt das vollständige Erkunden der versteckten Portfolio-Interaktionen ohne kommerziellen Reward.
 */

import { Component, ElementRef, ViewChild, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';

/** Übersetzbare Texte des Platin-Abschluss-Popups. */
interface PlatinumCompletionTexts {
  readonly eyebrow: string;     // Kleine technische Beschriftung über dem Titel.
  readonly title: string;       // Haupttitel des Dialogs.
  readonly intro: string;       // Erste erklärende Zeile.
  readonly blink: string;       // Zweite spielerische Zeile.
  readonly reward: string;      // Zusammenfassung des erreichten Portfolio-Fortschritts.
  readonly statusLabel: string; // Label für den technischen Abschlussstatus.
  readonly status: string;      // Kompakter technischer Statuswert.
  readonly note: string;        // Ergänzender Hinweis zur vollständig erkundeten Experience.
  readonly ctaLabel: string;    // CTA zu den Case Studies.
  readonly closeLabel: string;  // Zugängliche Beschriftung zum Schließen des Dialogs.
}

/** Großes Abschluss-Popup für die vollständig erkundete Portfolio-Experience. */
@Component({
  selector: 'bp-platinum-completion-modal',
  standalone: true,
  templateUrl: './platinum-discount-modal.component.html',
  styleUrl: './platinum-discount-modal.component.scss',
})
export class PlatinumCompletionModalComponent {
  @ViewChild('modalWindow') private modalWindow?: ElementRef<HTMLElement>;                                                           // Dialogelement für initialen Fokus und Fokusfalle.
  private modalReturnFocus: HTMLElement | null = null;                                                                               // Element, das vor dem Öffnen des Popups fokussiert war.
  private modalFocusFrameId = 0;                                                                                                     // Geplanter Frame für Fokuswechsel des Popups.
  readonly achievementService = inject(AchievementService);                                                                          // Achievement-Service mit Sichtbarkeitszustand des Platin-Popups.
  private readonly languageService = inject(LanguageService);                                                                        // Sprachservice für lokalisierte Popup-Texte.
  private readonly router = inject(Router);                                                                                          // Router für den Sprung zu den Case Studies.
  readonly texts = computed<PlatinumCompletionTexts>(                                                                                // Aktive Popup-Texte passend zur Sprache.
    /** Aktive Popup-Texte passend zur Sprache. */
    () => PLATINUM_TEXTS[this.languageService.language()]
  );

  private readonly modalFocusEffect = effect(/** Synchronisiert Dialogsichtbarkeit, initialen Fokus und Fokusrückführung. */() => { // Synchronisiert Tastaturfokus mit dem globalen Sichtbarkeitszustand des Popups.
    if (this.achievementService.isPlatinumModalVisible()) {
      this.handleModalOpen();
      return;
    }

    this.handleModalClose();
  });

  /** Schließt das modale Popup per Escape und hält Tab innerhalb des Dialogs. */
  handleModalKeydown(event: KeyboardEvent): void {
    if (!this.achievementService.isPlatinumModalVisible()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.achievementService.dismissPlatinumModal();
      return;
    }

    if (event.key === 'Tab') {
      this.trapModalFocus(event);
    }
  }

  /** Merkt den Auslöser und setzt den Fokus nach dem Rendern in das Popup. */
  private handleModalOpen(): void {
    if (!this.modalReturnFocus) {
      this.modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    this.cancelModalFocusFrame();
    this.modalFocusFrameId = window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => {
      this.modalFocusFrameId = 0;
      this.modalWindow?.nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Stellt nach dem Schließen den Fokus auf das zuvor aktive Element zurück. */
  private handleModalClose(): void {

    const returnFocus = this.modalReturnFocus; // Vor dem Öffnen aktives Element für die Fokusrückführung.

    if (!returnFocus) {
      return;
    }

    this.modalReturnFocus = null;
    this.cancelModalFocusFrame();
    this.modalFocusFrameId = window.requestAnimationFrame(/** Stellt nach dem Schließen den verfügbaren Auslöserfokus wieder her. */() => {
      this.modalFocusFrameId = 0;

      if (returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    });
  }

  /** Begrenzt die Tab-Reihenfolge auf das sichtbare Platin-Popup. */
  private trapModalFocus(event: KeyboardEvent): void {

    const panel = this.modalWindow?.nativeElement; // Gerendertes Dialogfenster für die Fokussteuerung.

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[]; // Innerhalb des Dialogs erreichbare Bedienelemente.

    if (!focusableElements.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusableElements[0];                           // Erstes fokussierbares Element im Dialog.
    const last = focusableElements[focusableElements.length - 1]; // Letztes fokussierbares Element im Dialog.
    const activeElement = document.activeElement;                 // Aktuell fokussiertes Element des Dokuments.

    if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && (activeElement === last || !panel.contains(activeElement))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  /** Bricht einen noch offenen Fokus-Frame des Popups ab. */
  private cancelModalFocusFrame(): void {
    if (!this.modalFocusFrameId) {
      return;
    }

    window.cancelAnimationFrame(this.modalFocusFrameId);
    this.modalFocusFrameId = 0;
  }

  /** Schließt den Abschlussdialog und öffnet die Case Studies. */
  async openCaseStudies(): Promise<void> {
    this.achievementService.dismissPlatinumModal();
    await this.router.navigate(['/portfolio']);
  }
}

const PLATINUM_TEXTS: Record<'de' | 'en', PlatinumCompletionTexts> = { // Übersetzungen des Platin-Abschluss-Popups.
  de: {
    eyebrow: 'platinum_complete.exe',
    title: 'Platin',
    intro: 'Trophäe freigeschaltet. Du hast alle versteckten Details des Hauptspiels gefunden.',
    blink: 'Das Internet hat kurz geblinzelt.',
    reward: '100 % Hauptspiel erkundet. Status: legendär.',
    statusLabel: 'Status',
    status: 'ALL_FOUND',
    note: 'Alle Trophäen des Hauptspiels wurden freigeschaltet. Design Studies · DLC hat einen eigenen Fortschritt.',
    ctaLabel: 'Case Studies öffnen',
    closeLabel: 'Platin-Popup schließen',
  },
  en: {
    eyebrow: 'platinum_complete.exe',
    title: 'Platinum',
    intro: 'Trophy unlocked. You found every hidden detail in the base game.',
    blink: 'The internet blinked for a second.',
    reward: '100% of the base game explored. Status: legendary.',
    statusLabel: 'Status',
    status: 'ALL_FOUND',
    note: 'Every base-game trophy has been unlocked. Design Studies · DLC has its own progress.',
    ctaLabel: 'Open case studies',
    closeLabel: 'Close platinum popup',
  },
};
