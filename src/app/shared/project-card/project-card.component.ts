/* src/app/shared/project-card/project-card.component.ts */

/**
 * @file Projektkarte.
 * @description Wiederverwendbare Karte für die Projektübersicht.
 */

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioProject } from '../../core/models/portfolio.models';
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
  /** Projektinhalt der Karte. */
  @Input({ required: true }) project!: PortfolioProject;

  /** Label des Detail-Links. */
  @Input() detailLabel = 'Projekt öffnen';
}
