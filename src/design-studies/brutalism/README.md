# RAW/FORM — Brutalist Festival Study

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/brutalism/)

Eigenständige Festival-Microsite über elektronische Musik, Architektur, Kunst und Community. Die Studie untersucht, wie eine konsequent plakatartige Gestaltung eine vollständige Eventseite tragen kann.

## Konzept und Gestaltung

Große Anton-Headlines, technische Informationen in IBM Plex Mono, harte Rasterlinien und orangefarbene Akzente prägen die visuelle Identität. Fotografische Flächen, SVG-Doodles und gegeneinander gesetzte Inhaltsblöcke verbinden Festivalplakat und Editorial-Layout.

Die Seite führt vom großformatigen Einstieg über Line-up, Ort und Erlebnis bis zu Manifest, Ticketübersicht und Newsletter. Die Inhalte sind fiktiv; die Studie wickelt weder Ticketkäufe noch Newsletter-Anmeldungen ab.

## Interaktionen

- Kapitel-Navigation und mobiles Menü mit Zustandswechsel und Escape-Bedienung.
- Gestaffelte Text-Reveals und versetzte Bild-Reveals beim Eintritt in den Viewport.
- Hover- und Fokusreaktionen auf Links, Buttons und Karten.
- Scroll-to-Top und ein ausdrücklich als Demo gestalteter Cookie-Dialog. Dessen Schließzustand wird für die Browsersitzung in `sessionStorage` gespeichert.
- Illustrative Audiobalken als Gestaltungselement; kein echter Audioplayer.

## Technische Umsetzung

HTML, CSS und Vanilla JavaScript liegen gemeinsam in [index.html](index.html). Für die Laufzeit ist keine npm-Installation nötig. `IntersectionObserver` aktiviert die Reveals; die Seite nutzt den normalen Dokument-Scroll. `prefers-reduced-motion` deaktiviert die entsprechenden Bewegungen und macht die Inhalte unmittelbar sichtbar.

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Struktur, Styles und Interaktionen | [index.html](index.html) |
| Bilder und SVG-Grafiken | `assets/` |
| Lokale Schriften und Lizenztexte | `assets/fonts/` |

Skip-Link, sichtbare Fokuszustände und semantische Inhaltsbereiche sind vorhanden. Daraus folgt keine pauschale WCAG-Konformitätsaussage; die konkrete Nutzung muss im Zielbrowser geprüft werden.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/brutalism/` öffnen. Alternativ direkt im Studienordner:

```bash
python -m http.server 8080
```

Anschließend `http://localhost:8080/` öffnen. Angular übernimmt die Studie über die bestehende Asset-Kopie; eine eigene Angular-Komponente oder separate Buildpipeline ist nicht erforderlich.

## Inhalte und Rechte

Gestaltung und Implementierung: Benjamin Bennewitz / B². Die Projektbedingungen stehen in der [Portfolio-Lizenz](../../../LICENSE). Die lokalen Font-Lizenzen bleiben Bestandteil der jeweiligen Schriftordner; sie werden durch die Portfolio-Lizenz nicht ersetzt.
