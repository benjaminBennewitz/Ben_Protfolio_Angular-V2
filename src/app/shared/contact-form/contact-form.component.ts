/* src/app/shared/contact-form/contact-form.component.ts */

/**
 * @file Kontaktformular-Komponente.
 * @description Validiert Eingaben clientseitig und sendet freigegebene Kontaktdaten über die zentrale Infrastructure API.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactTopic } from '../../core/models/portfolio.models';
import { ContactApiError, ContactApiService, ContactRequest } from '../../core/services/contact-api.service';
import { LanguageService } from '../../core/services/language.service';
import { RevealOnScrollDirective } from '../reveal-on-scroll.directive';

/** Formularfelder mit eigener Validierung und Fehlerausgabe. */
type ContactField = 'name' | 'email' | 'message';

/** Einfaches Kontaktformular mit Server-Workflow-Vorbereitung. */
@Component({
  selector: 'bp-contact-form',
  standalone: true,
  imports: [FormsModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  /** Laufender Zähler für eindeutige Formular-IDs bei mehreren Formularinstanzen. */
  private static nextInstanceId = 0;

  /** API-Service für CSRF-Handshake und Contact-Request. */
  private readonly contactApiService = inject(ContactApiService);

  /** Sprachservice für Labels und Meldungen. */
  private readonly languageService = inject(LanguageService);

  /** Router für die Danke-Seite nach erfolgreichem Versand. */
  private readonly router = inject(Router);

  /** Eindeutiger technischer Prefix für Formular- und Fehler-IDs. */
  readonly formId = `contact-form-${ContactFormComponent.nextInstanceId++}`;

  /** ID des Namenfelds. */
  readonly nameId = `${this.formId}-name`;

  /** ID des E-Mail-Felds. */
  readonly emailId = `${this.formId}-email`;

  /** ID des Nachrichtenfelds. */
  readonly messageId = `${this.formId}-message`;

  /** ID der Datenschutz-Checkbox. */
  readonly privacyId = `${this.formId}-privacy`;

  /** ID der Namen-Fehlermeldung. */
  readonly nameErrorId = `${this.nameId}-error`;

  /** ID der E-Mail-Fehlermeldung. */
  readonly emailErrorId = `${this.emailId}-error`;

  /** ID der Nachrichten-Fehlermeldung. */
  readonly messageErrorId = `${this.messageId}-error`;

  /** ID der Datenschutz-Fehlermeldung. */
  readonly privacyErrorId = `${this.privacyId}-error`;

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

  /** Kenntnisnahme der Datenschutzhinweise. */
  readonly privacyAccepted = signal<boolean>(false);

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

  /** Aktualisiert die Datenschutz-Kenntnisnahme anhand der nativen Checkbox. */
  updatePrivacyConsent(event: Event): void {
    const checked = event.target instanceof HTMLInputElement ? event.target.checked : false;
    this.privacyAccepted.set(checked);
  }

  /** Gibt zurück, ob die erforderliche Datenschutz-Kenntnisnahme fehlt. */
  privacyHasError(): boolean {
    return this.hasSubmitted() && !this.privacyAccepted();
  }

  /** Gibt zurück, ob ein Feld nach dem Submit markiert werden muss. */
  fieldHasError(field: ContactField): boolean {
    return this.fieldError(field).length > 0;
  }

  /** Gibt die passende Error-ID zurück, wenn ein Feld aktuell fehlerhaft ist. */
  fieldDescribedBy(field: ContactField): string | null {
    if (!this.fieldHasError(field)) {
      return null;
    }

    if (field === 'name') {
      return this.nameErrorId;
    }

    if (field === 'email') {
      return this.emailErrorId;
    }

    return this.messageErrorId;
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

  /** Sendet valide Formulardaten über die zentrale Infrastructure API. */
  async submit(): Promise<void> {
    if (this.isSubmitting()) {
      return;
    }

    this.hasSubmitted.set(true);
    this.status.set('');

    if (!this.isValid()) {
      this.status.set(this.content().errorMessage);
      return;
    }

    this.isSubmitting.set(true);

    try {
      await this.contactApiService.sendContactMessage(this.createPayload());
      this.resetForm();
      await this.router.navigate(['/danke']);
    } catch (error: unknown) {
      this.status.set(this.apiErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /** Erzeugt ausschließlich die vom Contact-API-Contract erlaubten Felder. */
  private createPayload(): ContactRequest {
    return {
      name: this.name().trim(),
      email: this.email().trim(),
      message: this.messageWithTopics(),
      website: this.website().trim(),
    };
  }

  /** Erhält die bestehende Themenauswahl, ohne ein zusätzliches API-Feld einzuführen. */
  private messageWithTopics(): string {
    const message = this.message().trim();
    const selectedTopicLabels = this.content().topics
      .filter((topic) => this.selectedTopics().includes(topic.value))
      .map((topic) => topic.label);

    if (!selectedTopicLabels.length) {
      return message;
    }

    return `${this.content().topicLabel}: ${selectedTopicLabels.join(', ')}\n\n${message}`;
  }

  /** Übersetzt technische API-Fehler in vorhandene nutzerfreundliche UI-Meldungen. */
  private apiErrorMessage(error: unknown): string {
    if (!(error instanceof ContactApiError)) {
      return this.content().serverErrorMessage;
    }

    if (error.kind === 'validation') {
      return this.content().validationErrorMessage;
    }

    if (error.kind === 'csrf') {
      return this.content().csrfErrorMessage;
    }

    if (error.kind === 'payload-too-large') {
      return this.content().payloadTooLargeErrorMessage;
    }

    if (error.kind === 'rate-limit') {
      return this.content().rateLimitErrorMessage;
    }

    if (error.kind === 'unavailable') {
      return this.content().temporaryErrorMessage;
    }

    if (error.kind === 'network') {
      return this.content().networkErrorMessage;
    }

    return this.content().serverErrorMessage;
  }

  /** Setzt nach erfolgreichem Versand alle Formularwerte inklusive Honeypot zurück. */
  private resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.message.set('');
    this.website.set('');
    this.selectedTopics.set([]);
    this.privacyAccepted.set(false);
    this.hasSubmitted.set(false);
    this.status.set('');
  }


  /** Prüft Mindestfelder und einfache E-Mail-Syntax. */
  private isValid(): boolean {
    return !this.nameError() && !this.emailError() && !this.messageError() && this.privacyAccepted();
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
