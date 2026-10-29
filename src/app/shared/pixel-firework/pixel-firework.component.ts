/* src/app/shared/pixel-firework/pixel-firework.component.ts */

/**
 * @file Einmalige Pixel-Feuerwerk-Animation.
 * @description Startet erst nach einem erfolgreich abgeschlossenen Scroll-Snap der Kompetenz-Section und wiederholt sich innerhalb der laufenden SPA-Session nicht.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, signal } from '@angular/core';

let hasPlayedPixelFirework = false; // Merkt sich modulweit, ob das Feuerwerk in dieser SPA-Session bereits abgespielt wurde.

/** Kurzes dekoratives 1-Bit-Feuerwerk. */
@Component({
  selector: 'bp-pixel-firework',
  standalone: true,
  templateUrl: './pixel-firework.component.html',
  styleUrl: './pixel-firework.component.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class PixelFireworkComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stageRef') private readonly stageRef?: ElementRef<HTMLElement>; // Referenz auf die sichtbare Feuerwerk-Bühne.
  private triggerSection?: HTMLElement;                                       // Kompetenz-Section, die den einmaligen Startzeitpunkt bestimmt.
  private snapCheckTimer = 0;                                                 // Timer für die Prüfung nach abgeschlossener Scrollbewegung.
  readonly isActive = signal(false);                                          // Aktiviert die CSS-Sequenz genau einmal.
  readonly particles: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7];           // Acht Partikelpositionen pro Feuerwerksburst.

  /** Merkt sich die Parent-Section und prüft nach einer kurzen Ruhephase den Snap-Zustand. */
  ngAfterViewInit(): void {

    const stage = this.stageRef?.nativeElement; // Gerenderte Bühne für Physik- und Pointer-Messungen.

    this.triggerSection = stage?.closest<HTMLElement>('.capabilities') ?? undefined;
    this.scheduleSnapCheck();
  }

  /** Entfernt Timer und Section-Referenz beim Verlassen der Seite. */
  ngOnDestroy(): void {
    window.clearTimeout(this.snapCheckTimer);
    this.snapCheckTimer = 0;
    this.triggerSection = undefined;
  }

  /** Plant nach dem Scrollen eine Prüfung ein, sobald die Scrollbewegung zur Ruhe gekommen ist. */
  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scheduleSnapCheck();
  }

  /** Prüft bei Browsern mit Scroll-End-Event unmittelbar den finalen Snap-Zustand. */
  @HostListener('window:scrollend')
  onWindowScrollEnd(): void {
    this.scheduleSnapCheck();
  }

  /** Wartet kurz auf das native Scroll-Snap, bevor der exakte Endzustand geprüft wird. */
  private scheduleSnapCheck(): void {
    if (hasPlayedPixelFirework) {
      return;
    }

    window.clearTimeout(this.snapCheckTimer);
    this.snapCheckTimer = window.setTimeout(/** Wartet kurz auf das native Scroll-Snap, bevor der exakte Endzustand geprüft wird. */() => {
      this.snapCheckTimer = 0;
      this.tryPlayAfterSnap();
    }, 260);
  }

  /** Startet ausschließlich, wenn die Kompetenz-Section tatsächlich am Viewport-Anfang eingerastet ist. */
  private tryPlayAfterSnap(): void {

    const section = this.triggerSection; // Gerenderte Scroll-Strecke der Designstudien.

    if (!section || hasPlayedPixelFirework) {
      return;
    }

    const rect = section.getBoundingClientRect();                                            // Gemessene Grenzen des aktuellen Elements.
    const viewportHeight = window.innerHeight;                                               // Aktuelle Höhe des Browserfensters in Pixeln.
    const viewportCenter = viewportHeight / 2;                                               // Vertikale Mitte des Browserfensters.
    const sectionCenter = rect.top + rect.height / 2;                                        // Vertikale Mitte der beobachteten Section.
    const centerTolerance = Math.max(18, viewportHeight * 0.025);                            // Zulässiger Abstand zwischen Section- und Viewportmitte.
    const visibleTop = Math.max(0, rect.top);                                                // Obere Grenze des sichtbaren Section-Anteils.
    const visibleBottom = Math.min(viewportHeight, rect.bottom);                             // Untere Grenze des sichtbaren Section-Anteils.
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);                           // Höhe des sichtbaren Section-Anteils.
    const visibleRatio = visibleHeight / Math.max(1, Math.min(rect.height, viewportHeight)); // Sichtbarer Anteil der Section zwischen null und eins.
    const isCenteredAfterSnap = Math.abs(sectionCenter - viewportCenter) <= centerTolerance; // Section liegt nach dem Einrasten im Mittelpunkt.
    const isAlmostFullyVisible = visibleRatio >= 0.97;                                       // Section ist nahezu vollständig sichtbar.

    if (!isCenteredAfterSnap || !isAlmostFullyVisible) {
      return;
    }

    this.play();
  }

  /** Schaltet die CSS-Sequenz frei und sperrt weitere Starts in derselben SPA-Session. */
  private play(): void {
    hasPlayedPixelFirework = true;
    this.isActive.set(true);
  }
}
