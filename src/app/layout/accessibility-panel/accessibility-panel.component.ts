/* src/app/layout/accessibility-panel/accessibility-panel.component.ts */

/**
 * @file Globales Accessibility-Panel.
 * @description Bietet Motion-, Comfort-, Kontrast- und Farbseh-Modi als direkte Seitenmodifikation an.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { AccessibilityPreferenceService, ColorVisionMode, ComfortMode, ContrastMode, MotionMode } from '../../core/services/accessibility-preference.service';
import { LanguageService } from '../../core/services/language.service';

/** Übersetzte Beschriftungen des Accessibility-Panels. */
interface AccessibilityPanelTexts {
  /** Aria-Label des Öffnen-Buttons. */
  readonly toggleLabel: string;
  /** Fenstertitel. */
  readonly title: string;
  /** Kurzbeschreibung. */
  readonly intro: string;
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

  /** Öffnet oder schließt das Panel. */
  toggleOpen(): void {
    this.open.update((isOpen) => !isOpen);
  }

  /** Schließt das Panel. */
  close(): void {
    this.open.set(false);
  }
}

/** Übersetzungen des Accessibility-Panels. */
const PANEL_TEXTS: Record<'de' | 'en', AccessibilityPanelTexts> = {
  de: {
    toggleLabel: 'Accessibility-Modi öffnen',
    title: 'Access-Modus',
    intro: 'Passe Bewegung, Komplexität, Kontrast und Akzentfarben direkt an.',
    calmMode: 'Neuro-sensitiven Modus aktivieren',
    reset: 'Zurücksetzen',
    motionTitle: 'Animationen',
    comfortTitle: 'Oberfläche',
    contrastTitle: 'Kontrast',
    colorTitle: 'Farbenhilfe',
    storageHint: 'Die Auswahl wird nur lokal im Browser gespeichert.',
    motion: {
      full: 'Voll animiert',
      reduced: 'Reduziert',
      off: 'Aus',
    },
    comfort: {
      expressive: 'Expressive Experience',
      simple: 'Ruhiger / einfacher',
    },
    contrast: {
      normal: 'Normal',
      high: 'Hoch',
    },
    color: {
      default: 'Standard',
      deuteranopia: 'Grün-Rot robust',
      protanopia: 'Rot robust',
      tritanopia: 'Blau-Gelb robust',
      achromatopsia: 'Ohne Farbcodierung',
    },
  },
  en: {
    toggleLabel: 'Open accessibility modes',
    title: 'Access Mode',
    intro: 'Adjust motion, complexity, contrast and accent colors directly.',
    calmMode: 'Enable neuro-sensitive mode',
    reset: 'Reset',
    motionTitle: 'Motion',
    comfortTitle: 'Interface',
    contrastTitle: 'Contrast',
    colorTitle: 'Color help',
    storageHint: 'The selection is stored locally in this browser only.',
    motion: {
      full: 'Full motion',
      reduced: 'Reduced',
      off: 'Off',
    },
    comfort: {
      expressive: 'Expressive experience',
      simple: 'Calmer / simpler',
    },
    contrast: {
      normal: 'Normal',
      high: 'High',
    },
    color: {
      default: 'Default',
      deuteranopia: 'Green-red robust',
      protanopia: 'Red robust',
      tritanopia: 'Blue-yellow robust',
      achromatopsia: 'No color coding',
    },
  },
};
