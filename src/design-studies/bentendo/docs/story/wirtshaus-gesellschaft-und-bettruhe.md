# Wirtshausgesellschaft und wählbare Bettruhe

Stand: 25. Oktober 2026. Ergänzung zu `tagesablauf-und-nachtruhe.md`.

## Sitzende Gäste

Fünf bekannte Gäste nehmen abends echte vorhandene Sitzplätze ein:

| Person | Platz | Ausrichtung |
| --- | --- | --- |
| Hausmeister | chair-a, Gästetisch | Zum Tisch nach oben |
| Leserin | chair-b, Gästetisch | Zum Tisch nach unten |
| Handwerker | bar-stool-a | Zur Theke |
| Anglerin | bar-stool-c | Zur Theke |
| Weberin | chair-c, Würfeltisch | Zum Tisch nach oben |

Der mittlere Barhocker `bar-stool-b` und der Tischplatz `chair-d` bleiben für den Spieler frei. Die weiteren Gäste behalten ihre bestehenden Gesprächsplätze. Nachts sitzen die beiden späten Gäste Hausmeister und Leserin weiterhin am Tisch. Am Morgen werden alle Gastreservierungen entfernt.

Eine sitzende Person und ihr Stuhl bilden eine tatsächliche Belegung: Der Stuhl bleibt sichtbar, ist aber nicht mehr als freier Sitzplatz aktivierbar. Beim Ansprechen wird die Person erreicht. Der Spieler kann nicht durch sie hindurchlaufen oder denselben Stuhl zusätzlich besetzen. Falls der Spieler bereits auf einem zugewiesenen Platz sitzt, behält er ihn; der Gast bleibt stattdessen an seinem freien Standplatz. Auch der zum Aufstehen benötigte Ausstieg bleibt frei.

Die Vergabe wird pro Besuch, Tagesphase und anwesender Gästegruppe stabil gehalten. Ein Tagesphasenwechsel während desselben Raumbesuchs funktioniert ebenfalls. Körper und Füße werden in die vorhandene Sitzgrafik eingebunden; die bestehenden Charaktergrafiken bleiben erhalten. Es werden keine neuen Figuren oder Möbel benötigt. Der Wirt behält seine Bedienwege, alle Gäste bleiben ansprechbar, Treppe und Ausgang bleiben erreichbar.

## Gespräche zwischen den Gästen

Gelegentlich wechseln nahe Gesprächspartner kurze Zeilen:

- Hausmeister und Leserin: Aushänge, widerspenstige Türen und das letzte Kapitel.
- Handwerker und Anglerin: Uferbank, Fang und Wünsche für morgen.
- Weberin und Frau Moos: Nähte, Tee und die Katze auf dem Stoff.
- Mara und Eda: alte Aufzeichnungen und der ruhige Abend.

Die Daten liegen in `scripts/game/data/tavern-company.js`. Der vorhandene Chatter-Takt wählt sowohl diese Wechsel als auch die bisherigen individuellen Alltagssprüche. Eine Variante wird nicht unmittelbar wiederholt. Die Zeilen sind beiläufige Gespräche und vergeben keine Questkenntnisse oder Belohnungen.

Es wird immer nur eine zweizeilige Sprechblase gezeigt. Nach der ersten Zeile und deren Lesedauer folgt eine kurze Pause von 1,2 Sekunden; anschließend antwortet die zweite Person. Die vorhandene langsame Textrolle und Bewegungsreduktion bleiben zuständig. Ist der Antwortende nicht mehr nah oder anwesend, wird die Antwort verworfen. Andere Leerlaufreaktionen verdrängen die wartende Antwort nicht.

Direktes Ansprechen, neue Dialoge, Hinsetzen und Raumwechsel löschen eine begonnene Gesprächsblase und die wartende Antwort. Spieleraktionen haben Vorrang. Die privaten Gespräche blockieren weder Bewegung noch Interaktion. Menüs und echte Dialoge halten den Chatter weiterhin an.

## Wählbare Bettruhe

Das eigene Bett im Obergeschoss öffnet jetzt das vorhandene Systemmenü mit vier Einträgen:

| Auswahl | Nächster Zielzeitpunkt |
| --- | --- |
| Morgen | 07:00 Uhr |
| Abend | 19:00 Uhr |
| Nacht | 21:00 Uhr |
| Zurück | Keine Änderung |

Richtungen wählen, A bestätigt, B bricht ab. Ein bereits verstrichener oder exakt erreichter Zielzeitpunkt liegt am folgenden Tag; das Menü nennt dies ausdrücklich mit `+1 Tag`. Beispiel: Um 19:00 Uhr führt Abend zu 19:00 Uhr am nächsten Tag, Nacht dagegen noch am selben Tag zu 21:00 Uhr. Es gibt keinen Zeitsprung rückwärts.

Öffnen, Navigieren und Abbrechen verbrauchen keine Spielzeit und füllen keine Herzen auf. Erst nach Bestätigung werden Uhr und Heilung atomar auf den gewählten Zustand gesetzt. Danach folgt die vorhandene kurze Bettanimation und eine passende, manuell lesbare Aufwachmeldung. Der logische Aufwachzustand ist bereits während der kurzen Animation konsistent speicherbar; beim Laden wird kein zweiter Zeitsprung ausgeführt.

Sämtliche Quests, Gegenstände, Münzen, Freischaltungen und ein verlorener Dungeonbeutel bleiben erhalten. Die Wiederbelebung nach einer Niederlage erhält weiterhin ihren eigenen bisherigen Ablauf; sie öffnet keine Schlafauswahl. Audio, Bewohnerzeitpläne, Tiere und Nachtruhe folgen nach dem Aufstehen automatisch der gewählten Uhrzeit. Die Schlafauswahl ist über denselben Eingabepfad mit Tastatur und den vorhandenen Gerätetasten nutzbar.

## Speicherung, Credits und Prüfung

Sitzbelegungen, Gesprächswarteschlange und geöffnete Menüs sind vorübergehende Darstellungs- und Bedienzustände. Es gibt keine zusätzliche dauerhafte Gästekopie und kein neues Save-Format. Gespeichert werden weiterhin die vorhandene Spielzeit, Gesundheit und der übrige Fortschritt. Alte Stände bleiben ladbar.

Keine neuen Fremdassets oder Musikdateien. Die bisherigen NPC-, Hausmeister- und Möbelgrafiken bleiben unter den vorhandenen Credits in Verwendung. Sitzanpassung, Gesprächszeilen und Schlafmenü sind projektspezifische Ergänzungen mit Codex-Unterstützung.

228 Tests bestanden. Acht neue Prüfungen decken Sitzbelegung, freie Spielerplätze, bereits sitzende Spieler, Frage-Antwort-Abfolge, Vorrang direkter Gespräche, späte und morgendliche Besetzung sowie Abbruch, Bestätigung, drei Aufwachzeiten, Tageswechsel und Speichern der Bettruhe ab. Die bestehenden Prüfungen zu echten Laufwegen, Wirtbedienung, Gesundheit und Raumgrundrissen wurden an die neuen Abläufe angepasst und bestanden. JavaScript- und Python-Konventionsprüfung bestanden. Der volle Gastraum, beide Gesprächssprecher, späte Gäste, Schlafauswahl und Aufwachen bei Nacht wurden mit dem produktiven Canvas-Renderer geprüft. Kein vollständiger manueller WebGL-/Mobile-Test.
