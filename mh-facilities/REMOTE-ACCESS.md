# Acesso em outras máquinas

## Objetivo
Fazer com que o backend e o domínio local `www.mhfacilities.com` funcionem em outros computadores da mesma rede.

## O que já está pronto
- O backend está configurado para escutar em todas as interfaces:
  - `server.address: 0.0.0.0`
- O frontend envia requisições para:
  - `/auth/login`

## O que é necessário em outras máquinas
### 1. Acesso ao servidor pela rede
O computador que está rodando o backend precisa ter um IP de rede acessível.
Por exemplo:
- `192.168.1.50`

### 2. Permitir porta 443 no Firewall
No computador servidor, permita conexões de entrada na porta `443`.

### 3. Configurar DNS local ou arquivo hosts nas outras máquinas
Você precisa mapear `www.mhfacilities.com` para o IP do servidor.
No Windows, adicione estas linhas em `C:\Windows\System32\drivers\etc\hosts` nas outras máquinas:

```
192.168.1.50 www.mhfacilities.com
192.168.1.50 mhfacilities.com
```

### 4. Abrir no navegador das outras máquinas
Use:

```
https://www.mhfacilities.com
```

## Se quiser funcionar fora da rede local
Para acessar a partir da Internet, você precisa:
- registrar um domínio real (`www.mhfacilities.com`) em um provedor DNS
- apontar o domínio para o IP público do seu roteador
- configurar NAT / port forwarding para encaminhar a porta `8080` ao servidor interno
- garantir que o Firewall permita o acesso externo

## Alternativa mais simples (rede interna)
Se não quiser usar `www.mhfacilities.com` em todos os computadores, use diretamente o IP do servidor:

```
http://192.168.1.50:8080
```

Isso funciona sem alterar o arquivo `hosts`, mas só em máquinas na mesma rede.

## Resumo
- `www.mhfacilities.com` pode funcionar em outras máquinas se elas tiverem o `hosts` configurado ou se houver DNS local.
- Outro requisito é que o servidor esteja acessível na rede e a porta `8080` esteja liberada.
