/* src/app/pages/portfolio-page/portfolio-page.component.ts */

/**
 * @file Portfolio-Übersichtsseite.
 * @description Rendert die ausgelagerte Projektübersicht inklusive Schoko-Intro als eigene Portfolio-Route.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ProjectStackComponent } from '../../shared/project-stack/project-stack.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Zustände für das Schoko-Bild im Portfolio-Einstieg. */
type PortfolioChocolateKey = 'default' | 'eaten';

/** Konfiguration eines fallenden Schoko-Eis für die Portfolio-Bühne. */
interface PortfolioChocolateEgg {
  /** Horizontale Endposition innerhalb des Portrait-Kastens. */
  readonly left: string;

  /** Vertikale Endposition innerhalb des Portrait-Kastens. */
  readonly bottom: string;

  /** Zielrotation nach dem Fallen. */
  readonly rotate: string;

  /** Startrotation beim Einflug von oben. */
  readonly startRotate: string;

  /** Skalierung für unterschiedlich große Eier. */
  readonly scale: string;

  /** Zeichenreihenfolge für glaubwürdige Stapelung. */
  readonly zIndex: number;

  /** Individuelle Startverzögerung der Fallanimation. */
  readonly delayMs: number;

  /** Individuelle Dauer der Fallanimation. */
  readonly durationMs: number;
}

/** Eigenständige Portfolio-Seite für alle Projekt-Case-Studies. */
@Component({
  selector: 'bp-portfolio-page',
  standalone: true,
  imports: [RouterLink, ProjectStackComponent, RevealOnScrollDirective, RevealTextComponent, ViewportActivityDirective],
  templateUrl: './portfolio-page.component.html',
  styleUrl: './portfolio-page.component.scss',
})
export class PortfolioPageComponent {
  /** Sprachservice für übersetzte Portfolio-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für die Meta-Daten der Portfolio-Route. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für versteckte Portfolio-Interaktionen. */
  private readonly achievementService = inject(AchievementService);

  /** Sichtbarkeit des dekorativen Terminalfensters im Portfolio-Intro. */
  readonly isProjectsDialogVisible = signal<boolean>(true);

  /** Aktuell sichtbarer Zustand des Schoko-Bildes im Portfolio-Intro. */
  readonly activePortfolioChocolateImage = signal<PortfolioChocolateKey>('default');

  /** Endpositionen und Timings für die fallenden Schoko-Eier. */
  readonly portfolioChocolateEggs: readonly PortfolioChocolateEgg[] = [
    { left: '-6%', bottom: '-6%', rotate: '-26deg', startRotate: '-58deg', scale: '1.18', zIndex: 4, delayMs: 0, durationMs: 820 },
    { left: '6%', bottom: '-8%', rotate: '22deg', startRotate: '54deg', scale: '1.12', zIndex: 5, delayMs: 60, durationMs: 860 },
    { left: '17%', bottom: '-7%', rotate: '-14deg', startRotate: '-36deg', scale: '1.08', zIndex: 5, delayMs: 110, durationMs: 900 },
    { left: '28%', bottom: '-8%', rotate: '9deg', startRotate: '32deg', scale: '1.14', zIndex: 6, delayMs: 160, durationMs: 920 },
    { left: '40%', bottom: '-7%', rotate: '-29deg', startRotate: '-62deg', scale: '1.1', zIndex: 6, delayMs: 210, durationMs: 940 },
    { left: '52%', bottom: '-8%', rotate: '26deg', startRotate: '60deg', scale: '1.08', zIndex: 6, delayMs: 260, durationMs: 960 },
    { left: '64%', bottom: '-7%', rotate: '-11deg', startRotate: '-28deg', scale: '1.12', zIndex: 5, delayMs: 320, durationMs: 980 },
    { left: '76%', bottom: '-8%', rotate: '18deg', startRotate: '42deg', scale: '1.06', zIndex: 5, delayMs: 380, durationMs: 980 },
    { left: '86%', bottom: '-6%', rotate: '-23deg', startRotate: '-48deg', scale: '1', zIndex: 4, delayMs: 430, durationMs: 940 },
    { left: '-2%', bottom: '9%', rotate: '31deg', startRotate: '68deg', scale: '1.02', zIndex: 4, delayMs: 220, durationMs: 920 },
    { left: '10%', bottom: '11%', rotate: '-17deg', startRotate: '-43deg', scale: '0.98', zIndex: 5, delayMs: 280, durationMs: 980 },
    { left: '21%', bottom: '10%', rotate: '12deg', startRotate: '30deg', scale: '1.05', zIndex: 6, delayMs: 330, durationMs: 1000 },
    { left: '33%', bottom: '12%', rotate: '-33deg', startRotate: '-74deg', scale: '0.96', zIndex: 6, delayMs: 390, durationMs: 1040 },
    { left: '45%', bottom: '10%', rotate: '14deg', startRotate: '37deg', scale: '1.04', zIndex: 7, delayMs: 450, durationMs: 980 },
    { left: '57%', bottom: '12%', rotate: '-20deg', startRotate: '-52deg', scale: '0.94', zIndex: 6, delayMs: 510, durationMs: 1020 },
    { left: '68%', bottom: '10%', rotate: '27deg', startRotate: '64deg', scale: '1', zIndex: 6, delayMs: 570, durationMs: 1040 },
    { left: '79%', bottom: '11%', rotate: '-9deg', startRotate: '-24deg', scale: '0.95', zIndex: 5, delayMs: 630, durationMs: 1060 },
    { left: '4%', bottom: '26%', rotate: '-28deg', startRotate: '-59deg', scale: '0.94', zIndex: 4, delayMs: 520, durationMs: 1080 },
    { left: '15%', bottom: '28%', rotate: '19deg', startRotate: '48deg', scale: '0.92', zIndex: 5, delayMs: 590, durationMs: 1120 },
    { left: '27%', bottom: '27%', rotate: '-13deg', startRotate: '-34deg', scale: '0.96', zIndex: 5, delayMs: 650, durationMs: 1100 },
    { left: '39%', bottom: '29%', rotate: '34deg', startRotate: '76deg', scale: '0.88', zIndex: 6, delayMs: 710, durationMs: 1140 },
    { left: '50%', bottom: '27%', rotate: '-21deg', startRotate: '-49deg', scale: '0.94', zIndex: 6, delayMs: 770, durationMs: 1160 },
    { left: '62%', bottom: '29%', rotate: '11deg', startRotate: '28deg', scale: '0.9', zIndex: 5, delayMs: 830, durationMs: 1180 },
    { left: '73%', bottom: '28%', rotate: '-31deg', startRotate: '-72deg', scale: '0.92', zIndex: 5, delayMs: 890, durationMs: 1200 },
    { left: '84%', bottom: '26%', rotate: '16deg', startRotate: '40deg', scale: '0.86', zIndex: 4, delayMs: 950, durationMs: 1220 },
    { left: '1%', bottom: '43%', rotate: '24deg', startRotate: '58deg', scale: '0.84', zIndex: 3, delayMs: 860, durationMs: 1240 },
    { left: '13%', bottom: '45%', rotate: '-18deg', startRotate: '-44deg', scale: '0.82', zIndex: 4, delayMs: 930, durationMs: 1280 },
    { left: '25%', bottom: '44%', rotate: '8deg', startRotate: '20deg', scale: '0.86', zIndex: 4, delayMs: 1000, durationMs: 1300 },
    { left: '37%', bottom: '46%', rotate: '-26deg', startRotate: '-60deg', scale: '0.8', zIndex: 5, delayMs: 1060, durationMs: 1320 },
    { left: '49%', bottom: '45%', rotate: '29deg', startRotate: '66deg', scale: '0.84', zIndex: 5, delayMs: 1120, durationMs: 1360 },
    { left: '60%', bottom: '47%', rotate: '-12deg', startRotate: '-31deg', scale: '0.8', zIndex: 4, delayMs: 1180, durationMs: 1380 },
    { left: '72%', bottom: '45%', rotate: '21deg', startRotate: '50deg', scale: '0.82', zIndex: 4, delayMs: 1240, durationMs: 1400 },
    { left: '83%', bottom: '44%', rotate: '-15deg', startRotate: '-38deg', scale: '0.78', zIndex: 3, delayMs: 1300, durationMs: 1440 },
    { left: '9%', bottom: '59%', rotate: '-32deg', startRotate: '-70deg', scale: '0.76', zIndex: 3, delayMs: 1200, durationMs: 1460 },
    { left: '24%', bottom: '60%', rotate: '18deg', startRotate: '44deg', scale: '0.74', zIndex: 3, delayMs: 1280, durationMs: 1500 },
    { left: '40%', bottom: '61%', rotate: '-7deg', startRotate: '-19deg', scale: '0.72', zIndex: 3, delayMs: 1360, durationMs: 1540 },
    { left: '56%', bottom: '60%', rotate: '27deg', startRotate: '62deg', scale: '0.76', zIndex: 3, delayMs: 1440, durationMs: 1580 },
    { left: '71%', bottom: '59%', rotate: '-22deg', startRotate: '-53deg', scale: '0.72', zIndex: 3, delayMs: 1520, durationMs: 1620 },
  ];

  /** Übersetzter Inhalt der aktuellen Sprache. */
  readonly content = computed(() => this.languageService.content());

  /** Pfad des Standardportraits im Portfolio-Einstieg. */
  readonly portfolioChocolateDefaultSrc = 'assets/images/me-with-chocolate.webp';

  /** Pfad des Folgeportraits im Portfolio-Einstieg. */
  readonly portfolioChocolateEatenSrc = 'assets/images/me-after-chocolate.webp';

  /** Merkt, ob das Schoko-Finale bereits ausgelöst wurde. */
  readonly isPortfolioChocolateEaten = computed(() => this.activePortfolioChocolateImage() === 'eaten');

  /** Beschriftung des Schoko-Buttons passend zum aktuellen Bildzustand. */
  readonly portfolioChocolateActionLabel = computed(() => this.isPortfolioChocolateEaten() ? this.content().projectsIntro.imageActionActiveLabel : this.content().projectsIntro.imageActionLabel);

  /** Initialisiert die Meta-Daten der ausgelagerten Portfolio-Seite. */
  constructor() {
    this.seoService.setPageSeo(
      'Case Studies | Design. Code. Repeat.',
      'Case Studies von Benjamin Bennewitz: Intranet, Browser Game, Asana-Klon, Blutanalyse und interaktiver Grafikdesign-Katalog.',
      '/portfolio',
    );
  }

  /** Wechselt im Portfolio-Einstieg auf das vorbereitete Schoko-Folgeportrait. */
  showPortfolioChocolateEaten(): void {
    if (this.isPortfolioChocolateEaten()) {
      return;
    }

    this.achievementService.unlock('sugar-covered');
    this.activePortfolioChocolateImage.set('eaten');
  }

  /** Entfernt das Portfolio-Terminalfenster aus dem Einstieg. */
  closeProjectsDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isProjectsDialogVisible.set(false);
  }
}
