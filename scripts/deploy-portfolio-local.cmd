@REM scripts/deploy-portfolio-local.cmd
@echo off
setlocal EnableExtensions

REM Baut das Portfolio lokal reproduzierbar und deployed ausschliesslich den fertigen
REM Angular-Browser-Build auf den vorbereiteten KeyHelp-Webspace von b2folio.de.
REM Voraussetzung: OpenSSH-Client, scp, ssh, tar, Node/npm und Git sind lokal verfuegbar.
REM Wichtig: npm ist unter Windows eine CMD-Datei und muss in Batch-Scripten mit CALL gestartet werden.

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%.."
set "BUILD_DIR=%PROJECT_DIR%\dist\ben-portfolio-experience\browser"
set "ARCHIVE=%TEMP%\portfolio-frontend.tar.gz"

REM Rechnerabhaengiger SSH-Key. Prioritaet:
REM   1. B2FOLIO_SSH_KEY (projektspezifisch)
REM   2. DCR_SSH_KEY     (bereits funktionierender Server-Key)
REM   3. Windows-Standard-Key id_ed25519
if defined B2FOLIO_SSH_KEY (
  set "SSH_KEY=%B2FOLIO_SSH_KEY%"
) else if defined DCR_SSH_KEY (
  set "SSH_KEY=%DCR_SSH_KEY%"
) else (
  set "SSH_KEY=%USERPROFILE%\.ssh\id_ed25519"
)

set "SERVER_USER=ben"
set "SERVER_HOST=159.195.54.12"
set "SERVER_ARCHIVE=/tmp/portfolio-frontend.tar.gz"
set "SERVER_DEPLOY=/usr/local/bin/deploy-portfolio-frontend"

cd /d "%PROJECT_DIR%" || exit /b 1

if not exist "%SSH_KEY%" (
  echo.
  echo [B2FOLIO][FEHLER] SSH-Key wurde nicht gefunden: %SSH_KEY%
  echo [B2FOLIO][HINWEIS] Setze optional B2FOLIO_SSH_KEY auf den passenden privaten Key.
  exit /b 1
)

echo.
echo [B2FOLIO] SSH-Key: %SSH_KEY%

where git >nul 2>&1 || (
  echo [B2FOLIO][FEHLER] git wurde nicht gefunden.
  exit /b 1
)

where npm >nul 2>&1 || (
  echo [B2FOLIO][FEHLER] npm wurde nicht gefunden.
  exit /b 1
)

where tar >nul 2>&1 || (
  echo [B2FOLIO][FEHLER] tar wurde nicht gefunden.
  exit /b 1
)

where scp >nul 2>&1 || (
  echo [B2FOLIO][FEHLER] scp wurde nicht gefunden.
  exit /b 1
)

where ssh >nul 2>&1 || (
  echo [B2FOLIO][FEHLER] ssh wurde nicht gefunden.
  exit /b 1
)

set "GIT_DIRTY="
for /f "delims=" %%I in ('git status --porcelain') do set "GIT_DIRTY=1"

if defined GIT_DIRTY (
  echo [B2FOLIO][FEHLER] Git-Working-Tree ist nicht sauber. Deployment abgebrochen.
  git status --short
  exit /b 1
)

echo.
echo [B2FOLIO] Repository aktualisieren...
git pull --ff-only || exit /b 1

echo.
echo [B2FOLIO] Abhaengigkeiten reproduzierbar installieren...
call npm ci || exit /b 1

echo.
echo [B2FOLIO] Production-Build erstellen...
call npm run build:production || exit /b 1

if not exist "%BUILD_DIR%\index.html" (
  echo [B2FOLIO][FEHLER] Build unvollstaendig: %BUILD_DIR%\index.html fehlt.
  exit /b 1
)

if not exist "%BUILD_DIR%\.htaccess" (
  echo [B2FOLIO][FEHLER] Build unvollstaendig: %BUILD_DIR%\.htaccess fehlt.
  exit /b 1
)

if not exist "%BUILD_DIR%\robots.txt" (
  echo [B2FOLIO][FEHLER] Build unvollstaendig: %BUILD_DIR%\robots.txt fehlt.
  exit /b 1
)

if not exist "%BUILD_DIR%\sitemap.xml" (
  echo [B2FOLIO][FEHLER] Build unvollstaendig: %BUILD_DIR%\sitemap.xml fehlt.
  exit /b 1
)

if not exist "%BUILD_DIR%\design-studies\brutalism\index.html" (
  echo [B2FOLIO][FEHLER] Build unvollstaendig: RAW/FORM Design Study fehlt.
  exit /b 1
)

if exist "%ARCHIVE%" del /f /q "%ARCHIVE%"

echo.
echo [B2FOLIO] Build archivieren...
tar -czf "%ARCHIVE%" -C "%BUILD_DIR%" . || exit /b 1

echo.
echo [B2FOLIO] Build auf den Server laden...
scp -i "%SSH_KEY%" "%ARCHIVE%" %SERVER_USER%@%SERVER_HOST%:%SERVER_ARCHIVE% || exit /b 1

echo.
echo [B2FOLIO] Serverseitiges Deployment starten...
ssh -t -i "%SSH_KEY%" %SERVER_USER%@%SERVER_HOST% "sudo %SERVER_DEPLOY% %SERVER_ARCHIVE%" || exit /b 1

if exist "%ARCHIVE%" del /f /q "%ARCHIVE%"

echo.
echo [B2FOLIO] Deployment abgeschlossen: https://b2folio.de/
endlocal
