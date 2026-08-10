/* src/app/shared/pixel-firework/pixel-firework.component.ts */

/**
 * @file Einmalige Pixel-Feuerwerk-Animation.
 * @description Startet beim ersten sichtbaren Eintritt und wiederholt sich innerhalb der laufenden SPA-Session nicht.
 */

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';

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

  /** Sichtbarkeitsobserver für den einmaligen Start. */
  private observer: IntersectionObserver | null = null;

  /** Aktiviert die CSS-Sequenz genau einmal. */
  readonly isActive = signal(false);

  /** Acht Partikelpositionen pro Feuerwerksburst. */
  readonly particles: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7];

  /** Startet die Animation beim ersten sinnvollen Sichtkontakt. */
  ngAfterViewInit(): void {
    const stage = this.stageRef?.nativeElement;

    if (!stage || hasPlayedPixelFirework) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      this.play();
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if ((entry?.intersectionRatio ?? 0) < 0.55) {
          return;
        }

        this.play();
        this.observer?.disconnect();
      },
      { threshold: [0.55] },
    );

    this.observer.observe(stage);
  }

  /** Stoppt den Observer beim Verlassen der Seite. */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Schaltet die CSS-Sequenz frei und sperrt weitere Starts in derselben SPA-Session. */
  private play(): void {
    hasPlayedPixelFirework = true;
    this.isActive.set(true);
  }
}
