# Native Touchpunkte und mechanische Tastengeräusche

Folgepatch auf `BENTENDO_Tonmenue_Staukammer_Mobile_Patch.zip`. Im bestehenden Projektordner entpacken und neue/geänderte Dateien übernehmen. Keine Dateien löschen.

## Touch und ausgeschaltetes Gerät

Die Modellknöpfe besitzen jetzt eigene native HTML-Touchflächen. Sie werden aus der aktuellen Kameraprojektion positioniert und benutzen denselben Pointercontroller wie die Modellberührungen. Diese Flächen sind auch ausgeschaltet, beim Booten und am Titel aktiv; ihre Verfügbarkeit hängt nicht mehr vom eingeblendeten Tastaturfeld oder einem erfolgreichen 3D-Raycast ab. Spielaktionen bleiben bis zum abgeschlossenen Booten gesperrt.

A/B/START/SELECT haben 44-Pixel-Flächen, die vier Richtungen 34-Pixel-Flächen. Pointer-Capture, Richtungswechsel mit aufliegendem Finger und parallele Berührung von Steuerkreuz und A/B bleiben erhalten. Native Tastatur-/Screenreader-Klicks werden unterstützt; normale Pointerklicks lösen keine zweite Spielaktion aus.

Auf kompakten Geräten erscheinen vor dem eigentlichen Spiel Punkte an Knöpfen, Power, Kontrast, Ton und Modulschacht. Die Gehäusepunkte öffnen die zugehörige Geräteansicht. Dort sind die vorhandenen Regler ebenfalls markiert. Sobald das Spiel im Weltmodus läuft, verschwinden die Gehäusehinweise. Die eigentlichen Tastenflächen bleiben unsichtbar aktiv. Bei offener Bedienhilfe oder Modulansicht werden die Spieltastenflächen ausgeblendet.

Power lässt sich auf Touch kurz antippen oder wie bisher ziehen. Ein abgebrochener Touch schaltet nichts um. Kontrastrad und Kontrastregler lassen sich jetzt auch am ausgeschalteten Gerät bewegen.

## Materialklänge

Die fünf Knopfprofile erzeugen kurze PCM-Puffer aus gefiltertem Rauschen und gedämpften, unharmonischen Gehäuseresonanzen. Es werden weder Rechteck-Chiptune-Noten noch Spielereignis-Bleeps dafür verwendet:

- A/B: trockener, harter und leicht hohler Kunststoffanschlag, mit leicht unterschiedlicher Resonanz.
- START/SELECT: stärker gefilterter, kurzer Gummitastendruck.
- Steuerkreuz: raues Reibegeräusch mit unregelmäßiger Hüllkurve als erste synthetische Annäherung an ein älteres Kunststoffgelenk.

Drücken und Loslassen unterscheiden sich. Laufen mit gehaltenem Steuerkreuz erzeugt nicht bei jedem Spielfeld einen neuen Materialklang; erst ein neuer Druck oder Richtungswechsel löst ihn aus. Die Puffer werden wiederverwendet, Quellen nach dem Abspielen getrennt. Auch ausgeschaltet wird der Audiokontext durch die tatsächliche Benutzereingabe aktiviert. Gesamtlautstärke, SFX-Regler und Stummschaltung gelten weiterhin.

Die separate Hörprobe enthält jeweils drei Betätigungen in dieser Reihenfolge: A, B, START, SELECT, Steuerkreuz. Sie wird direkt mit dem Produktionsgenerator erstellt und ist für die Beurteilung der Klangfarbe auf einen gut hörbaren Pegel gebracht; der Pegel im Spiel hängt von Master und SFX ab. Es handelt sich um synthetische Materialklänge, nicht um aufgenommene Originalhardware.

## Räumlicher Rückweg

Der obere linke Ausgang der Staukammer entfällt. Der südliche Höhlenausgang bleibt der einzige Rückweg ins Dorf. Die zweite Tür im unteren Archiv wird als eingestürzter historischer Wartungsgang erklärt und wechselt den Raum nicht mehr. Der Quellplan nennt den Gang ebenfalls als historische Verbindung. Der vorhandene Mara-Auftrag, dessen Belohnungen und gespeicherter Fortschritt bleiben erhalten.

## Nächster Storyvorschlag

Noch nicht implementiert: Mara erkennt die neue Markierung eines früheren Wassermeisters. Mit ihrer Freigabe kann die Handwinde später Teil eines Pegelrätsels werden: Einlass schließen, Ablauf öffnen, sicheren Wasserstand an den drei Pegelmarken herstellen. Das sinkende Wasser legt einen Zugang zur unteren Galerie frei. Dort führen neue Aufzeichnungen zum Ostpass. So folgt auf den bisherigen Fundauftrag eine räumliche Veränderung der bereits bekannten Kammer.

## Prüfung

126 automatisierte Tests und die JavaScript-/CSS-/Python-Prüfungen erfolgreich. Zusätzliche Prüfungen decken native Bedienung ohne Raycast und vor Power, die Sichtbarkeit der Touchpunkte, Power-Tippen/Ziehen/Abbruch, unterschiedliche begrenzte PCM-Profile, Audiofreigabe und SFX/Mute, Pufferwiederverwendung, Aufräumen sowie den einzelnen Kammerausgang ab. Der vollständige Mara-Ablauf bleibt durchspielbar. Die Kammer wurde erneut mit Produktionsassets gerendert.

Ein tatsächlicher Smartphone-/WebGL-Durchlauf ist hier weiterhin nicht möglich; die Touchrouten und Zustände wurden automatisiert geprüft. Bitte die neue native Bedienung am Zielgerät beurteilen, insbesondere die räumliche Trefferfläche und Klangfarbe.
