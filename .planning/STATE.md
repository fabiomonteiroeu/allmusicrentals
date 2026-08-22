---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Discussed
last_updated: "2026-08-22T03:36:25.727Z"
last_activity: 2026-08-22 -- Beta no ar; pendência da Fase 05 fechada; 06-CONTEXT.md escrito
progress:
  total_phases: 18
  completed_phases: 3
  total_plans: 20
  completed_plans: 19
  percent: 17
---

# Estado do Projeto

## Project Reference

Ver: `.planning/PROJECT.md` (atualizado em 2026-08-17)

**Core value:** O visitante monta e envia uma solicitação de orçamento de ponta a ponta, nos três idiomas, sem que nenhum preço apareça em lugar nenhum. **Ainda não entregue nesta beta** — ver desvio de 2026-08-20 no ROADMAP.
**Current focus:** Phase 6 — Categoria: CONTEXTO CAPTURADO, pronto para UI-SPEC e planejamento. A Fase 17 (Deploy) entregou a beta pública: `rentals.allmusicbr.com` e `cms.allmusicbr.com` no ar em 2026-08-21, com o conteúdo de dev migrado por `strapi transfer`.

## Current Position

Phase: 6 de 18 (Categoria) — contexto e contrato de UI capturados em 2026-08-22
Plan: nenhum ainda — próximo passo é `/gsd:plan-phase 6`
Status: UI-SPEC approved (5 PASS / 1 FLAG resolvido)
Last activity: 2026-08-22 -- 06-CONTEXT.md e 06-UI-SPEC.md escritos e aprovados pelo gsd-ui-checker

Progress: [████░░░░░░] 36% (número herdado do ROADMAP; ver nota de reconciliação em Blockers)

Branch corrente: `fase-06-categoria`, aberta a partir de `main` atualizada

**Fase 17 (Deploy): entregue.** Beta pública no ar desde 2026-08-21 — ver `docs/DEPLOY.md` e
`docs/adr/005-deploy-easypanel-em-vez-de-caddy.md`.

**Fase 5 (Catálogo): pendência de verificação FECHADA em 2026-08-21** (`bc11c71`) — `npm run check`
(311 testes, typecheck, lint) e `npx playwright test` (58/58, desktop + mobile) rodaram limpos. A
execução revelou 6 falhas reais de contraste WCAG AA, corrigidas. Segue diferida só a Task 3
(checkpoint de fidelidade visual), agora conferível no site publicado.

**Fases 7 a 16: DIFERIDAS**, não canceladas — ver ROADMAP.md § "DESVIO DE ORDEM DE EXECUÇÃO".

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
- [2026-08-20] 🔒 **SUPERSEDE a decisão acima.** Deploy passa a ser GHCR + **EasyPanel** (não Caddy): a VPS já roda EasyPanel com WordPress real em produção em `allmusicbr.com`; um Caddy próprio faria bind em 80/443 e derrubaria esse site. EasyPanel assume proxy reverso, domínios e TLS. Registrado em `docs/adr/005-deploy-easypanel-em-vez-de-caddy.md` (plano 17-01).
- [2026-08-20] 🔒 Desvio de ordem de execução: **5 → 17 → (6..16 diferidas)**, decisão do usuário, prazo de 18h para beta pública de Home + Catálogo. Core value (carrinho + formulário de orçamento) não entregue nesta beta.
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
- **[Fase 17] RAM da VPS Hostinger — gate removido por decisão do usuário (2026-08-20).** Total confirmado: 4 GB. O usuário decidiu explicitamente prosseguir sem medir RAM disponível/uso atual ("esquece esse critério") — não é mais bloqueante. Risco residual não eliminado, só aceito: se algum serviço reiniciar sozinho ou ficar lento após o deploy, é o primeiro lugar a olhar (`docker stats --no-stream` + painel de recursos do EasyPanel).
- **[Fase 05 — 05-08] Verificação local não executada nesta sessão.** As suítes `e2e/catalogo-filtros.spec.ts` e `e2e/catalogo-acessibilidade.spec.ts` (Tasks 1-2 do plano) já existem no disco e cobrem por inspeção os critérios de aceitação, mas `npx playwright test`, `npm run check` e `npm run verifica:bundle-segredo` não foram rodados porque o `device_bash` (shell local) reportou "Workspace unavailable" durante toda a sessão de 2026-08-20. Rodar localmente antes de considerar CATA-01..06 verificados. Task 3 (checkpoint de fidelidade) está formalmente diferida para depois do deploy — ver `05-08-SUMMARY.md`.
- **[GSD] Métrica do frontmatter (`progress.percent: 6`) diverge da tabela de progresso do ROADMAP.md ("26 de 73 planos, 36%").** Não reconciliado nesta sessão — é o mesmo tipo de deriva já registrada no item acima sobre ferramentas de estado. Tratar `ROADMAP.md` como fonte de verdade de progresso até uma reconciliação manual dedicada.
- **[Fase 15] CSP com nonce.** Conviver com styled-components e GTM sem `unsafe-inline` global é o risco técnico mais provável de gerar divergência.
- **[Editorial] Esforço ~3×** em páginas com muitas Dynamic Zones se a cópia entre locales do Strapi falhar.
- **[Requisitos] Sem PRD.** Requisitos e plano de execução vêm da mesma origem e não se validam mutuamente (ver `.planning/INGEST-CONFLICTS.md`).
- **[Strapi — LIÇÃO da Fase 5] `"default"` em `schema.json` não faz backfill.** O default de atributo do Strapi é aplicado pelo ORM só na **criação** de um registro; não vira `DEFAULT` de coluna no Postgres nem preenche registros pré-existentes quando a coluna é adicionada no boot. `contagemSolicitacoes` nasceu `NULL` nos 10 produtos já cadastrados, com `schema.json` correto e `tsc` verde — falso-positivo clássico. Corrigido por `garantirContagemSolicitacoes` no bootstrap (`cms/src/index.ts`, commit `333f634`), idempotente. **Qualquer atributo novo com `default` em content-type que já tenha registros precisa de backfill explícito no bootstrap.** Em Postgres `ORDER BY x DESC` é `DESC NULLS FIRST`, então `NULL` residual inverte ranking em vez de só zerá-lo.

## Deferred Items

| Categoria | Item | Status | Adiado em |
|-----------|------|--------|-----------|
| Ferramenta | Storybook como vitrine externa do design system | v2 — a showcase interna cobre a necessidade | 2026-08-17 |
| Produto | Área logada do cliente e integração com CRM | v2 | 2026-08-17 |

## Session Continuity

Última sessão: 2026-08-20 (Cowork)
Parou em: Fase 5 fechada com `05-08-SUMMARY.md` registrando pendência de verificação local; Fase 17 iniciada (plano 17-01 em progresso: parametrização de deploy). `device_bash` indisponível a sessão inteira — nenhum comando local (`npm`, `git`, `docker`) pôde ser executado por mim; todos os arquivos foram escritos por edição direta e precisam de conferência local antes do deploy.
Arquivo de retomada: `.planning/phases/05-catalogo/05-08-SUMMARY.md`, `.planning/phases/17-deploy/17-01-SUMMARY.md` (quando criado)
Próximo passo (atualizado 2026-08-20, RAM não é mais bloqueante): (1) usuário segue o passo a passo de `docs/DEPLOY.md` para criar Postgres + App `cms` + App `web` no EasyPanel (fonte Git + Dockerfile, deploy manual, sem GitHub Actions/GHCR — decisão do usuário); (2) usuário roda `npm run check && npx playwright test` localmente quando puder, para confirmar o 05-08; (3) assim que `device_bash` reconectar, aplicar `git add/commit/push` na `main` de tudo que foi escrito nesta sessão (ainda não commitado no git — só escrito em disco via bridge de arquivos).

**Decisão travada no checkpoint de 05-01 (2026-08-19):** taxonomia `tipo-de-evento` com 11 rótulos (`opcao-a` do RESEARCH §4). Ordem de exibição e slugs: Evento corporativo/`evento-corporativo`, Casamento/`casamento`, Aniversário/`aniversario`, Festa privada/`festa-privada`, Show/`show`, Festival/`festival`, Feira/`feira`, Ativação de marca/`ativacao-de-marca`, Formatura/`formatura`, Evento ao ar livre/`evento-ao-ar-livre`, Outro/`outro`. `Outro` entra com `exibirNoFiltroDoCatalogo: false` (oculto do painel de filtros por campo booleano, não por hardcode). Migração de `aplicacoes`: `"Festa"` → `"Festa privada"`. Registro auditável completo em `05-01-SUMMARY.md`.
