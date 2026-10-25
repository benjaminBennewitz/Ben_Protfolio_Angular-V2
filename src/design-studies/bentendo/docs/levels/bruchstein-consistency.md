# Korrektur der Atlas-Ausschnitte und des Nordrandes

Dieser Patch setzt `BENTENDO_Nordhoehle_Awakening_Natur_Patch.zip` voraus und enthält ausschließlich neue oder geänderte Dateien.

- Die beiden nördlichen Reihen bestehen über die gesamte Kartenbreite aus einer durchgehenden gewellten Awakening-Felswand. Es gibt dort keine Baumreihe mehr. Die untere Wandreihe wird ausschließlich von Höhlenschwelle und Wasserfall unterbrochen.
- Der Wasserfall orientiert sich an „wasserfall-perfekt.PNG“: dunkler Quellbogen, zusammenhängende Wand, seitliche native Steinsäulen, animierter Wasserfall und Gischt. Schmale Steinufer führen den Fluss fort. Die bisherigen einzelnen Felsbrocken und der große Höhlenkopf entfallen. Vorhandene Gebäude und Brücken behalten ihre Standorte.
- Der korrekte Ausschnitt des spitzen Baums ist 32×32 bei x272/y256 im neuen Overworld-Atlas. Der zuvor verwendete Ausschnitt begann eine Zeile zu hoch und enthielt dadurch fremde, kopfüber wirkende Baumteile. Alle Nadelbäume verwenden jetzt den korrigierten Ausschnitt ohne Skalierung.
- Wiesen, Blumenbeete und Buschflächen verwenden den gemeinsamen vollständigen Randrahmen aus Awakening v2. Helle Fremdstreifen und die Mischung unterschiedlicher alter Patch-Zeilen sind entfernt. Einzelne schmale Flächen behalten passende geschlossene Randhälften.
- Als Frosch war fälschlich ein Nagetier bei x512 ausgewählt. Die passenden Front-/Seitenframes bei x128/144 ersetzen es. Die Darstellung beträgt 12×12 Pixel, Schlangen sind auf 10×10 Pixel verkleinert. Fußpunkt, Reservierung und Routen bleiben auf dem bestehenden Kollisionsraster.
- Der nördliche Frosch wurde an das freie Ufer unterhalb der neuen Einfassung versetzt; seine Route enthält keine Felsfelder. Vögel sitzen nach der korrigierten Baumhöhe weiterhin in den tatsächlichen Baumkronen.

37 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Die Nordrandprüfung sichert die durchgehende obere Felsreihe, baumfreie Nordreihen und beide festen Flanken bis zur Gischt. Alle 13 Tierrouten, drei amphibische Uferwechsel, sieben Tierlaute, Hauszugänge, Treppen und Dorfaufgaben bestehen weiterhin. Dorfübersicht und LCD-Ansichten für Nordrand/Wasserfall, Pflanzflächen und die markierten Baumregionen wurden mit der Canvas-Laufzeit gerendert und visuell geprüft. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.
