/**
 * @file Vollflächige Project-Telemetry-Section.
 * @description Kombiniert echte Projekt-KPIs mit Arcade-Tech-Charts zu einem dichten 100vh-Dashboard.
 */

import { Component, Input } from '@angular/core';
import { PortfolioProject } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { TelemetryChartComponent } from '../telemetry-chart/telemetry-chart.component';

@Component({
  selector: 'bp-project-telemetry',
  standalone: true,
  imports: [RevealOnScrollDirective, TelemetryChartComponent],
  templateUrl: './project-telemetry.component.html',
  styleUrl: './project-telemetry.component.scss',
})
export class ProjectTelemetryComponent {
  /** Projekt inklusive lokalisierter Telemetriedaten. */
  @Input({ required: true }) project!: PortfolioProject;
}
