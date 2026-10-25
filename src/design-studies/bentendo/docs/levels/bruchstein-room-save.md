# Raumbezogenes Speichern und schneller Hackschwung

Voraussetzung: BENTENDO_Hackschwung_Tempo_Patch.zip. Die enthaltenen Dateien im Projektordner überschreiben, danach Strg+F5 drücken. Bestehende Spielstände bleiben kompatibel.

## Speicherpunkte

Der Sekundentakt entfällt. Nach einem Raumbesuch speichert die Anwendung einmal den vollständigen aktuellen Zustand. Ein Besuchszähler erkennt auch Rückkehr und Teleport im selben Raum. Die Erkennung läuft nach dem Spielupdate, damit Ankunft, Niederlage und Folgezustände konsistent sind. Ohne Raumwechsel werden keine Spielstände serialisiert oder geschrieben. SELECT bzw. das Pausenmenü erlauben weiterhin ausdrückliches Speichern.

Tabwechsel, pagehide, Ausschalten und Debugstart führen keine zusätzliche Sicherung mehr aus. Wer vor dem nächsten Raumwechsel beendet, setzt am letzten Speicherpunkt fort. Debugdurchläufe überschreiben diesen nicht. Fehler werden nicht in jedem Frame erneut versucht. Bestehende Migrationen und Spielstandschlüssel bleiben erhalten.

Ein ruhiges Diskettensymbol mit Haken zeigt erfolgreiche Sicherung 1,6 Sekunden lang rechts unten im LCD; bei Fehlern erscheint ein Kreuz für drei Sekunden. Bei unteren Textleisten sitzt das Symbol unmittelbar darüber, bei Dialogen oberhalb des Dialogfensters. Der bestehende zugängliche Speicherstatus bleibt erhalten. Die Anzeige hält die erforderlichen Frames selbst aktiv und verschwindet auch bei ruhender Welt.

## Angriff

Gesamtdauer jetzt 160 ms: 50 ms Ausholen, 70 ms Viertelkreis, 40 ms waagerechte Endpose. Treffer nach 120 ms. Schwungklang und Treffer verwenden weiterhin gemeinsame Zeitwerte. Die bestehende Abklingzeit bleibt erhalten.

## Prüfung

Codeprüfung sowie automatisierte Kampf-, Speicher-, Menü- und Regressionstests. Erfolgs- und Fehlersymbol per Produktionsrenderer auf Canvas geprüft. Kein interaktiver Browsertest.
