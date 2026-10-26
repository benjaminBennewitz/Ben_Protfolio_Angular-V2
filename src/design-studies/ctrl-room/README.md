# CTRL//ROOM — Digital Culture, Different Frequencies

[← Studienübersicht](../../../README.md#standalone-design-studies) · [Studie öffnen](https://b2folio.de/design-studies/ctrl-room/)

Audiovisuelle Microsite zwischen elektronischer Musik, Y2K-Interface und digitaler Kultur. Die Studie verbindet ein fiktives Kulturarchiv mit einem tatsächlich bedienbaren Musikplayer.

## Konzept und Gestaltung

Dunkle Flächen, Lime-Akzente, blaue Rahmen, technische Labels und Fensteroberflächen bilden das Interface. Music, Visuals, People und Places gliedern die Inhalte. Das fiktive Artist-Profil KATZKII und der Track „Midnight in the Lower Sector“ verbinden die Bereiche miteinander.

Künstler, Events, Archivdatensätze und Netzwerkzahlen sind als Design-Study-Inhalte gekennzeichnet. Es gibt keine reale Buchung, keinen Ticketverkauf und keine Live-Community.

## Interaktionen

- Ein gemeinsamer Audioplayer mit Play/Pause, Seeking, Lautstärke, Mute sowie Lade- und Fehlerzuständen.
- Das Playerfenster lässt sich minimieren und in einem Dialog vergrößern. Dabei wird derselbe Player weiterverwendet; der Track startet nicht neu.
- Equalizer und Waveform reagieren bei Wiedergabe auf echte Web-Audio-Analysedaten. Die illustrative Equalizer-Vorschau außerhalb der Wiedergabe ist davon getrennt.
- Archiv mit 13 lokalen Datensätzen, kombinierbarer Kategorie-/Textsuche, Leerzustand und Detaildialog. `/` fokussiert die Suche außerhalb von Eingabefeldern.
- Pointerreaktionen, endliche Klickwellen sowie Hover- und Fokusanimationen.

Audio startet erst nach Nutzeraktion. Dialoge und mobiles Menü besitzen Escape-Bedienung und Fokusverwaltung. Reduced Motion deaktiviert die visuellen Bewegungen und die laufende Audiovisualisierung; Audio bleibt bedienbar. Dynamische Visualisierung ist auf höchstens 30 FPS begrenzt und berücksichtigt Sichtbarkeit und Tabzustand.

## Technische Umsetzung

| Bereich | Datei / Verzeichnis |
| --- | --- |
| Struktur, Player und native Dialoge | [index.html](index.html) |
| Design-Tokens, Layout und Zustände | [styles.css](styles.css) |
| Web Audio, Archiv, Navigation und Effekte | [script.js](script.js) |
| Bilder, Logos, Texturen und MP3 | `assets/` |

HTML, CSS, SVG und Vanilla JavaScript; keine eigene Buildpipeline. Fonts, Skripte und Medien werden lokal geladen. Die Seite nutzt den normalen Body-Scroll; nur die Archivtabelle kann auf kleinen Displays innerhalb ihres Bereichs horizontal scrollen.

## Lokal entwickeln und integrieren

Im Portfolio-Stamm `npm start` ausführen und `/design-studies/ctrl-room/` öffnen. Alternativ im Studienordner `python -m http.server 8080` und anschließend `http://localhost:8080/` starten.

Für die echte Web-Audio-Analyse ist HTTP zu verwenden. Unter `file://` bleibt die Analyse deaktiviert; der native Audioplayer kann weiterhin genutzt werden. Die Integration in die Angular-Asset-Kopie und die Portfolio-Übersicht ist bereits vorhanden.

## Inhalte und Rechte

Fotografische Motive und Audiotrack sind als KI-generiert gekennzeichnet. Das Albumcover wird als bereitgestelltes Artwork verwendet. Interface, Charts, Linien und Farbflächen entstehen im Code. Eigene Beiträge unterliegen der [Portfolio-Lizenz](../../../LICENSE); mitgelieferte Fremdrechte bleiben unberührt.
