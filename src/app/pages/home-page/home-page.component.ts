/* src/app/pages/home-page/home-page.component.ts */

/**
 * @file Startseite des Portfolios.
 * @description Kombiniert Hero, Über-mich, Techstack, Fullscreen-Projekte, Process-Lock, Chaos-CTA, FAQ und Kontakt.
 */

import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { ChaosCtaComponent } from '../../shared/chaos-cta/chaos-cta.component';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { ProcessLockComponent } from '../../shared/process-lock/process-lock.component';
import { ProjectStackComponent } from '../../shared/project-stack/project-stack.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll.directive';
import { RevealTextComponent } from '../../shared/reveal-text/reveal-text.component';
import { TechMarqueeComponent } from '../../shared/tech-marquee/tech-marquee.component';

/** Zustände für die auswählbaren Hero-Köpfe. */
type HeroHeadKey = 'default' | 'lol' | 'insane' | 'fck';

/** Zustände für das About-Kaffeebild. */
type AboutCoffeeKey = 'default' | 'error';

/** Hauptseite der Portfolio-Experience. */
@Component({
  selector: 'bp-home-page',
  standalone: true,
  imports: [RouterLink, RevealTextComponent, RevealOnScrollDirective, TechMarqueeComponent, ProjectStackComponent, ProcessLockComponent, ChaosCtaComponent, ContactFormComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  /** Sprachservice für alle sichtbaren Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** SEO-Service für Startseiten-Meta-Daten. */
  private readonly seoService = inject(SeoService);

  /** X-Versatz für den Hero-Parallax-Effekt. */
  private readonly heroShiftX = signal(0);

  /** Y-Versatz für den Hero-Parallax-Effekt. */
  private readonly heroShiftY = signal(0);

  /** Scroll-Versatz für den Hero-Hintergrund. */
  private readonly heroScrollOffset = signal(0);

  /** Aktuell ausgewählter Hero-Kopf. */
  readonly activeHeroHead = signal<HeroHeadKey>('default');

  /** Sichtbarkeit des interaktiven Hero-Dialogfensters. */
  readonly isHeroDialogVisible = signal<boolean>(true);

  /** Aktuell sichtbarer Zustand des About-Kaffeebildes. */
  readonly activeAboutCoffeeImage = signal<AboutCoffeeKey>('default');

  /** Sichtbarkeit des interaktiven About-Dialogfensters. */
  readonly isAboutDialogVisible = signal<boolean>(true);

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
    error: 'assets/images/me-and-coffe-error.webp',
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

  /** Initialisiert SEO-Daten reaktiv zur Sprache. */
  constructor() {
    effect(() => this.seoService.setHomeSeo(this.content().meta));
    this.updateHeroScrollOffset();
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
    this.activeHeroHead.set(head);
  }

  /** Setzt den Hero-Kopf wieder auf den Default-Zustand zurück. */
  resetHeroHead(): void {
    this.activeHeroHead.set('default');
  }

  /** Entfernt das Hero-Dialogfenster aus der Startansicht. */
  closeHeroDialog(): void {
    this.isHeroDialogVisible.set(false);
  }

  /** Wechselt im About-Bereich auf das vorbereitete Fehlerbild. */
  showAboutCoffeeError(): void {
    this.activeAboutCoffeeImage.set('error');
  }

  /** Setzt das About-Kaffeebild auf das vorhandene Standardbild zurück. */
  resetAboutCoffeeImage(): void {
    this.activeAboutCoffeeImage.set('default');
  }

  /** Entfernt das About-Dialogfenster aus der Startansicht. */
  closeAboutDialog(): void {
    this.isAboutDialogVisible.set(false);
  }

  /** Aktualisiert den scrollabhängigen Offset für den Hero-Hintergrund. */
  @HostListener('window:scroll')
  updateHeroScrollOffset(): void {
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    this.heroScrollOffset.set(Math.min(scrollY * 0.18, 140));
  }
}
