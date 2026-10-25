# Cartridge: Bedienung und Modell

Die Cartridge ist ein eigenes Objekt mit einem gemeinsamen Root-Drehpunkt an der unteren Mitte. Sie wird relativ zur zentrierten Gerätewurzel positioniert. Keine Geometrie wird mit dem Game Boy verschmolzen.

## Sofort nutzbares Web-Modell

Da der auf deinem Rechner erzeugte Cartridge-Export noch nicht als Datei vorliegt, erzeugt die Anwendung ein passendes, eigenständiges Three.js-Modell. Es besitzt abgerundete Kanten, Griffstruktur, Kontakte und dein unverändertes Cover. Alle Aktionen funktionieren damit bereits. Es ist kein heimlich eingebauter Ersatzexport aus Blender.

## Eigenen Blender-Export einsetzen

1. Den bisherigen beziehungsweise beiliegenden Generator in Blender ausführen.
2. Die erzeugte GLB nach assets/models/cartridge/dungeon-wanted.glb kopieren.
3. In scripts/core/config.js `cartridge: null` durch `cartridge: './assets/models/cartridge/dungeon-wanted.glb'` ersetzen.

Die GLB muss CARTRIDGE_ROOT enthalten und ihren Ursprung unten mittig haben. Das Cover sollte eingebettet sein. Der beiliegende Generator stellt dies her. Der Loader meldet einen fehlerhaften Export ausdrücklich, statt unbemerkt auf ein anderes Modell zu wechseln.

## Generator

scripts/blender/build_cartridge.py bleibt eigenständig und hat keine zusätzlichen Python-Abhängigkeiten außer Blender. Mit Alt+P starten. Findet Blender den Projektordner nicht, erscheint eine Coverauswahl. Ausgaben dann unter Cartridge_Output neben dem Cover; sonst assets/models/cartridge.

```sh
blender --background --python scripts/blender/build_cartridge.py -- --render
```

Der Generator enthält alle bisherigen Pfad-, Shader-, Kamera- und Lichtkorrekturen. Funktionen sind nun ebenfalls höchstens 20 Zeilen lang. Die Umstrukturierung ist auf Syntax und Struktur geprüft; Blender selbst ist in dieser Umgebung nicht installiert.

## Zustände

| Zustand | Root relativ zum Geräte-Root, Meter | Aktionen |
| --- | --- | --- |
| Zu drei Vierteln eingesetzt | 0 / automatisch zu ¾ / -0,0152 | hineindrücken, betrachten |
| Eingerastet | 0 / automatisch bündig / -0,0152 | einschalten, betrachten |
| Betrachten | 0 / 0,004 / -0,12 | umdrehen, pusten, zurück in Schacht |

Die zu drei Vierteln eingesetzte Ausgangsposition liegt über der oberen Geräteöffnung. Die Frontkamera zeigt nur den LCD-Ausschnitt; erst Ober- beziehungsweise Rückansicht machen das Modul sichtbar. Die Rückansicht ist vollständig eingerahmt.

Kontaktfehler frühestens nach einem erfolgreichen Start, maximal einmal pro Sitzung. Herausnehmen schaltet aus. Pusten reinigt die Kontakte. Abschalten der Gimmicks beseitigt einen Kontaktfehler; zum Neustart Power aus- und einschalten.

## Navigation und Betrachtung

Der dunkelgraue Displayrahmen wird als projiziertes Vieleck aus dem tatsächlichen Display_Bezel ermittelt. Betritt die Maus diese Fläche aus der Ober- oder Seitenansicht, kehrt die Front zurück. Eine laufende Reglergeste bleibt geschützt.

Die Rückansicht beginnt mit einer neuen Hover-Absicht: Kleine Bewegungen am alten Aktivierungspunkt lösen keinen Ausstieg aus. Nach Eintritt in die Gehäuserückseite oder einer deutlichen Bewegung ist das Verlassen nach links, rechts oder oben möglich. Das Bedienfeld liegt rechts; sein Verbindungsbereich zum Gehäuse hält die Aktionen erreichbar. Touch-Wischgesten, Fronttaste und Escape bleiben verfügbar.

„Betrachten“ bewegt nur das Modul nach vorn und vergrößert dessen Darstellungsmaßstab. Die orthografische Gerätekamera wird nicht mehr herangezoomt. Die Cartridge bleibt drehbar und kann durchgepustet werden. Beim Verlassen wird der vorherige Sitz wiederhergestellt; das Gerät bleibt ausgeschaltet.

Die Einsetztiefe wird beim Laden aus den tatsächlichen Modell- und Gehäusegrenzen bestimmt. Die Moduloberkante liegt bündig mit einem Sicherheitsabstand von 0,1 mm unter der Gehäuseoberkante. Dadurch funktionieren auch Exporte mit abweichender Modulhöhe ohne hart codierten Y-Versatz. Ein erneuter Modellbau ist nicht nötig.

### LCD und Schachtkante

- Debug → LCD-Rauschen erzwingt den Kontaktfehler sofort, unabhängig vom Zufall.
- Beim Ausschalten bleibt das zuletzt gezeichnete Bild 1,4 Sekunden als verblassendes Restbild mit schwachen Zeilenartefakten erhalten. Bewegungsreduktion verkürzt das Ausblenden auf 0,35 Sekunden ohne Zusatzartefakte.
- Die fehlende untere Schachtwand wird als `Cartridge_Pocket_Lip` am Handheld ergänzt. Sie verdeckt den unteren Modulrand räumlich; der Blender-Export bleibt verwendbar.
- In der Rückansicht löst der gesamte Bereich rechts vom Gehäuse keinen automatischen Ansichtswechsel aus. Links, oben, unten und der Zurück-Button bleiben verfügbar.
