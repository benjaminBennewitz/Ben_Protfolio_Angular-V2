/**
 * @file Schmale Qualitäts-Section.
 * @description Zeigt bewusste technische Entscheidungen und automatisch abgeleitete Portfolio-Telemetrie.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { TelemetryChartDataPoint } from '../../core/models/portfolio.models';
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
  /** Sprachservice für übersetzte Section-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** Host-Element zum Messen der 100vh-Bühne. */
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Übersetzter Section-Inhalt. */
  readonly content = computed(() => this.languageService.content().builtWithout);

  /** Aktuelle Case Studies als Quelle der automatisch abgeleiteten Chart-Werte. */
  private readonly projects = computed(() => this.languageService.content().projects);

  /** Aktiviert die zweite, über die erste Bühne fahrende Telemetrie-Ebene. */
  readonly telemetryStageActive = signal(false);

  /** Übersetzte Hinweise für die beiden Scroll-Stufen. */
  readonly stageCueLabels = computed(() => this.languageService.language() === 'de'
    ? { telemetry: 'SCROLL / TELEMETRIE LADEN', continue: 'SCROLL / WEITER' }
    : { telemetry: 'SCROLL / LOAD TELEMETRY', continue: 'SCROLL / CONTINUE' });

  /** Verhindert mehrfaches Umschalten durch ein einzelnes hochauflösendes Wheel-Gesture. */
  private stageWheelLockedUntil = 0;

  /** Mindeststärke eines Wheel-Impulses für einen Bühnenwechsel. */
  private readonly stageWheelThreshold = 8;

  /** Kurzer Cooldown zwischen zwei Bühnenwechseln. */
  private readonly stageWheelCooldownMs = 900;

  /** Blockiert die Restimpulse desselben Trackpad-/Wheel-Gestures nach einem Bühnenwechsel. */
  private stageWheelRequiresRelease = false;

  /** Timer zum Erkennen des Endes eines zusammenhängenden Wheel-Gestures. */
  private stageWheelReleaseTimer: ReturnType<typeof setTimeout> | null = null;

  /** Gebundener Wheel-Handler, damit er beim Destroy zuverlässig entfernt werden kann. */
  private readonly stageWheelHandler = (event: WheelEvent): void => this.handleStageWheel(event);

  /** Häufigste Technologien über alle dokumentierten Projekt-Stacks hinweg. */
  readonly recurringTechData = computed<readonly TelemetryChartDataPoint[]>(() => {
    const counts = new Map<string, { label: string; value: number }>();

    for (const project of this.projects()) {
      for (const technology of project.techStack) {
        const key = technology.trim().toLocaleLowerCase();
        const current = counts.get(key);
        counts.set(key, {
          label: current?.label ?? technology,
          value: (current?.value ?? 0) + 1,
        });
      }
    }

    return [...counts.values()]
      .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
      .slice(0, 5);
  });

  /** Anzahl der dokumentierten Stack-Bausteine pro Case Study. */
  readonly stackBreadthData = computed<readonly TelemetryChartDataPoint[]>(() => this.projects().map((project) => ({
    label: this.shortProjectLabel(project.name),
    value: project.techStack.length,
  })));

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

    const rect = this.sectionElement().getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const outsideTolerance = 2;

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

    const forward = event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ';
    const backward = event.key === 'ArrowUp' || event.key === 'PageUp';

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
    const normalized = name
      .replace(' – Eine Welt reagiert', '')
      .replace(' – A World Reacts', '')
      .replace('Dein Fußabdruck', 'Fußabdruck');

    return normalized.length > 12 ? `${normalized.slice(0, 11)}…` : normalized;
  }

  /** Fängt Eintrittsimpulse und den Wechsel zwischen Integrity und Telemetrie symmetrisch ab. */
  private handleStageWheel(event: WheelEvent): void {
    const deltaY = this.normalizedWheelDelta(event);

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

    const now = performance.now();

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

    this.stageWheelReleaseTimer = setTimeout(() => {
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

    const rect = this.sectionElement().getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const tolerance = Math.max(12, viewportHeight * 0.03);
    const enteringFromAbove = deltaY > 0
      && rect.top > tolerance
      && rect.top <= viewportHeight * 1.18;
    const enteringFromBelow = deltaY < 0
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
    const root = document.documentElement;

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
    const rect = this.sectionElement().getBoundingClientRect();
    const tolerance = Math.max(8, window.innerHeight * 0.025);

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
