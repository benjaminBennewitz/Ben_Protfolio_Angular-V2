/* src/app/shared/project-stack/project-stack.component.ts */

/**
 * @file Fullscreen-Projekt-Stack.
 * @description Rendert sticky Projekt-Panels und simuliert Projekt-2-Game-Assets mit Gravitation.
 */

import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject } from '../../core/models/portfolio.models';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ProjectVisualComponent } from '../project-visual/project-visual.component';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';

/** Dekoratives Game-Asset mit Bildquelle. */
interface Project2PhysicsItem {
  /** Pfad zum 1-Bit-/8-Bit-Asset. */
  readonly src: string;
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

/** Scrollbasierte Fullscreen-Projektbühne mit seitlicher Projektvorschau. */
@Component({
  selector: 'bp-project-stack',
  standalone: true,
  imports: [RouterLink, ProjectVisualComponent, RevealOnScrollDirective],
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

  /** Eyebrow der Projektsektion. */
  @Input() eyebrow = '';

  /** Haupttitel der Projektsektion. */
  @Input() title = '';

  /** Beschreibung der Projektsektion. */
  @Input() subtitle = '';

  /** Buttonlabel für Detailseiten. */
  @Input() detailLabel = '';

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
    { src: 'assets/images/project-stack/project_2/pj2_coin.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_ring.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_star.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_key.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_heart.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_html5.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_triangle.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_square.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_x.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_potion.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_spring.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_spikes.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_chest.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_lock.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_door.webp' },
    { src: 'assets/images/project-stack/project_2/pj2_flag.webp' },
  ];

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

  /** Startet die passive Projekt-2-Erkennung. */
  ngAfterViewInit(): void {
    this.resetProject2Items();
    queueMicrotask(() => {
      this.observeProject2Panel();
      this.observeProject5Typewriter();
    });
  }

  /** Stoppt Animation und Beobachter. */
  ngOnDestroy(): void {
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

  /** Liefert alle anderen Projekte für die rechte Vorschauleiste. */
  previewsFor(activeProject: PortfolioProject): readonly PortfolioProject[] {
    return this.projects.filter((project) => project.slug !== activeProject.slug);
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
    const rect = panel?.getBoundingClientRect();

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
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.42) {
          this.startProject2Physics();
          return;
        }

        this.pauseProject2Physics();
      },
      { threshold: [0, 0.42], rootMargin: '-4% 0px -4% 0px' },
    );

    this.project2Observer.observe(project2Panel);
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
    const panel = this.project2PanelElement();
    const width = panel?.clientWidth ?? window.innerWidth;
    const centerX = width * 0.5;
    const spread = Math.min(300, width * 0.32);

    this.project2Items = this.project2PhysicsItems.map((item, index) => {
      const slot = index - (this.project2PhysicsItems.length - 1) / 2;
      const normalizedSlot = slot / Math.max(1, this.project2PhysicsItems.length / 2);
      const wobble = [0, -18, 12, -7, 22, -14, 9, -21][index % 8] ?? 0;

      return {
        ...item,
        x: centerX + normalizedSlot * spread + wobble,
        y: -90 - (index % 4) * 14,
        vx: normalizedSlot * 1.25 + ((index % 3) - 1) * 0.55,
        vy: 0,
        rotation: [-10, 8, -16, 14, -6, 18][index % 6] ?? 0,
        angularVelocity: [-0.12, 0.1, -0.08, 0.14, -0.1, 0.09][index % 6] ?? 0.08,
        width: 45,
        height: 45,
        resting: false,
        touchedFloor: false,
      };
    });

    this.publishProject2Styles();
  }

  /** Simuliert Gravitation, Cursor-Abstoßung, Grenzen, Objekt- und UI-Kollisionen. */
  private tickProject2Physics(): void {
    const panel = this.project2PanelElement();

    if (!panel || this.accessibility.reducesMotion()) {
      this.pauseProject2Physics();
      return;
    }

    const width = panel.clientWidth;
    const height = panel.clientHeight;
    const floor = Math.max(220, height - 50);
    const obstacles = this.project2Obstacles(panel);

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
  private project2Obstacles(panel: HTMLElement): readonly Project2Obstacle[] {
    return ['.project-stack__copy', '.project-stack__visual', '.project-stack__previews', '.project-stack__game-thumb']
      .map((selector) => this.project2ObstacleFromSelector(panel, selector))
      .filter((obstacle): obstacle is Project2Obstacle => Boolean(obstacle));
  }

  /** Wandelt ein Element in eine relative Kollisionsfläche um. */
  private project2ObstacleFromSelector(panel: HTMLElement, selector: string): Project2Obstacle | null {
    const element = panel.querySelector<HTMLElement>(selector);

    if (!element) {
      return null;
    }

    const panelRect = panel.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const inset = selector === '.project-stack__visual' ? 10 : 4;

    return {
      x: rect.left - panelRect.left + inset,
      y: rect.top - panelRect.top + inset,
      width: Math.max(0, rect.width - inset * 2),
      height: Math.max(0, rect.height - inset * 2),
    };
  }

  /** Setzt die Assets bei reduzierter Bewegung direkt auf den Boden. */
  private snapProject2ItemsToFloor(): void {
    const panel = this.project2PanelElement();
    const width = panel?.clientWidth ?? window.innerWidth;
    const floor = Math.max(220, (panel?.clientHeight ?? window.innerHeight) - 50);

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
