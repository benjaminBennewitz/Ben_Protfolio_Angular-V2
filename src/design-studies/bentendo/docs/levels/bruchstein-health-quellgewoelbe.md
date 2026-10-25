# Bruchstein: Profil, Leben und erstes Quellgewölbe

## Installation

Nach den bisherigen Patches einschließlich Maras Quellplan und Heldinnen-Modulcover im Projektverzeichnis entpacken. Nur geänderte und neue Dateien sind enthalten. Der bestehende Browser-Spielstand wird weiterverwendet; ältere Stände ohne Lebenswerte beginnen mit vollen Herzen.

## Spielen

- B öffnet den Rucksack und pausiert den Kampf. Herzen sind im Beutel und im neuen Profil sichtbar. Drei Herzen entsprechen sechs Lebenspunkten.
- Profil unten rechts mit A öffnen, oder von der obersten Gegenstandsreihe nach oben und dann rechts wechseln. Links bzw. B führt zum Beutel zurück. Porträt, Leben, tatsächlicher Angriff/Schutz, Waffe, Münzen und Niederlagen sind sichtbar.
- Das westliche Bett im Obergeschoss der Schenke „Zum schiefen Kessel“ ist jetzt dein eigenes Bett. Mit A kostenlos schlafen und vollständig heilen. Während der kurzen Bettruhe liegt der Kopf auf dem Kissen; danach stehst du am Bettende.
- Nach dem Bericht über die Spuren am Fluttor erklärt Mara die Wartungsfolge: Zulauf links oben schließen, Ablauf links unten öffnen, Handwinde rechts lösen. Im abgelassenen Becken erscheint eine erreichbare Treppe.
- Das Quellgewölbe besteht aus sicherem Einstieg, Galerie mit Käfern/Schlange, Gegengewichtskammer, Wachposten und Spinnennest. Die Kiste muss auf die helle Druckplatte; bei Bedarf hilft der Rückstellhebel.
- A greift in Blickrichtung an. Angriffe haben eine kurze Abklingzeit. Gegner kündigen Bisse mit einem Ausrufezeichen an; ein Schritt weg reicht zum Ausweichen. Verletzte bzw. angreifende Gegner zeigen einen kleinen Lebensbalken. Außerhalb des Dungeons bleibt der Bildschirm ohne Kampf-HUD.
- Der Ast wird automatisch als Waffe verwendet (Angriff 1). Das rostige Schwert wird automatisch bevorzugt (Angriff 2). Beide Geschlechter haben gleiche Werte. Schutz ist anfangs 0; der Rüstungshändler ist noch kein Bestandteil dieses Patches.
- Im Wachposten liegt ein Feldverband. Er heilt vier Lebenspunkte und wird bei voller Gesundheit nicht verbraucht.
- Das Gespinst in der Mitte des letzten Raums startet bewusst drei Spinnenwellen mit 2, 3 und 4 Gegnern. Während des Kampfes ist der Rückweg gesperrt. Danach werden Schwerttruhe und Wartungstreppe frei. Die Truhe enthält das rostige Schwert, acht Münzen und eine Nachricht für Mara.

## Niederlage und Rückholung

Nur Gegenstände und zusätzliche Münzen seit dem Eintritt in dieses Dungeon werden verloren. Mitgebrachte Ausrüstung, bereits gesicherte Funde, Notizen und Questfortschritt bleiben erhalten. Verbrauchte Gegenstände werden nicht wiederhergestellt.

Du wachst im eigenen Wirtshausbett mit vollen Herzen auf. Neue Beute liegt als sichtbarer Beutel am Todesort. Er ist begehbar, damit er keine Engstelle blockiert, und kann mit A vom Nachbarfeld oder direkt darauf eingesammelt werden. Für eine vollständige Rückholung müssen genug Rucksackfächer frei sein; andernfalls bleibt der Beutel unangetastet.

Eine weitere Niederlage vor der Rückholung entfernt den alten Beutel. Neue Beute dieses zweiten Versuchs kann einen neuen Beutel erzeugen. Nach erfolgreicher Rückholung ist die Beute wieder Teil des laufenden Versuchs. Erst das lebende Verlassen des Gewölbes in die sichere Staukammer sichert sie.

Leben, Niederlagen, Ausgangsbeute und verlorener Beutel werden im bisherigen Spielstand gespeichert. Auch eine laufende Welle samt verletzten Gegnern bleibt beim Neuladen erhalten. Gewöhnliche Gegner erscheinen beim erneuten Betreten eines Raums wieder; geplünderte Truhen und der besiegte Wellenraum bleiben erledigt.

## Direkt testen

Im Debugmenü „Quellgewölbe“ bzw. „Spinnenbrut“ wählen. Diese Durchläufe erhalten einen Ast und werden wie bisher nicht gespeichert. Für persistente Spielstände über Mara und die Staukammer einsteigen.

## GBFX

Die gelieferten Dateien wurden lokal gelesen: GBFX.sav hat 32.768 Bytes und den Header „FX HAMMER Version 1.1“. GBFX.txt beschreibt 48 Effekte für Duty/Noise und nennt Tronimal sowie CC-BY 4.0. Die Soundbank wurde in diesem Patch noch nicht in Browseraudio umgewandelt oder eingebunden. Kampf und Erfolge verwenden die vorhandene gemeinsame SFX-Steuerung.

## Prüfung

Automatisierte Funktionstests decken Gesundheit, Menüschutz, Profil, alte/neue Speicherstände, Bett, Rückholung, zweite Niederlage, Platzmangel, Wartungsfolge, Kämpfe, Druckplatte, Raumverbindungen, drei Wellen und die Schwertbelohnung ab. Rucksack, Profil, Bett und Dungeon wurden mit den Produktionsassets auf dem 160×144-LCD gerendert und visuell geprüft. Kein vollständiger manueller Browser-/Touch-Spieltest.
