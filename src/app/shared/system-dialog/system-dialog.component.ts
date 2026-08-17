/* src/app/shared/system-dialog/system-dialog.component.ts */

/**
 * @file Wiederverwendbares Arcade-Tech-Systemfenster.
 * @description Zentralisiert Titelzeile, Close-Button, Escape-Verhalten und ARIA für schließbare Portfolio-Dialoge.
 */

import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

/** Einheitliche Dialogbox für technische Fenster und kleine System-Popups. */
@Component({
  selector: 'bp-system-dialog',
  standalone: true,
  templateUrl: './system-dialog.component.html',
  styleUrl: './system-dialog.component.scss',
  host: {
    class: 'bp-dos-window bp-system-dialog',
  },
})
export class SystemDialogComponent {
  /** Sichtbarer Fenstertitel. */
  @Input({ required: true }) title = '';

  /** Barrierefreier Dialogname; fällt auf den sichtbaren Titel zurück. */
  @Input() ariaLabel = '';

  /** Barrierefreie Beschriftung des Close-Buttons. */
  @Input() closeLabel = 'Dialog schließen';

  /** Kennzeichnet echte modale Dialoge für assistive Technologien. */
  @Input() modal = false;

  /** Wird bei Close-Button oder Escape ausgelöst. */
  @Output() readonly closed = new EventEmitter<void>();

  /** Standardrolle für alle echten Systemdialoge. */
  @HostBinding('attr.role') readonly role = 'dialog';

  /** Liefert den barrierefreien Namen des Fensters. */
  @HostBinding('attr.aria-label')
  get accessibleLabel(): string {
    return this.ariaLabel || this.title;
  }

  /** Setzt aria-modal nur bei tatsächlichen Modalfenstern. */
  @HostBinding('attr.aria-modal')
  get ariaModal(): 'true' | null {
    return this.modal ? 'true' : null;
  }

  /** Schließt den Dialog per Escape, wenn der Tastaturfokus innerhalb des Fensters liegt. */
  @HostListener('keydown.escape', ['$event'])
  onEscape(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closed.emit();
  }

  /** Stoppt Elterninteraktionen und delegiert das eigentliche Schließen an den Besitzer des Zustands. */
  requestClose(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.closed.emit();
  }
}
