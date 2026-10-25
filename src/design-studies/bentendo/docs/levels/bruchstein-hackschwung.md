# Hackschwung mit synchronem Treffer

Voraussetzung: BENTENDO_Waffenstoss_Karte_Dungeonraender_Patch.zip. Dateien im Projektverzeichnis überschreiben und anschließend Strg+F5 drücken.

## Verhalten

Beim Blick nach rechts hält die Figur die gesamte Klinge zunächst senkrecht nach oben. Nach 100 ms Ausholen schwenkt die Klinge in einem durchgehenden Viertelkreis bis exakt waagerecht nach rechts. Die Endpose bleibt 80 ms sichtbar. Gesamtdauer: 320 ms; Abklingzeit: 440 ms. Links ist die Bewegung gespiegelt. Die übrigen Blickrichtungen verwenden denselben relativen Viertelkreis.

Der Schwungklang beginnt mit dem Schlag. Schaden und Trefferklang folgen erst beim Erreichen der Endpose nach 240 ms. Jeder Schlag trifft höchstens einmal, auch wenn ein Zeitschritt mehrere Phasen überspringt. Die Angriffsrichtung bleibt während des Schlags fest. Reduzierte Bewegung zeigt die ruhige Endpose bei unverändertem Trefferzeitpunkt.

Die Zeitpunkte liegen gemeinsam in scripts/game/systems/weapon-timing.js; Darstellung und Kampf verwenden dieselben Werte. Ast und Schwert bleiben über den bestehenden Renderer verbunden.

## Prüfung

Automatisierte Tests prüfen Winkel, Richtung, verzögerten Treffer, Klangfolge, große Zeitschritte, Heilung, Kämpfe und Dungeonfortschritt. Animationsphasen mit Produktionsrenderer per Canvas visuell geprüft. Kein interaktiver Browsertest.
