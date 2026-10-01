/* src/app/pages/portfolio-page/portfolio-page.component.ts */

/**
 * @file Portfolio-Übersichtsseite.
 * @description Rendert die ausgelagerte Projektübersicht inklusive Schoko-Intro als eigene Portfolio-Route.
 */

import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { PORTFOLIO_PROJECTS } from '../../core/data/portfolio-projects';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { AchievementService } from '../../core/services/achievement.service';
import { ProjectStackComponent } from '../../shared/project-stack/project-stack.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Zustände für das Schoko-Bild im Portfolio-Einstieg. */
type PortfolioChocolateKey = 'default' | 'eaten';

/** Konfiguration eines fallenden Schoko-Eis für die Portfolio-Bühne. */
/** Konfiguration einer eigenständigen visuellen Designstudie. */
interface DesignStudy {
  /** Stabile Kennung der Studie. */
  readonly id: string;

  /** Sichtbarer Projektname. */
  readonly name: string;

  /** Kurze visuelle Einordnung. */
  readonly subtitle: string;

  /** Öffentlicher Pfad der statischen Microsite. */
  readonly href: string;

  /** Vorschaubild innerhalb der Portfolio-Section. */
  readonly preview: string;

  /** Kompakte Gestaltungsschwerpunkte. */
  readonly tags: readonly string[];
}

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
  imports: [RouterLink, ProjectStackComponent, RevealOnScrollDirective, RevealTextComponent, SystemDialogComponent, ViewportActivityDirective],
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

  /** Eigenständige visuelle Studien unterhalb der klassischen Case Studies. */
  readonly designStudies: readonly DesignStudy[] = [
    {
      id: 'raw-form',
      name: 'RAW/FORM',
      subtitle: 'Brutalist Festival Landingpage',
      href: '/design-studies/brutalism/',
      preview: '/design-studies/brutalism/assets/img/hero.webp',
      tags: ['Brutalism', 'Editorial', 'Motion', 'HTML / CSS / JS'],
    },
    {
      id: 'whatwesee',
      name: '[WHATWESEE]',
      subtitle: 'Swiss-inspired Photography Journal',
      href: '/design-studies/swiss/',
      preview: '/design-studies/swiss/assets/images/hero-landscape.webp',
      tags: ['Swiss Style', 'Photography', 'Editorial', 'HTML / CSS / JS'],
    },
  ];

  /** Referenz auf die Scroll-Strecke der Design-Studies-Bühne. */
  @ViewChild('designStudiesSection')
  private designStudiesSection?: ElementRef<HTMLElement>;

  /** Scrollfortschritt innerhalb der fixierten Design-Studies-Bühne (0–1). */
  readonly designStudiesProgress = signal<number>(0);

  /** Zusätzlicher Scrollweg: pro weiterer Studie entsteht eine eigene Einflugstrecke. */
  readonly designStudiesScrollHeight = `${100 + Math.max(0, this.designStudies.length - 1) * 120}svh`;

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

  /** Case Studies der aktuell ausgewählten Sprache. */
  readonly projects = computed(() => PORTFOLIO_PROJECTS[this.languageService.language()]);

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
      'Case Studies von B² Benjamin Bennewitz: Intranet, Dein Fußabdruck, Carly Managed, Globi Flow mit lokaler OCR und ein interaktives Designarchiv.',
      '/portfolio',
    );
  }

  /** RAF-ID für einen ruhigen, scroll-gekoppelten Design-Studies-Stack. */
  private designStudiesScrollFrame = 0;

  /** Synchronisiert den Scrollfortschritt der eingerasteten Design-Studies-Bühne. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  queueDesignStudiesProgressSync(): void {
    if (typeof window === 'undefined' || this.designStudiesScrollFrame !== 0) {
      return;
    }

    this.designStudiesScrollFrame = window.requestAnimationFrame(() => {
      this.designStudiesScrollFrame = 0;
      this.syncDesignStudiesProgress();
    });
  }

  /** Berechnet den Fortschritt erst ab dem Moment, in dem die Bühne im Viewport eingerastet ist. */
  private syncDesignStudiesProgress(): void {
    const section = this.designStudiesSection?.nativeElement;
    if (!section || typeof window === 'undefined') {
      return;
    }

    const rect = section.getBoundingClientRect();
    const scrollDistance = Math.max(1, rect.height - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / scrollDistance));
    this.designStudiesProgress.set(progress);
  }

  /** Liefert den individuellen Aufklebe-Fortschritt einer Study-Karte. */
  designStudyCardProgress(index: number): number {
    if (index === 0) {
      return 1;
    }

    const incomingCards = Math.max(1, this.designStudies.length - 1);
    const segment = 1 / incomingCards;
    const segmentStart = (index - 1) * segment;

    // Die erste Karte bleibt nach dem Einrasten bewusst allein sichtbar.
    // Erst zusätzlicher Scrollweg startet den Sticker-Impact; danach bleibt
    // erneut Ruhe, damit der fertige Stack betrachtet werden kann.
    const start = segmentStart + segment * 0.32;
    const end = segmentStart + segment * 0.84;
    const progress = (this.designStudiesProgress() - start) / Math.max(0.001, end - start);

    return Math.min(1, Math.max(0, progress));
  }

  /** Berechnet einen Sticker-Impact: aus der Tiefe, kurzer Schlag, dann Settle. */
  designStudyTransform(index: number): string {
    if (index === 0) {
      return 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
    }

    const progress = this.designStudyCardProgress(index);
    const direction = index % 2 === 1 ? 1 : -1;

    let x: number;
    let y: number;
    let z: number;
    let rotation: number;
    let scale: number;

    if (progress < 0.72) {
      const phase = this.easeOutCubic(progress / 0.72);
      x = this.lerp(direction * 4.6, direction * 0.45, phase);
      y = this.lerp(-4.8, 0.7, phase);
      z = this.lerp(320, 0, phase);
      rotation = this.lerp(direction * 5.5, direction * -1.8, phase);
      scale = this.lerp(1.58, 0.955, phase);
    } else if (progress < 0.9) {
      const phase = this.easeOutCubic((progress - 0.72) / 0.18);
      x = this.lerp(direction * 0.45, direction * -0.14, phase);
      y = this.lerp(0.7, -0.12, phase);
      z = 0;
      rotation = this.lerp(direction * -1.8, direction * 0.65, phase);
      scale = this.lerp(0.955, 1.035, phase);
    } else {
      const phase = this.easeOutCubic((progress - 0.9) / 0.1);
      x = this.lerp(direction * -0.14, 0, phase);
      y = this.lerp(-0.12, 0, phase);
      z = 0;
      rotation = this.lerp(direction * 0.65, 0, phase);
      scale = this.lerp(1.035, 1, phase);
    }

    return `translate3d(${x.toFixed(3)}vw, ${y.toFixed(3)}vh, ${z.toFixed(1)}px) rotate(${rotation.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
  }

  /** Tiefenunschärfe für den kurzen Anflug aus dem Vordergrund. */
  designStudyFilter(index: number): string {
    if (index === 0) {
      return 'none';
    }

    const progress = this.designStudyCardProgress(index);
    const blur = Math.max(0, 5.5 * (1 - Math.min(1, progress / 0.68)));
    return `blur(${blur.toFixed(2)}px)`;
  }

  /** Blendet die Karte erst kurz vor ihrem sichtbaren Anflug ein. */
  designStudyOpacity(index: number): number {
    if (index === 0) {
      return 1;
    }

    const progress = this.designStudyCardProgress(index);
    return Math.min(1, Math.max(0, progress / 0.12));
  }

  private lerp(from: number, to: number, progress: number): number {
    return from + (to - from) * progress;
  }

  private easeOutCubic(progress: number): number {
    return 1 - Math.pow(1 - Math.min(1, Math.max(0, progress)), 3);
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
