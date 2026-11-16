/**
 * @file Globales, verschiebbares Kontaktfenster.
 * @description Erhält Formular und Position beim Minimieren und lässt den Seiteninhalt bedienbar.
 */

import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { LanguageService } from '../../core/services/language.service';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';

/** Fensterposition in Viewport-Koordinaten. */
interface WindowPosition {
  readonly x: number;
  readonly y: number;
}

/** Ausgangspunkt einer aktiven Pointer-Bewegung. */
interface WindowDrag {
  readonly pointerId: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly position: WindowPosition;
  readonly target: HTMLElement;
}

/** Nicht modales Kontaktfenster mit dauerhaft erreichbarer minimierter Titelleiste. */
@Component({
  selector: 'bp-contact-window',
  standalone: true,
  imports: [ContactFormComponent],
  templateUrl: './contact-window.component.html',
  styleUrl: './contact-window.component.scss',
})
export class ContactWindowComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  private readonly overlays = inject(GlobalOverlayService);
  private drag?: WindowDrag;
  private focusFrame = 0;
  private sizeObserver?: ResizeObserver;
  private windowElement?: ElementRef<HTMLElement>;

  /** Begrenzt verschobene Fenster erneut, wenn Formularhinweise die Fensterhöhe verändern. */
  @ViewChild('windowElement')
  set windowRef(element: ElementRef<HTMLElement> | undefined) {
    this.windowElement = element;
    this.sizeObserver?.disconnect();
    if (element && typeof ResizeObserver !== 'undefined') {
      this.sizeObserver = new ResizeObserver(() => this.constrainPosition());
      this.sizeObserver.observe(element.nativeElement);
    }
  }
  @ViewChild('titleBar') private titleBar?: ElementRef<HTMLElement>;
  @ViewChild('dockButton') private dockButton?: ElementRef<HTMLButtonElement>;

  readonly content = computed(() => this.language.content().contact);
  readonly visible = signal(false); // Sichtbarkeit ohne Verlust der Formularinstanz.
  readonly maximized = signal(false); // Vollansicht innerhalb des verfügbaren Viewports.
  readonly position = signal<WindowPosition | null>(null); // Null verwendet die responsive CSS-Zentrierung.

  /** Verbindet globale Öffnen-Anfragen und entfernt geplante Fokuswechsel beim Abbau. */
  constructor() {
    this.overlays.contactWindowRequested$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.restore());
    this.destroyRef.onDestroy(() => {
      this.document.defaultView?.cancelAnimationFrame(this.focusFrame);
      this.sizeObserver?.disconnect();
    });
  }

  /** Stellt das Fenster samt vorhandenen Eingaben wieder her. */
  restore(): void {
    this.visible.set(true);
    this.scheduleFocus(false);
  }

  /**
   * Minimiert das Fenster, ohne die Formularinstanz zu entfernen.
   * @param returnFocus Setzt den Fokus zurück auf die minimierte Titelleiste.
   */
  minimize(returnFocus = true): void {
    this.drag = undefined;
    this.visible.set(false);
    if (returnFocus) this.scheduleFocus(true);
  }

  /** Wechselt zwischen normaler Fenstergröße und dem verfügbaren Viewport. */
  toggleMaximized(): void {
    this.drag = undefined;
    this.maximized.update((value) => !value);
    this.scheduleFocus(false);
  }

  /** Minimiert per Escape ausschließlich bei Fokus innerhalb des Fensters. */
  onEscape(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.minimize();
  }

  /** Beginnt das Ziehen an der Titelleiste; Fensterbuttons bleiben eigenständig bedienbar. */
  startDrag(event: PointerEvent): void {
    if (event.button !== 0 || this.maximized()) return;
    if (event.target instanceof Element && event.target.closest('button')) return;
    const element = this.windowElement?.nativeElement;
    const target = event.currentTarget as HTMLElement;
    if (!element) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
    const rect = element.getBoundingClientRect();
    const position = this.clampPosition({ x: rect.left, y: rect.top });
    this.position.set(position);
    this.drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, position, target };
    target.setPointerCapture(event.pointerId);
  }

  /** Aktualisiert nur während einer erfassten Pointer-Bewegung die begrenzte Fensterposition. */
  moveDrag(event: PointerEvent): void {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    this.position.set(this.clampPosition({
      x: this.drag.position.x + event.clientX - this.drag.clientX,
      y: this.drag.position.y + event.clientY - this.drag.clientY,
    }));
  }

  /** Beendet die Pointer-Erfassung auch nach einem Abbruch der Bewegung. */
  endDrag(event: PointerEvent): void {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const { target, pointerId } = this.drag;
    this.drag = undefined;
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
  }

  /**
   * Verschiebt die fokussierte Titelleiste per Pfeiltasten; Pos1 zentriert das Fenster.
   * @param event Tastaturereignis auf der Titelleiste, nicht auf ihren Buttons.
   */
  moveWithKeyboard(event: KeyboardEvent): void {
    if (event.target !== event.currentTarget || this.maximized()) return;
    if (event.key === 'Home') {
      event.preventDefault();
      this.position.set(null);
      return;
    }
    const directions: Record<string, WindowPosition> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    const element = this.windowElement?.nativeElement;
    if (!direction || !element) return;
    event.preventDefault();
    const rect = element.getBoundingClientRect();
    const distance = event.shiftKey ? 32 : 8;
    this.position.set(this.clampPosition({ x: rect.left + direction.x * distance, y: rect.top + direction.y * distance }));
  }

  /** Hält eine verschobene Titelleiste nach einer Viewport-Änderung erreichbar. */
  @HostListener('window:resize')
  constrainPosition(): void {
    const position = this.position();
    if (position && this.visible() && !this.maximized()) this.position.set(this.clampPosition(position));
  }

  /** Begrenzt die Position so, dass das gesamte Fenster innerhalb der verfügbaren Fläche bleibt. */
  private clampPosition(position: WindowPosition): WindowPosition {
    const view = this.document.defaultView;
    const element = this.windowElement?.nativeElement;
    if (!view || !element) return position;
    const rect = element.getBoundingClientRect();
    const header = Number.parseFloat(view.getComputedStyle(this.document.documentElement).getPropertyValue('--bp-header-height')) || 76;
    const minY = Math.min(header + 8, Math.max(8, view.innerHeight - rect.height - 8));
    return {
      x: Math.min(Math.max(8, position.x), Math.max(8, view.innerWidth - rect.width - 8)),
      y: Math.min(Math.max(minY, position.y), Math.max(minY, view.innerHeight - rect.height - 8)),
    };
  }

  /** Wartet den Angular-Render ab, bevor die Titelleiste oder ihr minimiertes Pendant fokussiert wird. */
  private scheduleFocus(minimized: boolean): void {
    const view = this.document.defaultView;
    if (!view) return;
    view.cancelAnimationFrame(this.focusFrame);
    this.focusFrame = view.requestAnimationFrame(() => {
      if (!minimized) this.constrainPosition();
      const target = minimized ? this.dockButton?.nativeElement : this.titleBar?.nativeElement;
      target?.focus({ preventScroll: true });
    });
  }
}
