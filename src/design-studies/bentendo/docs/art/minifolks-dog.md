# Dorfhund aus Minifolks Forest Animals

Das vom Nutzer gelieferte Archiv `MinifolksForestAnimals.7z` ist lesbar und enthält je eine Variante mit und ohne Kontur von Bär, Vogel, Wildschwein, Hase, zwei Hirschen, Fuchs und Wolf. Eine gesonderte Hundegrafik ist darin nicht enthalten. Der kleine Wolf aus `Outline/MiniWolf.png` wird als Ersatzdarstellung des bestehenden Dorfhunds verwendet. Name, Rolle, Tierlaut und Spielverhalten bleiben Hund.

Die Originalgrafik liegt unverändert unter `assets/sprites/animals/minifolks-wolf.png`. Das Sheet besitzt 224 × 256 Pixel und ein 32 × 32-Pixel-Raster. Verwendet werden die vier belegten Standframes in Reihe 0 und sechs Laufbilder in Reihe 1. Die übrigen Tiere und nicht benötigten Animationsreihen werden nicht zusätzlich ins Spiel geladen.

Beim Laden werden die kühlen Fellfarben einmalig in passende Tonstufen für die vorhandene LCD-Palette umgesetzt. Dadurch bleiben dunkle Kontur, Fellschatten und helle Partien unterscheidbar. Die Alpha-Transparenz und Originaldatei bleiben erhalten. Gerendert wird ein 24 × 18 Pixel großer nativer Ausschnitt pro Frame (Offset 4/14), ohne Bildskalierung. Der Fußpunkt sitzt passend zur bisherigen 16-Pixel-Kollision; der Schwanz darf seitlich etwas darüber hinausragen.

Das Original blickt nach rechts und wird nur für Linksbewegung gespiegelt. Bei vertikalen Wegen bleibt wie bisher die letzte horizontale Ausrichtung erhalten. Reduzierte Bewegung verwendet ein festes Bild. Beim Apportieren wird der Ast an der je Frame leicht versetzten Maulposition ergänzt. Die bestehende Pflanzenüberlagerung wird weiterhin auf den Hund angewendet. Apportierwege, Begleitung, Inventar, Dialoge und Questfortschritt werden durch diesen Grafikpatch nicht verändert.

85 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Canvas-Sichtprüfung von Standbild, Wurf und getragenem Ast durchgeführt. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Rucksack_Hundebegleitung_Dorfaufgaben_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Enthalten ist nur die benötigte Original-Wolfgrafik sowie neuer/geänderter Code und Dokumentation, nicht das vollständige Tierpaket. Keine Löschungen.
