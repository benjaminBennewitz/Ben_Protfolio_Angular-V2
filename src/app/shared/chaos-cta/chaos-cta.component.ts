/* src/app/shared/chaos-cta/chaos-cta.component.ts */

/**
 * @file Physikähnliche CTA-Section.
 * @description Lässt CTA-Wortbausteine beim Erreichen der Section fallen und auf Cursor-Nähe reagieren.
 */

import { AchievementService } from '../../core/services/achievement.service';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';

/** Bewegungszustand eines CTA-Bausteins. */
interface CtaBlockState {
  /** Sichtbarer Text des Bausteins. */
  readonly label: string;
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
  /** Breite des Bausteins. */
  width: number;
  /** Höhe des Bausteins. */
  height: number;
}

/** Klickbare CTA mit fallenden und reagierenden Wortblöcken. */
@Component({
  selector: 'bp-chaos-cta',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './chaos-cta.component.html',
  styleUrl: './chaos-cta.component.scss',
})
export class ChaosCtaComponent implements AfterViewInit, OnDestroy {
  /** Eyebrow-Label der Section. */
  @Input() eyebrow = '';

  /** Haupttitel der CTA-Section. */
  @Input() title = '';

  /** Bedienhinweis für Cursor-Interaktion. */
  @Input() hint = '';

  /** Sichtbare Wortbausteine. */
  @Input() words: readonly string[] = [];

  /** Containerreferenz für Größenmessung und Pointerposition. */
  @ViewChild('stageRef') private readonly stageRef?: ElementRef<HTMLElement>;

  /** Angular-Zone für animation-frame-Updates außerhalb der Change Detection. */
  private readonly zone = inject(NgZone);

  /** Accessibility-Service für reduzierte oder deaktivierte Bewegung. */
  private readonly accessibility = inject(AccessibilityPreferenceService);

  /** Achievement-Service für die Kontakt-CTA-Trophäe. */
  private readonly achievementService = inject(AchievementService);

  /** Interner Bewegungszustand aller Bausteine. */
  private blocks: CtaBlockState[] = [];

  /** Aktive AnimationFrame-ID. */
  private frameId = 0;

  /** Letzte bekannte Pointer-X-Position relativ zur Section. */
  private pointerX = -10000;

  /** Letzte bekannte Pointer-Y-Position relativ zur Section. */
  private pointerY = -10000;

  /** Markiert, ob die Fallanimation gestartet wurde. */
  private started = false;

  /** Sichtbarkeitsobserver für Stop und Resume der Physics-Schleife. */
  private visibilityObserver: IntersectionObserver | null = null;

  /** Sichtbare Styles für das Template. */
  readonly blockStyles = signal<readonly Record<string, string>[]>([]);

  /** Aktiviert die Simulation, sobald die Section sichtbar wird. */
  ngAfterViewInit(): void {
    this.resetBlocks();
    this.observeStart();
  }

  /** Stoppt laufende Animationen. */
  ngOnDestroy(): void {
    this.pause();
    this.visibilityObserver?.disconnect();
  }

  /** Reagiert auf Größenänderungen und baut die Bühne neu auf. */
  @HostListener('window:resize')
  onResize(): void {
    this.resetBlocks();
  }

  /** Merkt sich die Pointerposition für die Abstoßungslogik. */
  onPointerMove(event: PointerEvent): void {
    const rect = this.stageRef?.nativeElement.getBoundingClientRect();

    if (!rect) {
      return;
    }

    this.pointerX = event.clientX - rect.left;
    this.pointerY = event.clientY - rect.top;
  }

  /** Setzt die Pointerposition außerhalb des sichtbaren Bereichs. */
  onPointerLeave(): void {
    this.pointerX = -10000;
    this.pointerY = -10000;
  }

  /** Scrollt barrierearm zum Kontaktbereich. */
  goToContact(): void {
    this.achievementService.unlock('cta-contact');
    document.getElementById('contact')?.scrollIntoView({ behavior: this.accessibility.reducesMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  /** Liefert einen einzelnen CSS-Style-Wert für einen Baustein. */
  styleAt(index: number, property: 'width' | 'height' | 'transform'): string {
    return this.blockStyles()[index]?.[property] ?? '';
  }

  /** Erkennt einen CTA-Baustein, der als Material Symbol gerendert wird. */
  isIconBlock(word: string): boolean {
    return word.startsWith('icon:');
  }

  /** Extrahiert den Material-Symbol-Namen aus einem Icon-Baustein. */
  iconName(word: string): string {
    return word.replace('icon:', '');
  }

  /** Unterstützt Tastaturaktivierung der gesamten CTA-Section. */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.goToContact();
  }

  /** Erzeugt Startpositionen oberhalb des Bodens. */
  private resetBlocks(): void {
    const width = this.stageRef?.nativeElement.clientWidth ?? 1000;
    const baseY = Math.max(120, (this.stageRef?.nativeElement.clientHeight ?? 360) * 0.25);

    this.blocks = this.words.map((word, index) => ({
      label: word,
      x: Math.min(width - 170, 80 + index * 190),
      y: -baseY - index * 42,
      vx: (index - 1.5) * 0.65,
      vy: 0,
      rotation: [-12, 9, -6, 14][index] ?? 0,
      angularVelocity: [-0.15, 0.11, -0.1, 0.18][index] ?? 0.08,
      width: this.blockWidth(word),
      height: this.isIconBlock(word) ? 80 : 86,
    }));

    this.publishStyles();
  }

  /** Berechnet die passende Breite für Text- und Icon-Bausteine. */
  private blockWidth(word: string): number {
    if (this.isIconBlock(word)) {
      return 104;
    }

    return word === 'touch' ? 184 : 132;
  }

  /** Startet und pausiert die Animation abhängig von der Sichtbarkeit. */
  private observeStart(): void {
    const stage = this.stageRef?.nativeElement;

    if (!stage || !('IntersectionObserver' in window)) {
      this.start();
      return;
    }

    this.visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.start();
          return;
        }

        this.pause();
      },
      { threshold: 0.16, rootMargin: '8% 0px 8% 0px' },
    );

    this.visibilityObserver.observe(stage);
  }

  /** Startet oder setzt die requestAnimationFrame-Schleife außerhalb Angulars fort. */
  private start(): void {
    if (this.accessibility.reducesMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pause();
      this.snapToFloor();
      return;
    }

    this.started = true;

    if (this.frameId) {
      return;
    }

    this.zone.runOutsideAngular(() => this.tick());
  }

  /** Pausiert die aktive Physics-Schleife. */
  private pause(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  /** Simuliert Gravitation, Grenzen, Cursor-Abstoßung und einfache Kollisionen. */
  private tick(): void {
    const stage = this.stageRef?.nativeElement;

    if (!stage || this.accessibility.reducesMotion()) {
      this.pause();
      this.snapToFloor();
      return;
    }

    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const floor = Math.max(180, height - 96);

    for (const block of this.blocks) {
      this.applyPointerForce(block);
      block.vy += 0.48;
      block.vx *= 0.992;
      block.vy *= 0.992;
      block.angularVelocity *= 0.992;
      block.x += block.vx;
      block.y += block.vy;
      block.rotation += block.angularVelocity;

      if (block.x < 14) {
        block.x = 14;
        block.vx *= -0.72;
      }

      if (block.x + block.width > width - 14) {
        block.x = width - block.width - 14;
        block.vx *= -0.72;
      }

      if (block.y + block.height > floor) {
        block.y = floor - block.height;
        block.vy *= -0.45;
        block.vx *= 0.88;
        block.angularVelocity *= 0.78;
      }
    }

    this.resolveCollisions();
    this.zone.run(() => this.publishStyles());
    this.frameId = requestAnimationFrame(() => this.tick());
  }

  /** Schiebt Blöcke vom Cursor weg. */
  private applyPointerForce(block: CtaBlockState): void {
    const centerX = block.x + block.width / 2;
    const centerY = block.y + block.height / 2;
    const dx = centerX - this.pointerX;
    const dy = centerY - this.pointerY;
    const distance = Math.max(1, Math.hypot(dx, dy));

    if (distance > 190) {
      return;
    }

    const force = (190 - distance) / 190;
    block.vx += (dx / distance) * force * 7.2;
    block.vy += (dy / distance) * force * 6.4;
    block.angularVelocity += force * (dx > 0 ? 1 : -1) * 1.1;
  }

  /** Trennt überlappende Bausteine mit einfacher AABB-Kollision. */
  private resolveCollisions(): void {
    for (let i = 0; i < this.blocks.length; i += 1) {
      for (let j = i + 1; j < this.blocks.length; j += 1) {
        const a = this.blocks[i];
        const b = this.blocks[j];
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
          a.vx *= -0.55;
          b.vx *= -0.55;
        } else {
          a.y += direction * push;
          b.y -= direction * push;
          a.vy *= -0.48;
          b.vy *= -0.48;
        }

        a.angularVelocity += direction * 0.18;
        b.angularVelocity -= direction * 0.18;
      }
    }
  }

  /** Setzt die Blöcke ohne Animation auf den Boden. */
  private snapToFloor(): void {
    const stage = this.stageRef?.nativeElement;
    const width = stage?.clientWidth ?? 1000;
    const floor = Math.max(180, (stage?.clientHeight ?? 360) - 96);

    this.blocks.forEach((block, index) => {
      block.x = Math.min(width - block.width - 16, 72 + index * 190);
      block.y = floor - block.height;
    });

    this.publishStyles();
  }

  /** Überträgt den Simulationszustand in CSS-Styles. */
  private publishStyles(): void {
    this.blockStyles.set(this.blocks.map((block) => ({
      width: `${block.width}px`,
      height: `${block.height}px`,
      transform: `translate3d(${block.x}px, ${block.y}px, 0) rotate(${block.rotation}deg)`,
    })));
  }
}
