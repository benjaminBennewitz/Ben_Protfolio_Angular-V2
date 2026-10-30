/** @file Zweisprachige Lerninhalte und vollständige Beispiele der interaktiven Snippets. */
import type { SnippetEntry } from '../models/page-content.models';

/** Zusätzliche Einträge im bestehenden Snippet-Index, sortiert nach den bisherigen sechs Themen. */
export const SNIPPET_LAB_ENTRIES: Record<'de' | 'en', readonly SnippetEntry[]> = {
  de: [
    {
      slug: "svg-paths",
      index: "07",
      title: "SVG-Pfade verstehen",
      subtitle: "Vom kompakten Pfad zur lesbaren Bézierkurve.",
      category: "SVG / Grafik",
      summary: "Ein SVG-Pfad ist eine Folge von Zeichenbefehlen. Die Vorschau verbindet die Werte im d-Attribut mit zwei verschiebbaren Kontrollpunkten. So wird sichtbar, wie die Tangenten Richtung und Form der Kurve beeinflussen.",
      tags: ["SVG", "Bézier", "viewBox", "Paths"],
      support: "Breit unterstützt; lesbarer Fallback",
      supportTone: "stable",
      codeLanguage: "SVG",
      previewType: "svg",
      code: "<path d=\"M 25 140 C 80 20, 220 20, 275 140\" />",
      oldCode: `<svg viewBox="0 0 300 180">
  <path d="M25 140C80 20 220 20 275 140" fill="none" stroke="currentColor"/>
</svg>`,
      newCode: `<svg viewBox="0 0 300 180" role="img" aria-labelledby="curve-title">
  <title id="curve-title">Bézierkurve mit Kontrollpunkten</title>
  <!-- M: Startpunkt. C: Kontrollpunkt 1, Kontrollpunkt 2, Endpunkt. -->
  <path d="M 25 140
           C 80 20, 220 20, 275 140"
        fill="none" stroke="currentColor" stroke-width="3" />
  <!-- Hilfslinien vom Start/Ende zu ihren Kontrollpunkten. -->
  <path d="M 25 140 L 80 20 M 275 140 L 220 20"
        fill="none" stroke="currentColor" stroke-dasharray="3 3" />
  <circle cx="80" cy="20" r="4" fill="currentColor" />
  <circle cx="220" cy="20" r="4" fill="currentColor" />
</svg>`,
      oldCodeLabel: "Vorher: kompakter Pfad",
      newCodeLabel: "Nachher: Pfad und Hilfslinien",
      demoHref: "assets/snippet-demos/svg-paths.html",
      notes: ["viewBox=\"0 0 300 180\" definiert das interne Koordinatensystem. X wächst nach rechts, Y nach unten.", "M bewegt den Stift, L zeichnet eine Linie, H/V zeichnen horizontal/vertikal und Z schließt den Pfad.", "C verwendet zwei Kontrollpunkte; Q ist eine quadratische Bézierkurve mit einem Kontrollpunkt.", "Großbuchstaben verwenden absolute Koordinaten. m/l/c/q rechnen relativ zum aktuellen Punkt; beim ersten m ist der Ursprung die Referenz.", "Die Kontrollpunkte liegen normalerweise nicht auf der Kurve. Sie bestimmen die Tangenten an Start und Ende.", "Dekorative SVGs: aria-hidden=\"true\". Inhaltliche SVGs: role=\"img\" plus zugänglicher Name. Die Regler bieten eine Tastaturalternative zum Ziehen."],
    },
    {
      slug: "theme-tokens",
      index: "08",
      title: "Theming mit Tokens",
      subtitle: "Eine Komponente, konsistente Light-/Dark-Zustände.",
      category: "CSS / Designsystem",
      summary: "Statt Farben in jeder Komponente zu wiederholen, benennen semantische Tokens ihre Aufgabe: Fläche, Text, Rahmen oder Akzent. Das Theme tauscht diese Werte aus; die Komponente und ihre Zustände verwenden dieselben Regeln.",
      tags: ["CSS", "Tokens", "Light / Dark", "A11y"],
      support: "Breit unterstützt; lesbarer Fallback",
      supportTone: "stable",
      codeLanguage: "HTML / CSS / JS",
      previewType: "tokens",
      code: ".card { background: var(--surface); color: var(--text); }",
      oldCode: `<style>
  .card { background: #fff; color: #172033; padding: 1rem; }
  .card button { background: #2148b2; color: #fff; }
  .card input { background: #fff; color: #172033; }
</style>
<article class="card">
  <h2>Projekt</h2>
  <label>Name <input type="text"></label>
  <button type="button">Öffnen</button>
</article>`,
      newCode: `<style>
  :root {
    color-scheme: light;
    --surface: #fff; --text: #172033; --muted: #465369;
    --border: #69778c; --accent: #2148b2; --on-accent: #fff;
    --error: #ac1731;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      color-scheme: dark;
      --surface: #121c30; --text: #f2f5ff; --muted: #bcc6dd;
      --border: #91a1bd; --accent: #b7caff; --on-accent: #142347;
      --error: #ffb3c1;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --surface: #121c30; --text: #f2f5ff; --muted: #bcc6dd;
    --border: #91a1bd; --accent: #b7caff; --on-accent: #142347;
    --error: #ffb3c1;
  }
  .card { padding: 1rem; background: var(--surface); color: var(--text); }
  .card input { padding: .5rem; background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .card button { padding: .5rem; background: var(--accent); color: var(--on-accent); border: 1px solid var(--accent); }
  .card button:hover:not(:disabled) { background: var(--surface); color: var(--accent); }
  .card button:active:not(:disabled) { transform: translateY(1px); }
  .card button:disabled { color: var(--muted); background: var(--surface); border-color: var(--border); }
  .card :is(input, button):focus-visible { outline: 2px solid var(--text); outline-offset: 3px; }
  .card [aria-invalid="true"] { border: 2px solid var(--error); }
  .error { color: var(--error); }
</style>
<button type="button" data-theme-choice="light">Hell</button>
<button type="button" data-theme-choice="dark">Dunkel</button>
<button type="button" data-theme-choice="system">System</button>
<article class="card">
  <h2>Projekt</h2>
  <label>Name <input type="text"></label>
  <label>E-Mail <input type="email" value="ben@" aria-invalid="true" aria-describedby="email-error"></label>
  <p id="email-error" class="error">Fehler: E-Mail-Adresse unvollständig.</p>
  <button type="button">Öffnen</button>
  <button type="button" disabled>Deaktiviert</button>
</article>
<script>
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeChoice;
      if (theme === 'system') delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme;
    });
  });
</script>`,
      oldCodeLabel: "Vorher: feste Farbwerte",
      newCodeLabel: "Nachher: semantische Tokens",
      demoHref: "assets/snippet-demos/theme-tokens.html",
      notes: ["Primitive Tokens beschreiben konkrete Werte (z. B. Blau 700); semantische Tokens beschreiben deren Aufgabe (--accent). Für kleine Beispiele reicht die semantische Ebene.", "prefers-color-scheme berücksichtigt die Systempräferenz. Eine explizite data-theme-Auswahl hat Vorrang; System entfernt den Override.", "color-scheme steuert unter anderem native Formularelemente. Es ersetzt keine eigenen Farb-Tokens.", "Fokus, Hover, Active, Disabled und Fehler brauchen passende Werte in beiden Themes. Prüfe Textkontrast, Rahmen und Fokus getrennt.", "Fehler werden durch Text und aria-invalid vermittelt, nicht nur durch eine rote Farbe.", "Die lokalen Buttons verändern nur die Vorschau. Jeder globale Theme-Wechsel synchronisiert sie wieder mit dem Portfolio."],
    },
    {
      slug: "container-queries",
      index: "09",
      title: "Container Queries",
      subtitle: "Komponenten reagieren auf ihren Platz, nicht nur auf den Viewport.",
      category: "CSS / Responsive Design",
      summary: "Eine Projektkarte kann im Hauptbereich breit und in einer Sidebar schmal sein – im selben Viewport. Media Queries kennen nur die Fensterbreite. Container Queries lesen den verfügbaren Platz eines übergeordneten Containers und passen dessen Kinder an.",
      tags: ["CSS", "Responsive", "@container", "cqi"],
      support: "Breit unterstützt; lesbarer Fallback",
      supportTone: "stable",
      codeLanguage: "HTML / CSS",
      previewType: "container",
      code: ".card-space { container: project-card / inline-size; }",
      oldCode: `<style>
  .card { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .card > div { min-width: 0; overflow-wrap: anywhere; }
  @media (min-width: 700px) {
    .card { grid-template-columns: 5rem minmax(0, 1fr); }
  }
</style>
<div class="card-space">
  <article class="card">
    <span aria-hidden="true">B²</span>
    <div><h2>Projektkarte</h2><p>Layout folgt dem verfügbaren Platz.</p></div>
  </article>
</div>`,
      newCode: `<style>
  .card-space { container: project-card / inline-size; }
  .card { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .card > div { min-width: 0; overflow-wrap: anywhere; }
  .card h2 { font-size: 1rem; }
  @container project-card (min-width: 360px) {
    .card { grid-template-columns: 5rem minmax(0, 1fr); }
    .card h2 { font-size: clamp(1rem, 4cqi, 1.3rem); }
  }
</style>
<div class="card-space">
  <article class="card">
    <span aria-hidden="true">B²</span>
    <div><h2>Projektkarte</h2><p>Layout folgt dem verfügbaren Platz.</p></div>
  </article>
</div>`,
      oldCodeLabel: "Vorher: nur Viewport",
      newCodeLabel: "Nachher: Komponentenkontext",
      demoHref: "assets/snippet-demos/container-queries.html",
      notes: ["container: project-card / inline-size benennt den Query-Container und aktiviert Größenabfragen entlang der Inline-Achse.", "Die Query gestaltet Nachfahren, nicht den Container selbst. Der Wrapper muss seinen Platz vom umgebenden Layout erhalten.", "Die Vorschau verwendet 700px für die Media Query und 360px für die Container Query. Ändere den Regler und danach die Fensterbreite.", "1cqi entspricht 1% der Inline-Größe des Query-Containers. clamp() begrenzt die Schriftgröße.", "Ohne Container-Query-Support bleibt das einspaltige Basislayout lesbar. Die Medienregel bleibt sinnvoll für globale Seitenlayouts.", "Der Regler ist auch mit Pfeiltasten, Home und End bedienbar."],
    },
  ],
  en: [
    {
      slug: "svg-paths",
      index: "07",
      title: "Understanding SVG paths",
      subtitle: "From a compact path to a readable Bézier curve.",
      category: "SVG / Graphics",
      summary: "An SVG path is a sequence of drawing commands. The preview connects the d attribute to two movable control points, showing how tangents affect the curve direction and shape.",
      tags: ["SVG", "Bézier", "viewBox", "Paths"],
      support: "Widely supported; readable fallback",
      supportTone: "stable",
      codeLanguage: "SVG",
      previewType: "svg",
      code: "<path d=\"M 25 140 C 80 20, 220 20, 275 140\" />",
      oldCode: `<svg viewBox="0 0 300 180">
  <path d="M25 140C80 20 220 20 275 140" fill="none" stroke="currentColor"/>
</svg>`,
      newCode: `<svg viewBox="0 0 300 180" role="img" aria-labelledby="curve-title">
  <title id="curve-title">Bézier curve with control points</title>
  <!-- M: start. C: control point 1, control point 2, end. -->
  <path d="M 25 140
           C 80 20, 220 20, 275 140"
        fill="none" stroke="currentColor" stroke-width="3" />
  <!-- Guides from start/end to their control points. -->
  <path d="M 25 140 L 80 20 M 275 140 L 220 20"
        fill="none" stroke="currentColor" stroke-dasharray="3 3" />
  <circle cx="80" cy="20" r="4" fill="currentColor" />
  <circle cx="220" cy="20" r="4" fill="currentColor" />
</svg>`,
      oldCodeLabel: "Before: compact path",
      newCodeLabel: "After: path and guides",
      demoHref: "assets/snippet-demos/svg-paths.en.html",
      notes: ["viewBox=\"0 0 300 180\" defines the internal coordinate system. X grows to the right and Y downwards.", "M moves the pen, L draws a line, H/V draw horizontally/vertically and Z closes the path.", "C uses two control points; Q defines a quadratic Bézier curve with one control point.", "Uppercase commands use absolute coordinates. m/l/c/q are relative to the current point; the initial m is relative to the origin.", "Control points usually do not lie on the curve. They set the start and end tangents.", "Decorative SVGs use aria-hidden=\"true\". Informative SVGs need role=\"img\" and an accessible name. Sliders provide a keyboard alternative to dragging."],
    },
    {
      slug: "theme-tokens",
      index: "08",
      title: "Theming with tokens",
      subtitle: "One component, consistent light and dark states.",
      category: "CSS / Design system",
      summary: "Instead of repeating colors in every component, semantic tokens describe their purpose: surface, text, border or accent. The theme replaces their values while the component and its states keep the same rules.",
      tags: ["CSS", "Tokens", "Light / Dark", "A11y"],
      support: "Widely supported; readable fallback",
      supportTone: "stable",
      codeLanguage: "HTML / CSS / JS",
      previewType: "tokens",
      code: ".card { background: var(--surface); color: var(--text); }",
      oldCode: `<style>
  .card { background: #fff; color: #172033; padding: 1rem; }
  .card button { background: #2148b2; color: #fff; }
  .card input { background: #fff; color: #172033; }
</style>
<article class="card">
  <h2>Project</h2>
  <label>Name <input type="text"></label>
  <button type="button">Open</button>
</article>`,
      newCode: `<style>
  :root {
    color-scheme: light;
    --surface: #fff; --text: #172033; --muted: #465369;
    --border: #69778c; --accent: #2148b2; --on-accent: #fff;
    --error: #ac1731;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      color-scheme: dark;
      --surface: #121c30; --text: #f2f5ff; --muted: #bcc6dd;
      --border: #91a1bd; --accent: #b7caff; --on-accent: #142347;
      --error: #ffb3c1;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --surface: #121c30; --text: #f2f5ff; --muted: #bcc6dd;
    --border: #91a1bd; --accent: #b7caff; --on-accent: #142347;
    --error: #ffb3c1;
  }
  .card { padding: 1rem; background: var(--surface); color: var(--text); }
  .card input { padding: .5rem; background: var(--surface); color: var(--text); border: 1px solid var(--border); }
  .card button { padding: .5rem; background: var(--accent); color: var(--on-accent); border: 1px solid var(--accent); }
  .card button:hover:not(:disabled) { background: var(--surface); color: var(--accent); }
  .card button:active:not(:disabled) { transform: translateY(1px); }
  .card button:disabled { color: var(--muted); background: var(--surface); border-color: var(--border); }
  .card :is(input, button):focus-visible { outline: 2px solid var(--text); outline-offset: 3px; }
  .card [aria-invalid="true"] { border: 2px solid var(--error); }
  .error { color: var(--error); }
</style>
<button type="button" data-theme-choice="light">Light</button>
<button type="button" data-theme-choice="dark">Dark</button>
<button type="button" data-theme-choice="system">System</button>
<article class="card">
  <h2>Project</h2>
  <label>Name <input type="text"></label>
  <label>E-Mail <input type="email" value="ben@" aria-invalid="true" aria-describedby="email-error"></label>
  <p id="email-error" class="error">Error: incomplete email address.</p>
  <button type="button">Open</button>
  <button type="button" disabled>Disabled</button>
</article>
<script>
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      const theme = button.dataset.themeChoice;
      if (theme === 'system') delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = theme;
    });
  });
</script>`,
      oldCodeLabel: "Before: hard-coded colors",
      newCodeLabel: "After: semantic tokens",
      demoHref: "assets/snippet-demos/theme-tokens.en.html",
      notes: ["Primitive tokens describe concrete values (such as blue 700); semantic tokens describe their purpose (--accent). Small examples can start with the semantic layer.", "prefers-color-scheme follows the system preference. An explicit data-theme selection takes priority; System removes the override.", "color-scheme affects native controls, among other things. It does not replace your color tokens.", "Focus, hover, active, disabled and error states need suitable values in both themes. Check text contrast, borders and focus separately.", "Errors use text and aria-invalid rather than color alone.", "Local buttons only change this preview. Every global theme switch synchronizes it with the portfolio again."],
    },
    {
      slug: "container-queries",
      index: "09",
      title: "Container queries",
      subtitle: "Components respond to their space, not just the viewport.",
      category: "CSS / Responsive design",
      summary: "A project card can be wide in the main area and narrow in a sidebar within the same viewport. Media queries only know the viewport width. Container queries read an ancestor container’s available space and adapt its children.",
      tags: ["CSS", "Responsive", "@container", "cqi"],
      support: "Widely supported; readable fallback",
      supportTone: "stable",
      codeLanguage: "HTML / CSS",
      previewType: "container",
      code: ".card-space { container: project-card / inline-size; }",
      oldCode: `<style>
  .card { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .card > div { min-width: 0; overflow-wrap: anywhere; }
  @media (min-width: 700px) {
    .card { grid-template-columns: 5rem minmax(0, 1fr); }
  }
</style>
<div class="card-space">
  <article class="card">
    <span aria-hidden="true">B²</span>
    <div><h2>Project card</h2><p>Layout follows available space.</p></div>
  </article>
</div>`,
      newCode: `<style>
  .card-space { container: project-card / inline-size; }
  .card { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
  .card > div { min-width: 0; overflow-wrap: anywhere; }
  .card h2 { font-size: 1rem; }
  @container project-card (min-width: 360px) {
    .card { grid-template-columns: 5rem minmax(0, 1fr); }
    .card h2 { font-size: clamp(1rem, 4cqi, 1.3rem); }
  }
</style>
<div class="card-space">
  <article class="card">
    <span aria-hidden="true">B²</span>
    <div><h2>Project card</h2><p>Layout follows available space.</p></div>
  </article>
</div>`,
      oldCodeLabel: "Before: viewport only",
      newCodeLabel: "After: component context",
      demoHref: "assets/snippet-demos/container-queries.en.html",
      notes: ["container: project-card / inline-size names the query container and enables size queries along the inline axis.", "Queries style descendants, not the container itself. The wrapper must receive its space from the surrounding layout.", "The preview uses 700px for the media query and 360px for the container query. Change the slider and then the window width.", "1cqi is 1% of the query container’s inline size. clamp() bounds the font size.", "Without container query support, the single-column base layout remains readable. Media queries remain useful for global page layouts.", "The slider also works with arrow keys, Home and End."],
    },
  ],
};
