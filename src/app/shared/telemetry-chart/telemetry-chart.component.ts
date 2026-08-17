/**
 * @file Wiederverwendbare Arcade-Tech-Datenvisualisierung.
 * @description Rendert Radial-, Dotted-Area- und 8-Bit-Step-Charts ohne externe Chart-Bibliothek.
 */

import { Component, Input } from '@angular/core';
import { TelemetryChartDataPoint, TelemetryChartVariant } from '../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';

/** SVG-Punkt für intern berechnete Linienpfade. */
interface TelemetrySvgPoint {
  readonly x: number;
  readonly y: number;
  readonly source: TelemetryChartDataPoint;
}

@Component({
  selector: 'bp-telemetry-chart',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './telemetry-chart.component.html',
  styleUrl: './telemetry-chart.component.scss',
})
export class TelemetryChartComponent {
  /** Kleine technische Beschriftung oberhalb des Charts. */
  @Input({ required: true }) eyebrow = '';

  /** Sichtbarer Chart-Titel. */
  @Input({ required: true }) title = '';

  /** Kurze Einordnung der dargestellten Daten. */
  @Input() description = '';

  /** Visualisierungsvariante. */
  @Input() variant: TelemetryChartVariant = 'area';

  /** Datenpunkte des Charts. */
  @Input({ required: true }) data: readonly TelemetryChartDataPoint[] = [];

  /** Optionales Suffix für Werte in Legende und Tooltip. */
  @Input() valueSuffix = '';

  /** Optional fest vorgegebener Maximalwert der Skala. */
  @Input() maxValue?: number;

  /** Eindeutige ID für zugängliche SVG-Beschriftungen. */
  @Input() chartId = 'telemetry-chart';

  /** Synchronisiert Reveal und Chart-Draw optional mit dem Reveal des umgebenden Telemetrie-Blocks. */
  @Input() syncParentReveal = false;

  /** Sichtbarer Maximalwert mit Schutz vor Division durch null. */
  resolvedMax(): number {
    const configuredMax = this.maxValue;

    if (configuredMax && configuredMax > 0) {
      return configuredMax;
    }

    return Math.max(1, ...this.data.map((item) => item.value));
  }

  /** Aufbereitete Punkte für Area- und Step-Chart. */
  chartPoints(): readonly TelemetrySvgPoint[] {
    if (!this.data.length) {
      return [];
    }

    const left = 44;
    const right = 620;
    const top = 24;
    const bottom = 228;
    const width = right - left;
    const height = bottom - top;
    const divisor = Math.max(1, this.data.length - 1);
    const max = this.resolvedMax();

    return this.data.map((item, index) => ({
      x: left + (width * index) / divisor,
      y: bottom - (Math.min(item.value, max) / max) * height,
      source: item,
    }));
  }

  /** Linienpfad für weiche Dotted-Area-Charts. */
  areaLinePath(): string {
    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }

  /** Flächenpfad für weiche Dotted-Area-Charts. */
  areaFillPath(): string {
    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    const line = this.areaLinePath();
    const first = points[0];
    const last = points[points.length - 1];

    return `${line} L ${last.x} 228 L ${first.x} 228 Z`;
  }

  /** Treppenförmiger Linienpfad für die 8-Bit-Variante. */
  stepLinePath(): string {
    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const middleX = previous.x + (current.x - previous.x) / 2;
      path += ` H ${middleX} V ${current.y} H ${current.x}`;
    }

    return path;
  }

  /** Treppenförmiger Flächenpfad für die 8-Bit-Variante. */
  stepFillPath(): string {
    const points = this.chartPoints();

    if (!points.length) {
      return '';
    }

    const first = points[0];
    const last = points[points.length - 1];

    return `${this.stepLinePath()} L ${last.x} 228 L ${first.x} 228 Z`;
  }

  /** Radius eines einzelnen Radialrings. */
  radialRadius(index: number): number {
    return Math.max(42, 104 - index * 16);
  }

  /** Sichtbare Strichlänge eines Radialrings relativ zur 100er-Pfadskala. */
  radialDasharray(item: TelemetryChartDataPoint): string {
    const visible = (Math.min(item.value, this.resolvedMax()) / this.resolvedMax()) * 100;

    return `${visible} ${100 - visible}`;
  }

  /** Formatiert einen sichtbaren Messwert inklusive optionalem Suffix. */
  formattedValue(item: TelemetryChartDataPoint): string {
    return `${item.value}${this.valueSuffix}`;
  }
}
