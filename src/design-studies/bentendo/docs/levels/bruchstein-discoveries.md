# Entdeckungen und die blaue Brosche

## Spielverhalten

A durchsucht entsprechend benannte Möbel oder öffnet die Reisetruhe im Gras. Durchsuchte Fundstellen bleiben sichtbar, erhalten ein kleines statisches Häkchen und einen passenden erneuten Aktionshinweis. Die Reisetruhe verwendet vorhandene geschlossene/geöffnete Awakening-Grafiken und liegt teilweise unter der bereits vorhandenen Pflanzenüberlagerung. Der Zettel auf dem Gästetisch ist als Papier sichtbar. Es gibt keine zusätzlichen kollidierenden Zettel auf den Möbeln: Die Aktion gehört zum jeweiligen Tisch, Regal oder Behälter.

Alle Vasen sind durchsuchbar. Zwei enthalten Gegenstände, eine enthält eine Notiz; die übrigen sind leer und merken sich die Untersuchung. Andere unveränderte Möbel behalten ihre bisherigen Beschreibungstexte.

Notizen kommen genau einmal ins bestehende Journal und bleiben dort wiederlesbar. Notizen auf Möbeln können zusätzlich erneut am Fundort gelesen werden. Münzen gehen direkt ins Guthaben. Messingknopf, Glasperle und Brosche benutzen die vorhandenen Inventarplätze. Ist der Rucksack voll, bleibt ein gegenständlicher Fund einschließlich beigefügter Notiz vollständig am Fundort. Reine Notizen und Münzen brauchen keinen Inventarplatz. Gegenstände, Münzen und Belohnungen lassen sich nicht mehrfach einsammeln.

Fundzustände bleiben wie die vorhandenen Raumzustände während des laufenden Spiels bei Raumwechseln erhalten. Ein neues Spiel setzt sie zurück; ein zusätzlicher dauerhafter Spielstand über Browser-Neuladen hinaus ist nicht Teil dieses Patches.

## Inhalt – enthält Fundorte und Lösungsweg

| Fundstelle | Inhalt |
| --- | --- |
| Schenke, Gästetisch table-a | Zettel von Frau Moos: Die blaue Brosche |
| Marktlager, Vorratsregal shelf-a | Jorins Reisebericht mit dem Versteckhinweis |
| Südöstliche Wiese, Reisetruhe bei 30/28 | Blaue Brosche und Jorins Brief |
| Gildenobergeschoss, Vase vase-2 | Randnotiz zum fehlenden Archivgang und Mara |
| Wohnhaus, Vase vase-2 | Glasperle |
| Schenke, Vase vase-1 | Messingknopf |
| Werkstatt, Beschlagkiste parts | Vier Gildenmünzen |
| Mühlenhaus, Getreidefass grain-a | Zwei Gildenmünzen |

Das sind acht belegte Fundstellen und vier neue eindeutige Notizen. Der normale Aushang und die bereits vorhandene feuchte Notiz bleiben erhalten.

Die Suchgeschichte beginnt am Gästetisch in der Schenke. Der Reisebericht im Marktlager führt zur südöstlichen Reisetruhe hinter dem Wohnhaus. Frau Moos erkennt die Brosche beim Ansprechen, nimmt sie zurück und bedankt sich mit acht Gildenmünzen. Der Journaleintrag wird als erledigt aktualisiert. Auch ein zufälliger Fund vor den Hinweisen bleibt lösbar; die Rückgabe erfolgt nur einmal.

Der Handwerker nimmt den Messingknopf für zwei Münzen, die Anglerin ihre Glasperle für eine Münze. Diese kleinen Tauschmöglichkeiten reagieren beim Ansprechen auf vorhandene Gegenstände, verbrauchen sie genau einmal und schaffen wieder Inventarplatz. Ohne Gegenstand bleiben die bisherigen Bewohnerdialoge erhalten. Die Dorfwege werden dadurch noch nicht freigegeben; die bestehende Wehr-Aufgabe ist unverändert.

## Umsetzung und Prüfung

Die Funddaten liegen in game/data/discoveries.js; bestehende geklonte Hausmöbel erhalten ihre Fundaktion dort zentral. game/systems/discoveries.js enthält Suche, erneutes Lesen, Rückgabe und die beiden kleinen Tauschmöglichkeiten. Die vorhandene Notizaktion und die neuen Fundstellen teilen rememberNote aus loot.js, damit Journalduplikate verhindert werden. Durchsuchte Objektansichten werden aus dem vorhandenen roomState.taken abgeleitet; die Original-Raumdaten werden beim Spielen nicht verändert.

45 Node-Tests sowie JS-/CSS- und Python-Strukturprüfungen bestanden. Die sechs neuen Tests prüfen die vollständige Hinweisfolge und Rückgabe mit regulären Wegen/A-Eingaben, einmalige Münzen und Tausche, vollen Rucksack ohne Verlust von Brosche/Brief, sichtbare durchsuchte Behälter nach Raumwechseln, acht erreichbare Fundstellen/vier Notizen sowie freie Fundreihenfolge und unabhängige Durchläufe. Die bestehenden Dorf-, Innenraum-, Tier-, Wehr- und Prototyp-Prüfungen bestehen weiterhin.

Alle Innenräume und der Dorfplan wurden erneut über die Canvas-Laufzeit gerendert. Geschlossene/geöffnete Reisetruhe, Funddialog, Tischzettel und durchsuchte Vase wurden visuell geprüft. Ein vollständiger Browser-/WebGL-Test war hier nicht verfügbar.

## Patch

Dieser Folgepatch setzt `BENTENDO_Tiere_Pflanzenueberlagerung_Patch.zip` voraus. Im bestehenden Projektordner entpacken und enthaltene Dateien ersetzen. Enthalten sind ausschließlich neue oder geänderte Dateien, keine Löschungen und keine neuen Asset-Downloads.
