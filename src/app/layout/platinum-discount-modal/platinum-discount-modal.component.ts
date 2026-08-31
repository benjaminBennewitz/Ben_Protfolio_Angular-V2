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
  /** Kleine technische Beschriftung über dem Titel. */
  readonly eyebrow: string;
  /** Haupttitel des Dialogs. */
  readonly title: string;
  /** Erste erklärende Zeile. */
  readonly intro: string;
  /** Zweite spielerische Zeile. */
  readonly blink: string;
  /** Zusammenfassung des erreichten Portfolio-Fortschritts. */
  readonly reward: string;
  /** Label für den technischen Abschlussstatus. */
  readonly statusLabel: string;
  /** Kompakter technischer Statuswert. */
  readonly status: string;
  /** Ergänzender Hinweis zur vollständig erkundeten Experience. */
  readonly note: string;
  /** CTA zu den Case Studies. */
  readonly ctaLabel: string;
  /** Zugängliche Beschriftung zum Schließen des Dialogs. */
  readonly closeLabel: string;
}

/** Großes Abschluss-Popup für die vollständig erkundete Portfolio-Experience. */
@Component({
  selector: 'bp-platinum-completion-modal',
  standalone: true,
  templateUrl: './platinum-discount-modal.component.html',
  styleUrl: './platinum-discount-modal.component.scss',
})
export class PlatinumCompletionModalComponent {
  /** Dialogelement für initialen Fokus und Fokusfalle. */
  @ViewChild('modalWindow') private modalWindow?: ElementRef<HTMLElement>;

  /** Element, das vor dem Öffnen des Popups fokussiert war. */
  private modalReturnFocus: HTMLElement | null = null;

  /** Geplanter Frame für Fokuswechsel des Popups. */
  private modalFocusFrameId = 0;
  /** Achievement-Service mit Sichtbarkeitszustand des Platin-Popups. */
  readonly achievementService = inject(AchievementService);

  /** Sprachservice für lokalisierte Popup-Texte. */
  private readonly languageService = inject(LanguageService);

  /** Router für den Sprung zu den Case Studies. */
  private readonly router = inject(Router);

  /** Aktive Popup-Texte passend zur Sprache. */
  readonly texts = computed<PlatinumCompletionTexts>(() => PLATINUM_TEXTS[this.languageService.language()]);

  /** Synchronisiert Tastaturfokus mit dem globalen Sichtbarkeitszustand des Popups. */
  private readonly modalFocusEffect = effect(() => {
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
    this.modalFocusFrameId = window.requestAnimationFrame(() => {
      this.modalFocusFrameId = 0;
      this.modalWindow?.nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Stellt nach dem Schließen den Fokus auf das zuvor aktive Element zurück. */
  private handleModalClose(): void {
    const returnFocus = this.modalReturnFocus;

    if (!returnFocus) {
      return;
    }

    this.modalReturnFocus = null;
    this.cancelModalFocusFrame();
    this.modalFocusFrameId = window.requestAnimationFrame(() => {
      this.modalFocusFrameId = 0;

      if (returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
      }
    });
  }

  /** Begrenzt die Tab-Reihenfolge auf das sichtbare Platin-Popup. */
  private trapModalFocus(event: KeyboardEvent): void {
    const panel = this.modalWindow?.nativeElement;

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')) as HTMLElement[];

    if (!focusableElements.length) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

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

/** Übersetzungen des Platin-Abschluss-Popups. */
const PLATINUM_TEXTS: Record<'de' | 'en', PlatinumCompletionTexts> = {
  de: {
    eyebrow: 'platinum_complete.exe',
    title: 'Platin',
    intro: 'Trophäe freigeschaltet. Du hast alle versteckten Details gefunden.',
    blink: 'Das Internet hat kurz geblinzelt.',
    reward: '100 % Portfolio erkundet. Status: legendär.',
    statusLabel: 'Status',
    status: 'ALL_FOUND',
    note: 'Alle bekannten Easter Eggs und Interaktionen dieser Experience wurden freigeschaltet.',
    ctaLabel: 'Case Studies öffnen',
    closeLabel: 'Platin-Popup schließen',
  },
  en: {
    eyebrow: 'platinum_complete.exe',
    title: 'Platinum',
    intro: 'Trophy unlocked. You found every hidden detail.',
    blink: 'The internet blinked for a second.',
    reward: '100% of the portfolio explored. Status: legendary.',
    statusLabel: 'Status',
    status: 'ALL_FOUND',
    note: 'Every known Easter egg and interaction in this experience has been unlocked.',
    ctaLabel: 'Open case studies',
    closeLabel: 'Close platinum popup',
  },
};
