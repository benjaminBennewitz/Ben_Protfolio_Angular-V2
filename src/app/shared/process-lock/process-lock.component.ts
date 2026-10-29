/* src/app/shared/process-lock/process-lock.component.ts */

/**
 * @file Scroll-Lock-Process-Section.
 * @description Nutzt Body-Scroll und eine sticky Bühne, damit Inhalte schrittweise revealed werden.
 */

import { Component, ElementRef, HostListener, Input, ViewChild, computed, signal } from '@angular/core';
import type { ProcessStep } from '../../core/models/home.models';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';

/** Sticky Scroll-Reveal ohne globalen inneren Scrollcontainer. */
@Component({
  selector: 'bp-process-lock',
  standalone: true,
  imports: [RevealTextComponent, RevealOnScrollDirective],
  templateUrl: './process-lock.component.html',
  styleUrl: './process-lock.component.scss',
})
export class ProcessLockComponent {
  @Input({ required: true }) steps: readonly ProcessStep[] = [];                  // Prozessschritte für die Reveal-Sequenz.

  @Input() eyebrow = '';                                                          // Eyebrow-Label der Section.

  @Input() title = '';                                                            // Haupttitel der Section.

  @Input() subtitle = '';                                                         // Beschreibung der Section.

  @Input() hint = '';                                                             // Kurzer Scroll-Hinweis.

  @ViewChild('sectionRef') private readonly sectionRef?: ElementRef<HTMLElement>; // Referenz auf die gesamte Scroll-Section.
  readonly progress = signal<number>(0);                                          // Fortschritt innerhalb der Sticky-Section von 0 bis 1.
  readonly activeIndex = computed<number>(                                        // Aktiver Prozessschritt anhand des Scrollfortschritts.
    /** Aktiver Prozessschritt anhand des Scrollfortschritts. */
    () => Math.min(this.steps.length - 1, Math.floor(this.progress() * this.steps.length))
  );

  readonly objectTransform = computed<string>( // CSS-Transform des zentralen System-Cores entlang des Prozesses.
    /** Berechnet die dezente Verschiebung, Drehung und Skalierung des System-Cores. */
    () => {

      const progress = this.progress();                         // Normalisierter Fortschritt des aktuellen Ablaufs.
      const rotation = -4 + progress * 8;                       // Berechneter Drehwinkel der Karte.
      const scale = 0.96 + Math.sin(progress * Math.PI) * 0.06; // Skalierungsfaktor der aktuellen Karte.
      const y = (progress - 0.5) * 18;                          // Vertikale Position im SVG- oder Animationsraum.

      return `translate3d(0, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
    }
  );

  /** Rechnet den Fortschritt beim Scrollen und Resizen neu. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateProgress(): void {

    const element = this.sectionRef?.nativeElement; // Gerendertes Element der aktuellen Interaktion.

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();                        // Gemessene Grenzen des aktuellen Elements.
    const maxTravel = Math.max(1, rect.height - window.innerHeight);     // Maximale Scroll-Strecke des aktiven Abschnitts.
    const rawProgress = Math.min(1, Math.max(0, -rect.top / maxTravel)); // Unbegrenzter Fortschritt vor der Bereichsprüfung.

    this.progress.set(rawProgress);
  }

  /** Prüft, ob ein Schritt bereits sichtbar sein soll. */
  isStepVisible(index: number): boolean {
    return index <= this.activeIndex();
  }

  /** Prüft, ob ein Schritt als nächste Vorschaukarte angezeigt wird. */
  isNextStep(index: number): boolean {
    return index === this.activeIndex() + 1;
  }
}
