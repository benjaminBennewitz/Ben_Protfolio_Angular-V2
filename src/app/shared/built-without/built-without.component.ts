/**
 * @file Schmale Qualitäts-Section.
 * @description Zeigt bewusste technische Entscheidungen und automatisch abgeleitete Portfolio-Telemetrie.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import type { TelemetryChartDataPoint } from '../../core/models/projects.models';
import { LanguageService } from '../../core/services/language.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';
import { TelemetryChartComponent } from '../telemetry-chart/telemetry-chart.component';
import { ViewportActivityDirective } from '../viewport-activity.directive';

/** Kompakte Section für Qualitätsaussagen und echte Portfolio-Daten. */
@Component({
  selector: 'bp-built-without',
  standalone: true,
  imports: [RevealOnScrollDirective, RevealTextComponent, TelemetryChartComponent, ViewportActivityDirective],
  templateUrl: './built-without.component.html',
  styleUrl: './built-without.component.scss',
})
export class BuiltWithoutComponent implements AfterViewInit, OnDestroy {
  private readonly languageService = inject(LanguageService);                  // Sprachservice für übersetzte Section-Inhalte.
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);      // Host-Element zum Messen der 100vh-Bühne.
  readonly content = computed(                                                 // Übersetzter Section-Inhalt.
    /** Übersetzter Section-Inhalt. */
    () => this.languageService.content().builtWithout
  );

  private readonly projects = computed(                                        // Aktuelle Case Studies als Quelle der automatisch abgeleiteten Chart-Werte.
    /** Aktuelle Case Studies als Quelle der automatisch abgeleiteten Chart-Werte. */
    () => PORTFOLIO_PROJECTS[this.languageService.language()]
  );

  readonly telemetryStageActive = signal(false);                               // Aktiviert die zweite, über die erste Bühne fahrende Telemetrie-Ebene.
  readonly stageCueLabels = computed(                                          // Übersetzte Hinweise für die beiden Scroll-Stufen.
    /** Übersetzte Hinweise für die beiden Scroll-Stufen. */
    () => this.languageService.language() === 'de' // Übersetzte Hinweise für die beiden Scroll-Stufen.
      ? { telemetry: 'SCROLL / TELEMETRIE LADEN', continue: 'SCROLL / WEITER' }
      : { telemetry: 'SCROLL / LOAD TELEMETRY', continue: 'SCROLL / CONTINUE' }
  );

  private stageWheelLockedUntil = 0;                                           // Verhindert mehrfaches Umschalten durch ein einzelnes hochauflösendes Wheel-Gesture.
  private readonly stageWheelThreshold = 8;                                    // Mindeststärke eines Wheel-Impulses für einen Bühnenwechsel.
  private readonly stageWheelCooldownMs = 900;                                 // Kurzer Cooldown zwischen zwei Bühnenwechseln.
  private stageWheelRequiresRelease = false;                                   // Blockiert die Restimpulse desselben Trackpad-/Wheel-Gestures nach einem Bühnenwechsel.
  private stageWheelReleaseTimer: ReturnType<typeof setTimeout> | null = null; // Timer zum Erkennen des Endes eines zusammenhängenden Wheel-Gestures.

  /** Gebundener Wheel-Handler, damit er beim Destroy zuverlässig entfernt werden kann. */
  private readonly stageWheelHandler = (event: WheelEvent): void => this.handleStageWheel(event);

  readonly recurringTechData = computed<readonly TelemetryChartDataPoint[]>(   // Häufigste Technologien über alle dokumentierten Projekt-Stacks hinweg.
    /** Häufigste Technologien über alle dokumentierten Projekt-Stacks hinweg. */
    () => {

      const counts = new Map<string, { label: string; value: number }>(); // Gezählte Technologien für das Einsatzprofil.

      for (const project of this.projects()) {
        for (const technology of project.techStack) {

          const key = technology.trim().toLocaleLowerCase(); // Normalisierte Technologiekennung für die Häufigkeitszählung.
          const current = counts.get(key);                   // Aktueller Zähl-, Animations- oder Messwert.

          counts.set(key, {
            label: current?.label ?? technology,
            value: (current?.value ?? 0) + 1,
          });
        }
      }

      return [...counts.values()]
        .sort(/** Häufigste Technologien über alle dokumentierten Projekt-Stacks hinweg. */(left, right) => right.value - left.value || left.label.localeCompare(right.label))
        .slice(0, 5);
    }
  );

  readonly stackBreadthData = computed<readonly TelemetryChartDataPoint[]>(    // Anzahl der dokumentierten Stack-Bausteine pro Case Study.
    /** Anzahl der dokumentierten Stack-Bausteine pro Case Study. */
    () => this.projects().map(/** Erstellt den Technologie-Datenpunkt des Projekts. */(project) => ({ // Anzahl der dokumentierten Stack-Bausteine pro Case Study.
      label: this.shortProjectLabel(project.name),
      value: project.techStack.length,
    }))
  );

  /** Registriert den nicht-passiven Wheel-Guard global, verarbeitet aber ausschließlich die exakt gesnappte Section. */
  ngAfterViewInit(): void {
    window.addEventListener('wheel', this.stageWheelHandler, { passive: false });
  }

  /** Entfernt Wheel-Guard und Gesture-Timer beim Verlassen der Route. */
  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.stageWheelHandler);

    if (this.stageWheelReleaseTimer) {
      clearTimeout(this.stageWheelReleaseTimer);
    }
  }

  /**
   * Bereitet die passende Einstiegsbühne ausschließlich außerhalb des Viewports vor.
   * Dadurch kann beim erneuten Betreten nichts sichtbar im Hintergrund zwischen den Stufen umschalten.
   */
  @HostListener('window:scroll')
  syncStageOutsideViewport(): void {
    if (window.innerWidth <= 980) {
      return;
    }

    const rect = this.sectionElement().getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.
    const viewportHeight = window.innerHeight;                  // Aktuelle Höhe des Browserfensters in Pixeln.
    const outsideTolerance = 2;                                 // Zulässiger Abstand außerhalb des sichtbaren Bereichs.

    if (rect.top >= viewportHeight - outsideTolerance) {
      this.telemetryStageActive.set(false);
    } else if (rect.bottom <= outsideTolerance) {
      this.telemetryStageActive.set(true);
    }
  }

  /** Ermöglicht denselben zweistufigen Ablauf für Tastatur-Scrolling. */
  @HostListener('window:keydown', ['$event'])
  handleStageKeyboard(event: KeyboardEvent): void {
    if (window.innerWidth <= 980 || !this.sectionIsSnapped() || this.isInteractiveKeyboardTarget(event.target)) {
      return;
    }

    const forward = event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' '; // Vorwärtsrichtung des Ablaufs ist aktiv.
    const backward = event.key === 'ArrowUp' || event.key === 'PageUp';                         // Rückwärtsrichtung des Ablaufs ist aktiv.

    if ((forward || backward) && event.repeat) {
      event.preventDefault();
      return;
    }

    if (forward && !this.telemetryStageActive()) {
      event.preventDefault();
      this.telemetryStageActive.set(true);
    } else if (backward && this.telemetryStageActive()) {
      event.preventDefault();
      this.telemetryStageActive.set(false);
    }
  }

  /** Kürzt lange Projektnamen für kompakte SVG-Achsen. */
  private shortProjectLabel(name: string): string {

    const normalized = name // Auf die erwartete Schreibweise normalisierter Text.
      .replace(' – Eine Welt reagiert', '')
      .replace(' – A World Reacts', '')
      .replace('Dein Fußabdruck', 'Fußabdruck');

    return normalized.length > 12 ? `${normalized.slice(0, 11)}…` : normalized;
  }

  /** Fängt Eintrittsimpulse und den Wechsel zwischen Integrity und Telemetrie symmetrisch ab. */
  private handleStageWheel(event: WheelEvent): void {

    const deltaY = this.normalizedWheelDelta(event); // Vertikale Scroll- oder Pointer-Bewegung.

    if (!this.isUsableStageWheel(event, deltaY)) {
      return;
    }

    if (this.shouldSnapIntoStage(deltaY)) {
      event.preventDefault();
      this.prepareStageEntry(deltaY);
      return;
    }

    if (!this.sectionIsSnapped()) {
      return;
    }

    const now = performance.now(); // Aktueller Zeitstempel des Animationsframes.

    if (this.stageWheelRequiresRelease) {
      event.preventDefault();
      this.scheduleStageWheelRelease();
      return;
    }

    if (now < this.stageWheelLockedUntil) {
      event.preventDefault();
      return;
    }

    if (deltaY > 0 && !this.telemetryStageActive()) {
      event.preventDefault();
      this.stageWheelLockedUntil = now + this.stageWheelCooldownMs;
      this.stageWheelRequiresRelease = true;
      this.scheduleStageWheelRelease();
      this.telemetryStageActive.set(true);
      return;
    }

    if (deltaY < 0 && this.telemetryStageActive()) {
      event.preventDefault();
      this.stageWheelLockedUntil = now + this.stageWheelCooldownMs;
      this.stageWheelRequiresRelease = true;
      this.scheduleStageWheelRelease();
      this.telemetryStageActive.set(false);
    }
  }

  /** Gibt den Scroll frei, sobald für einen kurzen Moment kein Restimpuls mehr eingetroffen ist. */
  private scheduleStageWheelRelease(): void {
    if (this.stageWheelReleaseTimer) {
      clearTimeout(this.stageWheelReleaseTimer);
    }

    this.stageWheelReleaseTimer = setTimeout(/** Gibt den Scroll frei, sobald für einen kurzen Moment kein Restimpuls mehr eingetroffen ist. */() => {
      this.stageWheelRequiresRelease = false;
      this.stageWheelReleaseTimer = null;
    }, 160);
  }

  /** Prüft grundlegende Voraussetzungen für die Desktop-Wheel-Steuerung der Section. */
  private isUsableStageWheel(event: WheelEvent, deltaY: number): boolean {
    if (event.defaultPrevented || event.ctrlKey || window.innerWidth <= 980 || Math.abs(deltaY) < this.stageWheelThreshold) {
      return false;
    }

    return Math.abs(event.deltaX) <= Math.abs(event.deltaY);
  }

  /** Erkennt den Eintritt in die Section von oben oder unten, bevor Proximity-Snap sie überspringen kann. */
  private shouldSnapIntoStage(deltaY: number): boolean {
    if (this.sectionIsSnapped()) {
      return false;
    }

    const rect = this.sectionElement().getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.
    const viewportHeight = window.innerHeight;                  // Aktuelle Höhe des Browserfensters in Pixeln.
    const tolerance = Math.max(12, viewportHeight * 0.03);      // Zulässiger Abstand zum Einrastpunkt.
    const enteringFromAbove = deltaY > 0                        // Bereich kommt von oben in den sichtbaren Ausschnitt.
      && rect.top > tolerance
      && rect.top <= viewportHeight * 1.18;
    const enteringFromBelow = deltaY < 0                        // Bereich kommt von unten in den sichtbaren Ausschnitt.
      && rect.bottom < viewportHeight - tolerance
      && rect.bottom >= -viewportHeight * 0.18;

    return enteringFromAbove || enteringFromBelow;
  }

  /** Setzt die richtungsabhängige Startstufe und zieht die 100vh-Section exakt an ihren Snap-Punkt. */
  private prepareStageEntry(deltaY: number): void {
    this.telemetryStageActive.set(deltaY < 0);
    this.stageWheelRequiresRelease = true;
    this.stageWheelLockedUntil = performance.now() + this.stageWheelCooldownMs;
    this.scheduleStageWheelRelease();

    this.sectionElement().scrollIntoView({
      block: 'start',
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  /** Prüft die systemseitige Motion-Präferenz für programmatische Snap-Bewegungen. */
  private prefersReducedMotion(): boolean {

    const root = document.documentElement; // Beobachteter übergeordneter Scroll- oder Layoutbereich.

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || root.dataset['motion'] === 'reduced'
      || root.dataset['motion'] === 'off'
      || root.dataset['comfort'] === 'simple';
  }

  /** Rechnet Wheel-Deltas unabhängig vom Browsermodus in Pixel um. */
  private normalizedWheelDelta(event: WheelEvent): number {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return event.deltaY * 16;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return event.deltaY * window.innerHeight;
    }

    return event.deltaY;
  }

  /** Prüft, ob die Section aktuell praktisch viewportfüllend am oberen Snap-Punkt steht. */
  private sectionIsSnapped(): boolean {

    const rect = this.sectionElement().getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.
    const tolerance = Math.max(8, window.innerHeight * 0.025);  // Zulässiger Abstand zum Einrastpunkt.

    return Math.abs(rect.top) <= tolerance && Math.abs(rect.bottom - window.innerHeight) <= tolerance * 2;
  }

  /** Liefert das eigentliche Section-Element innerhalb des Komponenten-Hosts. */
  private sectionElement(): HTMLElement {
    return this.hostRef.nativeElement.querySelector<HTMLElement>('.built-strip') ?? this.hostRef.nativeElement;
  }

  /** Verhindert, dass globale Tastatursteuerung Buttons oder Formfelder innerhalb der Section überschreibt. */
  private isInteractiveKeyboardTarget(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest('button, a, input, textarea, select, [contenteditable="true"]'));
  }
}
