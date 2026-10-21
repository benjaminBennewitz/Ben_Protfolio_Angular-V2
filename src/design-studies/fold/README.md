# FOLD. — There Is Always Another Side

**Design Study 007 / Interaktive Papier-Experience (Prototyp)**

## Konzept und Gestaltung

FOLD ist eine eigenständige, frameworkfreie Microsite über Perspektivwechsel. Alles geht aus demselben Material hervor: einem gefalteten Papierobjekt, das durch Öffnen, Wenden und wieder Zusammenfalten zu einer visuellen Geschichte wird.

- Leitidee: **THERE IS ALWAYS ANOTHER SIDE.**
- Farbpalette: Paper `#F0EDE5`, Ink `#17191F`, Blue `#2458F5`, Coral `#FF674A`, Yellow `#FFCE45`.
- Schrift: Space Grotesk + DM Mono (lokal gehostete Portfolio-Schriften mit System-Fallbacks).
- Stack: semantisches HTML, CSS 3D, Vanilla JavaScript; keine npm- oder Framework-Abhängigkeiten.

## Kapitel und Interaktionen

1. **THE SURFACE:** Im Hero besteht das Papierobjekt aus drei verbundenen Flächen. Der Griff verarbeitet Pointer-Drags und rastet geschlossen oder geöffnet ein. Der Button ermöglicht dieselbe Bedienung per Tastatur.
2. **LOOK CLOSER:** Der Text des Kapitels klappt beim Eintritt wie ein einzelnes Papierblatt auf und beim Verlassen wieder zu.
3. **THREE SIDES:** Eine zusammenhängende Dreifach-Faltung wird durch den normalen Body-Scroll geöffnet und am Kapitelende wieder zusammengefaltet. Jede der drei Papierflächen besitzt zusätzlich eine vollständige, um die linke Kante drehbare Innenfläche. Hover, Fokus und Klick bzw. Touch machen die Rückseite sichtbar; während der Hauptfaltung sind die Buttons deaktiviert.
4. **SAME PAGE. NEW WORLD:** Die großformatige Editorial-Section klappt ebenfalls als zusammenhängende Fläche auf und am Ende wieder zu.
5. **THE WHOLE PICTURE:** Das finale Papierobjekt besteht aus sechs über Kanten miteinander verbundenen Flächen im klassischen Würfelnetz (oben eine, mittig vier, unten eine). Beim Scrollen klappt die Box zum planliegenden Netz auf. Jede der sechs Flächen verlinkt zu einer bestehenden Station der Experience.
6. **COLOPHON:** Großer Editorial-Footer mit Kapitelnavigation und Rückweg zum Portfolio.

Die Netzflächen sind **gestaltete Miniaturen der Inhalte**; sie sind noch keine tatsächlichen verkleinerten DOM-Snapshots oder physikalisch berechneten Papiernetze.

## Technische Prinzipien

- Normaler Body-Scroll; kein globaler Scroll-Lock und kein innerer Seitenscroller.
- JavaScript berechnet nur den Scrollfortschritt und die Zustände. 3D-Scharniere werden mit CSS-Transforms animiert.
- Ein `requestAnimationFrame` pro animiertem Bereich fasst Scroll- und Resize-Updates zusammen.
- Section-Transitions und das Würfelnetz haben zentrale Custom Properties: `--chapter-angle` und `--net-open`.
- `prefers-reduced-motion` zeigt vollständig aufgeklappte Inhalte ohne Scrollchoreografie; alle funktionalen Bedienelemente bleiben verfügbar.
- Auf Touchgeräten werden Innenflächen per Tap statt Hover umgedreht. Die Fläche kann erneut angetippt werden, um den Ursprungszustand herzustellen.
- Scroll-to-Top mit Papierpfeil; responsive Layout und angepasste Scrollbar.

## Lokal starten

```bash
cd src/design-studies/fold
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen. Für das Portfolio übernimmt die vorhandene statische Auslieferung von `src/design-studies/` die Microsite. Eine zusätzliche Angular-Komponente ist nicht nötig.

## Grenzen und nächste Ausbaustufe

Die Papierflächen sind ebene CSS-3D-Segmente. Elastische Papierkrümmung, echte Knick- oder Knüllphysik und ein vollständiger räumlicher Würfel mit realen Mesh-Flächen sind nicht Bestandteil dieses Prototyps. Für das Finale wird eine über gemeinsame Falzkanten verbundene Netzgeometrie verwendet; der Eindruck, dass sich die gesamte Website zu einer Box zusammenfaltet, wird visuell vermittelt, aber die tatsächlichen DOM-Sections werden nicht physikalisch zu Würfelseiten transformiert.


## Connected cube-net choreography

Die Seite folgt einem Würfelnetz (1–4–1). Der Hero wird als obere Lasche an seiner Unterkante nach hinten gefaltet, das folgende Kapitel öffnet sich entlang der Oberkante, die drei Editorial-Blätter bewegen sich um senkrechte Scharnierkanten. Im Abschluss sind die sechs Netzflächen die Kapitel-Navigation; eine zusätzliche Footer-Kapitelliste entfällt. Dieses Stadium nutzt weiterhin getrennte DOM-Sektionen, die durch gemeinsame Faltlogik verbunden sind; es handelt sich noch nicht um ein einziges kontinuierliches 3D-Mesh. Bei reduzierter Bewegung werden die Übergänge deaktiviert.


## Korrektur Faltchoreografie

Hero mit einer 3D-Projektion und ohne Filter-Layer; die äußeren Flächen schließen zur Mitte mit maximal 86°. Das Würfelnetz öffnet schrittweise an gemeinsamen Kanten. Footer enthält Study- und Autorenangabe.
