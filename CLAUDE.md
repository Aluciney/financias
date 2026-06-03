# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este repositório

Monorepo do **Financias**, app de acompanhamento de FIIs (fundos imobiliários). Dois projetos independentes (cada um com seu `package.json`):

- **`financias-backend/`** — API REST que faz scraping do StatusInvest e persiste as FIIs cadastradas.
- **`financias-web/`** — frontend (dashboard) que consome a API.

O fluxo central: o frontend lista FIIs ordenadas pela melhor opção de retorno (DY anual), permite cadastrar novos tickers e disparar a atualização (re-scraping) de todas. O backend busca cotação/provento no StatusInvest, calcula o dividend yield e guarda em SQLite.

> `.claude/skills/criar-backend` e `.claude/skills/criar-frontend` são **skills** que definem o padrão de arquitetura seguido pelos dois projetos — consulte-as ao adicionar módulos/componentes. Elas não fazem parte da aplicação.

## Comandos

Backend (`cd financias-backend`):
- `npm run dev` — sobe a API com hot-reload (`tsx watch`) na porta 3000 (Swagger em `/docs`).
- `npm run build` / `npm start` — build com tsup / roda o `dist`.
- `npm test` — Jest. Um arquivo: `npx jest src/modules/fiis/fiis.spec.ts`. Por nome: `npx jest -t "<trecho>"`.
- `npx tsc --noEmit` — checagem de tipos (rode após editar).

Frontend (`cd financias-web`):
- `npm run dev` — Vite (porta 5173, ou a próxima livre).
- `npm run build` — `tsc -b && vite build`. `npm run lint` — ESLint.
- `npx tsc -b` — checagem de tipos.

O frontend espera a API em `http://localhost:3000/api` (override por `VITE_API_URL`). **Suba o backend antes** para o dashboard ter dados.

## Arquitetura do backend

Padrão da skill `criar-backend`, **adaptado para SQLite** (não usa o oracledb default do template). Stack: Fastify 5 + fastify-type-provider-zod + Zod 4 + Knex + **better-sqlite3**. Sem auth/JWT.

Fluxo de uma requisição (camadas): `routes (schema Zod) → controller → service → DAO → Knex`.

- **`src/app.ts`** — classe `App`: ordem fixa de setup (compilers Zod → segurança helmet/rate-limit → plugins → hook de semáforo de concorrência → swagger → rotas sob `/api`).
- **`src/router.ts`** — registra os `*Routes` de cada módulo.
- **Conexão com o banco desce pelo controller:** o controller passa `request.server.trx` (instância `Knex` decorada pelo `database.plugin`) como **primeiro argumento** ao service; o service repassa `{ trx }` ao DAO. Use o tipo `Knex` (não `Knex.Transaction`).
- **`src/database/migrations/`** — migrations Knex; **rodam automaticamente no boot** dentro do `database.plugin` (`trx.migrate.latest()`). Não há comando manual de migração.
- **`src/libs/statusInvest.ts`** — scraping (axios + cheerio + iconv-lite/latin1). Calcula `dyMensal` e `dyAnual` a partir de `provento / cotação`. É a fonte de toda a coluna de "retorno"; ordenação por melhor opção = `dy_anual desc` no DAO. `getTipoFII` consulta a busca (`/home/mainsearchquery`) para descobrir o **caminho correto** da página conforme o tipo do ativo (FII `/fundos-imobiliarios/`, Fiagro `/fiagros/`, ação `/acoes/`, etc.) — `getFiiDataStatusInvest` usa esse caminho em vez de assumir `/fundos-imobiliarios/`, então funciona para Fiagros/FI-Infra e demais tipos.
- **Tipagem dirigida por schema:** cada `*.schema.ts` exporta um objeto terminando em `satisfies ModuleSchema` (com `Body?/Query?/Params?` + `Response` chaveado por status HTTP) e deriva os tipos via `InferModuleSchema`. `ModuleSchema`/`InferModuleSchema` são **globais** (`src/@types/moduleSchema.d.ts`), sem import.
- **Erros de negócio** usam `@fastify/error` (`createError`) com status (ex.: 400/404); o `error-handler.plugin` formata a resposta.
- Único módulo hoje: **`fiis`** (`src/modules/fiis/`). Endpoints `/api/fiis`: `GET /` (listar ordenado, lista completa — usado por gráficos/cards do front), `GET /paginado?page&perPage` (paginação **no banco** via `knex-paginate` `.paginate(...)`, retorna `{data, total, perPage, currentPage, lastPage}` — usado pela tabela), `POST /` (cadastrar `{ticker}` → scrape+insert), `POST /atualizar` (re-scrape de todas, retorna `{atualizadas, falhas, fiis}`), `DELETE /:id`.

Aliases obrigatórios em todo import: `@/*` → `src/*`, `@root/*` → raiz. Estilo: **TAB, sem `;`, aspas simples** (Biome, lineWidth 200).

## Arquitetura do frontend

Padrão da skill `criar-frontend`. Vite + React + TS + **Tailwind v4** (via `@tailwindcss/vite`, importado em `src/index.css` com `@import "tailwindcss"`). **Tema dark** (paleta `zinc`/`violet`/`emerald`). Roteamento com `react-router` (`createBrowserRouter` em `src/routes/index.ts`, propriedade `Component`): `AppLayout` (navbar + `<Outlet/>`, fornece o fundo dark) envolve as páginas — `Dashboard` (index `/`) e `Simulador` (`/simulador`).

- Dados: `src/services/api.ts` (axios) + `src/services/fiis.ts` (chamadas) + `src/services/format.ts` (moeda/percentual/número pt-BR).
- Estado: `src/hooks/useFiis.tsx` centraliza a **lista completa** (gráficos + cards) e as ações (carregar/cadastrar/atualizarTodas/remover); mantém a ordenação por `dyAnual` no cliente após cadastro. `src/hooks/useFiisPaginadas.tsx` controla a **tabela paginada no banco** (página/total/lastPage + `recarregar`). No Dashboard as duas fontes coexistem: mutações chamam as ações do `useFiis` (atualiza gráficos/cards) **e** `tabela.recarregar()` (refaz a página atual). Cada página refaz o fetch ao montar.
- UI: `src/pages/Dashboard/` compõe `StatCard`, `RankingChart` (barras) e `RetornoPie` (pizza) — ambos **recharts** — `AddFiiForm` (react-hook-form + zod) e `FiiTable`. `src/pages/Simulador/` calcula, a partir de uma renda mensal alvo, cotas necessárias e investimento por FII (`cotas = ceil(alvo / dividendo)`), ordenado pelo menor investimento.
- Tipo `Fii` é **global** em `src/@types/index.d.ts` (sem import).

Convenção de arquivos: componente em `src/components/{Nome}/index.tsx` com tipos em `types.ts`; página em `src/pages/{Nome}/index.tsx`. Estilo: **aspas simples, sem `;`** (ESLint + `@stylistic`, fix on save).

## Notas

- `recharts` é a única dependência fora do conjunto padrão da skill de frontend (adicionada para os gráficos).
- Ao criar o frontend, **não use `create-vite@latest` (v8)** — ele ignora `--template react-ts` e gera um template vanilla. Use `npx --yes create-vite@7`.
- O scraping depende do StatusInvest estar acessível; tickers que não aparecem na busca (`mainsearchquery`) lançam "Ativo não encontrado" e o cadastro falha com 404. SNAG11 é um Fiagro válido (`/fiagros/snag11`) e funciona — o que antes falhava era a URL fixa em `/fundos-imobiliarios/`, agora resolvida via `getTipoFII`.
