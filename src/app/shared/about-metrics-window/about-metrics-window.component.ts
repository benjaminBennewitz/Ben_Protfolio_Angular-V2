/* src/app/shared/about-metrics-window/about-metrics-window.component.ts */

/**
 * @file Interaktives Fun-Metrics-Fenster für die About-Section.
 * @description Öffnet ein kleines MS-DOS-artiges Systemfenster und wechselt persönliche Kennzahlen zwischen metrischen und absurden Einheiten.
 */

import { Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, input, output, signal } from '@angular/core';
import { AboutMetricFact, AboutMetricsCalculatorUnitKey, AboutMetricsContent } from '../../core/models/portfolio.models';

/** Verfügbare Darstellungsmodi für die About-Kennzahlen. */
type AboutMetricsMode = 'metric' | 'weird';

/** Sichtbarer Kennzahlenzustand nach Auswahl des aktuellen Einheitenmodus. */
interface AboutMetricViewFact {
  /** Stabile ID für Tracking und Animation. */
  readonly id: string;
  /** Material-Symbol für die Kennzahl. */
  readonly icon: string;
  /** Sichtbarer Name der Kennzahl. */
  readonly label: string;
  /** Wert im aktiven Einheitenmodus. */
  readonly value: string;
  /** Einheit im aktiven Einheitenmodus. */
  readonly unit: string;
  /** Kurzer Begleittext im aktiven Einheitenmodus. */
  readonly note: string;
}

/** Physikalische Näherungswerte einer absurden Recheneinheit. */
interface AbsurdCalculatorUnitData {
  /** Stabile Einheit zur Verknüpfung mit den Übersetzungsdaten. */
  readonly key: AboutMetricsCalculatorUnitKey;
  /** Durchschnittliches Gewicht eines einzelnen Objekts in Gramm. */
  readonly grams: number;
  /** Durchschnittliche Länge eines einzelnen Objekts in Zentimetern. */
  readonly centimeters: number;
}

/** Sichtbares Ergebnis einer absurden Umrechnung. */
interface AbsurdCalculatorResult {
  /** Formatierte Stückzahl des gewählten Objekts. */
  readonly count: string;
  /** Kompakte Einheit des Ergebnisses. */
  readonly unit: string;
  /** Kleine Formel zur Nachvollziehbarkeit der Rechnung. */
  readonly formula: string;
}

/** Kompaktes Fun-Facts-Fenster mit Einheitenwechsel. */
@Component({
  selector: 'bp-about-metrics-window',
  standalone: true,
  templateUrl: './about-metrics-window.component.html',
  styleUrl: './about-metrics-window.component.scss',
})
export class AboutMetricsWindowComponent implements OnDestroy {
  /** Übersetzte Inhalte und Labels des Metrics-Fensters. */
  readonly content = input.required<AboutMetricsContent>();

  /** Meldet den ersten Wechsel in den absurden Einheitenmodus an die Startseite. */
  readonly weirdModeSelected = output<void>();

  /** Referenz auf den Auslösebutton für Fokus-Restore. */
  @ViewChild('metricsTrigger')
  private readonly metricsTrigger?: ElementRef<HTMLButtonElement>;

  /** Referenz auf das sichtbare Dialogfenster für Tastaturfokus. */
  @ViewChild('metricsWindow')
  private readonly metricsWindow?: ElementRef<HTMLElement>;

  /** Referenz auf den verzögerten Rechner-Teaser für Fokus-Restore. */
  @ViewChild('calculatorTrigger')
  private readonly calculatorTrigger?: ElementRef<HTMLButtonElement>;

  /** Referenz auf den Rechnerdialog für den Initialfokus. */
  @ViewChild('calculatorWindow')
  private readonly calculatorWindow?: ElementRef<HTMLElement>;

  /** Timeout für die kurze Rechen-/Glitchanimation beim Moduswechsel. */
  private recalculationTimeoutId: number | null = null;

  /** Timeout für den verzögerten Absurditäten-Rechner-Teaser. */
  private calculatorTeaserTimeoutId: number | null = null;

  /** Näherungswerte für Snacks und Peripherie des Absurditäten-Rechners. */
  private readonly calculatorUnitData: Record<AboutMetricsCalculatorUnitKey, AbsurdCalculatorUnitData> = {
    miniSpringRoll: { key: 'miniSpringRoll', grams: 8, centimeters: 7.3 },
    wiener: { key: 'wiener', grams: 80, centimeters: 18 },
    mentos: { key: 'mentos', grams: 38 / 14, centimeters: 2 },
    gummyBear: { key: 'gummyBear', grams: 2.2, centimeters: 2.54 },
  };

  /** Sichtbarkeit des schwebenden Metrics-Fensters. */
  readonly isOpen = signal<boolean>(false);

  /** Aktuell ausgewählter Einheitenmodus. */
  readonly activeMode = signal<AboutMetricsMode>('metric');

  /** Aktiviert die kurze Neu-Berechnen-Animation im Fenster. */
  readonly isRecalculating = signal<boolean>(false);

  /** Sichtbarkeit des verzögerten Rechner-Teasers. */
  readonly isCalculatorTeaserVisible = signal<boolean>(false);

  /** Sichtbarkeit des überlagerten Absurditäten-Rechner-Fensters. */
  readonly isCalculatorOpen = signal<boolean>(false);

  /** Aktuelle Größeneingabe in Zentimetern. */
  readonly calculatorHeightCm = signal<number>(185);

  /** Aktuelle Gewichtseingabe in Kilogramm. */
  readonly calculatorWeightKg = signal<number>(87);

  /** Ausgewählte Einheit des Absurditäten-Rechners. */
  readonly calculatorUnitKey = signal<AboutMetricsCalculatorUnitKey>('miniSpringRoll');

  /** Sichtbare Facts passend zum aktiven Einheitenmodus. */
  readonly displayedFacts = computed<readonly AboutMetricViewFact[]>(() => {
    const mode = this.activeMode();

    return this.content().facts.map((fact) => this.toViewFact(fact, mode));
  });

  /** Sichtbare Einheit zur aktuellen Rechnerauswahl. */
  readonly selectedCalculatorUnit = computed(() => this.content().calculator.units.find((unit) => unit.key === this.calculatorUnitKey()) ?? this.content().calculator.units[0]);

  /** Ergebnis der Größenumrechnung in die ausgewählte Einheit. */
  readonly calculatorHeightResult = computed<AbsurdCalculatorResult>(() => this.calculateHeightResult());

  /** Ergebnis der Gewichtsumrechnung in die ausgewählte Einheit. */
  readonly calculatorWeightResult = computed<AbsurdCalculatorResult>(() => this.calculateWeightResult());

  /** Räumt offene Timer beim Entfernen der Komponente auf. */
  ngOnDestroy(): void {
    this.clearRecalculationTimeout();
    this.clearCalculatorTeaserTimeout();
  }

  /** Öffnet oder schließt das Metrics-Fenster über den Trigger. */
  toggleWindow(): void {
    if (this.isOpen()) {
      this.closeWindow();
      return;
    }

    this.isOpen.set(true);
    this.scheduleCalculatorTeaser();
    window.requestAnimationFrame(() => this.metricsWindow?.nativeElement.focus());
  }

  /** Schließt das Metrics-Fenster und stellt den Fokus auf den Trigger zurück. */
  closeWindow(): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    this.isCalculatorOpen.set(false);
    this.isCalculatorTeaserVisible.set(false);
    this.clearCalculatorTeaserTimeout();
    this.metricsTrigger?.nativeElement.focus();
  }

  /** Schließt das Metrics-Fenster bei Escape. */
  @HostListener('window:keydown.escape')
  closeWindowByKeyboard(): void {
    if (this.isCalculatorOpen()) {
      this.closeCalculator();
      return;
    }

    this.closeWindow();
  }

  /**
   * Wechselt zwischen metrischen und absurden Einheiten.
   * @param mode Zielmodus der Kennzahlenanzeige.
   */
  setMode(mode: AboutMetricsMode): void {
    if (this.activeMode() === mode) {
      return;
    }

    this.activeMode.set(mode);
    this.startRecalculationAnimation();

    if (mode === 'weird') {
      this.weirdModeSelected.emit();
    }
  }

  /** Öffnet den Absurditäten-Rechner als versetztes Overlay-Fenster. */
  openCalculator(): void {
    this.isCalculatorOpen.set(true);
    window.requestAnimationFrame(() => this.calculatorWindow?.nativeElement.focus());
  }

  /** Schließt den Absurditäten-Rechner und stellt den Fokus auf den Teaser zurück. */
  closeCalculator(): void {
    if (!this.isCalculatorOpen()) {
      return;
    }

    this.isCalculatorOpen.set(false);
    this.calculatorTrigger?.nativeElement.focus();
  }

  /**
   * Aktualisiert die Größeneingabe.
   * @param event Eingabeereignis des Zahlenfeldes.
   */
  updateCalculatorHeight(event: Event): void {
    this.calculatorHeightCm.set(this.numberFromInput(event, 185));
  }

  /**
   * Aktualisiert die Gewichtseingabe.
   * @param event Eingabeereignis des Zahlenfeldes.
   */
  updateCalculatorWeight(event: Event): void {
    this.calculatorWeightKg.set(this.numberFromInput(event, 87));
  }

  /**
   * Aktualisiert die gewählte Umrechnungseinheit.
   * @param event Auswahlereignis des Select-Feldes.
   */
  updateCalculatorUnit(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement) || !this.isCalculatorUnitKey(target.value)) {
      return;
    }

    this.calculatorUnitKey.set(target.value);
    this.startRecalculationAnimation();
  }

  /**
   * Baut den sichtbaren Fact passend zum gewählten Modus auf.
   * @param fact Rohdaten der Kennzahl aus den Übersetzungen.
   * @param mode Aktiver Einheitenmodus.
   */
  private toViewFact(fact: AboutMetricFact, mode: AboutMetricsMode): AboutMetricViewFact {
    const isWeirdMode = mode === 'weird';

    return {
      id: fact.id,
      icon: fact.icon,
      label: fact.label,
      value: isWeirdMode ? fact.weirdValue : fact.metricValue,
      unit: isWeirdMode ? fact.weirdUnit : fact.metricUnit,
      note: isWeirdMode ? fact.weirdNote : fact.metricNote,
    };
  }

  /**
   * Berechnet die Größe als Stückzahl der aktuellen absurden Einheit.
   * @returns Formatierte Ergebnisdaten für die Oberfläche.
   */
  private calculateHeightResult(): AbsurdCalculatorResult {
    const heightCm = this.calculatorHeightCm();
    const unitData = this.calculatorUnitData[this.calculatorUnitKey()];
    const count = heightCm / unitData.centimeters;

    return {
      count: this.formatNumber(count),
      unit: this.selectedCalculatorUnit()?.shortLabel ?? '',
      formula: `${this.formatNumber(heightCm)} cm ÷ ${this.formatNumber(unitData.centimeters)} cm`,
    };
  }

  /**
   * Berechnet das Gewicht als Stückzahl der aktuellen absurden Einheit.
   * @returns Formatierte Ergebnisdaten für die Oberfläche.
   */
  private calculateWeightResult(): AbsurdCalculatorResult {
    const weightKg = this.calculatorWeightKg();
    const unitData = this.calculatorUnitData[this.calculatorUnitKey()];
    const count = (weightKg * 1000) / unitData.grams;

    return {
      count: this.formatNumber(count),
      unit: this.selectedCalculatorUnit()?.shortLabel ?? '',
      formula: `${this.formatNumber(weightKg)} kg × 1000 ÷ ${this.formatNumber(unitData.grams)} g`,
    };
  }

  /** Plant den verzögerten Teaser nach dem Öffnen des Metrics-Fensters. */
  private scheduleCalculatorTeaser(): void {
    this.clearCalculatorTeaserTimeout();
    this.isCalculatorTeaserVisible.set(false);
    this.calculatorTeaserTimeoutId = window.setTimeout(() => this.isCalculatorTeaserVisible.set(this.isOpen()), 6000);
  }

  /**
   * Liest eine positive Zahl aus einem Eingabefeld.
   * @param event Eingabeereignis des Zahlenfeldes.
   * @param fallback Rückfallwert bei leerer oder ungültiger Eingabe.
   * @returns Gekappter Zahlenwert für stabile Berechnungen.
   */
  private numberFromInput(event: Event, fallback: number): number {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return fallback;
    }

    const value = Number(target.value.replace(',', '.'));

    if (!Number.isFinite(value) || value < 0) {
      return fallback;
    }

    return Math.min(value, 9999);
  }

  /**
   * Prüft, ob ein Wert eine bekannte Rechner-Einheit ist.
   * @param value Zu prüfender Select-Wert.
   * @returns True, wenn der Wert mit den Rechnerdaten verknüpft ist.
   */
  private isCalculatorUnitKey(value: string): value is AboutMetricsCalculatorUnitKey {
    return value === 'miniSpringRoll' || value === 'wiener' || value === 'mentos' || value === 'gummyBear';
  }

  /**
   * Formatiert Rechnerzahlen passend zur aktuellen Sprachversion.
   * @param value Zu formatierende Zahl.
   * @returns Kompakter, lesbarer Zahlenwert.
   */
  private formatNumber(value: number): string {
    const locale = this.content().metricLabel === 'Metric' ? 'en-US' : 'de-DE';

    return new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(value);
  }

  /** Startet den kurzen Rechenzustand für den animierten Wertewechsel. */
  private startRecalculationAnimation(): void {
    this.clearRecalculationTimeout();
    this.isRecalculating.set(true);
    this.recalculationTimeoutId = window.setTimeout(() => this.isRecalculating.set(false), 520);
  }

  /** Entfernt einen laufenden Rechenanimation-Timer. */
  private clearRecalculationTimeout(): void {
    if (this.recalculationTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.recalculationTimeoutId);
    this.recalculationTimeoutId = null;
  }

  /** Entfernt einen laufenden Teaser-Timer. */
  private clearCalculatorTeaserTimeout(): void {
    if (this.calculatorTeaserTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.calculatorTeaserTimeoutId);
    this.calculatorTeaserTimeoutId = null;
  }
}
