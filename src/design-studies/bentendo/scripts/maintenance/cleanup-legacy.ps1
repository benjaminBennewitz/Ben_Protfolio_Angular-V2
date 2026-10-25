<#
.SYNOPSIS
Entfernt ausschließlich dokumentierte Altdaten nach dem Einspielen des Refactors.
.DESCRIPTION
Sichert vorhandene Altdaten in einem benachbarten Ordner. Tilesets und Musik bleiben erhalten.
#>
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$manifest = Join-Path $projectRoot 'docs/deleted-files.json'
$entries = Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json
$backup = Join-Path (Split-Path $projectRoot -Parent) ('b2boy-legacy-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))

function Remove-LegacyFile {
    <#
    .SYNOPSIS
    Sichert und entfernt eine einzelne bekannte Altdatei.
    .PARAMETER RelativePath
    Projektbezogener Dateipfad aus dem Manifest.
    #>
    param([string]$RelativePath)
    $source = Join-Path $projectRoot $RelativePath
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { return }
    $target = Join-Path $backup $RelativePath
    New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $target
    Remove-Item -LiteralPath $source
}

foreach ($entry in $entries) { Remove-LegacyFile -RelativePath $entry }
$oldModelDirectory = Join-Path $projectRoot '3d/B2_Gameboy_Output'
foreach ($directory in @($oldModelDirectory, (Join-Path $projectRoot '3d'))) {
    if ((Test-Path -LiteralPath $directory) -and -not (Get-ChildItem -LiteralPath $directory -Force)) {
        Remove-Item -LiteralPath $directory
    }
}
Write-Host 'Altdaten aufgeraeumt. Tilesets und Musik wurden nicht veraendert.'
if (Test-Path -LiteralPath $backup) { Write-Host ('Sicherung: ' + $backup) }
