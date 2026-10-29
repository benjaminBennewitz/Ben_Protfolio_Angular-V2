/**
 * @file Vollflächige Project-Telemetry-Section.
 * @description Kombiniert echte Projekt-KPIs mit Arcade-Tech-Charts zu einem dichten 100vh-Dashboard.
 */

import { Component, Input } from '@angular/core';
import type { PortfolioProject } from '../../core/models/projects.models';
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
  @Input({ required: true }) project!: PortfolioProject; // Projekt inklusive lokalisierter Telemetriedaten.
}
