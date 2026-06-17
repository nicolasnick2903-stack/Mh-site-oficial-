Transformar o projeto em um "app" (guia rápido)

1) Copiar o projeto para uma pasta nova

- No PowerShell (execute a partir de `src/mh-facilities/scripts`):

```powershell
./copy_project.ps1 -Target "C:\Users\Nicolas\Desktop\mh-facilities-app"
```

2) Fazer build do backend (Java/Spring Boot)

- Se o projeto usar Maven e tiver `pom.xml` no diretório raiz do backend, rode:

```powershell
cd C:\Users\Nicolas\Desktop\mh-facilities-app
mvn -DskipTests package
```

- O JAR executável normalmente ficará em `target/` e pode ser executado com:

```powershell
java -jar target\nome-do-seu-app.jar
```

3) Servir o frontend

- Opção A (integrar ao backend): copiar os ativos estáticos (`frontend/`) para `src/main/resources/static` antes de empacotar o backend; o Spring Boot servirá o frontend automaticamente.
- Opção B (app desktop com Electron): criar uma pequena shell Electron que carrega os arquivos estáticos ou acessa a API local.

4) Launcher simples (Windows)

- Você pode criar um `run-app.ps1` na pasta do app que: inicia o backend (JAR) em background e abre o navegador apontando para `http://localhost:8080`.

Exemplo de conteúdo para `run-app.ps1`:

```powershell
Start-Process -FilePath "java" -ArgumentList "-jar", "target\nome-do-seu-app.jar"
Start-Sleep -Seconds 3
Start-Process "http://localhost:8080"
```

5) Empacotar como app desktop

- Electron: use `electron-packager` ou `electron-builder` para criar executáveis Windows/macOS/Linux. Você precisará de um `package.json` e de um `main` que aponte para os arquivos estáticos e inicie uma janela.
- Alternativa: criar um instalador que inclua o JRE e o JAR do backend, e um atalho que execute `run-app.ps1`.

Se quiser, eu posso:
- executar a cópia agora para uma pasta que você escolher; ou
- criar o `run-app.ps1` automaticamente; ou
- iniciar a preparação de um `package.json` e de um esqueleto Electron para empacotar como app desktop.

Diga qual opção prefere que eu prossiga e eu implemento os próximos passos automaticamente.
