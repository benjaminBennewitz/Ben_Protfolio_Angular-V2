# SCOOP! – Shop Design Study

Eigenständige Microsite in HTML, CSS und Vanilla JavaScript. Kein Framework, kein Build, keine externe Schrift- oder Skriptanfrage.

## Start

ZIP entpacken und `index.html` öffnen. Die SVG-Templates sind lokal in `artwork.js` enthalten, deshalb funktionieren die Figuren auch unter `file://` ohne Fetch/CORS.

Alternativ im Ordner:

```bash
python -m http.server 8080
```

Dann `http://localhost:8080/` öffnen.

## Inhalt

Fünf Sections plus Footer: Hero, drei Sorten, Mix-Box, unsere Idee und Flavor Vote.

- Strawlarry / Erdbeere, Brostacchio / Pistazie, Jochen / Vanille.
- Einzelbecher: 500 ml, Demo-Preis 6,90 €.
- Mix-Box: drei frei kombinierbare Becher, 20,70 €. Mehrfach dieselbe Sorte ist möglich.
- Warenkorb mit Einzelbechern und konfigurierten Boxen, Mengenänderung, Entfernen, Summen und lokaler Speicherung.
- Demo Checkout leert den Beutel und zeigt ausdrücklich an, dass weder Bestellung noch Zahlung erfolgt sind. Kein Backend, keine Zahlungsdaten und kein Versand.
- Flavor Vote speichert ausschließlich die Auswahl in diesem Browser. Keine erfundenen Abstimmungsergebnisse.

## Animationen

Hero: Waffel bleibt stehen. Jochen, Brostacchio und Strawlarry fallen mit zeitlichem Versatz von oben auf ihre endgültigen, seitlich versetzten Positionen und federn nach. Die obere Kugel liegt vor der unteren.

Die mitgelieferten Schattenflächen erscheinen erst beim Kontakt. Sie werden während des Nachfederns schwächer. `mix-blend-mode: multiply` wird beim Erzeugen der Browser-Templates aus den exportierten SVG-Attributen übernommen.

Jochens Arme werden geometrisch verformt: vier Abtastpunkte entlang des ursprünglichen Pfades ergeben drei weich verbundene Béziersegmente. Der Schulterpunkt bleibt fest, zur Hand hin nimmt die Bewegung zu. Handflächen folgen dem Endpunkt und der Armrichtung. Die Arme rotieren nicht nur als starre Gruppen.

Pupillen und Lichtreflexe werden gemeinsam verschoben. Die Augenweißformen begrenzen sie über Clip-Pfade. Die Becher reagieren bei Annäherung an den Kaufbutton oder Tastaturfokus mit einer Sprechblase und dem vorhandenen offenen Mund. Hero-Münder bleiben geschlossen.

In der Mix-Box hüpfen die gewählten Becher unabhängig voneinander. Augenbewegung und Hüpfen liegen auf getrennten Ebenen.

Der Hintergrundpfad folgt den tatsächlichen Section-Höhen und zeichnet sich abhängig vom Scrollfortschritt. Mobile verwendet einen eigenen Verlauf. ResizeObserver berücksichtigt Layout- und Höhenänderungen.

Reduced Motion zeigt den Hero im fertigen Zustand, deaktiviert Arm-/Pupillenbewegung, Hüpfen, Fluganimation und Übergänge und zeigt den kompletten Pfad. Animationsarbeit wird bei verstecktem Tab pausiert; Figuren außerhalb des Sichtbereichs werden nicht ständig aktualisiert. Die JavaScript-Figurenanimation folgt requestAnimationFrame ohne feste 30-FPS-Begrenzung. Ein Loader wartet mindestens zwei Sekunden auf Fonts und Bild-Decoding; danach startet die Fallzeit ab dem ersten sichtbaren Frame. Der Scrollpfad bleibt bis zum letzten Aufprall leer und wächst anschließend weich zur Scrollposition. Pupillen stoppen ihre Renderframes, sobald sie außerhalb des animierten Heros am Ziel angekommen sind.

## Assets und Fonts

Deine bereitgestellten SVG-Dateien bleiben unverändert. `artwork.js` enthält daraus abgeleitete Browser-Templates mit Markierungen für Pupillen, Hände, Münder und Kontaktschatten. Alle eingebundenen SVG-Instanzen erhalten eindeutige IDs, damit die Eye-Clips auch bei mehrfach dargestellten Bechern funktionieren.

Der Hero nutzt `Unbenannt-5.svg` als Waffel mit deiner zusätzlichen Schattenfläche. Die Variante `golden-waffel.svg` bleibt ebenfalls erhalten.

Lilita One für Headlines, Produktnamen und große Buttons; Nunito Sans für Texte, Preise und Bedienelemente. Beide sind lokal als optimierte WOFF-Webfonts eingebunden. Die Nunito-Datei enthält variable Gewichte, bei festgelegter Breite und optischer Größe. Die mitgelieferten OFL-Lizenzdateien liegen in den jeweiligen Font-Ordnern. Für den Browser nötige Fonts zusammen ca. 51 KB.

Kleine Zutaten-Doodles, Smileys, Tropfen, Pfade und Kartonflächen entstehen direkt im Markup/CSS. Becher- und Hero-Grafiken sind deine SVGs. Die Portraits sind als KI-Platzhalter gekennzeichnet. SVG-Portraitarme winken bei Hover, Fokus oder Klick. Die Smileys sitzen im Footer.

Illustrator-Master, Entwurfs-PNGs und ursprüngliche TTF-/Italic-Dateien bleiben im Quellordner erhalten, werden aber über die Angular-Asset-Konfiguration aus dem Web-Build ausgeschlossen.

## Responsive und Bedienbarkeit

Minimum 320 px, maximal 1920 px, darüber zentriert. Normaler Body-Scroll, kein innerer Scrollcontainer für die ganze Seite. Der Warenkorb verwendet ein natives Dialogfenster mit Escape, Rückgabe des Fokus und Scroll-Lock. Das mobile Menü hat einen deckenden Hintergrund, Escape, Fokusbegrenzung und korrekte ARIA-Zustände. Touch-Buttons sind mindestens etwa 44 px groß.

Ohne JavaScript bleiben Texte, Navigation und statische Produktgrafiken verfügbar; die Shop-Interaktionen benötigen JavaScript. Die lokale Speicherung ist optional und darf im Browser blockiert sein.

## Portfolio-Integration

Integriert unter `src/design-studies/scoop/` und `/design-studies/scoop/`, inklusive Portfolio-Karte und `assets/preview.webp`. Rücklinks und Rechtliches zeigen auf `/portfolio#design-studies`, `/impressum` und `/datenschutz` der aktuellen Domain. Alle internen Assetpfade sind relativ. `noindex, follow` bleibt gesetzt.

Die Einbindung als vierte Portfolio-Karte und die Erweiterung der serverseitigen Pflicht-Studies sind ein separater Schritt. Die vorhandene Angular-Asset-Kopie und Cache-Regel für Design Studies können weiterverwendet werden.

Footer-Links zeigen auf das B²-Portfolio, dessen Impressum und Datenschutz.

## Prüfung

Geprüft: JavaScript-Syntax, Produktpreise in Cent, Mix-Boxen mit wiederholten Sorten, Warenkorbsummen, Mengenbegrenzung, ungültige und doppelte Storage-Datensätze, Fall-/Nachfeder-Kurven, vier Armanker mit drei Béziersegmenten, SVG-Clips und Markierungen, eindeutige Quell-IDs, Assetpfade, Anker/ARIA-Verweise und Font-Zeichenabdeckung. Quelltextdateien verwenden CRLF.

Die Arbeitsumgebung bietet keine Browserprüfung. Visuelle Feinabstände der Hero-Ebenen, die Browserdarstellung von Multiplizieren und das tatsächliche Bewegungsgefühl müssen daher im lokalen Browser geprüft werden. Es wurde keine Geräte- oder Live-Deployment-Prüfung behauptet.

Die Mix-Auswahl nutzt eigene tastaturbedienbare Listboxen. Pro Produktkarte erscheinen bis zu fünf Sprechblasen mit zufälligen Abständen von 0 bis 2 Sekunden; nur die gehoverte Karte öffnet ihren Mund. Das Abstimmungs-Popup zeigt einen ausdrücklich fiktiven Zwischenstand und keine echten Umfragedaten. Social-Links zeigen auf die Plattform-Startseiten, bis konkrete Profile hinterlegt werden.
