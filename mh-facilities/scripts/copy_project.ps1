<#
Copy Project Script
Usage example (PowerShell):
  .\copy_project.ps1 -Target "C:\Users\Nicolas\Desktop\mh-facilities-app"

This script copies the `src/mh-facilities` folder to a target location.
#>
param(
    [string]$Target = "$env:USERPROFILE\Desktop\mh-facilities-app"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Assume script is in src/mh-facilities/scripts; repo root is two levels up
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..").Path
$source = Join-Path $repoRoot "src\mh-facilities"

Write-Host "Source: $source"
Write-Host "Target: $Target"

if (-not (Test-Path $source)) {
    Write-Error "Source folder not found: $source"
    exit 1
}

if (Test-Path $Target) {
    $answer = Read-Host "Target exists. Overwrite? (Y/N)"
    if ($answer -ne 'Y' -and $answer -ne 'y') {
        Write-Host "Aborting. No changes made."
        exit 0
    }
    Remove-Item $Target -Recurse -Force
}

Write-Host "Copying..."
Copy-Item -Path $source -Destination $Target -Recurse -Force
Write-Host "Copy complete."
Write-Host "Next steps: open the copy and run the packaging/build steps (see README_APP.md)."