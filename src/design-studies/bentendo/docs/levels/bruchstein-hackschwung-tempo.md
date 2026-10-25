# Schnellerer Hackschwung

Voraussetzung: BENTENDO_Schwert_Hackschwung_Patch.zip. Dateien im Projektordner überschreiben und Strg+F5 drücken.

Die Animation dauert nun 240 statt 320 ms: 75 ms Ausholen, 105 ms Hackschwung, 60 ms waagerechte Endpose. Der Treffer erfolgt nach 180 ms. Die Abklingzeit bleibt bei 440 ms, damit sich durch die rein visuelle Beschleunigung die maximale Angriffsfrequenz nicht ändert. Schwungklang, Treffer und reduzierte Bewegung verwenden weiterhin dieselben zentralen Zeitwerte.

Die vorhandene Speicherfunktion bleibt unverändert: lokaler Browserstand, regelmäßige Sicherung sowie zusätzlich beim Wechsel in den Hintergrund, Verlassen der Seite und Ausschalten. Patches löschen diesen Browserstand nicht. Eine andere Adresse bzw. ein anderer Port oder Browser verwendet einen getrennten Speicher; gelöschte Websitedaten entfernen den Stand.

Prüfung: 35 gezielte Kampf-, Dungeon-, Herz- und Speichertests erfolgreich; Codeprüfung erfolgreich.
