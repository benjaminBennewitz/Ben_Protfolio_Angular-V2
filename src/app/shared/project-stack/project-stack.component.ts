/* src/app/shared/project-stack/project-stack.component.ts */

/**
 * @file Fullscreen-Projekt-Stack.
 * @description Rendert sticky Projekt-Panels mit kontrolliertem Scroll-Snapping und projektspezifischen Interaktionen.
 */

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject, ProjectsContent } from '../../core/models/portfolio.models';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ProjectVisualComponent } from '../project-visual/project-visual.component';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';

/** Scroll-Messwerte für das kontrollierte Panel-Snapping. */
interface ProjectSnapMetrics {
  /** Dokumentposition des Projekt-Stacks. */
  readonly start: number;
  /** Dokumentposition des Projekt-Stack-Endes. */
  readonly end: number;
  /** Höhe eines Fullscreen-Projektpanels. */
  readonly panelHeight: number;
  /** Aktuelle Scrollposition des Fensters. */
  readonly scrollY: number;
}

/** Scrollbasierte Fullscreen-Projektbühne mit seitlicher Projektvorschau. */
@Component({
  selector: 'bp-project-stack',
  standalone: true,
  imports: [RouterLink, ProjectVisualComponent, RevealOnScrollDirective, RevealTextComponent],
  templateUrl: './project-stack.component.html',
  styleUrl: './project-stack.component.scss',
})
export class ProjectStackComponent implements AfterViewInit, OnDestroy {
  /** Projekte, die als Fullscreen-Panels dargestellt werden. */
  @Input({ required: true }) projects: readonly PortfolioProject[] = [];

  /** Projektpanels für passive Sichtbarkeitsmessung und Kollisionsflächen. */
  @ViewChildren('projectPanel') private readonly projectPanels!: QueryList<ElementRef<HTMLElement>>;

  /** Accessibility-Service für reduzierte oder deaktivierte Bewegung. */
  private readonly accessibility = inject(AccessibilityPreferenceService);

  /** Achievement-Service für versteckte Projekt-Trophäen. */
  private readonly achievementService = inject(AchievementService);

  /** Host-Element für einen passiven-unabhängigen Wheel-Listener. */
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Gebundener Wheel-Handler für kontrolliertes Projekt-Snapping. */
  private readonly projectWheelHandler = (event: WheelEvent): void => this.onProjectWheel(event);

  /** Zeitpunkt, bis zu dem weitere Wheel-Impulse kurz geblockt werden. */
  private projectWheelLockedUntil = 0;

  /** Mindeststärke eines Wheel-Impulses, bevor die Panel-Normalisierung greift. */
  private readonly projectWheelThreshold = 24;

  /** Kurze Sperre gegen mehrfache Panel-Sprünge bei starkem Mausrad. */
  private readonly projectWheelCooldownMs = 660;

  /** Buttonlabel für Detailseiten. */
  @Input() detailLabel = '';

  /** Übersetzte Labels für Projektsteuerung und ARIA-Texte. */
  @Input({ required: true }) labels!: ProjectsContent;

  /** Merkt, ob das Projekt-3-Papier bereits auf dem Papierkorb gelandet ist. */
  readonly project3PaperLanded = signal(false);

  /** Steuert den verzögerten Success-Wechsel nach der Papierflug-Animation. */
  readonly project3SuccessVisible = signal(false);

  /** Aktueller Schreibstand des Projekt-5-Dateinamens. */
  readonly project5TypewriterText = signal('');

  /** Passive Sichtbarkeitsmessung für den Projekt-5-Typewriter. */
  private project5Observer: IntersectionObserver | null = null;

  /** Verzögerung bis zum Success-Wechsel nach dem Papierwurf. */
  private readonly project3SuccessDelayMs = 1180;

  /** Timer für den verzögerten Projekt-3-Success-Zustand. */
  private project3SuccessTimer: ReturnType<typeof setTimeout> | null = null;

  /** Wiederkehrende Timer der Projekt-5-Typewriter-Animation. */
  private readonly project5TypewriterTimers: ReturnType<typeof setTimeout>[] = [];

  /** Merkt, ob der Projekt-5-Typewriter aktuell läuft. */
  private project5TypewriterRunning = false;

  /** Vordefinierte Tipp- und Löschschritte für das Projekt-5-Dateinaming. */
  private readonly project5TypewriterScript: readonly { readonly mode: 'type' | 'delete' | 'pause' | 'clear'; readonly value?: string; readonly count?: number; readonly delayMs?: number; }[] = [
    { mode: 'type', value: 'i-swear-last-version__only-100-coffees-in-me__final.ai' },
    { mode: 'pause', delayMs: 920 },
    { mode: 'delete', count: 3 },
    { mode: 'type', value: 'v2.ai' },
    { mode: 'pause', delayMs: 760 },
    { mode: 'delete', count: 5 },
    { mode: 'type', value: '__print-this-one.ai' },
    { mode: 'pause', delayMs: 1080 },
    { mode: 'clear' },
    { mode: 'type', value: 'client-feedback_round-13__no-really-final-now__v6.ai' },
    { mode: 'pause', delayMs: 960 },
    { mode: 'delete', count: 4 },
    { mode: 'type', value: 'v7.ai' },
    { mode: 'pause', delayMs: 840 },
    { mode: 'clear' },
    { mode: 'type', value: 'why-is-there-a-rasterized-copy__bleed-fixed__trust-me-final.ai' },
    { mode: 'pause', delayMs: 980 },
    { mode: 'delete', count: 5 },
    { mode: 'type', value: '__pdf.ai' },
    { mode: 'pause', delayMs: 860 },
    { mode: 'clear' },
    { mode: 'type', value: 'do-not-open_old-folder_FINALfinal_really-last-one__version-12.ai' },
    { mode: 'pause', delayMs: 1400 },
  ];

  /** Startet den Projekt-Wheel-Guard und sichtbarkeitsabhängige Interaktionen. */
  ngAfterViewInit(): void {
    this.hostRef.nativeElement.addEventListener('wheel', this.projectWheelHandler, { passive: false });
    queueMicrotask(() => this.observeProject5Typewriter());
  }

  /** Stoppt Animation, Beobachter und Wheel-Guard. */
  ngOnDestroy(): void {
    this.hostRef.nativeElement.removeEventListener('wheel', this.projectWheelHandler);
    this.clearProject3SuccessTimer();
    this.clearProject5TypewriterTimers();
    this.project5Observer?.disconnect();
    this.project5Observer = null;
  }

  /** Normalisiert große Mausrad-Sprünge innerhalb der Fullscreen-Projekte. */
  private onProjectWheel(event: WheelEvent): void {
    const deltaY = this.normalizedProjectWheelDelta(event);

    if (!this.shouldHandleProjectWheel(event, deltaY)) {
      return;
    }

    const metrics = this.projectSnapMetrics();

    if (!metrics) {
      return;
    }

    const now = performance.now();

    if (now < this.projectWheelLockedUntil) {
      event.preventDefault();
      return;
    }

    const currentIndex = this.currentProjectPanelIndex(metrics);
    const direction = deltaY > 0 ? 1 : -1;
    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= this.projects.length) {
      return;
    }

    event.preventDefault();
    this.projectWheelLockedUntil = now + this.projectWheelCooldownMs;
    window.scrollTo({
      top: metrics.start + targetIndex * metrics.panelHeight,
      behavior: this.accessibility.reducesMotion() ? 'auto' : 'smooth',
    });
  }

  /** Prüft, ob ein Wheel-Impuls als Projektpanel-Wechsel behandelt werden soll. */
  private shouldHandleProjectWheel(event: WheelEvent, deltaY: number): boolean {
    if (event.defaultPrevented || event.ctrlKey || this.accessibility.reducesMotion() || window.innerWidth <= 1120) {
      return false;
    }

    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return false;
    }

    return Math.abs(deltaY) >= this.projectWheelThreshold;
  }

  /** Rechnet Wheel-Delta-Modi in Pixel um. */
  private normalizedProjectWheelDelta(event: WheelEvent): number {
    if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return event.deltaY * 16;
    }

    if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return event.deltaY * window.innerHeight;
    }

    return event.deltaY;
  }

  /** Liefert die Dokumentpositionen des aktuellen Projekt-Stacks. */
  private projectSnapMetrics(): ProjectSnapMetrics | null {
    const stack = this.hostRef.nativeElement.querySelector<HTMLElement>('.project-stack');
    const firstPanel = this.projectPanels?.first?.nativeElement;

    if (!stack || !firstPanel || this.projects.length <= 0) {
      return null;
    }

    const start = stack.getBoundingClientRect().top + window.scrollY;
    const panelHeight = Math.max(1, firstPanel.offsetHeight || window.innerHeight);
    const end = start + panelHeight * this.projects.length;
    const scrollY = window.scrollY;

    if (scrollY < start - 2 || scrollY > end - 2) {
      return null;
    }

    return { start, end, panelHeight, scrollY };
  }

  /** Ermittelt das aktuell dominierende Projektpanel. */
  private currentProjectPanelIndex(metrics: ProjectSnapMetrics): number {
    const rawIndex = Math.round((metrics.scrollY - metrics.start) / metrics.panelHeight);

    return Math.min(this.projects.length - 1, Math.max(0, rawIndex));
  }

  /** Liefert alle anderen Projekte für die rechte Vorschauleiste. */
  previewsFor(activeProject: PortfolioProject): readonly PortfolioProject[] {
    return this.projects.filter((project) => project.slug !== activeProject.slug);
  }

  /** Gibt an, ob die Projekt-Case-Study aktuell geöffnet werden kann. */
  isProjectAvailable(project: PortfolioProject): boolean {
    return project.availability !== 'coming-soon';
  }

  /** Liefert den animierten Projekttitel mit optionalen festen Zeilenumbrüchen. */
  projectTitleText(project: PortfolioProject): string {
    return project.titleLines?.join('\n') ?? project.name;
  }

  /** Gibt an, ob es sich um das Grafikdesign-Katalog-Projekt handelt. */
  isGraphicCatalogProject(project: PortfolioProject): boolean {
    return project.slug === 'grafikdesign-katalog';
  }

  /** Startet den Bogenflug des Projekt-3-Papiers in Richtung Papierkorb. */
  triggerProject3PaperFlight(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.project3PaperLanded()) {
      return;
    }

    this.achievementService.unlock('trash-dunk');
    this.project3PaperLanded.set(true);
    this.project3SuccessVisible.set(false);
    this.queueProject3SuccessState();
  }

  /** Plant den Statusbild-Wechsel erst nach der Papier-Landeanimation. */
  private queueProject3SuccessState(): void {
    this.clearProject3SuccessTimer();
    this.project3SuccessTimer = setTimeout(() => {
      this.project3SuccessVisible.set(true);
      this.project3SuccessTimer = null;
    }, this.project3SuccessDelayMs);
  }

  /** Entfernt einen ausstehenden Projekt-3-Success-Timer. */
  private clearProject3SuccessTimer(): void {
    if (!this.project3SuccessTimer) {
      return;
    }

    clearTimeout(this.project3SuccessTimer);
    this.project3SuccessTimer = null;
  }

  /** Startet die Endlosschleife des Projekt-5-Typewriters. */
  private startProject5Typewriter(): void {
    if (this.accessibility.reducesMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.clearProject5TypewriterTimers();
      this.project5TypewriterText.set('i-swear-last-version__only-100-coffees-in-me__final.ai');
      return;
    }

    if (this.project5TypewriterRunning) {
      return;
    }

    this.project5TypewriterRunning = true;
    this.project5TypewriterText.set('');
    this.runProject5TypewriterStep(0, 0, '');
  }

  /** Führt genau einen Tipp-, Lösch- oder Warte-Schritt des Typewriters aus. */
  private runProject5TypewriterStep(stepIndex: number, charIndex: number, currentText: string): void {
    if (!this.project5TypewriterRunning || this.accessibility.reducesMotion()) {
      return;
    }

    const step = this.project5TypewriterScript[stepIndex];

    if (!step) {
      this.scheduleProject5Typewriter(() => this.runProject5TypewriterStep(0, 0, ''), 900);
      return;
    }

    if (step.mode === 'pause') {
      this.project5TypewriterText.set(currentText);
      this.scheduleProject5Typewriter(() => this.runProject5TypewriterStep(stepIndex + 1, 0, currentText), step.delayMs ?? 900);
      return;
    }

    if (step.mode === 'clear') {
      this.runProject5DeleteChars(stepIndex + 1, currentText.length, currentText);
      return;
    }

    if (step.mode === 'delete') {
      this.runProject5DeleteChars(stepIndex + 1, step.count ?? 0, currentText);
      return;
    }

    const nextText = `${currentText}${step.value?.charAt(charIndex) ?? ''}`;
    this.project5TypewriterText.set(nextText);

    if (charIndex + 1 >= (step.value?.length ?? 0)) {
      this.scheduleProject5Typewriter(() => this.runProject5TypewriterStep(stepIndex + 1, 0, nextText), 140);
      return;
    }

    this.scheduleProject5Typewriter(() => this.runProject5TypewriterStep(stepIndex, charIndex + 1, nextText), this.project5TypewriterDelay());
  }

  /** Löscht Zeichen schrittweise wieder aus dem sichtbaren Dateinamen. */
  private runProject5DeleteChars(nextStepIndex: number, remainingChars: number, currentText: string): void {
    if (remainingChars <= 0 || currentText.length === 0) {
      this.scheduleProject5Typewriter(() => this.runProject5TypewriterStep(nextStepIndex, 0, currentText), 180);
      return;
    }

    const nextText = currentText.slice(0, -1);
    this.project5TypewriterText.set(nextText);
    this.scheduleProject5Typewriter(() => this.runProject5DeleteChars(nextStepIndex, remainingChars - 1, nextText), 48);
  }

  /** Plant einen einzelnen Typewriter-Timer und merkt ihn für das Cleanup vor. */
  private scheduleProject5Typewriter(callback: () => void, delayMs: number): void {
    const timer = setTimeout(() => {
      const index = this.project5TypewriterTimers.indexOf(timer);

      if (index >= 0) {
        this.project5TypewriterTimers.splice(index, 1);
      }

      callback();
    }, delayMs);

    this.project5TypewriterTimers.push(timer);
  }

  /** Liefert eine kleine Zufallsverzögerung für organisches Tippen. */
  private project5TypewriterDelay(): number {
    return 32 + Math.floor(Math.random() * 54);
  }

  /** Stoppt alle laufenden Typewriter-Timer. */
  private clearProject5TypewriterTimers(): void {
    this.project5TypewriterRunning = false;

    while (this.project5TypewriterTimers.length > 0) {
      clearTimeout(this.project5TypewriterTimers.pop()!);
    }
  }

  /** Beobachtet Projekt 5 und startet den Typewriter nur bei Sichtbarkeit. */
  private observeProject5Typewriter(): void {
    const project5Panel = this.projectPanelElement('grafikdesign-katalog');

    if (!project5Panel || !('IntersectionObserver' in window)) {
      this.startProject5Typewriter();
      return;
    }

    this.project5Observer?.disconnect();
    this.project5Observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.3) {
          this.startProject5Typewriter();
          return;
        }

        this.clearProject5TypewriterTimers();
      },
      { threshold: [0, 0.3], rootMargin: '6% 0px 6% 0px' },
    );

    this.project5Observer.observe(project5Panel);
  }

  /** Liefert ein Projektpanel anhand seines Slugs. */
  private projectPanelElement(slug: string): HTMLElement | null {
    return this.projectPanels?.toArray()
      .find((panelRef, index) => this.projects[index]?.slug === slug)
      ?.nativeElement ?? null;
  }
}
