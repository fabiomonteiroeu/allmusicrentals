---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-08-19T21:52:44.609Z"
last_activity: 2026-08-19 -- Phase 05 wave 1 complete (05-01, 05-02)
progress:
  total_phases: 18
  completed_phases: 1
  total_plans: 18
  completed_plans: 9
  percent: 6
---

# Estado do Projeto

## Project Reference

Ver: `.planning/PROJECT.md` (atualizado em 2026-08-17)

**Core value:** O visitante monta e envia uma solicitação de orçamento de ponta a ponta, nos três idiomas, sem que nenhum preço apareça em lugar nenhum.
**Current focus:** Phase 5 — Catálogo: EM EXECUÇÃO (8 planos, 7 waves). Fase 4 (Home) fechada e verificada.

## Current Position

Phase: 5 de 18 (Catálogo) — EM EXECUÇÃO
Plan: 2 de 8 (Wave 1 concluída e mergeada)
Status: Executing
Last activity: 2026-08-19 -- Phase 05 wave 1 complete (05-01, 05-02)

Progress: [████░░░░░░] 36%

Branch corrente: `fase-05-catalogo`

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
| 4. Home | 7/7 | ~5h | 7 planos em 3 waves |

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

Última sessão: 2026-08-19
Parou em: Fase 5 — Wave 1 concluída e mergeada em `fase-05-catalogo` (05-01 documental + 05-02 camada de lógica pura). Gate pós-merge verde: 231/231 testes, typecheck, lint e format.
Arquivo de retomada: nenhum
Próximo passo: Wave 2 — plano 05-03 (taxonomia `tipo-de-evento` no Strapi, permissões públicas, migração de `aplicacoes`). Tem checkpoint.

**Decisão travada no checkpoint de 05-01 (2026-08-19):** taxonomia `tipo-de-evento` com 11 rótulos (`opcao-a` do RESEARCH §4). Ordem de exibição e slugs: Evento corporativo/`evento-corporativo`, Casamento/`casamento`, Aniversário/`aniversario`, Festa privada/`festa-privada`, Show/`show`, Festival/`festival`, Feira/`feira`, Ativação de marca/`ativacao-de-marca`, Formatura/`formatura`, Evento ao ar livre/`evento-ao-ar-livre`, Outro/`outro`. `Outro` entra com `exibirNoFiltroDoCatalogo: false` (oculto do painel de filtros por campo booleano, não por hardcode). Migração de `aplicacoes`: `"Festa"` → `"Festa privada"`. Registro auditável completo em `05-01-SUMMARY.md`.
