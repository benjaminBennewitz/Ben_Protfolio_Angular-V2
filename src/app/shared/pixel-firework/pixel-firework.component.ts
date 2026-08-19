/* src/app/shared/pixel-firework/pixel-firework.component.ts */

/**
 * @file Einmalige Pixel-Feuerwerk-Animation.
 * @description Startet erst nach einem erfolgreich abgeschlossenen Scroll-Snap der Kompetenz-Section und wiederholt sich innerhalb der laufenden SPA-Session nicht.
 */

import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, signal } from '@angular/core';

/** Merkt sich modulweit, ob das Feuerwerk in dieser SPA-Session bereits abgespielt wurde. */
let hasPlayedPixelFirework = false;

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
  /** Referenz auf die sichtbare Feuerwerk-Bühne. */
  @ViewChild('stageRef') private readonly stageRef?: ElementRef<HTMLElement>;

  /** Kompetenz-Section, die den einmaligen Startzeitpunkt bestimmt. */
  private triggerSection?: HTMLElement;

  /** Timer für die Prüfung nach abgeschlossener Scrollbewegung. */
  private snapCheckTimer = 0;

  /** Aktiviert die CSS-Sequenz genau einmal. */
  readonly isActive = signal(false);

  /** Acht Partikelpositionen pro Feuerwerksburst. */
  readonly particles: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7];

  /** Merkt sich die Parent-Section und prüft nach einer kurzen Ruhephase den Snap-Zustand. */
  ngAfterViewInit(): void {
    const stage = this.stageRef?.nativeElement;
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
    this.snapCheckTimer = window.setTimeout(() => {
      this.snapCheckTimer = 0;
      this.tryPlayAfterSnap();
    }, 260);
  }

  /** Startet ausschließlich, wenn die Kompetenz-Section tatsächlich am Viewport-Anfang eingerastet ist. */
  private tryPlayAfterSnap(): void {
    const section = this.triggerSection;

    if (!section || hasPlayedPixelFirework) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    const sectionCenter = rect.top + rect.height / 2;
    const centerTolerance = Math.max(18, viewportHeight * 0.025);
    const visibleTop = Math.max(0, rect.top);
    const visibleBottom = Math.min(viewportHeight, rect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleRatio = visibleHeight / Math.max(1, Math.min(rect.height, viewportHeight));
    const isCenteredAfterSnap = Math.abs(sectionCenter - viewportCenter) <= centerTolerance;
    const isAlmostFullyVisible = visibleRatio >= 0.97;

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
