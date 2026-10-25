# Charakterwahl und zuverlässige Vorratskontrolle

## Installation

Folgepatch auf `BENTENDO_Schenke_Getraenke_Hund_Engstellen_Patch.zip`. Neue und geänderte Dateien in das Projekt entpacken und ersetzen. Zusätzliche Assetkäufe sind nicht nötig.

## Einfacher Start

Nach dem Titel erscheint eine Auswahl mit zwei großen Porträts, „Weiblich“ und „Männlich“. Pfeile wählen, A bestätigt, B führt zum Titel zurück. Beide Presets besitzen identische Fähigkeiten und beginnen mit demselben Aushang. Keine Namen-, Statistik- oder Fähigkeitenformulare.

Die weibliche Figur wurde im Haar-Folgepatch auf eine entspannte Armhaltung und lange Haare umgestellt; die männliche blieb unverändert. Die kleinen Vorschaufiguren sind dieselben nativen 16-Pixel-Figuren, die danach tatsächlich im Dorf, in Häusern und in den bisherigen Rätselräumen erscheinen. Richtungs- und Schrittframes, dunkle Außenkontur und Pflanzenüberlagerung bleiben erhalten. Der Dialogersatz für die eigene Figur verwendet das jeweilige große Porträt. Das Explorer-PNG wird nicht mehr geladen oder gezeichnet. Ein normaler Ortswechsel erhält die Wahl; Neustart und Debug starten wie bisher einen frischen Durchlauf.

Die Auswahl pausiert Welt, Bewegung und Questfortschritt. Native Bedienelemente, Tastatur, Steuerkreuz und Touch verwenden denselben Auswahlzustand. Die zugängliche Statusmeldung nennt Preset, Bedienung und Gleichwertigkeit. Die Titelmusik bleibt während der Auswahl aktiv.

## Vorratskontrolle

Eine reproduzierbare Lücke der bisherigen Version: Vor dem Gespräch mit der Lagerwartin ausgeführte Untersuchungen wurden vollständig verworfen. Außerdem gab es beim Untersuchen nur den allgemeinen Möbeltext, ohne sichtbare Bestätigung des Questfortschritts. Die fehlende Rückmeldung konnte daher auch während des Auftrags den Eindruck vermitteln, dass nichts gezählt wurde. Ein allgemeiner Zählfehler nach bereits erfolgter Auftragsannahme ließ sich in den automatisierten Rundgängen nicht reproduzieren.

Die drei relevanten Vorräte werden jetzt unabhängig von der Auftragsannahme gespeichert. Gemeint sind die beiden vorderen Lieferfässer rechts und der Vorratsschrank an der linken Wand. Jede Prüfung setzt das bekannte Häkchen und bestätigt sie im Text; während des Auftrags steht der aktuelle Fortschritt am Anfang des Dialogs. Frühere Untersuchungen zählen beim ersten Gespräch mit. Wiederholtes Untersuchen, bereits durchsuchte andere Fundstellen und Hauswechsel setzen nichts zurück und erzeugen keine doppelte Belohnung. Nach drei Prüfungen erfolgt der Abschlussbericht bei der Lagerwartin, mit einmalig fünf Münzen.

Es gibt keine Nummern und keine Markierung ungeprüfter Questmöbel. Häkchen bleiben nach dem Abschluss erhalten. Das Journal benennt die offenen Vorräte weiterhin in Worten.

## Prüfung

94 Node-Tests sowie JS-/CSS- und Python-Prüfung bestanden. Die zusätzlichen Tests decken den gesamten Start, beide Presets über die gemeinsame Eingabe, Rückkehr zum Titel, blockierte Weltaktionen während der Auswahl, Erhaltung bei Ortswechseln, einen kompletten frühen Rundgang durch sämtliche Lagerfässer/-regale und wiederholte aktive Prüfungen samt einmaliger Bezahlung ab. Die bisherigen Prüfungen zu Hund, Schenke, Inventar und Dorfquests bestehen weiterhin.

Beide Auswahlzustände, weibliche/männliche Figur im Dorf und Häkchen nach Vorratsprüfung wurden mit Canvas gerendert und visuell geprüft. Der echte Produktionsloader und Display-Router für Titel, Auswahl und Welt wurden ebenfalls ausgeführt. Kein vollständiger Browser-/WebGL- oder Hörtest durchgeführt.
