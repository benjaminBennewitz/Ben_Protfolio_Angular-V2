/**
 * @file Wiederverwendbare Arcade-Tech-Datenvisualisierung.
 * @description Rendert Radial-, Dotted-Area- und 8-Bit-Step-Charts ohne externe Chart-Bibliothek.
 */

import { Component, Input } from '@angular/core';
import type { TelemetryChartDataPoint, TelemetryChartVariant } from '../../core/models/projects.models';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';

/** SVG-Punkt für intern berechnete Linienpfade. */
interface TelemetrySvgPoint {
  readonly x: number;                       // Horizontale Position im SVG- oder Animationsraum.
  readonly y: number;                       // Vertikale Position im SVG- oder Animationsraum.
  readonly source: TelemetryChartDataPoint; // Zugehöriger Originaldatenpunkt.
}

@Component({
  selector: 'bp-telemetry-chart',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './telemetry-chart.component.html',
  styleUrl: './telemetry-chart.component.scss',
})
export class TelemetryChartComponent {
  @Input({ required: true }) eyebrow = '';                                  // Kleine technische Beschriftung oberhalb des Charts.

  @Input({ required: true }) title = '';                                    // Sichtbarer Chart-Titel.

  @Input() description = '';                                                // Kurze Einordnung der dargestellten Daten.

  @Input() variant: TelemetryChartVariant = 'area';                         // Visualisierungsvariante.

  @Input({ required: true }) data: readonly TelemetryChartDataPoint[] = []; // Datenpunkte des Charts.

  @Input() valueSuffix = '';                                                // Optionales Suffix für Werte in Legende und Tooltip.

  @Input() maxValue?: number;                                               // Optional fest vorgegebener Maximalwert der Skala.

  @Input() chartId = 'telemetry-chart';                                     // Eindeutige ID für zugängliche SVG-Beschriftungen.

  @Input() syncParentReveal = false;                                        // Synchronisiert Reveal und Chart-Draw optional mit dem Reveal des umgebenden Telemetrie-Blocks.

  /** Sichtbarer Maximalwert mit Schutz vor Division durch null. */
  resolvedMax(): number {

    const configuredMax = this.maxValue; // Optional fest vorgegebene Obergrenze der Diagrammskala.

    if (configuredMax && configuredMax > 0) {
      return configuredMax;
    }

    return Math.max(1, ...this.data.map(/** Liefert den Messwert zur Bestimmung der oberen Skala. */(item) => item.value));
  }

  /** Aufbereitete Punkte für Area- und Step-Chart. */
  chartPoints(): readonly TelemetrySvgPoint[] {
    if (!this.data.length) {
      return [];
    }

    const left = 44;                                   // Linker Rand der Diagrammfläche.
    const right = 620;                                 // Rechter Rand der Diagrammfläche.
    const top = 24;                                    // Oberer Rand der Diagrammfläche.
    const bottom = 228;                                // Untere Basislinie der Diagrammfläche.
    const width = right - left;                        // Berechnete Breite in CSS-Pixeln.
    const height = bottom - top;                       // Berechnete Höhe in CSS-Pixeln.
    const divisor = Math.max(1, this.data.length - 1); // Mindestens eins als Teiler für gleichmäßig verteilte Punkte.
    const max = this.resolvedMax();                    // Auf mindestens eins begrenzte Diagrammobergrenze.

    return this.data.map(/** Berechnet die SVG-Koordinaten des Messpunkts. */(item, index) => ({
      x: left + (width * index) / divisor,
      y: bottom - (Math.min(item.value, max) / max) * height,
      source: item,
    }));
  }

  /** Linienpfad für weiche Dotted-Area-Charts. */
  areaLinePath(): string {

    const points = this.chartPoints(); // Aufbereitete SVG-Koordinaten der Datenreihe.

    if (!points.length) {
      return '';
    }

    return points.map(/** Erzeugt das Move- oder Line-Segment des SVG-Pfads. */(point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }

  /** Flächenpfad für weiche Dotted-Area-Charts. */
  areaFillPath(): string {

    const points = this.chartPoints(); // Aufbereitete SVG-Koordinaten der Datenreihe.

    if (!points.length) {
      return '';
    }

    const line = this.areaLinePath();       // Linienpfad der Datenreihe.
    const first = points[0];                // Erster Datenpunkt oder erstes fokussierbares Element.
    const last = points[points.length - 1]; // Letzter Datenpunkt oder letztes fokussierbares Element.

    return `${line} L ${last.x} 228 L ${first.x} 228 Z`;
  }

  /** Treppenförmiger Linienpfad für die 8-Bit-Variante. */
  stepLinePath(): string {

    const points = this.chartPoints(); // Aufbereitete SVG-Koordinaten der Datenreihe.

    if (!points.length) {
      return '';
    }

    let path = `M ${points[0].x} ${points[0].y}`; // Zusammengesetzter SVG-Pfad des Treppendiagramms.

    for (let index = 1; index < points.length; index += 1) {

      const previous = points[index - 1];                        // Vorheriger Datenpunkt der Treppenkurve.
      const current = points[index];                             // Aktueller Zähl-, Animations- oder Messwert.
      const middleX = previous.x + (current.x - previous.x) / 2; // Horizontale Mitte zwischen zwei Datenpunkten.

      path += ` H ${middleX} V ${current.y} H ${current.x}`;
    }

    return path;
  }

  /** Treppenförmiger Flächenpfad für die 8-Bit-Variante. */
  stepFillPath(): string {

    const points = this.chartPoints(); // Aufbereitete SVG-Koordinaten der Datenreihe.

    if (!points.length) {
      return '';
    }

    const first = points[0];                // Erster Datenpunkt oder erstes fokussierbares Element.
    const last = points[points.length - 1]; // Letzter Datenpunkt oder letztes fokussierbares Element.

    return `${this.stepLinePath()} L ${last.x} 228 L ${first.x} 228 Z`;
  }

  /** Radius eines einzelnen Radialrings. */
  radialRadius(index: number): number {
    return Math.max(42, 104 - index * 16);
  }

  /** Sichtbare Strichlänge eines Radialrings relativ zur 100er-Pfadskala. */
  radialDasharray(item: TelemetryChartDataPoint): string {

    const visible = (Math.min(item.value, this.resolvedMax()) / this.resolvedMax()) * 100; // Sichtbare Ringlänge auf der normierten Radialskala.

    return `${visible} ${100 - visible}`;
  }

  /** Formatiert einen sichtbaren Messwert inklusive optionalem Suffix. */
  formattedValue(item: TelemetryChartDataPoint): string {
    return `${item.value}${this.valueSuffix}`;
  }
}
