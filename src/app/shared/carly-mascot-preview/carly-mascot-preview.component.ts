/**
 * @file Animierte Carly-Vollkörperansicht für die Portfolio-Case-Study.
 * @description Übernimmt die produktive SVG-Layer-Logik aus Carly Managed für Blickbewegung, Blinzeln und zufälliges Schwanzwedeln.
 */

import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  signal,
  viewChild,
} from '@angular/core';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const CARLY_ASSET_URL = '/assets/images/projects/carly-managed/carly.svg';
const POINTER_IDLE_BEFORE_RANDOM_MS = 1_700;
const TAIL_KEYFRAME_COUNT = 11;
const TAIL_TWEEN_FRAME_COUNT = 3;
const TAIL_FRAME_DURATION_MS = 28;
const TAIL_IDLE_MIN_MS = 4_500;
const TAIL_IDLE_MAX_MS = 11_500;

let carlySvgSourcePromise: Promise<string> | null = null;

type CarlyEyeMode = 'open' | 'half' | 'closed';

/** Erstellt die originale Abspielreihenfolge aus Carlys Illustrator-Keyframes. */
function createTailFrameIds(): string[] {
  const frameIds: string[] = [];

  for (let frame = 1; frame <= TAIL_KEYFRAME_COUNT; frame += 1) {
    const current = `KF${String(frame).padStart(2, '0')}`;
    frameIds.push(current);

    if (frame === TAIL_KEYFRAME_COUNT) continue;

    for (let tween = 1; tween <= TAIL_TWEEN_FRAME_COUNT; tween += 1) {
      frameIds.push(`${current}-T${String(tween).padStart(2, '0')}`);
    }
  }

  return frameIds;
}

const TAIL_FRAME_IDS = createTailFrameIds();

/** Lädt Carlys lokales SVG nur einmal und nutzt anschließend den Browser-Cache. */
function loadCarlySvgSource(): Promise<string> {
  if (!carlySvgSourcePromise) {
    carlySvgSourcePromise = fetch(CARLY_ASSET_URL).then((response) => {
      if (!response.ok) {
        throw new Error(`Carly-Asset konnte nicht geladen werden: ${response.status}`);
      }

      return response.text();
    });
  }

  return carlySvgSourcePromise;
}

/** Rendert Carlys produktives SVG als sitzende Figur mit echter Idle-Animation. */
@Component({
  selector: 'bp-carly-mascot-preview',
  standalone: true,
  templateUrl: './carly-mascot-preview.component.html',
  styleUrl: './carly-mascot-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarlyMascotPreviewComponent {
  /** Gibt an, ob das lokale SVG nicht geladen werden konnte. */
  protected readonly assetFailed = signal(false);

  /** Hostelement, in das die bereinigte SVG-Struktur übernommen wird. */
  private readonly svgHost = viewChild<ElementRef<HTMLElement>>('svgHost');

  /** Aktuell injizierte SVG-Struktur. */
  private svgElement: SVGSVGElement | null = null;

  /** Ursprüngliche ViewBox als technischer Fallback. */
  private originalViewBox = '0 0 351.144 571.7211';

  /** Geplante Ausdruckswechsel für Blinzel-Sequenzen. */
  private expressionTimers: number[] = [];

  /** Timer für zufälliges Blinzeln. */
  private blinkTimer: number | null = null;

  /** Timer für zufällige Blickrichtungen. */
  private gazeTimer: number | null = null;

  /** Animation-Frame für gedrosseltes Cursor-Tracking. */
  private pointerFrame: number | null = null;

  /** Timer für die nächste zufällige Schwanzbewegung. */
  private tailIdleTimer: number | null = null;

  /** Animation-Frame der aktuell laufenden Schwanzbewegung. */
  private tailFrameRequest: number | null = null;

  /** Aktueller Index innerhalb der Schwanz-Keyframes. */
  private currentTailFrame = 0;

  /** Geordnete Original- und Tween-Frames des Carly-Assets. */
  private readonly tailFrameIds = [...TAIL_FRAME_IDS];

  /** Letzter Pointer-Zeitpunkt, damit zufällige Blicke nicht mit Cursor-Tracking kollidieren. */
  private lastPointerAt = 0;

  constructor(destroyRef: DestroyRef) {
    const handlePointerMove = (event: PointerEvent): void => this.handlePointerMove(event);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    afterNextRender(() => {
      void this.loadSvg();
    });

    destroyRef.onDestroy(() => {
      window.removeEventListener('pointermove', handlePointerMove);
      this.clearExpressionTimers();
      this.stopIdleAnimations();

      if (this.pointerFrame !== null) {
        window.cancelAnimationFrame(this.pointerFrame);
      }

      this.stopTailAnimation();
    });
  }

  /** Lädt, bereinigt und initialisiert Carlys SVG-Struktur. */
  private async loadSvg(): Promise<void> {
    const host = this.svgHost()?.nativeElement;
    if (!host) return;

    try {
      const source = await loadCarlySvgSource();
      const documentValue = new DOMParser().parseFromString(source, 'image/svg+xml');
      const parsedSvg = documentValue.documentElement;

      if (parsedSvg.tagName.toLowerCase() !== 'svg') {
        throw new Error('Carly-Asset enthält kein gültiges SVG-Wurzelelement.');
      }

      this.sanitizeSvg(parsedSvg);
      const svg = document.importNode(parsedSvg, true) as unknown as SVGSVGElement;
      this.originalViewBox = svg.getAttribute('viewBox') ?? this.originalViewBox;
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.display = 'block';
      svg.style.width = '100%';
      svg.style.height = 'auto';

      this.prepareGazeGroups(svg);
      this.svgElement = svg;
      host.replaceChildren(svg);
      this.normalizeEyeHighlights(svg);
      this.configureFullViewBox();
      this.initializeVisibility();
      this.scheduleRandomGaze();
      this.scheduleRandomBlink();
      this.scheduleRandomTailWag();
    } catch (error) {
      console.error(error);
      this.assetFailed.set(true);
    }
  }

  /** Entfernt ausführbare oder externe Inhalte aus dem lokal geladenen SVG. */
  private sanitizeSvg(svg: Element): void {
    svg.querySelectorAll('script, foreignObject').forEach((element) => element.remove());

    svg.querySelectorAll('*').forEach((element) => {
      Array.from(element.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim();

        if (name.startsWith('on')) {
          element.removeAttribute(attribute.name);
          return;
        }

        if ((name === 'href' || name === 'xlink:href') && !value.startsWith('#')) {
          element.removeAttribute(attribute.name);
        }
      });
    });
  }

  /** Richtet die Lichtreflexe beider Augen auf dieselbe gedachte Lichtquelle aus. */
  private normalizeEyeHighlights(svg: SVGSVGElement): void {
    this.mirrorRightEyeHighlight(svg, 'eye-right', 'normal-pupil-right', 'normal-highlight-right');
    this.mirrorRightEyeHighlight(svg, 'eye-right-half-open', 'pupil-right-ho', 'highlight-right-ho');
  }

  /** Spiegelt einen rechten Lichtreflex um die vertikale Achse seiner Pupille. */
  private mirrorRightEyeHighlight(
    svg: SVGSVGElement,
    eyeGroupId: string,
    pupilId: string,
    highlightId: string,
  ): void {
    const eyeGroup = svg.querySelector<SVGGraphicsElement>(`#${eyeGroupId}`);
    const pupil = svg.querySelector<SVGGraphicsElement>(`#${pupilId}`);
    const highlight = svg.querySelector<SVGGraphicsElement>(`#${highlightId}`);

    if (!eyeGroup || !pupil || !highlight || !highlight.parentNode) return;

    const previousDisplay = eyeGroup.style.display;
    eyeGroup.style.display = 'inline';

    try {
      const pupilBox = pupil.getBBox();
      const pupilCenterX = pupilBox.x + pupilBox.width / 2;
      const correction = document.createElementNS(SVG_NAMESPACE, 'g');

      correction.id = `${highlightId}-light-direction`;
      correction.setAttribute('transform', `matrix(-1 0 0 1 ${2 * pupilCenterX} 0)`);
      highlight.parentNode.insertBefore(correction, highlight);
      correction.appendChild(highlight);
    } catch {
      // Ein fehlender SVG-Messwert darf Carlys Darstellung nicht blockieren.
    } finally {
      eyeGroup.style.display = previousDisplay;
    }
  }

  /** Erstellt bewegliche Blickgruppen aus Pupille und zugehörigem Lichtreflex. */
  private prepareGazeGroups(svg: SVGSVGElement): void {
    this.createGazeGroup(svg, 'gaze-left-normal', ['normal-pupil-left', 'normal-highlight-left'], 'normal-iris-left');
    this.createGazeGroup(svg, 'gaze-right-normal', ['normal-pupil-right', 'normal-highlight-right'], 'normal-iris-right');
    this.createGazeGroup(svg, 'gaze-left-half', ['pupil-left-ho', 'highlight-left-ho'], 'iris-left-ho');
    this.createGazeGroup(svg, 'gaze-right-half', ['pupil-right-ho', 'highlight-right-ho'], 'iris-right-ho');
  }

  /** Fasst vorhandene SVG-Elemente in einer transformierbaren Gruppe zusammen. */
  private createGazeGroup(
    svg: SVGSVGElement,
    groupId: string,
    childIds: string[],
    clipSourceId: string,
  ): void {
    const children = childIds
      .map((id) => svg.querySelector<SVGGraphicsElement>(`#${id}`))
      .filter((element): element is SVGGraphicsElement => element !== null);

    if (children.length === 0) return;

    const parent = children[0].parentNode;
    if (!parent) return;

    const group = document.createElementNS(SVG_NAMESPACE, 'g');
    group.id = groupId;
    group.style.transformBox = 'fill-box';
    group.style.transformOrigin = 'center';
    parent.insertBefore(group, children[0]);

    children.forEach((child) => group.appendChild(child));
    this.applyGazeClip(svg, group, clipSourceId);
  }

  /** Begrenzt die beweglichen Augenbestandteile auf die gezeichnete Augenfläche. */
  private applyGazeClip(svg: SVGSVGElement, group: SVGGElement, clipSourceId: string): void {
    const source = svg.querySelector<SVGGraphicsElement>(`#${clipSourceId}`);
    const defs = svg.querySelector<SVGDefsElement>('defs');
    if (!source || !defs) return;

    const clipPath = document.createElementNS(SVG_NAMESPACE, 'clipPath');
    const clipId = `${group.id}-clip`;
    const shape = source.cloneNode(true) as SVGGraphicsElement;
    shape.removeAttribute('id');
    clipPath.id = clipId;
    clipPath.appendChild(shape);
    defs.appendChild(clipPath);
    group.setAttribute('clip-path', `url(#${clipId})`);
  }

  /** Zeigt Carly wie auf ihrer Produktseite als vollständige sitzende Figur. */
  private configureFullViewBox(): void {
    const svg = this.svgElement;
    if (!svg) return;

    svg.setAttribute('viewBox', this.originalViewBox);
  }

  /** Aktiviert den normalen Wachzustand mit Körper und ruhendem Schwanz-Frame. */
  private initializeVisibility(): void {
    this.setVisible('_02_BODY', true);
    this.setVisible('_03_TAIL', true);
    this.setVisible('KEYFRAMES', true);
    this.setEyeMode('open');
    this.setMouthIdle();
    this.setGaze(0, 0);
    this.showTailRestFrame();
  }

  /** Plant ein natürlich unregelmäßiges Blinzeln für den Idle-Zustand. */
  private scheduleRandomBlink(): void {
    if (this.blinkTimer !== null || this.isMotionReduced()) return;

    this.blinkTimer = window.setTimeout(
      () => {
        this.blinkTimer = null;

        if (!this.canIdleAnimate()) {
          this.scheduleRandomBlink();
          return;
        }

        const doubleBlink = Math.random() < 0.22;
        this.setEyeMode('half');
        this.queueExpression(65, () => this.setEyeMode('closed'));
        this.queueExpression(125, () => this.setEyeMode('open'));

        if (doubleBlink) {
          this.queueExpression(245, () => this.setEyeMode('half'));
          this.queueExpression(305, () => this.setEyeMode('closed'));
          this.queueExpression(365, () => this.setEyeMode('open'));
        }

        this.queueExpression(doubleBlink ? 440 : 200, () => this.scheduleRandomBlink());
      },
      3_000 + Math.random() * 4_500,
    );
  }

  /** Plant zufällige Blickrichtungen ohne festes Wiederholungsmuster. */
  private scheduleRandomGaze(): void {
    if (this.gazeTimer !== null || this.isMotionReduced()) return;

    this.gazeTimer = window.setTimeout(
      () => {
        this.gazeTimer = null;

        if (!this.canIdleAnimate()) {
          this.scheduleRandomGaze();
          return;
        }

        if (Date.now() - this.lastPointerAt < POINTER_IDLE_BEFORE_RANDOM_MS) {
          this.scheduleRandomGaze();
          return;
        }

        const centered = Math.random() < 0.18;
        const x = centered ? 0 : Math.max(-1, Math.min(1, (Math.random() - 0.5) * 2.15));
        const y = centered ? 0 : Math.max(-0.75, Math.min(0.65, (Math.random() - 0.5) * 1.55));
        this.setGaze(x, y);
        this.scheduleRandomGaze();
      },
      1_150 + Math.random() * 2_900,
    );
  }

  /** Lässt Carly wie in der Produktiv-App in Richtung des Mauszeigers schauen. */
  private handlePointerMove(event: PointerEvent): void {
    if (this.isMotionReduced() || !this.canIdleAnimate()) return;

    this.lastPointerAt = Date.now();
    if (this.pointerFrame !== null) return;

    this.pointerFrame = window.requestAnimationFrame(() => {
      this.pointerFrame = null;
      const host = this.svgHost()?.nativeElement;
      if (!host) return;

      const noseFocus = this.getCrossEyedNoseFocus(event.clientX, event.clientY);
      if (noseFocus) {
        this.setGaze(...noseFocus);
        return;
      }

      const rect = host.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.48;
      const x = Math.max(-1, Math.min(1, (event.clientX - centerX) / Math.max(rect.width * 1.4, 1)));
      const y = Math.max(-0.8, Math.min(0.8, (event.clientY - centerY) / Math.max(rect.height * 1.5, 1)));
      this.setGaze(x, y);
    });
  }

  /** Lässt beide Pupillen gezielt auf den Cursor an Carlys Nasenspitze schauen. */
  private getCrossEyedNoseFocus(clientX: number, clientY: number): [number, number, number, number] | null {
    const nose =
      this.svgElement?.querySelector<SVGGraphicsElement>('#nose') ??
      this.svgElement?.querySelector<SVGGraphicsElement>('#nose-base');
    const leftEye = this.svgElement?.querySelector<SVGGraphicsElement>('#eye-left');
    const rightEye = this.svgElement?.querySelector<SVGGraphicsElement>('#eye-right');

    if (!nose || !leftEye || !rightEye) return null;

    const noseBox = nose.getBoundingClientRect();
    const noseX = noseBox.left + noseBox.width / 2;
    const noseY = noseBox.top + noseBox.height / 2;
    const radius = Math.max(noseBox.width, noseBox.height) * 4.8;

    if (Math.hypot(clientX - noseX, clientY - noseY) > radius) return null;

    const getDirection = (element: SVGGraphicsElement): [number, number] => {
      const box = element.getBoundingClientRect();
      const eyeX = box.left + box.width / 2;
      const eyeY = box.top + box.height / 2;
      const deltaX = clientX - eyeX;
      const deltaY = clientY - eyeY;
      const length = Math.max(Math.hypot(deltaX, deltaY), 1);
      const verticalFocus = Math.max(0.72, Math.min(1.2, (deltaY / length) * 1.35));

      return [
        Math.max(-1, Math.min(1, (deltaX / length) * 0.92)),
        verticalFocus,
      ];
    };

    const [leftX, leftY] = getDirection(leftEye);
    const [rightX, rightY] = getDirection(rightEye);

    return [leftX, leftY, rightX, rightY];
  }

  /** Setzt die Blickrichtung beider Augen. */
  private setGaze(leftX: number, leftY: number, rightX = leftX, rightY = leftY): void {
    const maxX = 4.2;
    const getVerticalOffset = (value: number): number => value * (value > 0 ? 2.65 : 3.1);

    this.transformGazeGroup('gaze-left-normal', leftX * maxX, getVerticalOffset(leftY));
    this.transformGazeGroup('gaze-right-normal', rightX * maxX, getVerticalOffset(rightY));
    this.transformGazeGroup('gaze-left-half', leftX * maxX, getVerticalOffset(leftY));
    this.transformGazeGroup('gaze-right-half', rightX * maxX, getVerticalOffset(rightY));
  }

  /** Verschiebt Pupille und Lichtreflex gemeinsam weich innerhalb des Auges. */
  private transformGazeGroup(id: string, x: number, y: number): void {
    const group = this.svgElement?.querySelector<SVGGElement>(`#${id}`);
    if (!group) return;

    group.style.transition = this.isMotionReduced()
      ? 'none'
      : 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)';
    group.style.transform = `translate(${x}px, ${y}px)`;
  }

  /** Aktiviert genau eine der vorbereiteten Augenvarianten. */
  private setEyeMode(mode: CarlyEyeMode): void {
    this.setVisible('eye-left', mode === 'open');
    this.setVisible('eye-right', mode === 'open');
    this.setVisible('eye-left-half-open', mode === 'half');
    this.setVisible('eye-right-half-open', mode === 'half');
    this.setVisible('eye-left-closed-grp', mode === 'closed');
    this.setVisible('eye-right-closed-grp', mode === 'closed');
  }

  /** Aktiviert Carlys neutrale Mundform. */
  private setMouthIdle(): void {
    this.setVisible('mouth-idle', true);
    this.setVisible('mouth-smile-soft', false);
    this.setVisible('mouth-half-open', false);
    this.setVisible('mouth-open', false);
    this.setVisible('mouth-sleep', false);
  }

  /** Prüft, ob Carly gerade frei für Idle-Blick und Blinzeln ist. */
  private canIdleAnimate(): boolean {
    return this.svgElement !== null && !this.isMotionReduced();
  }

  /** Plant Carlys originale, bewusst unregelmäßige Idle-Schwanzbewegung. */
  private scheduleRandomTailWag(): void {
    if (this.tailIdleTimer !== null || this.tailFrameRequest !== null || !this.canIdleAnimate()) return;

    const delay = TAIL_IDLE_MIN_MS + Math.random() * (TAIL_IDLE_MAX_MS - TAIL_IDLE_MIN_MS);
    this.tailIdleTimer = window.setTimeout(() => {
      this.tailIdleTimer = null;

      if (!this.canIdleAnimate()) return;
      this.playTailWag();
    }, delay);
  }

  /** Spielt Carlys vollständigen Vektor-Keyframe-Durchlauf ab. */
  private playTailWag(): void {
    if (!this.canIdleAnimate()) return;

    this.currentTailFrame = 0;
    this.setVisible('tail-master', false);
    this.showTailFrame(this.currentTailFrame);

    const startedAt = performance.now();
    const frameDurations = this.tailFrameIds.map((_, index) => this.getTailFrameDuration(index));
    const frameEnds = frameDurations.reduce<number[]>((ends, duration) => {
      ends.push((ends[ends.length - 1] ?? 0) + duration);
      return ends;
    }, []);
    const totalDuration = frameEnds[frameEnds.length - 1] ?? 0;

    const advance = (timestamp: number): void => {
      if (!this.canIdleAnimate()) {
        this.stopTailAnimation();
        this.showTailRestFrame();
        return;
      }

      const elapsed = timestamp - startedAt;
      const frame = Math.min(
        this.tailFrameIds.length - 1,
        Math.max(0, frameEnds.findIndex((end) => elapsed < end)),
      );

      if (frame !== this.currentTailFrame) {
        this.currentTailFrame = frame;
        this.showTailFrame(frame);
      }

      if (elapsed >= totalDuration) {
        this.tailFrameRequest = null;
        this.showTailRestFrame();
        this.scheduleRandomTailWag();
        return;
      }

      this.tailFrameRequest = window.requestAnimationFrame(advance);
    };

    this.tailFrameRequest = window.requestAnimationFrame(advance);
  }

  /** Verlangsamt die letzten Keyframes wie in Carly Managed für ein weiches Auslaufen. */
  private getTailFrameDuration(frameIndex: number): number {
    const id = this.tailFrameIds[frameIndex] ?? '';

    if (id === 'KF11') return 120;
    if (id.startsWith('KF10')) return 44;
    if (id.startsWith('KF09')) return 36;

    return TAIL_FRAME_DURATION_MS;
  }

  /** Nutzt den ersten gezeichneten Frame als stabile Ruhepose. */
  private showTailRestFrame(): void {
    this.setVisible('tail-master', false);
    this.showTailFrame(0);
  }

  /** Zeigt genau einen Schwanz-Keyframe. */
  private showTailFrame(frameIndex: number): void {
    const visibleId = this.tailFrameIds[frameIndex];
    this.tailFrameIds.forEach((id) => this.setVisible(id, id === visibleId));
  }

  /** Stoppt geplante und laufende Schwanzbewegungen. */
  private stopTailAnimation(): void {
    if (this.tailIdleTimer !== null) {
      window.clearTimeout(this.tailIdleTimer);
      this.tailIdleTimer = null;
    }

    if (this.tailFrameRequest !== null) {
      window.cancelAnimationFrame(this.tailFrameRequest);
      this.tailFrameRequest = null;
    }

    this.tailFrameIds.forEach((id) => this.setVisible(id, false));
  }

  /** Berücksichtigt globale Motion-Settings und die Betriebssystempräferenz. */
  private isMotionReduced(): boolean {
    const root = document.documentElement;
    const motion = root.dataset['motion'];

    return (
      motion === 'reduced' ||
      motion === 'off' ||
      root.dataset['neuro'] === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /** Stoppt die zufälligen Idle-Abläufe. */
  private stopIdleAnimations(): void {
    if (this.blinkTimer !== null) {
      window.clearTimeout(this.blinkTimer);
      this.blinkTimer = null;
    }

    if (this.gazeTimer !== null) {
      window.clearTimeout(this.gazeTimer);
      this.gazeTimer = null;
    }
  }

  /** Entfernt alle geplanten Übergangs-Timeouts. */
  private clearExpressionTimers(): void {
    this.expressionTimers.forEach((timer) => window.clearTimeout(timer));
    this.expressionTimers = [];
  }

  /** Plant einen einzelnen Schritt einer Gesichtssequenz. */
  private queueExpression(delay: number, callback: () => void): void {
    const timer = window.setTimeout(() => {
      this.expressionTimers = this.expressionTimers.filter((value) => value !== timer);
      callback();
    }, delay);

    this.expressionTimers.push(timer);
  }

  /** Ändert die Sichtbarkeit eines benannten SVG-Elements. */
  private setVisible(id: string, visible: boolean): void {
    const element = this.svgElement?.querySelector<SVGElement>(`#${id}`);
    if (!element) return;
    element.style.display = visible ? 'inline' : 'none';
  }
}
