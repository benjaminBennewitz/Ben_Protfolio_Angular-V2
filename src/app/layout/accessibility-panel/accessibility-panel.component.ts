/* src/app/layout/accessibility-panel/accessibility-panel.component.ts */

/**
 * @file Globales Accessibility-Panel.
 * @description Bietet Motion-, Comfort-, Kontrast- und Farbseh-Modi als direkte Seitenmodifikation an.
 */

import { Component, DestroyRef, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { AccessibilityPreferenceService, ColorVisionMode, ComfortMode, ContrastMode, MotionMode } from '../../core/services/accessibility-preference.service';
import { LanguageService } from '../../core/services/language.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { AchievementService } from '../../core/services/achievement.service';

/** Übersetzte Beschriftungen des Accessibility-Panels. */
interface AccessibilityPanelTexts {
  readonly toggleLabel: string;                    // Aria-Label des Öffnen-Buttons.
  readonly landmarkLabel: string;                  // Label des globalen Accessibility-Bereichs.
  readonly title: string;                          // Fenstertitel.
  readonly closeLabel: string;                     // Zugängliche Beschriftung zum Schließen des Panels.
  readonly intro: string;                          // Kurzbeschreibung.
  readonly statusTitle: string;                    // Titel des Hover-Status am globalen Button.
  readonly calmMode: string;                       // Schnellaktion für neuro-sensitiven Modus.
  readonly reset: string;                          // Reset-Button.
  readonly motionTitle: string;                    // Titel für Motion-Auswahl.
  readonly comfortTitle: string;                   // Titel für Darstellungs-Auswahl.
  readonly contrastTitle: string;                  // Titel für Kontrast-Auswahl.
  readonly colorTitle: string;                     // Titel für Farbseh-Auswahl.
  readonly storageHint: string;                    // Hinweis zur lokalen Speicherung.
  readonly toastTitle: string;                     // Toast-Titel nach Änderungen.
  readonly toastText: string;                      // Toast-Text nach Änderungen.
  readonly motion: Record<MotionMode, string>;     // Labels der Motion-Modi.
  readonly comfort: Record<ComfortMode, string>;   // Labels der Comfort-Modi.
  readonly contrast: Record<ContrastMode, string>; // Labels der Kontrast-Modi.
  readonly color: Record<ColorVisionMode, string>; // Labels der Farbseh-Modi.
}

/** Kompaktes Overlay für globale Accessibility-Einstellungen. */
@Component({
  selector: 'bp-accessibility-panel',
  standalone: true,
  templateUrl: './accessibility-panel.component.html',
  styleUrl: './accessibility-panel.component.scss',
})
export class AccessibilityPanelComponent {
  @ViewChild('panelWindow') private panelWindow?: ElementRef<HTMLElement>;                                                    // Dialogelement für initialen Fokus und Fokusfalle.
  private panelReturnFocus: HTMLElement | null = null;                                                                        // Element, das das Panel geöffnet hat.
  private panelFocusFrameId = 0;                                                                                              // Geplanter Frame für Fokuswechsel beim Öffnen und Schließen.
  readonly accessibility = inject(AccessibilityPreferenceService);                                                            // Accessibility-Service mit persistierten Modi.
  private readonly languageService = inject(LanguageService);                                                                 // Sprachservice für Panel-Labels.
  private readonly toastService = inject(SystemToastService);                                                                 // Toast-Service für kurze Accessibility-Hinweise.
  private readonly destroyRef = inject(DestroyRef);                                                                           // Lifecycle-Referenz für externe Öffnen-Events.
  private readonly overlayService = inject(GlobalOverlayService);                                                             // Overlay-Service für globale Öffnen-Events.
  private readonly achievementService = inject(AchievementService);                                                           // Achievement-Service für Access-Mode-Trophäen.
  readonly open = signal<boolean>(false);                                                                                     // Sichtbarkeit des Panels.
  readonly motionModes: readonly MotionMode[] = ['full', 'reduced', 'off'];                                                   // Verfügbare Motion-Optionen.
  readonly comfortModes: readonly ComfortMode[] = ['expressive', 'simple'];                                                   // Verfügbare Comfort-Optionen.
  readonly contrastModes: readonly ContrastMode[] = ['normal', 'high'];                                                       // Verfügbare Kontrast-Optionen.
  readonly colorModes: readonly ColorVisionMode[] = ['default', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia']; // Verfügbare Farbseh-Optionen.
  readonly texts = computed<AccessibilityPanelTexts>(                                                                         // Übersetzte Panel-Texte der aktiven Sprache.
    /** Übersetzte Panel-Texte der aktiven Sprache. */
    () => PANEL_TEXTS[this.languageService.language()]
  );

  readonly statusText = computed<string>(                                                                                     // Kompakter Status der aktuellen Barrierefreiheits-Einstellungen.
    /** Kompakter Status der aktuellen Barrierefreiheits-Einstellungen. */
    () => {

      const texts = this.texts();                           // Übersetzte Texte der aktuellen Oberfläche.
      const preferences = this.accessibility.preferences(); // Aktuelle Einstellungen der Barrierefreiheit.

      return [
        texts.motion[preferences.motion],
        texts.comfort[preferences.comfort],
        texts.contrast[preferences.contrast],
        texts.color[preferences.colorVision],
      ].join(' · ');
    }
  );

  /** Verbindet externe Öffnen-Events mit dem lokalen Panel-Zustand. */
  constructor() {
    this.overlayService.accessibilityPanelRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(/** Öffnet das Accessibility-Panel nach dem globalen Auslöser. */() => this.openPanel());
  }

  /** Öffnet oder schließt das Panel. */
  toggleOpen(): void {
    if (this.open()) {
      this.close();
      return;
    }

    this.openPanel();
  }

  /** Schließt das Panel und stellt den vorherigen Tastaturfokus wieder her. */
  close(): void {
    if (!this.open()) {
      return;
    }

    const returnFocus = this.panelReturnFocus; // Vor dem Öffnen aktives Element für die Fokusrückführung.

    this.open.set(false);
    this.panelReturnFocus = null;
    this.schedulePanelFocusReturn(returnFocus);
  }

  /** Hält Tastaturbedienung innerhalb des modalen Panels und unterstützt Escape. */
  handlePanelKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.trapPanelFocus(event);
    }
  }

  /** Aktiviert den neuro-sensitiven Modus und zeigt einen kurzen Statushinweis. */
  enableCalmMode(): void {
    this.accessibility.enableCalmMode();
    this.unlockAccessAchievement();
    this.showAccessibilityToast();
  }

  /** Setzt alle Accessibility-Einstellungen zurück und zeigt einen kurzen Statushinweis. */
  resetPreferences(): void {
    this.accessibility.resetPreferences();
    this.showAccessibilityToast();
  }

  /** Setzt den Bewegungsmodus und zeigt einen kurzen Statushinweis. */
  setMotionMode(mode: MotionMode): void {
    this.accessibility.setMotionMode(mode);
    this.unlockAccessAchievement();
    this.showAccessibilityToast();
  }

  /** Setzt den Oberflächenmodus und zeigt einen kurzen Statushinweis. */
  setComfortMode(mode: ComfortMode): void {
    this.accessibility.setComfortMode(mode);
    this.unlockAccessAchievement();
    this.showAccessibilityToast();
  }

  /** Setzt den Kontrastmodus und zeigt einen kurzen Statushinweis. */
  setContrastMode(mode: ContrastMode): void {
    this.accessibility.setContrastMode(mode);
    this.unlockAccessAchievement();
    this.showAccessibilityToast();
  }

  /** Setzt den Farbsehmodus und zeigt einen kurzen Statushinweis. */
  setColorVisionMode(mode: ColorVisionMode): void {
    this.accessibility.setColorVisionMode(mode);
    this.unlockAccessAchievement();
    this.showAccessibilityToast();
  }

  /** Öffnet das Panel und setzt den Fokus auf die erste Bedienaktion. */
  private openPanel(): void {
    if (this.open()) {
      return;
    }

    this.panelReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.open.set(true);
    this.cancelPanelFocusFrame();
    this.panelFocusFrameId = window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => {
      this.panelFocusFrameId = 0;
      this.panelWindow?.nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Begrenzt die Tab-Reihenfolge auf die Bedienelemente des geöffneten Panels. */
  private trapPanelFocus(event: KeyboardEvent): void {

    const panel = this.panelWindow?.nativeElement; // Gerendertes Dialogfenster für die Fokussteuerung.

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) as HTMLElement[]; // Innerhalb des Dialogs erreichbare Bedienelemente.

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

  /** Stellt nach dem Schließen den Fokus auf Auslöser oder globalen Trigger zurück. */
  private schedulePanelFocusReturn(target: HTMLElement | null): void {
    this.cancelPanelFocusFrame();
    this.panelFocusFrameId = window.requestAnimationFrame(/** Fokussiert nach dem Rendern das erste verfügbare Bedienelement. */() => {
      this.panelFocusFrameId = 0;

      const fallback = document.querySelector<HTMLElement>('.access-panel__toggle'); // Ersatz-Auslöser, falls der ursprüngliche Fokus fehlt.
      const focusTarget = target?.isConnected ? target : fallback;                   // Verfügbares Ziel für die Fokusrückführung.

      focusTarget?.focus({ preventScroll: true });
    });
  }

  /** Bricht einen noch offenen Fokus-Frame des Panels ab. */
  private cancelPanelFocusFrame(): void {
    if (!this.panelFocusFrameId) {
      return;
    }

    window.cancelAnimationFrame(this.panelFocusFrameId);
    this.panelFocusFrameId = 0;
  }

  /** Schaltet die Access-Mode-Trophäe frei. */
  private unlockAccessAchievement(): void {
    this.achievementService.unlock('world-upside-down');
  }

  /** Zeigt eine kurze technische Meldung nach einer Accessibility-Änderung. */
  private showAccessibilityToast(): void {
    this.toastService.show({ icon: 'accessibility_new', title: this.texts().toastTitle, message: this.texts().toastText, tone: 'accessibility' });
  }
}

const PANEL_TEXTS: Record<'de' | 'en', AccessibilityPanelTexts> = { // Übersetzungen des Accessibility-Panels.
  de: {
    toggleLabel: 'Accessibility-Modi öffnen',
    landmarkLabel: 'Accessibility-Einstellungen',
    title: 'Access-Modus',
    closeLabel: 'Accessibility-Panel schließen',
    intro: 'Passe Bewegung, Komplexität, Kontrast und Akzentfarben direkt an.',
    statusTitle: 'Barrierefreiheit',
    calmMode: 'Neuro-sensitiven Modus aktivieren',
    reset: 'Zurücksetzen',
    motionTitle: 'Animationen',
    comfortTitle: 'Oberfläche',
    contrastTitle: 'Kontrast',
    colorTitle: 'Farbseh-Anpassungen',
    storageHint: 'Die Auswahl wird nur lokal im Browser gespeichert.',
    toastTitle: 'accessibility updated',
    toastText: 'Barrierefreiheit bleibt aktiv, ohne das Design auf rudimentär zu reduzieren.',
    motion: {
      full: 'Voll animiert',
      reduced: 'Reduzierte Bewegung',
      off: 'Motion aus',
    },
    comfort: {
      expressive: 'Expressive Oberfläche',
      simple: 'Ruhige Oberfläche',
    },
    contrast: {
      normal: 'Normaler Kontrast',
      high: 'Hoher Kontrast',
    },
    color: {
      default: 'Standardfarben',
      deuteranopia: 'Grünblindheit angepasst',
      protanopia: 'Rotblindheit angepasst',
      tritanopia: 'Blaublindheit angepasst',
      achromatopsia: 'Schwarz-Weiß-Modus',
    },
  },
  en: {
    toggleLabel: 'Open accessibility modes',
    landmarkLabel: 'Accessibility settings',
    title: 'Access Mode',
    closeLabel: 'Close accessibility panel',
    intro: 'Adjust motion, complexity, contrast and accent colors directly.',
    statusTitle: 'Accessibility',
    calmMode: 'Enable neuro-sensitive mode',
    reset: 'Reset',
    motionTitle: 'Motion',
    comfortTitle: 'Interface',
    contrastTitle: 'Contrast',
    colorTitle: 'Color vision modes',
    storageHint: 'The selection is stored locally in this browser only.',
    toastTitle: 'accessibility updated',
    toastText: 'Accessibility stays active without reducing the design to something basic.',
    motion: {
      full: 'Full motion',
      reduced: 'Reduced motion',
      off: 'Motion off',
    },
    comfort: {
      expressive: 'Expressive interface',
      simple: 'Calmer interface',
    },
    contrast: {
      normal: 'Normal contrast',
      high: 'High contrast',
    },
    color: {
      default: 'Default colors',
      deuteranopia: 'Green-blind mode',
      protanopia: 'Red-blind mode',
      tritanopia: 'Blue-blind mode',
      achromatopsia: 'Grayscale mode',
    },
  },
};
