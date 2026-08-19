---
phase: 05-catalogo
plan: 01
subsystem: docs
tags: [taxonomia, cms-modelagem, divergencias, roadmap, catalogo]

# Dependency graph
requires:
  - phase: 03-strapi
    provides: content-types base do Strapi (product, schema de aplicacoes)
provides:
  - Lista final confirmada da taxonomia unificada `tipo-de-evento` (11 rótulos, com slug e exibirNoFiltroDoCatalogo)
  - Mapeamento antigo→novo dos valores de `aplicacoes` ("Festa" → "Festa privada")
  - Quatro divergências técnicas registradas (D5, D6, D7, D8) em docs/divergencias.md, antes de qualquer código do catálogo
  - Contagem corrigida do inventário (10 produtos, não 11)
  - Pendência cruzada Fase 5 → Fase 9 cravada na linha do plano 09-05 do ROADMAP (contagemSolicitacoes)
affects: [05-02, 05-03, 05-04, 05-05, 05-06, 05-07, 09-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Registro de divergência antes de implementar (docs/divergencias.md, formato Dn com 5 rubricas)"
    - "Taxonomia CMS única compartilhada entre páginas (tipo-de-evento alimenta filtro do catálogo e select do formulário)"

key-files:
  created: []
  modified:
    - docs/divergencias.md
    - docs/00-inventario.md
    - .planning/ROADMAP.md

key-decisions:
  - "Taxonomia `tipo-de-evento` fechada com 11 rótulos (RESEARCH §4, opção A) — ver tabela completa abaixo"
  - "`Outro` entra na taxonomia com exibirNoFiltroDoCatalogo: false (controle editorial por campo booleano, não exclusão hardcoded)"
  - "`Evento ao ar livre` permanece na taxonomia mesmo com o filtro Ambiente: Externo — eixos diferentes (produto vs. evento do cliente)"
  - "\"Festa\" → \"Festa privada\" é o único mapeamento antigo→novo necessário nos 10 produtos"
  - "D5-D8 registradas: grids auto-fit, contagemSolicitacoes real (incrementado só na Fase 9), media query única de 1080px para o botão FILTROS, lista de cores derivada do CMS"

patterns-established:
  - "Pattern: toda divergência de layout no catálogo segue o formato Dn (No layout / Divergência / Motivo técnico / Escopo / Reversível) já usado em D1-D4"

requirements-completed: [CATA-02, CATA-03]

# Metrics
duration: 12min
completed: 2026-08-19
---

# Phase 05 Plano 01: Decisões travadas da taxonomia e divergências estruturais do catálogo Summary

**Taxonomia unificada `tipo-de-evento` fechada em 11 rótulos (RESEARCH §4, opção A) e quatro divergências estruturais do catálogo (grids auto-fit, contador `contagemSolicitacoes`, media query de 1080px, cores derivadas do CMS) registradas em `docs/divergencias.md` antes de qualquer implementação.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-19T22:32:00Z
- **Completed:** 2026-08-19T22:44:04Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Decisão do checkpoint (Task 1) registrada: taxonomia `tipo-de-evento` fechada com 11 rótulos, sem necessidade de novo checkpoint (decisão já tomada pelo usuário antes da execução deste plano)
- Quatro divergências técnicas (D5, D6, D7, D8) registradas em `docs/divergencias.md`, seguindo exatamente o formato de D1-D4 (5 rubricas cada)
- `docs/00-inventario.md` corrigido: "Grade (11 produtos)" → "Grade (10 produtos)"
- `.planning/ROADMAP.md`: pendência cruzada da Fase 5 (contador `contagemSolicitacoes`) cravada na linha do plano `09-05`, sem alterar mais nada da seção da Fase 9

## Task Commits

Each task was committed atomically:

1. **Task 1: Confirmar os rótulos finais da taxonomia unificada `tipo-de-evento`** - checkpoint:decision, resolvido previamente pelo usuário (opção-a) — nenhum arquivo de código alterado, decisão registrada apenas neste SUMMARY (ver tabela abaixo, exigida por 05-03)
2. **Task 2: Registrar D5, D6, D7 e D8, corrigir a contagem do inventário e cravar no ROADMAP a pendência da Fase 9** - `d281073` (docs)

**Plan metadata:** (a ser adicionado pelo orquestrador, ver nota abaixo sobre tracking)

_Nota: este plano roda em worktree paralelo. STATE.md e ROADMAP.md (seções de tracking) NÃO foram tocados por este agente — apenas a linha de conteúdo do plano `09-05` foi editada, conforme instruído (entregável da Task 2, não tracking). O orquestrador atualiza tracking centralmente após o merge da wave._

## Files Created/Modified

- `docs/divergencias.md` - Acrescenta D5 (grids auto-fit), D6 (contagemSolicitacoes), D7 (media query 1080px para FILTROS), D8 (cores derivadas do CMS via getCoresDisponiveis)
- `docs/00-inventario.md` - Corrige a contagem de produtos do catálogo de 11 para 10 (linha 75), com nota explicando a origem real (array `CATALOGO` do layout-fonte)
- `.planning/ROADMAP.md` - Acrescenta ao fim da linha do plano `09-05` (Fase 9) a obrigação de incrementar `contagemSolicitacoes`, com referência a D6

## Decisões Made

### Decisão do checkpoint (Task 1) — Taxonomia unificada `tipo-de-evento`

**Opção escolhida:** opcao-a (aceitar os 11 rótulos propostos pelo RESEARCH §4).

**Lista final da taxonomia `tipo-de-evento`, na ordem de exibição, com slug (`uid`) por rótulo:**

| # | Rótulo | slug | exibirNoFiltroDoCatalogo |
|---|--------|------|--------------------------|
| 1 | Evento corporativo | `evento-corporativo` | true |
| 2 | Casamento | `casamento` | true |
| 3 | Aniversário | `aniversario` | true |
| 4 | Festa privada | `festa-privada` | true |
| 5 | Show | `show` | true |
| 6 | Festival | `festival` | true |
| 7 | Feira | `feira` | true |
| 8 | Ativação de marca | `ativacao-de-marca` | true |
| 9 | Formatura | `formatura` | true |
| 10 | Evento ao ar livre | `evento-ao-ar-livre` | true |
| 11 | Outro | `outro` | **false** |

**Declarações explícitas exigidas pelos `acceptance_criteria` da Task 1:**

- `Outro` **entra** na taxonomia (necessário para o select do formulário da Fase 9) e é cadastrado com `exibirNoFiltroDoCatalogo: false` — ou seja, **oculto do painel de filtros do catálogo** por controle editorial via campo booleano no content-type (default `true`), não por exclusão hardcoded no front.
- `Evento ao ar livre` **permanece** na taxonomia, mesmo existindo o filtro `Ambiente: Externo`, porque são eixos diferentes: ambiente é propriedade do produto; tipo de evento é do evento do cliente.
- **Mapeamento antigo→novo** dos valores hoje presentes em `aplicacoes` dos 10 produtos: **`"Festa"` → `"Festa privada"`**. Todos os outros valores do catálogo mantêm o rótulo idêntico. `Formatura` e `Outro` são novos (só existiam no formulário, sem produto de origem).

Esta tabela e o mapeamento estão transcritos aqui integralmente porque o plano **05-03** lê este SUMMARY para semear o CMS — sem esta transcrição, 05-03 ficaria bloqueado.

### Decisões da Task 2 (registro de divergências)

- **D5:** os três grids calculados por JS do catálogo (`heroCols`, `layoutCols`, `gridProdutos`) viram CSS puro (`auto-fit`/coluna fixa), pelo mesmo motivo já aceito em D1/D3 (mismatch de hidratação e CLS ao ler viewport no cliente).
- **D6:** "Mais solicitados" ordena por um campo real `contagemSolicitacoes` (integer, default 0), não por apelido de `destaque`. O campo começa em 0 para todos os produtos; **a Fase 9 (plano 09-05) é quem passa a incrementá-lo**, no Route Handler de envio da solicitação. Essa obrigação foi cravada na linha do plano `09-05` do ROADMAP.
- **D7:** a visibilidade do botão `FILTROS` e o colapso do aside usam `media.mobile`/`media.desktop` (`theme.breakpoint.header`, 1080px) — a única media query aprovada do projeto, sem breakpoint novo.
- **D8:** a lista de cores do filtro é derivada do CMS via `getCoresDisponiveis(locale)` (a ser criado em 05-02), não uma lista fixa de 3 valores. Com os 10 produtos semeados hoje o resultado visual é idêntico ao layout (`Bege`, `Preto`, `Branco`) — a divergência é de **fonte**, necessária para que a microcopy "Outras cores cadastradas aparecem aqui" seja verdadeira. A allowlist de parse de `parseFiltrosDaUrl` (`Object.keys(coresProduto)`, 5 nomes) permanece um superconjunto intencional do que é exibido.

## Deviations from Plan

None - plan executed exactly as written. A decisão da Task 1 (checkpoint) já havia sido tomada pelo usuário antes desta execução, conforme instruído no contexto de spawn deste agente, e foi apenas registrada/transcrita aqui — nenhuma pergunta nova foi feita.

## Issues Encountered

- Ao redigir D8, a rubrica `**No layout:**` foi inicialmente escrita sem os dois-pontos (`**No layout** —`), o que quebrava a contagem automatizada de 5 rubricas por seção exigida pelos critérios de aceitação. Corrigido inline antes do commit, verificado com `awk`/`grep` retornando 5 para D5, D6, D7 e D8.
- `git commit` disparou `lint-staged` (prettier --write) nos 3 arquivos alterados; após o commit, todos os critérios de aceitação e `npm run format:check` foram reconferidos e continuam válidos.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 05-02 (CMS: content-type `tipo-de-evento` e `getCoresDisponiveis`) e 05-03 (seed) podem prosseguir: a lista de 11 rótulos com slug, `exibirNoFiltroDoCatalogo` e o mapeamento `"Festa"→"Festa privada"` estão transcritos acima.
- 05-04/05-05/05-07 têm o valor concreto de substituição para os três grids JS (D5) e o breakpoint exato a reusar (D7, `theme.breakpoint.header`).
- O planejamento da Fase 9 (plano 09-05) não pode mais ignorar a obrigação de incrementar `contagemSolicitacoes` — está na própria linha do plano no ROADMAP.
- Nenhum bloqueio conhecido para os próximos planos da Fase 5.

---
*Phase: 05-catalogo*
*Completed: 2026-08-19*
