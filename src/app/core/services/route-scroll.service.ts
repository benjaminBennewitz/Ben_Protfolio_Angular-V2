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
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private activeNavigation: number | null = null;
  private frame: number | null = null;

  /** Begleitet nur Seitenwechsel; reine Ankerwechsel behalten das native Smooth-Scrolling. */
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.path(event.url) === this.path(this.router.url) && this.activeNavigation === null) return;
        this.cancelFrame();
        this.activeNavigation = event.id;
        this.document.documentElement.classList.add('bp-route-scroll-reset');
        this.resetPosition();
      } else if (event instanceof NavigationEnd && this.activeNavigation === event.id) {
        // Auch nach dem Austausch der View darf keine alte Scrollposition übrig bleiben.
        this.resetPosition();
      } else if (event instanceof Scroll && this.activeNavigation === event.routerEvent.id) {
        // Angular hat jetzt auch ein mögliches Fragment angesprungen. Die Sperre bleibt
        // noch über den nächsten Layout-Frame aktiv, einschließlich später Scroll-Events.
        this.releaseAfterLayout();
      } else if ((event instanceof NavigationCancel || event instanceof NavigationError) && this.activeNavigation === event.id) {
        this.release();
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.cancelFrame();
      this.document.documentElement.classList.remove('bp-route-scroll-reset');
    });
  }

  /** Vergleicht den Routenpfad unabhängig von Query-Parametern und Fragmenten. */
  private path(url: string): string {
    const tree = this.router.parseUrl(url);
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
    const view = this.document.defaultView;
    if (!view) { this.release(); return; }
    this.cancelFrame();
    this.frame = view.requestAnimationFrame(() => {
      this.frame = view.requestAnimationFrame(() => this.release());
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
