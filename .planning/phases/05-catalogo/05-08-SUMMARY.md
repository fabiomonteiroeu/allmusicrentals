---
phase: 05-catalogo
plan: 08
subsystem: qa
tags: [playwright, e2e, axe, accessibility, dataLayer, checkpoint]
status: tasks-1-2-implementadas-nao-verificadas-nesta-sessao — task-3-diferida

# Dependency graph
requires:
  - phase: 05-catalogo (05-01 a 05-07)
    provides: rota /[locale]/catalogo completa do lado do visitante (hero, busca, painel, toolbar, drawer, chips, grade, 4 estados, emissores search/filter_applied/view_item_list)
provides:
  - e2e/catalogo-filtros.spec.ts — suíte e2e de filtro, contagem, ordenação, chips/URL, drawer e eventos
  - e2e/catalogo-acessibilidade.spec.ts — axe em navegador real, contraste dirigido, teclado ponta a ponta, 375px sem scroll horizontal
  - e2e/utils/axe.ts — injeção de axe-core sem dependência nova
  - Checkpoint de fidelidade visual (Task 3) formalmente diferido para depois do deploy da Fase 17, por decisão registrada em ROADMAP.md (desvio de 2026-08-20)
affects: [17-deploy, 16-qa-final]

key-decisions:
  - 'Task 3 (checkpoint humano de fidelidade lado a lado) NÃO foi executada. Diferimento já estava decidido e registrado em ROADMAP.md antes deste SUMMARY: "Checkpoint de fidelidade visual do catálogo (Task 3 do plano 05-08) adiado para conferência no site publicado; registrado como pendência de UAT." Este SUMMARY apenas formaliza o fechamento do plano com essa pendência aberta, para permitir a Fase 17 prosseguir.'
  - 'Tasks 1 e 2 (as duas suítes e2e + utilitário de axe) foram encontradas já implementadas em disco no início desta sessão, com timestamps posteriores à última atualização de STATE.md/ROADMAP.md. Por inspeção de conteúdo, os dois arquivos cobrem os pontos exigidos pelos acceptance_criteria do plano: asserção cruzada contagem-toolbar×cards, 2 resultados para Pacote+Serviço técnico, 4 para Móveis+Bege/Preto, comentário sobre "mesa" retornar 5, teste de acento/caixa na busca, chip+URL na mesma verificação após goBack, toBeFocused() no botão FILTROS após Escape, varredura completa de window.dataLayer por value/price/currency/revenue, axe com o drawer aberto, asserção de contraste dirigida ao hero, teclado ponta a ponta com outline computado, e scrollWidth<=clientWidth em 375px nos três estados.'
  - 'A execução automatizada (npx playwright test, npm run check, verifica:bundle-segredo, git diff em package.json/lock) NÃO foi rodada nesta sessão. O acesso de shell ao ambiente local (device_bash) reportou "Workspace unavailable" durante toda a sessão. Não há, portanto, confirmação de que as suítes escritas realmente passam contra o Strapi real — isso fica como pendência explícita, não como suposição de sucesso.'

requirements-completed: []
requirements-pending-local-verification: [CATA-01, CATA-02, CATA-03, CATA-04, CATA-05, CATA-06]

# Metrics
duration: não instrumentada (Tasks 1-2 escritas em sessão anterior não documentada; esta sessão só fechou o plano)
completed: 2026-08-20
---

# Fase 05 — Plano 08: Suítes e2e Playwright, axe em navegador real e checkpoint de fidelidade (fechamento parcial, sob pressão de prazo)

**As duas suítes automatizadas (Task 1 e Task 2) existem em disco e cobrem, por inspeção, todos os critérios de aceitação do plano. O checkpoint humano de fidelidade (Task 3) está formalmente diferido, e a confirmação de que as suítes passam de fato em navegador real (`npx playwright test`) fica pendente de execução local — não pôde ser rodada nesta sessão por indisponibilidade do shell do dispositivo.**

## Contexto desta sessão

Em 2026-08-20 o usuário decidiu publicar uma beta em até 18h, cobrindo apenas Home e Catálogo, e formalizou em `ROADMAP.md` o desvio de ordem de execução **5 → 17 → (6..16 diferidas)**, incluindo o diferimento explícito da Task 3 deste plano ("adiado para conferência no site publicado; registrado como pendência de UAT").

Ao retomar o trabalho, encontrei `e2e/catalogo-filtros.spec.ts`, `e2e/catalogo-acessibilidade.spec.ts` e `e2e/utils/axe.ts` já escritos no disco (Tasks 1 e 2), sem `05-08-SUMMARY.md` e sem atualização correspondente em `STATE.md`/`ROADMAP.md` — a mesma classe de deriva que o próprio `STATE.md` já registra como risco conhecido dos artefatos de estado do GSD. Este SUMMARY fecha essa lacuna documental e formaliza o estado real do plano, sem fingir uma verificação que não rodou.

## Accomplishments (herdados — não produzidos nesta sessão)

- `e2e/catalogo-filtros.spec.ts`: blocos desktop (contagem/ordenação/busca), chips/URL (reload e goBack), mobile (drawer, foco preso, retorno de foco) e eventos (search/filter_applied/view_item_list, varredura anti-valor).
- `e2e/catalogo-acessibilidade.spec.ts`: axe em 1280px, 375px e com drawer aberto; asserção de contraste dirigida ao hero; teclado ponta a ponta com outline computado; scrollWidth<=clientWidth em três estados.
- `e2e/utils/axe.ts`: injeta `axe-core/axe.min.js` via `require.resolve`, sem instalar `@axe-core/playwright` — mitigação T-05-35 do plano.

## Task Commits

Não identificados nesta sessão — `device_bash` (shell local) indisponível impediu `git log`. Os timestamps de arquivo indicam que Tasks 1 e 2 foram escritas antes desta sessão, numa janela entre a última atualização do ROADMAP (2026-08-20, ~21:24 UTC pelo mtime) e o início desta sessão.

## Deviations from Plan

- **Task 3 (checkpoint humano) não executada — diferimento formal**, já decidido pelo usuário e registrado em `ROADMAP.md` antes deste SUMMARY. Não é decisão tomada por este SUMMARY; é o registro de uma decisão preexistente.
- **Verificação automatizada do plano não executada nesta sessão** (`npm run check`, `npx playwright test` nos 2 projetos, `npm run verifica:bundle-segredo`, `git diff --exit-code -- package.json package-lock.json`). Motivo: `device_bash` retornou "Workspace unavailable" durante toda a sessão. Isto **não é um desvio do plano em si** (o código escrito parece atender aos critérios por inspeção), mas é uma lacuna de evidência que precisa ser fechada antes de considerar CATA-01 a CATA-06 formalmente verificados.

## Verification

| Gate | Resultado |
| --- | --- |
| Inspeção de conteúdo de `e2e/catalogo-filtros.spec.ts` contra os acceptance_criteria da Task 1 | Cobertura aparente completa (todos os `test(...)` esperados estão presentes) |
| Inspeção de conteúdo de `e2e/catalogo-acessibilidade.spec.ts` contra os acceptance_criteria da Task 2 | Cobertura aparente completa |
| `grep "require.resolve('axe-core/axe.min.js')" e2e/utils/axe.ts` | Presente, por inspeção direta |
| `npx playwright test` (os dois projetos) | **NÃO EXECUTADO** — pendente |
| `npm run check` | **NÃO EXECUTADO** — pendente |
| `npm run verifica:bundle-segredo` | **NÃO EXECUTADO** — pendente |
| `git diff --exit-code -- package.json package-lock.json` | **NÃO EXECUTADO** — pendente |
| Task 3 — checkpoint de fidelidade visual | **DIFERIDO** por decisão do usuário (ROADMAP, 2026-08-20), para conferência no site publicado |

**Este plano fecha em estado "código completo, verificação local pendente".** A Fase 17 pode prosseguir por decisão explícita do usuário (prazo de 18h para beta), mas os dois pendentes abaixo precisam ser resolvidos antes de considerar a Fase 5 verdadeiramente encerrada:

## Pendências (User Setup Required)

1. **Rodar a suíte localmente.** Com `docker compose --profile cms up -d cms` de pé, rodar `npm run check && npx playwright test`. Se algo falhar, é código já escrito por uma sessão anterior — não deste fechamento — e precisa de correção antes ou depois do deploy, conforme severidade.
2. **Checkpoint de fidelidade (Task 3).** Fazer a conferência dos 10 pontos do plano contra `projeto-base/All Music Rentals - Catalogo.dc.html` depois que a beta estiver no ar em `rentals.allmusicbr.com/pt-BR/catalogo`, dando atenção aos três modos de falha que a Fase 4 provou que testes automatizados não pegam (contraste, chave React duplicada, mídia com URL relativa).

## Next Phase Readiness

- Fase 5 fecha com débito de verificação explícito (acima), não com "tudo verde". A Fase 17 (Deploy) começa em paralelo por decisão do usuário, não porque a Fase 5 esteja 100% fechada no sentido tradicional do GSD.
- Herdado de 05-07: `contagemSolicitacoes` ainda precisa ser incrementado no Route Handler da Fase 9 (09-05).

---

_Phase: 05-catalogo_
_Completed (parcialmente, com pendências explícitas): 2026-08-20_
