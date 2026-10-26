/* src/app/shared/reveal-text/reveal-text.component.ts */

/**
 * @file Wiederverwendbare Text-Reveal-Komponente.
 * @description Teilt Text in Wörter und nutzt dieselbe zuverlässige Freigabe wie Element-Reveals.
 */

import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { RevealObserverService } from '../../core/services/reveal-observer.service';

/** Einzelnes Wort mit globalem Animationsindex. */
interface RevealWord {
  /** Sichtbarer Wortinhalt. */
  readonly text: string;

  /** Fortlaufender Index für die Delay-Berechnung. */
  readonly index: number;
}

/** Einzelne Textzeile der Reveal-Headline. */
type RevealLine = readonly RevealWord[];

/** Rendert animierte Headlines mit gestaffelten Wort-Reveals. */
@Component({
  selector: 'bp-reveal-text',
  standalone: true,
  templateUrl: './reveal-text.component.html',
  styleUrl: './reveal-text.component.scss',
})
export class RevealTextComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** Host-Element für die richtungsunabhängige Viewport-Erkennung. */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Gemeinsame Freigabe für Text- und Element-Reveals. */
  private readonly reveals = inject(RevealObserverService);

  /** Abmeldung beim Entfernen der Komponente. */
  private stopObserving?: () => void;

  /** Optionales Eyebrow-Label über dem Titel. */
  @Input() eyebrow = '';

  /** Zu animierender Titeltext. */
  @Input({ required: true }) text = '';

  /** Überschriftenebene als CSS-Variante. */
  @Input() size: 'hero' | 'section' = 'section';

  /** Semantische Überschriftenebene. */
  @Input() level: 'h1' | 'h2' | 'h3' = 'h2';

  /** Zusätzliche Klassen für projektspezifische Titelgrößen. */
  @Input() headingClass = '';

  /** Markiert, ob die Textanimation gestartet werden darf. */
  protected readonly isVisible = signal(false);

  /** Übersprungene Inhalte bleiben beim Zurückscrollen ohne Nachanimation lesbar. */
  protected readonly isInstant = signal(false);

  /** Initialisiert die Sichtbarkeitsprüfung nach dem Rendern. */
  ngAfterViewInit(): void {
    this.stopObserving = this.reveals.observe(this.elementRef.nativeElement, (instant) => {
      this.isInstant.set(instant);
      this.isVisible.set(true);
    });
  }

  /** Entfernt eine noch ausstehende Reveal-Beobachtung. */
  ngOnDestroy(): void {
    this.stopObserving?.();
  }

  /** Vorbereitete Wörter werden nur bei einer tatsächlichen Textänderung neu aufgebaut. */
  wordLines: readonly RevealLine[] = [];

  /**
   * Aktualisiert die Wortaufteilung beim initialen Inhalt und beim Sprachwechsel.
   * @param changes Geänderte Komponenten-Inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['text']) return;
    let index = 0;
    this.wordLines = this.text
      .split(/\r?\n|<br\s*\/?>/gi)
      .map((line) => line.split(/\s+/).filter(Boolean).map((word) => ({ text: word, index: index++ })))
      .filter((line) => line.length > 0);
  }

  /** Baut die Klassenliste für die eigentliche Überschrift. */
  protected headingClassList(): string {
    const sizeClass = this.size === 'section' ? 'reveal__title--section' : '';

    return ['bp-title', 'reveal__title', sizeClass, this.headingClass].filter(Boolean).join(' ');
  }
}
