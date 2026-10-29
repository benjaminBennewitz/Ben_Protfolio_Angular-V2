/* src/app/shared/chaos-cta/chaos-cta.component.ts */

/**
 * @file Physikähnliche CTA-Section.
 * @description Lässt CTA-Wortbausteine fallen, reagiert auf Cursor-Nähe und inszeniert einen Pixel-Verkehrsstau nach einem Unfall.
 */

import { AchievementService } from '../../core/services/achievement.service';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';
import { PixelSpriteComponent } from '../pixel-sprite/pixel-sprite.component';
import { SystemDialogComponent } from '../system-dialog/system-dialog.component';
import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';

/** Bewegungszustand des primären Pixelautos. */
type CtaCarPhase = 'waiting' | 'driving' | 'crashed' | 'gone';

/** Fahrzeugtyp für den nach einem Crash entstehenden Stau. */
type CtaTrafficVehicleKind = 'car' | 'ambulance';

/** Bewegungszustand eines Fahrzeugs innerhalb des Staus. */
type CtaTrafficVehiclePhase = 'waiting' | 'driving' | 'stopped';

/** Bewegungszustand des einmalig durchfahrenden Pixelautos. */
interface CtaCarState {
  x: number;          // Horizontale Position des Autos.
  y: number;          // Vertikale Position des Autos.
  width: number;      // Kollisionsbreite des Autos.
  height: number;     // Kollisionshöhe des Autos.
  phase: CtaCarPhase; // Aktuelle Phase der Auto-Sequenz.
  launchAt: number;   // Zeitpunkt, ab dem das Auto losfahren darf.
  crashedAt: number;  // Zeitpunkt der letzten Kollision.
}

/** Simulationszustand eines nachfolgenden Fahrzeugs. */
interface CtaTrafficVehicleState {
  readonly kind: CtaTrafficVehicleKind; // Fahrzeugtyp für Sprite und Sirene.
  x: number;                            // Horizontale Position des Fahrzeugs.
  y: number;                            // Vertikale Position des Fahrzeugs.
  width: number;                        // Darstellungsbreite des Fahrzeugs.
  height: number;                       // Darstellunghöhe des Fahrzeugs.
  phase: CtaTrafficVehiclePhase;        // Aktueller Bewegungszustand.
  launchAt: number;                     // Zeitpunkt, ab dem das Fahrzeug in die Bühne einfährt.
  stopX: number;                        // Zielposition innerhalb der Warteschlange.
}

/** Physikzustand eines fallenden CTA-Bausteins. */
interface CtaBlockState {
  readonly label: string;       // Sichtbarer Text des Bausteins.
  x: number;                    // Horizontale Position in Pixel.
  y: number;                    // Vertikale Position in Pixel.
  vx: number;                   // Horizontale Geschwindigkeit.
  vy: number;                   // Vertikale Geschwindigkeit.
  rotation: number;             // Rotation in Grad.
  angularVelocity: number;      // Rotationsgeschwindigkeit.
  width: number;                // Breite des Bausteins.
  height: number;               // Höhe des Bausteins.
  hasTouchedFloor: boolean;     // Merkt, ob der Baustein mindestens einmal Bodenkontakt hatte.
  airborneSince: number | null; // Zeitstempel seit dem ein bereits gelandeter Baustein in der Luft bleibt.
}

/** Klickbare CTA mit fallenden und reagierenden Wortblöcken. */
@Component({
  selector: 'bp-chaos-cta',
  standalone: true,
  imports: [RevealOnScrollDirective, RevealTextComponent, PixelSpriteComponent, SystemDialogComponent],
  templateUrl: './chaos-cta.component.html',
  styleUrl: './chaos-cta.component.scss',
})
export class ChaosCtaComponent implements AfterViewInit, OnDestroy {
  @Input() eyebrow = '';                                                                                                    // Eyebrow-Label der Section.

  @Input() title = '';                                                                                                      // Haupttitel der CTA-Section.

  @Input() hint = '';                                                                                                       // Bedienhinweis für Cursor-Interaktion.

  @Input() contactLabel = '';                                                                                               // Zugängliche Beschriftung des Kontaktlinks.

  @Input() words: readonly string[] = [];                                                                                   // Sichtbare Wortbausteine.

  @ViewChild('stageRef') private readonly stageRef?: ElementRef<HTMLElement>;                                               // Containerreferenz für Größenmessung und Pointerposition.
  private readonly zone = inject(NgZone);                                                                                   // Angular-Zone für animation-frame-Updates außerhalb der Change Detection.
  private readonly accessibility = inject(AccessibilityPreferenceService);                                                  // Accessibility-Service für reduzierte oder deaktivierte Bewegung.
  private readonly achievementService = inject(AchievementService);                                                         // Achievement-Service für CTA-Trophäen.
  private blocks: CtaBlockState[] = [];                                                                                     // Interner Bewegungszustand aller Bausteine.
  private trafficVehicles: CtaTrafficVehicleState[] = [];                                                                   // Nach einem Unfall einfahrende Fahrzeuge inklusive Krankenwagen.
  private frameId = 0;                                                                                                      // Aktive AnimationFrame-ID.
  private pointerX = -10000;                                                                                                // Letzte bekannte Pointer-X-Position relativ zur Section.
  private pointerY = -10000;                                                                                                // Letzte bekannte Pointer-Y-Position relativ zur Section.
  private sectionIsVisible = false;                                                                                         // Markiert, ob die Section ausreichend sichtbar ist.
  private snapStartTimer = 0;                                                                                               // Geplanter Start nach dem Scroll-Snap-Einrasten.
  private visibilityObserver: IntersectionObserver | null = null;                                                           // Sichtbarkeitsobserver für Stop und Resume der Physics-Schleife.
  private gravityAchievementUnlocked = false;                                                                               // Markiert, ob die CTA-Schwerkraft-Trophäe bereits ausgelöst wurde.
  private carHadAccident = false;                                                                                           // Merkt, ob das Pixelauto in der aktuellen Fahrt einen Unfall hatte.
  private driverAchievementUnlocked = false;                                                                                // Verhindert doppelte Freischaltungen der Fahrer-Trophäe innerhalb derselben CTA-Session.
  private rescueAchievementUnlocked = false;                                                                                // Verhindert doppelte Freischaltungen der Rettungsgassen-Trophäe innerhalb derselben CTA-Session.
  private car: CtaCarState = { x: 0, y: 0, width: 92, height: 50, phase: 'waiting', launchAt: 0, crashedAt: 0 };            // Physikzustand des einmalig durchfahrenden Pixelautos.
  readonly trafficVehicleKinds: readonly CtaTrafficVehicleKind[] = ['car', 'car', 'car', 'car', 'car', 'car', 'ambulance']; // Reihenfolge der nach einem Crash einfahrenden Fahrzeuge. Sieben Fahrzeuge plus Unfallauto ergeben acht.
  readonly isDialogVisible = signal<boolean>(true);                                                                         // Sichtbarkeit des kleinen CTA-Dialogfensters.
  readonly blockStyles = signal<readonly Record<string, string>[]>([]);                                                     // Sichtbare Styles für das Template.
  readonly carStyle = signal<Record<'opacity' | 'transform' | 'width', string>>({                                           // Sichtbare Transformationswerte des Pixelautos.
    opacity: '0',
    transform: 'translate3d(0, 0, 0)',
    width: '92px',
  });

  readonly carPhase = signal<CtaCarPhase>('waiting');                                                                       // Aktuelle sichtbare Phase des Pixelautos.
  readonly trafficVehicleStyles = signal<readonly Record<'opacity' | 'transform' | 'width', string>[]>([]);                 // Sichtbare Styles der Fahrzeuge im Stau.
  readonly trafficVehiclePhases = signal<readonly CtaTrafficVehiclePhase[]>([]);                                            // Sichtbare Phasen der Fahrzeuge im Stau.

  /** Aktiviert die Simulation, sobald die Section sichtbar wird. */
  ngAfterViewInit(): void {
    this.resetBlocks();
    this.observeStart();
  }

  /** Stoppt laufende Animationen. */
  ngOnDestroy(): void {
    this.pause();
    window.clearTimeout(this.snapStartTimer);
    this.visibilityObserver?.disconnect();
  }

  /** Reagiert auf Größenänderungen und baut die Bühne neu auf. */
  @HostListener('window:resize')
  onResize(): void {
    this.resetBlocks();
    this.startWhenSnapped();
  }

  /** Prüft beim Scrollen, ob die Section bereits sauber eingerastet ist. */
  @HostListener('window:scroll')
  onScroll(): void {
    this.startWhenSnapped();
  }

  /** Merkt sich die Pointerposition für die Abstoßungslogik. */
  onPointerMove(event: PointerEvent): void {

    const rect = this.stageRef?.nativeElement.getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.

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

  /** Entfernt das kleine CTA-Dialogfenster ohne die Section-Navigation auszulösen. */
  closeDialog(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.achievementService.unlock('nostalgia-hater');
    this.isDialogVisible.set(false);
  }

  /** Scrollt barrierearm zum Kontaktbereich. */
  goToContact(event?: Event): void {
    event?.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: this.accessibility.reducesMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  /** Liefert einen einzelnen CSS-Style-Wert für einen Baustein. */
  styleAt(index: number, property: 'width' | 'height' | 'transform'): string {
    return this.blockStyles()[index]?.[property] ?? '';
  }

  /** Liefert einen CSS-Style-Wert eines Fahrzeugs im Stau. */
  trafficStyleAt(index: number, property: 'opacity' | 'transform' | 'width'): string {
    return this.trafficVehicleStyles()[index]?.[property] ?? (property === 'opacity' ? '0' : '');
  }

  /** Liefert die aktuelle Phase eines Fahrzeugs im Stau. */
  trafficPhaseAt(index: number): CtaTrafficVehiclePhase {
    return this.trafficVehiclePhases()[index] ?? 'waiting';
  }

  /** Erkennt einen CTA-Baustein, der als Material Symbol gerendert wird. */
  isIconBlock(word: string): boolean {
    return word.startsWith('icon:');
  }

  /** Extrahiert den Material-Symbol-Namen aus einem Icon-Baustein. */
  iconName(word: string): string {
    return word.replace('icon:', '');
  }

  /** Erzeugt Startpositionen oberhalb des Bodens. */
  private resetBlocks(): void {

    const width = this.stageRef?.nativeElement.clientWidth ?? 1000;                         // Berechnete Breite in CSS-Pixeln.
    const baseY = Math.max(120, (this.stageRef?.nativeElement.clientHeight ?? 360) * 0.25); // Vertikale Basislinie der schwebenden Wortblöcke.

    this.blocks = this.words.map(/** Erzeugt den Physikblock für das aktuelle Wort. */(word, index) => ({
      label: word,
      x: Math.min(width - this.blockWidth(word) - 24, 80 + index * this.blockGap()),
      y: -baseY - index * 42,
      vx: (index - 1.5) * 0.65,
      vy: 0,
      rotation: [-12, 9, -6, 14][index] ?? 0,
      angularVelocity: [-0.15, 0.11, -0.1, 0.18][index] ?? 0.08,
      width: this.blockWidth(word),
      height: this.blockHeight(word),
      hasTouchedFloor: false,
      airborneSince: null,
    }));

    this.gravityAchievementUnlocked = false;
    this.carHadAccident = false;
    this.driverAchievementUnlocked = false;
    this.rescueAchievementUnlocked = false;
    this.trafficVehicles = [];
    this.resetCar(width);

    this.publishStyles();
  }

  /** Berechnet die Bausteinbreite aus Inhalt und Eingabemodus, damit Beschriftungen vollständig im Block bleiben. */
  private blockWidth(word: string): number {
    if (this.isIconBlock(word)) {
      return this.usesCompactMobilePhysics() ? 54 : 74;
    }

    const characterCount = Math.max(2, word.trim().length); // Anzahl der Zeichen zur Abschätzung der Blockbreite.

    if (this.usesCompactMobilePhysics()) {
      return Math.min(116, Math.max(62, 30 + characterCount * 12));
    }

    return Math.min(188, Math.max(92, 42 + characterCount * 22));
  }

  /** Berechnet die Höhe eines Bausteins passend zur aktuellen Eingabeart. */
  private blockHeight(word: string): number {
    if (this.usesCompactMobilePhysics()) {
      return this.isIconBlock(word) ? 42 : 44;
    }

    return this.isIconBlock(word) ? 56 : 60;
  }

  /** Liefert den horizontalen Startabstand der Bausteine. */
  private blockGap(): number {
    return this.usesCompactMobilePhysics() ? 76 : 134;
  }

  /** Startet und pausiert die Animation abhängig von der Sichtbarkeit. */
  private observeStart(): void {

    const stage = this.stageRef?.nativeElement; // Gerenderte Bühne für Physik- und Pointer-Messungen.

    if (!stage || !('IntersectionObserver' in window)) {
      this.sectionIsVisible = true;
      this.startWhenSnapped();
      return;
    }

    this.visibilityObserver = new IntersectionObserver(
      /** Startet und pausiert die Animation abhängig von der Sichtbarkeit. */([entry]) => {
        this.sectionIsVisible = Boolean(entry?.isIntersecting);

        if (this.sectionIsVisible) {
          this.startWhenSnapped();
          return;
        }

        this.pause();
        window.clearTimeout(this.snapStartTimer);
      },
      { threshold: 0.78, rootMargin: '0px' },
    );

    this.visibilityObserver.observe(stage);
  }

  /** Startet die Bausteine erst, wenn die Section durch Scroll-Snap eingerastet ist. */
  private startWhenSnapped(): void {
    if (this.frameId || !this.sectionIsVisible || !this.sectionIsSnapped()) {
      return;
    }

    window.clearTimeout(this.snapStartTimer);
    this.snapStartTimer = window.setTimeout(/** Startet die Bausteine erst, wenn die Section durch Scroll-Snap eingerastet ist. */() => {
      if (this.sectionIsVisible && this.sectionIsSnapped()) {
        this.start();
      }
    }, 90);
  }

  /** Erkennt die eingerastete Position der Fullscreen-Section. */
  private sectionIsSnapped(): boolean {

    const rect = this.stageRef?.nativeElement.getBoundingClientRect(); // Gemessene Grenzen des aktuellen Elements.

    if (!rect) {
      return false;
    }

    return this.usesCompactMobilePhysics() ? Math.abs(rect.top) <= 160 : Math.abs(rect.top) <= 72;
  }

  /** Startet oder setzt die requestAnimationFrame-Schleife außerhalb Angulars fort. */
  private start(): void {
    if (this.accessibility.reducesMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.pause();
      this.snapToFloor();
      return;
    }

    if (this.frameId) {
      return;
    }

    if (this.car.phase === 'waiting' && this.car.launchAt === 0) {
      this.car.launchAt = performance.now() + 1200;
    }

    this.zone.runOutsideAngular(/** Startet oder setzt die requestAnimationFrame-Schleife außerhalb Angulars fort. */() => this.tick());
  }

  /** Pausiert die aktive Physics-Schleife. */
  private pause(): void {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  /** Simuliert Gravitation, Grenzen, Cursor-Abstoßung, Blockkollisionen und den CTA-Verkehr. */
  private tick(): void {

    const stage = this.stageRef?.nativeElement; // Gerenderte Bühne für Physik- und Pointer-Messungen.

    if (!stage || this.accessibility.reducesMotion()) {
      this.pause();
      this.snapToFloor();
      return;
    }

    const width = stage.clientWidth;          // Berechnete Breite in CSS-Pixeln.
    const height = stage.clientHeight;        // Berechnete Höhe in CSS-Pixeln.
    const floor = Math.max(180, height - 96); // Untere Grenze der simulierten Wortbühne.
    const now = performance.now();            // Aktueller Zeitstempel des Animationsframes.

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
        block.hasTouchedFloor = true;
        block.airborneSince = null;
      }

      this.checkGravityAchievement(block, floor);
    }

    this.resolveCollisions();
    this.updateCar(now, width, floor);
    this.updateTraffic(now, width, floor);
    this.zone.run(/** Simuliert Gravitation, Grenzen, Cursor-Abstoßung, Blockkollisionen und den CTA-Verkehr. */() => this.publishStyles());
    this.frameId = requestAnimationFrame(/** Simuliert Gravitation, Grenzen, Cursor-Abstoßung, Blockkollisionen und den CTA-Verkehr. */() => this.tick());
  }

  /** Schiebt Blöcke vom Cursor weg. */
  private applyPointerForce(block: CtaBlockState): void {

    const centerX = block.x + block.width / 2;        // Horizontale Mitte des gemessenen Bereichs.
    const centerY = block.y + block.height / 2;       // Vertikale Mitte des gemessenen Bereichs.
    const dx = centerX - this.pointerX;               // Horizontaler Abstand zweier Positionen.
    const dy = centerY - this.pointerY;               // Vertikaler Abstand zweier Positionen.
    const distance = Math.max(1, Math.hypot(dx, dy)); // Abstand der aktuellen Interaktionspunkte.

    if (distance > 190) {
      return;
    }

    const force = (190 - distance) / 190; // Aus dem Abstand berechneter Kraftfaktor.

    block.vx += (dx / distance) * force * 7.2;
    block.vy += (dy / distance) * force * 6.4;
    block.angularVelocity += force * (dx > 0 ? 1 : -1) * 1.1;
  }

  /** Prüft, ob der Touch-Baustein lange genug ohne Bodenkontakt jongliert wurde. */
  private checkGravityAchievement(block: CtaBlockState, floor: number): void {
    if (this.gravityAchievementUnlocked || block.label !== 'touch' || !block.hasTouchedFloor) {
      return;
    }

    const isAirborne = block.y + block.height < floor - 8; // Block befindet sich oberhalb der Ruheposition.

    if (!isAirborne) {
      block.airborneSince = null;
      return;
    }

    block.airborneSince ??= performance.now();

    if (performance.now() - block.airborneSince < 5000) {
      return;
    }

    this.gravityAchievementUnlocked = true;
    this.zone.run(/** Prüft, ob der Touch-Baustein lange genug ohne Bodenkontakt jongliert wurde. */() => this.achievementService.unlock('cta-contact'));
  }

  /** Trennt überlappende Bausteine mit einfacher AABB-Kollision. */
  private resolveCollisions(): void {
    for (let i = 0; i < this.blocks.length; i += 1) {
      for (let j = i + 1; j < this.blocks.length; j += 1) {

        const a = this.blocks[i];                                              // Erster Block der Kollisionsprüfung.
        const b = this.blocks[j];                                              // Zweiter Block der Kollisionsprüfung.
        const overlapX = Math.min(a.x + a.width - b.x, b.x + b.width - a.x);   // Horizontale Überschneidung zweier Blöcke.
        const overlapY = Math.min(a.y + a.height - b.y, b.y + b.height - a.y); // Vertikale Überschneidung zweier Blöcke.

        if (overlapX <= 0 || overlapY <= 0) {
          continue;
        }

        const pushX = overlapX < overlapY;                                     // Horizontale Richtung des Kollisionsimpulses.
        const direction = pushX ? (a.x < b.x ? -1 : 1) : (a.y < b.y ? -1 : 1); // Bewegungsrichtung des aktuellen Wechsels.
        const push = (pushX ? overlapX : overlapY) / 2;                        // Stärke des aufzulösenden Kollisionsversatzes.

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

    const stage = this.stageRef?.nativeElement;                                                                                                                                       // Gerenderte Bühne für Physik- und Pointer-Messungen.
    const width = stage?.clientWidth ?? 1000;                                                                                                                                         // Berechnete Breite in CSS-Pixeln.
    const floor = Math.max(180, (stage?.clientHeight ?? 360) - 96);                                                                                                                   // Untere Grenze der simulierten Wortbühne.
    const compact = this.usesCompactMobilePhysics();                                                                                                                                  // Kompaktes Bühnenlayout ist aktiv.
    const gap = compact ? 10 : 12;                                                                                                                                                    // Abstand zwischen benachbarten Blöcken.
    const compactColumnWidth = compact ? Math.max(84, ...this.blocks.map(/** Liefert die Blockbreite zur Berechnung der kompakten Spaltenbreite. */(block) => block.width)) : 0; // Verfügbare Spaltenbreite im kompakten Layout.
    const columns = compact ? 2 : this.blocks.length;                                                                                                                                 // Anzahl oder Positionen der Layoutspalten.
    const startX = compact ? Math.max(14, (width - 2 * compactColumnWidth - gap) / 2) : 72;                                                                                           // Horizontale Ausgangsposition der Blockgruppe.
    let desktopCursorX = startX;                                                                                                                                                      // Horizontale Position des nächsten Desktop-Blocks.

    this.car.phase = 'gone';
    this.trafficVehicles = [];

    this.blocks.forEach(/** Setzt die Blöcke ohne Animation auf den Boden. */(block, index) => {

      const column = compact ? index % columns : index;      // Spalte des aktuellen Blocks.
      const row = compact ? Math.floor(index / columns) : 0; // Zeile des aktuellen Blocks.

      block.x = compact
        ? startX + column * (compactColumnWidth + gap)
        : Math.min(width - block.width - 16, desktopCursorX);
      desktopCursorX += block.width + gap;
      block.y = compact ? floor - block.height - row * (block.height + gap) : floor - block.height;
      block.vx = 0;
      block.vy = 0;
      block.angularVelocity = 0;
      block.rotation = [-8, 5, -4, 8][index] ?? 0;
      block.hasTouchedFloor = true;
      block.airborneSince = null;
    });

    this.publishStyles();
  }

  /** Nutzt auf Touch-/Kleinstscreens kompaktere Bausteinmaße. */
  private usesCompactMobilePhysics(): boolean {
    return window.innerWidth <= 720 || window.matchMedia('(pointer: coarse)').matches;
  }

  /** Setzt das Pixelauto rechts außerhalb der Bühne auf seine Startposition. */
  private resetCar(stageWidth: number): void {

    const compact = this.usesCompactMobilePhysics();                      // Kompaktes Bühnenlayout ist aktiv.
    const stageHeight = this.stageRef?.nativeElement.clientHeight ?? 620; // Verfügbare Höhe der Animationsbühne.
    const floor = Math.max(180, stageHeight - 96);                        // Untere Grenze der simulierten Wortbühne.
    const width = compact ? 70 : 92;                                      // Berechnete Breite in CSS-Pixeln.
    const height = compact ? 39 : 50;                                     // Berechnete Höhe in CSS-Pixeln.

    this.car = {
      x: stageWidth + width + 24,
      y: floor - height + 4,
      width,
      height,
      phase: 'waiting',
      launchAt: 0,
      crashedAt: 0,
    };
  }

  /** Bewegt das Auto nach links und löst bei Berührung eine echte Blockkollision aus. */
  private updateCar(now: number, stageWidth: number, floor: number): void {
    if (this.car.phase === 'gone') {
      return;
    }

    this.car.y = floor - this.car.height + 4;

    if (this.car.phase === 'waiting') {
      if (this.car.launchAt > 0 && now >= this.car.launchAt) {
        this.car.phase = 'driving';
      }
      return;
    }

    if (this.car.phase === 'driving') {
      this.car.x -= this.car.width < 80 ? 3.2 : 4.8;

      if (this.resolveCarCollision(now, stageWidth, floor)) {
        return;
      }

      if (this.car.x + this.car.width < -24) {
        this.car.phase = 'gone';
        this.unlockDriverAchievement();
        return;
      }

      if (this.car.x > stageWidth + this.car.width * 2) {
        this.car.phase = 'gone';
      }
    }
  }

  /** Prüft das Auto gegen alle Wortbausteine und überträgt den Crash-Impuls auf die Szene. */
  private resolveCarCollision(now: number, stageWidth: number, floor: number): boolean {
    for (const block of this.blocks) {

      const overlapX = Math.min(this.car.x + this.car.width - block.x, block.x + block.width - this.car.x);   // Horizontale Überschneidung zweier Blöcke.
      const overlapY = Math.min(this.car.y + this.car.height - block.y, block.y + block.height - this.car.y); // Vertikale Überschneidung zweier Blöcke.

      if (overlapX <= 0 || overlapY <= 0) {
        continue;
      }

      this.car.phase = 'crashed';
      this.carHadAccident = true;
      this.car.crashedAt = now;
      this.createTrafficQueue(now, stageWidth, floor);

      for (const target of this.blocks) {

        const targetCenter = target.x + target.width / 2;       // Zentrum des von der Aktion betroffenen Blocks.
        const impactCenter = block.x + block.width / 2;         // Zentrum des auslösenden Stoßes.
        const distance = Math.abs(targetCenter - impactCenter); // Abstand der aktuellen Interaktionspunkte.
        const impulse = Math.max(0, 1 - distance / 220);        // Berechneter Bewegungsimpuls.

        target.vx -= 4.5 + impulse * 6.5;
        target.vy -= 2.5 + impulse * 5.5;
        target.angularVelocity -= 0.7 + impulse * 1.6;
      }

      return true;
    }

    return false;
  }

  /** Baut drei Sekunden nach dem Unfall eine sieben Fahrzeuge lange Warteschlange auf. */
  private createTrafficQueue(crashedAt: number, stageWidth: number, floor: number): void {
    if (this.trafficVehicles.length > 0) {
      return;
    }

    const compact = stageWidth <= 900 || this.usesCompactMobilePhysics();                                                            // Kompaktes Bühnenlayout ist aktiv.
    const width = compact ? 40 : 58;                                                                                                 // Berechnete Breite in CSS-Pixeln.
    const height = compact ? 24 : 36;                                                                                                // Berechnete Höhe in CSS-Pixeln.
    const queueStart = this.car.x + this.car.width + (compact ? 6 : 10);                                                             // Startposition der Fahrzeugwarteschlange.
    const usableWidth = Math.max(width, stageWidth - queueStart - 12);                                                               // Für die Warteschlange verfügbare Bühnenbreite.
    const spacing = Math.max(compact ? 27 : 42, Math.min(width + (compact ? 3 : 8), usableWidth / this.trafficVehicleKinds.length)); // Abstand zwischen den wartenden Fahrzeugen.

    this.trafficVehicles = this.trafficVehicleKinds.map(/** Initialisiert das Fahrzeug der aktuellen Verkehrsart. */(kind, index) => ({
      kind,
      x: stageWidth + width + 24 + index * 8,
      y: floor - height + 4,
      width,
      height,
      phase: 'waiting',
      launchAt: crashedAt + 3000 + index * (compact ? 520 : 620),
      stopX: Math.min(stageWidth - width - 10, queueStart + index * spacing),
    }));
  }

  /** Lässt die nachfolgenden Autos bis zur Warteschlange vor dem Unfall fahren. */
  private updateTraffic(now: number, stageWidth: number, floor: number): void {
    if (this.car.phase !== 'crashed' || this.trafficVehicles.length === 0) {
      return;
    }

    const compact = stageWidth <= 900 || this.usesCompactMobilePhysics(); // Kompaktes Bühnenlayout ist aktiv.

    this.trafficVehicles.forEach(/** Lässt die nachfolgenden Autos bis zur Warteschlange vor dem Unfall fahren. */(vehicle, index) => {
      vehicle.y = floor - vehicle.height + 4;

      const queueStart = this.car.x + this.car.width + (compact ? 6 : 10);                                                                 // Startposition der Fahrzeugwarteschlange.
      const usableWidth = Math.max(vehicle.width, stageWidth - queueStart - 12);                                                           // Für die Warteschlange verfügbare Bühnenbreite.
      const spacing = Math.max(compact ? 27 : 42, Math.min(vehicle.width + (compact ? 3 : 8), usableWidth / this.trafficVehicles.length)); // Abstand zwischen den wartenden Fahrzeugen.

      vehicle.stopX = Math.min(stageWidth - vehicle.width - 10, queueStart + index * spacing);

      if (vehicle.phase === 'waiting') {
        if (now >= vehicle.launchAt) {
          vehicle.phase = 'driving';
        }
        return;
      }

      if (vehicle.phase !== 'driving') {
        return;
      }

      vehicle.x -= vehicle.kind === 'ambulance' ? (compact ? 3.5 : 5.2) : (compact ? 2.9 : 4.2);

      if (vehicle.x > vehicle.stopX) {
        return;
      }

      vehicle.x = vehicle.stopX;
      vehicle.phase = 'stopped';

    });

    this.unlockRescueAchievement();
  }

  /** Schaltet die Fahrer-Trophäe frei, wenn das Auto die CTA-Bühne ohne Kollision verlässt. */
  private unlockDriverAchievement(): void {
    if (this.carHadAccident || this.driverAchievementUnlocked || this.accessibility.reducesMotion()) {
      return;
    }

    this.driverAchievementUnlocked = true;
    this.zone.run(/** Schaltet die Fahrer-Trophäe frei, wenn das Auto die CTA-Bühne ohne Kollision verlässt. */() => this.achievementService.unlock('skilled-driver'));
  }

  /** Schaltet die Rettungsgassen-Trophäe frei, sobald der Krankenwagen am Ende des Staus steht. */
  private unlockRescueAchievement(): void {
    if (this.rescueAchievementUnlocked || this.accessibility.reducesMotion()) {
      return;
    }

    const ambulanceIndex = this.trafficVehicles.findIndex(/** Schaltet die Rettungsgassen-Trophäe frei, sobald der Krankenwagen am Ende des Staus steht. */(vehicle) => vehicle.kind === 'ambulance');           // Index des Rettungswagens in der Fahrzeugfolge.
    const ambulance = this.trafficVehicles[ambulanceIndex];                                                                                                                                                       // Rettungswagen innerhalb der Simulation.
    const queueAheadStopped = ambulanceIndex > 0 && this.trafficVehicles.slice(0, ambulanceIndex).every(/** Prüft die Bedingung für jeden Suchbegriff oder Eintrag. */(vehicle) => vehicle.phase === 'stopped'); // Vor dem Rettungswagen ist die Warteschlange angehalten.

    if (!ambulance || ambulance.phase !== 'stopped' || !queueAheadStopped) {
      return;
    }

    this.rescueAchievementUnlocked = true;
    this.zone.run(/** Schaltet die Rettungsgassen-Trophäe frei, sobald der Krankenwagen am Ende des Staus steht. */() => this.achievementService.unlock('rescue-lane-404'));
  }

  /** Überträgt den Simulationszustand in CSS-Styles. */
  private publishStyles(): void {
    this.blockStyles.set(this.blocks.map(/** Überführt die Physikposition des Blocks in CSS-Werte. */(block) => ({
      width: `${block.width}px`,
      height: `${block.height}px`,
      transform: `translate3d(${block.x}px, ${block.y}px, 0) rotate(${block.rotation}deg)`,
    })));

    this.carPhase.set(this.car.phase);
    this.carStyle.set({
      opacity: this.car.phase === 'waiting' || this.car.phase === 'gone' ? '0' : '1',
      transform: `translate3d(${this.car.x}px, ${this.car.y}px, 0)`,
      width: `${this.car.width}px`,
    });

    this.trafficVehiclePhases.set(this.trafficVehicles.map(/** Liefert die aktuelle Animationsphase des Fahrzeugs. */(vehicle) => vehicle.phase));
    this.trafficVehicleStyles.set(this.trafficVehicles.map(/** Überführt Position und Bewegung des Fahrzeugs in CSS-Werte. */(vehicle) => ({
      opacity: vehicle.phase === 'waiting' ? '0' : '1',
      transform: `translate3d(${vehicle.x}px, ${vehicle.y}px, 0)`,
      width: `${vehicle.width}px`,
    })));
  }
}
