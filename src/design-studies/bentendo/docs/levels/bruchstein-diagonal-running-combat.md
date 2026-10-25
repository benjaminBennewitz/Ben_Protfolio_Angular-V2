# Diagonales Laufen und Angriff in Bewegung

Voraussetzung: BENTENDO_Hackschwung_200ms_Patch.zip. Enthaltene Dateien im Projektverzeichnis überschreiben und Strg+F5 drücken.

## Steuerung und Bewegung

Zwei senkrecht zueinander stehende Pfeiltasten ergeben eine Diagonale. Gehaltene Pfeiltasten werden einzeln verfolgt: Loslassen von A beendet keine Bewegung, Loslassen einer Richtung erhält die andere. Gegensätzliche Tasten heben sich auf. Fokusverlust entfernt alle gehaltenen Tastaturzustände. Dialoge und Menüs behalten ihre bisherige Richtungsnavigation.

Das Touch-Steuerkreuz erkennt seine Ecken als Diagonalen. Zwei getrennte native Richtungsflächen können ebenfalls kombiniert werden. Die grafische Steuerkreuzneigung folgt beiden Achsen.

Diagonale Rasterstrecken dauern um den Faktor Wurzel zwei länger als gerade Schritte, sodass die Geschwindigkeit gleich bleibt. Beide benachbarten Seitenfelder müssen frei sein. Damit können Mauern, Möbel und Gegner nicht diagonal durchquert werden. Gegner berücksichtigen während der Bewegung die gesamte überstrichene Rasterfläche. Die Spielfigur nutzt weiterhin ihre vier vorhandenen Blickrichtungen; Diagonalen wählen die horizontale Blickrichtung.

## Kampf

A startet im Dungeon auch während eines laufenden Schritts einen Angriff. Der Schritt und die gehaltene Richtung bleiben bestehen. Die Trefferposition wird aus derselben interpolierten Figurenposition berechnet, die der Renderer verwendet. So bleibt die Reichweite bei bewegten Angriffen nachvollziehbar. Objektaktionen werden während eines Schritts weiterhin nicht ausgelöst.

Der Hackschwung dauert nun 180 ms: 56,25 ms Ausholen, Treffer bei 135 ms und 45 ms waagerechte Endpose. Bestehende Abklingzeit und Speicherlogik bleiben erhalten.

## Prüfung

Neue Tests für vier Diagonalen, Geschwindigkeit, Mauer- und Gegnerecken, reservierte Bewegungsflächen, Angriff während eines Schritts, unabhängige Tastenfreigabe und kombinierte Touchrichtungen. Zusätzlich bestehende Regressionstests und Codeprüfung. Kein interaktiver Browsertest.
