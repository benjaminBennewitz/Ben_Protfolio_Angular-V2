/* src/app/shared/project-stack/project-stack.component.ts */

/**
 * @file Fullscreen-Projekt-Stack.
 * @description Rendert sticky Projekt-Panels und simuliert Projekt-2-Game-Assets mit Gravitation.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject, ProjectsContent } from '../../core/models/portfolio.models';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ProjectVisualComponent } from '../project-visual/project-visual.component';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';

/** Dekoratives Game-Asset mit Bildquelle und nativer Bildgröße. */
interface Project2PhysicsItem {
  /** Pfad zum 1-Bit-/8-Bit-Asset. */
  readonly src: string;

  /** Native Bildbreite für stabile Seitenverhältnisse. */
  readonly naturalWidth: number;

  /** Native Bildhöhe für stabile Seitenverhältnisse. */
  readonly naturalHeight: number;
}

/** Bewegungszustand eines fallenden Game-Assets. */
interface Project2PhysicsState extends Project2PhysicsItem {
  /** Horizontale Position in Pixel. */
  x: number;
  /** Vertikale Position in Pixel. */
  y: number;
  /** Horizontale Geschwindigkeit. */
  vx: number;
  /** Vertikale Geschwindigkeit. */
  vy: number;
  /** Rotation in Grad. */
  rotation: number;
  /** Rotationsgeschwindigkeit. */
  angularVelocity: number;
  /** Kollisionsbreite. */
  width: number;
  /** Kollisionshöhe. */
  height: number;
  /** Merkt, ob das Objekt aktuell auf dem Boden ruht. */
  resting: boolean;
  /** Merkt, ob das Objekt den Boden mindestens einmal berührt hat. */
  touchedFloor: boolean;
}

/** Einfache statische Kollisionsfläche innerhalb des Projektpanels. */
interface Project2Obstacle {
  /** Horizontale Position der Kollisionsfläche. */
  readonly x: number;
  /** Vertikale Position der Kollisionsfläche. */
  readonly y: number;
  /** Breite der Kollisionsfläche. */
  readonly width: number;
  /** Höhe der Kollisionsfläche. */
  readonly height: number;
}

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

  /** Angular-Zone für performante requestAnimationFrame-Updates. */
  private readonly zone = inject(NgZone);

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

  /** Sichtbare Styles für die Game-Assets. */
  readonly project2ItemStyles = signal<readonly Record<string, string>[]>([]);

  /** Sichtbare 1UP-Effekte nach erfolgreicher Bodenberührung aller Assets. */
  readonly project2OneUps = signal<readonly number[]>([]);

  /** Merkt, ob das Projekt-3-Papier bereits auf dem Papierkorb gelandet ist. */
  readonly project3PaperLanded = signal(false);

  /** Steuert den verzögerten Success-Wechsel nach der Papierflug-Animation. */
  readonly project3SuccessVisible = signal(false);

  /** Aktueller Schreibstand des Projekt-5-Dateinamens. */
  readonly project5TypewriterText = signal('');

  /** Fallende Projekt-2-Assets. */
  readonly project2PhysicsItems: readonly Project2PhysicsItem[] = [
    { src: 'assets/images/project-stack/project_2/pj2_coin.webp', naturalWidth: 816, naturalHeight: 799 },
    { src: 'assets/images/project-stack/project_2/pj2_ring.webp', naturalWidth: 638, naturalHeight: 798 },
    { src: 'assets/images/project-stack/project_2/pj2_star.webp', naturalWidth: 953, naturalHeight: 941 },
    { src: 'assets/images/project-stack/project_2/pj2_key.webp', naturalWidth: 947, naturalHeight: 555 },
    { src: 'assets/images/project-stack/project_2/pj2_heart.webp', naturalWidth: 921, naturalHeight: 863 },
    { src: 'assets/images/project-stack/project_2/pj2_html5.webp', naturalWidth: 811, naturalHeight: 1019 },
    { src: 'assets/images/project-stack/project_2/pj2_triangle.webp', naturalWidth: 908, naturalHeight: 719 },
    { src: 'assets/images/project-stack/project_2/pj2_square.webp', naturalWidth: 677, naturalHeight: 694 },
    { src: 'assets/images/project-stack/project_2/pj2_x.webp', naturalWidth: 882, naturalHeight: 882 },
    { src: 'assets/images/project-stack/project_2/pj2_potion.webp', naturalWidth: 560, naturalHeight: 866 },
    { src: 'assets/images/project-stack/project_2/pj2_spring.webp', naturalWidth: 605, naturalHeight: 704 },
    { src: 'assets/images/project-stack/project_2/pj2_spikes.webp', naturalWidth: 965, naturalHeight: 429 },
    { src: 'assets/images/project-stack/project_2/pj2_chest.webp', naturalWidth: 996, naturalHeight: 834 },
    { src: 'assets/images/project-stack/project_2/pj2_lock.webp', naturalWidth: 656, naturalHeight: 878 },
    { src: 'assets/images/project-stack/project_2/pj2_door.webp', naturalWidth: 692, naturalHeight: 830 },
    { src: 'assets/images/project-stack/project_2/pj2_flag.webp', naturalWidth: 716, naturalHeight: 1013 },
  ];

  /** Auf Mobile reduzierte und sonst vollständige Projekt-2-Assetliste. */
  readonly project2ActivePhysicsItems = signal<readonly Project2PhysicsItem[]>(this.project2PhysicsItems);

  /** Simulationszustand der Projekt-2-Assets. */
  private project2Items: Project2PhysicsState[] = [];

  /** Aktuelle Pointer-X-Position relativ zu Projekt 2. */
  private project2PointerX = -10000;

  /** Aktuelle Pointer-Y-Position relativ zu Projekt 2. */
  private project2PointerY = -10000;

  /** Aktive requestAnimationFrame-ID. */
  private project2FrameId = 0;

  /** Markiert, ob die Projekt-2-Simulation bereits läuft. */
  private project2Started = false;

  /** Markiert, ob die 1UP-Sequenz bereits ausgelöst wurde. */
  private project2OneUpStarted = false;

  /** Timer der 1UP-Sequenz. */
  private readonly project2OneUpTimers: ReturnType<typeof setTimeout>[] = [];

  /** Passive Sichtbarkeitsmessung für Projekt 2. */
  private project2Observer: IntersectionObserver | null = null;

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

  /** Startet die passive Projekt-2-Erkennung und den Projekt-Wheel-Guard. */
  ngAfterViewInit(): void {
    this.resetProject2Items();
    this.hostRef.nativeElement.addEventListener('wheel', this.projectWheelHandler, { passive: false });
    queueMicrotask(() => {
      this.observeProject2Panel();
      this.observeProject5Typewriter();
    });
  }

  /** Stoppt Animation, Beobachter und Wheel-Guard. */
  ngOnDestroy(): void {
    this.hostRef.nativeElement.removeEventListener('wheel', this.projectWheelHandler);
    this.pauseProject2Physics();
    this.clearProject2OneUpTimers();
    this.clearProject3SuccessTimer();
    this.clearProject5TypewriterTimers();
    this.project2Observer?.disconnect();
    this.project2Observer = null;
    this.project5Observer?.disconnect();
    this.project5Observer = null;
  }

  /** Baut die Assets bei Größenänderung passend neu auf. */
  @HostListener('window:resize')
  onResize(): void {
    this.resetProject2Items();
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

  /** Liefert den animierten Projekttitel mit optionalen festen Zeilenumbrüchen. */
  projectTitleText(project: PortfolioProject): string {
    return project.titleLines?.join('\n') ?? project.name;
  }

  /** Gibt an, ob es sich um das Grafikdesign-Katalog-Projekt handelt. */
  isGraphicCatalogProject(project: PortfolioProject): boolean {
    return project.slug === 'grafikdesign-katalog';
  }

  /** Merkt sich die Pointerposition für die Abstoßungslogik. */
  onProjectPanelPointerMove(index: number, event: PointerEvent): void {
    if (index !== 1) {
      return;
    }

    const panel = event.currentTarget as HTMLElement | null;
    const rect = this.project2StageElement()?.getBoundingClientRect() ?? panel?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    this.project2PointerX = event.clientX - rect.left;
    this.project2PointerY = event.clientY - rect.top;
  }

  /** Setzt die Pointerposition außerhalb der Bühne. */
  resetProjectPanelPointer(index: number): void {
    if (index !== 1) {
      return;
    }

    this.project2PointerX = -10000;
    this.project2PointerY = -10000;
  }

  /** Liefert einen CSS-Style-Wert eines Game-Assets. */
  project2ItemStyleAt(index: number, property: 'width' | 'height' | 'transform'): string {
    return this.project2ItemStyles()[index]?.[property] ?? '';
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

  /** Beobachtet ausschließlich Projekt 2, ohne Body-Scroll oder Snap zu verändern. */
  private observeProject2Panel(): void {
    const project2Panel = this.project2PanelElement();

    if (!project2Panel || !('IntersectionObserver' in window)) {
      this.startProject2Physics();
      return;
    }

    this.project2Observer?.disconnect();
    this.project2Observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= this.project2VisibilityThreshold()) {
          this.startProject2Physics();
          return;
        }

        this.pauseProject2Physics();
      },
      { threshold: [0, 0.14, 0.42], rootMargin: '-4% 0px -4% 0px' },
    );

    this.project2Observer.observe(project2Panel);
  }


  /** Liefert den Start-Schwellwert für die Game-Physics je Viewport. */
  private project2VisibilityThreshold(): number {
    return window.matchMedia('(max-width: 760px)').matches ? 0.14 : 0.42;
  }

  /** Liefert eine kompaktere Kollisionsgröße für kleine Projektbühnen. */
  private project2ItemSize(panelWidth: number): number {
    return panelWidth <= 420 ? 30 : panelWidth <= 760 ? 34 : 45;
  }

  /** Gibt an, ob Projekt 2 die mobile Preview-Bühne als Spielfeld nutzt. */
  private project2UsesCompactMobileSet(): boolean {
    return window.matchMedia('(max-width: 760px)').matches;
  }

  /** Liefert die aktive Assetliste und entfernt mobil sechs Objekte aus der Simulation. */
  private activeProject2PhysicsItems(): readonly Project2PhysicsItem[] {
    if (!this.project2UsesCompactMobileSet()) {
      return this.project2PhysicsItems;
    }

    return this.project2PhysicsItems.slice(0, Math.max(1, this.project2PhysicsItems.length - 6));
  }

  /** Aktualisiert die sichtbare Assetliste für Template und Simulationszustand. */
  private updateProject2ActivePhysicsItems(): readonly Project2PhysicsItem[] {
    const items = this.activeProject2PhysicsItems();

    this.project2ActivePhysicsItems.set(items);
    return items;
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

  /** Startet oder setzt die echte Gravity-Simulation fort. */
  private startProject2Physics(): void {
    if (this.accessibility.reducesMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pauseProject2Physics();
      this.project2Started = true;
      this.snapProject2ItemsToFloor();
      this.triggerProject2OneUpsWhenReady();
      return;
    }

    if (!this.project2Started) {
      this.project2Started = true;
      this.resetProject2Items();
    }

    if (this.project2FrameId) {
      return;
    }

    this.zone.runOutsideAngular(() => this.tickProject2Physics());
  }

  /** Pausiert die Projekt-2-Physics-Schleife. */
  private pauseProject2Physics(): void {
    cancelAnimationFrame(this.project2FrameId);
    this.project2FrameId = 0;
  }

  /** Erstellt Startwerte oberhalb der Projektbühne. */
  private resetProject2Items(): void {
    const stage = this.project2StageElement();
    const width = stage?.clientWidth ?? window.innerWidth;
    const centerX = width * 0.5;
    const itemSize = this.project2ItemSize(width);
    const physicsItems = this.updateProject2ActivePhysicsItems();
    const spread = Math.min(width <= 640 ? width * 0.62 : 300, width * 0.34);

    this.project2Items = physicsItems.map((item, index) => {
      const slot = index - (physicsItems.length - 1) / 2;
      const normalizedSlot = slot / Math.max(1, physicsItems.length / 2);
      const wobble = [0, -18, 12, -7, 22, -14, 9, -21][index % 8] ?? 0;

      return {
        ...item,
        x: centerX + normalizedSlot * spread + wobble,
        y: -90 - (index % 4) * 14,
        vx: normalizedSlot * 1.25 + ((index % 3) - 1) * 0.55,
        vy: 0,
        rotation: [-10, 8, -16, 14, -6, 18][index % 6] ?? 0,
        angularVelocity: [-0.12, 0.1, -0.08, 0.14, -0.1, 0.09][index % 6] ?? 0.08,
        width: itemSize,
        height: itemSize,
        resting: false,
        touchedFloor: false,
      };
    });

    this.publishProject2Styles();
  }

  /** Simuliert Gravitation, Cursor-Abstoßung, Grenzen, Objekt- und UI-Kollisionen. */
  private tickProject2Physics(): void {
    const panel = this.project2PanelElement();
    const stage = this.project2StageElement();

    if (!panel || !stage || this.accessibility.reducesMotion()) {
      this.pauseProject2Physics();
      return;
    }

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const floorOffset = this.project2UsesVisualStage() ? 24 : 50;
    const floor = Math.max(160, height - floorOffset);
    const obstacles = this.project2Obstacles(panel, stage);

    for (const item of this.project2Items) {
      this.applyProject2PointerForce(item);
      item.vy += item.resting ? 0 : 0.54;
      item.vx *= item.resting ? 0.82 : 0.988;
      item.vy *= item.resting ? 0.76 : 0.992;
      item.angularVelocity *= item.resting ? 0.72 : 0.955;
      item.angularVelocity = this.clampProject2Spin(item.angularVelocity);
      item.x += item.vx;
      item.y += item.vy;
      item.rotation += item.angularVelocity;

      this.resolveProject2Bounds(item, width, floor);
      this.resolveProject2ObstacleCollisions(item, obstacles);
      this.resolveProject2Bounds(item, width, floor);
      this.settleProject2Item(item);
    }

    this.resolveProject2ItemCollisions();
    this.triggerProject2OneUpsWhenReady();
    this.zone.run(() => this.publishProject2Styles());
    this.project2FrameId = requestAnimationFrame(() => this.tickProject2Physics());
  }

  /** Schiebt Game-Assets vom Cursor weg. */
  private applyProject2PointerForce(item: Project2PhysicsState): void {
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    const dx = centerX - this.project2PointerX;
    const dy = centerY - this.project2PointerY;
    const distance = Math.max(1, Math.hypot(dx, dy));

    if (distance > 160) {
      return;
    }

    const force = (160 - distance) / 160;
    item.vx += (dx / distance) * force * 6.8;
    item.vy += (dy / distance) * force * 5.9;
    item.angularVelocity += force * (dx > 0 ? 1 : -1) * 0.28;
  }

  /** Begrenzt Assets an Seitenrändern und Boden. */
  private resolveProject2Bounds(item: Project2PhysicsState, width: number, floor: number): void {
    if (item.x < 12) {
      item.x = 12;
      item.vx *= -0.72;
      item.angularVelocity *= -0.55;
    }

    if (item.x + item.width > width - 12) {
      item.x = width - item.width - 12;
      item.vx *= -0.72;
      item.angularVelocity *= -0.55;
    }

    if (item.y + item.height > floor) {
      item.y = floor - item.height;
      item.vy *= Math.abs(item.vy) > 2.2 ? -0.3 : -0.12;
      item.vx *= 0.72;
      item.angularVelocity *= 0.48;
      item.resting = true;
      item.touchedFloor = true;

      if (Math.abs(item.vy) < 1.15) {
        item.vy = 0;
      }

      if (Math.abs(item.vx) < 0.16) {
        item.vx = 0;
      }

      if (Math.abs(item.angularVelocity) < 0.05) {
        item.angularVelocity = 0;
      }
    } else {
      item.resting = false;
    }
  }

  /** Löst Kollisionen mit Text, Vorschau, Navigation und Thumb-Asset. */
  private resolveProject2ObstacleCollisions(item: Project2PhysicsState, obstacles: readonly Project2Obstacle[]): void {
    for (const obstacle of obstacles) {
      const overlapX = Math.min(item.x + item.width - obstacle.x, obstacle.x + obstacle.width - item.x);
      const overlapY = Math.min(item.y + item.height - obstacle.y, obstacle.y + obstacle.height - item.y);

      if (overlapX <= 0 || overlapY <= 0) {
        continue;
      }

      if (overlapX < overlapY) {
        const fromLeft = item.x < obstacle.x;
        item.x += fromLeft ? -overlapX : overlapX;
        item.vx *= -0.48;
        item.angularVelocity += fromLeft ? -0.1 : 0.1;
        continue;
      }

      const fromTop = item.y < obstacle.y;
      item.y += fromTop ? -overlapY : overlapY;
      item.vy = fromTop ? -Math.abs(item.vy) * 0.38 : Math.abs(item.vy) * 0.24;
      item.vx += fromTop ? 0.14 : -0.1;
      item.angularVelocity += fromTop ? 0.08 : -0.08;
    }
  }

  /** Trennt überlappende Game-Assets voneinander. */
  private resolveProject2ItemCollisions(): void {
    for (let i = 0; i < this.project2Items.length; i += 1) {
      for (let j = i + 1; j < this.project2Items.length; j += 1) {
        const a = this.project2Items[i];
        const b = this.project2Items[j];
        const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);
        const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y);

        if (overlapX <= 0 || overlapY <= 0) {
          continue;
        }

        const pushX = overlapX < overlapY;
        const direction = pushX ? (a.x < b.x ? -1 : 1) : (a.y < b.y ? -1 : 1);
        const push = (pushX ? overlapX : overlapY) / 2;

        if (pushX) {
          a.x += direction * push;
          b.x -= direction * push;
          a.vx *= -0.42;
          b.vx *= -0.42;
        } else {
          a.y += direction * push;
          b.y -= direction * push;
          a.vy *= -0.32;
          b.vy *= -0.32;
        }

        a.angularVelocity += direction * 0.055;
        b.angularVelocity -= direction * 0.055;
        a.angularVelocity = this.clampProject2Spin(a.angularVelocity);
        b.angularVelocity = this.clampProject2Spin(b.angularVelocity);
      }
    }
  }

  /** Ermittelt statische UI-Flächen, mit denen die Assets kollidieren sollen. */
  private project2Obstacles(panel: HTMLElement, stage: HTMLElement): readonly Project2Obstacle[] {
    const selectors = this.project2UsesVisualStage()
      ? ['.visual__window--one', '.visual__window--two']
      : ['.project-stack__copy', '.project-stack__visual', '.project-stack__previews', '.project-stack__game-thumb'];

    return selectors
      .map((selector) => this.project2ObstacleFromSelector(panel, stage, selector))
      .filter((obstacle): obstacle is Project2Obstacle => Boolean(obstacle));
  }

  /** Wandelt ein Element in eine relative Kollisionsfläche um. */
  private project2ObstacleFromSelector(panel: HTMLElement, stage: HTMLElement, selector: string): Project2Obstacle | null {
    const element = panel.querySelector<HTMLElement>(selector);

    if (!element) {
      return null;
    }

    const stageRect = stage.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const inset = selector.includes('visual__window') ? 2 : selector === '.project-stack__visual' ? 10 : 4;

    return {
      x: rect.left - stageRect.left + inset,
      y: rect.top - stageRect.top + inset,
      width: Math.max(0, rect.width - inset * 2),
      height: Math.max(0, rect.height - inset * 2),
    };
  }

  /** Setzt die Assets bei reduzierter Bewegung direkt auf den Boden. */
  private snapProject2ItemsToFloor(): void {
    const stage = this.project2StageElement();
    const width = stage?.clientWidth ?? window.innerWidth;
    const floorOffset = this.project2UsesVisualStage() ? 24 : 50;
    const floor = Math.max(160, (stage?.clientHeight ?? window.innerHeight) - floorOffset);

    this.project2Items.forEach((item, index) => {
      item.x = Math.min(width - item.width - 12, 80 + index * 54);
      item.y = floor - item.height;
      item.vx = 0;
      item.vy = 0;
      item.angularVelocity = 0;
      item.resting = true;
      item.touchedFloor = true;
    });

    this.publishProject2Styles();
  }

  /** Publiziert den aktuellen Simulationszustand ins Template. */
  private publishProject2Styles(): void {
    this.project2ItemStyles.set(this.project2Items.map((item) => ({
      width: `${item.width}px`,
      height: `${item.height}px`,
      transform: `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, 0) rotate(${item.rotation.toFixed(1)}deg)`,
    })));
  }



  /** Startet die 1UP-Sequenz, sobald alle Game-Assets den Boden berührt haben. */
  private triggerProject2OneUpsWhenReady(): void {
    if (this.project2OneUpStarted || !this.project2Items.length) {
      return;
    }

    if (!this.project2Items.every((item) => item.touchedFloor)) {
      return;
    }

    this.project2OneUpStarted = true;
    this.achievementService.unlock('game-oneup');
    this.scheduleProject2OneUp(0, 0);
    this.scheduleProject2OneUp(1, 760);
    this.scheduleProject2OneUp(2, 1520);
  }

  /** Plant einen einzelnen 1UP-Aufstieg. */
  private scheduleProject2OneUp(id: number, delayMs: number): void {
    const showTimer = setTimeout(() => {
      this.zone.run(() => this.project2OneUps.update((items) => [...items, id]));
      const hideTimer = setTimeout(() => {
        this.zone.run(() => this.project2OneUps.update((items) => items.filter((item) => item !== id)));
      }, 980);

      this.project2OneUpTimers.push(hideTimer);
    }, delayMs);

    this.project2OneUpTimers.push(showTimer);
  }

  /** Entfernt laufende 1UP-Timer. */
  private clearProject2OneUpTimers(): void {
    for (const timer of this.project2OneUpTimers) {
      clearTimeout(timer);
    }

    this.project2OneUpTimers.length = 0;
  }

  /** Begrenzt die Rotationsgeschwindigkeit, damit Objekte nicht endlos eskalieren. */
  private clampProject2Spin(value: number): number {
    return Math.min(Math.max(value, -1.15), 1.15);
  }

  /** Beruhigt Objekte, sobald sie fast stillliegen. */
  private settleProject2Item(item: Project2PhysicsState): void {
    if (!item.resting) {
      return;
    }

    if (Math.abs(item.vx) < 0.08) {
      item.vx = 0;
    }

    if (Math.abs(item.vy) < 0.08) {
      item.vy = 0;
    }

    if (Math.abs(item.angularVelocity) < 0.04) {
      item.angularVelocity = 0;
    }
  }

  /** Prüft, ob die Game-Assets auf der mobilen Preview-Bühne laufen. */
  private project2UsesVisualStage(): boolean {
    return window.matchMedia('(max-width: 760px)').matches;
  }

  /** Liefert die aktive Game-Bühne für Desktop, Wide-Screen oder Mobile. */
  private project2StageElement(): HTMLElement | null {
    const panel = this.project2PanelElement();

    if (!panel) {
      return null;
    }

    if (this.project2UsesVisualStage()) {
      return panel.querySelector<HTMLElement>('.project-stack__game-layer--visual') ?? panel;
    }

    return panel.querySelector<HTMLElement>('.project-stack__game-layer--panel') ?? panel;
  }

  /** Liefert das Projekt-2-Panel. */
  private project2PanelElement(): HTMLElement | null {
    return this.projectPanelElement('html5-browser-game');
  }

  /** Liefert ein Projektpanel anhand seines Slugs. */
  private projectPanelElement(slug: string): HTMLElement | null {
    return this.projectPanels?.toArray()
      .find((panelRef, index) => this.projects[index]?.slug === slug)
      ?.nativeElement ?? null;
  }
}
