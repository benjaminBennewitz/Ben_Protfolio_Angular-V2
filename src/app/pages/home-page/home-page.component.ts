/* src/app/pages/home-page/home-page.component.ts */

/**
 * @file Startseite des Portfolios.
 * @description Kombiniert Hero, Über-mich, Techstack, Leistungen, Process-Lock, Chaos-CTA, FAQ und Kontakt.
 */

import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { AboutMetricsWindowComponent } from '../../shared/about-metrics-window/about-metrics-window.component';
import { BuiltWithoutComponent } from '../../shared/built-without/built-without.component';
import { ChaosCtaComponent } from '../../shared/chaos-cta/chaos-cta.component';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { ProcessLockComponent } from '../../shared/process-lock/process-lock.component';
import { PixelFireworkComponent } from '../../shared/pixel-firework/pixel-firework.component';
import { PixelSpriteComponent } from '../../shared/pixel-sprite/pixel-sprite.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { TechMarqueeComponent } from '../../shared/tech-marquee/tech-marquee.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Zustände für die auswählbaren Hero-Köpfe. */
type HeroHeadKey = 'default' | 'lol' | 'insane' | 'fck';

/** Zustände für das About-Kaffeebild. */
type AboutCoffeeKey = 'default' | 'error';

/** Zustände für das Schoko-Bild im Projekt-Einstieg. */
type ProjectsChocolateKey = 'default' | 'eaten' | 'fallback';

/** Konfiguration eines fallenden Schoko-Eis für die Projektbühne. */
interface ProjectsChocolateEgg {
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

/** Hauptseite der Portfolio-Experience. */
@Component({
  selector: 'bp-home-page',
  standalone: true,
  imports: [RouterLink, RevealTextComponent, RevealOnScrollDirective, TechMarqueeComponent, ProcessLockComponent, AboutMetricsWindowComponent, BuiltWithoutComponent, ChaosCtaComponent, ContactFormComponent, ViewportActivityDirective, PixelSpriteComponent, PixelFireworkComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  /** Dokumentreferenz für Fokus- und Modalsteuerung. */
  private readonly document = inject(DOCUMENT);

  /** Sprachservice für alle sichtbaren Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Startseiten-Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** Achievement-Service für versteckte Interaktionen auf der Startseite. */
  private readonly achievementService = inject(AchievementService);

  /** X-Versatz für den Hero-Parallax-Effekt. */
  private readonly heroShiftX = signal(0);

  /** Y-Versatz für den Hero-Parallax-Effekt. */
  private readonly heroShiftY = signal(0);

  /** Scroll-Versatz für den Hero-Hintergrund. */
  private readonly heroScrollOffset = signal(0);

  /** IntersectionObserver für das verzögerte Laden der Skill-Balken. */
  private skillLevelsObserver?: IntersectionObserver;

  /** Panel-Referenz für die Skill-Level-Balken. */
  @ViewChild('skillLevelPanel')
  private readonly skillLevelPanel?: ElementRef<HTMLElement>;

  /** Fenster-Referenz des Kontaktmodals für Fokussteuerung. */
  @ViewChild('contactModalWindow')
  private readonly contactModalWindow?: ElementRef<HTMLElement>;

  /** Element, das vor dem Öffnen des Modals fokussiert war. */
  private contactModalTrigger?: HTMLElement;

  /** Aktuell ausgewählter Hero-Kopf. */
  readonly activeHeroHead = signal<HeroHeadKey>('default');

  /** Sichtbarkeit des interaktiven Hero-Dialogfensters. */
  readonly isHeroDialogVisible = signal<boolean>(true);

  /** Aktuell sichtbarer Zustand des About-Kaffeebildes. */
  readonly activeAboutCoffeeImage = signal<AboutCoffeeKey>('default');

  /** Sichtbarkeit des interaktiven About-Dialogfensters. */
  readonly isAboutDialogVisible = signal<boolean>(true);

  /** Sichtbarkeit des Skill-Level-Dialogfensters. */
  readonly isSkillsDialogVisible = signal<boolean>(true);

  /** Sichtbarkeit des Projekt-Einstieg-Dialogfensters. */
  readonly isProjectsDialogVisible = signal<boolean>(true);

  /** Aktuell sichtbarer Zustand des Schoko-Bildes im Projekt-Einstieg. */
  readonly activeProjectsChocolateImage = signal<ProjectsChocolateKey>('default');

  /** Sichtbarkeit des Kontaktformular-Modals. */
  readonly isContactModalVisible = signal<boolean>(false);

  /** Aktiviert die Wachstumsanimation der Skill-Level-Balken. */
  readonly areSkillLevelsLoaded = signal<boolean>(false);

  /** Asset-Zuordnung für die Hero-Köpfe. */
  private readonly heroHeadAssetMap: Record<HeroHeadKey, string> = {
    default: 'assets/images/default-hero-head.webp',
    lol: 'assets/images/hero-head-lol.webp',
    insane: 'assets/images/hero-head-insane.webp',
    fck: 'assets/images/hero-head-fck.webp',
  };

  /** Asset-Zuordnung für das About-Kaffeebild. */
  private readonly aboutCoffeeAssetMap: Record<AboutCoffeeKey, string> = {
    default: 'assets/images/me-and-coffee.webp',
    error: 'assets/images/me-and-coffee-error.webp',
  };

  /** Asset-Zuordnung für das Schoko-Bild im Projekt-Einstieg. */
  private readonly projectsChocolateAssetMap: Record<ProjectsChocolateKey, string> = {
    default: 'assets/images/me-with-chocolate.webp',
    eaten: 'assets/images/me-after-chocolate.webp',
    fallback: 'assets/images/me-and-coffee.webp',
  };

  /** Endpositionen und Timings für die fallenden Schoko-Eier. */
  readonly projectChocolateEggs: readonly ProjectsChocolateEgg[] = [
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

  /** CSS-Wert für den horizontalen Parallax-Versatz. */
  readonly heroShiftXStyle = computed(() => `${this.heroShiftX()}px`);

  /** CSS-Wert für den vertikalen Parallax-Versatz. */
  readonly heroShiftYStyle = computed(() => `${this.heroShiftY()}px`);

  /** CSS-Wert für den Scroll-Versatz des Hero-Hintergrunds. */
  readonly heroScrollOffsetStyle = computed(() => `${this.heroScrollOffset()}px`);

  /** Pfad des aktuell sichtbaren Hero-Kopfes. */
  readonly currentHeroHeadSrc = computed(() => this.heroHeadAssetMap[this.activeHeroHead()]);

  /** Pfad des aktuell sichtbaren About-Kaffeebildes. */
  readonly currentAboutCoffeeSrc = computed(() => this.aboutCoffeeAssetMap[this.activeAboutCoffeeImage()]);

  /** Beschriftung des About-Buttons passend zum aktuellen Bildzustand. */
  readonly aboutDialogActionLabel = computed(() => this.activeAboutCoffeeImage() === 'error' ? this.content().about.dialogActionAfterClick : this.content().about.dialogAction);

  /** Pfad des Standardportraits im Projekt-Einstieg. */
  readonly projectsChocolateDefaultSrc = this.projectsChocolateAssetMap.default;

  /** Pfad des Folgeportraits im Projekt-Einstieg. */
  readonly projectsChocolateEatenSrc = this.projectsChocolateAssetMap.eaten;

  /** Merkt, ob das Schoko-Finale bereits ausgelöst wurde. */
  readonly isProjectsChocolateEaten = computed(() => this.activeProjectsChocolateImage() === 'eaten');

  /** Beschriftung des Schoko-Buttons passend zum aktuellen Bildzustand. */
  readonly projectsChocolateActionLabel = computed(() => this.isProjectsChocolateEaten() ? this.content().projectsIntro.imageActionActiveLabel : this.content().projectsIntro.imageActionLabel);

  /** Initialisiert SEO-Daten reaktiv zur Sprache. */
  constructor() {
    effect(() => this.seoService.setHomeSeo(this.content().meta));
    this.updateHeroScrollOffset();
  }

  /** Initialisiert viewportabhängige Animationen nach dem Rendern der View. */
  ngAfterViewInit(): void {
    this.observeSkillLevels();
  }

  /** Räumt Scroll-Observer und globale Modalzustände beim Entfernen der Seite auf. */
  ngOnDestroy(): void {
    this.skillLevelsObserver?.disconnect();
    this.document.documentElement.classList.remove('bp-modal-open');
  }

  /**
   * Reagiert auf Pointer-Bewegung im Hero und verschiebt den Kopf subtil für den Parallax-Look.
   * @param event PointerEvent aus der Hero-Section.
   */
  onHeroPointerMove(event: PointerEvent): void {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    this.heroShiftX.set(relativeX * 60);
    this.heroShiftY.set(relativeY * 48);
  }

  /** Setzt den Parallax-Zustand auf neutral zurück. */
  resetHeroPointer(): void {
    this.heroShiftX.set(0);
    this.heroShiftY.set(0);
  }

  /**
   * Wechselt den sichtbaren Hero-Kopf passend zur Dialogauswahl.
   * @param head Zielzustand des Hero-Kopfes.
   */
  setHeroHead(head: HeroHeadKey): void {
    this.achievementService.unlock('hero-face-switch');
    this.activeHeroHead.set(head);
  }

  /** Setzt den Hero-Kopf wieder auf den Default-Zustand zurück. */
  resetHeroHead(): void {
    this.activeHeroHead.set('default');
  }

  /** Entfernt das Hero-Dialogfenster aus der Startansicht. */
  closeHeroDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isHeroDialogVisible.set(false);
  }

  /** Wechselt im About-Bereich auf das vorbereitete Fehlerbild. */
  showAboutCoffeeError(): void {
    this.achievementService.unlock('coffee-glitch');
    this.activeAboutCoffeeImage.set('error');
  }

  /** Setzt das About-Kaffeebild auf das vorhandene Standardbild zurück. */
  resetAboutCoffeeImage(): void {
    this.activeAboutCoffeeImage.set('default');
  }

  /** Wechselt im Projekt-Einstieg auf das vorbereitete Schoko-Folgeportrait. */
  showProjectsChocolateEaten(): void {
    if (this.isProjectsChocolateEaten()) {
      return;
    }

    this.achievementService.unlock('sugar-covered');
    this.activeProjectsChocolateImage.set('eaten');
  }

  /** Setzt das Schoko-Bild bei fehlendem Asset auf ein vorhandenes Portrait zurück. */
  resetProjectsChocolateImage(): void {
    this.activeProjectsChocolateImage.set('fallback');
  }

  /** Entfernt das About-Dialogfenster aus der Startansicht. */
  closeAboutDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isAboutDialogVisible.set(false);
  }

  /** Entfernt das Skill-Level-Dialogfenster aus dem Techstack-Bereich. */
  closeSkillsDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isSkillsDialogVisible.set(false);
  }

  /** Entfernt das Projekt-Einstieg-Dialogfenster aus der Projektübersicht. */
  closeProjectsDialog(): void {
    this.achievementService.unlock('nostalgia-hater');
    this.isProjectsDialogVisible.set(false);
  }

  /** Öffnet das Kontaktformular als fokussiertes Modal über der Startseite. */
  openContactModal(): void {
    this.contactModalTrigger = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : undefined;
    this.isContactModalVisible.set(true);
    this.document.documentElement.classList.add('bp-modal-open');
    window.requestAnimationFrame(() => this.focusContactModal());
  }

  /** Schließt das Kontaktformular-Modal und stellt den Auslösefokus wieder her. */
  closeContactModal(): void {
    if (!this.isContactModalVisible()) {
      return;
    }

    this.achievementService.unlock('nostalgia-hater');
    this.isContactModalVisible.set(false);
    this.document.documentElement.classList.remove('bp-modal-open');
    this.contactModalTrigger?.focus();
    this.contactModalTrigger = undefined;
  }

  /** Schließt das Kontaktformular-Modal über Escape. */
  @HostListener('window:keydown.escape')
  closeContactModalByKeyboard(): void {
    this.closeContactModal();
  }

  /** Hält den Tastaturfokus innerhalb des sichtbaren Kontaktmodals. */
  onContactModalKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const modal = this.contactModalWindow?.nativeElement;

    if (!modal) {
      return;
    }

    const focusableElements = this.focusableModalElements(modal);

    if (!focusableElements.length) {
      event.preventDefault();
      modal.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && this.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && this.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /** Schaltet die Metrics-Trophäe frei, sobald der absurde Rechner genutzt wird. */
  unlockMetricsAchievement(): void {
    this.achievementService.unlock('weird-units');
  }

  /** Aktualisiert den scrollabhängigen Offset für den Hero-Hintergrund. */
  @HostListener('window:scroll')
  updateHeroScrollOffset(): void {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    this.heroScrollOffset.set(Math.min(scrollY * 0.18, 140));
  }

  /** Setzt den Initialfokus auf den ersten sinnvollen Fokuspunkt im Kontaktmodal. */
  private focusContactModal(): void {
    const modal = this.contactModalWindow?.nativeElement;

    if (!modal) {
      return;
    }

    const firstFocusable = this.focusableModalElements(modal)[0];
    (firstFocusable ?? modal).focus();
  }

  /** Sammelt sichtbare, bedienbare Fokusziele innerhalb eines Modals. */
  private focusableModalElements(root: HTMLElement): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => element.offsetParent !== null);
  }

  /** Beobachtet das Skill-Level-Panel und startet Balken erst bei nahezu voller Sichtbarkeit. */
  private observeSkillLevels(): void {
    const panel = this.skillLevelPanel?.nativeElement;

    if (!panel || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.areSkillLevelsLoaded.set(true);
      return;
    }

    const threshold = this.skillLevelThreshold(panel);

    this.skillLevelsObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < threshold) {
          return;
        }

        this.areSkillLevelsLoaded.set(true);
        this.skillLevelsObserver?.disconnect();
      },
      { rootMargin: '0px 0px -8% 0px', threshold: [threshold] },
    );

    this.skillLevelsObserver.observe(panel);
  }

  /**
   * Bestimmt einen erreichbaren Sichtbarkeitswert für die Skill-Balken.
   * @param panel Beobachtetes Skill-Panel.
   * @returns Viewportabhängiger Intersection-Threshold.
   */
  private skillLevelThreshold(panel: HTMLElement): number {
    if (window.innerWidth <= 420) {
      return 0.18;
    }

    if (panel.offsetHeight > window.innerHeight) {
      return 0.34;
    }

    return 0.72;
  }
}
