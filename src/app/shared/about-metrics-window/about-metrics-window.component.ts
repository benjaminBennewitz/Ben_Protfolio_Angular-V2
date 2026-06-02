/* src/app/shared/about-metrics-window/about-metrics-window.component.ts */

/**
 * @file Interaktives Fun-Metrics-Fenster für die About-Section.
 * @description Öffnet ein kleines MS-DOS-artiges Systemfenster und wechselt persönliche Kennzahlen zwischen metrischen und absurden Einheiten.
 */

import { Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, input, output, signal } from '@angular/core';
import { AboutMetricFact, AboutMetricsContent } from '../../core/models/portfolio.models';

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

  /** Timeout für die kurze Rechen-/Glitchanimation beim Moduswechsel. */
  private recalculationTimeoutId: number | null = null;

  /** Sichtbarkeit des schwebenden Metrics-Fensters. */
  readonly isOpen = signal<boolean>(false);

  /** Aktuell ausgewählter Einheitenmodus. */
  readonly activeMode = signal<AboutMetricsMode>('metric');

  /** Aktiviert die kurze Neu-Berechnen-Animation im Fenster. */
  readonly isRecalculating = signal<boolean>(false);

  /** Sichtbare Facts passend zum aktiven Einheitenmodus. */
  readonly displayedFacts = computed<readonly AboutMetricViewFact[]>(() => {
    const mode = this.activeMode();

    return this.content().facts.map((fact) => this.toViewFact(fact, mode));
  });

  /** Räumt offene Timer beim Entfernen der Komponente auf. */
  ngOnDestroy(): void {
    this.clearRecalculationTimeout();
  }

  /** Öffnet oder schließt das Metrics-Fenster über den Trigger. */
  toggleWindow(): void {
    if (this.isOpen()) {
      this.closeWindow();
      return;
    }

    this.isOpen.set(true);
    window.requestAnimationFrame(() => this.metricsWindow?.nativeElement.focus());
  }

  /** Schließt das Metrics-Fenster und stellt den Fokus auf den Trigger zurück. */
  closeWindow(): void {
    if (!this.isOpen()) {
      return;
    }

    this.isOpen.set(false);
    this.metricsTrigger?.nativeElement.focus();
  }

  /** Schließt das Metrics-Fenster bei Escape. */
  @HostListener('window:keydown.escape')
  closeWindowByKeyboard(): void {
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
}
