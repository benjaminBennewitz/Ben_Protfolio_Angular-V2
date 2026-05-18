/* src/app/shared/contact-form/contact-form.component.ts */

/**
 * @file Kontaktformular-Komponente.
 * @description Validiert Eingaben clientseitig und bereitet eine Mailto-Nachricht vor.
 */

import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactTopic } from '../../core/models/portfolio.models';
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

  /** Gewählte Themen aus der Custom-Mehrfachauswahl. */
  readonly selectedTopics = signal<readonly string[]>([]);

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

  /** Schaltet ein Kontakt-Thema in der Custom-Mehrfachauswahl um. */
  toggleTopic(topic: ContactTopic): void {
    this.selectedTopics.update((topics) => topics.includes(topic.value)
      ? topics.filter((value) => value !== topic.value)
      : [...topics, topic.value]);
  }

  /** Prüft, ob ein Kontakt-Thema aktuell ausgewählt ist. */
  topicIsSelected(topic: ContactTopic): boolean {
    return this.selectedTopics().includes(topic.value);
  }

  /** Validiert das Formular und öffnet bei Erfolg eine vorbereitete Mail. */
  submit(): void {
    if (!this.isValid()) {
      this.hasError.set(true);
      this.status.set(this.content().errorMessage);
      return;
    }

    const subject = encodeURIComponent(`Portfolio Kontakt von ${this.name()}`);
    const body = encodeURIComponent(this.createMailBody());

    this.hasError.set(false);
    this.status.set(this.content().successMessage);
    window.location.href = `mailto:kontakt@bennewitz.de?subject=${subject}&body=${body}`;
  }

  /** Erzeugt den Mailtext inklusive optionaler Themenauswahl. */
  private createMailBody(): string {
    const selectedLabels = this.selectedTopicLabels();
    const topicLine = selectedLabels.length ? `${this.content().topicLabel}: ${selectedLabels.join(', ')}

` : '';

    return `${topicLine}${this.message()}

Name: ${this.name()}
E-Mail: ${this.email()}`;
  }

  /** Gibt die sichtbaren Labels der gewählten Themen zurück. */
  private selectedTopicLabels(): readonly string[] {
    const selectedValues = new Set(this.selectedTopics());

    return this.content().topics
      .filter((topic) => selectedValues.has(topic.value))
      .map((topic) => topic.label);
  }

  /** Prüft Mindestfelder und einfache E-Mail-Syntax. */
  private isValid(): boolean {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim());

    return this.name().trim().length >= 2 && emailValid && this.message().trim().length >= 10;
  }
}
