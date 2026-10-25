# Klassische Porträts und hörbare Charakterwahl

## Installation

Folgepatch auf `BENTENDO_Charakterpresets_Vorratskontrolle_Patch.zip`. Enthält ausschließlich neue und geänderte Dateien. Ins bestehende Projekt entpacken und ersetzen.

## Porträts

Die beiden Auswahlporträts wurden anhand der gelieferten Referenz neu erzeugt: gröberes Pixelraster, klare dunkle Konturen, große Farbfelder und reduzierte Schattierung. Sie werden auf jeweils 64 × 64 Pixel reduziert und anschließend in die vier vorhandenen LCD-Farben umgesetzt. Die Anzeige erfolgt ohne Glättung. Die Auswahl zeigt sie in nativer Größe. Auch die kleinen Dialogporträts verwenden die aktualisierte Atlasaufteilung. Original, Quelle und genauer Bildprompt: [../art/adventurer-presets.md](../art/adventurer-presets.md).

## Bedienklänge

- Tatsächlicher Wechsel zwischen weiblichem und männlichem Preset: 45-ms-Pulsbleep.
- Bestätigung mit A/START: aufsteigender zweistufiger Bling, insgesamt 195 ms. Er ersetzt den allgemeinen Gesprächsbleep des ersten Aushangdialogs.
- B zurück zum Titel: kurzer tieferer Puls.

Richtungseingaben auf das bereits gewählte Preset erzeugen keinen Klang. Weitere Aushangseiten wiederholen den Bestätigungsklang nicht. Tastatur, Touch und physische Geräteaktionen nutzen dieselben Spielereignisse. Auch eine Richtungsaktion aktiviert den Browser-Audiokontext über die bestehende Audioverwaltung. Es werden keine Audiodateien benötigt. Alle Klänge laufen über den vorhandenen Effekt-Master, Lautstärke und Mute gelten unverändert.

## Prüfung

96 Node-Tests, JS-/CSS-Strukturprüfung und Python-Prüfung bestanden. Neue Tests sichern einmalige Auslösung beim tatsächlichen Auswahlwechsel, genau einen Bestätigungsklang, den Rückklang, zwei getrennte aufsteigende Noten, kurze Dauer, Knotentrennung und denselben Masterkanal. Der suspendierte Audiokontext erzeugt keine Fehler oder verfrühten Oszillatoren.

Die Charakterauswahl und beide Figuren wurden mit Canvas gerendert und visuell geprüft; Produktionsloader und Display-Router ausgeführt. Ein vollständiger Browser-/WebGL- und Hörtest wurde nicht durchgeführt.
