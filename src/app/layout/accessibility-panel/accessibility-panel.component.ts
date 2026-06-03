/* src/app/layout/accessibility-panel/accessibility-panel.component.ts */

/**
 * @file Globales Accessibility-Panel.
 * @description Bietet Motion-, Comfort-, Kontrast- und Farbseh-Modi als direkte Seitenmodifikation an.
 */

import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AccessibilityPreferenceService, ColorVisionMode, ComfortMode, ContrastMode, MotionMode } from '../../core/services/accessibility-preference.service';
import { LanguageService } from '../../core/services/language.service';
import { SystemToastService } from '../../core/services/system-toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';

/** Übersetzte Beschriftungen des Accessibility-Panels. */
interface AccessibilityPanelTexts {
  /** Aria-Label des Öffnen-Buttons. */
  readonly toggleLabel: string;
  /** Fenstertitel. */
  readonly title: string;
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
      .subscribe(() => this.open.set(true));
  }

  /** Öffnet oder schließt das Panel. */
  toggleOpen(): void {
    this.open.update((isOpen) => !isOpen);
  }

  /** Schließt das Panel. */
  close(): void {
    this.open.set(false);
  }

  /** Aktiviert den neuro-sensitiven Modus und zeigt einen kurzen Statushinweis. */
  enableCalmMode(): void {
    this.accessibility.enableCalmMode();
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
    this.showAccessibilityToast();
  }

  /** Setzt den Oberflächenmodus und zeigt einen kurzen Statushinweis. */
  setComfortMode(mode: ComfortMode): void {
    this.accessibility.setComfortMode(mode);
    this.showAccessibilityToast();
  }

  /** Setzt den Kontrastmodus und zeigt einen kurzen Statushinweis. */
  setContrastMode(mode: ContrastMode): void {
    this.accessibility.setContrastMode(mode);
    this.showAccessibilityToast();
  }

  /** Setzt den Farbsehmodus und zeigt einen kurzen Statushinweis. */
  setColorVisionMode(mode: ColorVisionMode): void {
    this.accessibility.setColorVisionMode(mode);
    this.showAccessibilityToast();
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
    title: 'Access-Modus',
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
    title: 'Access Mode',
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
