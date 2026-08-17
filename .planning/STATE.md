---
gsd_state_version: '1.0'
status: in_progress
progress:
  total_phases: 18
  completed_phases: 3
  total_plans: 70
  completed_plans: 16
  percent: 23
---

# Estado do Projeto

## Project Reference

Ver: `.planning/PROJECT.md` (atualizado em 2026-08-17)

**Core value:** O visitante monta e envia uma solicitação de orçamento de ponta a ponta, nos três idiomas, sem que nenhum preço apareça em lugar nenhum.
**Current focus:** Phase 3 — Strapi (CMS): verificação/UAT e fechamento das pendências documentais

## Current Position

Phase: 3 de 18 (Strapi (CMS))
Plan: 3 de 5 na fase corrente (03-01, 03-02 e 03-03 entregues; faltam 03-04 e 03-05)
Status: Implementada, aguardando verificação
Last activity: 2026-08-17 — projeto GSD inicializado a partir da ingestão de `docs/`; roadmap de 18 fases (0–17) criado preservando a numeração de `docs/PLANO.md`

Progress: [██░░░░░░░░] 23%

Branch corrente: `fase-03-strapi` (24 commits, **ainda não publicada no GitHub**)

## Performance Metrics

**Velocity:**
- Total de planos concluídos: 16
- Duração média: não instrumentada (fases 0–3 executadas antes do GSD)
- Tempo total de execução: não instrumentado

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 0. Inventário e plano | 3/3 | - | - |
| 1. Fundação | 5/5 | - | - |
| 2. Design system | 5/5 | - | - |
| 3. Strapi (CMS) | 3/5 | - | - |

**Recent Trend:**
- Últimos 5 planos: sem medição
- Tendência: linha de base começa no plano 03-04

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

- **[Fase 3] Branch não publicada.** `fase-03-strapi` existe só localmente; `origin` tem apenas `main`, `fase-01-fundacao` e `fase-02-design-system`. Publicar antes de abrir a Fase 4.
- **[Fase 3] Fase implementada sem verificação.** 65 testes passam e typecheck/lint estão verdes, mas não houve UAT com o Strapi rodando: criar entradas nos 3 locales, publicar e confirmar a revalidação por webhook.
- **[Fase 3] Documentação obsoleta induz retrabalho.** `docs/PLANO.md` abre com "Fase 00 em andamento", a linha 92 diz "form 9 etapas" (o correto é 5) e a Fase 17 ainda traz "Decisão aberta". `docs/00-inventario.md` §10 tem aprovações desmarcadas. Corrigir no plano 03-05.
- **[Fase 3] Seis divergências abertas.** Itens 5, 6, 7, 9, 11 e 12 de `docs/00-divergencias.md` seguem ⏳ AGUARDA DECISÃO, mas 5/6/7/9 já foram implementados na Fase 2 e 11/12 na Fase 3. Fechar contra o código real; onde divergir da proposta, registrar em `docs/divergencias.md`.
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
Parou em: criação de `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` e `STATE.md` a partir de `.planning/intel/`
Arquivo de retomada: nenhum
Próximo passo: `/gsd-plan-phase 3` para detalhar os planos 03-04 (verificação/UAT + push da branch) e 03-05 (fechamento de divergências e correção de `docs/PLANO.md`)
