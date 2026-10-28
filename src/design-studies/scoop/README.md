# SCOOP! — Comic Ice Cream Shop

[← Study overview](../../../README.md#standalone-design-studies) · [View live study](https://b2folio.de/design-studies/scoop/)

An illustration- and animation-led design study built around doodles, expressive ice cream characters, and a playful visual identity. The fictional shop gives those characters a setting; character design and motion are the focus.

> [!NOTE]
> This is a non-commercial, experimental study in graphic design and web development, created for personal learning. It is not a production product or a commercial service. Its specific design and technical objectives are described below. Accessibility and production readiness are not the primary evaluation goals; support varies, and no comprehensive accessibility audit or WCAG conformance is claimed.

> [!IMPORTANT]
> The source is published for inspection and evaluation only. Public visibility does not grant permission to clone, copy, run, modify, or reuse it. The [portfolio license](../../../LICENSE) applies to original project contributions; third-party components retain their own terms.

## Intent and learning focus

**Primary focus: doodles, character design, and animation.**

SCOOP! starts with an illustrated visual world rather than a shop feature list. The central question is how characters, hand-drawn-looking marks, typography, color, and motion can work together as one expressive web identity.

Strawlarry, Brostacchio, and Jochen are the main actors. Their silhouettes, faces, gestures, and reactions make the flavors recognizable and give the products a personality. Doodles, ingredient marks, speech bubbles, and the drawn path extend that character language into the surrounding composition.

Animation is part of the graphic storytelling: the characters arrive, settle, look around, wave, and react to interaction. Timing, deformation, and contact with the scene are more important to this study than the number of shop features. Product selection, the mix box, and the demo cart provide situations in which the illustrated identity can act; implementing those states is a supporting challenge.

## Concept and visual direction

Strawlarry / strawberry, Brostacchio / pistachio, and Jochen / vanilla are individual SVG characters. Large Lilita One headlines, Nunito Sans body text, ingredient doodles, and a drawn path create the comic-inspired identity.

The hero, flavors, mix box, brand story, and Flavor Vote structure the page. Portraits are labelled as AI placeholders.

## Supporting shop interactions

- Individual 500 ml cups with a demo price of €6.90.
- A three-cup mix box at €20.70, including repeated flavors.
- Keyboard-operable mix selection and a cart with quantity changes, removal, and totals.
- Browser-local state for the cart and Flavor Vote.
- A demo checkout that clears the cart and explicitly confirms that no order or payment was processed.
- A voting popup with an explicitly fictional interim result rather than server-side poll data.

There is no order backend, payment processing, or shipping service. Product names, prices, and shop controls support the design experiment.

## Animation and technical approach

The hero drops characters onto a waffle with staggered timing and settling motion. Contact shadows appear on impact. Clip paths constrain pupil movement; arms deform along Bézier segments. Product interactions trigger speech bubbles and mouth states.

The mix box animates selected cups independently. A drawn background path follows the actual section heights and has a separate mobile layout. `ResizeObserver` accounts for layout changes.

| Area | File / directory |
| --- | --- |
| Shop structure and dialogs | [index.html](index.html) |
| Layout, typography, and animation | [styles.css](styles.css) |
| Startup and module composition | [script.js](scripts/script.js) |
| Shop composition | [shop.js](scripts/shop.js) |
| Products and cart | [products.js](scripts/products.js), [cart.js](scripts/cart.js) |
| Product cards and mix selection | [product-cards.js](scripts/product-cards.js), [mix-picker.js](scripts/mix-picker.js) |
| Animation scheduling | [experience.js](scripts/experience.js) |
| Templates derived from original SVG artwork | [artwork.js](scripts/artwork.js) |
| Original graphics and WebP previews | `assets/` |
| Local webfonts and license records | `fonts/` |

HTML, CSS, SVG, and VanillaJS provide the runtime. SVG instances receive unique IDs for masks and clips. The loader considers font and image readiness plus a minimum display time. Animation work accounts for viewport and tab visibility. Reduced-motion preferences display the completed hero and disable the associated movements.

The main learning focus is character-led visual storytelling: translating illustrated faces, doodles, gestures, and comic timing into responsive SVG animation. Browser-local shop state supports those situations.

## Interaction scope

The cart and mobile menu include Escape handling and focus management. Core shop actions support keyboard and touch input. Static product artwork and editorial content remain available without the interactive shop code. These implementation details do not imply production readiness or full accessibility coverage.

## Portfolio integration and sources

The study is served at `/design-studies/scoop/`. Angular publishes runtime files, WOFF fonts, and their license records. Illustrator masters, draft PNGs, original TTF files, and selected development material are excluded according to `angular.json`.

Original graphics and implementation remain subject to the portfolio license. The fonts retain their accompanying OFL records.

The founder portraits are AI-generated placeholders depicting fictional people, not authentic photographs of Nadin or Ben. They are labelled in the interface and documented in `assets/portrait-notes.md`. The SVG characters, doodles, and animated overlays are distinct parts of the illustrated visual system and should not be confused with those photographic-looking placeholders.


## Wartung und Modulstruktur (Refactoring vom 28.10.2026)

Der Einstieg bleibt `index.html` → `scripts/script.js`. Es gibt keine zusätzlichen Laufzeit-Abhängigkeiten und keinen zusätzlichen Build-Schritt. Die ES-Module müssen wie bisher über HTTP ausgeliefert werden; ein Doppelklick auf `index.html` ist für Modulimporte ungeeignet.

### Zuständigkeiten

| Modul | Verantwortlichkeit und Zustand |
| --- | --- |
| `scripts/script.js` | Erstellt die Bereiche, verbindet Shop und Animationen und gibt die Seite nach dem Loader frei. |
| `scripts/dom.js` | DOM-Suche, sichere Texterzeugung und fehlertoleranter JSON-Speicherzugriff. |
| `scripts/navigation.js` | Mobiles Menü, Fokusführung, Escape und Fokusfalle. |
| `scripts/voting.js` | Erlaubte Voting-Optionen, gespeicherte Stimme und Ergebnisdialog. |
| `scripts/ingredients.js` | Dekorative SVG-Zutaten ohne Shop-Zustand. |
| `scripts/shop.js` | Verknüpft Warenkorb, Produktkarten, Auto-Hover und Mix-Auswahl. |
| `scripts/products.js` | Zentraler Produktkatalog; Preise ausschließlich in Cent. |
| `scripts/cart.js` | Private Warenkorbpositionen, Validierung, Summen, Dialog, Fokus-Rückgabe und Demo-Checkout. |
| `scripts/product-cards.js` | Mengenwahl je Karte, Sprechblasen und Hover-/Fokuszustand. |
| `scripts/mix-picker.js` | Drei Mix-Plätze, Listbox-Bedienung und Austausch der Becher-Vorschau. |
| `scripts/automatic-hover.js` | Gemeinsamer Sichtbarkeitsbeobachter für Touch- und Grobzeigergeräte. |
| `scripts/experience.js` | Hero-Zustand und gemeinsame Frame-Steuerung; koordiniert die Animationsbereiche. |
| `scripts/artwork-mount.js` | SVG-Parsing, eindeutige Instanz-IDs und Registrierung der Figuren. |
| `scripts/eye-motion.js` | Augenmittelpunkte, lokale Pointer-Koordinaten und geglättete Blickbewegung. |
| `scripts/arm-motion.js` | Bézier-Geometrie, Handbewegung und Wiederherstellung der ursprünglichen Arme. |
| `scripts/founder-wave.js` | Hover-, Fokus- und Touch-Auslöser der Portrait-Wellenbewegungen. |
| `scripts/scroll-path.js` | Responsive Pfadgeometrie, Abtastpunkte, Scroll-Zielwert und geglättete Pfadfreigabe. |
| `scripts/artwork.js` | Unveränderte SVG-Daten. Enthält keine Funktionen. |

### Datenfluss und Reihenfolge

1. `createShop()` erstellt den Warenkorb und bindet Produktkarten sowie Auto-Hover.
2. `createExperience()` erstellt die Animationsbereiche und SVG-Instanzen.
3. `shop.initMix()` erhält `mountArtwork` und `requestFrame`. Dadurch benötigt die Mix-Auswahl keinen Import der Animationssteuerung und es entsteht kein zyklischer Modulimport.
4. Der gespeicherte Warenkorb wird validiert und gezeichnet. Voting-Daten werden nur aus bekannten Kennungen übernommen.
5. Die Startsequenz berücksichtigt sichtbare Bilder, Schriften und die bisherige Mindestdauer. Anschließend startet der Hero oder zeigt bei Reduced Motion direkt den Endzustand.

Shop-Positionen bleiben privat in `scripts/cart.js`, ausgewählte Mix-Sorten in der Shop-Komposition und Figuren-/Frame-Zustand in den zuständigen Animationsbereichen. Module erhalten ihre benötigten Abhängigkeiten explizit. Die IDs, Klassen, Storage-Schlüssel, Preise, Animationstimings und das Achievement-Ereignis bleiben erhalten.

### Codekonventionen

- Jede Funktion einschließlich Event-Callbacks besitzt JSDoc. Normale Variablen haben kurze einzeilige Kommentare; die Kommentare stehen einheitlich vor der Deklaration auf derselben Einrückungsebene.
- Zwischen Funktionen beziehungsweise ihren JSDoc-Blöcken steht eine Leerzeile. Zusammengedrängte Mehrfachdeklarationen und mehrere unabhängige Anweisungen pro Zeile wurden aufgelöst.
- Funktionen sollen eine Aufgabe haben und ungefähr 20 Codezeilen umfassen. Kommentare und Leerzeilen sind dabei keine Laufzeitlogik.
- Der Richtwert wird bewusst nicht strikt erzwungen: zustandsgekapselte Factory-Funktionen enthalten ihre privaten Helfer; zusammengehörige Event-Registrierung, SVG-Geometrie und Animations-Keyframes bleiben teilweise länger. Insbesondere `createCart`, `createExperience`, `initProductCard`, `bindPicker` und die Scroll-Geometrie sind solche Ausnahmen. Weitere Zerlegung sollte einen fachlichen Nutzen bringen und keine bloßen Weiterleitungsfunktionen erzeugen.
- SVG-Zeichenpfade werden nicht im Rahmen eines Logik-Refactorings umformatiert oder verändert.

### Behobener Bestandsfehler

`scripts/shop.js` griff beim Öffnen des Warenkorbs auf `menu` zu, obwohl diese Variable nur im Modul `scripts/script.js` existierte. Das löste im Ausgangsstand `ReferenceError: menu is not defined` aus. Der Warenkorb fragt die mobile Navigation jetzt explizit über ihren DOM-Selektor ab.

### Start und Prüfung

Für einen isolierten Start aus dem Projektverzeichnis:

```sh
python3 -m http.server 8080 --directory src
```

Danach `http://localhost:8080/design-studies/scoop/` öffnen. Die bestehende Angular-Asset-Konfiguration übernimmt auch die neuen Module automatisch. Die bisherigen Angular-Start- und Build-Befehle bleiben unverändert.

Geprüft wurden die ES-Modul-Syntax, lokale Importziele und die JSDoc-Abdeckung aller 191 Funktionen. Die Browserprüfung umfasste Desktop und Touch-/Mobilansicht mit Reduced Motion: Produkte hinzufügen, Mengen ändern und entfernen, Mix-Sorten wählen, Tastaturbedienung der Listbox, Voting-Dialog, Wiederherstellung nach Neuladen, Menü/Escape, Demo-Checkout und Hero-Replay. Zusätzlich wurden ungültige Warenkorbdaten und gesperrte Storage-Zugriffe geprüft.

Beim Vergleich der Interaktionen mit dem Ausgangsstand wurde dessen fehlende Menüreferenz ausschließlich im Testbrowser überbrückt; die ausgelieferte Ausgangsdatei wurde nicht verändert. Der Refactoring-Stand benötigt diese Überbrückung nicht. Ein vollständiger Angular-Build und ein umfassendes Accessibility- oder Cross-Browser-Audit sind damit nicht abgedeckt.

Die vollständig geladenen Seiten wurden zusätzlich mit Reduced Motion bei 1440 und 390 Pixeln Breite als Ganzseitenaufnahme verglichen: Beide Vergleiche waren pixelgleich zum Ausgangsstand. Das prüft die statische Darstellung; es ersetzt keine zeitlich synchronisierte Prüfung aller Animationsframes.

Alle SCOOP-eigenen JavaScript-Dateien liegen im Ordner `scripts/`. Relative Modulimporte bleiben innerhalb dieses Ordners. Bildpfade wie `assets/...` werden weiterhin relativ zur HTML-Seite aufgelöst. Das gemeinsame Achievement-Skript bleibt unter `../shared/achievements.js`.
