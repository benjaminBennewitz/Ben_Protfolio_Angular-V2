/* src/app/core/services/reveal-observer.service.ts */

/**
 * @file Gemeinsame Freigabe für Element- und Text-Reveals.
 * @description Bewahrt den Snap-gebundenen Start und macht überscrollte Inhalte direkt lesbar.
 */

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, NgZone, effect, inject } from '@angular/core';
import { AccessibilityPreferenceService } from './accessibility-preference.service';

/** Element mit seinen einmalig freizugebenden Darstellungen. */
interface RevealTarget {
  /** Beobachteter Inhalt und sein Layoutbereich. */
  readonly element: HTMLElement;
  readonly section: HTMLElement | null;
  /** true bedeutet: direkt anzeigen, ohne eine verpasste Animation nachzuholen. */
  readonly callbacks: Set<(instant: boolean) => void>;
}

/** Verhindert frühe Reveals während des Snap-Vorgangs und unsichtbare übersprungene Inhalte. */
@Injectable({ providedIn: 'root' })
export class RevealObserverService {
  /** Dokument und vorhandene zentrale Motion-Einstellungen. */
  private readonly document = inject(DOCUMENT);
  private readonly accessibility = inject(AccessibilityPreferenceService);
  private readonly zone = inject(NgZone);
  /** Noch nicht eingeblendete Ziele. */
  private readonly targets = new Map<HTMLElement, RevealTarget>();
  /** Gemeinsame Browser-Observer und aktive Messung. */
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private frameId: number | null = null;
  /** Ein gemeinsamer Fallback, falls der Browser kein scrollend liefert. */
  private settledTimer: number | null = null;
  private scrolling = false;
  private watching = false;

  /** Gibt wartende Inhalte bei einem Motion-Wechsel frei und räumt die Anwendung auf. */
  constructor() {
    effect(() => {
      if (this.accessibility.reducesMotion() || this.accessibility.usesSimpleMode()) {
        this.finish([...this.targets.values()].map((target) => ({ target, instant: true })));
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.targets.clear();
      this.stopWatching();
    });
  }

  /**
   * Meldet einen Inhalt zur einmaligen Freigabe an.
   * @param element Beobachtetes Element.
   * @param reveal Freigabe mit Kennzeichnung übersprungener Inhalte.
   * @returns Abmeldung beim Entfernen des Elements.
   */
  observe(element: HTMLElement, reveal: (instant: boolean) => void): () => void {
    if (!this.document.defaultView || this.accessibility.reducesMotion() || this.accessibility.usesSimpleMode()) {
      reveal(true);
      return () => undefined;
    }
    const target = this.targets.get(element) ?? {
      element,
      section: element.closest<HTMLElement>('.project-stack__panel, .bp-section, .process-lock, section, bp-project-stack, bp-process-lock, bp-chaos-cta, bp-built-without'),
      callbacks: new Set<(instant: boolean) => void>(),
    };
    target.callbacks.add(reveal);
    this.targets.set(element, target);
    this.zone.runOutsideAngular(() => {
      this.startWatching();
      this.intersectionObserver?.observe(element);
      this.requestCheck();
    });
    return () => {
      if (this.targets.get(element) !== target) return;
      target.callbacks.delete(reveal);
      if (target.callbacks.size === 0) this.remove(target);
      if (this.targets.size === 0) this.stopWatching();
    };
  }

  /** Registriert die gemeinsamen Ereignisse, solange noch Ziele ausstehen. */
  private startWatching(): void {
    const view = this.document.defaultView;
    if (!view || this.watching) return;
    this.watching = true;
    view.addEventListener('scroll', this.onScroll, { passive: true });
    view.addEventListener('scrollend', this.onScrollSettled, { passive: true });
    view.addEventListener('resize', this.requestCheck, { passive: true });
    this.document.addEventListener('load', this.requestCheck, true);
    this.document.addEventListener('bp:route-scroll-ready', this.onScrollSettled);
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(this.requestCheck);
    }
    if (typeof ResizeObserver !== 'undefined' && this.document.body) {
      this.resizeObserver = new ResizeObserver(this.requestCheck);
      this.resizeObserver.observe(this.document.body);
    }
  }

  /** Wartet wie die ursprüngliche Logik auf Scrollruhe, ohne Timer pro Element anzulegen. */
  private readonly onScroll = (): void => {
    const view = this.document.defaultView;
    if (!view) return;
    this.scrolling = true;
    if (this.settledTimer !== null) view.clearTimeout(this.settledTimer);
    this.settledTimer = view.setTimeout(this.onScrollSettled, 90);
  };

  /** Prüft nach dem nativen Snap-Ende oder nach der gemeinsamen Ruhephase. */
  private readonly onScrollSettled = (): void => {
    const view = this.document.defaultView;
    if (view && this.settledTimer !== null) view.clearTimeout(this.settledTimer);
    this.settledTimer = null;
    this.scrolling = false;
    this.requestCheck();
  };

  /** Bündelt Messungen; Observer dürfen einen laufenden Scroll-/Snap-Vorgang nicht freigeben. */
  private readonly requestCheck = (): void => {
    const view = this.document.defaultView;
    if (!view || this.scrolling || this.frameId !== null || this.targets.size === 0) return;
    this.frameId = view.requestAnimationFrame(() => {
      this.frameId = null;
      if (!this.scrolling) this.checkTargets();
    });
  };

  /** Liest Layouts gesammelt und trennt reguläre Animationen von übersprungenen Inhalten. */
  private checkTargets(): void {
    if (this.document.documentElement.classList.contains('bp-route-scroll-reset')) return;
    const height = this.document.defaultView?.innerHeight ?? this.document.documentElement.clientHeight;
    const sections = new Map<HTMLElement, { rect: DOMRect; snap: boolean }>();
    const ready: { target: RevealTarget; instant: boolean }[] = [];
    for (const target of this.targets.values()) {
      if (!target.element.isConnected) { this.remove(target); continue; }
      const section = target.section;
      let context = section ? sections.get(section) : undefined;
      if (section && !context) {
        const rect = section.getBoundingClientRect();
        const snap = section.classList.contains('project-stack__panel')
          || (rect.height >= height * .78 && rect.height <= height * 1.48);
        context = { rect, snap };
        sections.set(section, context);
      }
      if (context && (context.rect.top > height || (context.rect.width === 0 && context.rect.height === 0))) continue;
      if (context && context.rect.bottom <= 0) { ready.push({ target, instant: true }); continue; }
      const rect = section === target.element && context ? context.rect : target.element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.bottom <= height * .1) { ready.push({ target, instant: true }); continue; }
      const readable = rect.bottom >= height * .12 && rect.top <= height * .9;
      if (context?.snap) {
        const tolerance = this.snapTolerance(section, height);
        if (context.rect.top < -tolerance * 1.28 && readable) ready.push({ target, instant: true });
        else if (context.rect.top <= tolerance && context.rect.top >= -tolerance * 1.28 && readable) ready.push({ target, instant: false });
      } else {
        const point = rect.top + Math.min(Math.max(rect.height * .28, 58), 180);
        if (readable && point <= height * .72) ready.push({ target, instant: point < height * -.08 });
      }
    }
    this.finish(ready);
  }

  /**
   * Bewahrt die bisherigen Toleranzen der bewusst eingerasteten Sections.
   * @param section Layoutbereich des Reveals.
   * @param height Aktuelle Viewporthöhe.
   * @returns Bisherige Pixel-Toleranz um den Snap-Punkt.
   */
  private snapTolerance(section: HTMLElement | null, height: number): number {
    if (section?.id === 'about') return Math.min(Math.max(height * .18, 96), 172);
    if (section?.id === 'skills') return Math.min(Math.max(height * .1, 58), 118);
    return Math.min(Math.max(height * .075, 46), 96);
  }

  /**
   * Schreibt Zustände erst nach Abschluss aller Layoutmessungen.
   * @param ready Regulär oder ohne Animation freizugebende Inhalte.
   */
  private finish(ready: readonly { target: RevealTarget; instant: boolean }[]): void {
    for (const { target, instant } of ready) {
      if (this.targets.get(target.element) !== target) continue;
      this.remove(target);
      for (const reveal of target.callbacks) reveal(instant);
    }
    if (this.targets.size === 0) this.stopWatching();
  }

  /**
   * Entfernt ein erledigtes oder abgemeldetes Ziel.
   * @param target Nicht mehr benötigtes Ziel.
   */
  private remove(target: RevealTarget): void {
    this.targets.delete(target.element);
    this.intersectionObserver?.unobserve(target.element);
  }

  /** Räumt Observer, Listener, Messung und Scrollruhe-Fallback gemeinsam auf. */
  private stopWatching(): void {
    const view = this.document.defaultView;
    view?.removeEventListener('scroll', this.onScroll);
    view?.removeEventListener('scrollend', this.onScrollSettled);
    view?.removeEventListener('resize', this.requestCheck);
    this.document.removeEventListener('load', this.requestCheck, true);
    this.document.removeEventListener('bp:route-scroll-ready', this.onScrollSettled);
    if (view && this.frameId !== null) view.cancelAnimationFrame(this.frameId);
    if (view && this.settledTimer !== null) view.clearTimeout(this.settledTimer);
    this.frameId = null;
    this.settledTimer = null;
    this.scrolling = false;
    this.intersectionObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.intersectionObserver = null;
    this.resizeObserver = null;
    this.watching = false;
  }
}
