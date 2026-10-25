# Bruchstein: spielbarer Auftakt

## Umfang

Ein neuer, eigenständiger Dorfabschnitt bildet den normalen Einstieg. Die bestehende Stadt und alle Rätselräume bleiben unverändert über Debug erreichbar. Der neue Abschnitt verwendet dieselbe Game-Klasse, Objektaktionen, Kollision, Dialoge und Journalverwaltung. Geräteansichten, Cartridge, LCD-Effekte und vorhandene Audiodateien bleiben erhalten.

## Ablauf

1. Normal einschalten, den Titel mit A/START bestätigen und eines der beiden Charakterpresets auswählen. Nach Bestätigung mit A erscheint der Aushang als Dialog und liegt bereits im Journal.
2. Vom südlichen Zugang zum Gildenplatz gehen. Die Gildentür ist verschlossen; am rechten Türpfosten hängt der Hinweis des Hausmeisters.
3. Hausmeister am Mühlgraben ansprechen. Sein Hinweis ist hilfreich, aber keine versteckte Voraussetzung für das Rätsel.
4. Vom westlichen Ufer aus den Ast im Wasserrad untersuchen. Nach dem Dialog erneut A drücken, um ihn herauszuziehen. Der Aktionshinweis wechselt von „untersuchen“ zu „herausziehen“.
5. Den unmittelbar links oberhalb des Astes stehenden Wehrhebel betätigen. Wasser und Mühlrad bewegen sich jetzt; der Hausmeister geht nach Schließen seines Dialogs zur Gilde.
6. Dem Hausmeister Platz lassen. Er wartet, wenn die Spielfigur seinen nächsten Schritt blockiert. Bei seiner Ankunft öffnet sich die Tür.
7. Die Gildentür mit A öffnen. Im kleinen Abschlussraum stehen Hausmeister, Gildenbuch und ein Hinweis auf den späteren Archivgang bereit. Die südliche Tür führt zurück ins Dorf.

Optional: Über die Holzbrücke auf die östliche Seite gehen. Südlich der Brücke liegt Maras feuchte Notiz. Nach dem Einsammeln verschwindet sie aus der Welt und bleibt im Journal.

## Gestaltung

- 34 × 32 Felder, 16 Pixel pro Feld, Ausgabe weiterhin 160 × 144 Pixel.
- Gildenhalle im Norden, Schenke im Westen, Mühlenhaus am östlichen Graben.
- Zusammenhängende Baumgruppen, schmaler Dorfzugang, Pflasterplatz, Brunnen, kleine Alltagsrequisiten und benannte Untersuchungsobjekte.
- Native 16-Pixel-Spielfigur aus dem vorhandenen Awakening-Spriteblatt; dieselbe Darstellung im neuen Gildeneingang.
- Die Außenwelt kombiniert vorhandene Schwarzweiß-Tiles mit Dach-, Mauer- und Pflasterteilen des vorhandenen neuen Classic-Tilesets. Die LCD-Farbumsetzung erfolgt beim Laden, ohne Originaldateien zu verändern.
- Neue kleine Requisiten und Animationen entstehen direkt im Canvas; es werden keine zusätzlichen Assetpakete benötigt.

## Zustände und Performance

- Karte, Gebäude und Baumpositionen: scripts/game/data/village.js.
- Aufgaben und Hausmeisterbewegung: scripts/game/systems/village.js.
- Außendarstellung und räumliche Sortierung: scripts/game/render/village.js.
- Ast, Wasserfluss und Gildenzugang verwenden die vorhandenen Game-Flags. Die Hausmeisterbewegung liegt im bestehenden Raumzustand. Keine Veränderung der statischen Raumobjekte während des Spiels.
- Der statische Kartenboden wird je Raum in einem WeakMap-Canvas zwischengespeichert.
- Ruhende Dorfanimationen fordern höchstens alle 100 ms einen Frame an. Bewegung nutzt die vorhandene Frame-Schleife. Dialog, Journal, Ortskarte und Rucksack pausieren die Umgebung und den Hausmeister; ausgeblendete Tabs pausieren wie bisher.
- Bei reduzierter Bewegung bleiben Wasser, Banner, Gras und Katze statisch. Der Hausmeister wechselt ohne Zwischenbilder zwischen den Wegpunkten; die Aufgabe bleibt lösbar.
- Fortschritt bleibt beim Raumwechsel erhalten. Wie bisher beginnt Ausschalten beziehungsweise Debug-Neustart einen neuen Durchlauf. Kein neuer dauerhafter Spielstand.

## Prüfung dieses Patches

- 24 Node-Tests bestanden, davon sieben neue Tests für Erreichbarkeit, vollständigen Ablauf, Journal und wartenden Hausmeister.
- npm run check und Python-Strukturprüfung bestanden.
- Dorfkarte sowie LCD-Ausschnitte für Einstieg, Platz, Gilde und Wehr mit einer Canvas-Laufzeit gerendert und visuell geprüft.
- Eine vollständige Browser-/WebGL-Prüfung konnte in dieser Umgebung nicht ausgeführt werden, da kein Browser installiert war und dessen Download scheiterte. Desktop-/Mobilbedienung deshalb nach dem Einspielen im echten Browser prüfen.

## Patch einspielen

ZIP direkt im bestehenden Projektordner entpacken und die enthaltenen Dateien ersetzen. Es sind ausschließlich neue oder geänderte Dateien enthalten. Vorhandene assets/ und vendor/ bleiben unangetastet; keine Dateien müssen gelöscht werden. Debug „Bruchstein · Auftakt“ öffnet den neuen Abschnitt direkt, „Stadt · Prototyp“ die bisherige Stadt.

## Erweiterung und Ortskarte

Der Folgepatch ergänzt die Details aus [bruchstein-details.md](bruchstein-details.md): doppelte Stadtfläche, zusammenhängende Pflanzbereiche, feste Pfosten, weitere Bewohner und Tiere sowie die Ortskarte im Rucksack. Die feste Ortsleiste entfällt; die Welt nutzt alle 144 Pixel Höhe.
