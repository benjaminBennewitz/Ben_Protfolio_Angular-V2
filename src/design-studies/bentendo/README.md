# BENTENDO™ / DUNGEON WANTED

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/bentendo/)

Interaktiver 3D-Handheld mit bedienbarer Cartridge und einem spielbaren Pixel-Rollenspiel. Das Gerät bildet die physische Bühne; DUNGEON WANTED besitzt darunter eine eigenständige Spielwelt und Spielzustandsverwaltung. Laufender Entwicklungsstand, kein abgeschlossenes Vollspiel.

## Konzept und Gestaltung

Die Studie verbindet eine nostalgische Handheld-Hommage mit einer erkundbaren Abenteuerwelt. Gehäuse, Einschalter, Kontrast- und Lautstärkeräder, Cartridge und LCD reagieren auf Eingaben. Das Handheld-Modell wurde im Projekt vollständig mit Python erstellt. Die Musik entstand mit freien Tools und KI.

BENTENDO und DUNGEON WANTED sind fiktive Projektnamen. Die Studie ist unabhängig von Nintendo; Marken ihrer jeweiligen Rechteinhaber bleiben unberührt.

## Gerät und Bedienung

- Cartridge betrachten, umdrehen, einrasten lassen und durch eine animierte Aktion pusten; kein Mikrofonzugriff.
- Einschalten über den Power-Schalter; Gehäuseansichten per Pointer, Touch oder Bedienhilfe erreichen.
- Tastatur, Touch-Steuerung und die sichtbaren 3D-Tasten bedienen das Spiel.
- Pfeile bewegen die Figur, A/Leertaste interagiert, B öffnet den Rucksack beziehungsweise schließt Dialoge, START/Enter/P pausiert und SELECT/S speichert.
- Lautstärke, Musik und Effekte getrennt einstellen; Displaykontrast und optionale Kontaktprobleme über die Bedienhilfe steuern.
- Debug-Auswahl für direkte Raumaufrufe und LCD-Rauschen.

Die [Credits-Seite](credits.html) öffnet aus der Studiennavigation in einem neuen Tab, damit die laufende Spielsitzung erhalten bleibt.

## Spielwelt und Systeme

Bruchstein mit begehbaren Innenräumen, Bewohnern und Tieren bildet den Ausgangspunkt. Quests, Journal, Rucksack und Karte führen zu Waldgebieten, Rohrpuzzle und dem ersten Dungeon mit Kampf. Tag/Nacht, Bewohner-Tagesabläufe, Schenkengäste und wählbare Ruhezeiten ergänzen die Welt.

Spielstand, Charakterwahl und Audioeinstellungen bleiben lokal im Browser. Die Speicherung ist an den jeweiligen Browser und Origin gebunden; ein Stand von localhost wird nicht automatisch auf eine andere Domain übertragen.

## Architektur und Dateien

| Bereich | Verantwortung |
| --- | --- |
| [index.html](index.html), `styles/` | Zugängliche Bedienelemente, Gerätedarstellung und Dialoge |
| `scripts/core/` | Konfiguration und Ablaufsteuerung |
| `scripts/device/` | Modelle, Kamera, Cartridge und Eingaben |
| `scripts/display/` | Canvas-LCD und Grafikladen |
| `scripts/game/data/` | Räume, Figuren und Inhaltsdefinitionen |
| `scripts/game/systems/` | Spielregeln, Bewegung, Kampf, Quests und Speicherung |
| `scripts/game/render/` | Darstellung der Spielwelt und Spieloberfläche |
| `scripts/audio/` | Audioverwaltung, Effekte und Entwicklungswerkzeuge |
| `tests/`, `scripts/checks/` | Spieltests, Portfolio-Integration und Strukturprüfungen |
| `assets/`, `vendor/` | Modelle, Sprites, Medien und lokale Three.js-Laufzeit |
| `docs/` | Bestehende technische, gestalterische und spielerische Entwicklungsunterlagen |

Das Gerät nutzt Three.js, das Spiel ein Canvas-LCD. Die Importmap verweist auf die lokal mitgelieferte Three.js-Laufzeit. Es läuft keine Angular-Instanz im Spiel und kein iframe ist erforderlich.

## Lokal entwickeln und prüfen

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/bentendo/` öffnen. Alternativ im Studienordner `python -m http.server 8080` starten und `http://localhost:8080/` aufrufen. Für das Spielen ist keine eigene npm-Installation nötig.

Entwicklungstests im Studienordner:

```bash
npm ci
npm test
npm run check
npm run check:python
```

Python 3 ist für die Python-Strukturprüfung erforderlich. Optionale Generatoren können weitere Abhängigkeiten benötigen. `tests/portfolio-integration.test.js` prüft die Anbindung an Portfolio und Asset-Konfiguration.

## Portfolio-Integration und Quellen

Der Produktionsbuild im Portfolio-Stamm übernimmt die Laufzeitdateien. Tests, interne Dokumentation, Blender-Quelle, Prüf-/Generatorwerkzeuge und eigene Paketmetadaten werden gemäß `angular.json` nicht veröffentlicht. Die Kartenansicht nutzt eine gestaltete SVG-Handheldvorschau mit einem vom Spielrenderer erzeugten LCD-Ausschnitt.

Quellen und Bearbeitungen stehen in [CREDITS.md](CREDITS.md) und den [öffentlichen Credits](credits.html). Die separat verwendeten GBFX-Soundeffekte bleiben Fremdassets unter CC BY 4.0. Die dort dokumentierte Frage zur Weitergabe des Dungeonatlas bleibt davon getrennt. Eigene Beiträge unterliegen der [Portfolio-Lizenz](../../../LICENSE).

Alle dauerhaft benötigten Spielskripte, Tests und Unterlagen liegen innerhalb dieser Studie. Der Ignore-Eintrag `/scripts/` betrifft ausschließlich den lokalen Deployment-Ordner im Portfolio-Stamm.
