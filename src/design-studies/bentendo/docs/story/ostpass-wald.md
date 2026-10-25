# Ostpass und Waldsaum – GDD-Ergänzung

Stand: 24. Oktober 2026. Basis: Bruchstein Review 01, mit Wald-Erweiterung und Flaschenkorrektur. Diese Ergänzung dokumentiert den neuen spielbaren Stand über GDD 1.0 hinaus.

## Einstieg und Geschichte

Nach der Nachricht aus dem Spinnennest erkennt Mara, dass jemand ihr Zeichen verwendet. Die alte Werkstation beim Ostpass wird zum nächsten Ansatzpunkt. Auch ein bereits abgeschlossener alter Spielstand kann durch ein weiteres Gespräch mit Mara fortgesetzt werden. Die Wartungsluke liegt unmittelbar vor dem Ostpass, bei (30,11) in Bruchstein.

Eine defekte Druckleitung hält den Passriegel geschlossen. Nach ihrer Reparatur hebt Wasserdruck den Riegel dauerhaft. Der östliche Waldsaum wird erreichbar. Eda beobachtete einen Fremden, der eine Kiste nordwärts zog, während die frische Kreide zum Bach zeigt. Grauer Stoff mit Lampenölgeruch, Schleifspuren und ein Zeichen unter der Rinde widersprechen dem Pfeil. Eda verbindet die Beobachtungen; Mara erkennt schließlich ein altes Warnzeichen der Wegmacher. Ihre Suche in den Chroniken bildet den Anschluss an das nächste Kapitel.

Die Identität des Fremden und der Inhalt der Kiste bleiben offen. Das nächste Dungeon hinter der Wurzelpforte ist noch nicht begehbar. Es gibt in diesem Patch keine zusätzliche Pumpstation nach der Ostöffnung und noch keine Bomben oder Getränkebuffs. Die erste Tag/Nacht-Umsetzung und der veränderte Rückweg sind in `abendwald-und-spielzeit.md` dokumentiert.

## Neue Orte

| Kennung | Ort | Funktion |
| --- | --- | --- |
| east-pump | Ostpass-Werkstation, 15 × 11 | Druckleitung, Ersatzteil, manuelle Rückstellung, sicherer Dorfrückweg |
| east-wood | Östlicher Waldsaum, 24 × 20 | Eda, Rastbank, Feldflasche, grauer Stoffrest, Eichhörnchen und Baumvogel |
| east-crossroads | Alter Forstkreuzweg, 26 × 22 | Nord-/Ostabzweig, Wegstein und verlassene Raststelle |
| east-ferns | Das Farnlabyrinth, 28 × 24 | Gewundener Nordweg, Baumriegel, optionales Laubversteck |
| east-oak | Die hohle Eiche, 24 × 22 | Südlicher Rundweg, alter Wegmacherbrief im Stamm |
| east-thicket | Der Dornenbogen, 26 × 22 | Zusammenführung beider Routen und Weg zur Pforte |
| east-clearing | Die Wurzelpforte, 22 × 18 | Schleifspuren, eingemauerte geschlossene Steintür, optionale Wegkiste |

Die Waldgebiete nutzen dieselbe native Landschaftsdarstellung und Baum-, Pflanzen-, Kollisions- und Verdeckungslogik wie Bruchstein. Sie sind keine Kampfräume. Außenübergänge liegen als kleine Bodenwegweiser im Pfad. A aktiviert sie weiterhin; zusätzlich wechselt das Hinauslaufen am tatsächlichen Wegrand automatisch den Raum. Die Pfeile selbst sind überlaufbar.

## Neue Figur

**Waldläuferin Eda:** Eine aufmerksame, pragmatische Wegkundige mit breitem Hut. Sie hält die alten Forstwege frei, beobachtet Spuren und vertraut ihnen mehr als frisch gezeichneten Pfeilen. Sie ist eine neue Person, keine Umbenennung einer Dorfbewohnerin. Verwendet wird eine bisher ungenutzte Figur aus dem vorhandenen NPC-Samplesheet bei (156,208), mit den vorhandenen Geh- und Idle-Frames. Sie hat eine kurze Patrouille und eigene zufällige Sprechblasen. Direkte Gespräche verdrängen diese wie im Dorf.

Das Eichhörnchen im Waldsaum verwendet die vorhandenen Kleintiergrafiken und Laute. Der einzelne Vogel sitzt in einer tatsächlichen Baumkrone. Mara bleibt Mentorin; im Hub reagieren Schenke und Marktlager mit zusätzlichen gelegentlichen Äußerungen auf die Ostöffnung. Die Gesellin kennt die Aufbewahrung der alten Rohrteile, sobald der Schaden untersucht wurde.

## Quests und vollständige Lösungen

### 7 – Ein Weg nach Osten

1. Nachricht aus dem ersten Dungeon bei Mara melden. Bei bereits früher abgeschlossenem Bericht Mara erneut ansprechen. Der Quellauftrag bleibt abgeschlossen; die neue Ostaufgabe erscheint getrennt.
2. Wartungsluke bei (30,11) untersuchen und die Werkstation betreten.
3. Wartungsplatte bei (2,3) oder den beschädigten mittleren Rohrbogen bei (5,4) untersuchen. Das Werkstattzeichen ist der Hinweis auf Ersatzteile.
4. In der Dorfwerkstatt die Ersatzteilkiste `pipe-case` bei (12,8) öffnen. Ein freies Inventarfach wird benötigt. Die Gesellin gibt einen indirekten Aufbewahrungshinweis.
5. Zur Werkstation zurückkehren. Den mittleren Bogen mit A ansprechen oder den Rohrbogen davor im Rucksack benutzen. Der Gegenstand wird genau einmal eingesetzt.
6. Die Öffnungen über A im Uhrzeigersinn drehen. Der dichte Weg lautet: Zulauf → oberes linkes gerades Rohr → oberer mittlerer Bogen nach unten → mittlerer Bogen nach rechts → mittlerer rechter Bogen nach unten → unterer rechter Bogen nach rechts → Druckkolben. Nicht angeschlossene Nebenrohre dürfen frei stehen.
7. Den Druckhebel bei (10,6) betätigen. Nur ein dichtes Netz bis zum rechten Auslass hebt den Passriegel. Es gibt einen Erfolgsklang und einen Journaleintrag.
8. Zurück ins Dorf und den geöffneten Ostpass bei (32,12) mit A betreten.

**Belohnung:** dauerhafter Zugang zum Osten. Keine zusätzliche Münzbelohnung. Das Rückstellrad bei (2,7) setzt nur die Drehstellungen zurück, erhält aber den eingesetzten Bogen. Nach der Passöffnung bleibt die Anlage gesichert und lässt sich nicht versehentlich wieder schließen.

### 8 – Die falsche Fährte

Die Hinweise können vor oder nach dem ersten Gespräch mit Eda und in beliebiger Reihenfolge gefunden werden:

- Grauer Stoffrest `ribbon` bei (17,6) im Waldsaum.
- Schleifspuren `tracks` bei (8,8) an der Wurzelpforte.
- Verwurzelte Steintür `root-door` bei (11,3), zwei Felder breit und hoch, im nördlichen Mauerrest.

Alle drei Beobachtungen gehen ohne Inventarplatz ins Journal. Danach mit Eda sprechen; sie erkennt die falsche Fährte. Anschließend Mara im Gildenarchiv berichten. Der Bericht vergibt **einmalig sechs Gildenmünzen** und beendet den neuen Handlungsabschnitt. Wiederholtes Untersuchen oder Berichten erzeugt keine weitere Belohnung.

Das Questbuch nennt nur aufgenommene Beobachtungen. Unbekannte genaue Fundstellen erhalten keine Kartenmarker. Nach zusammengeführten Hinweisen erscheint bei der bereits bekannten Eda ein Ausrufezeichen; nach ihrem Bericht verweist es auf Mara.

### 9 – Eine trockene Kehle

Eda klagt über Durst und erwähnt die letzte Rast bei den Dornen. Im Gras bei (6,6) im Waldsaum liegt eine **Feldflasche**, kein zusätzlicher Truhenbehälter. Ein E im Boden verweist auf die Besitzerin.

1. Flasche mit freiem Inventarfach aufnehmen. Ein Fund vor dem ersten Gespräch funktioniert ebenfalls.
2. Eda erkennt auch die leere Flasche und gibt einen Hinweis auf frisches Brunnenwasser. Die leere Rückgabe schließt den Auftrag nicht ab.
3. Die Flasche am Dorfbrunnen im Rucksack mit Benutzen füllen.
4. Die **volle Feldflasche** bei Eda über Gespräch oder Benutzen abgeben.

**Belohnung:** einmalig drei Münzen und ein Feldverband. Die verbrauchte volle Flasche macht genau das für den Verband benötigte Fach frei; die Rückgabe funktioniert somit auch bei vollem Rucksack. Der gefundene Gegenstand erscheint nicht erneut im Gras. Die Nebenaufgabe ist keine Pflicht für die Waldgeschichte. Nach dem einmaligen Erkennen der leeren Flasche kann Eda die Waldspuren weiter einordnen. Bereits abgeschlossene Rückgaben aus älteren Patches bleiben abgeschlossen; Belohnungen werden nicht entzogen oder erneut vergeben.

### Optionaler Fund

Die Wegkiste `cache` bei (16,13) an der Wurzelpforte enthält **vier Münzen**, genau einmal. Das Laubversteck im Farnlabyrinth bei (24,11) enthält einmalig drei Münzen. Der Brief unter der hohlen Eiche bei (5,15) bleibt wiederholt lesbar und wird nur einmal ins Journal aufgenommen.

## Mechaniken und Persistenz

Die Rohrstücke sind Bodenkanäle und begehbar; A bedient das Rohr vor der Figur. Keine neue Taste und keine zusätzliche Menüebene. Die Darstellung zeigt dieselben Anschlüsse, aus denen die Flussprüfung das Netz berechnet. Nur wechselseitig verbundene Öffnungen leiten Wasser weiter. Ein Riss oder ein offenes Ende im nassen Teilnetz verhindert Druck am Auslass. Zulauf und Druckkolben sind sichtbar an den Netzenden verankert und blockieren ihre tatsächlichen Grundflächen.

Gespeichert werden die Drehstellungen `eastPipe0` bis `eastPipe8`, Reparatur, Ersatzteilentnahme, Passöffnung, Eda-Kontakt und beide Berichte in den vorhandenen Flags. Funde und Hinweise verwenden weiterhin die vorhandenen Raumfundlisten und das Journal. Das bestehende Save-Format und das Speichern bei Raumwechsel bleiben erhalten. Ältere Spielstände benötigen keinen Neustart.

Neue Gegenstände: Rohrbogen (bei Reparatur verbraucht), Feldflasche, Volle Feldflasche. Der Feldverband bleibt der vorhandene Heilgegenstand.

## Assets und Credits

Keine neuen Fremdpakete oder Downloads. Weiterverwendet werden Awakening von Sodacoma (Flora/Welt), NPC Samples von 5yvalia (Eda), Kleintiere von GamebowGames (Eichhörnchen), Retro Green Dungeon von PetricakeGames (Mauerteile der Wurzelpforte) sowie die vorhandenen Innenraumgrafiken. Rohrdarstellung, Luke und kleines Flaschenbild sind projektspezifische Canvas-Zeichnungen. Musikzuordnung: bestehendes `maras-quellplan` in der Werkstation. Alle sechs Waldgebiete verwenden den neuen eigenen Track `forest-canopy` mit dem Titel **Unter den Kronen**: ein 64-Sekunden-Chiptune im 6/8-Fluss mit deutlicherer Puls-Melodie, Dreiecksbass, leichten Arpeggien und weich gehaltenen Dreiklängen. Im letzten Viertel ergänzt eine leise Gegenstimme die bekannte Melodie. Die Komposition und Klangsynthese entstehen im projektspezifischen Python-Generator `scripts/audio/tools/build_forest_music.py`, mit Codex-Unterstützung, ohne externe Samples. Es wird keine externe Musikurheberschaft behauptet. Der vorhandene Audiomanager startet denselben Track beim Raumwechsel nicht erneut. Der MP3-Export liegt unter `assets/sounds/forest-canopy.mp3`. Vorhandene Geräusche für Drehen, Fund, Ablehnung und Erfolg werden wiederverwendet. Die offenen Herkunftsangaben aus der Creditsliste des GDD bleiben bestehen.

## Validierung

206 automatisierte Tests erfolgreich, darunter echte Laufwege durch beide Waldschleifen, sichere Ankünfte, alle Baumkronen und Bodenfelder an den Übergängen, Wasserpflicht bei der Flaschenrückgabe, voller Rucksack, Benutzung über das Inventar, Fortsetzung der Hauptgeschichte mit leerer Flasche und Erhalt alter Speicherstände. JavaScript- und Python-Codeprüfung erfolgreich. Alle sechs Waldkarten wurden mit dem produktiven Canvas-Renderer und den vorhandenen Assets visuell geprüft. Der vollständige 64-Sekunden-MP3-Loop wurde dekodiert geprüft: keine übersteuerten Samples, Spitzenwert etwa 0,705, RMS etwa −18,6 dBFS und geringe Amplitudendifferenz am Loopübergang (0,00074). Kein vollständiger manueller WebGL-/Mobile- oder abschließender Hörtest.


## Waldrevision – Übersicht der Wege

Der Wald umfasst sechs eigenständige Gebiete mit insgesamt 3.220 Rasterfeldern. Der bisherige Waldsaum und die Wurzelpforte behalten Kennungen, Funde und Positionen; vier Gebiete kommen dazwischen. Ein älterer Stand an der Pforte kann über die neuen Wege zu Eda zurückkehren.

- Waldsaum ↔ Forstkreuzweg.
- Forstkreuzweg ↔ Farnlabyrinth ↔ Dornenbogen.
- Forstkreuzweg ↔ Hohle Eiche ↔ Dornenbogen.
- Dornenbogen ↔ Wurzelpforte.

Alle Waldübergänge einschließlich des Rückwegs nach Bruchstein haben sichtbare Öffnungen: Die Pfade reichen bis zum Kartenrand, und überhängende Baumkronen werden vollständig entfernt. Der Wechsel erfolgt automatisch beim Erreichen des offenen Kartenrands oder optional mit A am Bodenwegweiser. Die Ankunft liegt im nächsten Raum weiter innen; gehaltene Richtungen werden beim Wechsel zurückgesetzt und lösen keinen Rücksprung aus. Nur die verwurzelte Steintür bleibt als zukünftiger Dungeonzugang verschlossen. Die beiden Strecken bilden einen geschlossenen Rundweg. Baumriegel, Pfadschleifen und eine verlassene Raststelle schaffen Umwege und Sackgassen. Bekannte Hinweise bleiben dieselben; die Vergrößerung setzt keine Quest zurück. Vögel, Eichhörnchen und eine friedliche Schlange verwenden vorhandene Grafiken und Bewegungsregeln. Musiklautstärke und Stummschaltung bleiben im bestehenden Tonmenü steuerbar.

### Nachbauen des eigenen Musikexports

Für die Browseranwendung genügt die mitgelieferte MP3. Der Generator benötigt Python und NumPy; der Export erfolgt mit FFmpeg:

```bash
python scripts/audio/tools/build_forest_music.py forest-canopy.wav
ffmpeg -i forest-canopy.wav -codec:a libmp3lame -q:a 3 assets/sounds/forest-canopy.mp3
```


## Abendwald-Ergänzung

Die erste Türuntersuchung nach dem Abendwald-Patch führt einmalig in den Abend. Auf dem Rückweg erscheint Tamo am Forstkreuzweg; vom Dornenbogen lässt sich ein dauerhafter kurzer Waldsteig freilegen. Spielzeit, Schlafen, Lösung, neue Zustände, Klänge und Validierung stehen in `abendwald-und-spielzeit.md`.
