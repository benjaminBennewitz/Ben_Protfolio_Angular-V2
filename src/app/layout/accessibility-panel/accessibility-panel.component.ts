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
  /** Aria-Label des Öffnen-Buttons. */
  readonly toggleLabel: string;
  /** Label des globalen Accessibility-Bereichs. */
  readonly landmarkLabel: string;
  /** Fenstertitel. */
  readonly title: string;
  /** Zugängliche Beschriftung zum Schließen des Panels. */
  readonly closeLabel: string;
  /** Kurzbeschreibung. */
  readonly intro: string;
  /** Titel des Hover-Status am globalen Button. */
  readonly statusTitle: string;
  /** Schnellaktion für neuro-sensitiven Modus. */
  readonly calmMode: string;
  /** Reset-Button. */
  readonly reset: string;
  /** Titel für Motion-Auswahl. */
  readonly motionTitle: string;
  /** Titel für Darstellungs-Auswahl. */
  readonly comfortTitle: string;
  /** Titel für Kontrast-Auswahl. */
  readonly contrastTitle: string;
  /** Titel für Farbseh-Auswahl. */
  readonly colorTitle: string;
  /** Hinweis zur lokalen Speicherung. */
  readonly storageHint: string;
  /** Toast-Titel nach Änderungen. */
  readonly toastTitle: string;
  /** Toast-Text nach Änderungen. */
  readonly toastText: string;
  /** Labels der Motion-Modi. */
  readonly motion: Record<MotionMode, string>;
  /** Labels der Comfort-Modi. */
  readonly comfort: Record<ComfortMode, string>;
  /** Labels der Kontrast-Modi. */
  readonly contrast: Record<ContrastMode, string>;
  /** Labels der Farbseh-Modi. */
  readonly color: Record<ColorVisionMode, string>;
}

/** Kompaktes Overlay für globale Accessibility-Einstellungen. */
@Component({
  selector: 'bp-accessibility-panel',
  standalone: true,
  templateUrl: './accessibility-panel.component.html',
  styleUrl: './accessibility-panel.component.scss',
})
export class AccessibilityPanelComponent {
  /** Dialogelement für initialen Fokus und Fokusfalle. */
  @ViewChild('panelWindow') private panelWindow?: ElementRef<HTMLElement>;

  /** Element, das das Panel geöffnet hat. */
  private panelReturnFocus: HTMLElement | null = null;

  /** Geplanter Frame für Fokuswechsel beim Öffnen und Schließen. */
  private panelFocusFrameId = 0;
  /** Accessibility-Service mit persistierten Modi. */
  readonly accessibility = inject(AccessibilityPreferenceService);

  /** Sprachservice für Panel-Labels. */
  private readonly languageService = inject(LanguageService);

  /** Toast-Service für kurze Accessibility-Hinweise. */
  private readonly toastService = inject(SystemToastService);

  /** Lifecycle-Referenz für externe Öffnen-Events. */
  private readonly destroyRef = inject(DestroyRef);

  /** Overlay-Service für globale Öffnen-Events. */
  private readonly overlayService = inject(GlobalOverlayService);

  /** Achievement-Service für Access-Mode-Trophäen. */
  private readonly achievementService = inject(AchievementService);

  /** Sichtbarkeit des Panels. */
  readonly open = signal<boolean>(false);

  /** Verfügbare Motion-Optionen. */
  readonly motionModes: readonly MotionMode[] = ['full', 'reduced', 'off'];

  /** Verfügbare Comfort-Optionen. */
  readonly comfortModes: readonly ComfortMode[] = ['expressive', 'simple'];

  /** Verfügbare Kontrast-Optionen. */
  readonly contrastModes: readonly ContrastMode[] = ['normal', 'high'];

  /** Verfügbare Farbseh-Optionen. */
  readonly colorModes: readonly ColorVisionMode[] = ['default', 'deuteranopia', 'protanopia', 'tritanopia', 'achromatopsia'];

  /** Übersetzte Panel-Texte der aktiven Sprache. */
  readonly texts = computed<AccessibilityPanelTexts>(() => PANEL_TEXTS[this.languageService.language()]);

  /** Kompakter Status der aktuellen Barrierefreiheits-Einstellungen. */
  readonly statusText = computed<string>(() => {
    const texts = this.texts();
    const preferences = this.accessibility.preferences();

    return [
      texts.motion[preferences.motion],
      texts.comfort[preferences.comfort],
      texts.contrast[preferences.contrast],
      texts.color[preferences.colorVision],
    ].join(' · ');
  });

  /** Verbindet externe Öffnen-Events mit dem lokalen Panel-Zustand. */
  constructor() {
    this.overlayService.accessibilityPanelRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.openPanel());
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

    const returnFocus = this.panelReturnFocus;
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
    this.panelFocusFrameId = window.requestAnimationFrame(() => {
      this.panelFocusFrameId = 0;
      this.panelWindow?.nativeElement.querySelector<HTMLElement>('button:not([disabled])')?.focus({ preventScroll: true });
    });
  }

  /** Begrenzt die Tab-Reihenfolge auf die Bedienelemente des geöffneten Panels. */
  private trapPanelFocus(event: KeyboardEvent): void {
    const panel = this.panelWindow?.nativeElement;

    if (!panel) {
      return;
    }

    const focusableElements = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) as HTMLElement[];

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

  /** Stellt nach dem Schließen den Fokus auf Auslöser oder globalen Trigger zurück. */
  private schedulePanelFocusReturn(target: HTMLElement | null): void {
    this.cancelPanelFocusFrame();
    this.panelFocusFrameId = window.requestAnimationFrame(() => {
      this.panelFocusFrameId = 0;
      const fallback = document.querySelector<HTMLElement>('.access-panel__toggle');
      const focusTarget = target?.isConnected ? target : fallback;
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

/** Übersetzungen des Accessibility-Panels. */
const PANEL_TEXTS: Record<'de' | 'en', AccessibilityPanelTexts> = {
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
