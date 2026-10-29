/* src/app/shared/telemetry-chart/telemetry-chart.component.spec.ts */

import { describe, expect, it } from 'vitest';
import { TelemetryChartComponent } from './telemetry-chart.component';

/** Prüft stabile SVG-Geometrie auch für leere oder einzelne Datenreihen. */
describe('TelemetryChartComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  it('vermeidet Division durch null und liefert für leere Daten keine Pfade', /** Vermeidet Division durch null und liefert für leere Daten keine Pfade. */() => {

    const chart = new TelemetryChartComponent(); // Zu prüfende Diagrammkomponente.

    expect(chart.resolvedMax()).toBe(1);
    expect(chart.areaLinePath()).toBe('');
    expect(chart.areaFillPath()).toBe('');
    expect(chart.stepLinePath()).toBe('');
    expect(chart.stepFillPath()).toBe('');
    chart.data = [{ label: 'Solo', value: 0 }];
    expect(chart.chartPoints()[0]).toMatchObject({ x: 44, y: 228 });
    expect(chart.areaLinePath()).not.toContain('NaN');
  });

  it('begrenzt Messwerte auf die konfigurierte Skala und schließt Flächen an der Basislinie', /** Begrenzt Messwerte auf die konfigurierte Skala und schließt Flächen an der Basislinie. */() => {

    const chart = new TelemetryChartComponent(); // Zu prüfende Diagrammkomponente.

    chart.data = [{ label: 'A', value: 0 }, { label: 'B', value: 200 }];
    chart.maxValue = 100;
    expect(chart.chartPoints().map(/** Stellt den für den Test benötigten Zustand bereit. */ point => [point.x, point.y])).toEqual([[44, 228], [620, 24]]);
    expect(chart.areaFillPath()).toBe('M 44 228 L 620 24 L 620 228 L 44 228 Z');
    expect(chart.stepLinePath()).toBe('M 44 228 H 332 V 24 H 620');
    expect(chart.radialDasharray(chart.data[1])).toBe('100 0');
  });

  it('erhält Wert-Suffixe und begrenzt die Radialradien nach unten', /** Erhält Wert-Suffixe und begrenzt die Radialradien nach unten. */() => {

    const chart = new TelemetryChartComponent(); // Zu prüfende Diagrammkomponente.

    chart.valueSuffix = '%';
    expect(chart.formattedValue({ label: 'A', value: 25 })).toBe('25%');
    expect(chart.radialRadius(20)).toBe(42);
  });
});
