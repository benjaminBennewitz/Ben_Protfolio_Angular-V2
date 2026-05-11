## Server Starten - Fester Port für dev-mode
ng serve --port 4300


## Neu bauen + cache leeren, wichtig wenn eine lib geupdaded wurde
ng cache clean
rm -rf www .angular/cache
ng build --configuration production


## Doku
# tree.txt erstellen, Powershell Skript ausführen
# Powershell öffnen

powershell -NoProfile -ExecutionPolicy Bypass -File .\make-tree.ps1 -Depth 10 -Files -OutFile .\tree.txt