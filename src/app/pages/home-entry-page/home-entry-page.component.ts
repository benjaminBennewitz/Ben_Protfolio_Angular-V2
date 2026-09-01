/* src/app/pages/home-entry-page/home-entry-page.component.ts */

/**
 * @file Leichter Einstiegspunkt der Startseite.
 * @description Hält die umfangreiche HomePage bis zum finalen Loader-Launch aus Navigation, Netzwerk und Rendering heraus.
 */

import { Component, inject } from '@angular/core';
import { ExperienceGateService } from '../../core/services/experience-gate.service';
import { HomePageComponent } from '../home-page/home-page.component';

/** Minimaler Route-Host, der die eigentliche Startseite über Angular @defer nachlädt. */
@Component({
  selector: 'bp-home-entry-page',
  standalone: true,
  imports: [HomePageComponent],
  templateUrl: './home-entry-page.component.html',
  styleUrl: './home-entry-page.component.scss',
})
export class HomeEntryPageComponent {
  /** Globaler Freigabezustand der Portfolio-Experience. */
  readonly experienceGate = inject(ExperienceGateService);
}
