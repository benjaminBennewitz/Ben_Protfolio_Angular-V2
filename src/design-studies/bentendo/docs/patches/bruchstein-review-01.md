# Bruchstein – visuelles Review, erster Schwung

Basis: Quellgewölbe GB Dungeon Patch, 23.10.2026.

## Änderungen

- Die Grundrissumrandung berücksichtigt diagonale Ecken; jede Wandzelle erhält eine vollständige Holzfläche. Außenkanten, eingesprungene Ecken und Trennwandanschlüsse sind geschlossen. Das gilt zentral für alle eingerichteten Dorfhäuser.
- Der runde Baum wird wie der spitze Baum einmalig aus dem Originalatlas freigestellt. Mit dem Außenrand verbundene helle Hintergrundpixel sind transparent; eingeschlossene Glanzpixel bleiben erhalten.
- Im Nordwesten entfällt der überlagernde hintere Baum. Der Vogelbaum samt Vogel steht eine Reihe höher. Die Wiese füllt die freie Fläche und bildet vor Baumfüßen geschlossene Ränder. Der Blumenstreifen reicht bis an die Felswand.
- Pflanzenränder schließen auch vor verdeckenden Baumfüßen ab. Ein Feld breite Strauchstreifen behalten ihre abgerundeten Enden.
- Marktlager: drei Regalreihen mit Gängen, zehn zusätzliche Regalmodule, fünf zusätzliche Fässer; die beiden Reisekisten stehen rechts. Die untere linke Nutzfläche wird für die dritte Regalreihe erweitert. Alle Möbel und Bodenfelder bleiben erreichbar.
- Die drei Prüfmöbel der Vorratsquest behalten Kennungen und Positionen. Die zwei Fässer heißen Lieferfass; die Hinweise unterscheiden diese von den zusätzlichen Vorratsfässern ohne Nummerierung.
- Im Wirtshaus bleiben sämtliche Stühle benutzbar. Nur die drei Barhocker starten den Bedienweg und die Getränkeauswahl. An Gästetischen erscheint kein Bedienhinweis.

## Einspielen

Die Verzeichnisse scripts/, tests/ und docs/ dieses Patches über den bestehenden Projektstand kopieren. Keine Spieldaten löschen. Vorhandene Spielstände bleiben erhalten; die bestehende sichere Ladeposition versetzt die Spielfigur gegebenenfalls von neu eingerichteten Möbelplätzen.

## Prüfung

182 automatisierte Tests erfolgreich; npm run check erfolgreich. Die Sitzplatzprüfung deckt Thekenbedienung und unbediente Tischplätze ab. Die Grundrissprüfung erfasst zusätzlich diagonale Wandanschlüsse. Möbelüberschneidungen, Erreichbarkeit sämtlicher Möbel und freier Bodenfelder, Questprüfungen und Haustür-Rückwege wurden geprüft. Aktuelles Dorf und alle neun eingerichteten Hausräume wurden mit den produktiven Assets gerendert und visuell kontrolliert. Kein vollständiger manueller WebGL-/Mobile-Durchlauf.
