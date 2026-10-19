# TYPE//BREAK

**NOTHING NEW WITHOUT BREAKING.**

TYPE//BREAK ist eine eigenständige, frameworkfreie Design Study über Druck, Zerfall und kreative Transformation. Die Interaktionen vermitteln das Manifest unmittelbar, anstatt technische Werkzeuge isoliert zu demonstrieren.

## Starten und integrieren

Die Microsite liegt unter `src/design-studies/type-break/`. Sie verwendet ausschließlich HTML, CSS, Canvas und Vanilla JavaScript; es gibt keinen Build-Schritt und keine npm-Abhängigkeit.

Aus der bestehenden Portfolio-Installation ist sie über `/design-studies/type-break/` erreichbar. Lokal vorzugsweise über einen HTTP-Server öffnen, damit Font-Ladevorgänge und Dateidownloads konsistent funktionieren.

Der Patch ist **inkrementell**: Die bisherigen Dateien `assets/anton-regular.ttf`, `assets/OFL.txt`, `assets/favicon.svg`, `assets/preview.svg` sowie das bereits ausgelieferte `assets/type-break-manifesto.pdf` und `docs/MANIFESTO.md` bleiben erhalten.

## Inhalt und Mechaniken

| Abschnitt | Aussage | Technische Interaktion |
| --- | --- | --- |
| `#system` | Nothing stays the same | Einzelne DOM-Glyphen reagieren automatisch auf Mausbewegungen; der Hero wächst beim Verlassen aus dem Viewport heraus. |
| Interlude 001 | Nothing is fixed | Schwarzes typografisches Vollbild: Wörter fahren aus den Seiten ein, verharren und verlassen die Bühne mit einem großen Scroll-Zoom. |
| `#pressure` | Pressure reveals the cracks | Scroll-Kompression mit Scherung, Rotationen und bildfüllender typografischer Bruch-Klimax. Kein Scroll-Lock. |
| Intervention | Meaning requires action | Fragmentierte Wörter und CTA-Texte setzen sich bei Hover/Fokus zusammen; Wort-Buttons lassen sich auch per Klick/Touch auslösen. |
| Interlude 002 | Let it fall apart | Riesige gegensinnig einschiebende Wörter auf Signalrot, gekoppelt an den Scroll-Fortschritt. |
| `#breaking` | Destruction is a creative act | Scroll-animierte Einführung und Billboard-Headline; bestehende Canvas-Physics mit PUSH, PULL, BREAK und REFORM bleiben erhalten. |
| Interlude 003 | Make it new | Aus der Zerstörung geht ein neuer typografischer Zustand hervor; Off-White-Fullscreen mit Scroll-Zoom. |
| `#new` | Don't restore. Remake. | Eingabe einer neuen Aussage, Live-Vorschau als typografisches Poster, Export als PNG. |
| Manifesto | Take the idea with you | Große Editorial-Publikationsvorschau und direkter PDF-Download. |
| Footer | Start again | Eigenständiger typografischer Schlussakt mit riesigen Glyphen, Kapitelnavigation, Publikations-Download, Credits, Impressum/Datenschutz und bewegter Textbande. |

Das finale Poster stellt **eine neue Aussage** dar; die Physics-Fragmente aus Kapitel 03 werden noch nicht geometrisch in die neue Schrift umgebaut. Eine solche echte Morph-Animation wäre eine optionale zusätzliche Ausbaustufe.

## Dateien

- `index.html` — semantische Kapitel, Navigation, Formular, zugängliche Beschriftungen.
- `styles.css` — gesamtes Designsystem der Microsite, Desktop/Tablet/Mobile und Reduced Motion.
- `script.js` — Hero-Pull, Scroll-Druck, Wort-Reformation, Poster-Rendering und PNG-Export.
- `physics.js` — eigenständige Canvas-Physics mit Fragment- und REFORM-Logik (auf dem bestehenden Prototyp aufgebaut).
- `assets/anton-regular.ttf` — bestehende lokale Display-Schrift.
- `assets/noto-serif-cjk-jp-subset.woff2` — **lokaler Subset von Noto Serif CJK JP Bold**, nur für die japanischen Schlüsselglyphen.
- `assets/OFL-NOTO.txt` — Lizenz-/Attributionshinweise für den CJK-Subset.
- `assets/type-break-manifesto.pdf` — zuvor verabschiedete vierseitige Druckfassung.
- `docs/MANIFESTO.md` — editierbare redaktionelle Grundlage.

## Schriftkonzept und Semantik

Anton verkörpert das starre typografische System. Die rote Kalligrafie setzt einen zweiten, bewegten Kontrapunkt.

In dieser Ausbaustufe wird **Noto Serif CJK JP** lokal verwendet, nicht Ma Shan Zheng oder Long Cang. Die beiden zuvor diskutierten Schriften sind daher nicht als eingebundene Fonts zu dokumentieren. Ein späterer Tausch ist über die `@font-face`-Definition `CJK` möglich; vorher Zeichensatzabdeckung und Lizenzen prüfen.

Beispielsweise: `破壊` (*hakai* / Zerstörung), `圧` (*atsu* / Druck), `新` (*shin* / neu). Die Schriftzeichen sind bedeutungsvoll, nicht zufällig platziert. Für die Sprachgestaltung japanische Lesungen und Wortzusammenstellungen vor einer mehrsprachigen Erweiterung redaktionell prüfen.

## Zugänglichkeit und Performance

- Dokumentstruktur mit genau einer H1 sowie H2-Kapiteln.
- Skip-Link, sichtbare Focus-States, semantische Buttons und editierbares Formular.
- Sprechende Labels bei fragmentierten Schaltflächen; Glyphen-Splits werden für Screenreader verborgen.
- Tastatur- und Touch-Zugriff über Werkzeuge, Wort-Buttons und alle wesentlichen CTA-Funktionen.
- `prefers-reduced-motion` und ein zusätzlicher lokaler Motion-Toggle deaktivieren visuelle Bewegungen.
- Scroll-Druck und die drei filmischen Interludes laufen über `requestAnimationFrame`, einen passiven Scroll-Listener pro Mechanik und CSS-Transforms; kein Scroll-Jacking.
- `IntersectionObserver` steuert die seitlich bzw. von unten einfahrenden Kapitel-Inhalte, ohne dauerhafte Beobachtung im Animation-Frame.
- `overflow-x: clip` verhindert horizontalen Überlauf beim Ein- und Ausfahren, ohne die Sticky-Sections in eigene Scroll-Container zu verschieben.
- Canvas-Physics stoppt außerhalb des Viewports; DPR wird auf 2 begrenzt.
- Poster-Export geschieht lokal im Browser; eingegebene Texte werden nicht übertragen oder gespeichert.

## Tests

Manuell oder in Headless Chromium überprüfen: Responsive-Breiten 320, 390, 768 und 1440 px (1920 px zusätzlich im Zielbrowser prüfen), BREAK → REFORM, CTA-Hover/-Fokus, Poster-Remix, PNG-Download, PDF-Link, Reduced Motion, Touch-Gesten und interne Navigation. Vor dem Live-Deployment außerdem Lighthouse und Tastatur-/Screenreader-Prüfung im Zielbrowser durchführen.

## Creative Direction

**NOTHING NEW WITHOUT BREAKING.** Nicht als Glitch-Website gestalten. Wirkung entsteht aus Maßstab, Druck, kontrastierenden Schriftformen, physischer Verschiebung und gezielter roter Überlagerung.

Die englischen Texte sind bewusst kurz und plakatfähig. Die Story lautet: **THE SYSTEM → THE PRESSURE → THE BREAK → THE NEW**.

## Cinematic Hero & Navigation

- The opening statement is a scroll-driven, sticky, full-screen typographic scene. Its glyphs respond directly to pointer movement or touch-down; its three lines and Japanese overlays scale and fade away as the body scrolls forward.
- Kanji in the interlude and pressure sections now use a scale-and-fade trajectory instead of rotation. The large footer composition stays structurally unchanged.
- The fixed scroll-to-top control uses **上** (*ue*, "up/above") with a visible TOP label, a descriptive accessible name, and normal anchor navigation to `#top`. It appears after the first viewport.
- Scrollbars are styled in Firefox and Chromium/WebKit. Motion preferences and the in-page motion toggle are respected.
