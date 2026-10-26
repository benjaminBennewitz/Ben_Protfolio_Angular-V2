# BENTENDO™ / DUNGEON WANTED

Eigenständige Designstudie von B²: ein interaktiver 3D-Handheld mit bedienbarer Cartridge und einem spielbaren Pixel-Rollenspiel. Laufender Entwicklungsstand, kein abgeschlossenes Vollspiel.

## Im Portfolio

- Studie: `/design-studies/bentendo/`
- Projektkarte und Quicklink: `/portfolio#design-studies`
- Der vorhandene Angular-Asset-Schritt kopiert das Spiel unverändert als eigenständige Seite. Keine Angular-Laufzeit im Spiel und kein iframe.
- Die Vorschau ist eine gestaltete SVG-Handheldansicht mit einem echten, über den Spielrenderer erzeugten LCD-Ausschnitt.

## Lokal entwickeln

Im Portfolio-Stamm: `npm start`, dann `/design-studies/bentendo/` öffnen. Alternativ in diesem Ordner `python -m http.server 8080` und `http://localhost:8080/` öffnen.

Nur für die Entwicklung im Spielordner: `npm ci`, `npm test`, `npm run check` und `npm run check:python`.

## Enthalten

Bedienbares Three.js-Gerät, Cartridge-Interaktionen, Touch- und Tastatursteuerung, Canvas-LCD, Charakterwahl, Bruchstein mit Innenräumen, NPCs und Tieren, Quests und Journal, Wald und Rohrpuzzle, erstes Dungeon mit Kampf, Rucksack/Profil, lokales Speichern, Tag/Nacht, Gäste im Wirtshaus und wählbare Schlafzeiten.

Spielstand und Audioeinstellungen bleiben lokal im Browser. Der vorhandene Speicherschlüssel wird bei der Integration nicht geändert. Bei einem Wechsel von localhost zu einer anderen Domain lässt sich der Browserstand nicht automatisch mitnehmen.

## Build und Quellen

`npm run build:production` im Portfolio-Stamm baut das Portfolio einschließlich der Studie. Tests, Prüf-/Generatorwerkzeuge, Blender-Quelldatei, Entwicklungsdokumentation und eigene Paketmetadaten der Studie werden nicht in den Web-Build kopiert. Sie bleiben im Repository erhalten.

Öffentliche Quellenübersicht: [Credits](credits.html), direkt in der Studiennavigation und in der Bedienhilfe verlinkt. Quellen und Rechtehinweise: [CREDITS.md](CREDITS.md). Ausführliche bestehende Entwicklungsunterlagen: `docs/`. Die Quellenverweise ersetzen keine Lizenznachweise der gelieferten Fremdassets.

Die Werkzeuge für den einmaligen Git-Erstimport wurden nach der Integration entfernt. Der dauerhafte Portfolio-Integrationstest liegt unter `tests/portfolio-integration.test.js` und läuft mit `npm test` im Studienordner. Laufzeitcode, Entwicklungswerkzeuge, Tests und Spielunterlagen bleiben vollständig innerhalb dieser Studie.
