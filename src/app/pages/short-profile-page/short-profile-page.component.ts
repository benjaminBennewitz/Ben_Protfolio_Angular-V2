/**
 * @file Kompaktes, sprachabhängiges Kompetenzprofil.
 * @description Verwendet dieselben Erfahrungs- und Kompetenzdaten wie die Startseite.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

/** Eigenständige, bewusst neutrale Kurzprofilseite. */
@Component({
  selector: 'bp-short-profile-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './short-profile-page.component.html',
  styleUrl: './short-profile-page.component.scss',
})
export class ShortProfilePageComponent {
  private readonly languageService = inject(LanguageService);
  private readonly seoService = inject(SeoService);
  readonly content = computed(() => this.languageService.content());
  readonly profile = computed(() => this.content().shortProfile);
  readonly isPrintBlocked = signal(false);
  readonly quickFacts = computed(() => (
    this.languageService.language() === 'de'
      ? [
          { label: 'Rolle', value: 'Webentwicklung, UI/UX & Grafikdesign' },
          { label: 'Fokus', value: 'Verständliche Interfaces, saubere Systeme, gute Wartbarkeit' },
          { label: 'Schnittstelle', value: 'Design, Entwicklung und Fachseite verbinden' },
        ]
      : [
          { label: 'Role', value: 'Web development, UI/UX & graphic design' },
          { label: 'Focus', value: 'Understandable interfaces, clean systems, maintainability' },
          { label: 'Bridge', value: 'Connecting design, development and business needs' },
        ]
  ));

  /** Synchronisiert Meta-Daten mit dem Sprachwechsel. */
  constructor() {
    effect(() => this.seoService.setPageSeo(
      this.profile().metaTitle, this.profile().metaDescription, '/kurzprofil'
    ));
  }

  /** Öffnet eine eigenständige, auf A4 reduzierte Druckansicht des Kurzprofils. */
  openPrintView(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isPrintBlocked.set(false);
    const printWindow = window.open('', '_blank', 'width=980,height=1280');

    if (!printWindow) {
      this.isPrintBlocked.set(true);
      return;
    }

    printWindow.opener = null;

    const profile = this.profile();
    const content = this.content();
    const factsHtml = this.quickFacts().map((item) => `
      <li><span>${this.escapeHtml(item.label)}</span><strong>${this.escapeHtml(item.value)}</strong></li>
    `).join('');

    const experienceHtml = content.experience.items.map((item) => `
      <article>
        <div><strong>${this.escapeHtml(item.value)}+</strong><span>${this.escapeHtml(item.suffix)}</span></div>
        <h3>${this.escapeHtml(item.label)}</h3>
        <p>${this.escapeHtml(item.text)}</p>
      </article>
    `).join('');

    const focusHtml = content.capabilities.items.map((item) => `
      <li><span>${this.escapeHtml(item.label)}</span><strong>${this.escapeHtml(item.text)}</strong></li>
    `).join('');

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html lang="${this.languageService.language()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${this.escapeHtml(profile.metaTitle)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #0b0b10;
      font: 11px/1.48 Arial, Helvetica, sans-serif;
      background: #e7eaf0;
    }
    .print-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: min(210mm, calc(100% - 32px));
      margin: 20px auto;
      font: 700 12px/1.3 "Courier New", monospace;
    }
    .print-toolbar button {
      min-height: 40px;
      padding: 9px 14px;
      border: 1px solid #004fd6;
      background: #0055ff;
      color: #fff;
      font: inherit;
      cursor: pointer;
    }
    .print-toolbar button:focus-visible { outline: 3px solid #0b0b10; outline-offset: 3px; }
    main {
      width: min(210mm, calc(100% - 32px));
      min-height: 297mm;
      margin: 0 auto 24px;
      padding: 14mm;
      background: #fff;
      box-shadow: 0 12px 40px #11182724;
    }
    @media print {
      body { background: #fff; }
      .print-toolbar { display: none; }
      main { width: 100%; min-height: 0; margin: 0; padding: 0; box-shadow: none; }
    }
    .eyebrow {
      display: inline-block;
      margin: 0 0 10px;
      padding: 3px 7px;
      border: 1px solid #0f5eff;
      font: 700 11px/1.2 "Courier New", monospace;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1, h2, h3 { margin: 0; font-family: Arial, Helvetica, sans-serif; }
    h1 {
      margin-bottom: 9px;
      font-size: 32px;
      line-height: 0.95;
      text-transform: uppercase;
      letter-spacing: -0.05em;
    }
    h2 {
      margin: 18px 0 8px;
      font-size: 18px;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: -0.03em;
    }
    h3 { margin: 7px 0 5px; font-size: 13px; text-transform: uppercase; }
    p { margin: 0; }
    .lead { max-width: 156mm; margin-bottom: 12px; font-size: 13px; }
    .facts, .focus { list-style: none; padding: 0; margin: 0; }
    .facts {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }
    .facts li, .experience article, .approach {
      border: 1px solid #bfc4cf;
      padding: 9px;
    }
    .facts span, .focus span {
      display: block;
      margin-bottom: 6px;
      color: #0f5eff;
      font: 700 11px/1.2 "Courier New", monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .facts strong, .focus strong { display: block; font-size: 11px; }
    .experience {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .experience article div { display: flex; align-items: baseline; gap: 8px; }
    .experience article div strong { color: #0f5eff; font-size: 29px; line-height: 1; }
    .experience article div span { font: 700 11px/1.2 "Courier New", monospace; text-transform: uppercase; }
    .focus {
      border-top: 1px solid #7c8597;
      border-bottom: 1px solid #7c8597;
    }
    .focus li {
      display: grid;
      grid-template-columns: 34mm 1fr;
      gap: 12px;
      padding: 7px 0;
      border-bottom: 1px solid #d5d9e1;
    }
    .focus li:last-child { border-bottom: 0; }
    .approach { margin-top: 14px; }
    .print-contact {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 18px;
      margin-top: 16px;
      padding-top: 11px;
      border-top: 2px solid #0b0b10;
      break-inside: avoid;
    }
    .print-contact__identity { display: grid; gap: 2px; }
    .print-contact__label {
      color: #0f5eff;
      font: 700 10px/1.3 "Courier New", monospace;
      letter-spacing: 0.08em;
    }
    .print-contact__identity strong { font-size: 14px; }
    .print-contact__links {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 4px 12px;
    }
    .print-contact__links a {
      color: #0b0b10;
      font: 700 11px/1.4 Arial, Helvetica, sans-serif;
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    .print-contact__links a:hover,
    .print-contact__links a:focus-visible { color: #0f5eff; text-decoration: underline; }
    @media screen and (max-width: 720px) {
      main { min-height: auto; padding: 20px; }
      .facts, .experience { grid-template-columns: 1fr; }
      .focus li { grid-template-columns: 1fr; gap: 3px; }
      .print-contact { align-items: start; flex-direction: column; }
      .print-contact__links { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <span>${this.escapeHtml(profile.eyebrow)}</span>
    <button id="print-action" type="button">${this.escapeHtml(profile.printActionLabel)}</button>
  </div>
  <main>
    <p class="eyebrow">${this.escapeHtml(profile.eyebrow)}</p>
    <h1>${this.escapeHtml(profile.title)}</h1>
    <p class="lead">${this.escapeHtml(profile.intro)}</p>

    <ul class="facts">${factsHtml}</ul>

    <section>
      <h2>${this.escapeHtml(profile.experienceTitle)}</h2>
      <div class="experience">${experienceHtml}</div>
    </section>

    <section>
      <h2>${this.escapeHtml(profile.focusTitle)}</h2>
      <ul class="focus">${focusHtml}</ul>
    </section>

    <section class="approach">
      <p class="eyebrow">WORKFLOW / VALUES</p>
      <h2>${this.escapeHtml(profile.workingStyleTitle)}</h2>
      <p>${this.escapeHtml(profile.workingStyleText)}</p>
    </section>

    <footer class="print-contact">
      <div class="print-contact__identity">
        <span class="print-contact__label">${this.languageService.language() === 'de' ? 'KONTAKT' : 'CONTACT'}</span>
        <strong>Benjamin Bennewitz</strong>
      </div>
      <div class="print-contact__links">
        <a href="mailto:kontakt@b2folio.de">kontakt@b2folio.de</a>
        <a href="tel:+491629038166">+49 162 9038166</a>
        <a href="https://b2folio.de/">b2folio.de</a>
      </div>
    </footer>
  </main>
</body>
</html>`);
    printWindow.document.close();
    printWindow.document.getElementById('print-action')?.addEventListener('click', () => {
      printWindow.focus();
      printWindow.print();
    });
    printWindow.focus();
  }

  /** Maskiert Sonderzeichen für die Druckansicht. */
  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
