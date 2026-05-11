/* src/app/shared/contact-form/contact-form.component.ts */

/**
 * @file Kontaktformular-Komponente.
 * @description Validiert Eingaben clientseitig und bereitet eine Mailto-Nachricht vor.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

/** Einfaches Kontaktformular ohne Backend-Abhängigkeit. */
@Component({
  selector: 'bp-contact-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  /** Sprachservice für Labels und Meldungen. */
  private readonly languageService = inject(LanguageService);

  /** Übersetzter Kontaktinhalt. */
  readonly content = computed(() => this.languageService.content().contact);

  /** Name aus dem Formular. */
  readonly name = signal<string>('');

  /** E-Mail aus dem Formular. */
  readonly email = signal<string>('');

  /** Nachricht aus dem Formular. */
  readonly message = signal<string>('');

  /** Statusmeldung nach Submit. */
  readonly status = signal<string>('');

  /** Markiert einen Fehlerzustand. */
  readonly hasError = signal<boolean>(false);

  /** Aktualisiert ein Feld anhand des Eingabe-Events. */
  updateField(field: 'name' | 'email' | 'message', event: Event): void {
    const value = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement ? event.target.value : '';

    if (field === 'name') {
      this.name.set(value);
    }

    if (field === 'email') {
      this.email.set(value);
    }

    if (field === 'message') {
      this.message.set(value);
    }
  }

  /** Validiert das Formular und öffnet bei Erfolg eine vorbereitete Mail. */
  submit(): void {
    if (!this.isValid()) {
      this.hasError.set(true);
      this.status.set(this.content().errorMessage);
      return;
    }

    const subject = encodeURIComponent(`Portfolio Kontakt von ${this.name()}`);
    const body = encodeURIComponent(`${this.message()}\n\nName: ${this.name()}\nE-Mail: ${this.email()}`);

    this.hasError.set(false);
    this.status.set(this.content().successMessage);
    window.location.href = `mailto:kontakt@example.com?subject=${subject}&body=${body}`;
  }

  /** Prüft Mindestfelder und einfache E-Mail-Syntax. */
  private isValid(): boolean {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim());

    return this.name().trim().length >= 2 && emailValid && this.message().trim().length >= 10;
  }
}
