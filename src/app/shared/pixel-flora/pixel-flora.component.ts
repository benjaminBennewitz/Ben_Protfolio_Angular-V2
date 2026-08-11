/* src/app/shared/pixel-flora/pixel-flora.component.ts */

/**
 * @file Wiederverwendbare 1-Bit-Flora.
 * @description Rendert die aus dem Referenz-Sprite-Sheet vektorisierten Pflanzen als themefähige SVGs.
 */

import { Component, HostBinding, Input, computed } from '@angular/core';
import { PIXEL_FLORA, PixelFloraVariant } from './pixel-flora.data';

/** Themefähiges Flora-Sprite mit optionalem Wind-Timing. */
@Component({
  selector: 'bp-pixel-flora',
  standalone: true,
  templateUrl: './pixel-flora.component.html',
  styleUrl: './pixel-flora.component.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class PixelFloraComponent {
  /** Gewählte Pflanzengrafik. */
  @Input({ required: true }) variant: PixelFloraVariant = 'flora-01';

  /** Individuelle Winddauer für natürlichere Gruppenanimationen. */
  @Input() windDuration = '4.8s';

  /** Individuelle negative Verzögerung, damit Motive nicht synchron schwingen. */
  @Input() windDelay = '0s';

  /** Legt die Variante als Hook für optionale Detailstyles auf den Host. */
  @HostBinding('attr.data-variant')
  get hostVariant(): PixelFloraVariant {
    return this.variant;
  }

  /** Übergibt die Winddauer als CSS-Variable. */
  @HostBinding('style.--pixel-flora-wind-duration')
  get hostWindDuration(): string {
    return this.windDuration;
  }

  /** Übergibt die Windverzögerung als CSS-Variable. */
  @HostBinding('style.--pixel-flora-wind-delay')
  get hostWindDelay(): string {
    return this.windDelay;
  }

  /** Aktive Vektordefinition. */
  readonly definition = computed(() => PIXEL_FLORA[this.variant]);
}
