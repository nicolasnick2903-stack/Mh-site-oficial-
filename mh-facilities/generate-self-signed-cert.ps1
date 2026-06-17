$certDir = Join-Path $PSScriptRoot 'nginx\certs'
if (-not (Test-Path $certDir)) {
    New-Item -ItemType Directory -Path $certDir | Out-Null
}

function Get-OpenSslPath {
    $command = Get-Command openssl -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $candidates = @(
        'C:\Program Files\OpenSSL-Win64\bin\openssl.exe',
        'C:\Program Files\OpenSSL-Win32\bin\openssl.exe',
        'C:\Program Files\Git\mingw64\bin\openssl.exe',
        'C:\Program Files\Git\usr\bin\openssl.exe'
    )

    foreach ($candidate in $candidates) {
        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

$opensslExe = Get-OpenSslPath
if (-not $opensslExe) {
    Write-Error 'OpenSSL nao foi encontrado. Instale o OpenSSL e adicione-o ao PATH ou ajuste generate-self-signed-cert.ps1 com o caminho correto.'
    Write-Error 'No Windows, voce pode instalar com: winget install --id ShiningLight.OpenSSL.Light -e --accept-package-agreements --accept-source-agreements'
    exit 1
}

$opensslConfig = @"
[ req ]
default_bits        = 2048
prompt              = no
default_md          = sha256
distinguished_name  = dn
x509_extensions     = v3_req

[ dn ]
C = BR
ST = Sao Paulo
L = Sao Paulo
O = MH Facilities
OU = Desenvolvimento
CN = www.mhfacilities.com

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = www.mhfacilities.com
DNS.2 = mhfacilities.com
"@

$opensslCnF = Join-Path $certDir 'openssl.cnf'
$opensslConfig | Set-Content -Path $opensslCnF -Encoding UTF8

$fullchain = Join-Path $certDir 'fullchain.pem'
$privkey = Join-Path $certDir 'privkey.pem'

Write-Output "Usando OpenSSL: $opensslExe"
Write-Output 'Gerando certificados autoassinados...'

& $opensslExe req -x509 -nodes -days 365 `
  -newkey rsa:2048 `
  -keyout $privkey `
  -out $fullchain `
  -config $opensslCnF

Write-Output "Certificados gerados em: $certDir"
