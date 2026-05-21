/* src/app/pages/home-page/home-page.component.ts */

/**
 * @file Startseite des Portfolios.
 * @description Kombiniert Hero, Über-mich, Techstack, Fullscreen-Projekte, Process-Lock, Chaos-CTA, FAQ und Kontakt.
 */

import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AchievementService } from '../../core/services/achievement.service';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { BuiltWithoutComponent } from '../../shared/built-without/built-without.component';
import { ChaosCtaComponent } from '../../shared/chaos-cta/chaos-cta.component';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { ProcessLockComponent } from '../../shared/process-lock/process-lock.component';
import { ProjectStackComponent } from '../../shared/project-stack/project-stack.component';
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

/** Hauptseite der Portfolio-Experience. */
@Component({
  selector: 'bp-home-page',
  standalone: true,
  imports: [RouterLink, RevealTextComponent, RevealOnScrollDirective, TechMarqueeComponent, ProjectStackComponent, ProcessLockComponent, BuiltWithoutComponent, ChaosCtaComponent, ContactFormComponent, ViewportActivityDirective],
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

  /** Pfad des aktuell sichtbaren Schoko-Bildes im Projekt-Einstieg. */
  readonly currentProjectsChocolateSrc = computed(() => this.projectsChocolateAssetMap[this.activeProjectsChocolateImage()]);

  /** Beschriftung des Schoko-Buttons passend zum aktuellen Bildzustand. */
  readonly projectsChocolateActionLabel = computed(() => this.activeProjectsChocolateImage() === 'eaten' ? this.content().projectsIntro.imageActionActiveLabel : this.content().projectsIntro.imageActionLabel);

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
    this.activeProjectsChocolateImage.set('eaten');
  }

  /** Setzt das Schoko-Bild bei fehlendem Asset auf ein vorhandenes Portrait zurück. */
  resetProjectsChocolateImage(): void {
    this.activeProjectsChocolateImage.set('fallback');
  }

  /** Entfernt das About-Dialogfenster aus der Startansicht. */
  closeAboutDialog(): void {
    this.isAboutDialogVisible.set(false);
  }

  /** Entfernt das Skill-Level-Dialogfenster aus dem Techstack-Bereich. */
  closeSkillsDialog(): void {
    this.isSkillsDialogVisible.set(false);
  }

  /** Entfernt das Projekt-Einstieg-Dialogfenster aus der Projektübersicht. */
  closeProjectsDialog(): void {
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

    const threshold = panel.offsetHeight > window.innerHeight ? 0.58 : 0.92;

    this.skillLevelsObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry || entry.intersectionRatio < threshold) {
          return;
        }

        this.areSkillLevelsLoaded.set(true);
        this.skillLevelsObserver?.disconnect();
      },
      { threshold: [threshold] },
    );

    this.skillLevelsObserver.observe(panel);
  }
}
