# Startfix, Kampfklänge und Lebensdrops

## Installation

Nach BENTENDO_Profil_Herzen_Quellgewoelbe_Patch.zip im Projektverzeichnis entpacken und vorhandene Dateien ersetzen. Danach einmal mit Strg+F5 neu laden.

Der Startfehler `Cannot read properties of undefined (reading 'select')` entstand, weil App den Covercontroller voraussetzte. Die Auswahl initialisiert ihn jetzt zentral auch für einen älteren geladenen Modulcontroller. Der Patch enthält die benötigten Coverabhängigkeiten einschließlich weiblichem Cover vollständig, damit kein zusätzlicher separater Coverpatch vorausgesetzt wird. Das männliche Original bleibt der Standard ohne gespeicherte Heldin.

## Kampfklänge

Sieben eigene WebAudio-Profile laufen über den vorhandenen SFX-/Master-/Mute-Pfad:

- Hurt: kurzer rauer Puls beim nicht tödlichen Schaden.
- Refill: aufsteigender Zweiklang bei tatsächlicher Heilung.
- Ast: kurzer dumpfer Luftschwung.
- Schwert: hellerer, längerer Schwung mit metallischer Pulsnote.
- Hit: kurzer harter Einschlag bei einem nicht tödlichen Gegnertreffer.
- Gegnertod: kurzer geräuschhafter Zerfall mit abfallendem Puls.
- Heldentod: längerer dreiteiliger Abstieg; Hintergrundmusik wird kurz abgesenkt. Der erzwungene Raumwechsel überlagert ihn nicht mit einem Türklang.

Diese Klänge sind eigene Syntheseprofile. Die gelieferte GBFX-Soundbank wurde hier noch nicht konvertiert oder eingebunden.

## Lebensdrops

- Spinnen: 25 % Chance auf ein Viertelherz.
- Käfer: 35 % Chance auf ein halbes Herz.
- Schlangen: 30 % Chance auf ein ganzes Herz.

Herzen werden beim Darüberlaufen automatisch eingesammelt, ohne ein Rucksackfach zu belegen. Bei vollem Leben bleiben sie liegen. Eine Heilung endet immer am Maximum. Menüs pausieren die Aufnahme. Liegengebliebene Herzen und Viertelherz-Gesundheit bleiben bei Speichern/Neuladen erhalten.

Drei Herzen bleiben sechs Lebenspunkte; ein Viertelherz entspricht 0,5 Lebenspunkten. Das bestehende Speicherformat braucht deshalb keine Umrechnung. Herzsymbole zeigen jetzt auch Viertel- und Dreiviertelfüllungen.

## Prüfung

147 automatisierte Tests bestanden, einschließlich Startregression mit altem Modulcontroller, sieben Audio-Profilen, Klangereignissen im Kampf, allen drei Dropgrößen, Menüpause, vollem Leben, Speicherprüfung und sichtbaren Viertelfüllungen. JS- und Python-Konventionen geprüft. LCD-Herzen und Drops mit Produktionsassets gerendert und visuell geprüft. Kein manueller Browser-Hörtest.
