/* src/app/core/services/contact-api.service.ts */

/**
 * @file API-Schicht des Portfolio-Kontaktformulars.
 * @description Kapselt den same-origin CSRF-Handshake und den Versand an die zentrale Infrastructure API.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Erlaubter Request-Body der zentralen Contact API. */
export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly website: string;
}

/** Vom CSRF-Endpunkt erwartete Antwort. */
interface CsrfResponse {
  readonly csrfToken: string;
  readonly requestId?: string;
}

/** Fachlich relevante Fehlerklassen für nutzerfreundliches UI-Feedback. */
export type ContactApiErrorKind =
  | 'validation'
  | 'csrf'
  | 'payload-too-large'
  | 'rate-limit'
  | 'unavailable'
  | 'server'
  | 'network';

/** Typisierter API-Fehler ohne Offenlegung technischer Backend-Details. */
export class ContactApiError extends Error {
  constructor(
    readonly kind: ContactApiErrorKind,
    readonly status?: number,
  ) {
    super(`Contact API request failed: ${kind}`);
    this.name = 'ContactApiError';
  }
}

/** Kapselt CSRF-Lifecycle, Request-Whitelist und einen begrenzten CSRF-Retry. */
@Injectable({ providedIn: 'root' })
export class ContactApiService {
  /** Im Arbeitsspeicher gehaltener CSRF-Token; niemals in Web Storage persistieren. */
  private csrfToken: string | null = null;

  /** Teilt einen laufenden Versand zwischen parallelen Submit-Versuchen. */
  private pendingRequest: Promise<void> | null = null;

  /** Sendet eine Kontaktanfrage und verhindert parallele Doppel-POSTs. */
  sendContactMessage(request: ContactRequest): Promise<void> {
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    const pendingRequest = this.sendWithCsrfRetry(request).finally(() => {
      if (this.pendingRequest === pendingRequest) {
        this.pendingRequest = null;
      }
    });

    this.pendingRequest = pendingRequest;
    return pendingRequest;
  }

  /** Führt den POST aus und erneuert bei genau einem 403 den CSRF-Token einmalig. */
  private async sendWithCsrfRetry(request: ContactRequest): Promise<void> {
    let token = await this.getCsrfToken();
    let response = await this.postContact(request, token);

    if (response.status === 403) {
      this.csrfToken = null;
      token = await this.getCsrfToken();
      response = await this.postContact(request, token);
    }

    if (response.status === 202) {
      return;
    }

    throw this.createApiError(response.status);
  }

  /** Lädt den CSRF-Token aus der JSON-Antwort; der HttpOnly-Cookie bleibt Browser-Aufgabe. */
  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await this.safeFetch(environment.csrfEndpoint, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw this.createApiError(response.status);
    }

    let payload: CsrfResponse;

    try {
      payload = (await response.json()) as CsrfResponse;
    } catch {
      throw new ContactApiError('server', response.status);
    }

    if (typeof payload.csrfToken !== 'string' || !payload.csrfToken.trim()) {
      throw new ContactApiError('server', response.status);
    }

    this.csrfToken = payload.csrfToken;
    return payload.csrfToken;
  }

  /** Sendet ausschließlich den freigegebenen Contact-Request mit dem JSON-CSRF-Token. */
  private postContact(request: ContactRequest, csrfToken: string): Promise<Response> {
    return this.safeFetch(environment.contactEndpoint, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(request),
    });
  }

  /** Normalisiert reine Netzwerkfehler, ohne Request-Inhalte zu protokollieren. */
  private async safeFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
    try {
      return await fetch(input, init);
    } catch {
      throw new ContactApiError('network');
    }
  }

  /** Ordnet HTTP-Statuscodes stabilen UI-Fehlerklassen zu. */
  private createApiError(status: number): ContactApiError {
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
      return new ContactApiError('rate-limit', status);
    }

    if (status === 503) {
      return new ContactApiError('unavailable', status);
    }

    return new ContactApiError('server', status);
  }
}
