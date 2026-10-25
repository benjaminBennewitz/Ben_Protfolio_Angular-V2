# Spielstände, Rucksackklänge und Dorfplan

## Installation und Bedienung

Folgepatch auf `BENTENDO_Spielfigur_Lange_Haare_Patch.zip`. Neue und geänderte Dateien ins bestehende Projekt entpacken und ersetzen.

Der Fortschritt wird automatisch lokal im selben Browser gespeichert. Bei einem gültigen Spielstand zeigt der Titel „Fortsetzen“ und „Neues Spiel“. Pfeile wählen, A/START bestätigt. Ein neues Spiel führt zur Charakterauswahl; erst nach deren Bestätigung ersetzt der neue Durchlauf den vorherigen Stand. Zurück zum Titel während der Auswahl erhält den bisherigen Stand.

Automatische Sicherung erfolgt im Sekundentakt und zusätzlich vor dem Ausschalten, beim Hintergrundwechsel und beim Verlassen der Seite. Identische Daten werden nicht erneut geschrieben. Wie bei lokalem Browserspeicher üblich wird der Stand nicht auf andere Browser oder Geräte übertragen und kann beim Löschen der Websitedaten verloren gehen. Den Speicherstatus zeigt die Bedienhilfe.

## Inhalt und Konsistenz

Gespeichert werden die gewählte Figur, Ort, sichere Spielerposition/Blickrichtung, Münzen, Rucksack, Journal, Questflags, Fundlisten und verschobene Rätselmöbel. Der Hausmeister setzt eine noch laufende Gildenöffnung fort. Fundlisten werden beim Laden wieder als Sets aufgebaut; bereits vergebene Belohnungen und entnommene Gegenstände werden dadurch nicht erneut vergeben.

Dialoge, Menüs, Tierbewegungen, Apportieranimationen, Sprechblasen und Schenkenbedienung werden nicht fortgesetzt. Der Ast bleibt im Inventar. Beim Speichern im Sitzen dient das freie Feld vor dem Stuhl als Einstieg. Ist inzwischen ein Bewohner am alten Speicherort, wird auf das nächste freie Feld gesetzt. Laufende Spieler- und Möbelbewegungen werden über ihre bereits reservierten logischen Ziele gesichert.

Das Format ist versioniert (`bentendo-dungeon-wanted-save-v1`). Vor jeder Übernahme werden Version, bekannte Räume/Objekte, Werttypen, Textgrößen, Inventargrenzen, Möbelpositionen und Bodenfelder geprüft. Fehlerhafte Daten verändern kein laufendes Spiel. Ein Lese- oder Schreibfehler stoppt das Spiel nicht und wird in der Bedienhilfe gemeldet. Scheitert ein Schreibzugriff, bleibt der vorherige Wert erhalten. Debugdurchläufe überschreiben den regulären Stand nicht; beim Öffnen eines Debugraums wird zuvor der reguläre Durchlauf gesichert.

## Tastatur und Rucksack

Bei Spieltasten verschwindet der Mauszeiger. Mausbewegung, Mausklick oder Fokusverlust machen ihn wieder sichtbar. Formulare, native Enter-/Leertastenaktionen, Modifikatorkombinationen und Tab bleiben unberührt. Tastaturfokus wird nicht verändert. Die gespeicherte Mausposition der Geräteansicht wird beim Wechsel zur Tastatur verworfen, damit keine alte Randposition die Ansicht weitersteuert.

Der Rucksack spielt beim tatsächlichen Wechsel von Fach oder Gegenstandsaktion einen Bleep. Beim Öffnen des Aktionsmenüs oder der Karte ertönt der kurze Bestätigungsklang. Unbewegliche Ränder und Richtungen während eines Dialogs bleiben still. Klänge nutzen den bestehenden Audioausgang mit unverändertem Lautstärke- und Mute-Verhalten.

## Karte

Die Karte erhält einen hellen Papiergrund, einen dezenten abgestuften Rand, kleine Dach-/Türsymbole statt voller schwarzer Hauskästen, Baumkronen, sparsame Vegetationspunkte und Wasserreflexe. Brunnen, Nord-/Ostsperren, Nordmarkierung und der eigene Standort bleiben erkennbar. In Dorfhäusern wird der Ort mit dem jeweiligen Hauseingang als Standort gezeigt; die Fußzeile nennt das Gebäude. B führt wie bisher zurück zum Rucksack. Die Karte bleibt während der Anzeige pausiert.

## Prüfung

105 Node-Tests sowie JS-/CSS- und Python-Prüfung bestanden. Zusätzliche Tests prüfen einen echten Fund mit Broschenrückgabe über eine neue Spielinstanz hinweg, einmalige Belohnungen, Charakter/Journal, laufende Gildenöffnung, sichere Einstiege nach Sitzen und neben Bewohnern, verschobene Archivregale, ungültige Speicherstände, Speicherausfälle, Debugschutz, abgebrochene Neuwahl, Schreibdrosselung, Rucksackklänge und den Wechsel zwischen Tastatur- und Mauszeiger. Ein zusätzlicher Wiederherstellungstest prüft das erneute Schreiben nach einer beschädigten Speicherdatei.

Papierplan draußen und in der Schenke sowie der Titel mit Fortsetzen wurden mit Canvas gerendert und visuell geprüft. Der Produktionsloader und Display-Router laufen weiter. Ein vollständiger Browser-/WebGL-, realer Reload- und Hörtest wurde nicht durchgeführt.
