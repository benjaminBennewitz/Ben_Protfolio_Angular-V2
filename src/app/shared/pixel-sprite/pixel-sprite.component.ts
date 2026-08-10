/* src/app/shared/pixel-sprite/pixel-sprite.component.ts */

/**
 * @file Wiederverwendbare 1-Bit-Pixelmotive.
 * @description Rendert kleine SVG-Sprites mit motivspezifischen Mikroanimationen ohne externe Bildassets.
 */

import { Component, HostBinding, Input } from '@angular/core';

/** Unterstützte Motive der dekorativen Pixelwelt. */
export type PixelSpriteKind = 'bird' | 'tree' | 'flower' | 'cloud-a' | 'cloud-b' | 'cloud-c' | 'sun' | 'trex' | 'cactus' | 'car' | 'diskette';

/** Richtung für asymmetrische Motive wie Autos. */
export type PixelSpriteDirection = 'left' | 'right';

/** Kleine dekorative Pixelgrafik für wiederkehrende Szenen. */
@Component({
  selector: 'bp-pixel-sprite',
  standalone: true,
  templateUrl: './pixel-sprite.component.html',
  styleUrl: './pixel-sprite.component.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class PixelSpriteComponent {
  /** Gewähltes 1-Bit-Motiv. */
  @Input({ required: true }) kind: PixelSpriteKind = 'bird';

  /** Blick- oder Fahrtrichtung für asymmetrische Motive. */
  @Input() direction: PixelSpriteDirection = 'right';

  /** Spiegelt das Motiv als Data-Attribut für motivspezifische Styles. */
  @HostBinding('attr.data-kind')
  get hostKind(): PixelSpriteKind {
    return this.kind;
  }

  /** Spiegelt die Richtung als Data-Attribut, ohne externe Host-Klassen zu überschreiben. */
  @HostBinding('attr.data-direction')
  get hostDirection(): PixelSpriteDirection {
    return this.direction;
  }
}
