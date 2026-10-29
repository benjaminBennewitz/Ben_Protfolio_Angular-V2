/* src/app/shared/contact-form/contact-form.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { ContactApiError, ContactApiService, type ContactApiErrorKind } from '../../core/services/contact-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ContactFormComponent } from './contact-form.component';

/** Prüft Validierung, Request-Contract, Doppel-Submit-Sperre und übersetzte API-Fehler. */
describe('ContactFormComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  let form: ContactFormComponent;                    // Zu prüfendes Kontaktformular.
  const content = PORTFOLIO_TRANSLATIONS.de.contact; // Deutsche Formulartexte und Themen.

  /** Setzt die minimal nötigen gültigen Eingaben für den Versand. */
  function fillForm(): void {
    form.name.set('  Ben  ');
    form.email.set(' ben@example.org ');
    form.message.set('  Eine ausreichend lange Nachricht.  ');
    form.privacyAccepted.set(true);
  }

  beforeEach(/** Bereitet isolierte Komponenten und Service-Doubles vor. */() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LanguageService, useValue: { content: /** Stellt den für den Test benötigten Zustand bereit. */ () => PORTFOLIO_TRANSLATIONS.de } },
        { provide: ContactApiService, useValue: { sendContactMessage: vi.fn().mockResolvedValue(undefined) } },
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
      ]
    });
    TestBed.overrideComponent(ContactFormComponent, { set: { template: '', imports: [] } });
    form = TestBed.createComponent(ContactFormComponent).componentInstance;
  });

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); });

  it('zeigt Fehler erst nach Submit, blockiert ungültige Eingaben und verknüpft Error-IDs', /** Zeigt Fehler erst nach Submit, blockiert ungültige Eingaben und verknüpft Error-IDs. */ async () => {
    expect(form.fieldError('name')).toBe('');
    await form.submit();
    expect(form.fieldError('name')).toBe(content.nameRequiredError);
    expect(form.fieldDescribedBy('name')).toBe(form.nameErrorId);
    expect(form.privacyHasError()).toBe(true);
    expect(TestBed.inject(ContactApiService).sendContactMessage).not.toHaveBeenCalled();
    fillForm();
    form.email.set('invalid');
    await form.submit();
    expect(form.fieldError('email')).toBe(content.emailFormatError);
    expect(form.fieldDescribedBy('name')).toBeNull();
  });

  it('übernimmt Eingaben aller vier Felder und entfernt ein erneut gewähltes Thema', /** Übernimmt Eingaben aller vier Felder und entfernt ein erneut gewähltes Thema. */() => {

    const input = document.createElement('input'); // Simuliertes Eingabefeld.
    const event = new Event('input');              // Eingabeereignis mit dem simulierten Zielfeld.
    const topic = content.topics[0];               // Für die Auswahlprüfung verwendetes Thema.

    input.value = 'Testwert';
    Object.defineProperty(event, 'target', { value: input });
    form.updateField('name', event);
    form.updateField('email', event);
    form.updateField('message', event);
    form.updateField('website', event);
    expect([form.name(), form.email(), form.message(), form.website()]).toEqual(Array(4).fill('Testwert'));
    form.toggleTopic(topic);
    expect(form.topicIsSelected(topic)).toBe(true);
    form.toggleTopic(topic);
    expect(form.topicIsSelected(topic)).toBe(false);
  });

  it('sendet ausschließlich erlaubte Felder mit Themen im Nachrichtentext und navigiert nach Erfolg', /** Sendet ausschließlich erlaubte Felder mit Themen im Nachrichtentext und navigiert nach Erfolg. */ async () => {
    fillForm();
    form.toggleTopic(content.topics[0]);
    await form.submit();
    expect(TestBed.inject(ContactApiService).sendContactMessage).toHaveBeenCalledExactlyOnceWith({
      name: 'Ben', email: 'ben@example.org', website: '',
      message: `${content.topicLabel}: ${content.topics[0].label}\n\nEine ausreichend lange Nachricht.`,
    });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledExactlyOnceWith(['/danke']);
    expect(form.name()).toBe('');
    expect(form.privacyAccepted()).toBe(false);
    expect(form.hasSubmitted()).toBe(false);
  });

  it('blockiert einen zweiten Submit bis der laufende Request abgeschlossen ist', /** Blockiert einen zweiten Submit bis der laufende Request abgeschlossen ist. */ async () => {

    let resolveRequest!: () => void;                                                                                                       // Gibt den laufenden Test-Request frei.
    const pending = new Promise<void>(/** Stellt den für den Test benötigten Zustand bereit. */ resolve => { resolveRequest = resolve; }); // Bis zur expliziten Freigabe laufender Request.

    vi.mocked(TestBed.inject(ContactApiService).sendContactMessage).mockReturnValueOnce(pending);
    fillForm();

    const first = form.submit(); // Erster, noch laufender Formularversand.

    await form.submit();
    expect(form.isSubmitting()).toBe(true);
    expect(TestBed.inject(ContactApiService).sendContactMessage).toHaveBeenCalledOnce();
    resolveRequest();
    await first;
    expect(form.isSubmitting()).toBe(false);
  });

  it.each([
    ['validation', 'validationErrorMessage'], ['csrf', 'csrfErrorMessage'],
    ['payload-too-large', 'payloadTooLargeErrorMessage'], ['rate-limit', 'rateLimitErrorMessage'],
    ['unavailable', 'temporaryErrorMessage'], ['network', 'networkErrorMessage'], ['server', 'serverErrorMessage'],
  ] as const)('übersetzt den Fehler %s und bewahrt die Eingaben für einen erneuten Versuch', /** Stellt den für den Test benötigten Zustand bereit. */ async (kind, key) => {
    vi.mocked(TestBed.inject(ContactApiService).sendContactMessage).mockRejectedValueOnce(new ContactApiError(kind as ContactApiErrorKind));
    fillForm();
    await form.submit();
    expect(form.status()).toBe(content[key]);
    expect(form.name()).toBe('  Ben  ');
    expect(form.isSubmitting()).toBe(false);
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });
});
