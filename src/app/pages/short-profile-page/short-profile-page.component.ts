/* src/app/pages/short-profile-page/short-profile-page.component.ts */

/**
 * @file Kompaktes, sprachabhängiges Kompetenzprofil.
 * @description Stellt Berufsbezeichnungen, Werdegang und Kompetenzen auf der Profilseite und in einer A4-Druckansicht dar.
 */

import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';
import { SeoService } from '../../core/services/seo.service';

/** Zweisprachiges Kurzprofil mit eigenständiger A4-Druckansicht. */
@Component({
  selector: 'bp-short-profile-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './short-profile-page.component.html',
  styleUrl: './short-profile-page.component.scss',
})
export class ShortProfilePageComponent {
  private readonly languageService = inject(LanguageService);        // Liefert die aktive Sprache und die zentralen Portfolioinhalte.
  private readonly seoService = inject(SeoService);                  // Aktualisiert Seitentitel, Beschreibung und Canonical-URL.

  readonly content = computed(() => this.languageService.content()); // Portfolioinhalte in der aktuell gewählten Sprache.
  readonly profile = computed(() => this.content().shortProfile);    // Profilinhalte für die Bildschirm- und Druckansicht.
  readonly isPrintBlocked = signal(false);                           // Steuert den Hinweis auf ein blockiertes Druckfenster.

  /** Synchronisiert Meta-Daten mit dem Sprachwechsel. */
  constructor() {
    effect(() => {
      const { metaTitle, metaDescription } = this.profile(); // Lokalisierte Metadaten des Kurzprofils.

      this.seoService.setPageSeo(metaTitle, metaDescription, '/kurzprofil');
    });
  }

  /**
   * Öffnet eine eigenständige A4-Druckansicht in der aktiven Sprache.
   * Meldet ein blockiertes Pop-up über den Hinweis in der Profilseite.
   */
  openPrintView(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isPrintBlocked.set(false);
    const printWindow = window.open('', '_blank', 'width=980,height=1280'); // Separates Fenster für Druckvorschau und PDF-Export.

    if (!printWindow) {
      this.isPrintBlocked.set(true);
      return;
    }

    printWindow.opener = null;

    const profile = this.profile(); // Profiltexte, Berufsbezeichnungen und Stationen der aktiven Sprache.
    const content = this.content(); // Gemeinsame Erfahrungs- und Kompetenzdaten des Portfolios.

    // Berufsbezeichnungen für den Kopf der Druckansicht.
    const titlesHtml = profile.professionalTitles.map((title) => `
      <li>${this.escapeHtml(title)}</li>
    `).join('');

    // Abschnitte für Werdegang, Ausbildung und Weiterbildung.
    const backgroundHtml = profile.background.map((section) => `
      <section>
        <h2>${this.escapeHtml(section.title)}</h2>
        <ul class="entries" role="list">
          ${section.entries.map((entry) => `
            <li>
              <p class="period">${this.escapeHtml(entry.period)}</p>
              <h3>${this.escapeHtml(entry.title)}</h3>
              <p class="organization">${this.escapeHtml(entry.organization)}</p>
              <p>${this.escapeHtml(entry.description)}</p>
            </li>
          `).join('')}
        </ul>
      </section>
    `).join('');

    // Karten mit Erfahrungswerten und Kurzbeschreibungen.
    const experienceHtml = content.experience.items.map((item) => `
      <article>
        <div><strong>${this.escapeHtml(item.value)}+</strong><span>${this.escapeHtml(item.suffix)}</span></div>
        <h3>${this.escapeHtml(item.label)}</h3>
        <p>${this.escapeHtml(item.text)}</p>
      </article>
    `).join('');

    // Kompetenzfelder als kompakte Liste.
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
      margin: 13px 0 7px;
      font-size: 18px;
      line-height: 1;
      text-transform: uppercase;
      letter-spacing: -0.03em;
    }
    h3 { margin: 7px 0 5px; font-size: 13px; text-transform: uppercase; }
    p { margin: 0; }
    .lead { max-width: 165mm; font-size: 12px; }
    .titles, .entries, .focus { list-style: none; padding: 0; margin: 0; }
    .titles {
      margin: 0 0 8px;
      padding-left: 8px;
      border-left: 2px solid #0f5eff;
      font-size: 12px;
      font-weight: 700;
    }
    .background {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    .entries { border-top: 1px solid #7c8597; }
    .entries li {
      padding: 5px 0;
      border-bottom: 1px solid #d5d9e1;
      break-inside: avoid;
    }
    .entries h3 {
      margin: 1px 0;
      font-size: 12px;
      line-height: 1.25;
      text-transform: none;
    }
    .organization { font-weight: 700; }
    .experience article, .approach {
      border: 1px solid #bfc4cf;
      padding: 7px;
      break-inside: avoid;
    }
    .period, .focus span {
      color: #004fd6;
      font: 700 10px/1.2 "Courier New", monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .focus strong { font-weight: 400; }
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
      padding: 4px 0;
      border-bottom: 1px solid #d5d9e1;
    }
    .focus li:last-child { border-bottom: 0; }
    .approach { margin-top: 12px; }
    .approach h2 { margin-top: 0; }
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
      .background, .experience { grid-template-columns: 1fr; }
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
    <ul class="titles" role="list">${titlesHtml}</ul>
    <p class="lead">${this.escapeHtml(profile.intro)}</p>

    <div class="background">${backgroundHtml}</div>

    <section>
      <h2>${this.escapeHtml(profile.experienceTitle)}</h2>
      <div class="experience">${experienceHtml}</div>
    </section>

    <section>
      <h2>${this.escapeHtml(profile.focusTitle)}</h2>
      <ul class="focus">${focusHtml}</ul>
    </section>

    <section class="approach">
      <h2>${this.escapeHtml(profile.workingStyleTitle)}</h2>
      <p>${this.escapeHtml(profile.workingStyleText)}</p>
    </section>

    <footer class="print-contact">
      <div class="print-contact__identity">
        <span class="print-contact__label">${this.languageService.language() === 'de' ? 'KONTAKT' : 'CONTACT'}</span>
        <strong>${this.escapeHtml(profile.title)}</strong>
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
    printWindow.document.getElementById('print-action')?.addEventListener('click', /** Öffnet den Druckdialog für das A4-Dokument. */() => {
      printWindow.focus();
      printWindow.print();
    });
    printWindow.focus();
  }

  /**
   * Maskiert HTML-Sonderzeichen vor dem Einfügen in das Druckdokument.
   * @param value Text aus den lokalisierten Profilinhalten.
   * @returns Als HTML-Text einsetzbarer Inhalt.
   */
  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
