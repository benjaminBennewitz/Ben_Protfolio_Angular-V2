# Bewohnersprüche als Sprechblasen

Die gelegentlichen zufälligen Sprüche erscheinen direkt bei der jeweiligen Person als helle, dunkel umrandete Pixel-Sprechblase mit kleinem Zipfel. Die bisherige untere Spruchbox entfällt. Reguläre Gespräche bei Ansprache behalten ihre Dialogdarstellung. Inhalte, Hinweisbedingungen und die vorhandene zufällige Planung bleiben erhalten.

Der Spruch merkt sich die Sprecherkennung. Die Darstellung folgt dessen aktueller Position und dem tatsächlichen Kamera-Versatz. Normalerweise liegt die Blase über der Figur; bei fehlendem Platz am oberen Rand darunter. Die Breite richtet sich nach der gemessenen Tiny5-Pixelschrift. Die Blase bleibt innerhalb des LCD und oberhalb der Aktionshinweise. Verlässt die Person den sichtbaren Ausschnitt, wird keine frei schwebende Blase angezeigt.

Es werden höchstens zwei Textzeilen gleichzeitig gezeichnet und auf ein 16 Pixel hohes Textfenster begrenzt. Längere Sprüche laufen nach zwei Sekunden Anfangs-Lesezeit mit 2,4 Sekunden pro Zeile weiter. Am Ende bleiben die letzten beiden Zeilen weitere zwei Sekunden stehen. Kurze Sprüche bleiben fünf Sekunden sichtbar. Reduzierte Bewegung verwendet feste Zeilenwechsel statt gleitender Bewegung. Menüs pausieren die Lesezeit, neue Dialoge und Raumwechsel verwerfen den Spruch wie bisher. Die Blase hält die Bewegung nicht an und kann zusammen mit dem räumlich getrennten Aktionshinweis sichtbar sein. Ortsmeldungen und modale Anzeigen haben weiterhin Vorrang.

Die Spruchauswahl wurde außerdem für ältere Figuren mit nur einem allgemeinen Satz abgesichert: Fehlt nach dem Ausschließen der letzten Zeile eine Alternative, bleibt der verfügbare Satz gültig, statt einen undefinierten Text weiterzugeben.

## Prüfung und Installation

63 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Neue Prüfungen sichern Bildschirmränder, Sprecher-/Kamera-Verankerung, Anfangs-/End-Lesezeit, Vorschub und reduzierte Bewegung sowie vollständigen Wortinhalt aller vorhandenen Sprüche. Canvas-Sichtprüfung mit Wirt und Wirtin sowie Anfang, laufendem Text und letzten Zeilen durchgeführt. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Cartridge_Einschieben_Drag_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien; keine Löschungen oder zusätzlichen Assets.
