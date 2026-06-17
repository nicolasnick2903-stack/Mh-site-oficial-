$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$entries = @(
    "127.0.0.1 www.mhfacilities.com",
    "127.0.0.1 mhfacilities.com"
)

if (-not (Test-Path $hostsPath)) {
    Write-Error "Arquivo de hosts não encontrado: $hostsPath"
    exit 1
}

$hostsContent = Get-Content $hostsPath -ErrorAction Stop
foreach ($entry in $entries) {
    if ($hostsContent -notcontains $entry) {
        Add-Content -Path $hostsPath -Value $entry
        Write-Output "Entrada adicionada ao arquivo hosts: $entry"
    } else {
        Write-Output "A entrada já existe no arquivo hosts: $entry"
    }
}

Write-Output "Agora abra https://www.mhfacilities.com no navegador."
