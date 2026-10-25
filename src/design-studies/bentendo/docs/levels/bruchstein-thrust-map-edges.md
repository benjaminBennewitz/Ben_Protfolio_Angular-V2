# Gerader Waffenstoß, lesbare Karte und Dungeonabschlüsse

Dieser Ergänzungspatch setzt BENTENDO_Dungeon_Gestaltung_Kollision_Musik_Patch.zip voraus. Enthaltene Dateien im Projektordner überschreiben, danach mit Strg+F5 neu laden.

## Änderungen

- Ast und Schwert fahren zuerst gerade in Blickrichtung aus. Nach voller Reichweite folgt ein 45-Grad-Schwenk. Seitlich geht der Bogen auf beiden Seiten nach unten; die Angriffsrichtung bleibt bis zum Ende fest. Bei reduzierter Bewegung bleibt die volle gerade Pose stehen.
- Karteninhalt, Ortszeile und Bedienhinweis haben getrennte Bereiche. Die unterste Schriftzeile bleibt innerhalb des LCD-Rands.
- Schmale Mauern erhalten beide sichtbaren Seiten und einen oberen Abschluss. Unvollständige Säulenköpfe und lose Randtile-Fragmente entfallen.
- Laufplatten schließen an Boden und Mauern ab. Die Abflussrinne besitzt geschlossene Enden. Transportkisten verwenden die vollständige Originalgrafik. Bodenrisse verteilen sich ohne durchgehende Wiederholungsreihen.
- Die aktuelle Dungeonmusik bleibt erhalten.

## Prüfung

154 automatisierte Tests erfolgreich; Code- und Python-Strukturprüfungen erfolgreich. Waffenphasen, Karte und alle fünf Dungeonräume mit Produktionsassets per Canvas gerendert. Kein interaktiver Browsertest.
