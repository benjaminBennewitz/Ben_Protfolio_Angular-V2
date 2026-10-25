# BENTENDO ins Portfolio übernehmen und erstmals versionieren

Basis: `b2folio--251026--1944.zip` und `b2boy.zip`, 25. Oktober 2026. Der neue Spielstand aus der hochgeladenen ZIP ist maßgeblich; ältere Arbeitskopien wurden nicht darüberkopiert.

## Integration

Den Integrationspatch im **Portfolio-Stamm** entpacken. Er enthält die geänderte Projektkartenliste und Angular-Asset-Konfiguration, die neue Studie unter `src/design-studies/bentendo/`, Vorschaubild, Dokumentation und Commit-Werkzeuge. Andere Studien bleiben unverändert.

BENTENDO erscheint als achte Studie mit Karte und automatisch generiertem Quicklink. URL: `/design-studies/bentendo/`. Das Spiel bleibt eine unabhängige Vanilla-JS-/Three.js-Seite. Der bestehende Angular-Build übernimmt die Laufzeitdateien; Tests, Werkzeuge, Entwicklungsunterlagen und Blender-Quelle bleiben nur im Repository. `CREDITS.md` ist über die Hilfe erreichbar.

## Commitfolge lokal erstellen

Beide ZIPs enthalten keinen `.git`-Ordner. Der Patch kann deshalb deine bestehenden lokalen Commits nicht verändern. Das mitgelieferte Node-Skript erstellt die neue Folge im vorhandenen Portfolio-Repository mit deiner normalen Git-Identität und aktuellen Commitzeit. Es setzt keine Autoren- oder Commitdaten und führt keinen Push aus.

Im Portfolio-Stamm, auch direkt in Windows CMD:

```cmd
git status
node scripts/commit-bentendo-history.mjs --files
```

Die erste Ausführung ist ausschließlich eine Vorschau. Danach einen eigenen Branch anlegen und die geprüfte Folge erstellen:

```cmd
git switch -c feat/bentendo-study
node scripts/commit-bentendo-history.mjs --apply
git log --oneline -11
git status
```

Das Skript erstellt elf fachlich gegliederte **Erstimport-Commits des jetzigen Stands**. Zuerst kommt die Portfolio-Anbindung, danach die Gerätebasis, Darstellung, Spielwelt, Spielmechanik, Kampf, Tagesablauf, Audio, Tests und Dokumentation. Es handelt sich nicht um rekonstruierte frühere Entwicklungsstände. Einzelne Zwischencommits enthalten noch nicht alle gegenseitigen Imports und sind deshalb keine eigenständig spielbaren Releases. Der letzte Stand ist vollständig.

Jede Datei wird genau einer Gruppe zugeordnet. Alle neuen Spielquellen sind erfasst. Der genaue Plan steht in `scripts/bentendo-commit-plan.json`; die ausführliche Vorschau listet jede Datei auf. Das Skript nutzt explizite `git add -- <Dateien>`-Aufrufe statt `git add .`.

Voraussetzungen: vorhandenes Git-Repository, ausgecheckter Branch, konfigurierte Git-Identität und leerer Staging-Bereich. Nicht vorgemerkte, andere Änderungen bleiben unberührt. Bereits gestagte Änderungen führen vor dem ersten Commit zum Abbruch. Dateien mit geändertem Inhalt gegenüber dem Integrationspatch führen ebenfalls vor dem ersten Commit zum Abbruch; reine CRLF/LF-Unterschiede werden toleriert. Keine automatischen Resets, Löschungen oder Force-Optionen.

Wird die Folge zwischen zwei Commits unterbrochen, kann dasselbe Skript erneut gestartet werden; schon unverändert erfasste Gruppen werden übersprungen. Nach einem fehlgeschlagenen Git-Hook den angezeigten Index selbst prüfen und den Fehler beheben. Das Skript räumt fremde oder bereits gestagte Änderungen nicht eigenmächtig weg.

Nach Prüfung der lokalen Historie:

```cmd
git push -u origin HEAD
```

## Prüfen und weiterentwickeln

```cmd
npm run build:production
npm test -- --watch=false
node --test scripts/tests/bentendo-integration.test.mjs
```

Spieltests im Studienordner:

```cmd
cd src\design-studies\bentendo
npm ci
npm test
npm run check
npm run check:python
```

Das Spiel erhält im Repository seine vorhandenen Tests und Werkzeuge, aber keinen zweiten `.git`-Ordner. Für weitere Spieländerungen künftig einzelne fachliche Commits unter `src/design-studies/bentendo/` anlegen. Die Erstimportfolge braucht nur einmal ausgeführt zu werden.

## Quellen und verbleibende Nachweise

Die Credits benennen die belegten Quellen und markieren die bereits in der Spiel-ZIP fehlenden Hersteller-/Lizenzangaben, insbesondere beim gelieferten Handheld-Modell, Minifolks-Paket und Dungeonatlas. Die Integration erfindet dazu keine Urheber oder Lizenzen. Kein neues externes Assetpaket wurde hinzugefügt. Die SVG-Projektvorschau ist neu gestaltet und enthält eine echte Szene des vorhandenen Spielrenderers.


## Validierung dieses Integrationsstands

- Angular-Produktionsbuild erfolgreich; die unveränderten übrigen Studien bleiben im Build.
- 37 bestehende Portfolio-Tests und zwei zusätzliche Integrationsprüfungen bestanden.
- Alle 228 Spieltests sowie JS-/CSS- und Python-Strukturprüfungen bestanden.
- Browserprüfung des tatsächlich gebauten Pfads `/design-studies/bentendo/`: 3D-Gerät geladen, Spiel gestartet, Credits erreichbar, keine lokalen HTTP-Fehler und keine JavaScript-Laufzeitfehler.
- Acht Studienkarten vorhanden; BENTENDO auf Desktop und bei 390 Pixel Breite geprüft, kein horizontaler Überlauf auf Mobile.
- Sauberer Produktionsbuild geprüft: keine Tests, Blender-Quelle, Generatoren oder GDD-Lösungsdokumentation im veröffentlichten Studienordner.
- Commit-Skript in einem separaten Test-Repository mit elf echten Import-Commits ausgeführt. Vollständiger Zielstand identisch; Schutz bereits gestagter Dateien, Inhaltsprüfung, unbeteiligte lokale Datei und erneute Ausführung geprüft. Testidentität und Test-Repository sind nicht Teil des Patches.
