# CTRL//ROOM

Eigenständige Design Study für B² Portfolio: Y2K / Cyber Interface / Digital Culture.

## Starten

Den Ordner entpacken und `index.html` öffnen. Layout, Archiv und nativer Audioplayer funktionieren auch ohne Build.

Für die echte Web-Audio-Visualisierung über einen lokalen HTTP-Server starten:

```bash
cd ctrl-room
python -m http.server 8080
```

Dann `http://localhost:8080/` aufrufen. Unter `file://` bleibt die Analyse deaktiviert, um Einschränkungen bei lokalen Media-Quellen zu vermeiden. Der Track kann trotzdem abgespielt werden. Kein npm, keine Installation und keine externen Requests für Fonts, Skripte oder Assets nötig.

## Dateien

- `index.html`: semantische Struktur, fünf Sections und Footer, Player, Navigation und natives Detaildialogfenster.
- `styles.css`: Design-Tokens, Layout, Visual Layers, Zustände und Breakpoints.
- `script.js`: gemeinsamer Audioplayer, Web-Audio-Analyse, Navigation, Reveal, Archivsuche, Filter und Details.
- `assets/`: bereitgestellte Bilder, Logos, Texturen und Original-MP3. Die Asset-Dateinamen bleiben erhalten; das Favicon hat einen Lime-Hintergrund für Sichtbarkeit auf dunklen Browserflächen.

## Funktionen

- Hero mit Portrait, Playerfenster und verlinkter Demo-Eventliste. Der Titel hat keinen Hover-Effekt. Das Portrait reagiert auf den Mauszeiger mit kleiner Perspektivbewegung, Kontrast und einem einmaligen Scan.
- Buttons: Lichtstreifen, versetzter blauer Rahmen und bewegte Icons/Pfeile bei Hover oder Fokus. Keine Endlosschleifen.
- Klick auf nicht bedienbare Flächen: drei endliche Signalringe, maximal vier gleichzeitige Wellen; keine Wellen beim Bedienen von Buttons, Links oder Eingaben.
- Music / Visuals / People / Places als codebasierte Module; ein Modul wählt seine Archivkategorie aus.
- Places: einmaliger Standortwechsel Berlin → Hamburg → Cologne bei Hover oder Tastaturfokus, keine Endlosschleife.
- Manifesto mit SVG-Demochart und klar gekennzeichneten Beispieldaten.
- Artist-Profil mit Detaildialog und funktionierendem Release-Player.
- 13 lokale Archivdatensätze; kombinierbare Kategorie- und Textsuche, Detaildialog, Leerzustand. `/` fokussiert die Suche außerhalb von Eingabefeldern.
- Das kleine Playerfenster lässt sich auf die Titelleiste minimieren und in einem nativen Modal mit etwa 80vw × 80svh vergrößern. Im Overlay sind Seeking, Lautstärke, Mute und Playerstatus verfügbar. Escape, Hintergrundklick oder Restore stellen den ursprünglichen Zustand wieder her; Minimieren im Overlay kehrt zur eingeklappten Titelleiste zurück. Derselbe Player wird verschoben, der Track wird nicht neu gestartet.
- Beide Play-Buttons steuern denselben Track. Play/Pause, Mute, Volume, Seeking, Laufzeit, Lade- und Fehlerzustände.
- Equalizer und Waveform reagieren bei Wiedergabe auf echte Audiodaten. Ohne Wiedergabe animiert das Music-Modul eine illustrative Equalizer-Vorschau über transform. Diese läuft nur bei sichtbarem Modul und sichtbarem Tab. Bei echter Audioanalyse übernimmt der Analyser die Balken ohne zusätzliche CSS-Bewegung. Die Waveform bleibt ohne Wiedergabe statisch.
- Audio startet ausschließlich durch Nutzeraktion. Die Datei wird nicht als Endlosschleife abgespielt.
- Mobile Navigation: deckende Fläche, Scroll-Lock, Fokusbegrenzung, Escape, korrekte ARIA-Zustände und Fokuswechsel zur gewählten Section.
- Detaildialog: nativer Modalzustand, Escape, Schließen über Hintergrund und Fokus-Rückgabe.
- Die Texte in der rechten Archivspalte sind um etwa 20 % vergrößert. Footer-Texte sind mindestens 12 px (= 9 pt) groß.
- Reduced Motion deaktiviert Reveals, Übergänge, Pointereffekte, Klickwellen und laufende Audiovisualisierung. Audio selbst bleibt bedienbar.
- Kein globaler innerer Scrollcontainer. Die Archivtabelle kann bei kleinen Viewports innerhalb ihres eigenen Bereichs horizontal gescrollt werden; die Seite bleibt in der Breite begrenzt.
- Maximal 1920 px, darüber zentriert. Breakpoints berücksichtigen 320 px. Dynamische Visualisierung maximal 30 FPS, nur in sichtbaren Bereichen und bei sichtbarem Tab.
- Ohne JavaScript bleiben Ankernavigation, Inhalte und native Audiosteuerung erreichbar.

## Inhalte und Kennzeichnung

Die englischen UI-Texte folgen dem mitgelieferten Entwurf. CTRL//ROOM, KATZKII, Archiveinträge, Events und Netzwerkzahlen sind fiktive Design-Study-Inhalte. Keine Buchung, kein Ticketverkauf, keine echte Live-Community.

Hero-, Artist- und Crowd-Fotografie tragen sichtbare `AI GENERATED IMAGE`-Labels. Der Track ist ebenfalls KI-generiert und wird in beiden Playerbereichen sowie im Musik-Datensatz gekennzeichnet. Der Footer erklärt die Bild- und Audio-Kennzeichnung. Das Albumcover wird als bereitgestelltes Artwork genutzt; es wurde für diese Umsetzung nicht neu generiert. Das Layout sowie Charts, Linien, Glitches und Farbflächen entstehen in HTML/CSS/SVG/JavaScript.

## Portfolio-Integration

Die Study liegt unter `src/design-studies/ctrl-room/` und wird über die bestehende Asset-Konfiguration in `angular.json` mitgebaut. Öffentlicher Pfad: `/design-studies/ctrl-room/`.

Die Portfolio-Karte ist in der vorhandenen `designStudies`-Liste ergänzt. Der Scroll-Stack berechnet seinen zusätzlichen Scrollweg bereits aus der Anzahl der Studies; ein eigener Kartenmechanismus ist nicht nötig.

Rechtliche Links verwenden die vorhandenen Routen `/impressum` und `/datenschutz`. `B² PORTFOLIO` führt zu `/portfolio#design-studies`, die Autorenzeile zur Portfolio-Startseite. Die Study bleibt bei `noindex, follow` und verwendet keinen Angular-Router.

Lokales und serverseitiges Deployment prüfen die drei Pflicht-Studies RAW/FORM, WHATWESEE und CTRL//ROOM sowie die CSS-, JS- und Audio-Datei von CTRL//ROOM. Zusätzliche Study-Ordner werden ebenfalls auf `index.html` geprüft.

Die Root-`.htaccess` lässt gehashte Angular-Bundles weiterhin dauerhaft cachen. Unverhashte CSS-/JS-Dateien unter `/design-studies/` müssen vor Wiederverwendung revalidiert werden.

Einmalige Aktualisierung des installierten Server-Skripts und Deploy-Schritte: `scripts/ctrl-room-deployment.md` im Portfolio-Projekt.

## Validierung

JavaScript-Syntax, lokale Asset- und Ankerziele, HTML-Struktur, SVG-Dateien, Demo-Datensätze, Archivsuche/-filter, Player-Zustandslogik, Modalzustände, synchronisierte Player-Regler und Klickwellen-Logik werden vor Auslieferung geprüft. Quelltextdateien verwenden CRLF.

Eine Browserprüfung von Layout, Touch-Verhalten, tatsächlicher Audioausgabe und Web-Audio-Analyse war in der Arbeitsumgebung nicht verfügbar. Diese Punkte im lokalen Browser prüfen; die Breakpoint-Regeln sind implementiert, aber nicht als auf Geräten getestet ausgewiesen.

## Commit nach Portfolio-Integration

```bash
git add src/design-studies/ctrl-room
git commit -m "feat(design-studies): add CTRL ROOM audiovisual study"
git push
```

Geänderte Integrationsdateien zusätzlich gezielt zu `git add` nehmen.
