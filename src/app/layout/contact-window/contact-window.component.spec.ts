/** @file Prüft globale Erreichbarkeit, Entwurfserhalt und die Bedienung des Kontaktfensters. */

import { DeferBlockState, TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PORTFOLIO_TRANSLATIONS } from '../../core/data/portfolio-content';
import { ContactApiService } from '../../core/services/contact-api.service';
import { GlobalOverlayService } from '../../core/services/global-overlay.service';
import { LanguageService } from '../../core/services/language.service';
import { ContactFormComponent } from '../../shared/contact-form/contact-form.component';
import { ContactWindowComponent } from './contact-window.component';

/** Prüft das Fenster mit echtem Formular, jedoch ohne ausgehende Kontaktanfrage. */
describe('ContactWindowComponent', () => {
  let fixture: ComponentFixture<ContactWindowComponent>;
  let component: ContactWindowComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ContactWindowComponent], providers: [
      provideRouter([]),
      { provide: LanguageService, useValue: { content: () => PORTFOLIO_TRANSLATIONS.de } },
      { provide: ContactApiService, useValue: { sendContactMessage: vi.fn() } },
    ] });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(ContactWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  /** Öffnet über denselben globalen Auslöser wie die Kontakt-Section. */
  async function openWindow(): Promise<void> {
    TestBed.inject(GlobalOverlayService).requestContactWindow();
    fixture.detectChanges();
    const blocks = await fixture.getDeferBlocks();
    await blocks[0].render(DeferBlockState.Complete);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it('lädt das Formular erst beim Öffnen und erhält Instanz und Entwurf beim Minimieren', async () => {
    expect(fixture.debugElement.query(By.directive(ContactFormComponent))).toBeNull();
    await openWindow();
    const form = fixture.debugElement.query(By.directive(ContactFormComponent)).componentInstance as ContactFormComponent;
    expect(fixture.nativeElement.querySelector('form').classList.contains('bp-reveal')).toBe(false);
    form.name.set('Ben');
    form.message.set('Mein noch nicht gesendeter Entwurf.');
    component.minimize();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#contact-window').hidden).toBe(true);
    component.restore();
    fixture.detectChanges();
    const restored = fixture.debugElement.query(By.directive(ContactFormComponent)).componentInstance;
    expect(restored).toBe(form);
    expect(restored.name()).toBe('Ben');
    expect(restored.message()).toBe('Mein noch nicht gesendeter Entwurf.');
  });

  it('minimiert per Escape und bietet ausschließlich Minimieren sowie Maximieren an', async () => {
    await openWindow();
    const controls = fixture.nativeElement.querySelectorAll('.contact-window__controls button');
    expect(controls).toHaveLength(2);
    fixture.nativeElement.querySelector('#contact-window').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.visible()).toBe(false);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.contact-dock'));
  });

  it('begrenzt das Ziehen auf den Viewport und erlaubt Zentrieren per Tastatur', async () => {
    await openWindow();
    const element = fixture.nativeElement.querySelector('#contact-window') as HTMLElement;
    const bar = fixture.nativeElement.querySelector('.contact-window__bar') as HTMLElement;
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 100, top: 100, width: 500, height: 400 } as DOMRect);
    Object.defineProperties(bar, {
      setPointerCapture: { value: vi.fn() },
      hasPointerCapture: { value: vi.fn(() => true) },
      releasePointerCapture: { value: vi.fn() },
    });
    /** Liefert Pointer-ähnliche Events auch für DOM-Testumgebungen ohne nativen Pointer-Konstruktor. */
    const pointer = (type: string, clientX: number, clientY: number): MouseEvent => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY, button: 0 });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      return event;
    };
    bar.dispatchEvent(pointer('pointerdown', 100, 100));
    bar.dispatchEvent(pointer('pointermove', 10000, 10000));
    expect(component.position()).toEqual({ x: Math.max(8, window.innerWidth - 508), y: Math.max(84, window.innerHeight - 408) });
    bar.dispatchEvent(pointer('pointerup', 10000, 10000));
    bar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    expect(component.position()).toBeNull();
  });

  it('wechselt die Fenstergröße und minimiert nach erfolgreichem Versand', async () => {
    await openWindow();
    component.toggleMaximized();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#contact-window').classList.contains('is-maximized')).toBe(true);
    component.toggleMaximized();
    fixture.detectChanges();
    expect(component.maximized()).toBe(false);
    const form = fixture.debugElement.query(By.directive(ContactFormComponent)).componentInstance as ContactFormComponent;
    form.submitted.emit();
    fixture.detectChanges();
    expect(component.visible()).toBe(false);
  });
});
