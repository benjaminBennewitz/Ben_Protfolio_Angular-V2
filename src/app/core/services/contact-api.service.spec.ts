/* src/app/core/services/contact-api.service.spec.ts */

/**
 * @file Tests für die Contact-API-Schicht.
 * @description Prüft CSRF-Handshake, Request-Whitelist, Retry-Grenzen, Fehlerklassen und Doppel-Submit-Schutz.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { CONTACT_LIMITS, ContactApiError, ContactApiService, ContactRequest } from './contact-api.service';

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
  vi.useRealTimers();
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
  it('entfernt zusätzliche Laufzeitfelder aus dem tatsächlichen Request', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'token' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    vi.stubGlobal('fetch', fetchMock);
    const extended = { ...REQUEST, recipient: 'other@example.com', tenant: 'other' };
    await new ContactApiService().sendContactMessage(extended);
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual(REQUEST);
  });

  it('weist einen zu großen UTF-8-Body bereits vor dem CSRF-Handshake ab', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    await expectApiError(new ContactApiService().sendContactMessage({
      ...REQUEST, message: '😀'.repeat(4500),
    }), 'payload-too-large');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['csrf', 'post'] as const)('beendet einen hängenden %s ohne automatischen POST-Retry', async stage => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>();
    if (stage === 'post') {
      fetchMock.mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'token' }));
    }
    fetchMock.mockImplementationOnce(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    const service = new ContactApiService();
    const pending = service.sendContactMessage(REQUEST);
    const assertion = expectApiError(pending, 'timeout');
    await vi.advanceTimersByTimeAsync(CONTACT_LIMITS.timeoutMs);
    await assertion;
    const lastInit = fetchMock.mock.calls.at(-1)?.[1];
    expect(lastInit?.signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(stage === 'post' ? 2 : 1);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'new-token' }))
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    if (stage === 'post') {
      fetchMock.mockReset().mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    }
    await expect(service.sendContactMessage(REQUEST)).resolves.toBeUndefined();
  });

  it('begrenzt auch einen hängenden CSRF-Response-Body', async () => {
    vi.useFakeTimers();
    const response = jsonResponse(200, {});
    vi.spyOn(response, 'json').mockImplementation(() => new Promise(() => {}));
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(response);
    vi.stubGlobal('fetch', fetchMock);
    const assertion = expectApiError(new ContactApiService().sendContactMessage(REQUEST), 'timeout');
    await vi.advanceTimersByTimeAsync(CONTACT_LIMITS.timeoutMs);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each(['2', 'date'] as const)('beachtet Retry-After als %s auch bei erneutem Submit', async header => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
    const response = jsonResponse(429, {});
    response.headers.set('Retry-After', header === 'date'
      ? new Date(Date.now() + 2000).toUTCString() : header);
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'token' }))
      .mockResolvedValueOnce(response)
      .mockResolvedValueOnce(jsonResponse(202, { status: 'accepted' }));
    vi.stubGlobal('fetch', fetchMock);
    const service = new ContactApiService();
    await expect(service.sendContactMessage(REQUEST)).rejects.toMatchObject({ retryAfterSeconds: 2 });
    await expectApiError(service.sendContactMessage(REQUEST), 'rate-limit');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2000);
    await service.sendContactMessage(REQUEST);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('behandelt ungültige CSRF-JSON-Werte als typisierten Fehler', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('null', { status: 200 })));
    await expectApiError(new ContactApiService().sendContactMessage(REQUEST), 'server');
  });

});
