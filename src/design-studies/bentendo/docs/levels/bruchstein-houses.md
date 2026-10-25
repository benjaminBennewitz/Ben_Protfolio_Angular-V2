# Dorfhäuser, Idle-Animationen und Mühlgraben

## Bewohner

Die Menschen atmen dezent und sehen gelegentlich zur Seite. Die vorgesehenen seitlichen Idle-Frames des gelieferten NPC-Sheets werden verwendet; Laufbilder werden nicht als dauerhaftes Marschieren auf der Stelle abgespielt. Jede Figur besitzt einen aus ihrer Position abgeleiteten Versatz, damit nicht alle gleichzeitig reagieren. Der Hausmeister verwendet eine kleine Atembewegung seiner vorhandenen Grafik.

Die Animation verwendet ausschließlich die aktive Spielzeit. Gespräche und Menüs pausieren sie zusammen mit der Welt. Bei reduzierter Bewegung bleiben Menschen und Tiere statisch. Eingerichtete Innenräume nutzen dieselbe niedrige Umgebungsfrequenz wie das Dorf; es gibt keine zusätzlichen Timer pro Figur.

## Nordwald und Ostpass

Zwei sichtbare Wege führen bis an den nördlichen beziehungsweise östlichen Kartenrand. Am Waldweg steht eine quer verlaufende Holzsperre, am Ostpass eine seitliche Sperre. Beide sind benannt, kollidieren und zeigen auf A einen Gefahrenhinweis.

Die Sperren lassen sich auch seitlich nicht umgehen. Sie bleiben in diesem Ausbauschritt absichtlich geschlossen: Die erste Reparatur allein gibt die Außenwelt noch nicht frei. Die vollständige Dorf-Questfolge und die anschließende Freigabe gehören zum kommenden Spielabschnitt; neue Außenlevel wurden hier nicht auf Verdacht gebaut.

## Ast und Wasserfall

Der Ast liegt jetzt bei [17,8] und belegt beide Wasserfelder bis an das Rad. Seine sichtbare Länge reicht vom westlichen Ufer bis in die Speichen. Namen, Hinweise und Dialoge beziehen sich auf das blockierte Wasserrad.

Ablauf: Ast untersuchen, nach dem Dialog erneut A zum Herausziehen, danach am Wehrhebel die Bremse lösen. Das Rad läuft erst nach dieser Reparatur wieder. Der eigentliche Mahlraum ist noch nicht ausgestaltet. Die bestehenden Fortschrittsflags und der anschließende Gang des Hausmeisters zur Gilde bleiben erhalten.

Ein Wasserfall am nördlichen Ende mündet direkt in denselben Mühlgraben. Er und der Fluss bewegen sich bereits vor der Reparatur, das blockierte Rad bleibt stehen. Reduzierte Bewegung zeigt ruhige Einzelbilder. Wasserfall, Schaum und Fluss verwenden die vorhandenen Originalanimationen aus Awakening (Old Overworld GameboyBW, vier Frames). Die prozeduralen Wasserstreifen und Glanzlinien wurden ersetzt. Die Darstellung bleibt innerhalb des unbegehbaren Flussbetts und überdeckt keine begehbaren Wege.

## Eingerichtete Häuser

| Gebäude | Einrichtung und Grundriss |
| --- | --- |
| Schenke | Acht verbundene Thekenmodule als L, drei Barhocker, Getränke-/Geschirrschränke und Krüge hinter der Bar; separate Küche, zwei Tischgruppen und verjüngter Eingangsbereich |
| Gästezimmer | Zwei getrennte Schlafzimmer mit Bett, Schrank und Schreibtisch; gemeinsamer Flur und Treppe zur Schenke |
| Gilde | Archivnische, Anmeldung, Besprechungstisch, Ausrüstung und Hausmeister; eigener Eingangsvorbau |
| Gildenobergeschoss | Getrennte Räume für Akten und Gildenleitung mit verbindendem Flur; Treppe zurück ins Erdgeschoss |
| Mühlenhaus | L-förmiger Arbeits- und Lagerraum, getrennte Getreide-/Mehlvorräte, Schreibplatz und Müller |
| Webstube | Materialschränke an der Wand, zusammenhängender Zuschnittbereich, Arbeitsstuhl und Materialtruhe |
| Wohnhaus | Küche, Essplatz, durch Wand getrennte Schlafnische, Leseplatz und Bewohnerin |
| Werkstatt | Kompakterer Raum mit drei ausgerüsteten Arbeitsflächen, Werkzeughalter, Werkzeug-/Materialschränken, Reparatursitzplatz und Planungstisch |
| Marktlager | Gruppierte Vorräte, sechs Fässer, vier Vasen, Kistenzonen und Kontor; zurückgesetzter Eingang |

Grundrisse bestehen aus verbundenen Nutzflächen mit echten Wand- und Außenfeldern. Dunkle Aussparungen sind nicht begehbar; Darstellung und Kollision verwenden dasselbe Raster. Die Räume haben unterschiedliche Abmessungen statt einer gemeinsamen quadratischen Schablone.

Ein vollständiger Webstuhl und ein großes Mahlwerk fehlen in den für diesen Schritt identifizierten Assets. Daher werden keine Ersatzmaschinen aus Rechtecken dargestellt: Die Webstube nutzt vorhandene Tisch-/Schrankgrafiken für Zuschnitt und Material, der eigentliche Mahlraum bleibt hinter einer beschrifteten Schutztür geschlossen. Für diese beiden Einrichtungen wären zusätzliche passende Sprites sinnvoll.

Alle Einrichtungsgegenstände besitzen Namen, Untersuchungstexte und zum dargestellten Grundriss passende Kollisionsflächen. Möbel, Türen und Personen überlappen sich nicht. Der Mittelbereich und die Rückwege bleiben frei. Türen führen zum jeweiligen Gebäudeeingang zurück, beide Obergeschosstreppen zurück ins jeweilige Erdgeschoss. Die Karte zeigt bei Innenräumen den richtigen Hauseingang im Dorf.

Die bisherigen Musikdateien bleiben erhalten. Die Gilde verwendet weiterhin ihre Archivmusik; die übrigen Häuser verwenden die vorhandene Dorfmusik. Der Archivgang bleibt als späterer Handlungsort verschlossen.

## Technik

- house-rooms.js enthält Raumaufbau und Verbindungen, house-layouts.js die fachlich getrennten Einrichtungsdaten, house-furniture.js Bildausschnitte und Grundflächen. house-shapes.js definiert Raumkonturen und gemeinsame Render-/Kollisionsraster.
- render/interior.js zeichnet den gecachten Boden und nach Fußpunkten sortierte Möbel und Figuren. Die Quellgrafiken werden mit nativen Pixelgrößen verwendet.
- Die Innenraumgrafiken von Gumpy Function und das unverändert gelieferte Icko-Sheet sind eingebunden; Quellen und Nutzungsbedingungen stehen in docs/asset-credits.md. Die beiliegenden Beispielbilder werden nicht mitgeladen.
- Bestehende Objektaktionen, Raumzustände, Kollision, Audio, Journal und Ortskarte werden weiterverwendet. Geräte-UI, Cartridge und Originalassets bleiben erhalten.

## Prüfungen

33 Node-Tests bestanden. Zusätzliche Prüfungen decken jedes Möbelstück und jede Person, überschneidungsfreie Grundflächen, sieben Haustüren, beide Obergeschosse in beiden Treppenrichtungen, zusammenhängende Laufwege, vollständige Möbelgrundflächen auf Bodenfeldern, sichere Rückkehrpunkte, nicht umgehbare Wegsperren und Idle-/Reduced-Motion-Zustände ab. Die vorhandene Wehr-Quest wird mit den neuen Astkoordinaten weiterhin vollständig durchlaufen.

JavaScript-/CSS-Strukturprüfung und Python-Prüfung bestanden. Alle neun Innenräume, LCD-Ausschnitte sowie Wasserfall, Rad und Wegsperren wurden mit einer Canvas-Laufzeit gerendert und visuell geprüft. Eine vollständige Browser-/WebGL-Prüfung war weiterhin nicht verfügbar und wird nicht als durchgeführt ausgewiesen.

## Patch einspielen

Dieser Folgepatch setzt BENTENDO_Haeuser_NPC_Wasserfall_Patch.zip voraus. ZIP direkt im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Nur neue und geänderte Dateien sind enthalten. Es sind keine Löschungen oder zusätzlichen Downloads notwendig.
