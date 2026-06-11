/* src/app/shared/reveal-on-scroll.directive.ts */

/**
 * @file Scroll-Reveal-Direktive.
 * @description Aktiviert ein sichtbares CSS-State erst nach einer stabilen, lesbaren Scroll-Snap-Position.
 */

import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/** Fügt Elementen eine robuste Reveal-Animation beim Scrollen hinzu. */
@Directive({
  selector: '[bpReveal]',
  standalone: true,
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  /** Referenz auf das hostende DOM-Element. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Merkt, ob die Animation bereits final gestartet wurde. */
  private hasRevealed = false;

  /** Aktiver Animation-Frame für gedrosselte Sichtbarkeitsmessungen. */
  private frameId: number | null = null;

  /** Entfernt registrierte Browser-Listener wieder gesammelt. */
  private cleanupListeners?: () => void;

  /** Aktive Timer für stabile Scroll-/Snap-Nachprüfungen. */
  private readonly settledCheckTimers: number[] = [];

  /** Initialisiert die Scroll-Prüfung und setzt den Ausgangszustand. */
  ngAfterViewInit(): void {
    const element = this.elementRef.nativeElement;

    element.classList.add('bp-reveal');

    if (typeof window === 'undefined') {
      this.reveal(element);
      return;
    }

    if (this.shouldSkipMotion()) {
      this.reveal(element);
      return;
    }

    this.bindVisibilityCheck(element);
  }

  /** Räumt Animation-Frame, Timer und Listener beim Entfernen des Elements auf. */
  ngOnDestroy(): void {
    if (this.frameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.frameId);
    }

    this.clearSettledCheckTimers();
    this.cleanupListeners?.();
  }

  /** Registriert eine richtungsunabhängige Sichtbarkeitsprüfung. */
  private bindVisibilityCheck(element: HTMLElement): void {
    const requestImmediateCheck = (): void => this.requestVisibilityFrame(element);
    const requestSettledCheck = (): void => this.queueSettledVisibilityChecks(element);

    window.addEventListener('scroll', requestSettledCheck, { passive: true });
    window.addEventListener('resize', requestImmediateCheck, { passive: true });
    window.addEventListener('scrollend', requestImmediateCheck, { passive: true });

    this.cleanupListeners = () => {
      window.removeEventListener('scroll', requestSettledCheck);
      window.removeEventListener('resize', requestImmediateCheck);
      window.removeEventListener('scrollend', requestImmediateCheck);
    };

    this.requestVisibilityFrame(element);
    this.queueSettledVisibilityChecks(element);
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

  /** Startet den Reveal erst, wenn das Element sichtbar im Lesebereich angekommen ist. */
  private revealWhenReadable(element: HTMLElement): void {
    if (this.hasRevealed || !this.elementIsInRevealZone(element)) {
      return;
    }

    this.reveal(element);
  }

  /** Prüft eine stabile Aktivierungszone, damit Scroll-Snap die Animation nicht vorab verbraucht. */
  private elementIsInRevealZone(element: HTMLElement): boolean {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const section = this.closestScrollableSection(element);

    if (section && this.sectionIsViewportSized(section, viewportHeight)) {
      return this.sectionIsReadable(section, element, viewportHeight);
    }

    return this.elementIsReadable(element, viewportHeight);
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
    const contentHeight = section.scrollHeight;
    const contentFitsViewport = contentHeight <= viewportHeight * 1.06;
    const isSingleScreenSection = rect.height <= viewportHeight * 1.48 && contentFitsViewport;
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

  /** Startet Reveals in Snap-Sections erst nach der finalen Leseposition. */
  private sectionIsReadable(section: HTMLElement, element: HTMLElement, viewportHeight: number): boolean {
    if (!this.sectionUsesSnapBand(section, viewportHeight)) {
      return this.elementIsReadable(element, viewportHeight);
    }

    return this.sectionIsNearSnapPosition(section, viewportHeight) && this.elementIsReadableInsideSection(element, viewportHeight);
  }

  /** Prüft, ob das Element innerhalb einer eingerasteten Section sichtbar genug liegt. */
  private elementIsReadableInsideSection(element: HTMLElement, viewportHeight: number): boolean {
    const rect = element.getBoundingClientRect();

    return rect.bottom >= viewportHeight * 0.12 && rect.top <= viewportHeight * 0.9;
  }

  /** Prüft einzelne Elemente ohne Fullscreen-Snap-Kontext. */
  private elementIsReadable(element: HTMLElement, viewportHeight: number): boolean {
    const rect = element.getBoundingClientRect();
    const activationOffset = Math.min(Math.max(rect.height * 0.28, 58), 180);
    const activationPoint = rect.top + activationOffset;
    const lowerRevealLine = viewportHeight * 0.72;
    const upperRevealLine = viewportHeight * -0.08;
    const hasReadableOverlap = rect.bottom >= viewportHeight * 0.12 && rect.top <= viewportHeight * 0.82;

    return hasReadableOverlap && activationPoint <= lowerRevealLine && activationPoint >= upperRevealLine;
  }

  /** Schaltet ein Element sichtbar und entfernt danach alle Listener. */
  private reveal(element: HTMLElement): void {
    this.hasRevealed = true;
    element.classList.add('bp-reveal--visible');
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
