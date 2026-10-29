/* src/app/pages/privacy-page/privacy-page.component.ts */

/**
 * @file Horizontale Datenschutzerklärung des Portfolios.
 * @description Rendert die Datenschutzinformationen als 100vh-Terminaldeck und überträgt vertikale Wheel-Eingaben auf die horizontale Achse.
 */

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';
import { PRIVACY_CONTENT } from '../../core/data/privacy-data';
import type { PrivacyChapter, PrivacyPageContent } from '../../core/models/page-content.models';

const CHAPTERS_PER_PANEL = 3; // Feste Anzahl von Karten pro horizontalem Bento-Panel.

/** Terminalartige Datenschutzseite mit horizontalem Scrolldeck. */
@Component({
  selector: 'bp-privacy-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacy-page.component.html',
  styleUrl: './privacy-page.component.scss',
})
export class PrivacyPageComponent implements AfterViewInit, OnDestroy {
  private readonly languageService = inject(LanguageService);                // Sprachservice für DE/EN-Inhalte.
  private readonly seoService = inject(SeoService);                          // SEO-Service für die rechtliche Unterseite.

  @ViewChild('privacyTrack', { static: true })                               // Horizontaler Scrolltrack für native, nicht-passive Wheel-Steuerung.
  private privacyTrackRef!: ElementRef<HTMLDivElement>;

  private wheelLocked = false;                                               // Sperrt Folgesignale desselben Wheel-Gestures, damit pro Impuls genau ein Panel gewechselt wird.
  private wheelReleaseTimer: number | undefined;                             // Timer zum Freigeben des nächsten Wheel-Panelwechsels.
  readonly content = computed<PrivacyPageContent>(                           // Aktueller übersetzter Seiteninhalt.
    /** Aktueller übersetzter Seiteninhalt. */
    () => PRIVACY_CONTENT[this.languageService.language()]
  );

  readonly chapterPanels = computed<readonly (readonly PrivacyChapter[])[]>( // Zu Bento-Gruppen zusammengefasste Datenschutzkapitel.
    /** Zu Bento-Gruppen zusammengefasste Datenschutzkapitel. */
    () => {

      const chapters = this.content().chapters; // Geordnete Datenschutzkapitel der aktuellen Sprache.
      const panels: PrivacyChapter[][] = [];    // Gruppierte Kapitel oder gerenderte Snap-Panels.

      for (let index = 0; index < chapters.length; index += CHAPTERS_PER_PANEL) {
        panels.push(chapters.slice(index, index + CHAPTERS_PER_PANEL));
      }

      return panels;
    }
  );

  readonly canScrollLeft = signal<boolean>(false);                           // Gibt an, ob das Deck noch nach links gescrollt werden kann.
  readonly canScrollRight = signal<boolean>(true);                           // Gibt an, ob das Deck noch nach rechts gescrollt werden kann.
  readonly progress = signal<number>(0);                                     // Horizontaler Scrollfortschritt von 0 bis 100.

  /** Synchronisiert Meta-Daten mit der aktiven Sprache. */
  constructor() {
    effect(/** Synchronisiert Meta-Daten und abhängige Seitenzustände. */() => {

      const content = this.content(); // Übersetzte Inhalte der aktuellen Route.

      this.seoService.setPageSeo(content.metaTitle, content.metaDescription, '/datenschutz');
    });
  }

  /** Initialisiert den Scrollzustand des horizontalen Decks. */
  ngAfterViewInit(): void {
    this.updateScrollState(this.privacyTrackRef.nativeElement);
  }

  /** Räumt einen eventuell laufenden Wheel-Timer beim Verlassen der Route auf. */
  ngOnDestroy(): void {
    if (this.wheelReleaseTimer !== undefined) {
      window.clearTimeout(this.wheelReleaseTimer);
    }
  }

  /** Wechselt mit einem vertikalen oder horizontalen Wheel-Gesture automatisch zum benachbarten Panel. */
  handleWheel(event: WheelEvent, track: HTMLDivElement): void {
    if (event.ctrlKey) {
      return;
    }

    const verticalDelta = this.normalizedWheelDelta(event.deltaY, event.deltaMode);                               // Vertikale Wheel-Bewegung in Pixeln.
    const horizontalDelta = this.normalizedWheelDelta(event.deltaX, event.deltaMode);                             // Horizontale Wheel-Bewegung in Pixeln.
    const dominantDelta = Math.abs(verticalDelta) >= Math.abs(horizontalDelta) ? verticalDelta : horizontalDelta; // Betragsmäßig größere Wheel-Bewegung als Navigationsrichtung.

    if (Math.abs(dominantDelta) < 4) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.wheelLocked) {
      return;
    }

    this.wheelLocked = true;
    this.scrollToAdjacentPanel(track, dominantDelta > 0 ? 1 : -1);

    if (this.wheelReleaseTimer !== undefined) {
      window.clearTimeout(this.wheelReleaseTimer);
    }

    this.wheelReleaseTimer = window.setTimeout(/** Gibt nach der Panel-Bewegung die nächste Wheel-Geste frei. */() => {
      this.wheelLocked = false;
      this.wheelReleaseTimer = undefined;
    }, 480);
  }

  /** Normalisiert Wheel-Werte aus Pixel-, Zeilen- und Seitenmodus auf Pixel. */
  private normalizedWheelDelta(delta: number, deltaMode: number): number {
    if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return delta * 18;
    }

    if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return delta * window.innerWidth;
    }

    return delta;
  }

  /** Aktualisiert Navigationszustand und Fortschrittsanzeige des Scrolldecks. */
  updateScrollState(track: HTMLDivElement): void {

    const maximum = Math.max(0, track.scrollWidth - track.clientWidth); // Maximal erreichbare horizontale Scrollposition.
    const current = Math.min(Math.max(track.scrollLeft, 0), maximum);   // Auf den gültigen Bereich begrenzte Scrollposition.

    this.canScrollLeft.set(current > 8);
    this.canScrollRight.set(current < maximum - 8);
    this.progress.set(maximum > 0 ? (current / maximum) * 100 : 100);
  }

  /** Scrollt exakt zum benachbarten Datenschutzpanel. */
  scrollByPanel(track: HTMLDivElement, direction: -1 | 1): void {
    this.scrollToAdjacentPanel(track, direction);
  }

  /** Ermittelt das aktuell nächste Panel und scrollt exakt auf dessen Snap-Position. */
  private scrollToAdjacentPanel(track: HTMLDivElement, direction: -1 | 1): void {

    const panels = Array.from(track.querySelectorAll<HTMLElement>('.privacy-deck__panel')); // Gruppierte Kapitel oder gerenderte Snap-Panels.

    if (panels.length === 0) {
      return;
    }

    const trackLeft = track.getBoundingClientRect().left; // Linke Viewportkante des horizontalen Decks.
    let currentIndex = 0;                                 // Index des aktuell nächsten Panels oder Eintrags.
    let smallestDistance = Number.POSITIVE_INFINITY;      // Bisher kleinster Abstand zur linken Deckkante.

    panels.forEach(/** Ermittelt das zur linken Deckkante nächstgelegene Panel. */(panel, index) => {

      const distance = Math.abs(panel.getBoundingClientRect().left - trackLeft); // Abstand des Panels zur linken Deckkante.

      if (distance < smallestDistance) {
        smallestDistance = distance;
        currentIndex = index;
      }
    });

    const targetIndex = Math.min(Math.max(currentIndex + direction, 0), panels.length - 1); // Gültiger Index des nächsten Snap-Panels.

    if (targetIndex === currentIndex) {
      return;
    }

    const target = panels[targetIndex];                                                    // Ziel-Element für Scrollen oder Pointer-Auswertung.
    const targetLeft = track.scrollLeft + target.getBoundingClientRect().left - trackLeft; // Absolute Scrollposition des Zielpanels.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;    // Systemeinstellung für reduzierte Bewegung.

    track.scrollTo({
      left: targetLeft,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }
}
