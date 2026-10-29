/* src/app/shared/contact-form/contact-form.component.ts */

/**
 * @file Kontaktformular-Komponente.
 * @description Validiert Eingaben clientseitig und sendet freigegebene Kontaktdaten über die zentrale Infrastructure API.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import type { ContactTopic } from '../../core/models/pages.models';
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
  private static nextInstanceId = 0;                                         // Laufender Zähler für eindeutige Formular-IDs bei mehreren Formularinstanzen.
  private readonly contactApiService = inject(ContactApiService);            // API-Service für CSRF-Handshake und Contact-Request.
  private readonly languageService = inject(LanguageService);                // Sprachservice für Labels und Meldungen.
  private readonly router = inject(Router);                                  // Router für die Danke-Seite nach erfolgreichem Versand.
  readonly formId = `contact-form-${ContactFormComponent.nextInstanceId++}`; // Eindeutiger technischer Prefix für Formular- und Fehler-IDs.
  readonly nameId = `${this.formId}-name`;                                   // ID des Namenfelds.
  readonly emailId = `${this.formId}-email`;                                 // ID des E-Mail-Felds.
  readonly messageId = `${this.formId}-message`;                             // ID des Nachrichtenfelds.
  readonly privacyId = `${this.formId}-privacy`;                             // ID der Datenschutz-Checkbox.
  readonly nameErrorId = `${this.nameId}-error`;                             // ID der Namen-Fehlermeldung.
  readonly emailErrorId = `${this.emailId}-error`;                           // ID der E-Mail-Fehlermeldung.
  readonly messageErrorId = `${this.messageId}-error`;                       // ID der Nachrichten-Fehlermeldung.
  readonly privacyErrorId = `${this.privacyId}-error`;                       // ID der Datenschutz-Fehlermeldung.
  readonly content = computed(                                               // Übersetzter Kontaktinhalt.
    /** Übersetzter Kontaktinhalt. */
    () => this.languageService.content().contact
  );

  readonly name = signal<string>('');                                        // Name aus dem Formular.
  readonly email = signal<string>('');                                       // E-Mail aus dem Formular.
  readonly message = signal<string>('');                                     // Nachricht aus dem Formular.
  readonly website = signal<string>('');                                     // Unsichtbares Honeypot-Feld gegen einfache Bot-Submits.
  readonly selectedTopics = signal<readonly string[]>([]);                   // Gewählte Themen aus der Custom-Mehrfachauswahl.
  readonly privacyAccepted = signal<boolean>(false);                         // Kenntnisnahme der Datenschutzhinweise.
  readonly status = signal<string>('');                                      // Statusmeldung nach Submit.
  readonly hasSubmitted = signal<boolean>(false);                            // Markiert, dass der erste Submit-Versuch erfolgt ist.
  readonly isSubmitting = signal<boolean>(false);                            // Markiert, dass gerade ein Server-Request läuft.

  /** Aktualisiert ein Feld anhand des Eingabe-Events. */
  updateField(field: ContactField | 'website', event: Event): void {

    const value = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement ? event.target.value : ''; // Eingelesener oder normalisierter Eingabewert.

    this[field].set(value);
  }

  /** Schaltet ein Kontakt-Thema in der Custom-Mehrfachauswahl um. */
  toggleTopic(topic: ContactTopic): void {

    const selected = new Set(this.selectedTopics()); // Aktuell ausgewählte Kontakt-Themen.

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

    const checked = event.target instanceof HTMLInputElement ? event.target.checked : false; // Aktueller Zustand der Datenschutz-Checkbox.

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

    const message = this.message().trim();            // Meldung des DOS-Dialogfensters.
    const selectedTopicLabels = this.content().topics // Übersetzte Beschriftungen der gewählten Kontakt-Themen.
      .filter(/** Prüft, ob der Eintrag die Auswahlbedingung erfüllt. */(topic) => this.selectedTopics().includes(topic.value))
      .map(/** Liefert die sichtbare Beschriftung des gewählten Themas. */(topic) => topic.label);

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

    const content = this.content();                             // Übersetzte Inhalte der aktuellen Route.
    const messages: Record<ContactApiError['kind'], string> = { // Zuordnung fachlicher API-Fehler zu übersetzten UI-Meldungen.
      validation: content.validationErrorMessage,
      csrf: content.csrfErrorMessage,
      'payload-too-large': content.payloadTooLargeErrorMessage,
      'rate-limit': content.rateLimitErrorMessage,
      unavailable: content.temporaryErrorMessage,
      network: content.networkErrorMessage,
      server: content.serverErrorMessage,
    };

    return messages[error.kind];
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

    const value = this.name().trim(); // Eingelesener oder normalisierter Eingabewert.

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

    const value = this.email().trim(); // Eingelesener oder normalisierter Eingabewert.

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

    const value = this.message().trim(); // Eingelesener oder normalisierter Eingabewert.

    if (!value) {
      return this.content().messageRequiredError;
    }

    if (value.length < 10) {
      return this.content().messageLengthError;
    }

    return '';
  }
}
