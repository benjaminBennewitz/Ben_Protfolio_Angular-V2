/**
 * @file Eigenständige 404-Seite des Portfolios.
 * @description Rendert einen animierten 404-Counter, ein Recovery-Terminal und eine kompakte interne Sitemap.
 */

import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { Scroll, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AccessibilityPreferenceService } from '../../core/services/accessibility-preference.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';

/** Zielwert der schnellen Counter-Phase vor dem sichtbaren Auslaufen. */
const COUNTER_FAST_TARGET = 400;

/** Dauer der schnellen Counter-Phase von 000 bis 400. */
const COUNTER_FAST_DURATION_MS = 1200;

/** Zeitpunkte der bewusst verlangsamten letzten Counter-Schritte ab 400. */
const COUNTER_TAIL_STEPS = [
  { value: 400, at: 0 },
  { value: 401, at: 120 },
  { value: 402, at: 300 },
  { value: 403, at: 560 },
  { value: 404, at: 920 },
] as const;

/** Finaler HTTP-Statuscode der Seite. */
const NOT_FOUND_CODE = 404;

/** Eigenständige Fehlerseite für unbekannte Portfolio-Routen. */
@Component({
  selector: 'bp-not-found-page',
  standalone: true,
  imports: [RouterLink, SystemDialogComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
})
export class NotFoundPageComponent implements OnDestroy {
  /** Dokumentreferenz für die tatsächlich angeforderte URL. */
  private readonly document = inject(DOCUMENT);

  /** Router für die aktuelle Wildcard-Route. */
  private readonly router = inject(Router);

  /** Destroy-Referenz für die automatische Bereinigung der Router-Subscription. */
  private readonly destroyRef = inject(DestroyRef);

  /** Sprachservice für vollständig übersetzte Fehlerseiten-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für noindex-Meta-Daten der Fehlerseite. */
  private readonly seoService = inject(SeoService);

  /** Globale Motion-Präferenz des Portfolios. */
  private readonly accessibilityPreferences = inject(AccessibilityPreferenceService);

  /** Aktueller Wert des animierten Statuscode-Counters. */
  readonly counterValue = signal<number>(this.accessibilityPreferences.reducesMotion() ? NOT_FOUND_CODE : 0);

  /** Übersetzter Inhalt der Fehlerseite. */
  readonly content = computed(() => this.languageService.content().notFoundPage);

  /** Steuert die Sichtbarkeit des optional schließbaren Recovery-Terminals. */
  readonly isTerminalVisible = signal(true);

  /** Sichtbarer, dreistelliger Counter-Wert. */
  readonly counterLabel = computed(() => this.counterValue().toString().padStart(3, '0'));

  /** Angeforderter Pfad zur Ausgabe im Recovery-Terminal. */
  readonly requestedPath = computed(() => {
    const routerUrl = this.router.url || this.document.location?.pathname || '/';
    return routerUrl.startsWith('/') ? routerUrl : `/${routerUrl}`;
  });

  /** ID des aktuell laufenden Counter-Animation-Frames. */
  private animationFrameId?: number;

  /** IDs der Scroll-Reset-Frames beim Öffnen der Fehlerseite. */
  private readonly scrollResetFrameIds: number[] = [];

  /** Synchronisiert SEO-Daten und startet die Counter-Animation einmalig. */
  constructor() {
    effect(() => {
      const content = this.content();
      this.seoService.setNotFoundSeo(content.metaTitle, content.metaDescription);
    });

    this.resetScrollPosition();

    this.router.events
      .pipe(
        filter((event): event is Scroll => event instanceof Scroll),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetScrollPosition());

    this.startCounterAnimation();
  }

  /** Stoppt einen eventuell laufenden Animation-Frame beim Verlassen der Seite. */
  ngOnDestroy(): void {
    if (this.animationFrameId !== undefined) {
      cancelAnimationFrame(this.animationFrameId);
    }

    for (const frameId of this.scrollResetFrameIds) {
      cancelAnimationFrame(frameId);
    }
  }

  /** Schließt das Recovery-Terminal, ohne die Recovery-Navigation zu beeinflussen. */
  closeTerminal(): void {
    this.isTerminalVisible.set(false);
  }

  /** Prüft, ob ein Sitemap-Link als Angular-Route behandelt werden kann. */
  isRouteLink(href: string): boolean {
    return href.startsWith('/');
  }

  /** Trennt einen internen Link in Route und optionales Fragment. */
  routePath(href: string): string {
    return href.split('#', 1)[0] || '/';
  }

  /** Liefert das Fragment eines internen Links ohne führendes Hash-Zeichen. */
  routeFragment(href: string): string | undefined {
    const fragment = href.split('#', 2)[1];
    return fragment || undefined;
  }


  /** Setzt die Body-Scrollposition auch nach Angulars Scroll-Restoration zuverlässig auf den Seitenanfang. */
  private resetScrollPosition(): void {
    if (typeof window === 'undefined') {
      return;
    }

    for (const frameId of this.scrollResetFrameIds) {
      window.cancelAnimationFrame(frameId);
    }
    this.scrollResetFrameIds.length = 0;

    const scrollToTop = (): void => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      this.document.documentElement.scrollTop = 0;
      this.document.body.scrollTop = 0;
    };

    scrollToTop();

    const firstFrameId = window.requestAnimationFrame(() => {
      scrollToTop();

      const secondFrameId = window.requestAnimationFrame(scrollToTop);
      this.scrollResetFrameIds.push(secondFrameId);
    });

    this.scrollResetFrameIds.push(firstFrameId);
  }

  /** Animiert den Statuscode zügig bis 400 und lässt die letzten vier Schritte sichtbar auslaufen. */
  private startCounterAnimation(): void {
    if (this.accessibilityPreferences.reducesMotion() || typeof requestAnimationFrame === 'undefined') {
      this.counterValue.set(NOT_FOUND_CODE);
      return;
    }

    const startTime = performance.now();
    const tailDuration = COUNTER_TAIL_STEPS[COUNTER_TAIL_STEPS.length - 1].at;

    const tick = (now: number): void => {
      const elapsed = now - startTime;

      if (elapsed < COUNTER_FAST_DURATION_MS) {
        const progress = elapsed / COUNTER_FAST_DURATION_MS;
        const easedProgress = 1 - Math.pow(1 - progress, 4);

        this.counterValue.set(Math.round(COUNTER_FAST_TARGET * easedProgress));
        this.animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const tailElapsed = elapsed - COUNTER_FAST_DURATION_MS;
      let tailValue = COUNTER_FAST_TARGET;

      for (const step of COUNTER_TAIL_STEPS) {
        if (tailElapsed < step.at) {
          break;
        }

        tailValue = step.value;
      }

      this.counterValue.set(tailValue);

      if (tailElapsed < tailDuration) {
        this.animationFrameId = requestAnimationFrame(tick);
        return;
      }

      this.counterValue.set(NOT_FOUND_CODE);
      this.animationFrameId = undefined;
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }
}
