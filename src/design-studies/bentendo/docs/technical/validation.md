# Verifikation des Refactors

## Automatisch

- JavaScript-Syntax, maximal 450 Zeilen pro Datei, maximal 20 Zeilen je Funktion.
- JSDoc und @param für alle projekteeigenen JavaScript-Funktionen, einschließlich Tests.
- CSS-Kommentarblock, Inhaltsverzeichnis und passende Abschnittsüberschriften.
- Blender-Generator: Python-Syntax, Docstrings und dieselben Längengrenzen.
- Cartridge-State: erster Start, Kontaktfehler, Herausnehmen, Reinigung, Wiedereinsetzen und abschaltbare Gimmicks.
- Regulär erreichbare Lösungen für Wartungshalle, Relaislager, Dampfkanal und Archiv.
- Truhen und Notizen gegen doppelte Beute, Notizentfernung und Zustandserhalt.
- Hauszugänge, Obergeschosse, beide Waldwege und Rückwege.

## Browser

Headless Chromium mit echter WebGL-Darstellung, Desktop 1440 × 1000 und schmale Ansichten 390 × 844 und 320 × 568. Modell und Cover laden ohne Konsolenfehler. Cartridge öffnen, herausnehmen, drehen, pusten, wieder einsetzen und einrasten geprüft. Regulärer Bootablauf bis zum Titel, Spielstart, Debugraum und Lautstärke-Geste bis 100 Prozent bei stabiler Seitenansicht geprüft. Kontaktfehler nach erfolgreichem Erststart gezielt ausgelöst und über Herausnehmen/Pusten/Wiedereinsetzen bis zum erneuten Titelstart behoben. Sämtliche Cartridge-Aktionen auch bei 320 Pixel Breite erreicht. Kein horizontaler Seitenüberlauf in den schmalen Ansichten.

Kein Test auf physischem Mobilgerät. Der Blender-Generator kann hier nicht tatsächlich ausgeführt werden. Der bereits vom Projektinhaber bestätigte Licht-/Kameraaufbau wurde in kleine Funktionen zerlegt.

## Cartridge-Navigation nachgebessert

Im Browser geprüft: Rückansicht über dem Gehäuse halten, links/rechts verlassen, native Ansichtstasten auch bei geöffneten Modulaktionen, vergrößertes Betrachten, Drehen, Pusten und jederzeitige Front-Rückkehr. Nach der Betrachtung wird der vorherige Sitz wiederhergestellt. Desktop und 390-Pixel-Ansicht ohne JavaScript-Fehler oder horizontalen Überlauf. Zwei zusätzliche Zustandstests prüfen Rückkehr und bündige Einsetztiefe.

## UI-/UX-Verfeinerung

17 Zustandstests und sämtliche Codeprüfungen bestanden. Browser: Front-Rückkehr über obere, linke und rechte Displayrahmenkante; kein Rücksprung nach einer 1-Pixel-Bewegung am alten Cartridge-Klickpunkt; Moduloberkante nach abgeschlossener Einsetzbewegung bei 0,0739 m gegenüber Gehäuseoberkante 0,0740 m. Bei der Betrachtung bleibt der Kameraausschnitt unverändert, während nur die Cartridge nach vorn gleitet und größer wird.

Audio-Regler auf 77 Prozent gestellt, Ton stummgeschaltet und unmittelbar neu geladen: beide Werte sowie das Lautsprechersymbol korrekt wiederhergestellt. A/B/Journal liegen geometrisch oberhalb des Steuerkreuzes. Kein horizontaler Überlauf bei 390 Pixel Breite und keine JavaScript-Konsolenfehler.


## Innenraum-Grundrisse und Awakening-Wasser

33 Node-Tests bestanden. Zusätzliche Prüfungen sichern reale Raumkonturen, sämtliche Möbelgrundflächen auf begehbarem Boden, zusammenhängende freie Laufwege, alle sieben Hauszugänge und beide Obergeschosse mit sicheren Rückkehrpunkten. JS-/CSS-Struktur und Python-Regeln bestanden. Alle neun Innenräume sowie Wasserfall und Fluss wurden über die Canvas-Laufzeit gerendert und visuell geprüft. Für diesen Patch war kein vollständiger Browser-/WebGL-Test verfügbar; die obigen Browserberichte beziehen sich auf frühere Projektstände.
