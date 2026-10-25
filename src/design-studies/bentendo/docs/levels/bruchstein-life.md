# Bruchstein: Bewohner und Tiere

## Änderungen

Der falsche Tile-Ausschnitt auf dem Dach der Schenke wurde entfernt. Wirtin, Anglerin, Weberin, Handwerker und Leserin verwenden unterschiedliche native 12 × 16 Pixel große Figuren aus dem bereitgestellten 5yvalia-Sample-Sheet. Ihre Dialogporträts greifen auf dieselben Ausschnitte zurück; Spielfigur und Hausmeister bleiben erhalten.

Die beiden Hühner sind entfernt, einschließlich ihrer Zeichenfunktion. Eichhörnchen, Igel und Maus verwenden die beiden Originalframes aus dem gelieferten GamebowGames-Paket. Die Hintergrundfarbe der GB-Studio-Sprites wird beim Laden transparent gesetzt; die Originaldateien bleiben unverändert. Es werden nur tatsächlich verwendete Dateien eingebunden. Weitere Tiere aus dem Paket bleiben für spätere Schauplätze verfügbar.

Die Katzen behalten ihre vorhandene Darstellung. Beide Katzen, der Hund und die drei Kleintiere laufen jetzt auf kurzen Rundwegen in ihrer jeweiligen Umgebung. Nach zwei Schritten gibt es längere Pausen. Bewegung wird weich interpoliert; Katzenschwanz, Beine und Tierframes unterstützen die Bewegung. Bewohner bleiben für diesen Schritt an ihren Standorten.

## Bewegung und Kollision

- Routen stehen direkt am jeweiligen Tierobjekt in den Dorf- und Bewohnerdaten. Die ursprünglichen Objektkoordinaten werden nicht verändert.
- Der Bewegungszustand liegt im vorhandenen Raumzustand unter wanderers. Rendering und Objektkollision erhalten dieselbe projizierte Tierposition.
- Start- und Zielfeld bleiben während eines Schrittes reserviert. Der nächste Schritt wird gegen Gelände, andere Objekte und den aktuellen beziehungsweise bereits reservierten Spielerschritt geprüft.
- Belegte Felder führen zu einer kurzen Wartezeit statt zum Durchlaufen von Figuren. Die kleinen Routen liegen außerhalb der Gilden- und Wehrzugänge.
- Dialog, Rucksack, Karte und Journal pausieren die Tiere mit der übrigen Welt. Raumwechsel erhalten die Positionen, Neustart setzt sie zurück.
- Bei reduzierter Bewegung bleiben die Tiere statisch. Eine beim Umschalten laufende Bewegung wird am reservierten Ziel beendet.
- Zusätzliche flüssige Frames werden nur während laufender Schritte angefordert; Ruhephasen nutzen die vorhandene niedrige Umgebungsfrequenz. Es gibt keine eigenen Timer je Tier.

## Neue Dateien

- scripts/display/life-assets.js: neue Figuren und Tiere laden, Schlüsselgrün entfernen und bestehende Palettenumsetzung nutzen.
- scripts/game/systems/wanderers.js: kurze Wege, Pausen, Interpolation und Reservierung der Kollisionsfelder.
- assets/sprites/npcs/5yvalia-samples.png und drei verwendete PNGs unter assets/sprites/animals/.
- tests/village-life.test.js: Varianten, sichere Routen, Kollision, Pausen, reduzierte Bewegung und Zustandserhalt.

Die bestehenden Wegtests planen bei bewegten Hindernissen ihren nächsten Schritt neu, statt ausschließlich einem beim Teststart berechneten Weg zu folgen. Die Rätsel und die Wehr-Aufgabe werden weiterhin vollständig mit normalen Eingaben durchlaufen.

## Prüfung und Installation

28 Tests sowie JavaScript-/CSS- und Python-Strukturprüfungen bestanden. Bewohnerauswahl, Dach und belebte Stadt wurden mit einer Canvas-Laufzeit gerendert und visuell kontrolliert. Der Originallader der neuen Grafiken wurde in dieser Canvas-Laufzeit ausgeführt; bei allen drei Kleintieren ist die Schlüsselgrün-Fläche transparent. Eine vollständige Browser-/WebGL-Prüfung ist weiterhin nicht erfolgt.

Dieser Folgepatch setzt den letzten Details-/Karten-Patch voraus. ZIP im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Es sind nur neue und geänderte Dateien enthalten; keine Löschungen oder zusätzlichen Downloads notwendig. Asset-Lizenzen und Quellen stehen in docs/asset-credits.md.
