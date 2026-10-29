/* src/app/pages/home-page/home-page.component.ts */

/**
 * @file Startseite des Portfolios.
 * @description Kombiniert Hero, Über-mich, Techstack, Kompetenzprofil, Process-Lock, Chaos-CTA, FAQ und Kontakt.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { AboutMetricsWindowComponent } from '../../shared/about-metrics-window/about-metrics-window.component';
import { BuiltWithoutComponent } from '../../shared/built-without/built-without.component';
import { ChaosCtaComponent } from '../../shared/chaos-cta/chaos-cta.component';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { DitheringShaderComponent } from '../../shared/dithering-shader/dithering-shader.component';
import { ProcessLockComponent } from '../../shared/process-lock/process-lock.component';
import { PixelFireworkComponent } from '../../shared/pixel-firework/pixel-firework.component';
import { PixelSpriteComponent } from '../../shared/pixel-sprite/pixel-sprite.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { TechMarqueeComponent } from '../../shared/tech-marquee/tech-marquee.component';
import { SystemDialogComponent } from '../../shared/system-dialog/system-dialog.component';
import { ViewportActivityDirective } from '../../shared/viewport-activity.directive';

/** Zustände für die auswählbaren Hero-Köpfe. */
type HeroHeadKey = 'default' | 'lol' | 'insane' | 'fck';

/** Zustände für das About-Kaffeebild. */
type AboutCoffeeKey = 'default' | 'error';

/** Hauptseite der Portfolio-Experience. */
@Component({
  selector: 'bp-home-page',
  standalone: true,
  imports: [RouterLink, RevealTextComponent, RevealOnScrollDirective, TechMarqueeComponent, SystemDialogComponent, ProcessLockComponent, AboutMetricsWindowComponent, BuiltWithoutComponent, ChaosCtaComponent, ContactFormComponent, DitheringShaderComponent, ViewportActivityDirective, PixelSpriteComponent, PixelFireworkComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  private readonly languageService = inject(LanguageService);                          // Sprachservice für alle sichtbaren Inhalte.
  private readonly seoService = inject(SeoService);                                    // SEO-Service für Startseiten-Meta-Daten.
  private readonly achievementService = inject(AchievementService);                    // Achievement-Service für versteckte Interaktionen auf der Startseite.
  private readonly heroShiftX = signal(0);                                             // X-Versatz für den Hero-Parallax-Effekt.
  private readonly heroShiftY = signal(0);                                             // Y-Versatz für den Hero-Parallax-Effekt.
  private readonly heroScrollOffset = signal(0);                                       // Scroll-Versatz für den Hero-Hintergrund.
  private skillLevelsObserver?: IntersectionObserver;                                  // IntersectionObserver für das verzögerte Laden der Skill-Balken.

  @ViewChild('skillLevelPanel')                                                        // Panel-Referenz für die Skill-Level-Balken.
  private readonly skillLevelPanel?: ElementRef<HTMLElement>;

  readonly activeHeroHead = signal<HeroHeadKey>('default');                            // Aktuell ausgewählter Hero-Kopf.
  readonly isHeroDialogVisible = signal<boolean>(true);                                // Sichtbarkeit des interaktiven Hero-Dialogfensters.
  readonly activeAboutCoffeeImage = signal<AboutCoffeeKey>('default');                 // Aktuell sichtbarer Zustand des About-Kaffeebildes.
  readonly isAboutDialogVisible = signal<boolean>(true);                               // Sichtbarkeit des interaktiven About-Dialogfensters.
  readonly isSkillsDialogVisible = signal<boolean>(true);                              // Sichtbarkeit des Skill-Level-Dialogfensters.
  readonly areSkillLevelsLoaded = signal<boolean>(false);                              // Aktiviert die Wachstumsanimation der Skill-Level-Balken.
  private readonly heroHeadAssetMap: Record<HeroHeadKey, string> = {                   // Asset-Zuordnung für die Hero-Köpfe.
    default: 'assets/images/default-hero-head.webp',
    lol: 'assets/images/hero-head-lol.webp',
    insane: 'assets/images/hero-head-insane.webp',
    fck: 'assets/images/hero-head-fck.webp',
  };

  readonly currentHeroHeadSrcSet = computed(                                           // Responsive Varianten des Standard-Hero-Kopfes für kleine Viewports.
    /** Responsive Varianten des Standard-Hero-Kopfes für kleine Viewports. */
    () => // Responsive Varianten des Standard-Hero-Kopfes für kleine Viewports.
      this.activeHeroHead() === 'default'
        ? 'assets/images/default-hero-head-360.webp 360w, assets/images/default-hero-head-480.webp 480w, assets/images/default-hero-head-560.webp 560w, assets/images/default-hero-head.webp 720w'
        : undefined
  );

  private readonly aboutCoffeeAssetMap: Record<AboutCoffeeKey, string> = {             // Asset-Zuordnung für das About-Kaffeebild.
    default: 'assets/images/me-and-coffee.webp',
    error: 'assets/images/me-and-coffee-error.webp',
  };

  readonly content = computed(                                                         // Übersetzter Inhalt der aktuellen Sprache.
    /** Übersetzter Inhalt der aktuellen Sprache. */
    () => this.languageService.content()
  );

  readonly heroShiftXStyle = computed(                                                 // CSS-Wert für den horizontalen Parallax-Versatz.
    /** CSS-Wert für den horizontalen Parallax-Versatz. */
    () => `${this.heroShiftX()}px`
  );

  readonly heroShiftYStyle = computed(                                                 // CSS-Wert für den vertikalen Parallax-Versatz.
    /** CSS-Wert für den vertikalen Parallax-Versatz. */
    () => `${this.heroShiftY()}px`
  );

  readonly heroScrollOffsetStyle = computed(                                           // CSS-Wert für den Scroll-Versatz des Hero-Hintergrunds.
    /** CSS-Wert für den Scroll-Versatz des Hero-Hintergrunds. */
    () => `${this.heroScrollOffset()}px`
  );

  readonly currentHeroHeadSrc = computed(                                              // Pfad des aktuell sichtbaren Hero-Kopfes.
    /** Pfad des aktuell sichtbaren Hero-Kopfes. */
    () => this.heroHeadAssetMap[this.activeHeroHead()]
  );

  readonly currentAboutCoffeeSrc = computed(                                           // Pfad des aktuell sichtbaren About-Kaffeebildes.
    /** Pfad des aktuell sichtbaren About-Kaffeebildes. */
    () => this.aboutCoffeeAssetMap[this.activeAboutCoffeeImage()]
  );

  readonly currentAboutCoffeeSrcSet = computed(                                        // Responsive Varianten des About-Portraits.
    /** Responsive Varianten des About-Portraits. */
    () => // Responsive Varianten des About-Portraits.
      this.activeAboutCoffeeImage() === 'default'
        ? 'assets/images/me-and-coffee-480.webp 480w, assets/images/me-and-coffee-720.webp 720w, assets/images/me-and-coffee.webp 1122w'
        : 'assets/images/me-and-coffee-error-480.webp 480w, assets/images/me-and-coffee-error.webp 655w'
  );

  readonly aboutDialogActionLabel = computed(                                          // Beschriftung des About-Buttons passend zum aktuellen Bildzustand.
    /** Beschriftung des About-Buttons passend zum aktuellen Bildzustand. */
    () => this.activeAboutCoffeeImage() === 'error' ? this.content().about.dialogActionAfterClick : this.content().about.dialogAction
  );

  /** Initialisiert SEO-Daten reaktiv zur Sprache. */
  constructor() {
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => this.seoService.setHomeSeo(this.content().meta));
    this.updateHeroScrollOffset();
  }

  /** Initialisiert viewportabhängige Animationen nach dem Rendern der View. */
  ngAfterViewInit(): void {
    this.observeSkillLevels();
  }

  /** Räumt den Skill-Observer beim Entfernen der Seite auf. */
  ngOnDestroy(): void {
    this.skillLevelsObserver?.disconnect();
  }

  /**
   * Reagiert auf Pointer-Bewegung im Hero und verschiebt den Kopf subtil für den Parallax-Look.
   * @param event PointerEvent aus der Hero-Section.
   */
  onHeroPointerMove(event: PointerEvent): void {

    const target = event.currentTarget; // Ziel-Element für Scrollen oder Pointer-Auswertung.

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rect = target.getBoundingClientRect();                      // Gemessene Grenzen des aktuellen Elements.
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5; // Relative horizontale Pointer-Position im Hero.
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5; // Relative vertikale Pointer-Position im Hero.

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

  /** Schaltet die Metrics-Trophäe frei, sobald der absurde Rechner genutzt wird. */
  unlockMetricsAchievement(): void {
    this.achievementService.unlock('weird-units');
  }

  /** Aktualisiert den scrollabhängigen Offset für den Hero-Hintergrund. */
  @HostListener('window:scroll')
  updateHeroScrollOffset(): void {

    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0; // Aktuelle vertikale Scrollposition.

    this.heroScrollOffset.set(Math.min(scrollY * 0.18, 140));
  }

  /** Beobachtet das Skill-Level-Panel und startet Balken erst bei nahezu voller Sichtbarkeit. */
  private observeSkillLevels(): void {

    const panel = this.skillLevelPanel?.nativeElement; // Gerenderter Bereich für Messung oder Fokussteuerung.

    if (!panel || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      this.areSkillLevelsLoaded.set(true);
      return;
    }

    const threshold = this.skillLevelThreshold(panel); // Eintrittsschwelle für die verzögerte Skill-Freigabe.

    this.skillLevelsObserver = new IntersectionObserver(
      /** Beobachtet das Skill-Level-Panel und startet Balken erst bei nahezu voller Sichtbarkeit. */([entry]) => {
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
