# [WHATWESEE] — A Photography Journal

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/swiss/)

Fotografie-Journal im Swiss-/International-Typographic-Style. Im Mittelpunkt stehen die Fotografien von Benjamin Bennewitz und eine ruhige, präzise redaktionelle Präsentation.

## Konzept und Gestaltung

Ein klares Raster, reduzierte Systemtypografie, großzügige Bildflächen und nummerierte Archivbereiche schaffen die visuelle Ordnung. Die Studie verbindet ein fotografisches Portfolio mit einem Journal: Landschaft, Architektur, Tiere und Blumen stehen als unterschiedliche Blickwinkel nebeneinander.

Der Hero-Slider eröffnet die Seite; Projektvorstellung, Archiv, redaktioneller Artikel und Abschluss führen durch die Bildwelt. Die Fotografien bleiben die Hauptinhalte, während Bewegung die Orientierung unterstützt.

## Interaktionen

- Hero-Slider mit automatischem Wechsel, Vor-/Zurück-Buttons und aktualisierten Kategorie- und Indexangaben.
- Autoplay pausiert bei Hover oder Fokus im Slider und startet bei reduzierter Bewegung nicht automatisch.
- Einmalige Reveals über `IntersectionObserver`; Archivbereiche erscheinen abwechselnd von links und rechts.
- Mobile Navigation und reguläre Ankerlinks zu den Seitenbereichen.

## Technische Umsetzung

Reines HTML, CSS und Vanilla JavaScript ohne eigene Buildpipeline. Das Layout ist auf maximal 1920 Pixel begrenzt und verwendet responsive Raster. Bilder sind als lokale WebP-Dateien eingebunden; `<figure>` und `<figcaption>` ordnen Motive und Credits semantisch zu.

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Struktur und Bildcredits | [index.html](index.html) |
| Raster, Typografie und Breakpoints | [styles.css](styles.css) |
| Slider, Menü und Reveals | [script.js](script.js) |
| Fotografien | `assets/images/` |

Die vorhandenen Archivbilder dienen zugleich als zusätzliche Hero-Slides. `hero-landscape.webp`, `archive-landscape.webp`, `archive-architecture.webp`, `archive-animals.webp`, `archive-flowers.webp`, `article-landscape.webp` und `cta-landscape.webp` übernehmen die jeweiligen Bildrollen.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/swiss/` öffnen. Alternativ im Studienordner `python -m http.server 8080` starten und `http://localhost:8080/` aufrufen. Es ist keine zusätzliche npm-Installation für die Studie nötig.

Angular kopiert die statische Microsite in den entsprechenden Studienpfad. Die Portfolio-Karte und der Quicklink verweisen auf dieselbe Seite.

## Inhalte und Rechte

Die eingebundenen Fotografien stammen von Benjamin Bennewitz; sichtbare Bildcredits verwenden `© Benjamin Bennewitz`. Gestaltung, Code und eigene Inhalte unterliegen der [Portfolio-Lizenz](../../../LICENSE).
