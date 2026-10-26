# SCOOP! — Comic Ice Cream Shop

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/scoop/)

Illustrativer Demo-Shop, in dem Eisfiguren, Produktwahl und Scrollbewegung eine gemeinsame Markenwelt bilden. Gestaltung und Interaktionen verbinden eine verspielte Produktinszenierung mit nachvollziehbaren Shop-Zuständen.

## Konzept und Gestaltung

Strawlarry / Erdbeere, Brostacchio / Pistazie und Jochen / Vanille treten als eigenständige SVG-Charaktere auf. Große Lilita-One-Headlines, Nunito Sans, Zutaten-Doodles und eine gezeichnete Pfadführung prägen die Comic-Gestaltung.

Hero, Sorten, Mix-Box, Markengeschichte und Flavor Vote führen durch die Microsite. Die Portraits sind als KI-Platzhalter gekennzeichnet.

## Shop-Interaktionen

- Einzelbecher mit 500 ml und einem Demo-Preis von 6,90 €.
- Mix-Box mit drei frei kombinierbaren Bechern für 20,70 €; dieselbe Sorte kann mehrfach gewählt werden.
- Tastaturbedienbare Mix-Auswahl, Warenkorb mit Mengenänderung, Entfernen und Summenberechnung.
- Warenkorb und Flavor Vote speichern ihren Zustand lokal im Browser.
- Der Demo-Checkout leert den Warenkorb und weist darauf hin, dass weder Bestellung noch Zahlung ausgelöst werden.
- Das Vote-Popup zeigt einen ausdrücklich fiktiven Zwischenstand, keine echte serverseitige Abstimmung.

Es gibt kein Bestellbackend, keine Zahlungsabwicklung und keinen Versand.

## Animation und Umsetzung

Der Hero lässt die Eisfiguren zeitversetzt auf die Waffel fallen und nachfedern. Kontaktschatten erscheinen beim Aufprall. Pupillen bleiben über Clip-Pfade innerhalb ihrer Augenformen; Arme werden entlang von Béziersegmenten verformt. Sprechblasen und Mundzustände reagieren auf Produktinteraktionen.

Die Mix-Box animiert gewählte Becher unabhängig voneinander. Der gezeichnete Hintergrundpfad folgt den tatsächlichen Section-Höhen und besitzt einen eigenen mobilen Verlauf. `ResizeObserver` berücksichtigt Layoutänderungen.

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Shop-Struktur und Dialoge | [index.html](index.html) |
| Layout, Typografie und Animationen | [styles.css](styles.css) |
| Shop-Zustand und Interaktionen | [script.js](script.js) |
| Aus den Original-SVGs abgeleitete Templates | [artwork.js](artwork.js) |
| Originalgrafiken und WebP-Previews | `assets/` |
| Lokale Webfonts und Lizenztexte | `fonts/` |

Die SVG-Instanzen erhalten eindeutige IDs für ihre Masken und Clips. Der Loader wartet auf Fonts und Bild-Decoding sowie eine Mindestanzeigezeit. Animationen berücksichtigen Tab- und Viewport-Sichtbarkeit. Reduced Motion zeigt den fertigen Hero und deaktiviert die entsprechenden Bewegungen.

## Bedienbarkeit und lokale Entwicklung

Warenkorb und mobiles Menü besitzen Escape-Bedienung und Fokusverwaltung. Die wesentlichen Shop-Aktionen sind per Tastatur und Touch erreichbar. Ohne JavaScript bleiben redaktionelle Inhalte und statische Produktgrafiken zugänglich.

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/scoop/` öffnen. Alternativ im Studienordner `python -m http.server 8080` und anschließend `http://localhost:8080/` starten. Die eingebetteten SVG-Templates benötigen keinen eigenen Fetch; eine zusätzliche npm-Installation ist nicht nötig.

## Portfolio und Rechte

Angular kopiert die Laufzeitdateien einschließlich lokaler WOFF-Fonts und ihrer Lizenzen. Illustrator-Master, Entwurfs-PNGs, ursprüngliche TTF-Schriften und Entwicklungsunterlagen sind gemäß `angular.json` vom Web-Build ausgenommen.

Originalgrafiken und eigene Umsetzung unterliegen der [Portfolio-Lizenz](../../../LICENSE). Die jeweiligen OFL-Dateien bleiben bei den Font-Ordnern erhalten.
