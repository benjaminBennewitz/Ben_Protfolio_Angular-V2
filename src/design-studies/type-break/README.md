# TYPE破BREAK — Nothing New Without Breaking

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/type-break/)

Interaktives typografisches Manifest über Druck, Zerfall und kreative Transformation. Schrift vermittelt die Geschichte durch Größe, Bewegung und physische Reaktionen.

## Konzept und Gestaltung

**THE SYSTEM → THE PRESSURE → THE BREAK → THE NEW.**

Anton bildet das starre typografische System. Signalrot, Off-White und lokal eingebundene japanische Schlüsselglyphen setzen Kontraste. Die Wirkung entsteht aus Maßstab, Kompression und Verschiebung. Die japanischen Zeichen tragen inhaltliche Bedeutung und sind keine zufälligen Dekorationen.

## Kapitel und Interaktionen

| Station | Verhalten |
| --- | --- |
| The System | Einzelne Hero-Glyphen reagieren auf Pointer bzw. Touch; die Komposition verändert sich beim Scrollen. |
| The Pressure | Scroll-Kompression, Scherung und Rotation führen zur typografischen Bruch-Klimax. |
| Intervention | Fragmentierte Wörter und CTA-Texte setzen sich bei Hover, Fokus oder Aktivierung zusammen. |
| The Break | Canvas-Simulation mit PUSH, PULL, BREAK und REFORM. |
| The New | Eigene Aussage eingeben, als Poster ansehen und lokal als PNG exportieren. |
| Manifesto | Redaktionelle Publikationsvorschau mit Download der vierseitigen PDF-Fassung. |

Drei großformatige Interludes verbinden die Kapitel. Der Footer greift die Typografie auf und bietet Kapitelnavigation sowie Download- und Portfoliolinks. Der Poster-Remix erzeugt eine neue Aussage; vorhandene Physics-Fragmente morphen nicht geometrisch in den neuen Text.

## Technische Umsetzung

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Kapitel, Formular und Navigation | [index.html](index.html) |
| Designsystem und responsive Darstellung | [styles.css](styles.css) |
| Scrollmechanik, Glyphen und Poster-Export | [script.js](script.js) |
| Fragment- und Reformationssimulation | [physics.js](physics.js) |
| Redaktionelle Grundlage | [docs/MANIFESTO.md](docs/MANIFESTO.md) |
| Druckfassung | [assets/type-break-manifesto.pdf](assets/type-break-manifesto.pdf) |

HTML, CSS, Canvas und Vanilla JavaScript ohne npm-Laufzeitabhängigkeiten. Scrollbewegungen laufen über `requestAnimationFrame` und CSS-Transforms; Kapitel-Reveals über `IntersectionObserver`. Die Physiksimulation pausiert außerhalb des Viewports, ihre Pixeldichte ist begrenzt.

## Bedienbarkeit und lokale Daten

Skip-Link, sichtbare Fokuszustände, beschriftete Werkzeuge, Touchbedienung und ein editierbares Formular ergänzen die visuellen Experimente. `prefers-reduced-motion` und ein zusätzlicher Motion-Toggle reduzieren Animationen. Die Seite scrollt über das Dokument; die Kapitel verwenden keinen globalen inneren Seitenscroller.

Postertext und Export werden lokal im Browser verarbeitet. Eingegebene Aussagen werden nicht an ein Backend übertragen.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/type-break/` öffnen. Alternativ im Studienordner `python -m http.server 8080` und anschließend `http://localhost:8080/` starten. HTTP ist für konsistentes Laden und Exportieren vorzuziehen.

Angular übernimmt die statische Studie über die bestehende Asset-Konfiguration. Es ist kein zusätzlicher Build notwendig.

## Schriften und Rechte

Anton und der Subset von Noto Serif CJK JP Bold liegen lokal vor. Die Lizenzhinweise stehen in [assets/OFL.txt](assets/OFL.txt) und [assets/OFL-NOTO.txt](assets/OFL-NOTO.txt). Eigene Inhalte unterliegen der [Portfolio-Lizenz](../../../LICENSE).
