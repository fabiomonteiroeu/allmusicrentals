---
phase: 17-deploy
plan: 02
subsystem: infra
tags: [github-actions, ghcr, easypanel, deploy-pipeline]
status: task-1-escrita-nao-verificada — task-2-pendente-100-manual

requires:
  - phase: 17-deploy (17-01)
    provides: next.config.ts/Dockerfile parametrizados (ARG NEXT_PUBLIC_*), ADR-005, docs/DEPLOY.md
provides:
  - .github/workflows/deploy.yml — pipeline completo (checks, build, verifica-segredo, push GHCR, redeploy EasyPanel)
affects: [17-03, 17-04]

key-decisions:
  - 'Task 1 (workflow) escrita replicando exatamente o padrão de .github/workflows/ci.yml (mesmos passos de checkout/setup-node/npm ci/typecheck/lint/format/test/build), com verifica:bundle-segredo inserido no caminho crítico do deploy — fecha o risco "não está no CI" registrado em STATE.md, agora no pipeline de deploy especificamente (o ci.yml de PR não foi alterado neste plano).'
  - 'Task 2 é 100% ação humana fora do meu alcance nesta sessão: criar DNS, gerar PAT do GitHub, criar os 3 serviços no EasyPanel (Postgres, cms, web), gerar os 6 segredos do Strapi, cadastrar os 3 GitHub Secrets, disparar o primeiro deploy e confirmar HTTPS + WordPress intacto. Nada disso foi feito.'
  - 'Não rodei o workflow nem posso: não tenho acesso ao GitHub Actions deste repositório nem às credenciais. A verificação automatizada listada no plano (`test -f`, greps) foi checada por inspeção de texto do arquivo, mas o workflow em si nunca foi executado.'

requirements-completed: []
requirements-pending: [DEP-01, DEP-03, DEP-04, DEP-05]

completed: 2026-08-20 (parcial — só Task 1)
---

# Fase 17 — Plano 02: Pipeline GitHub Actions → GHCR → EasyPanel (fechamento parcial — Task 2 é 100% manual)

## O que foi feito

`.github/workflows/deploy.yml`: dispara em push para `main` e por `workflow_dispatch`; roda os mesmos checks do `ci.yml` (typecheck, lint, format:check, test, build) mais `npm run verifica:bundle-segredo` logo após o build; builda e publica duas imagens no GHCR (`web` com os dois build-args `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_STRAPI_MEDIA_URL` resolvidos de `secrets.DOMINIO`, `cms` sem build-args); dispara os dois webhooks de redeploy do EasyPanel via `curl -X POST`, um depois do outro, sem `if` (falha no primeiro interrompe antes do segundo). Nenhum domínio literal, nenhum `docker compose`, `permissions` explícito (`contents: read`, `packages: write`).

## Verification (por inspeção — não executado)

| Critério | Resultado |
| --- | --- |
| `packages: write` presente | Sim |
| `verifica-segredo-no-bundle` presente e depois de `npm run build` | Sim |
| `secrets.DOMINIO` presente | Sim |
| `ghcr.io` aparece ≥2 vezes | Sim (5 ocorrências — 2 tags cada imagem + o registry do login) |
| `EASYPANEL_DEPLOY_HOOK_WEB` e `_CMS` presentes | Sim |
| Nenhum literal `allmusicbr.com` | Confirmado — só `secrets.DOMINIO` |
| String `docker compose` ausente | Confirmado (corrigido um comentário que continha o literal, sem mudar o comportamento) |
| Execução real do workflow no GitHub Actions | **NÃO EXECUTADO** — não tenho acesso a este repositório no GitHub |

## User Setup Required — ATUALIZADO (2026-08-20, mesmo dia): pivô para EasyPanel Git+Dockerfile

O usuário decidiu, na prática, configurar os Apps `web` e `cms` no EasyPanel com **fonte Git**
(o próprio EasyPanel clona o repo e builda com o `Dockerfile`), não com imagem do GHCR. Isso torna
os passos 2, 5 e 6 abaixo (PAT do GHCR, GitHub Secrets de webhook, workflow deste plano) **não
necessários** no caminho real. Lista atualizada:

1. ~~Registros DNS~~ — **feito** pelo usuário em 2026-08-20: `rentals.allmusicbr.com` e
   `cms.allmusicbr.com` (não `cms.rentals.allmusicbr.com` — corrigido em `docs/DEPLOY.md` e ADR 005).
2. ~~PAT do GitHub para pull do GHCR~~ — desnecessário com fonte Git.
3. Criar no EasyPanel: Postgres gerenciado, App `cms` (fonte Git, `./cms`, `Dockerfile`) e App `web`
   (fonte Git, raiz do repo, `Dockerfile`), cada um com domínio e Build Arguments (ver `docs/DEPLOY.md`).
4. Configurar as variáveis de ambiente de `cms` (incluindo as 6 strings geradas com `openssl rand -base64 32`) e de `web`.
5. ~~GitHub Secrets de webhook~~ — desnecessário com fonte Git; `.github/workflows/deploy.yml` deste
   plano vira, no máximo, um gate de CI (typecheck/lint/test), não o caminho de publicação.
6. Push em `main` — o próprio EasyPanel builda e publica ao detectar o push.
7. Confirmar HTTPS válido nos dois domínios e que `https://allmusicbr.com` (WordPress) segue no ar.

## Next Phase Readiness

- O pipeline está pronto para ser usado assim que os secrets existirem — mas continua tudo bloqueado por: (a) Task 1 do plano 17-01 (RAM da VPS, ainda pendente) e (b) esta Task 2 (infraestrutura manual). Sem essas duas, um push em `main` vai falhar nos passos finais (curl para uma secret vazia) mesmo que o build passe.

---

_Phase: 17-deploy_
_Completed (parcialmente — Task 1 apenas): 2026-08-20_
