/* src/app/shared/reveal-text/reveal-text.component.ts */

/**
 * @file Wiederverwendbare Text-Reveal-Komponente.
 * @description Teilt Text in Wörter und nutzt dieselbe zuverlässige Freigabe wie Element-Reveals.
 */

import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject, signal } from '@angular/core';
import { RevealObserverService } from '../../core/services/reveal-observer.service';

/** Einzelnes Wort mit globalem Animationsindex. */
interface RevealWord {
  readonly text: string;  // Sichtbarer Wortinhalt.
  readonly index: number; // Fortlaufender Index für die Delay-Berechnung.
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
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef); // Host-Element für die richtungsunabhängige Viewport-Erkennung.
  private readonly reveals = inject(RevealObserverService);                  // Gemeinsame Freigabe für Text- und Element-Reveals.
  private stopObserving?: () => void;                                        // Abmeldung beim Entfernen der Komponente.

  @Input() eyebrow = '';                                                     // Optionales Eyebrow-Label über dem Titel.

  @Input({ required: true }) text = '';                                      // Zu animierender Titeltext.

  @Input() size: 'hero' | 'section' = 'section';                             // Überschriftenebene als CSS-Variante.

  @Input() level: 'h1' | 'h2' | 'h3' = 'h2';                                 // Semantische Überschriftenebene.

  @Input() headingClass = '';                                                // Zusätzliche Klassen für projektspezifische Titelgrößen.

  protected readonly isVisible = signal(false);                              // Markiert, ob die Textanimation gestartet werden darf.

  protected readonly isInstant = signal(false);                              // Übersprungene Inhalte bleiben beim Zurückscrollen ohne Nachanimation lesbar.

  /** Initialisiert die Sichtbarkeitsprüfung nach dem Rendern. */
  ngAfterViewInit(): void {
    this.stopObserving = this.reveals.observe(this.elementRef.nativeElement, /** Initialisiert die Sichtbarkeitsprüfung nach dem Rendern. */(instant) => {
      this.isInstant.set(instant);
      this.isVisible.set(true);
    });
  }

  /** Entfernt eine noch ausstehende Reveal-Beobachtung. */
  ngOnDestroy(): void {
    this.stopObserving?.();
  }

  wordLines: readonly RevealLine[] = []; // Vorbereitete Wörter werden nur bei einer tatsächlichen Textänderung neu aufgebaut.

  /**
   * Aktualisiert die Wortaufteilung beim initialen Inhalt und beim Sprachwechsel.
   * @param changes Geänderte Komponenten-Inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['text']) return;

    let index = 0; // Aktueller Eintrags- oder Schleifenindex.

    this.wordLines = this.text
      .split(/\r?\n|<br\s*\/?>/gi)
      .map(/** Zerlegt die Textzeile in einzeln animierbare Wörter. */(line) => line.split(/\s+/).filter(Boolean).map(/** Verknüpft das Wort mit seinem fortlaufenden Animationsindex. */(word) => ({ text: word, index: index++ })))
      .filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(line) => line.length > 0);
  }

  /** Baut die Klassenliste für die eigentliche Überschrift. */
  protected headingClassList(): string {

    const sizeClass = this.size === 'section' ? 'reveal__title--section' : ''; // CSS-Größenklasse des visuellen Projektbereichs.

    return ['bp-title', 'reveal__title', sizeClass, this.headingClass].filter(Boolean).join(' ');
  }
}
