# Nordhöhle, Vegetation und zusätzliche Awakening-Tiere

## Norden

Eine durchgehende Felswand ersetzt die Baumreihe an der gesamten Nordkante. Der nördliche Dorfweg endet an einem schlichten Höhleneingang. Seine Holzsperre bleibt untersuchbar und warnt vor dem gesperrten Durchgang zum Nordwald. Der Weg wird an der Felskante schmaler. Der Wasserfall beginnt daneben in einer gemeinsamen Öffnung der gewellten Felswand. Native Steinsäulen rahmen beide Seiten bis zur Gischt ein; schmale Steinufer führen den Fluss weiter. Die einzelnen Findlinge und der große frühere Höhlenkopf sind entfernt. Wasser und Felsen sind weiterhin nicht begehbar. Die neue Geländekennung r ist fester Fels, c die Höhlenschwelle hinter der Sperre. Ortskarte und Kollision berücksichtigen beides.

Die Nord- und Ostsperre bleiben geschlossen, bis die spätere Dorf-Questfolge und die angrenzenden Gebiete implementiert werden. Die vorhandene Wehr-Aufgabe bleibt unverändert spielbar; ihre Lösung allein öffnet noch keinen Außenausgang.

## Bäume, Pflanzen und Büsche

Der vordere rechte Baum im kleinen Hain bei der Schenke steht zwei Felder weiter nördlich. Die Gruselbaum-Variante wird im gesamten Dorf nicht mehr gerendert. Runde Bäume werden mit ausgewählten spitzen Awakening-Bäumen gemischt. Die Nadelbaumgrafik ist vollständig 32×32 Pixel groß, genau wie die runde Baumvariante. Die falsche zusätzliche Atlaszeile oberhalb der Baumspitze ist entfernt; Stammkollision und Tiefensortierung bleiben am selben Fußpunkt.

Alle Pflanzflächen verwenden jetzt den vollständigen Neun-Kachel-Rahmen aus Awakening v2 (x112/128/144 und y80/96/112). Obere Kante, Mittelfläche und unterer Abschluss kommen damit aus derselben Grafikfamilie. Ein Feld breite oder hohe Flächen werden aus passenden Randhälften geschlossen. Die zuvor vermischten alten Atlaszeilen erzeugten helle Streifen und offene Abschlüsse; sie werden für diese Flächen nicht mehr verwendet.

Lose Blumen und Grashalme kommen jetzt aus dem neuen Awakening-Overworld-Sheet. Blumen bilden kleine Beete; native Halme ergänzen die Wiesen innerhalb ihrer Umrisse. Der selbst gezeichnete Blumenkübel bei der Gilde samt Renderzweig ist entfernt. An seiner Stelle liegt ein kleines Blumenbeet. Die vorhandenen Pflanzengruppen bleiben zusammenhängend.

Büsche waren zuvor ausdrücklich als Hindernis definiert. Sie sind nun begehbare Vegetation. Baumstämme, Häuser, Felsen, Wasser, Gegenstände und die beiden Wegsperren behalten ihre Kollision.

## Tiere und Vasen

Die tatsächlich passenden Froschframes liegen bei x128/144 im Spriteatlas; der zuvor verwendete Nagetier-Ausschnitt x512 ist ersetzt. Frösche werden mit 12×12, Schlangen mit 10×10 Pixeln gezeichnet, zentriert am unveränderten Fußpunkt. Drei Awakening-Frösche wechseln auf kurzen Routen zwischen Wasser und Ufer: unterhalb des Wasserfalls, bei der Anglerin und im südlichen Flussabschnitt. Nur ausdrücklich als amphibisch markierte Tiere dürfen Wasserfelder betreten. Die Spielerkollision und die übrigen Tiere erhalten keine Wasserfreigabe. Start-/Zielfelder bleiben reserviert, Tiere warten vor Personen und Hindernissen.

Zwei Awakening-Schlangen bewegen sich ausschließlich innerhalb bestehender Buschgruppen. Sie sind friedliche Dorftiere mit Untersuchungstext und kurzem Zischen. Frösche quaken beim Ansprechen. Die neuen Laute laufen über den bisherigen Effektkanal einschließlich Lautstärke und Stummschaltung.

Zwei Awakening-Vögel sitzen sparsam in tatsächlich vorhandenen Baumkronen und bewegen gelegentlich die Flügel. Sie sind Dekorationen der Baumkrone statt kollidierender Bodenfiguren. Sie erzeugen keine zusätzlichen Tiersperren oder ständig wiederkehrenden Umgebungsgeräusche.

Große und kleine Awakening-Tonvasen stehen in allen neun Innenräumen, jeweils zwei pro Raum. Sie sind untersuchbar und besitzen passende Grundflächen. Die vorhandenen Prüfungen sichern freie Wege, Interaktionen, Treppen und Rückkehrpunkte auch nach diesen Ergänzungen.

Alle neuen Ausschnitte sind im [Awakening-Inventar](../art/awakening-inventory.md) verzeichnet. Es sind keine zusätzlichen Downloads erforderlich.

## Verifikation und Patch

37 Node-Tests sowie JS-/CSS- und Python-Codeprüfungen bestanden. Geprüft sind auch die Uferwechsel aller drei Frösche bei weiterhin festem Spielerwasser, sämtliche 13 bewegten Tierrouten in beiden horizontalen Richtungen, sieben artspezifische Interaktionslaute, beide nicht umgehbaren Wegsperren, begehbare Büsche und feste Wasserfallränder. Alle neun Innenräume, Dorfübersicht, Höhlenzugang, Wasserfall und Vegetationsgruppen wurden per Canvas gerendert und visuell geprüft. Ein vollständiger Browser-/WebGL- und Hörtest war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Dorfdetails_Tierlaute_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Enthalten sind ausschließlich neue oder geänderte Dateien, keine Löschungen.
