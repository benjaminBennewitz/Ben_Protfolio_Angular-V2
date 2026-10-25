# Quellgewölbe: neue Grafik und Raumkonturen

Folgepatch auf BENTENDO_Schwert_Swoosh_170ms_Rucksack_Patch.zip. Im Projektstamm entpacken und vorhandene Dateien ersetzen. Enthält ausschließlich neue oder geänderte Dateien.

## Räume

- Einstieg: verwinkelter Vorraum mit Seitennische, Pfeiler und schmalem Ostgang.
- Galerie: schmaler Westzugang, breitere Kammer mit versetzten Säulen und südlicher Nische. Die Abflussrinne bleibt passierbar.
- Gegengewichtskammer: voneinander abgegrenzte Funktionsbereiche und ein einzelner Durchlass durch das Fallgitter. Das bestehende Kistenrätsel bleibt lösbar.
- Wachposten: nördlicher Lagerbereich, Querflur und südliche Seitenkammer. Die Verbandskiste steht jetzt bei 4/4, um keine unerreichbare Bodentasche einzuschließen.
- Spinnenbrut: zurückspringende Außenkontur mit Seitennischen und zwei Pfeilern; ausreichend freie Fläche für die drei Wellen.

## Assets

Der bereitgestellte GBDungeon-Atlas liefert Mauern, Abschlusskacheln, Steinböden, Säulenmauerwerk, Truhen, Durchgangsbögen und das Fallgitter. Native 16-Pixel-Ausschnitte und die vorhandene LCD-Palette bleiben erhalten. Awakening-Gegner und vorhandene Einrichtung ergänzen den neuen Atlas. PNG und Tiled-Tileset sind unter assets/tilesets/gb-dungeon abgelegt. Die Datei mit Endung .tsx enthält Tiled-XML.

## Spielstände

Die Dungeon-Grundrissversion wird beim nächsten Speichern mitgeführt. Positionen alter Speicherstände, die nun in Mauern oder Einrichtung liegen, werden auf freie Bodenfelder versetzt. Das betrifft Spielfigur, Gegner, deren Bewegungsursprung, Herzfunde und den verlorenen Beutel. Inventar, Münzen, Gegnerleben, Beute und Questfortschritt bleiben erhalten. Ungültige Positionen außerhalb des früheren Grundrisses werden weiterhin abgelehnt.

## Prüfung

npm run check und alle 182 Tests erfolgreich. Die Prüfungen umfassen zusammenhängende Laufwege, erreichbare Interaktionsseiten, Möbelgrundflächen, Gegnerstarts, Ankunftsfelder aller Durchgänge, Fallgittersperre, das echte Schieberätsel, Nestwellen und alte Speicherstände. Alle fünf vollständigen Räume wurden mit dem produktiven Canvas-Renderer und den geladenen Spielassets gerendert und visuell kontrolliert. Kein zusätzlicher vollständiger Browser-/WebGL-Durchlauf.
