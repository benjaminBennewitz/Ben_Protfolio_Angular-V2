/* src/app/core/services/tab-title.service.spec.ts */

import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { TabTitleService } from './tab-title.service';

/** Prüft Titelwechsel bei ausgeblendetem Tab und zwischenzeitlichen Routenwechseln. */
describe('TabTitleService', /** Gruppiert die Verhaltensprüfungen des Services. */() => {
  afterEach(/** Entfernt Testzustände, Timer und ersetzte Browser-APIs. */() => { TestBed.resetTestingModule(); });

  it('behält im verborgenen Tab den Rückkehrtext und zeigt danach den neuen Routentitel', /** Behält im verborgenen Tab den Rückkehrtext und zeigt danach den neuen Routentitel. */() => {

    const target = new EventTarget();                                                                 // Isoliertes Ereignisziel für Visibility-Wechsel.
    const doc = { hidden: false, title: '', addEventListener: target.addEventListener.bind(target) }; // Isoliertes Dokument für die Service-Prüfung.

    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: doc }] });

    const service = TestBed.inject(TabTitleService); // Zu prüfender Service mit isoliertem Testzustand.

    service.setActiveTitle('Projekt A');
    expect(doc.title).toBe('Projekt A');
    service.setHiddenTitle('Komm zurück');
    doc.hidden = true;
    target.dispatchEvent(new Event('visibilitychange'));
    expect(doc.title).toBe('Komm zurück');
    service.setActiveTitle('Projekt B');
    expect(doc.title).toBe('Komm zurück');
    service.setHiddenTitle('Wir warten');
    expect(doc.title).toBe('Wir warten');
    doc.hidden = false;
    target.dispatchEvent(new Event('visibilitychange'));
    expect(doc.title).toBe('Projekt B');
  });
});
