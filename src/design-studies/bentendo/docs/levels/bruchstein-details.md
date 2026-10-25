# Bruchstein: Details, Erweiterung und Ortskarte

## Änderungen

- Stadt von 24 × 22 auf 34 × 32 Felder vergrößert: 1.088 statt 528 Felder, rund doppelte Fläche. Der ursprüngliche Gildenplatz und die Wehr-Aufgabe bleiben an ihren bisherigen Positionen.
- Südlicher Einstieg nach [11,29] versetzt. Neuer Rundweg über einen zweiten Kanalsteg; Wohnhäuser, Webstube, Werkstatt und Marktlager ergänzen die Stadt. Die Hauszugänge führen inzwischen in individuell eingerichtete Innenräume; siehe bruchstein-houses.md.
- Vier zusätzliche Bewohner mit kurzen Alltagsdialogen. Dazu ein Hund, zwei Hühner und eine weitere Katze. Tiere wechseln dezent ihre Haltung; bei reduzierter Bewegung bleiben sie statisch.
- Die beiden Anbindepfosten neben der Schenke sind jetzt ein eigenes benanntes Objekt samt Kollision. Der bisherige reine Zeichenaufruf am Haus entfällt.
- Keine zufällig einzeln verteilten Gras- oder Blumen-Tiles mehr. Stattdessen bewusst angelegte Beete, Wiesen und Hecken außerhalb der Hauptwege. Auch nur ein Feld breite Pflanzstreifen und Wege erhalten vollständige obere, untere und seitliche Abschlüsse.
- Dichte Hecken sind Hindernisse, Blumenbeete und hohe Wiesen bleiben begehbar. Die Baumgruppen bilden weiterhin die äußere Stadtgrenze.

## Bildschirm und Orientierung

Die feste Titelzeile oben entfällt. Kamera und Welt-Clipping nutzen die vollständigen 160 × 144 Pixel. Die Aktionshinweise erscheinen weiterhin nur bei einem erreichbaren Objekt vor der Figur.

Beim Betreten eines Ortes erscheint dessen Name etwa 1,6 Sekunden lang im Stil der bestehenden Dialogbox. Die Meldung sperrt keine Bewegung; sie pausiert während eines Gesprächs oder geöffneten Menüs. Ein echter Dialog hat immer Vorrang.

Die Ortskarte ist ein fester Rucksackeintrag und belegt kein Gegenstandsfach:

1. B öffnet den Rucksack.
2. A öffnet „Karte ansehen“.
3. Die Karte zeigt Ortsnamen, Wege, Wasser, Bäume und Gebäude. Ein eingefasstes Kreuz markiert die aktuelle Position.
4. B führt von der Karte zum Rucksack zurück, ein weiteres B schließt diesen.

Im Gildeneingang zeigt die Karte Bruchstein mit dem Gebäudeeingang als Standort. In den bisherigen Prototypräumen zeigt sie den jeweiligen Grundriss. Während Karte, Journal oder Rucksack geöffnet sind, pausieren aktive Spielzeit und Hausmeisterbewegung. Auch gehaltene Richtungseingaben starten dabei keine neue Bewegung.

## Technische Einordnung

Neue Karten- und Bewohnerdaten liegen unter scripts/game/data/village-life.js. Die Tierdarstellung ist unter scripts/game/render/village-life.js gekapselt; die Ortskarte liegt in scripts/game/render/map.js. Bestehende Objektaktionen, Journal, Rucksack und Kollisionsprüfung werden weiterverwendet. Der statische Kartenboden bleibt gecacht.

Keine neuen Assetpakete, keine Änderungen an Originalgrafiken, Audio, Cartridge oder Gerätegeometrie. Die Renderer verwenden weiterhin die vorhandenen lokalen Tilesets.

## Prüfung

- npm run check: bestanden; alle Funktionen dokumentiert und höchstens 20 Zeilen, alle eigenen Quelldateien höchstens 450 Zeilen.
- npm test: 24 Tests bestanden. Neue Prüfungen decken Pfosten und Hecken, die Erreichbarkeit neuer Begegnungen und Hauszugänge, den zweiten Steg, die Kartenbedienung und die kurze Ortsmeldung ab.
- Python-Strukturprüfung: bestanden.
- Ganze Karte sowie LCD-Ausschnitte für alte und neue Viertel, Rucksack, Ortskarte und Ortsmeldung mit einer Canvas-Laufzeit gerendert und visuell geprüft.
- Eine vollständige Browser-/WebGL-Prüfung war in dieser Umgebung weiterhin nicht verfügbar; sie wird nicht als durchgeführt ausgewiesen.

## Einspielen

Dieser Folgepatch setzt den vorherigen Bruchstein-Auftakt-Patch voraus. Die ZIP enthält ausschließlich seitdem neue oder geänderte Dateien. Direkt in den bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Es müssen keine Dateien gelöscht oder zusätzliche Assets heruntergeladen werden.
