/* src/app/core/services/contact-api.service.ts */

/**
 * @file API-Schicht des Portfolio-Kontaktformulars.
 * @description Kapselt den same-origin CSRF-Handshake und den Versand an die zentrale Infrastructure API.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Erlaubter Request-Body der zentralen Contact API. */
export interface ContactRequest {
  readonly name: string;    // Name der kontaktierenden Person.
  readonly email: string;   // E-Mail-Adresse für die Rückantwort.
  readonly message: string; // Inhalt der Kontaktanfrage.
  readonly website: string; // Unsichtbares Honeypot-Feld zur Spam-Erkennung.
}

/** Mit der Contact API abgestimmte Feld-, Body- und Zeitlimits. */
export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  message: 5000,
  bodyBytes: 16 * 1024,
  timeoutMs: 20_000,
} as const;

/** Serialisiert ausschließlich die vier freigegebenen Felder, auch bei zusätzlichen Laufzeiteigenschaften. */
export function serializeContactRequest(request: ContactRequest): string {
  return JSON.stringify({
    name: request.name,
    email: request.email,
    message: request.message,
    website: request.website,
  });
}

/** Vom CSRF-Endpunkt erwartete Antwort. */
interface CsrfResponse {
  readonly csrfToken: string;  // Vom Server bereitgestellter CSRF-Token.
  readonly requestId?: string; // Optionale Kennung des CSRF-Requests.
}

/** Fachlich relevante Fehlerklassen für nutzerfreundliches UI-Feedback. */
export type ContactApiErrorKind =
  | 'validation'
  | 'csrf'
  | 'payload-too-large'
  | 'rate-limit'
  | 'unavailable'
  | 'server'
  | 'network'
  | 'timeout';

/** Typisierter API-Fehler ohne Offenlegung technischer Backend-Details. */
export class ContactApiError extends Error {
  /** Erzeugt den typisierten Kontaktfehler mit Fehlerklasse und HTTP-Status. */
  constructor(
    readonly kind: ContactApiErrorKind, // Fachliche Fehlerklasse für das UI.
    readonly status?: number,          // Optionaler HTTP-Status der Antwort.
    readonly retryAfterSeconds?: number,
  ) {
    super(`Contact API request failed: ${kind}`);
    this.name = 'ContactApiError';
  }
}

/** Kapselt CSRF-Lifecycle, Request-Whitelist und einen begrenzten CSRF-Retry. */
@Injectable({ providedIn: 'root' })
export class ContactApiService {
  /** Ende der vom Server vorgegebenen Wartezeit, auch bei neu erstelltem Formular. */
  private retryAfterUntil = 0;
  private csrfToken: string | null = null;             // Im Arbeitsspeicher gehaltener CSRF-Token; niemals in Web Storage persistieren.
  private pendingRequest: Promise<void> | null = null; // Teilt einen laufenden Versand zwischen parallelen Submit-Versuchen.

  /** Sendet eine Kontaktanfrage und verhindert parallele Doppel-POSTs. */
  sendContactMessage(request: ContactRequest): Promise<void> {
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    if (Date.now() < this.retryAfterUntil) {
      return Promise.reject(new ContactApiError(
        'rate-limit', 429, Math.ceil((this.retryAfterUntil - Date.now()) / 1000),
      ));
    }

    const body = serializeContactRequest(request);
    if (new TextEncoder().encode(body).byteLength > CONTACT_LIMITS.bodyBytes) {
      return Promise.reject(new ContactApiError('payload-too-large'));
    }

    const pendingRequest = this.sendWithTimeout(body).finally(/** Gibt den abgeschlossenen Versand für nachfolgende Anfragen frei. */() => { // Gemeinsam verwendetes Promise des laufenden Versands.
      if (this.pendingRequest === pendingRequest) {
        this.pendingRequest = null;
      }
    });

    this.pendingRequest = pendingRequest;
    return pendingRequest;
  }

  /** Begrenzt den gesamten Ablauf einschließlich CSRF-Body; ein Timeout wiederholt keinen POST. */
  private async sendWithTimeout(body: string): Promise<void> {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ContactApiError('timeout'));
        controller.abort();
      }, CONTACT_LIMITS.timeoutMs);
    });

    try {
      await Promise.race([this.sendWithCsrfRetry(body, controller.signal), timeout]);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** Führt den POST aus und erneuert bei genau einem 403 den CSRF-Token einmalig. */
  private async sendWithCsrfRetry(body: string, signal: AbortSignal): Promise<void> {

    let token = await this.getCsrfToken(signal);                 // CSRF-Token für den aktuellen Versandversuch.
    let response = await this.postContact(body, token, signal); // HTTP-Antwort des aktuellen API-Aufrufs.

    if (response.status === 403) {
      this.csrfToken = null;
      token = await this.getCsrfToken(signal);
      response = await this.postContact(body, token, signal);
    }

    if (response.status === 202) {
      return;
    }

    throw this.createApiError(response);
  }

  /** Lädt den CSRF-Token aus der JSON-Antwort; der HttpOnly-Cookie bleibt Browser-Aufgabe. */
  private async getCsrfToken(signal: AbortSignal): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await this.safeFetch(environment.csrfEndpoint, { // HTTP-Antwort des aktuellen API-Aufrufs.
      method: 'GET',
      signal,
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw this.createApiError(response);
    }

    let payload: CsrfResponse; // Geprüfte JSON-Antwort des CSRF-Endpunkts.

    try {
      payload = (await response.json()) as CsrfResponse;
    } catch {
      throw new ContactApiError('server', response.status);
    }

    if (!payload || typeof payload.csrfToken !== 'string' || !payload.csrfToken.trim()) {
      throw new ContactApiError('server', response.status);
    }

    signal.throwIfAborted();
    this.csrfToken = payload.csrfToken;
    return payload.csrfToken;
  }

  /** Sendet ausschließlich den freigegebenen Contact-Request mit dem JSON-CSRF-Token. */
  private postContact(body: string, csrfToken: string, signal: AbortSignal): Promise<Response> {
    return this.safeFetch(environment.contactEndpoint, {
      method: 'POST',
      signal,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body,
    });
  }

  /** Normalisiert reine Netzwerkfehler, ohne Request-Inhalte zu protokollieren. */
  private async safeFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
    try {
      init.signal?.throwIfAborted();
      return await fetch(input, init);
    } catch {
      throw new ContactApiError('network');
    }
  }

  /** Ordnet HTTP-Statuscodes stabilen UI-Fehlerklassen zu. */
  private createApiError(response: Response): ContactApiError {
    const status = response.status;
    if (status === 400) {
      return new ContactApiError('validation', status);
    }

    if (status === 403) {
      return new ContactApiError('csrf', status);
    }

    if (status === 413) {
      return new ContactApiError('payload-too-large', status);
    }

    if (status === 429) {
      const header = response.headers.get('Retry-After')?.trim() ?? '';
      const seconds = /^\d+$/.test(header)
        ? Number(header)
        : (Date.parse(header) - Date.now()) / 1000;
      const retryAfter = Number.isFinite(seconds) && seconds > 0
        ? Math.ceil(seconds)
        : undefined;
      if (retryAfter) {
        this.retryAfterUntil = Date.now() + retryAfter * 1000;
      }
      return new ContactApiError('rate-limit', status, retryAfter);
    }

    if (status === 503) {
      return new ContactApiError('unavailable', status);
    }

    return new ContactApiError('server', status);
  }
}
