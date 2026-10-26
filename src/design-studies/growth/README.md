# GROWTH. — A Living World

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/growth/)

Prozedurale Baum-Experience mit einer Kamerafahrt vom unterirdischen Wurzelsystem über den Stamm bis über die Krone. Scrollen wird als vertikaler Aufstieg durch einen zusammenhängenden Lebensraum inszeniert.

## Konzept und Gestaltung

Der Einstieg liegt am unteren Ende des Dokuments. Von dort führt Scrollen nach oben durch die Höhenkapitel: Wurzeln, Waldboden, Stamm, Aufsitzerpflanzen, verborgene Lebensräume, Kronendach und der Blick darüber hinaus.

Dunkle Waldtöne, helle Akzente, großformatige Barlow-Condensed-Typografie und ein technisches HUD verbinden Naturdarstellung und Expedition. Der Höhenmesser folgt der Kameraposition. Nebel, atmosphärische Layer und animiertes Wasser geben der Szene Tiefe.

## Interaktionen

- Kamerahöhe und Blickrichtung folgen dem normalen Dokument-Scroll; Kapiteltexte bleiben HTML-Inhalte über der Szene.
- Die Kapitelnavigation springt gezielt zu Höhenabschnitten. „Begin Ascent“ führt aus dem Einstieg zum Waldboden.
- Entdeckungspunkte erläutern unter anderem Pilze, Moose, Bromelien und die Wirkung der Krone. Kleine angeschlossene Infoblasen ersetzen ein bildschirmfüllendes Overlay.
- Die meisten Marker folgen 3D-Positionen und Sichtbarkeitsprüfungen. Der Atmosphärenpunkt links im Kronenbereich ist bewusst redaktionell im Bildschirmraum platziert.
- Der Sound-Schalter ist als deaktiviertes Prototyp-Bedienelement gekennzeichnet; eine Tonfunktion ist nicht implementiert.

## Technische Umsetzung

Die Szene wird mit Three.js und WebGL erzeugt. Baum, Wurzeln, Bewuchs und Umgebung entstehen prozedural; ein externes Baummodell ist für diese Variante nicht erforderlich. Texturen werden teilweise direkt per Canvas erzeugt.

| Bereich | Datei |
| --- | --- |
| Kapitel, HUD und Infoblasen | [index.html](index.html) |
| Rendering, Kamera und Interaktion | [src/main.js](src/main.js) |
| Geometriegeneratoren und Layer | [src/world.js](src/world.js) |
| Validierte Seeds und Parameter | [src/config.js](src/config.js) |
| Deterministische Zufallsströme | [src/random.js](src/random.js) |
| Autorenwerkzeuge und Presets | [src/debug.js](src/debug.js) |
| Gestaltung und lokale Schriftanbindung | [src/styles.css](src/styles.css) |
| Portfolio-Kartenvorschau | [assets/preview.webp](assets/preview.webp) |

Die Generatorbereiche verwenden getrennte Zufallsströme. Änderungen am Boden verändern dadurch nicht automatisch die Astfolge. Ein Preset hält Seeds und Parameter fest; Reproduzierbarkeit setzt dieselbe Generatorversion voraus. Es ist kein eingefrorener Geometrie- oder GLB-Snapshot.

## Autorenmodus

`/design-studies/growth/?debug=1` öffnet Layer-Toggles sowie JSON-Import und -Export. „Apply / Reload“ lädt eine Konfiguration neu; die URL kann deren Parameter tragen. Einzelne Generatoren werden nicht live ausgetauscht.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/growth/` öffnen. Alternativ den gesamten `src`-Ordner per HTTP ausliefern. Dieser Start erhält die absoluten Fontpfade unter `/assets/fonts/studies/`.

Three.js wird aus einem CDN geladen und benötigt eine Netzwerkverbindung. Die Fonts Barlow Condensed, DM Sans und DM Mono liegen lokal im Portfolio. Es gibt keine Google-Fonts-Anfrage. Angular kopiert die Studie als eigenständige Seite.

## Bewegung, Grenzen und Rechte

`prefers-reduced-motion` überspringt die Kameraglättung und setzt Wasser- und Atmosphärenzeit auf einen statischen Wert. Eine WebGL-fähige Browserumgebung bleibt erforderlich. Syntaxprüfungen ersetzen keine Prüfung der GPU-Darstellung.

Eigene Generatoren, Gestaltung und Inhalte unterliegen der [Portfolio-Lizenz](../../../LICENSE). Die jeweiligen Bedingungen von Three.js und den Schriften bleiben bestehen.
