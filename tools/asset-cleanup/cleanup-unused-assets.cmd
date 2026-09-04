@echo off
setlocal EnableExtensions

cd /d "%~dp0..\.."

if not exist "src\assets" (
  echo [FEHLER] src\assets wurde nicht gefunden.
  echo Lege dieses Skript in einen Unterordner des Projektroots oder fuehre die Loeschungen manuell aus.
  exit /b 1
)

echo === B2 Portfolio: ungenutzte Assets entfernen ===
echo.
echo Es werden ausschliesslich die im Asset-Audit bestaetigten Dateien geloescht.
echo.

call :delete "src\assets\fonts\inter-variable.ttf"
call :delete "src\assets\fonts\jetbrains-mono-variable.ttf"
call :delete "src\assets\images\brain_rotation.gif"
call :delete "src\assets\images\hero-brain-halftone.webp"
call :delete "src\assets\scripts\scroll-restoration.js"

call :delete "src\assets\images\project-stack\dont-click-that.webp"
call :delete "src\assets\images\project-stack\peace-cyan.webp"
call :delete "src\assets\images\project-stack\hide-girl-pink.webp"
call :delete "src\assets\images\project-stack\messy-batch.webp"
call :delete "src\assets\images\project-stack\bomb-pink.webp"
call :delete "src\assets\images\project-stack\trust-not-found.webp"

call :delete "src\assets\images\project-stack\project_2\pj2_1up.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_chest.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_coin.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_door.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_flag.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_heart.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_key.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_lock.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_potion.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_ring.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_spikes.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_spring.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_square.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_star.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_triangle.webp"
call :delete "src\assets\images\project-stack\project_2\pj2_x.webp"

call :delete "src\assets\images\projects\pepes-adventure\desert-hero-bg.webp"

call :delete "src\assets\images\projects\carly-managed\carly-head.webp"
call :delete "src\assets\images\projects\carly-managed\screens\board.webp"
call :delete "src\assets\images\projects\carly-managed\screens\dashboard.webp"
call :delete "src\assets\images\projects\carly-managed\screens\settings.webp"
call :delete "src\assets\images\projects\carly-managed\storybook\carly-story-01.webp"
call :delete "src\assets\images\projects\carly-managed\storybook\carly-story-02.webp"
call :delete "src\assets\images\projects\carly-managed\storybook\carly-story-03.webp"
call :delete "src\assets\images\projects\carly-managed\storybook\carly-story-04.webp"

call :delete "src\assets\images\projects\design-catalog\catalog-page-01.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-assets.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-color-look.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-cover.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-retouch.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-spread.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-texture.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-typography.webp"
call :delete "src\assets\images\projects\design-catalog\gallery-vector.webp"

for %%D in (
  "src\assets\images\project-stack\project_2"
  "src\assets\images\projects\pepes-adventure"
  "src\assets\images\projects\carly-managed\storybook"
  "src\assets\scripts"
) do (
  if exist "%%~D" rd "%%~D" 2>nul
)

echo.
echo === Fertig ===
echo Bitte jetzt ausfuehren:
echo   npm run build:production
echo   git status
exit /b 0

:delete
if exist "%~1" (
  echo [DELETE] %~1
  del /q "%~1"
) else (
  echo [SKIP]   %~1
)
exit /b 0
