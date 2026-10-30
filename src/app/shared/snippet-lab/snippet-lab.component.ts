/** @file Interaktive, lokal gekapselte Lernbeispiele für SVG, Tokens und Container Queries. */
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';

/** Koordinaten der beiden Bézier-Kontrollpunkte. */
type CurveCoordinate = 'x1' | 'y1' | 'x2' | 'y2';

/** Drei fokussierte Lernvorschauen mit unabhängigem Zustand je geöffnetem Fenster. */
@Component({
  selector: 'bp-snippet-lab',
  standalone: true,
  templateUrl: './snippet-lab.component.html',
  styleUrl: './snippet-lab.component.scss',
})
export class SnippetLabComponent {
  readonly kind = input.required<'svg' | 'tokens' | 'container'>(); // Vom Snippet-Eintrag gewählte Vorschau.
  private readonly languageService = inject(LanguageService); // Bestehende globale Sprachauswahl.
  private readonly themeService = inject(ThemeService); // Globale Theme-Auswahl als Ausgangspunkt der Vorschau.
  readonly english = computed(() => this.languageService.language() === 'en'); // Reaktive Sprache ohne Zustandsverlust.
  readonly curve = signal({ x1: 80, y1: 20, x2: 220, y2: 20 }); // Kontrollpunkte im internen SVG-Koordinatensystem.
  readonly coordinates: readonly CurveCoordinate[] = ['x1', 'y1', 'x2', 'y2'];
  readonly path = computed(/** Leitet das d-Attribut ohne zusätzliche DOM-Manipulation aus den Kontrollpunkten ab. */() => {
    const { x1, y1, x2, y2 } = this.curve();
    return `M 25 140 C ${x1} ${y1}, ${x2} ${y2}, 275 140`;
  });
  readonly theme = linkedSignal(() => this.themeService.currentTheme()); // Lokal testbar; jeder globale Wechsel synchronisiert die Vorschau erneut.
  readonly containerWidth = signal(100); // Verfügbarer Kartenplatz in Prozent der Vorschau.
  private draggedPoint: 1 | 2 | null = null; // Kontrollpunkt der laufenden Pointer-Interaktion.

  /** Übernimmt eine kontrollierte Koordinate vom nativen, tastaturbedienbaren Regler. */
  setCoordinate(key: CurveCoordinate, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.curve.update(curve => ({ ...curve, [key]: value }));
  }

  /** Bindet die Bewegung an den gewählten Kontrollpunkt, auch außerhalb seines Kreises. */
  startPointDrag(point: 1 | 2, event: PointerEvent): void {
    event.preventDefault();
    this.draggedPoint = point;
    (event.currentTarget as SVGCircleElement).setPointerCapture(event.pointerId);
  }

  /** Übersetzt Pointer-Koordinaten in die unverzerrte SVG-ViewBox. */
  movePoint(event: PointerEvent): void {
    if (!this.draggedPoint) return;
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.round(Math.max(0, Math.min(300, (event.clientX - rect.left) / rect.width * 300)));
    const y = Math.round(Math.max(0, Math.min(180, (event.clientY - rect.top) / rect.height * 180)));
    this.curve.update(curve => this.draggedPoint === 1 ? { ...curve, x1: x, y1: y } : { ...curve, x2: x, y2: y });
  }

  /** Beendet Ziehen bei Loslassen, Abbruch oder Verlust der Pointer-Bindung. */
  stopPointDrag(): void {
    this.draggedPoint = null;
  }

  /** Ändert ausschließlich die verfügbare Containerbreite, nicht den Viewport. */
  setContainerWidth(event: Event): void {
    this.containerWidth.set(Number((event.target as HTMLInputElement).value));
  }
}
