/**
 * @file Schmale Qualitäts-Section.
 * @description Zeigt bewusste technische Entscheidungen und automatisch abgeleitete Portfolio-Telemetrie.
 */

import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';
import { TelemetryChartDataPoint } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';
import { RevealTextComponent } from '../reveal-text/reveal-text.component';
import { TelemetryChartComponent } from '../telemetry-chart/telemetry-chart.component';
import { ViewportActivityDirective } from '../viewport-activity.directive';

/** Kompakte Section für Qualitätsaussagen und echte Portfolio-Daten. */
@Component({
  selector: 'bp-built-without',
  standalone: true,
  imports: [RevealOnScrollDirective, RevealTextComponent, TelemetryChartComponent, ViewportActivityDirective],
  templateUrl: './built-without.component.html',
  styleUrl: './built-without.component.scss',
})
export class BuiltWithoutComponent {
  /** Sprachservice für übersetzte Section-Inhalte. */
  private readonly languageService = inject(LanguageService);

  /** Übersetzter Section-Inhalt. */
  readonly content = computed(() => this.languageService.content().builtWithout);

  /** Aktuelle Case Studies als Quelle der automatisch abgeleiteten Chart-Werte. */
  private readonly projects = computed(() => this.languageService.content().projects);

  /** Häufigste Technologien über alle dokumentierten Projekt-Stacks hinweg. */
  readonly recurringTechData = computed<readonly TelemetryChartDataPoint[]>(() => {
    const counts = new Map<string, { label: string; value: number }>();

    for (const project of this.projects()) {
      for (const technology of project.techStack) {
        const key = technology.trim().toLocaleLowerCase();
        const current = counts.get(key);
        counts.set(key, {
          label: current?.label ?? technology,
          value: (current?.value ?? 0) + 1,
        });
      }
    }

    return [...counts.values()]
      .sort((left, right) => right.value - left.value || left.label.localeCompare(right.label))
      .slice(0, 5);
  });

  /** Anzahl der dokumentierten Stack-Bausteine pro Case Study. */
  readonly stackBreadthData = computed<readonly TelemetryChartDataPoint[]>(() => this.projects().map((project) => ({
    label: this.shortProjectLabel(project.name),
    value: project.techStack.length,
  })));

  /** Kürzt lange Projektnamen für kompakte SVG-Achsen. */
  private shortProjectLabel(name: string): string {
    const normalized = name
      .replace(' – Eine Welt reagiert', '')
      .replace(' – A World Reacts', '')
      .replace('Dein Fußabdruck', 'Fußabdruck');

    return normalized.length > 12 ? `${normalized.slice(0, 11)}…` : normalized;
  }
}
