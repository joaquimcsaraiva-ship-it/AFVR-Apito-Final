# AFVR Resultados

Aplicação web para consultar competições, calendários, jogos, resultados e classificações de futebol e futsal. As alterações administrativas exigem sessão de administrador.

## Estado da primeira versão

Verificação feita em 12/11/2026 nesta instalação: 33 competições registadas, 31 com jogos e 1716 jogos guardados antes da sincronização mais recente. A sincronização automática implementada consulta o Centro de Resultados da FPF; também existe introdução manual e importação de ficheiros. Confirma os dados de cada competição antes de os divulgar como oficiais.

## Executar localmente no Windows

Requisitos: Node.js 20 ou superior e PostgreSQL acessível com as credenciais configuradas no `.env`.

```powershell
Set-Location 'C:\Users\joaqu\OneDrive\Documentos\Codex\afvr-resultados'
npm install
npm run db:init
npm run build
$env:PORT = '5012'
npm start
```

Quando `DATABASE_URL` está vazio, a aplicação usa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. Mantém o `.env` privado; está excluído pelo `.gitignore`.

Verificação local: abre `http://localhost:5012/`. `/health` confirma que a aplicação está ativa; `/ready` confirma também a ligação à base de dados.

## Supabase e Render

A aplicação aceita `DATABASE_URL` para uma base PostgreSQL alojada e exige TLS com validação do certificado nesse modo. Se `DATABASE_URL` estiver vazio, continua a usar a configuração local `DB_*`.

Preparação sugerida:

1. Cria um projeto Supabase e, em **Connect**, escolhe o **Session pooler** para obter a URI completa. Usa a URI fornecida pelo painel; não publiques nem partilhes a palavra-passe da base de dados.
2. Cria um serviço Node no Render usando o `render.yaml` deste projeto. O serviço compila com `npm ci && npm run build`, inicia com `npm start` e verifica a disponibilidade em `/ready`.
3. No Render, fornece os valores privados de `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `AUTH_TOKEN_SECRET`. Não coloques estes valores no repositório nem no `render.yaml`.
4. Inicializa as tabelas no projeto Supabase executando os ficheiros `database/001-create-competitions.sql`, `database/002-results-and-fpf.sql` e `database/003-match-groups.sql`, por esta ordem, no SQL Editor do Supabase.
5. Para transferir os dados desta instalação, instala as ferramentas PostgreSQL e executa `pg_dump` para exportar apenas os dados locais. O comando pede a palavra-passe local sem a colocar no histórico:

```powershell
pg_dump --host localhost --port 5432 --username postgres --dbname afvr_resultados --data-only --format=custom --no-owner --no-privileges --password --file .\afvr-dados.dump
```

Depois restaura no projeto Supabase vazio. Substitui o host e o utilizador pelos valores apresentados em **Connect → Session pooler**; o comando pede a palavra-passe Supabase:

```powershell
pg_restore --host "<host do Session pooler>" --port 5432 --username "<utilizador do Session pooler>" --dbname postgres --data-only --no-owner --no-privileges --password .\afvr-dados.dump
```

O dump inclui os dados e contadores das sequências. Não restaures sobre tabelas já preenchidas; isso pode duplicar registos. Guarda o ficheiro fora do repositório e elimina-o quando a transferência estiver confirmada.

O Render Free suspende serviços web após 15 minutos sem tráfego. O Supabase Free inclui 500 MB e pode pausar o projeto após uma semana de pouca atividade. Estes planos servem para uma primeira publicação de baixo tráfego e não oferecem disponibilidade ou cópias de segurança garantidas. Consulta as [limitações do Render Free](https://render.com/docs/free) e o [plano gratuito do Supabase](https://supabase.com/pricing).

O diretório atual ainda não está ligado a um repositório Git. Para o Render publicar automaticamente a partir do código, será necessário colocar o projeto num repositório e ligá-lo ao serviço. Antes de publicar, confirma que `.env` permanece ignorado e não incluído no repositório.

## Acesso online temporário desta instalação

O endereço atual é [AFVR Resultados](https://concluded-every-exist-associates.trycloudflare.com). Este túnel gratuito depende do computador, da aplicação e do `cloudflared` estarem ligados; o endereço pode mudar se o túnel for reiniciado. É adequado para demonstrações, não como alojamento permanente.

## Verificações

```powershell
npm run typecheck
npm run build
npm test -- --runInBand
```

As leituras de competições, jogos e classificações são públicas. A criação, edição, sincronização e importação exigem a sessão de administrador da aplicação.