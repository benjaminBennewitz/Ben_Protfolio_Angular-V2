/* src/app/core/services/contact-api.service.spec.ts */

/**
 * @file Tests für die Contact-API-Schicht.
 * @description Prüft CSRF-Handshake, Request-Whitelist, Retry-Grenzen, Fehlerklassen und Doppel-Submit-Schutz.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { ContactApiError, ContactApiService, ContactRequest } from './contact-api.service';

/** Gültiger Test-Request inklusive leerem Honeypot. */
const REQUEST: ContactRequest = {
  name: 'Max Mustermann',
  email: 'max@example.com',
  message: 'Eine ausreichend lange Testnachricht.',
  website: '',
};

/** Erzeugt eine JSON-Response mit dem gewünschten HTTP-Status. */
function jsonResponse(status: number, body: object): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Erwartet einen typisierten ContactApiError mit der angegebenen Fehlerklasse. */
async function expectApiError(promise: Promise<void>, kind: ContactApiError['kind']): Promise<void> {
  await expect(promise).rejects.toMatchObject({ name: 'ContactApiError', kind });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('ContactApiService', () => {
  it('lädt den CSRF-Token per same-origin GET und übernimmt ihn in den POST-Header', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token', requestId: 'csrf-request' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted', requestId: 'contact-request' }));
    vi.stubGlobal('fetch', fetchMock);

    await new ContactApiService().sendContactMessage(REQUEST);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      environment.csrfEndpoint,
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      environment.contactEndpoint,
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-CSRFToken': 'csrf-token',
        }),
      }),
    );
  });

  it('sendet ausschließlich name, email, message und website', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    vi.stubGlobal('fetch', fetchMock);

    await new ContactApiService().sendContactMessage({ ...REQUEST, website: 'automation-test' });

    const postInit = fetchMock.mock.calls[1]?.[1];
    const body = JSON.parse(String(postInit?.body)) as Record<string, unknown>;

    expect(Object.keys(body).sort()).toEqual(['email', 'message', 'name', 'website']);
    expect(body['website']).toBe('automation-test');
  });

  it('behandelt HTTP 202 als erfolgreichen Versand', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(new ContactApiService().sendContactMessage(REQUEST)).resolves.toBeUndefined();
  });

  it('ordnet HTTP 400 einem Validierungsfehler zu', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token' }))
      .mockResolvedValueOnce(jsonResponse(400, { status: 'invalid' }));
    vi.stubGlobal('fetch', fetchMock);

    await expectApiError(new ContactApiService().sendContactMessage(REQUEST), 'validation');
  });

  it('erneuert den CSRF-Token nach dem ersten 403 genau einmal und wiederholt den POST', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-1' }))
      .mockResolvedValueOnce(jsonResponse(403, { status: 'csrf_failed' }))
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-2' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    vi.stubGlobal('fetch', fetchMock);

    await new ContactApiService().sendContactMessage(REQUEST);

    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[3]?.[1]?.headers).toEqual(
      expect.objectContaining({ 'X-CSRFToken': 'csrf-token-2' }),
    );
  });

  it('führt nach einem zweiten 403 keinen weiteren Retry aus', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-1' }))
      .mockResolvedValueOnce(jsonResponse(403, { status: 'csrf_failed' }))
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-2' }))
      .mockResolvedValueOnce(jsonResponse(403, { status: 'csrf_failed' }));
    vi.stubGlobal('fetch', fetchMock);

    await expectApiError(new ContactApiService().sendContactMessage(REQUEST), 'csrf');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it.each([
    [413, 'payload-too-large'],
    [429, 'rate-limit'],
    [503, 'unavailable'],
    [500, 'server'],
  ] as const)('ordnet HTTP %s der Fehlerklasse %s zu', async (status, kind) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token' }))
      .mockResolvedValueOnce(jsonResponse(status, { status: 'error' }));
    vi.stubGlobal('fetch', fetchMock);

    await expectApiError(new ContactApiService().sendContactMessage(REQUEST), kind);
  });

  it('liefert bei einem Netzwerkfehler einen sauberen Fehlerzustand', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Network error')));

    await expectApiError(new ContactApiService().sendContactMessage(REQUEST), 'network');
  });

  it('verhindert parallele Doppel-Submits durch Wiederverwendung des laufenden Requests', async () => {
    let resolvePost!: (response: Response) => void;
    const postResponse = new Promise<Response>((resolve) => {
      resolvePost = resolve;
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token' }))
      .mockImplementationOnce(() => postResponse);
    vi.stubGlobal('fetch', fetchMock);

    const service = new ContactApiService();
    const firstRequest = service.sendContactMessage(REQUEST);
    const secondRequest = service.sendContactMessage(REQUEST);

    expect(secondRequest).toBe(firstRequest);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    resolvePost(jsonResponse(202, { status: 'accepted' }));
    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([undefined, undefined]);
  });
});
