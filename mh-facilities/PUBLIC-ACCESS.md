# Publicar o site para qualquer pessoa acessar

Para que qualquer pessoa de qualquer lugar acesse seu site, é preciso mais do que apenas o código. São necessárias configurações de rede e de domínio.

## Passos principais

### 1. Tenha um domínio real
Registre um domínio em um provedor de DNS. Por exemplo:
- `www.mhfacilities.com`

### 2. Aponte o domínio para o seu servidor
No painel do provedor de DNS, crie um registro A apontando para o IP público do seu servidor/roteador.
- `www` -> `SEU_IP_PÚBLICO`
- `@` -> `SEU_IP_PÚBLICO`

### 3. Configure NAT / redirecionamento de porta no roteador
Seu servidor provavelmente está atrás de um roteador. No roteador, faça:
- Porta externa `80` ou `443` encaminhada para o servidor local
- Endereço interno do servidor: `192.168.x.x` ou `10.x.x.x`
- Porta interna: `8080` (ou `80` se você alterar o backend)

### 4. Ajuste o firewall do servidor
Liberar entrada para:
- porta `80` e `443` para o acesso público via HTTPS
- porta `8080` apenas para o proxy reverso interno, se necessário

### 5. Configure o backend para aceitar conexões externas
No `application.yml`, confirme:
```yaml
server:
  address: 0.0.0.0
  port: 8080
```
Isso já está correto no seu projeto.

### 6. Use HTTPS (obrigatório para produção)
Para acesso público deve usar HTTPS.
- Configure um proxy reverso como Nginx ou Apache
- Ou use um serviço como Cloudflare
- Obtenha certificado SSL/TLS ou use um certificado válido

### 7. Atualize o frontend para apontar para o domínio público
No `frontend/js/app.js`, use:
```js
const apiUrl = '/auth/login';
```
O Nginx já fará o roteamento para o backend internamente.

## Exemplo de fluxo final
1. Usuário entra em `https://www.mhfacilities.com`
2. O navegador carrega o frontend
3. O frontend faz requisição ao backend em `/auth/login`

## Atenção à segurança
- Não publique credenciais sensíveis
- Use firewall para bloquear portas não usadas
- Se for acessar pela internet, valide entrada e saída no backend
- Considere usar HTTPS e autenticação real

## Resumo
Para liberar para qualquer pessoa:
1. registre um domínio real
2. aponte o DNS para seu IP público
3. configure port forwarding no roteador
4. libere a porta no firewall
5. mantenha o backend escutando em `0.0.0.0`
6. use HTTPS sempre que possível
