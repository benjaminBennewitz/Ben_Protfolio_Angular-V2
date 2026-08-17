/* src/app/pages/services-page/services-page.component.ts */

/**
 * @file Eigenständige Leistungs- und Preisseite.
 * @description Trennt die konkrete Angebotslogik bewusst von der Portfolio-Story der Startseite.
 */

import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { DitheringShaderComponent } from '../../shared/dithering-shader/dithering-shader.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Leistungsseite mit drei Lösungsstufen und optionalen Maintenance-Modellen. */
@Component({
  selector: 'bp-services-page',
  standalone: true,
  imports: [RouterLink, DitheringShaderComponent, RevealTextComponent, RevealOnScrollDirective, SystemDialogComponent, ViewportActivityDirective],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.scss',
})
export class ServicesPageComponent {
  /** Browser-Dokument für lokale Scroll-Ziele und Motion-Präferenzen. */
  private readonly document = inject(DOCUMENT);

  /** Sprachservice für alle sichtbaren Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für routen- und sprachabhängige Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Vollständiger Leistungsinhalt der aktiven Sprache. */
  readonly content = computed(() => this.languageService.content().pricing);

  /** Übersetztes Label für den Rücklink zur Startseite. */
  readonly backLabel = computed(() => this.languageService.language() === 'de' ? 'Zurück zur Experience' : 'Back to the experience');

  /** Steuert den optional schließbaren Scope-Dialog im Hero. */
  readonly isScopeDialogVisible = signal(true);

  /** Schließt den Scope-Dialog als rein visuelles Portfolio-Gimmick. */
  closeScopeDialog(): void {
    this.isScopeDialogVisible.set(false);
  }

  /** Scrollt zuverlässig zur Lösungsübersicht, ohne den Router-Fragmentzustand zu verändern. */
  scrollToSolutions(): void {
    const target = this.document.getElementById('solutions');

    if (!target) {
      return;
    }

    const motionMode = this.document.documentElement.dataset['motion'];
    const prefersReducedMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
    const shouldReduceMotion = motionMode === 'off' || motionMode === 'reduced' || prefersReducedMotion;

    target.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  /** Synchronisiert die Leistungsroute mit den Meta-Daten der aktuellen Sprache. */
  constructor() {
    effect(() => this.seoService.setPageSeo(this.content().metaTitle, this.content().metaDescription, '/leistungen'));
  }
}
