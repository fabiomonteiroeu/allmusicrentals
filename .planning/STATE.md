---
gsd_state_version: '1.0'
status: in_progress
progress:
  total_phases: 18
  completed_phases: 3
  total_plans: 70
  completed_plans: 18
  percent: 26
---

# Estado do Projeto

## Project Reference

Ver: `.planning/PROJECT.md` (atualizado em 2026-08-17)

**Core value:** O visitante monta e envia uma solicitação de orçamento de ponta a ponta, nos três idiomas, sem que nenhum preço apareça em lugar nenhum.
**Current focus:** Phase 3 — Strapi (CMS): falta só 03-06 (UAT com Strapi + Postgres, publicação da branch)

## Current Position

Phase: 3 de 18 (Strapi (CMS))
Plan: 5 de 6 na fase corrente (03-01, 03-02, 03-03, 03-04 e 03-05 entregues; falta só 03-06)
Status: Testes de contrato do webhook, degradação da Dynamic Zone e varredura de segredo no bundle entregues (03-04); aguardando 03-06 (UAT com Strapi + Postgres, publicação da branch)
Last activity: 2026-08-17 — plano 03-04 executado: testes de contrato do webhook (`route.test.ts`), degradação de `blocoTolerante` e contrato blocos↔schemas (`schemas.test.ts`), varredura de segredo no bundle (`verifica-segredo-no-bundle.mjs`); `npm run check` verde com 85 testes

Progress: [██░░░░░░░░] 26%

Branch corrente: `fase-03-strapi` (**ainda não publicada no GitHub**)

## Performance Metrics

**Velocity:**
- Total de planos concluídos: 18
- Duração média: não instrumentada (fases 0–3 executadas antes do GSD); plano 03-05 ~25min, plano 03-04 ~25min
- Tempo total de execução: não instrumentado

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 0. Inventário e plano | 3/3 | - | - |
| 1. Fundação | 5/5 | - | - |
| 2. Design system | 5/5 | - | - |
| 3. Strapi (CMS) | 5/6 | - | ~25min (03-04, 03-05) |

**Recent Trend:**
- Últimos 5 planos: 03-05 (~25min, exclusivamente documental), 03-04 (~25min, testes + script de varredura)
- Tendência: linha de base começa no plano 03-05

*Atualizado a cada conclusão de plano*

## Accumulated Context

### Decisions

Log completo na tabela Key Decisions de `.planning/PROJECT.md`.
Decisões recentes que afetam o trabalho atual:

- [2026-08-17] 🔒 Rota canônica de produto: `/[locale]/[categoria]/[slug]` — exige guarda de colisão de slug e 301 na mudança de categoria (Fase 7); propaga para canônica/sitemap (Fase 12) e e2e (Fase 16)
- [2026-08-17] 🔒 Deploy: GHCR + Caddy — build no Actions, push para GHCR, pull na VPS, TLS automático (Fase 17); anula a nota "Decisão aberta" de `docs/PLANO.md`
- [Fase 2] Troca desktop↔mobile do chrome por media query CSS em 1080px, não por `window.innerWidth` (`docs/divergencias.md` D1)
- [Fase 0] Formulário tem 5 etapas, não 9 (`DEC-00-14`) e "Faixa de investimento" (US$) é a única exceção anti-preço (`DEC-00-15`)
- [Fase 4] Nova: o módulo `dataLayer` tipado é criado na Fase 4 (porta de saída), e a Fase 13 apenas o liga a GTM/GA4/Pixel e ao consentimento — evita que as páginas 4–11 emitam eventos por caminho solto

### Pending Todos

Nenhum `.planning/todos/` criado ainda.

### Blockers/Concerns

- **[Fase 3] Branch não publicada.** `fase-03-strapi` existe só localmente; `origin` tem apenas `main`, `fase-01-fundacao` e `fase-02-design-system`. Publicar antes de abrir a Fase 4 (plano 03-06).
- **[Fase 3] UAT manual já executado (03-UAT.md), mas falta publicar a branch e fechar o passo 7 (webhook do Strapi recusa URL não pública em produção) no plano 03-06.** 85 testes passam, incluindo agora contrato do webhook e degradação da Dynamic Zone (plano 03-04); typecheck/lint/build verdes.
- **[Fase 7] Colisão de slug.** Com a rota `/[locale]/[categoria]/[slug]`, um produto com slug igual ao de uma categoria quebra o roteamento. A guarda precisa rodar no CI, não só em runtime.
- **[Fase 17] RAM da VPS Hostinger.** Next + Strapi + Postgres + Caddy no mesmo host precisa ser dimensionado antes de executar a fase.
- **[Fase 15] CSP com nonce.** Conviver com styled-components e GTM sem `unsafe-inline` global é o risco técnico mais provável de gerar divergência.
- **[Editorial] Esforço ~3×** em páginas com muitas Dynamic Zones se a cópia entre locales do Strapi falhar.
- **[Requisitos] Sem PRD.** Requisitos e plano de execução vêm da mesma origem e não se validam mutuamente (ver `.planning/INGEST-CONFLICTS.md`).

## Deferred Items

| Categoria | Item | Status | Adiado em |
|-----------|------|--------|-----------|
| Ferramenta | Storybook como vitrine externa do design system | v2 — a showcase interna cobre a necessidade | 2026-08-17 |
| Produto | Área logada do cliente e integração com CRM | v2 | 2026-08-17 |

## Session Continuity

Última sessão: 2026-08-17
Parou em: execução completa do plano 03-04 (testes de contrato do webhook, degradação da Dynamic Zone e varredura de segredo no bundle) — 3 tarefas, 3 commits, SUMMARY criado
Arquivo de retomada: nenhum
Próximo passo: executar o plano 03-06 (UAT com Strapi + Postgres em Docker, publicação da branch `fase-03-strapi`)
