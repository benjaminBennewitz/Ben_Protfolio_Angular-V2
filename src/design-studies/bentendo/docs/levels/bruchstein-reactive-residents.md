# Lebendige Bewohner: Wege, Sprüche und Reaktionen

Alle menschlichen Dorfbewohner besitzen wechselnde Alltagszeilen. Auch der Hausmeister kann vor seiner Wehr-Aufgabe gelegentlich etwas sagen; während seiner wichtigen Begleitsequenz bleibt diese vorrangig. Passende Fundhinweise beziehen weiterhin den aktuellen Fundzustand ein. Webstube, Werkstatt und Marktlager erhalten je eine zusätzliche Person: Weberlehrling, Gesellin und Lagerwartin mit eigenen Sprüchen und vorhandenen nativen Figurenbildern.

## Personen in den Häusern

Alle sieben Dorfhäuser besitzen einen kurzen geschlossenen Bewohnerweg: Wirt im Ausschank, Müller im Arbeitsraum, Frau Moos im Wohnbereich, Hausmeister bei seinem Gildenarbeitsplatz, Weberlehrling bei den Stoffen, Gesellin zwischen Werkflächen und Lagerwartin im Vorratsgang. Die Wege führen ausschließlich über freie Bodenfelder und bleiben von Ausgängen, Treppen und Möbelgrundflächen fern. Gästezimmer und Archiv-Obergeschoss erhalten keine zusätzlichen Figuren.

Die Personen verwenden die vorhandene Bewegungs-/Kollisionsverwaltung der Tiere mit langsamerem Schritt (0,4 Sekunden), versetzten Pausen und reservierten Start-/Zielfeldern. Die Positionen bleiben beim Hauswechsel erhalten. In der Nähe des Spielers und während eigener Sprüche bleiben ruhende Bewohner stehen und sind gut ansprechbar. Dialoge und Menüs pausieren die Bewegung vollständig. Reduzierte Bewegung hält die Personen positionsfest.

Die menschlichen Figuren nutzen die vorhandenen Front-, Rücken- und Seiten-Schrittbilder des 5yvalia-Sheets. Rechtsbewegung spiegelt die Seitenbilder; Blickrichtung und Bewegung passen zusammen. Der Goblin-Hausmeister verwendet seine vorhandene Figur mit Idle-Darstellung. Zeichenpositionen und Tiefensortierung folgen den interpolierten Füßen. Es werden keine neuen Bilddateien benötigt.

## Sicht und Reaktionen

Nach ungefähr 14 Sekunden Herumstehen kann eine nahe Person reagieren, sofern sie den Spieler sieht. Blickrichtung, Sichtkegel und Reichweite werden geprüft. Eine Raster-Sichtlinie verhindert Kommentare durch Wände und hohe Schränke/Regale, einschließlich diagonal geschlossener Ecken. Niedrige Tische und die Schanktheke verdecken die Sicht nicht. Reaktionen benötigen eine ruhende Person in Bildschirmnähe. Schritte setzen die Inaktivitätszeit zurück; Menüs und Dialoge zählen nicht als Herumstehen.

Beim Untersuchen/Durchsuchen von Schränken, Regalen, Fässern, Vasen, Truhen und Notizen wird eine beobachtende Person ermittelt. Ihre passende Reaktion erscheint nach dem vorrangigen Objekt-/Funddialog als zweizeilige Sprechblase. Es wartet höchstens ein Kommentar. Fehlt danach die Sicht, entfällt er. Kurze Abklingzeiten verhindern ständige Kommentare bei wiederholtem Öffnen; nach einer Suchreaktion gelten zwölf Sekunden, nach einer Stillstandsreaktion zwanzig Sekunden Pause. Die Reaktionen verändern weder Beute noch Questzustände.

Wird eine Person angesprochen, verschwinden sofort die aktuelle Sprechblase und jeder noch wartende Kommentar – auch dann, wenn eine andere Person vorher gesprochen hat. Der normale Dialog bleibt im Vordergrund. Raumwechsel verwerfen ebenfalls alle alten Kommentare. Die bisherigen Teleprompter-Lesepausen und maximal zwei sichtbaren Textzeilen bleiben erhalten.

## Prüfung und Installation

70 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Neue Prüfungen sichern Blickrichtung/Abschattung, Kommentare nach dem tatsächlichen Schrankdialog, Abklingzeit, Gesprächsvorrang, Stillstandsreaktionen, sieben kollisionsfreie geschlossene Wege, Bewegungsinterpolation, Reservierungen, Gesprächsstopp, reduzierte Bewegung und native Richtungsbilder. Die Testnavigation plant bei bewegten Personen nach jedem Schritt neu. Bestehende Möbelzugänglichkeit, Etagen, Funde und Quests bleiben geprüft. Canvas-Sichtprüfung der neuen Bewohner, eines Wirtsschritts und Reaktionsblasen durchgeführt. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Sprechblasen_Teleprompter_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Ausschließlich neue oder geänderte Dateien; keine Löschungen oder zusätzlichen Assets.
