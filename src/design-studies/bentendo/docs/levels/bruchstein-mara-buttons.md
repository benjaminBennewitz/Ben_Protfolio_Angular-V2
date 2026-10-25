# Mara: Der fehlende Gang und fühlbare Gerätetasten

Folgepatch auf `BENTENDO_Untere_Ansicht_START_Pause_SELECT_Speichern_Patch.zip`. Im vorhandenen Projektordner entpacken und enthaltene Dateien ersetzen. Nur neue und geänderte Dateien, keine Löschungen, keine zusätzlichen Assets.

## Gerätetasten

A, B, START und SELECT sinken kurz ins Gehäuse. Das Steuerkreuz wird leicht eingedrückt und neigt sich in die gewählte Richtung. Modellklicks zeigen den Druck bereits beim Festhalten; die Spielaktion erfolgt wie bisher beim bestätigten Loslassen. Tastatur und zusätzliche Bedienknöpfe benutzen dieselbe Animation. Loslassen, Fokusverlust und abgebrochene Gesten lösen gehaltene Tasten. Ausgangstransformationen bleiben erhalten; reduzierte Bewegung verzichtet auf das Federn.

Minifix `BENTENDO_Tasten_Ausgeschaltet_Patch.zip`, auf diesen Mara-Patch aufspielen: Die mechanische Rückmeldung funktioniert jetzt auch ausgeschaltet, während des Starts und bei Kontaktfehlern. Spielzustand, Pause, Speichermenü und Spielaudio reagieren weiterhin erst nach erfolgreichem Einschalten. Geprüft mit 114 erfolgreichen Tests und den vorhandenen Codeprüfungen.

## Spielbarer Ablauf

1. Nach Öffnung der Gilde Mara im Obergeschoss ansprechen. Sie läuft zwischen Schreibzimmer und Archiv umher und besitzt eigene Sprechblasen.
2. Ihre feuchte Feldnotiz östlich des Flusses südlich der Brücke und die Randnotiz in der rechten Vase des Gildenoberstocks lesen. Früher gefundene Hinweise zählen ebenfalls.
3. Bei Mara die Hinweise zusammenführen. Danach öffnet sich der rechte Archivzugang im Erdgeschoss.
4. Im unteren Archiv Rollregale mit A verschieben und den alten Quellplan finden. Der Hebel am Eingang setzt das Regalrätsel zurück. Der Plan bleibt als Notiz im Journal und benötigt keinen Inventarplatz.
5. Mara zahlt einmalig sechs Münzen. Für die Nordfreigabe müssen Wasserrad, Vorratskontrolle und Garnspule erledigt sein. Fehlende Aufgaben benennt sie; die Brosche bleibt optional.
6. Den nun offenen Höhleneingang nördlich der Gilde betreten. Im Quellstollen das alte Fluttor mit drei Kerben untersuchen. Die neue Kreidemarkierung wird im Journal festgehalten.
7. Mara berichten: einmalig vier weitere Münzen und Abschluss dieses Kapitels. Der Hinweis auf den Ostpass führt die Geschichte weiter; der Ostpass selbst bleibt noch gesperrt.

Der Journalauftrag nennt jeweils den nächsten Schritt. Höhle und Archiv bleiben erneut zugänglich. Der Wartungsgang im hinteren Archiv führt nach Freigabe ebenfalls zur Höhle; beide Räume besitzen sichere Rückwege. Das ursprüngliche Debug-Archiv bleibt eigenständig erhalten.

## Speichern und Prüfung

Bestehende Spielstände bleiben verwendbar. Neue Questflags, gefundene Notizen und verschobene Archivregale nutzen das vorhandene Speicherformat. Auch mit vollem Rucksack ist der Kapitelabschluss möglich.

Geprüft: 113 automatisierte Tests erfolgreich; JavaScript/CSS- und Python-Prüfung erfolgreich. Enthalten sind ein vollständig durchgespielter Questablauf, früh gelesene Hinweise, gesperrte Zugänge, volles Inventar, Speichern/Laden im Archiv und einmalige Belohnungen. Die Tastenprüfung kontrolliert Drucktiefe, Neigungsrichtung, Rückkehr und wiederholte Betätigung ohne Drift. Produktionsassets und neue Räume wurden zusätzlich mit Canvas gerendert und visuell geprüft. Ein echter WebGL-/Touch-Durchlauf im Browser wurde in dieser Umgebung nicht ausgeführt.
