# Dorfdetails: Bewegung, Vegetation, Kontur und Tierlaute

## Tierbewegung

Die Original-Sprites von GamebowGames schauen nach links. Der Renderer spiegelt sie jetzt bei Bewegung nach rechts. Die gezeichneten Katzen und der Hund schauen im Grundbild nach rechts und werden bei Bewegung nach links gespiegelt. Beim Hund war diese Richtungsanpassung bislang nicht vorhanden. Bei vertikalen Schritten behalten die seitlichen Tiergrafiken ihre zuletzt verwendete seitliche Haltung, weil die gelieferten Blätter keine separaten Vorder-/Rückansichten enthalten.

Die bestehenden Pausen, Kollisionsreservierungen, sicheren Routen und Reduced-Motion-Zustände bleiben erhalten. Ein weiteres Eichhörnchen erkundet die Wiese hinter der Webstube, eine weitere Maus die Wiese zwischen Mühle und Webstube. Insgesamt bewegen sich acht Tiere im Dorf.

## Ortsmeldung und Dorfgestaltung

Die Ortsmeldung verwendet eine 15 Pixel hohe, einzeilige Leiste am unteren LCD-Rand. Kurze Ortsnamen erhalten den Zusatz „betreten …“, längere Hausnamen stehen allein. Die Meldung blockiert keine Eingaben und verschwindet weiterhin automatisch nach kurzer aktiver Spielzeit. Vollständige Gespräche behalten ihre bisherige Dialogbox.

Rechts neben dem Wasserfall schließen zusammenhängende Sträucher und hohe Wiese an die Mühle an. Weitere Pflanzengruppen füllen passende Flächen hinter der Webstube, zwischen den Häusern, hinter der Werkstatt und am Lager. Die Landschaft nutzt die vorhandenen Pflanzentypen mit ihren Randabschlüssen; Hauptwege und Hauszugänge bleiben erreichbar.

## Heldenkontur

Beim Laden entsteht einmalig ein kleines, gecachtes Helden-Sheet aus den sechs vorhandenen Awakening-Frames. Bereits deckende Randpixel bekommen die dunkelste LCD-Farbe; Innenfarben und sämtliche Alpha-Werte bleiben erhalten. Die Kontur wächst deshalb nicht über die ursprüngliche Silhouette hinaus. Das Original-Tileset wird unverändert aufbewahrt. Derselbe Held wird im Dorf und in den eingerichteten Innenräumen verwendet.

## Artspezifische Laute

Ansprechen beziehungsweise Untersuchen eines Tiers löst genau einen Klang aus: Katze mit kurzem gleitendem Miauen, Hund mit zwei tiefen Bellimpulsen, Eichhörnchen mit drei schnellen Lauten, Maus mit zwei hohen Quietschern und Igel mit gedämpftem Schnuffeln. Die Klänge sind kurze Web-Audio-Synthesen im Retro-Stil, keine Tieraufnahmen; zusätzliche Sounddateien oder Downloads sind nicht erforderlich.

Tierdialoge ersetzen den normalen Dialogpiepser durch die jeweilige Klangkennung. Weiterblättern wiederholt den Laut nicht. Alle Quellen verwenden den bereits vorhandenen Effektkanal und berücksichtigen dadurch Lautstärke und Stummschaltung. Ohne laufenden AudioContext werden keine Quellen angelegt. Weiche Hüllkurven begrenzen die Anschläge; fertige Quellen und ihre Hüllkurven werden getrennt.

## Prüfung und Einspielen

35 Node-Tests bestanden, darunter sämtliche Tierrouten, Blickrichtung in beiden horizontalen Richtungen für alle acht Tiere und fünf unterschiedliche Interaktionsklänge ohne wiederholten Laut beim Weiterblättern. JS-/CSS-Codeprüfung bestanden. Die ergänzte Dorfgestaltung, kompakte Ortsmeldung, Tierausrichtung und Heldenkontur wurden mit der Canvas-Laufzeit gerendert und visuell geprüft. Alle 288 geänderten Heldenpixel liegen innerhalb der vorhandenen Silhouette; die Transparenz ist unverändert. Ein vollständiger Browser-/WebGL- und Hörtest war hier nicht verfügbar.

Dieser Patch setzt `BENTENDO_Interior_Grundrisse_Awakening_Wasser_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Das ZIP enthält ausschließlich neue oder geänderte Dateien; keine Löschungen und keine zusätzlichen Asset-Downloads.
