# HTTPS para o projeto MH Facilities

Esta configuração adiciona HTTPS ao Nginx e ao Docker para servir o site com segurança.

## O que foi criado

- `docker-compose.yml`
  - expõe também a porta `443`
  - monta `./nginx/certs` no container Nginx
- `nginx/default.conf`
  - redireciona `http` para `https`
  - serve a aplicação no `https://www.mhfacilities.com`
- `generate-self-signed-cert.sh`
  - gera `fullchain.pem` e `privkey.pem` para os domínios locais
- `generate-self-signed-cert.ps1`
  - versão para Windows PowerShell

## Passo a passo

### 1. Gere os certificados
No Linux/macOS:
```bash
cd "c:/Users/Nicolas/Desktop/APP novo/src/mh-facilities"
./generate-self-signed-cert.sh
```

No Windows PowerShell:
```powershell
cd "C:\Users\Nicolas\Desktop\APP novo\src\mh-facilities"
.\generate-self-signed-cert.ps1
```

Se receber o erro `openssl não é reconhecido`, o script Windows já tenta usar caminhos comuns do OpenSSL. Você também pode instalar o OpenSSL com:
```powershell
winget install --id ShiningLight.OpenSSL.Light -e --accept-package-agreements --accept-source-agreements
```

### 2. Execute o Docker Compose
```powershell
docker compose up --build
```

### 3. Abra no navegador
- `https://www.mhfacilities.com`

### 4. Hosts local
Em todas as máquinas que quiser acessar, adicione ao `hosts`:

```
127.0.0.1 www.mhfacilities.com
127.0.0.1 mhfacilities.com
```

Se for em outra máquina na rede, troque `127.0.0.1` pelo IP do servidor.

### 5. Aviso
O certificado gerado é autoassinado.
O navegador pode mostrar aviso de segurança e será necessário aceitar o certificado manualmente.

## Observação para produção
Para uso real na internet, substitua os certificados autoassinados por um certificado válido de uma autoridade certificadora.
