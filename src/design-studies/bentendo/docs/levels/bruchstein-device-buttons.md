# Untere Geräteansicht, START und SELECT

## Installation

Folgepatch auf `BENTENDO_Spielstand_Karte_Rucksack_Cursor_Patch.zip`. Ausschließlich geänderte und neue Dateien in das bestehende Projekt entpacken und ersetzen. Das 3D-Modell benötigt keinen neuen Export.

## Geräteansicht

Die Maus im frontalen Ausschnitt zum unteren Rand bewegen: Die Kamera fährt zu den unteren Bedienelementen. Die neue Ansicht neigt das Gerät leicht und erweitert den Ausschnitt, damit LCD, Steuerkreuz, A/B und START/SELECT gemeinsam sichtbar sind. Im Bereich der Tasten bleibt die Ansicht stabil. Die Maus zurück zum Displayrahmen führt wieder zur frontalen LCD-Ansicht.

Touch: Aus der Front nach oben wischen, um die untere Ansicht zu erreichen; aus der unteren Ansicht führt eine vertikale Wischgeste wieder zur Front. Zusätzlich gibt es in der Bedienhilfe „Unten · Tasten“. Alle bisherigen Geräteansichten und Cartridge-Funktionen bleiben vorhanden.

Klicks auf A/B, START, SELECT und Steuerkreuz werden in Front- und unterer Ansicht an dieselben Spielaktionen weitergeleitet. Geometrie, Buttons und Beschriftungen des Modells bleiben unverändert.

## Belegung

| Funktion | Gerät/Bedienfeld | Tastatur |
| --- | --- | --- |
| Untersuchen/bestätigen | A | A oder Leertaste |
| Rucksack/zurück | B | B |
| Starten/fortsetzen oder Pause | START | Enter oder P |
| Speicherdialog | SELECT | S |
| Notizbuch | Notizen | J |

START bestätigt auf Titel und Charakterauswahl wie bisher. Im laufenden Spiel öffnet START eine Pause. Spielzeit, Spielerbewegung, Bewohner, Tiere, Begleitzeit und Ortsmeldungen bleiben eingefroren. START, A oder B schließen die Pause. Ein zuvor geöffnetes Gespräch, Rucksack oder Karte bleiben erhalten. Das Pausenfenster ist die einzige sichtbare Meldung. Die Hintergrundmusik läuft weiter.

SELECT öffnet „Speichern / Zurück“. Pfeile wählen, A bestätigt, B bricht ab. Die Bestätigung zeigt „Gespeichert.“ oder eine verständliche Fehlermeldung. Das Schließen dieser Rückmeldung speichert nicht nochmals. Wurde der Dialog aus einer Pause geöffnet, kehrt er dorthin zurück. Debugdurchläufe werden ausdrücklich nicht gespeichert. Das automatische Speichern bleibt zusätzlich aktiv und wird durch den Dialog nicht ersetzt.

Ein angehaltener Schritt erzeugt keine dauernde Animationsschleife. Gerätebewegung und Kameraanimation bleiben während der Spielpause bedienbar. Das Gerätemenü selbst wird nicht in den Spielstand geschrieben.

## Prüfung

110 Node-Tests sowie JS-/CSS- und Python-Prüfung bestanden. Neue Tests prüfen eingefrorene Bewegung und Zeit, erhaltene Dialogseiten, explizites Speichern, Abbrechen, einmalige Bestätigung, Fehlerfälle, Debugschutz, Rückkehr zur Pause und gemeinsame Eingaberouten für START/SELECT. Die bisherigen Speicher-, Dorf-, Tier-, Inventar- und Rätseltests bestehen weiterhin.

Pause, Speicherbestätigung und Erfolg wurden mit Canvas gerendert und visuell geprüft. Die Positionen des echten GLB-Modells wurden mit der unteren Kameraeinstellung projiziert: LCD und alle vier Aktionstasten liegen im Ausschnitt. Ein vollständiger Browser-/WebGL-, realer Raycast-/Touch- und Hörtest wurde nicht durchgeführt.
