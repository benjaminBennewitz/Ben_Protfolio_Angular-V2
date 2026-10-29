/* src/app/shared/project-card/project-card.component.ts */

/**
 * @file Projektkarte.
 * @description Wiederverwendbare Karte für die Projektübersicht.
 */

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { PortfolioProject } from '../../core/models/projects.models';
import { ProjectVisualComponent } from '../project-visual/project-visual.component';

/** Interaktive Projektkarte mit Preview und Tags. */
@Component({
  selector: 'bp-project-card',
  standalone: true,
  imports: [RouterLink, ProjectVisualComponent],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: PortfolioProject; // Projektinhalt der Karte.

  @Input() detailLabel = 'Projekt öffnen';               // Label des Detail-Links.
}
