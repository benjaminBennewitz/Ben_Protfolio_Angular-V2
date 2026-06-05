/* src/app/shared/process-lock/process-lock.component.ts */

/**
 * @file Scroll-Lock-Process-Section.
 * @description Nutzt Body-Scroll und eine sticky Bühne, damit Inhalte schrittweise revealed werden.
 */

import { Component, ElementRef, HostListener, Input, ViewChild, computed, signal } from '@angular/core';
import { ProcessStep } from '../../core/models/portfolio.models';
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
  /** Prozessschritte für die Reveal-Sequenz. */
  @Input({ required: true }) steps: readonly ProcessStep[] = [];

  /** Eyebrow-Label der Section. */
  @Input() eyebrow = '';

  /** Haupttitel der Section. */
  @Input() title = '';

  /** Beschreibung der Section. */
  @Input() subtitle = '';

  /** Kurzer Scroll-Hinweis. */
  @Input() hint = '';

  /** Referenz auf die gesamte Scroll-Section. */
  @ViewChild('sectionRef') private readonly sectionRef?: ElementRef<HTMLElement>;

  /** Fortschritt innerhalb der Sticky-Section von 0 bis 1. */
  readonly progress = signal<number>(0);

  /** Aktiver Prozessschritt anhand des Scrollfortschritts. */
  readonly activeIndex = computed<number>(() => Math.min(this.steps.length - 1, Math.floor(this.progress() * this.steps.length)));

  /** CSS-Transform für das interaktive Objekt. */
  readonly objectTransform = computed<string>(() => {
    const progress = this.progress();
    const rotation = progress * 540;
    const scale = 0.84 + Math.sin(progress * Math.PI) * 0.34;
    const y = (progress - 0.5) * 34;

    return `translate3d(0, ${y}px, 0) rotate(${rotation}deg) scale(${scale})`;
  });

  /** Rechnet den Fortschritt beim Scrollen und Resizen neu. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateProgress(): void {
    const element = this.sectionRef?.nativeElement;

    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const maxTravel = Math.max(1, rect.height - window.innerHeight);
    const rawProgress = Math.min(1, Math.max(0, -rect.top / maxTravel));

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
