/* src/app/shared/contact-form/contact-form.component.ts */

/**
 * @file Kontaktformular-Komponente.
 * @description Validiert Eingaben clientseitig und sendet vorbereitete Kontaktdaten an den späteren Server-Endpunkt.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactTopic } from '../../core/models/portfolio.models';
import { LanguageService } from '../../core/services/language.service';

/** Formularfelder mit eigener Validierung und Fehlerausgabe. */
type ContactField = 'name' | 'email' | 'message';

/** Payload für den zukünftigen serverseitigen Kontakt-Endpunkt. */
interface ContactPayload {
  /** Name des Absenders. */
  readonly name: string;
  /** E-Mail-Adresse des Absenders. */
  readonly email: string;
  /** Freitextnachricht des Absenders. */
  readonly message: string;
  /** Gewählte Themen als stabile technische Werte. */
  readonly topics: readonly string[];
}

/** Einfaches Kontaktformular mit Server-Workflow-Vorbereitung. */
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

  /** Router für die Danke-Seite nach erfolgreichem Versand. */
  private readonly router = inject(Router);

  /** Übersetzter Kontaktinhalt. */
  readonly content = computed(() => this.languageService.content().contact);

  /** Name aus dem Formular. */
  readonly name = signal<string>('');

  /** E-Mail aus dem Formular. */
  readonly email = signal<string>('');

  /** Nachricht aus dem Formular. */
  readonly message = signal<string>('');

  /** Unsichtbares Honeypot-Feld gegen einfache Bot-Submits. */
  readonly website = signal<string>('');

  /** Gewählte Themen aus der Custom-Mehrfachauswahl. */
  readonly selectedTopics = signal<readonly string[]>([]);

  /** Statusmeldung nach Submit. */
  readonly status = signal<string>('');

  /** Markiert, dass der erste Submit-Versuch erfolgt ist. */
  readonly hasSubmitted = signal<boolean>(false);

  /** Markiert, dass gerade ein Server-Request läuft. */
  readonly isSubmitting = signal<boolean>(false);

  /** Aktualisiert ein Feld anhand des Eingabe-Events. */
  updateField(field: ContactField | 'website', event: Event): void {
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

    if (field === 'website') {
      this.website.set(value);
    }
  }

  /** Schaltet ein Kontakt-Thema in der Custom-Mehrfachauswahl um. */
  toggleTopic(topic: ContactTopic): void {
    const selected = new Set(this.selectedTopics());

    if (selected.has(topic.value)) {
      selected.delete(topic.value);
    } else {
      selected.add(topic.value);
    }

    this.selectedTopics.set(Array.from(selected));
  }

  /** Prüft, ob ein Kontakt-Thema aktuell gewählt ist. */
  topicIsSelected(topic: ContactTopic): boolean {
    return this.selectedTopics().includes(topic.value);
  }

  /** Gibt zurück, ob ein Feld nach dem Submit markiert werden muss. */
  fieldHasError(field: ContactField): boolean {
    return this.fieldError(field).length > 0;
  }

  /** Gibt die aktuelle Fehlermeldung für ein Feld zurück. */
  fieldError(field: ContactField): string {
    if (!this.hasSubmitted()) {
      return '';
    }

    if (field === 'name') {
      return this.nameError();
    }

    if (field === 'email') {
      return this.emailError();
    }

    return this.messageError();
  }

  /** Sendet valide Formulardaten an den vorbereiteten Backend-Endpunkt. */
  async submit(): Promise<void> {
    this.hasSubmitted.set(true);
    this.status.set('');

    if (this.website().trim()) {
      await this.router.navigate(['/danke']);
      return;
    }

    if (!this.isValid()) {
      this.status.set(this.content().errorMessage);
      return;
    }

    await this.sendToServer();
  }

  /** Sendet die Nachricht an den zukünftigen Server-Endpunkt. */
  private async sendToServer(): Promise<void> {
    this.isSubmitting.set(true);

    try {
      const response = await fetch(this.content().endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(this.createPayload()),
      });

      if (!response.ok) {
        throw new Error(`Contact endpoint failed with status ${response.status}`);
      }

      await this.router.navigate(['/danke']);
    } catch {
      this.status.set(this.content().serverErrorMessage);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Erzeugt den typisierten Request-Body für das Backend. */
  private createPayload(): ContactPayload {
    return {
      name: this.name().trim(),
      email: this.email().trim(),
      message: this.message().trim(),
      topics: this.selectedTopics(),
    };
  }

  /** Prüft Mindestfelder und einfache E-Mail-Syntax. */
  private isValid(): boolean {
    return !this.nameError() && !this.emailError() && !this.messageError();
  }

  /** Ermittelt den Fehlertext für den Namen. */
  private nameError(): string {
    const value = this.name().trim();

    if (!value) {
      return this.content().nameRequiredError;
    }

    if (value.length < 2) {
      return this.content().nameLengthError;
    }

    return '';
  }

  /** Ermittelt den Fehlertext für die E-Mail-Adresse. */
  private emailError(): string {
    const value = this.email().trim();

    if (!value) {
      return this.content().emailRequiredError;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return this.content().emailFormatError;
    }

    return '';
  }

  /** Ermittelt den Fehlertext für die Nachricht. */
  private messageError(): string {
    const value = this.message().trim();

    if (!value) {
      return this.content().messageRequiredError;
    }

    if (value.length < 10) {
      return this.content().messageLengthError;
    }

    return '';
  }
}
