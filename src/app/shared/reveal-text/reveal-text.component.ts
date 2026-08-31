/* src/app/shared/reveal-text/reveal-text.component.ts */

/**
 * @file Wiederverwendbare Text-Reveal-Komponente.
 * @description Teilt Text in Wörter und startet die Reveal-Animation erst nach einer stabilen, lesbaren Scroll-Snap-Position.
 */

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, inject, signal } from '@angular/core';

/** Einzelnes Wort mit globalem Animationsindex. */
interface RevealWord {
  /** Sichtbarer Wortinhalt. */
  readonly text: string;

  /** Fortlaufender Index für die Delay-Berechnung. */
  readonly index: number;
}

/** Einzelne Textzeile der Reveal-Headline. */
type RevealLine = readonly RevealWord[];

/** Rendert animierte Headlines mit gestaffelten Wort-Reveals. */
@Component({
  selector: 'bp-reveal-text',
  standalone: true,
  templateUrl: './reveal-text.component.html',
  styleUrl: './reveal-text.component.scss',
})
export class RevealTextComponent implements AfterViewInit, OnDestroy {
  /** Host-Element für die richtungsunabhängige Viewport-Erkennung. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Merkt, ob die Textanimation bereits gestartet wurde. */
  private hasRevealed = false;

  /** Aktiver Animation-Frame für gedrosselte Sichtbarkeitsmessungen. */
  private frameId: number | null = null;

  /** Entfernt registrierte Browser-Listener wieder gesammelt. */
  private cleanupListeners?: () => void;

  /** Aktive Timer für stabile Scroll-/Snap-Nachprüfungen. */
  private readonly settledCheckTimers: number[] = [];

  /** Optionales Eyebrow-Label über dem Titel. */
  @Input() eyebrow = '';

  /** Zu animierender Titeltext. */
  @Input({ required: true }) text = '';

  /** Überschriftenebene als CSS-Variante. */
  @Input() size: 'hero' | 'section' = 'section';

  /** Semantische Überschriftenebene. */
  @Input() level: 'h1' | 'h2' | 'h3' = 'h2';

  /** Zusätzliche Klassen für projektspezifische Titelgrößen. */
  @Input() headingClass = '';

  /** Markiert, ob die Textanimation gestartet werden darf. */
  protected readonly isVisible = signal(false);

  /** Initialisiert die Sichtbarkeitsprüfung nach dem Rendern. */
  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;

    if (typeof window === 'undefined') {
      this.reveal();
      return;
    }

    if (this.shouldSkipMotion()) {
      this.reveal();
      return;
    }

    this.bindVisibilityCheck(element);
  }

  /** Räumt Animation-Frame, Timer und Listener beim Entfernen der Komponente auf. */
  ngOnDestroy(): void {
    if (this.frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.frameId);
    }

    this.clearSettledCheckTimers();
    this.cleanupListeners?.();
  }

  /** Liefert die Zeilen und Wörter für die Reveal-Animation. */
  get wordLines(): readonly RevealLine[] {
    let index = 0;

    return this.text
      .split(/\r?\n|<br\s*\/?>/gi)
      .map((line) => line.split(/\s+/).filter(Boolean).map((word) => ({ text: word, index: index++ })))
      .filter((line) => line.length > 0);
  }

  /** Liefert den Wortabstand der Animation passend zur Titelgröße. */
  protected wordDelay(): number {
    return this.size === 'hero' ? 70 : 54;
  }

  /** Baut die Klassenliste für die eigentliche Überschrift. */
  protected headingClassList(): string {
    const sizeClass = this.size === 'section' ? 'reveal__title--section' : '';

    return ['bp-title', 'reveal__title', sizeClass, this.headingClass].filter(Boolean).join(' ');
  }

  /** Registriert eine richtungsunabhängige Sichtbarkeitsprüfung. */
  private bindVisibilityCheck(element: HTMLElement): void {
    const requestImmediateCheck = (): void => this.requestVisibilityFrame(element);
    const requestSettledCheck = (): void => this.queueSettledVisibilityChecks(element);
    const handleScroll = (): void => {
      if (this.belongsToSkillsSection(element)) {
        requestImmediateCheck();
        return;
      }

      requestSettledCheck();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', requestImmediateCheck, { passive: true });
    window.addEventListener('scrollend', requestImmediateCheck, { passive: true });

    this.cleanupListeners = () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', requestImmediateCheck);
      window.removeEventListener('scrollend', requestImmediateCheck);
    };

    this.requestVisibilityFrame(element);

    if (!this.belongsToSkillsSection(element)) {
      this.queueSettledVisibilityChecks(element);
    }
  }

  /** Plant eine gedrosselte Messung im nächsten Browser-Frame. */
  private requestVisibilityFrame(element: HTMLElement): void {
    if (this.frameId !== null || this.hasRevealed) {
      return;
    }

    this.frameId = window.requestAnimationFrame(() => {
      this.frameId = null;
      this.revealWhenReadable(element);
    });
  }

  /** Prüft nach Scroll-Snap erst nach kurzer Ruhephase erneut. */
  private queueSettledVisibilityChecks(element: HTMLElement): void {
    if (this.hasRevealed) {
      return;
    }

    this.clearSettledCheckTimers();

    for (const delay of [90, 180, 320, 520]) {
      const timer = window.setTimeout(() => this.requestVisibilityFrame(element), delay);
      this.settledCheckTimers.push(timer);
    }
  }

  /** Entfernt offene Nachprüfungen. */
  private clearSettledCheckTimers(): void {
    while (this.settledCheckTimers.length > 0) {
      const timer = this.settledCheckTimers.pop();

      if (timer !== undefined && typeof window !== 'undefined') {
        window.clearTimeout(timer);
      }
    }
  }

  /** Startet den Text-Reveal erst, wenn die Headline sichtbar im Lesebereich angekommen ist. */
  private revealWhenReadable(element: HTMLElement): void {
    if (this.hasRevealed || !this.elementIsInRevealZone(element)) {
      return;
    }

    this.reveal();
  }

  /** Prüft eine stabile Aktivierungszone, damit Scroll-Snap die Textanimation nicht vorab verbraucht. */
  private elementIsInRevealZone(element: HTMLElement): boolean {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const section = this.closestScrollableSection(element);

    if (section?.id === 'skills') {
      return this.elementIsVisibleInSkillsViewport(element, viewportHeight);
    }

    if (section && this.sectionIsViewportSized(section, viewportHeight)) {
      return this.sectionIsReadable(section, element, viewportHeight);
    }

    return this.elementIsReadable(element, viewportHeight);
  }

  /** Prüft, ob ein Reveal-Element zum langen Techstack-Bereich gehört. */
  private belongsToSkillsSection(element: HTMLElement): boolean {
    return element.closest<HTMLElement>('#skills') !== null;
  }

  /** Hält Skills-Reveals bei kontinuierlichem Scrollen in einer großzügigen Leseband-Zone erreichbar. */
  private elementIsVisibleInSkillsViewport(element: HTMLElement, viewportHeight: number): boolean {
    const rect = element.getBoundingClientRect();

    return rect.bottom >= viewportHeight * 0.08 && rect.top <= viewportHeight * 0.9;
  }

  /** Sucht den nächstgelegenen visuellen Snap-Kontext. */
  private closestScrollableSection(element: HTMLElement): HTMLElement | null {
    return element.closest<HTMLElement>('.project-stack__panel, .bp-section, .process-lock, section, bp-project-stack, bp-process-lock, bp-chaos-cta, bp-built-without');
  }

  /** Prüft, ob eine Section groß genug ist, um als eigener Snap-Kontext zu gelten. */
  private sectionIsViewportSized(section: HTMLElement, viewportHeight: number): boolean {
    const rect = section.getBoundingClientRect();

    return rect.height >= viewportHeight * 0.78;
  }

  /** Prüft, ob ein Snap-Bereich wie eine einzelne Fullscreen-Section behandelt werden soll. */
  private sectionUsesSnapBand(section: HTMLElement, viewportHeight: number): boolean {
    const rect = section.getBoundingClientRect();
    const isSingleScreenSection = rect.height <= viewportHeight * 1.48;
    const isProjectPanel = section.classList.contains('project-stack__panel');

    return isSingleScreenSection || isProjectPanel;
  }

  /** Prüft, ob die Section wirklich nahe an ihrer Snap-Endposition steht. */
  private sectionIsNearSnapPosition(section: HTMLElement, viewportHeight: number): boolean {
    const rect = section.getBoundingClientRect();
    const snapTolerance = this.sectionSnapTolerance(section, viewportHeight);

    return rect.top <= snapTolerance && rect.top >= -snapTolerance * 1.28;
  }

  /** Liefert eine sectionabhängige Toleranz für sichtbare Snap-Reveals. */
  private sectionSnapTolerance(section: HTMLElement, viewportHeight: number): number {
    if (section.id === 'about') {
      return Math.min(Math.max(viewportHeight * 0.18, 96), 172);
    }

    if (section.id === 'skills') {
      return Math.min(Math.max(viewportHeight * 0.1, 58), 118);
    }

    return Math.min(Math.max(viewportHeight * 0.075, 46), 96);
  }

  /** Startet Text-Reveals in Snap-Sections erst nach der finalen Leseposition. */
  private sectionIsReadable(section: HTMLElement, element: HTMLElement, viewportHeight: number): boolean {
    if (!this.sectionUsesSnapBand(section, viewportHeight)) {
      return this.elementIsReadable(element, viewportHeight);
    }

    return this.sectionIsNearSnapPosition(section, viewportHeight) && this.elementIsReadableInsideSection(element, viewportHeight);
  }

  /** Prüft, ob die Headline innerhalb einer eingerasteten Section sichtbar genug liegt. */
  private elementIsReadableInsideSection(element: HTMLElement, viewportHeight: number): boolean {
    const rect = element.getBoundingClientRect();

    return rect.bottom >= viewportHeight * 0.1 && rect.top <= viewportHeight * 0.88;
  }

  /** Prüft einzelne Texte ohne Fullscreen-Snap-Kontext. */
  private elementIsReadable(element: HTMLElement, viewportHeight: number): boolean {
    const rect = element.getBoundingClientRect();
    const activationOffset = Math.min(Math.max(rect.height * 0.3, 54), 170);
    const activationPoint = rect.top + activationOffset;
    const lowerRevealLine = viewportHeight * 0.7;
    const upperRevealLine = viewportHeight * -0.08;
    const hasReadableOverlap = rect.bottom >= viewportHeight * 0.1 && rect.top <= viewportHeight * 0.8;

    return hasReadableOverlap && activationPoint <= lowerRevealLine && activationPoint >= upperRevealLine;
  }

  /** Schaltet die Textanimation sichtbar und beendet alle Listener. */
  private reveal(): void {
    this.hasRevealed = true;
    this.isVisible.set(true);
    this.clearSettledCheckTimers();
    this.cleanupListeners?.();
    this.cleanupListeners = undefined;
  }

  /** Prüft, ob Motion über die Accessibility-Einstellungen bewusst reduziert wurde. */
  private shouldSkipMotion(): boolean {
    const root = document.documentElement;

    return root.dataset['motion'] === 'off' || root.dataset['motion'] === 'reduced' || root.dataset['comfort'] === 'simple';
  }
}
