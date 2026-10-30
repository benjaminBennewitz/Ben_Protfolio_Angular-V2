/* src/app/core/services/route-scroll.service.ts */

/**
 * @file Sofortiger Scrollwechsel zwischen Portfolio-Routen.
 * @description Verhindert sichtbare Rückfahrten und Reveals an der alten Scrollposition.
 */

import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, Scroll } from '@angular/router';

/** Hält Route und Scrollposition vor der ersten Reveal-Messung zusammen. */
@Injectable({ providedIn: 'root' })
export class RouteScrollService {
  private readonly document = inject(DOCUMENT);   // Dokumentreferenz für globale DOM-Zustände.
  private readonly router = inject(Router);       // Router für Navigationsereignisse.
  private activeNavigation: number | null = null; // ID des laufenden Seitenwechsels oder null.
  private stopAnchorTracking: (() => void) | null = null; // Entfernt Layout-Beobachtung nach Ankersprüngen.
  private frame: number | null = null;            // Geplante Freigabe nach dem Layout oder null.

  /** Koordiniert Seitenwechsel und stabile Ankersprünge unabhängig von Scroll-Snap. */
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(/** Verarbeitet den aktuellen Schritt des Routenwechsels. */(event) => {
      if (event instanceof NavigationStart) {
        this.stopAnchorTracking?.();
        if (this.path(event.url) === this.path(this.router.url) && this.activeNavigation === null) return;
        this.cancelFrame();
        this.activeNavigation = event.id;
        this.document.documentElement.classList.add('bp-route-scroll-reset');
        this.resetPosition();
      } else if (event instanceof NavigationEnd && this.activeNavigation === event.id) {
        // Auch nach dem Austausch der View darf keine alte Scrollposition übrig bleiben.
        this.resetPosition();
      } else if (event instanceof Scroll && event.anchor) {
        const target = this.document.getElementById(event.anchor);
        if (target) {
          this.document.documentElement.classList.add('bp-route-scroll-reset');
          target.scrollIntoView({ behavior: 'instant', block: 'start' });
          this.trackAnchorLayout(target);
          this.releaseAfterLayout();
        } else if (this.activeNavigation === event.routerEvent.id) {
          this.releaseAfterLayout();
        }
      } else if (event instanceof Scroll && this.activeNavigation === event.routerEvent.id) {
        // Angular hat jetzt auch ein mögliches Fragment angesprungen. Die Sperre bleibt
        // noch über den nächsten Layout-Frame aktiv, einschließlich später Scroll-Events.
        this.releaseAfterLayout();
      } else if ((event instanceof NavigationCancel || event instanceof NavigationError) && this.activeNavigation === event.id) {
        this.release();
      }
    });
    inject(DestroyRef).onDestroy(/** Entfernt registrierte Listener und noch ausstehende Browser-Aufgaben. */() => {
      this.stopAnchorTracking?.();
      this.cancelFrame();
      this.document.documentElement.classList.remove('bp-route-scroll-reset');
    });
  }

  /** Hält das Ankerziel auch bei nachgeladenen Abschnitten stabil, bis der Nutzer eingreift. */
  private trackAnchorLayout(target: HTMLElement): void {
    this.stopAnchorTracking?.();
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(/** Korrigiert das Ziel nach Größenänderungen nachgeladener Abschnitte. */() => {
      if (!target.isConnected) { this.stopAnchorTracking?.(); return; }
      this.document.documentElement.classList.add('bp-route-scroll-reset');
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      this.releaseAfterLayout();
    });
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    const stop = /** Übergibt die Scrollsteuerung bei der ersten Eingabe an den Nutzer. */() => {
      observer.disconnect();
      events.forEach(event => this.document.removeEventListener(event, stop, true));
      this.stopAnchorTracking = null;
    };
    this.stopAnchorTracking = stop;
    events.forEach(event => this.document.addEventListener(event, stop, { capture: true, passive: true }));
    observer.observe(this.document.body);
  }

  /** Vergleicht den Routenpfad unabhängig von Query-Parametern und Fragmenten. */
  private path(url: string): string {

    const tree = this.router.parseUrl(url); // Routenbaum ohne Query-Parameter und Fragment für den Vergleich.

    tree.queryParams = {};
    tree.fragment = null;
    return this.router.serializeUrl(tree);
  }

  /** Das explizite instant ignoriert auch ein globales scroll-behavior: smooth. */
  private resetPosition(): void {
    this.document.defaultView?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  /** Gibt Reveals erst nach der Router-Scrollposition und einem vollständigen Layout frei. */
  private releaseAfterLayout(): void {

    const view = this.document.defaultView; // Browserfenster des aktuellen Dokuments.

    if (!view) { this.release(); return; }
    this.cancelFrame();
    this.frame = view.requestAnimationFrame(/** Gibt die Scrollsperre nach dem nächsten Layout-Schritt frei. */() => {
      this.frame = view.requestAnimationFrame(/** Gibt die Scrollsperre nach dem nächsten Layout-Schritt frei. */() => this.release());
    });
  }

  /** Entfernt nur die temporäre Routing-Sperre und fordert eine neue Reveal-Messung an. */
  private release(): void {
    this.cancelFrame();
    this.activeNavigation = null;
    this.document.documentElement.classList.remove('bp-route-scroll-reset');
    this.document.dispatchEvent(new Event('bp:route-scroll-ready'));
  }

  /** Verwirft Freigaben, die durch einen schnelleren Routenwechsel überholt wurden. */
  private cancelFrame(): void {
    if (this.frame !== null) this.document.defaultView?.cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}
