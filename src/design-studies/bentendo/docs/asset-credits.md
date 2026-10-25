# Schenkenbesuch und freie Engstellen

## Installation

Folgepatch auf `BENTENDO_Minifolks_Hund_Animation_Patch.zip`. ZIP im Projektverzeichnis entpacken und vorhandene Dateien ersetzen. Enthält ausschließlich neue oder geänderte Projektdateien; keine zusätzlichen Grafikdownloads erforderlich.

## Hund und Marktlager

Der Begleithund weicht beim Hineinlaufen auf ein freies Nachbarfeld aus. Ist er zwischen Spieler und Sackgasse eingeschlossen, wechseln beide mit sichtbarer Bewegung die Plätze. Dies gilt auch während seiner Rückkehr nach Ablauf der Begleitzeit. Felsen, Wasser und die Höhlensperre bleiben Hindernisse.

Der Lagerauftrag betrifft zwei Fässer und einen Schrank: Gemeint sind die beiden vorderen Lieferfässer rechts und der Vorratsschrank an der linken Wand. Der Charakter-Folgepatch entfernt die ursprünglichen Nummern. Nur tatsächlich geprüfte Möbel erhalten ein Häkchen; frühere Prüfungen vor Auftragsannahme werden ebenfalls gespeichert. Belohnung und Abschlussbericht bleiben unverändert.

## Schenke

Alle drei Barhocker und vier Stühle sind mit A benutzbar. Der Wirt geht über freie Felder zu einem passenden Platz hinter der Theke. Erst nach seiner Ankunft erscheint die Getränkeauswahl. Pfeile wählen, A bestellt, B steht auf. Auch eine Richtungstaste lässt den Spieler zunächst aufstehen. Der ursprüngliche Ausstieg bleibt für Bewohner frei.

Wasser ist kostenlos, Apfelsaft kostet eine Gildenmünze, Kräutertee zwei. Bestellungen werden direkt serviert und ausgetrunken, ohne Rucksackplatz zu belegen. Es gibt bisher keine Heilwirkung. Fehlende Münzen führen nur zu einem Hinweis; Dialogfolgetasten buchen nicht erneut ab. Nach einem Getränk kann A erneut die Karte öffnen. Beim Aufstehen kehrt der Wirt sichtbar zu seinem Rundweg zurück. Ein Hauswechsel beendet die Bedienung sauber.

## Prüfung

89 Node-Tests, JS-/CSS-Strukturprüfung und Python-Prüfung bestanden. Neue Tests prüfen echte Bedienwege für alle Sitzplätze, Rückkehr des Wirts, Journal und Raumwechsel, kostenlose und bezahlte Getränke, fehlende Münzen und einmalige Abrechnung, beide Richtungen des Höhlenwegs sowie die drei Prüfmarken im Marktlager. Canvas-Szenen für Sitzen, Bestellkarte, Servieren und beide Lagerzonen gerendert und visuell geprüft. Kein vollständiger Browser-/WebGL-Test durchgeführt.

## Charakterpresets

Die Auswahlporträts unter `assets/characters/adventurer-portraits.png` wurden für dieses Projekt mit der integrierten Bildgenerierung erstellt. Sie werden beim Laden auf ein gemeinsames Raster von 128 × 64 Pixeln und die vier LCD-Farben umgesetzt. Die beiden bewegten Spielfiguren verwenden das bereits integrierte Awakening-Spriteblatt von Sodacoma, mit verstärkter Kontur. Das frühere `assets/sprites/explorer.png` wird nicht mehr geladen oder gezeichnet. Quellen, Ausschnitte und Bildprompt: [art/adventurer-presets.md](art/adventurer-presets.md).
