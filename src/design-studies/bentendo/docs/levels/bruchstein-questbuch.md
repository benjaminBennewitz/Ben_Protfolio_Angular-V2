# Questbuch und bekannte Kartenhinweise

Dieser Patch setzt direkt auf b2boy--231026--2156.zip auf. Dateien im Projektverzeichnis überschreiben und mit Strg+F5 neu laden. Bestehende Spielstände bleiben kompatibel; das Speicherformat und die Raumwechsel-Speicherpunkte bleiben erhalten.

## Bedienung

- Rucksack: drei Reiter Beutel, Profil und Quests. Der zusätzliche Quests-Knopf im bisherigen Werkzeugbereich öffnet die Aufgabenliste direkt; das Profil bleibt über seinen Reiter erreichbar.
- Reiter: aus dem Beutel oben zum Reiterfokus, links/rechts wechseln und mit unten oder A die Liste betreten.
- Questliste: oben/unten wählen, A liest. Die Liste scrollt mit und zeigt maximal vier Aufgaben. Ein Punkt am Quest-Reiter sowie NEU am Eintrag kennzeichnen neue bekannte Erkenntnisse.
- Detailansicht: acht vollständig sichtbare Zeilen pro Seite. Pfeile blättern; A heftet die Aufgabe für die Karte an oder löst sie. B kehrt zur Liste zurück, anschließend zum Beutel.
- Karte: ? kennzeichnet eine belegte Anlaufstelle oder einen ungefähren Suchbereich. ! steht bei bekannten Ansprechpartnern, wenn ein neuer Bericht oder eine Rückgabe möglich ist. Innenräume werden auf ihren Hauseingang im Dorfplan projiziert. Der eigene Standort bleibt darüber sichtbar.
- A auf der Karte blendet die Questmarker aus oder ein. Eine angeheftete offene Aufgabe beschränkt die Marker auf ihre bekannten Orte. Abgeschlossene Aufgaben zeigen keine aktiven Marker.

## Wissen statt Lösungen

Sechs bestehende Geschichten sind eingebunden: Wasserrad/Gildenöffnung, blaue Brosche, Garnspule, Vorratskontrolle, Maras Archivforschung und die Spuren unter dem Wasser. Aufgaben erscheinen nach tatsächlichen Gesprächen, Beobachtungen oder Funden; sie werden aus den vorhandenen Flags, Notizen und Inventarständen abgeleitet. Ein Item kann vor dem Gespräch gefunden werden, ohne dass das Buch automatisch den unbekannten Empfänger verrät.

Das Questbuch dokumentiert bekannte Personen, Orte und Aussagen. Es enthält keine Schrankkoordinaten oder vollständige Rätselabläufe. Ein mehrdeutiger Reisebericht liefert erst dann einen Bereich beim richtigen Haus, wenn eine zweite bekannte Quelle die Zuordnung ermöglicht. Marker zeigen keine versteckten Truhen oder ungesehenen NPC-Positionen.

Zwei questrelevante Bewohnergerüchte werden nur dann im Journal festgehalten, wenn sie tatsächlich in einem Gespräch oder einer nahen Sprechblase ausgewählt wurden. Neue Hinweise machen einen bereits gelesenen Eintrag wieder ungelesen. Lesen, Anheften und Markerwahl werden über die bestehende Speicherung mitgesichert.

Die bisherigen direkten Weg- und Lösungstexte bei Mara, der Garnsuche, Frau Moos, dem Wasserrad sowie den Rückmeldungen der Staukammer wurden durch Beobachtungen und Hinweise ersetzt. Bedienhinweise wie Schieben mit A oder das Öffnen des Rucksacks bleiben erhalten. Alte automatisch erzeugte Questnotizen werden beim Fortsetzen an den belegten Stand angepasst.

Das Gespräch über die Nachricht aus dem Spinnennest schließt das aktuelle Quell-Kapitel jetzt nachvollziehbar ab. Es öffnet den noch nicht entwickelten Ostweg nicht.

## Architektur und Prüfung

Questdaten liegen in data/quest-village.js und data/quest-mara.js. quest-log.js steuert Lesen und Navigation, quest-map.js projiziert bekannte Orte. Der bestehende Rucksack und die vorhandene Ortskarte werden erweitert. Es gibt keine zweite Belohnungs- oder Inventarverwaltung. Neue beständige UI-Werte nutzen die bereits validierten einfachen Questflags; alte Daten benötigen keine neue Formatversion.

169 automatisierte Tests erfolgreich; Code- und Python-Strukturprüfung erfolgreich. Neue Tests prüfen echte Garnsuche/Rückgabe, Wissensgrenzen, Gerüchte, Mehrdeutigkeit, Kartenfilter, A/B-Navigation, Seitengrenzen und Save/Load. Produktionsgrafiken wurden für Liste, Detailseiten, Profil/Beutel sowie sichtbare, angeheftete und ausgeblendete Kartenmarker auf Canvas gerendert und visuell geprüft. Kein interaktiver Browsertest.
