# Publicacao da MH Facilities

Este projeto ja esta preparado para publicar o site institucional estatico da MH Facilities.

## Arquivos principais

- `frontend/index.html`: conteudo do site.
- `frontend/css/style.css`: visual responsivo.
- `frontend/js/app.js`: formulario que abre o WhatsApp com mensagem pronta.
- `../netlify.toml`: configuracao para publicar a pasta `mh-facilities/frontend` na Netlify.

## Antes de publicar

Revise estes dados no site:

- CNPJ, se quiser exibir.
- Endereco completo.
- WhatsApp.
- Redes sociais.
- Fotos reais da equipe, portaria, limpeza ou operacao.

## Subir para o GitHub

No terminal, dentro da pasta `src`, use:

```powershell
git status
git add mh-facilities/frontend/index.html mh-facilities/frontend/css/style.css mh-facilities/frontend/js/app.js mh-facilities/DEPLOY.md netlify.toml
git commit -m "Cria site institucional da MH Facilities"
git remote set-url origin https://github.com/SEU_USUARIO/mh-facilities-site.git
git push -u origin main
```

Troque `SEU_USUARIO` pelo seu usuario real do GitHub.

## Publicar na Netlify

1. Entre em https://app.netlify.com/.
2. Clique em "Add new site" e escolha "Import an existing project".
3. Conecte com o GitHub.
4. Escolha o repositorio da MH Facilities.
5. A Netlify deve ler o arquivo `netlify.toml` automaticamente.
6. Confirme que o diretorio de publicacao esta como `mh-facilities/frontend`.
7. Publique.

## Dominio

Depois que o site estiver online, conecte um dominio como:

- `mhfacilities.com.br`
- `mhfacilitiesseguranca.com.br`

O dominio pode ser comprado no Registro.br e apontado para a Netlify.
