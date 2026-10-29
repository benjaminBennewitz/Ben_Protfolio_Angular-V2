/* src/app/shared/system-dialog/system-dialog.component.spec.ts */

import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SystemDialogComponent } from './system-dialog.component';

/** Prüft zugänglichen Dialognamen und isolierte Schließen-Ereignisse. */
describe('SystemDialogComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  afterEach(/** Entfernt Testkomponenten und stellt den Browserzustand wieder her. */() => { TestBed.resetTestingModule(); });

  it('verwendet den Titel als Label-Fallback und setzt aria-modal ausschließlich bei echten Modals', /** Verwendet den Titel als Label-Fallback und setzt aria-modal ausschließlich bei echten Modals. */() => {

    const fixture = TestBed.createComponent(SystemDialogComponent); // Angular-Testinstanz mit gerendertem Host.

    fixture.componentRef.setInput('title', 'Status');
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Status');
    expect(fixture.nativeElement.hasAttribute('aria-modal')).toBe(false);
    fixture.componentRef.setInput('ariaLabel', 'Systemstatus');
    fixture.componentRef.setInput('modal', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute('aria-label')).toBe('Systemstatus');
    expect(fixture.nativeElement.getAttribute('aria-modal')).toBe('true');
  });

  it('schließt über Button und Escape ohne die Aktion an einen Eltern-Handler weiterzugeben', /** Schließt über Button und Escape ohne die Aktion an einen Eltern-Handler weiterzugeben. */() => {

    const fixture = TestBed.createComponent(SystemDialogComponent); // Angular-Testinstanz mit gerendertem Host.
    const close = vi.fn();                                          // Erfasst das Schließen des Dialogs.
    const parent = vi.fn();                                         // Erfasst Klicks am übergeordneten Dialogcontainer.

    fixture.componentRef.setInput('title', 'Status');
    fixture.componentInstance.closed.subscribe(close);
    fixture.detectChanges();
    fixture.nativeElement.parentElement.addEventListener('click', parent);
    fixture.nativeElement.querySelector('button').click();
    fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(close).toHaveBeenCalledTimes(2);
    expect(parent).not.toHaveBeenCalled();
    fixture.nativeElement.parentElement.removeEventListener('click', parent);
  });
});
