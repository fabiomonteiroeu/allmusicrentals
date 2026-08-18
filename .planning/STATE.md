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
**Current focus:** Phase 4 — Home: planejada (7 planos em 3 waves), pronta para executar

## Current Position

Phase: 4 de 18 (Home) — planejada, não iniciada
Plan: 0 de 7 na fase corrente
Status: Fase 3 VERIFICADA e fechada (`03-VERIFICATION.md`, `status: passed`) — 6/6 planos, 11/11 requisitos, branch publicada em `origin`. Fase 4 com CONTEXT, RESEARCH, UI-SPEC (6/6 dimensões) e PATTERNS prontos, e 7 planos escritos (commit `9779691`); aguardando verificação do plan-checker.
Last activity: 2026-08-18 — Fase 4 planejada: 7 planos em 3 waves. O ROADMAP previa 4; o pré-requisito de imagem remota (`images.remotePatterns` + `NEXT_PUBLIC_STRAPI_MEDIA_URL`) e a montagem do chrome no `[locale]/layout.tsx` não estavam contemplados e são herdados pelas Fases 5–11.

Progress: [███░░░░░░░] 27%

Branch corrente: `fase-03-strapi` (publicada em `origin`, SHA idêntico ao HEAD local)

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
| 3. Strapi (CMS) | 6/6 | - | ~25min (03-04, 03-05) |
| 4. Home | 0/7 | - | planejada em 2026-08-18 |

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

- **[Fase 3 — RESOLVIDO 2026-08-17]** Branch publicada em `origin` (SHA idêntico ao HEAD local) e fase fechada com `03-VERIFICATION.md` (`status: passed`).
- **[Dev] Webhook do Strapi recusa URL não-pública quando `NODE_ENV=production`.** Validação SSRF do Strapi 5: `host.docker.internal` e IP de LAN são recusados no painel e na API (`node_modules/@strapi/admin/.../controllers/webhooks.js` pula a checagem só fora de produção). Contorno usado no UAT: inserir a linha em `strapi_webhooks` via `psql` e reiniciar o `cms`. Em produção (Fase 17) não ocorre — a URL será pública. Falta documentar o procedimento de dev.
- **[Fase 15] `verifica:bundle-segredo` não está no CI.** Roda sob demanda; entrar no pipeline é entrega da Fase 15.
- **[GSD] Ferramentas de estado não leem este `.planning/`.** `state.advance-plan` corrompeu o frontmatter do `STATE.md` numa execução e `roadmap.update-plan-progress` escreveu progresso errado em duas. O `.planning/` veio de ingest em pt-BR. Atualizar STATE e ROADMAP à mão — e atualizar **os dois**, além da tabela de progresso: em 2026-08-17 o cabeçalho do ROADMAP e o STATE ficaram desatualizados após o fechamento da Fase 3, e o planner da Fase 4 leu o estado velho e reportou a fase como aberta.
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
Próximo passo: verificar os 7 planos da Fase 4 com o plan-checker e depois executar (`/gsd-execute-phase 04`)
