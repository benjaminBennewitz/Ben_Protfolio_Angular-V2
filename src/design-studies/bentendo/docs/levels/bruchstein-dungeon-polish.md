# Quellgewölbe: Gestaltung, Profil, Waffenbogen und Kollision

## Installation

Nach BENTENDO_Startfix_Kampfsounds_Herzdrops_Patch.zip im Projektverzeichnis entpacken und vorhandene Dateien ersetzen. Anschließend einmal Strg+F5. Nur geänderte und neue Dateien sind enthalten.

## Profil

Das Profil hat ein kleineres Porträt und kompaktere Abstände. Werte, Ausrüstung und Rücknavigation passen vollständig in die kürzere Karte, ohne Scrollbar und ohne den unteren Rand zu überschreiten.

## Waffen

Ast und Schwert sitzen am Griffpunkt der Spielfigur und schwenken über einen 45-Grad-Bogen. Die mittlere Pose ist deutlich diagonal. Die gewählte Angriffsrichtung bleibt bis zum Ende dieses Schwungs erhalten, auch wenn man bereits die nächste Bewegungsrichtung drückt. Bei reduzierter Bewegung wird eine feste diagonale Pose verwendet.

## Räume und Treppen

Alle fünf Dungeonräume haben Gegner und unterschiedliche Einrichtungen:

- Vorhalle: Laufplatten, alte Säulen, Vorratsurnen, Transportkiste und Mauerreste.
- Feuchte Galerie: Abflussrinne mit begehbarer Gitterabdeckung, Mauerpfeiler, Feuchtspuren, Fässer und Schutt.
- Gegengewichtskammer: Kettenführung, Kettenlager, Arbeitsplatten und das vorhandene Kisten-/Druckplattenrätsel.
- Wachposten: verlassene Werkbank, Werkzeuge, Wandhalterungen, alte Lagerdecken und Vorräte.
- Spinnenbrut: großflächige Wandgespinste, Bodennetze und Kokons. Zwei Nestwachen müssen vor dem bewussten Start der drei Wellen besiegt werden. Der abgeschlossene Wellenraum bleibt danach erledigt.

Horizontal verbundene Räume erhalten gemauerte dunkle Durchgänge. Aufgänge zeigen helle aufsteigende Stufen mit Aufwärtspfeil. Der Abgang im Becken der Staukammer ist ein dunkler Treppenschacht mit Abwärtspfeil. Einrichtung und Gegner besitzen echte Kollision; niedrige Bodenreste und Lagerdecken bleiben passierbar.

## Kontakt und Bewegung

Gegner berücksichtigen jetzt sowohl das aktuelle Feld der Spielfigur als auch das reservierte Zielfeld eines noch laufenden Schritts. Ihr eigenes Ausgangs- und Zielfeld bleiben ebenfalls bis zum Ende der Bewegung reserviert. So können sich die Bewegungen nicht mehr überkreuzen.

Wer direkt gegen einen Gegner läuft, bleibt stehen und erhält sofort einen Lebenspunkt Schaden, also ein halbes Herz. Die bestehende Trefferpause verhindert mehrfachen Schaden pro Frame. Die angekündigten Bisse bleiben zusätzlich erhalten. Auch Rollkisten können nicht in Gegner geschoben werden.

## Musik

Das Quellgewölbe verwendet einen neu komponierten Loop mit 16 Takten bei 84 BPM, rund 46 Sekunden lang: leiser Dreiecksbass, zurückhaltende Tropfenarpeggien und sparsame Puls-Melodien ohne Pitchrutschen. Die Staukammer spielt weiterhin Maras Quellplan. Lautstärke und Stummschaltung verwenden die bisherigen BGM-Einstellungen.

Die MP3 ist fertig enthalten. Der optionale Python-/NumPy-Generator liegt unter scripts/audio/tools/build_quell_music.py; er ist zum Spielen nicht erforderlich. Die PCM-Loopkante wurde numerisch geprüft, die MP3 vollständig dekodiert.

## Speicherstände und Prüfung

Alte Fortschritte bleiben erhalten. Vorher gegnerfreie Räume erhalten beim Laden alter Stände die neuen Wachen. Ein laufender Spinnenkampf wird erhalten. Wenn neue Einrichtung genau am Standort alter Gegner oder verlorener Beute steht, werden diese ohne Verlust von Lebenswerten oder Gegenständen zum nächsten freien Feld versetzt.

154 automatisierte Tests bestanden. Dazu zählen Kollisionsreservierung, Kontakt, Waffenwinkel, Nestwachen, bestehende Rätsel, Raumverbindungen und Speicherstandmigration. JS-/Python-Konventionen geprüft. Profil, alle Dungeonräume und Treppen wurden mit Produktionsassets gerendert und visuell geprüft. Kein vollständiger manueller Browser-/Touch- oder Hörtest.
