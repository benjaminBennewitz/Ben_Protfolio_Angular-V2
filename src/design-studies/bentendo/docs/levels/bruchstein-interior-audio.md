# Innenraumdetails und deutlichere Interaktionsklänge

## Klang

Die Tonprofile der Tiere werden vor dem bestehenden Effekt-Ausgang um Faktor 3,5 verstärkt (rund +10,9 dB). Die gedämpften Geräuschprofile von Schlange und Igel erhalten Faktor 6, weil ihr geglättetes Rauschen deutlich weniger Energie als die tonalen Laute hat. Musik, allgemeine UI-Pieptöne, Lautstärkeeinstellung und Stummschaltung werden nicht verändert.

Türöffnungen beziehungsweise Raumwechsel verwenden ein eigenes kurzes Knarrprofil statt des bisherigen einzelnen 160-Hz-Piepsers. Erstmaliges erfolgreiches Öffnen einer Truhe erzeugt ein separates Holz-/Öffnungsprofil mit ansteigendem Abschluss. Das gilt für die Reisetruhe, durchsuchbare Möbeltruhen wie die Beschlagkiste und die vorhandenen klassischen Truhen. Bereits geöffnete Truhen spielen diesen Klang beim erneuten Ansehen nicht noch einmal. Der vorhandene Fundklang kann zusätzlich ertönen.

Tier- und Objektprofile teilen dieselbe kleine Synthesefunktion und denselben vorhandenen Effektkanal. Der Ausgang wird nicht umgangen. Quellen erhalten kurze Hüllkurven, geplante Endzeiten und werden nach ihrem Ende getrennt. Ein gesperrter/pausierter Audiokontext erzeugt keine Quellen.

## Einrichtung

- Schenke: Die vier bisherigen Kistenmodule sind durch acht verbundene Holzmodule einer L-förmigen Theke ersetzt. Drei Hocker stehen direkt davor. Hinter der Bar stehen zwei Getränkeregale mit nativen Flaschenbildern, ein Geschirrschrank, Tonkrug und Getränkefass. Der Wirt steht am freien Bediengang. Küche, Tische, Gästezimmerzugang und Fundzettel bleiben erhalten.
- Werkstatt: Die Nutzfläche ist von 145 auf 105 Bodenfelder verkleinert. Der Raum besitzt drei mit nativen Werkzeugbildern ausgestattete Werk-/Montageflächen, Werkzeughalter, zwei weitere Werkzeug-/Beschlagschränke, ein Materialbuffet, Zwingenkiste, Materialschränke sowie einen Planungsplatz. Der Ausgang liegt passend zum kompakteren Grundriss; Fundkiste und Rückweg bleiben erhalten.
- Marktlager: Insgesamt sechs Fässer und vier Vasen ergänzen die Vorratsgruppen. Zwischen der hinteren Fassreihe und den beiden vorderen Fässern bleibt ein zugänglicher Gang. Der Reisebericht und alle übrigen Interaktionen bleiben erreichbar.
- Familie Moos: Die bisher weitgehend schwarze Innenwand wird vollständig mit nativen gedrehten Holzplanken verkleidet. Der Abschluss besitzt Konturen und eine Fußkante. Dasselbe Wandverfahren wird für die vergleichbaren inneren Trennwände von Gilde und Schenke verwendet; der Raumgrundriss bleibt erhalten.
- Webstube und andere Regale: Die native Buchreihengrafik konnte den seitlichen Holzrahmen überzeichnen. Beide Rahmenkanten sowie oberer/unterer Abschluss werden jetzt nach den Buchreihen geschlossen gezeichnet.

## Fass- und Werkzeuggrafiken

Der helle Hintergrund ist Bestandteil des gelieferten Fass-Ausschnitts. Beim Laden wird ausschließlich der von außen erreichbare Hintergrund in der genauen Quellfarbe transparent gemacht. Abgeschlossene helle Glanzpixel innerhalb der Fasskontur bleiben erhalten. Das freigestellte Fass wird in allen Innenräumen verwendet. Ein nativer Werkzeug-Ausschnitt wird ebenfalls einmalig vom einfarbigen Atlasuntergrund befreit und an den Werkflächen/Werkzeughaltern eingesetzt. Die originalen PNGs bleiben unverändert.

## Prüfungen und Installation

48 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Alle Möbel und Bewohner sind über reguläre Wege erreichbar, ihre Grundflächen überlappen sich nicht, sämtliche freien Innenraumfelder bleiben verbunden, Treppen und sichere Rückkehrpunkte funktionieren. Die acht Fundstellen, vier Notizen, Broschensuche und Tauschmöglichkeiten bleiben geprüft.

Neue Audioprüfungen sichern die angehobenen Pegel, gemeinsamen Master-Ausgang, Lebenszyklus der Quellen, unterschiedliche Tür-/Truhenprofile, pausierten Kontext und die erstmalige Öffnungsauslösung ohne wiederholten Truhenklang. Diese Prüfungen verwenden einen aufzeichnenden Audio-Kontext; sie ersetzen keinen Hörtest. Alle neun Innenräume wurden mit der Canvas-Laufzeit gerendert und visuell geprüft. Ein vollständiger Browser-/WebGL- und Hörtest war hier nicht verfügbar.

Dieser Folgepatch setzt `BENTENDO_Entdeckungen_Blaue_Brosche_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Es sind ausschließlich neue oder geänderte Dateien enthalten, keine Löschungen und keine zusätzlichen Asset-Downloads.
