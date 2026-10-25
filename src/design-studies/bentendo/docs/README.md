# BENTENDO™ – DUNGEON WANTED

Interaktiver 3D-Handheld mit eigenständiger Cartridge und einem modularen Rätselprototyp. Dieser Stand schafft die technische Grundlage des Neustarts; er ist noch nicht die neu gestaltete Spielwelt.

## Refactor-Patch einspielen

1. Patch in das vorhandene Projekt kopieren und gleiche Dateien ersetzen.
2. Im Ordner b2boy ausführen:

```powershell
powershell -File .\scripts\maintenance\cleanup-legacy.ps1
```

Das Skript entfernt ausschließlich die unter docs/deleted-files.json aufgeführten Altdateien. Es sichert diese vorher in einem benachbarten b2boy-legacy-backup-Ordner. Es löscht weder Tilesets noch Musik oder eigene, nicht aufgeführte Dateien. Bereits neu exportierte Cartridge-Modelle unter assets/models/cartridge bleiben erhalten.

Die Aufräumung im gelieferten Arbeitsstand ist bereits umgesetzt. Auf deinem Rechner ist der zusätzliche Schritt notwendig, weil eine ZIP beim Entpacken keine alten Dateien entfernen kann. Ohne ihn läuft die neue Seite trotzdem; die alten Quellen liegen dann lediglich noch daneben.

## Lokal starten

```sh
python -m http.server 8080
```

Danach http://localhost:8080 öffnen. Unter Windows ist alternativ `py -m http.server 8080` möglich. Keine Laufzeitinstallation und kein Build erforderlich. Die Importmap lädt ausschließlich lokale Three.js-Dateien.

## Bedienen

- Maus zum oberen Rand oder Bedienung → Oben. Cartridge anklicken. Die Rückansicht bleibt über dem Gerät stehen; seitliches Verlassen zeigt den entsprechenden Winkel.
- In der Rückansicht vollständig hineindrücken, zurück zur Front und Power einschalten.
- Power halten und schieben; per Tastatur mit Tab und Enter erreichbar.
- „Betrachten“ zieht das Modul heraus, zoomt es heran und schaltet das Gerät aus. Vor dem Zurücksetzen wird der laufende Spielstand lokal gesichert; am Titel kann er fortgesetzt werden.
- In der Detailansicht lässt sich das Modul umdrehen, durchpusten und wieder einlegen. Beim Verlassen der Ansicht gleitet es automatisch in seinen vorherigen Sitz zurück.
- Erster gültiger Start immer erfolgreich. Danach höchstens ein zufälliger Kontaktfehler pro Sitzung, mit 12 % Wahrscheinlichkeit je Start. Unter Bedienung abschaltbar.
- Kein Mikrofonzugriff. Pusten ist eine animierte Aktion mit kurzem synthetischem Geräusch.
- Lautstärke und Kontrast über Stellräder oder native Bereichsregler; Kontrast ausschließlich bei laufendem Spiel. Lautstärke und Stummschaltung werden lokal gespeichert und mit Symbolen angezeigt.
- Pfeile: laufen. A/Leertaste: untersuchen. START/Enter/P: Pause; am Titel bestätigen. SELECT/S: Speicherdialog. B: Dialog schließen oder Rucksack. J: Journal. Touchknöpfe und 3D-Tasten funktionieren ebenfalls.
- Debug-Auswahl springt direkt in einen Raum, ohne Modul-/Bootablauf. Das ist ein ausdrücklicher Testzugang.

## Projektstruktur

```text
scripts/
  core/                  DOM, Konfiguration, Frameplanung, native Oberfläche
  device/                Handheld, Kameraführung, Modelle, Regler
    cartridge/           eigenes Modell, Zustände, Aktionen
    input/               Pointer-, Tastatur- und Spielsteuerung
  display/               LCD, Pixelschrift, Grafikladen
  audio/                 vorhandene MP3s und Bediengeräusche
  game/
    data/                Raumdaten und Einrichtungsdefinitionen
    systems/             Kollision, Aktionen, Fundstücke, Rätsel, Texte
    render/              Boden, Objekte, Figuren, Dialog und Inventar
  blender/               eigenständiger Cartridge-Generator
  maintenance/           gezieltes Aufräumen der alten Struktur
  checks/                verbindliche Quelltextprüfungen
styles/                  Basis, Gerät, Bedienflächen
tests/                   Zustands- und Erreichbarkeitstests
assets/                  Modelle, Blender-Quelldatei, Cover, Sprites, Musik, Tilesets
docs/                    Planung, Credits, Technik und Levelbeschreibungen
vendor/                  unverändertes Three.js einschließlich Lizenz
```

## Prüfen

Nur für Entwicklungstests:

```sh
npm ci
npm run check
npm test
npm run check:python
```

Die letzte Prüfung benötigt eine lokale Python-Installation. Der Browser braucht weder npm noch Python-Pakete. Acorn ist ausschließlich eine Entwicklungsabhängigkeit für die AST-Prüfung.

Siehe technical/code-rules.md, technical/cartridge.md und technical/validation.md.

## Verfeinerte Geräteoberfläche

- Rückkehr aus Ober-/Seitenansichten bereits beim Betreten des dunkelgrauen Displayrahmens.
- Rückseitenwechsel ohne sofortiges Zurückspringen am ursprünglichen Klickpunkt.
- Cartridge-Bedienfeld rechts; ausschließlich das betrachtete Modul kommt nach vorn und wird größer.
- Bündige Einsetztiefe aus den tatsächlichen Modellabmessungen.
- A/B/Journal oberhalb der Richtungstasten.
- Audioeinstellungen unter Local-Storage-Schlüssel bentendo.audio.v1. Dieser Schlüssel enthält nur Lautstärke und Stummschaltung. Der Spielstand besitzt einen getrennten, versionierten Schlüssel. Gesperrter oder beschädigter Browserspeicher beeinträchtigt die Bedienung nicht; dann gelten sichere Standardwerte. Speicherzugriffe während Reglergesten werden gebündelt.

## Spielbarer Dorfauftakt

Der normale Einstieg führt jetzt in einen eigenständigen Bruchstein-Abschnitt mit Wehr-Aufgabe, laufendem Hausmeister und Gildeneingang. Die bisherige Stadt und Rätselräume bleiben im Debug erhalten. Ablauf, Umsetzung, Patchinstallation und Prüfgrenzen stehen in [levels/bruchstein-opening.md](levels/bruchstein-opening.md).

Die vergrößerte Stadt und die Kartenbedienung sind in [levels/bruchstein-details.md](levels/bruchstein-details.md) beschrieben.

## Bewohner und Tierbewegung

Der Folgepatch entfernt das falsch platzierte Dachdetail und die Hühner. Fünf verschiedene Bewohner aus dem bereitgestellten 5yvalia-Set sowie Eichhörnchen, Igel und Maus von GamebowGames sind integriert. Katzen und Tiere bewegen sich auf kurzen, kollisionsgeprüften Wegen mit Ruhepausen. Details: [levels/bruchstein-life.md](levels/bruchstein-life.md).

## Häuser, Wegsperren und Wasserfall

Die sieben Dorfhäuser sind betretbar und individuell eingerichtet; die Schenke besitzt Gästezimmer im Obergeschoss. Bewohner haben eine ruhige Idle-Animation. Im Norden und Osten sind zwei künftige Ausgänge mit Warnsperren angelegt. Der nördliche Wasserfall speist den Mühlgraben, der längere Ast steckt jetzt direkt im Wasserrad. Aktuelle Details: [levels/bruchstein-houses.md](levels/bruchstein-houses.md).

Tierausrichtung, fünf artspezifische Laute, die kompakte Ortsmeldung, dichtere Vegetation und die dunklere Heldenkontur sind in [levels/bruchstein-polish.md](levels/bruchstein-polish.md) dokumentiert.

Der aktuelle Ausbau ergänzt Nordhöhle und Felsränder, korrigiert sämtliche Grasabschlüsse, macht Büsche begehbar und nutzt weitere vorhandene Awakening-Grafiken für spitze Bäume, lose Blumen, Gräser, Vasen, Frösche, Schlangen und wenige Vögel. Details: [levels/bruchstein-north.md](levels/bruchstein-north.md). Geprüfte Quellausschnitte: [art/awakening-inventory.md](art/awakening-inventory.md).

Die anschließende Korrektur von Baum-/Frosch-Ausschnitten, Pflanzrändern und durchgehender nördlicher Felswand nach der Wasserfallreferenz ist in [levels/bruchstein-consistency.md](levels/bruchstein-consistency.md) dokumentiert.

Geschlossene Wiesen ohne ausgesparte Innenecken, leichte Pflanzenüberlagerung beim Durchlaufen, sparsame Bodenkörnung und die ungepflasterte Brunnenreihe sind in [levels/bruchstein-plant-ground.md](levels/bruchstein-plant-ground.md) beschrieben.

Der erste Entdeckungsausbau ergänzt acht belegte Fundstellen, vier Journalnotizen, durchsuchbare Vasen, eine Reisetruhe im Gras und die kleine Suchgeschichte um Frau Moos’ blaue Brosche. Münzen, Krimskrams-Tausche und Belohnungen sind einmalig; bereits durchsuchte Fundstellen bleiben erkennbar. Details und Fundorte: [levels/bruchstein-discoveries.md](levels/bruchstein-discoveries.md).

Die jüngste Innenraumkorrektur ergänzt die L-Theke mit Hockern und Rückbuffet, eine kompaktere ausgestattete Werkstatt, mehr Lagergefäße, vollständige Trennwände und geschlossene Regalrahmen. Tierlaute sind angehoben; Türen und Truhen besitzen eigene Öffnungsprofile. Details und Prüfgrenzen: [levels/bruchstein-interior-audio.md](levels/bruchstein-interior-audio.md).

Der Audio-Folgepatch senkt die BGM um zehn Prozent, hebt Tiere weiter an und macht Tür-/Truhenklänge deutlicher. Erfolgreiche Truhenfunde erhalten einen zeitversetzten Fundjubel; die Audio-Wiederaufnahme verliert keine noch wartenden Klänge. Details: [levels/bruchstein-audio-balance.md](levels/bruchstein-audio-balance.md).

Der folgende Detailpatch entfernt die hellen Kiefernränder, ergänzt gelegentliche Bewohnersprüche und wechselnde Antworten mit passenden Fundhinweisen und zeichnet immer nur eine aktuelle Meldung. Details: [levels/bruchstein-resident-chatter.md](levels/bruchstein-resident-chatter.md).

Auf der Rückseite kann die teilweise eingesteckte Cartridge jetzt mit gedrückter Maustaste in den Schacht geschoben werden. Der bisherige Button bleibt als Alternative erhalten. Verhalten und Prüfgrenzen: [cartridge-drag.md](cartridge-drag.md).

Zufällige Bewohnersprüche erscheinen direkt an den Personen als Sprechblasen mit höchstens zwei Zeilen und langsamem Textvorschub. Details: [levels/bruchstein-speech-bubbles.md](levels/bruchstein-speech-bubbles.md).

Sieben kurze Bewohnerwege, drei zusätzliche Innenraumbewohner und sichtabhängige Reaktionen auf Herumstehen oder untersuchte Möbel ergänzen den Alltag. Gespräche verwerfen alle Sprechblasen und wartenden Kommentare. Details: [levels/bruchstein-reactive-residents.md](levels/bruchstein-reactive-residents.md).

Ziel-Erfolge erhalten mehrstimmige Fanfaren. Der Ast aus dem Wasserrad bleibt im Rucksack und kann beim Hund geworfen und zurückgebracht werden. Details: [levels/bruchstein-success-fetch.md](levels/bruchstein-success-fetch.md).

Der Rucksack bietet Gegenstandsauswahl, Benutzen und Ansehen. Der Hund begleitet nach dem Apportieren vorübergehend draußen. Garnsuche und Vorratskontrolle ergänzen die Dorfaufgaben; Questfanfaren erhalten kurz Platz gegenüber der Musik. Details: [levels/bruchstein-inventory-tasks.md](levels/bruchstein-inventory-tasks.md).

Der Dorfhund verwendet jetzt die konturierte Wolfgrafik mit Stand-/Laufanimation aus dem gelieferten Minifolks-Paket. Quelle und Framebelegung: [art/minifolks-dog.md](art/minifolks-dog.md).

Der Begleithund macht in Engstellen Platz, die Vorratsprüfung bestätigt untersuchte Möbel mit Häkchen und die Schenke bietet Sitzplätze mit Bedienweg des Wirts und Getränkeauswahl. Bedienung, Preise und Prüfgrenzen: [levels/bruchstein-tavern-courtesy.md](levels/bruchstein-tavern-courtesy.md).

Der normale Start bietet zwei einfache Charakterpresets mit großen Pixelporträts und passenden weiblichen/männlichen Spielfiguren. Vorratsprüfungen zählen auch vor Auftragsannahme; Nummern entfallen. Details: [levels/bruchstein-character-stock.md](levels/bruchstein-character-stock.md).

Die Porträts sind nach der gelieferten Gameboy-Referenz auf ein gröberes 64×64-Raster überarbeitet. Wechseln, Bestätigen und Zurück erhalten kurze Browserklänge. Details: [levels/bruchstein-portrait-bleeps.md](levels/bruchstein-portrait-bleeps.md).

Die weibliche Spielfigur hat eine entspannte Armhaltung und lange Haare in allen Richtungen; der bisherige unpassende Ausschnitt wird nicht mehr verwendet. Das männliche Preset bleibt pixelgenau unverändert. Die Auswahlporträts und Bedienklänge bleiben erhalten.

Automatische lokale Spielstände mit Fortsetzen/Neues Spiel, Tastaturmodus ohne Mauszeiger, Rucksackklänge und ein überarbeiteter Papierplan sind in [levels/bruchstein-save-map.md](levels/bruchstein-save-map.md) beschrieben.

Die untere Geräteansicht zeigt die Tasten und hält beim Bedienen die Kamera fest. START pausiert das laufende Spiel, SELECT öffnet den Speicherdialog. Bedienung und Prüfgrenzen: [levels/bruchstein-device-buttons.md](levels/bruchstein-device-buttons.md).
