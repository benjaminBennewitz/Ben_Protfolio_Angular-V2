/* src/app/shared/about-metrics-window/about-metrics-window.component.ts */

/**
 * @file Interaktives Fun-Metrics-Fenster für die About-Section.
 * @description Öffnet ein kleines MS-DOS-artiges Systemfenster und wechselt persönliche Kennzahlen zwischen metrischen und absurden Einheiten.
 */

import { Component, ElementRef, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren, computed, inject, input, output, signal } from '@angular/core';
import type { AboutMetricFact, AboutMetricsCalculatorUnitKey, AboutMetricsContent } from '../../core/models/home.models';
import { AchievementService } from '../../core/services/achievement.service';

/** Verfügbare Darstellungsmodi für die About-Kennzahlen. */
type AboutMetricsMode = 'metric' | 'weird';

/** Sichtbarer Kennzahlenzustand nach Auswahl des aktuellen Einheitenmodus. */
interface AboutMetricViewFact {
  readonly id: string;    // Stabile ID für Tracking und Animation.
  readonly icon: string;  // Material-Symbol für die Kennzahl.
  readonly label: string; // Sichtbarer Name der Kennzahl.
  readonly value: string; // Wert im aktiven Einheitenmodus.
  readonly unit: string;  // Einheit im aktiven Einheitenmodus.
  readonly note: string;  // Kurzer Begleittext im aktiven Einheitenmodus.
}

/** Physikalische Näherungswerte einer absurden Recheneinheit. */
interface AbsurdCalculatorUnitData {
  readonly key: AboutMetricsCalculatorUnitKey; // Stabile Einheit zur Verknüpfung mit den Übersetzungsdaten.
  readonly grams: number;                      // Durchschnittliches Gewicht eines einzelnen Objekts in Gramm.
  readonly centimeters: number;                // Durchschnittliche Länge eines einzelnen Objekts in Zentimetern.
}

/** Sichtbares Ergebnis einer absurden Umrechnung. */
interface AbsurdCalculatorResult {
  readonly count: string; // Formatierte Stückzahl des gewählten Objekts.
  readonly unit: string;  // Kompakte Einheit des Ergebnisses.
}

/** Kompaktes Fun-Facts-Fenster mit Einheitenwechsel. */
@Component({
  selector: 'bp-about-metrics-window',
  standalone: true,
  templateUrl: './about-metrics-window.component.html',
  styleUrl: './about-metrics-window.component.scss',
})
export class AboutMetricsWindowComponent implements OnDestroy {
  private readonly achievementService = inject(AchievementService);                                        // Achievement-Service für geschlossene MS-DOS-Fenster.
  readonly content = input.required<AboutMetricsContent>();                                                // Übersetzte Inhalte und Labels des Metrics-Fensters.
  readonly weirdModeSelected = output<void>();                                                             // Meldet den ersten Wechsel in den absurden Einheitenmodus an die Startseite.

  @ViewChild('metricsTrigger')                                                                             // Referenz auf den Auslösebutton für Fokus-Restore.
  private readonly metricsTrigger?: ElementRef<HTMLButtonElement>;

  @ViewChild('metricsWindow')                                                                              // Referenz auf das sichtbare Dialogfenster für Tastaturfokus.
  private readonly metricsWindow?: ElementRef<HTMLElement>;

  @ViewChild('calculatorTrigger')                                                                          // Referenz auf den verzögerten Rechner-Teaser für Fokus-Restore.
  private readonly calculatorTrigger?: ElementRef<HTMLButtonElement>;

  @ViewChild('calculatorWindow')                                                                           // Referenz auf den Rechnerdialog für den Initialfokus.
  private readonly calculatorWindow?: ElementRef<HTMLElement>;

  @ViewChild('calculatorUnitSelect')                                                                       // Referenz auf den Custom-Einheitenwähler für Outside-Click-Erkennung.
  private readonly calculatorUnitSelect?: ElementRef<HTMLElement>;

  @ViewChild('calculatorUnitTrigger')                                                                      // Referenz auf den Trigger des Custom-Einheitenwählers.
  private readonly calculatorUnitTrigger?: ElementRef<HTMLButtonElement>;

  @ViewChildren('calculatorUnitOption')                                                                    // Fokusierbare Optionen des geöffneten Custom-Einheitenwählers.
  private readonly calculatorUnitOptions?: QueryList<ElementRef<HTMLButtonElement>>;

  private recalculationTimeoutId: number | null = null;                                                    // Timeout für die kurze Rechen-/Glitchanimation beim Moduswechsel.
  private calculatorTeaserTimeoutId: number | null = null;                                                 // Timeout für den verzögerten Absurditäten-Rechner-Teaser.
  private readonly calculatorUnitData: Record<AboutMetricsCalculatorUnitKey, AbsurdCalculatorUnitData> = { // Näherungswerte für Snacks und Peripherie des Absurditäten-Rechners.
    miniSpringRoll: { key: 'miniSpringRoll', grams: 15, centimeters: 8 },
    wiener: { key: 'wiener', grams: 80, centimeters: 15 },
    mentos: { key: 'mentos', grams: 2.7, centimeters: 0.9 },
    gummyBear: { key: 'gummyBear', grams: 2.5, centimeters: 2.1 },
  };

  readonly isOpen = signal<boolean>(false);                                                                // Sichtbarkeit des schwebenden Metrics-Fensters.
  readonly activeMode = signal<AboutMetricsMode>('metric');                                                // Aktuell ausgewählter Einheitenmodus.
  readonly isRecalculating = signal<boolean>(false);                                                       // Aktiviert die kurze Neu-Berechnen-Animation im Fenster.
  readonly isCalculatorTeaserVisible = signal<boolean>(false);                                             // Sichtbarkeit des verzögerten Rechner-Teasers.
  readonly isCalculatorOpen = signal<boolean>(false);                                                      // Sichtbarkeit des überlagerten Absurditäten-Rechner-Fensters.
  readonly isCalculatorUnitMenuOpen = signal<boolean>(false);                                              // Sichtbarkeit des vollständig eigenen Einheiten-Dropdowns.
  readonly calculatorHeightCm = signal<number>(185);                                                       // Aktuelle Größeneingabe in Zentimetern.
  readonly calculatorWeightKg = signal<number>(87);                                                        // Aktuelle Gewichtseingabe in Kilogramm.
  readonly calculatorUnitKey = signal<AboutMetricsCalculatorUnitKey>('miniSpringRoll');                    // Ausgewählte Einheit des Absurditäten-Rechners.
  readonly displayedFacts = computed<readonly AboutMetricViewFact[]>(                                      // Sichtbare Facts passend zum aktiven Einheitenmodus.
    /** Sichtbare Facts passend zum aktiven Einheitenmodus. */
    () => {

      const mode = this.activeMode(); // Aktiver Darstellungs- oder Einheitenmodus.

      return this.content().facts.map(/** Überführt die Kennzahl in den ausgewählten Einheitenmodus. */(fact) => this.toViewFact(fact, mode));
    }
  );

  readonly selectedCalculatorUnit = computed(                                                              // Sichtbare Einheit zur aktuellen Rechnerauswahl.
    /** Sichtbare Einheit zur aktuellen Rechnerauswahl. */
    () => this.content().calculator.units.find(/** Sichtbare Einheit zur aktuellen Rechnerauswahl. */(unit) => unit.key === this.calculatorUnitKey()) ?? this.content().calculator.units[0]
  );

  readonly calculatorHeightResult = computed<AbsurdCalculatorResult>(                                      // Ergebnis der Größenumrechnung in die ausgewählte Einheit.
    /** Ergebnis der Größenumrechnung in die ausgewählte Einheit. */
    () => this.calculateHeightResult()
  );

  readonly calculatorWeightResult = computed<AbsurdCalculatorResult>(                                      // Ergebnis der Gewichtsumrechnung in die ausgewählte Einheit.
    /** Ergebnis der Gewichtsumrechnung in die ausgewählte Einheit. */
    () => this.calculateWeightResult()
  );

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
    window.requestAnimationFrame(/** Öffnet oder schließt das Metrics-Fenster über den Trigger. */() => this.metricsWindow?.nativeElement.focus());
  }

  /** Schließt das Metrics-Fenster und stellt den Fokus auf den Trigger zurück. */
  closeWindow(): void {
    this.achievementService.unlock('nostalgia-hater');
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    this.isCalculatorOpen.set(false);
    this.isCalculatorUnitMenuOpen.set(false);
    this.isCalculatorTeaserVisible.set(false);
    this.clearCalculatorTeaserTimeout();
    this.metricsTrigger?.nativeElement.focus();
  }

  /** Schließt das Metrics-Fenster bei Escape. */
  @HostListener('window:keydown.escape')
  closeWindowByKeyboard(): void {
    if (this.isCalculatorUnitMenuOpen()) {
      this.isCalculatorUnitMenuOpen.set(false);
      return;
    }

    if (this.isCalculatorOpen()) {
      this.closeCalculator();
      return;
    }

    this.closeWindow();
  }

  /** Schließt den Custom-Einheitenwähler bei einem Klick außerhalb des Controls. */
  @HostListener('document:pointerdown', ['$event'])
  closeCalculatorUnitMenuOnOutsideClick(event: PointerEvent): void {
    if (!this.isCalculatorUnitMenuOpen()) {
      return;
    }

    const target = event.target;                                    // Ziel-Element für Scrollen oder Pointer-Auswertung.
    const selectElement = this.calculatorUnitSelect?.nativeElement; // Gerendertes Auswahlelement für den Einheitenwechsel.

    if (!(target instanceof Node) || !selectElement?.contains(target)) {
      this.isCalculatorUnitMenuOpen.set(false);
    }
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
    this.isCalculatorUnitMenuOpen.set(false);
    this.isCalculatorOpen.set(true);
    window.requestAnimationFrame(/** Öffnet den Absurditäten-Rechner als versetztes Overlay-Fenster. */() => this.calculatorWindow?.nativeElement.focus());
  }

  /** Schließt den Absurditäten-Rechner und stellt den Fokus auf den Teaser zurück. */
  closeCalculator(): void {
    this.achievementService.unlock('nostalgia-hater');
    if (!this.isCalculatorOpen()) {
      return;
    }

    this.isCalculatorOpen.set(false);
    this.isCalculatorUnitMenuOpen.set(false);
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

  /** Öffnet oder schließt den eigenen Einheitenwähler. */
  toggleCalculatorUnitMenu(): void {
    this.isCalculatorUnitMenuOpen.update(/** Kehrt den aktuellen Öffnungszustand der Detailansicht um. */(isOpen) => !isOpen);
  }

  /**
   * Öffnet den Einheitenwähler per Tastatur und fokussiert die passende Option.
   * @param event Tastaturereignis am Trigger.
   */
  handleCalculatorUnitTriggerKeydown(event: KeyboardEvent): void {

    const key = event.key; // Gedrückte Taste am Einheitenwähler.

    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') {
      return;
    }

    event.preventDefault();
    this.isCalculatorUnitMenuOpen.set(true);

    const selectedIndex = Math.max(0, this.content().calculator.units.findIndex(/** Öffnet den Einheitenwähler per Tastatur und fokussiert die passende Option. */(unit) => unit.key === this.calculatorUnitKey())); // Index der aktuell ausgewählten Einheit.
    const targetIndex = key === 'ArrowUp' || key === 'End' ? this.content().calculator.units.length - 1 : key === 'Home' ? 0 : selectedIndex;                                                                         // Gültiger Zielindex der nächsten Option.

    window.requestAnimationFrame(/** Öffnet den Einheitenwähler per Tastatur und fokussiert die passende Option. */() => this.focusCalculatorUnitOption(targetIndex));
  }

  /**
   * Steuert die Custom-Dropdown-Optionen mit Pfeiltasten, Home, End und Escape.
   * @param event Tastaturereignis der aktuellen Option.
   * @param optionIndex Index der aktuell fokussierten Option.
   */
  handleCalculatorUnitOptionKeydown(event: KeyboardEvent, optionIndex: number): void {

    const optionCount = this.content().calculator.units.length; // Anzahl verfügbarer Auswahloptionen.
    let targetIndex = optionIndex;                              // Gültiger Zielindex der nächsten Option.

    if (event.key === 'Escape') {
      event.preventDefault();
      this.isCalculatorUnitMenuOpen.set(false);
      this.calculatorUnitTrigger?.nativeElement.focus();
      return;
    }

    if (event.key === 'ArrowDown') {
      targetIndex = (optionIndex + 1) % optionCount;
    } else if (event.key === 'ArrowUp') {
      targetIndex = (optionIndex - 1 + optionCount) % optionCount;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = optionCount - 1;
    } else {
      return;
    }

    event.preventDefault();
    this.focusCalculatorUnitOption(targetIndex);
  }

  /** Schließt das Custom-Dropdown, sobald der Tastaturfokus den Wähler verlässt. */
  closeCalculatorUnitMenuOnFocusOut(event: FocusEvent): void {

    const nextTarget = event.relatedTarget;                         // Nächstes Element der Fokusreihenfolge.
    const selectElement = this.calculatorUnitSelect?.nativeElement; // Gerendertes Auswahlelement für den Einheitenwechsel.

    if (!(nextTarget instanceof Node) || !selectElement?.contains(nextTarget)) {
      this.isCalculatorUnitMenuOpen.set(false);
    }
  }

  /**
   * Übernimmt eine Einheit aus dem Custom-Dropdown und schließt die Auswahl.
   * @param unitKey Ausgewählte Rechner-Einheit.
   */
  selectCalculatorUnit(unitKey: AboutMetricsCalculatorUnitKey): void {
    this.isCalculatorUnitMenuOpen.set(false);

    if (this.calculatorUnitKey() === unitKey) {
      return;
    }

    this.calculatorUnitKey.set(unitKey);
    this.startRecalculationAnimation();
  }

  /**
   * Baut den sichtbaren Fact passend zum gewählten Modus auf.
   * @param fact Rohdaten der Kennzahl aus den Übersetzungen.
   * @param mode Aktiver Einheitenmodus.
   */
  private toViewFact(fact: AboutMetricFact, mode: AboutMetricsMode): AboutMetricViewFact {

    const isWeirdMode = mode === 'weird'; // Alternative absurde Einheiten sind ausgewählt.

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

    const heightCm = this.calculatorHeightCm();                         // Eingegebene Körpergröße in Zentimetern.
    const unitData = this.calculatorUnitData[this.calculatorUnitKey()]; // Maße und Gewicht der ausgewählten Vergleichseinheit.
    const count = heightCm / unitData.centimeters;                      // Berechnete Anzahl der Vergleichseinheiten.

    return {
      count: this.formatNumber(count),
      unit: this.selectedCalculatorUnit().shortLabel,
    };
  }

  /**
   * Berechnet das Gewicht als Stückzahl der aktuellen absurden Einheit.
   * @returns Formatierte Ergebnisdaten für die Oberfläche.
   */
  private calculateWeightResult(): AbsurdCalculatorResult {

    const weightKg = this.calculatorWeightKg();                         // Eingegebenes Körpergewicht in Kilogramm.
    const unitData = this.calculatorUnitData[this.calculatorUnitKey()]; // Maße und Gewicht der ausgewählten Vergleichseinheit.
    const count = (weightKg * 1000) / unitData.grams;                   // Berechnete Anzahl der Vergleichseinheiten.

    return {
      count: this.formatNumber(count),
      unit: this.selectedCalculatorUnit().shortLabel,
    };
  }

  /** Plant den verzögerten Teaser nach dem Öffnen des Metrics-Fensters. */
  private scheduleCalculatorTeaser(): void {
    this.clearCalculatorTeaserTimeout();
    this.isCalculatorTeaserVisible.set(false);
    this.calculatorTeaserTimeoutId = window.setTimeout(/** Plant den verzögerten Teaser nach dem Öffnen des Metrics-Fensters. */() => this.isCalculatorTeaserVisible.set(this.isOpen()), 6000);
  }

  /**
   * Liest eine positive Zahl aus einem Eingabefeld.
   * @param event Eingabeereignis des Zahlenfeldes.
   * @param fallback Rückfallwert bei leerer oder ungültiger Eingabe.
   * @returns Gekappter Zahlenwert für stabile Berechnungen.
   */
  private numberFromInput(event: Event, fallback: number): number {

    const target = event.target; // Ziel-Element für Scrollen oder Pointer-Auswertung.

    if (!(target instanceof HTMLInputElement)) {
      return fallback;
    }

    const value = Number(target.value.replace(',', '.')); // Eingelesener oder normalisierter Eingabewert.

    if (!Number.isFinite(value) || value < 0) {
      return fallback;
    }

    return Math.min(value, 9999);
  }

  /**
   * Fokussiert eine Option im geöffneten Custom-Einheitenwähler.
   * @param optionIndex Zielindex innerhalb der sichtbaren Optionen.
   */
  private focusCalculatorUnitOption(optionIndex: number): void {
    this.calculatorUnitOptions?.get(optionIndex)?.nativeElement.focus();
  }

  /**
   * Formatiert Rechnerzahlen passend zur aktuellen Sprachversion.
   * @param value Zu formatierende Zahl.
   * @returns Kompakter, lesbarer Zahlenwert.
   */
  private formatNumber(value: number): string {

    const locale = this.content().metricLabel === 'Metric' ? 'en-US' : 'de-DE'; // Sprachabhängiges Format für die Zahlenausgabe.

    return new Intl.NumberFormat(locale, { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(value);
  }

  /** Startet den kurzen Rechenzustand für den animierten Wertewechsel. */
  private startRecalculationAnimation(): void {
    this.clearRecalculationTimeout();
    this.isRecalculating.set(true);
    this.recalculationTimeoutId = window.setTimeout(/** Startet den kurzen Rechenzustand für den animierten Wertewechsel. */() => this.isRecalculating.set(false), 520);
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
