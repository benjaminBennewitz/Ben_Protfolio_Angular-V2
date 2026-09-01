/* src/app/layout/critical-styles/critical-styles.component.ts */

/**
 * @file Kritische globale Startstyles.
 * @description Bindet nur Tokens und Basisstyles in den initialen Angular-Chunk ein und vermeidet eine render-blockierende globale CSS-Anfrage.
 */

import { Component, ViewEncapsulation } from '@angular/core';

/** Unsichtbarer Style-Host für den kritischen Startpfad. */
@Component({
  selector: 'bp-critical-styles',
  standalone: true,
  template: '',
  styleUrl: './critical-styles.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CriticalStylesComponent {}
