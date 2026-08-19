---
phase: 05-catalogo
plan: 02
subsystem: api
tags: [zod, strapi, catalogo-filtros, dataLayer, ga4, and-or-query]

# Dependency graph
requires:
  - phase: 05-catalogo (plano 01)
    provides: taxonomia tipo-de-evento travada (11 valores, exibirNoFiltroDoCatalogo)
  - phase: 04-home
    provides: dataLayer tipado (EventoDataLayer/emitirEvento), getProdutos/FiltroProdutos base
provides:
  - tipoDeEventoSchema + tipoDeEventoColecao (Zod) e extensão aditiva de produtoSchema
    (tiposDeEvento, contagemSolicitacoes)
  - getTiposDeEvento e getCoresDisponiveis (origem dos grupos "Tipo de evento" e "Cor")
  - getProdutos com os 5 grupos de filtro (AND entre grupos, OR dentro do grupo) e ORDENACOES
    (5 chaves de sort do Strapi)
  - src/lib/catalogo/filtros.ts — módulo puro: GRUPOS_DE_FILTRO, ORDENACOES_UI,
    parseFiltrosDaUrl, serializarFiltros, alternarValor, descreverChips, contarFiltrosAtivos
  - EventoDataLayer ampliado com 'search' e 'filter_applied'
affects: [05-catalogo (planos 04-08 — rota, painel de filtros, toolbar, chips, drawer)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AND entre grupos / OR dentro do grupo via índices de filters[$and][i] e $or[j]/$in[j] (D-09)"
    - "Módulo de contrato de URL 100% puro (sem server-only, sem React) para uso em Server e Client Component"
    - "Allowlist de parse como superconjunto estável, independente da lista exibida na tela"

key-files:
  created:
    - src/lib/catalogo/filtros.ts
    - src/lib/catalogo/filtros.test.ts
  modified:
    - src/lib/cms/schemas.ts
    - src/lib/cms/schemas.test.ts
    - src/lib/cms/adapters.ts
    - src/lib/cms/adapters.test.ts
    - src/lib/analytics/dataLayer.ts
    - src/lib/analytics/dataLayer.test.ts
    - src/components/blocos/SliderDeProdutos.test.tsx
    - src/lib/product/mapearParaProductCard.test.ts
    - src/components/blocos/GradeDeCategoriasBloco.test.tsx
    - src/components/analytics/EmissorViewItemList.test.tsx

key-decisions:
  - "FiltroCatalogo usa os mesmos nomes de campo de FiltroProdutos (categorias/tiposDeItem/cores/tiposDeEvento/ambientes/ordenar) para alimentar getProdutos diretamente na Fase 05-04; só `q` mapeia à parte para `busca`"
  - "getCoresDisponiveis usa um schema Zod próprio e mínimo (nome + variacoes), não produtoSchema completo, porque a consulta usa fields[0]=nome e produtoSchema exige slug"
  - "destaque (boolean) permanece filtro solto (fora do agrupamento $and), preservando a chamada existente da Home (getProdutos(locale, { destaque: true }))"

patterns-established:
  - "Contador de grupo `i` que só avança quando o grupo tem valor — replicável para qualquer novo grupo de filtro futuro"
  - "Allowlist dinâmica passada por quem chama (não hardcoded no módulo puro), documentada como contrato explícito no código"

requirements-completed: [CATA-01, CATA-02, CATA-03, CATA-06]

# Metrics
duration: ~35min (leitura de contexto + implementação; commits entre 19:48–19:57 -03)
completed: 2026-08-19
---

# Phase 05 Plan 02: Contratos de filtro do catálogo (Zod + adapters + URL) Summary

**`getProdutos` ganha os 5 grupos de filtro com AND/OR real contra o Strapi, `src/lib/catalogo/filtros.ts` (allowlist de URL pura) e `EventoDataLayer` ganha `search`/`filter_applied` — tudo sem nenhum campo monetário.**

## Performance

- **Duration:** ~35 min (commits entre 2026-08-19T19:48-03:00 e 19:57-03:00)
- **Tasks:** 3/3
- **Files modified:** 12 (2 criados, 10 modificados)

## Accomplishments

- `tipoDeEventoSchema`/`tipoDeEventoColecao` e extensão aditiva de `produtoSchema`
  (`tiposDeEvento`, `contagemSolicitacoes`) sem quebrar nenhuma resposta atual do Strapi.
- `getTiposDeEvento` e `getCoresDisponiveis` — origem única e testada dos grupos "Tipo de
  evento" e "Cor" do painel de filtros (a segunda faz consulta própria, não reusa a lista
  filtrada da página, evitando que o filtro apague as próprias opções).
- `getProdutos` estendido para os 5 grupos de filtro (`categorias`, `tiposDeItem`, `cores`,
  `tiposDeEvento`, `ambientes`) com **AND entre grupos, OR dentro do grupo** (D-09), sintaxe
  idêntica à testada de verdade contra o Strapi real (`05-RESEARCH.md` §1), mais `ORDENACOES`
  com as 5 chaves de ordenação (`solicitados` usa `contagemSolicitacoes:desc`, D6).
- `src/lib/catalogo/filtros.ts` novo: módulo 100% puro com `GRUPOS_DE_FILTRO`,
  `ORDENACOES_UI`, `parseFiltrosDaUrl` (allowlist única, nunca lança), `serializarFiltros`,
  `alternarValor`, `descreverChips`, `contarFiltrosAtivos`.
- `EventoDataLayer` ganha `search` e `filter_applied`, sem nenhum campo monetário
  (mitigação PRECO-04, mesma técnica de `error TS2353` da Fase 4).

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Task 1: Schemas Zod da taxonomia `tipo-de-evento`, extensão aditiva de `produtoSchema` e a origem das cores do filtro** - `c64438f` (feat)
2. **Task 2: `getProdutos` com os 5 grupos de filtro (AND/OR) e as 5 ordenações** - `05a3887` (feat)
3. **Task 3: Contratos de URL (`src/lib/catalogo/filtros.ts`) e a união de eventos ampliada** - `05e41bb` (feat)

_Nenhuma tarefa é TDD (`tdd` não declarado no frontmatter do plano); testes foram escritos junto com a implementação em cada commit, não em commits separados de RED/GREEN._

## Files Created/Modified

- `src/lib/catalogo/filtros.ts` - Módulo puro: allowlist de URL, grupos de filtro, ordenação, chips, contador
- `src/lib/catalogo/filtros.test.ts` - Testes do módulo acima
- `src/lib/cms/schemas.ts` - `tipoDeEventoSchema` + extensão aditiva de `produtoSchema`
- `src/lib/cms/schemas.test.ts` - Testes dos schemas novos/estendidos
- `src/lib/cms/adapters.ts` - `getTiposDeEvento`, `getCoresDisponiveis`, `getProdutos` com 5 grupos + `ORDENACOES`
- `src/lib/cms/adapters.test.ts` - Testes dos 3 pontos acima (fetch mockado)
- `src/lib/analytics/dataLayer.ts` - `EventoDataLayer` ganha `search`/`filter_applied`
- `src/lib/analytics/dataLayer.test.ts` - Testes dos 2 eventos novos
- `src/components/blocos/SliderDeProdutos.test.tsx` - Fixture de `Produto` atualizada (Rule 1)
- `src/lib/product/mapearParaProductCard.test.ts` - Fixture de `Produto` atualizada (Rule 1)
- `src/components/blocos/GradeDeCategoriasBloco.test.tsx` - Narrowing da união `EventoDataLayer` (Rule 1)
- `src/components/analytics/EmissorViewItemList.test.tsx` - Narrowing da união `EventoDataLayer` (Rule 1)

## Decisions Made

- `FiltroCatalogo` (em `filtros.ts`) usa os mesmos nomes de campo de `FiltroProdutos` para que
  05-04 possa passar o resultado de `parseFiltrosDaUrl` direto a `getProdutos`, sem tradução.
- `getCoresDisponiveis` precisou de um schema Zod próprio (`produtoCorSchema`, só `nome` +
  `variacoes`) porque a consulta usa `fields[0]=nome` e o `produtoSchema` completo exige
  `slug`, que não vem nessa resposta — usar `produtoColecao` ali quebraria a validação.
- `destaque` continua como filtro solto (fora do agrupamento `$and`), preservando a chamada
  existente `getProdutos(locale, { destaque: true })` da Home sem exigir migração.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixtures de `Produto` em 2 testes de Fase 4 quebravam o typecheck**
- **Found during:** Task 1
- **Issue:** `Produto` ganhou os campos obrigatórios `tiposDeEvento`/`contagemSolicitacoes`; os
  objetos-fixture completos em `SliderDeProdutos.test.tsx` e
  `mapearParaProductCard.test.ts` (que constroem um `Produto` literal, não via
  `adaptarProduto`) não tinham os dois campos novos e `npm run typecheck` passou a falhar
  com `TS2322`.
- **Fix:** Acrescentados `tiposDeEvento: []` e `contagemSolicitacoes: 0` nas duas funções
  `criarProduto`.
- **Files modified:** `src/components/blocos/SliderDeProdutos.test.tsx`,
  `src/lib/product/mapearParaProductCard.test.ts`
- **Verification:** `npm run typecheck` limpo; `npx jest` dos dois arquivos verde.
- **Committed in:** `c64438f` (Task 1 commit)

**2. [Rule 1 - Bug] Comentário em `filtros.ts` continha a string literal `server-only`**
- **Found during:** Task 3 (verificação do plano)
- **Issue:** O plano exige `grep -q "server-only" src/lib/catalogo/filtros.ts` sair com
  código 1 (não encontrado), provando que o módulo é puro. O comentário de topo explicava
  "sem `server-only`" usando exatamente essa string, fazendo o grep encontrar por texto
  mesmo sem haver import real — falso positivo na verificação.
- **Fix:** Reformulado o comentário para "sem nenhuma diretiva de servidor exclusivo",
  preservando o sentido sem usar a string literal.
- **Files modified:** `src/lib/catalogo/filtros.ts`
- **Verification:** `grep -q "server-only" src/lib/catalogo/filtros.ts` sai 1; `npx jest`,
  `npm run typecheck`, `npm run lint` continuam verdes.
- **Committed in:** `05e41bb` (Task 3 commit)

**3. [Rule 1 - Bug] 3 testes de componente da Fase 4 acessavam campos de `view_item_list` sem estreitar a união `EventoDataLayer`**
- **Found during:** Task 3
- **Issue:** `EventoDataLayer` deixou de ser um tipo único e virou união discriminada de 3
  membros. `EmissorViewItemList.test.tsx`, `GradeDeCategoriasBloco.test.tsx` e
  `SliderDeProdutos.test.tsx` liam `evento.items`/`evento.item_list_id` diretamente do
  objeto mockado sem checar `event === 'view_item_list'` antes, e `npm run typecheck` passou
  a falhar com `TS2339` (propriedade não existe nos outros membros da união).
- **Fix:** Acrescentada uma função local `comoViewItemList` em cada arquivo, que lança se o
  evento capturado não for `view_item_list` e devolve o tipo estreitado — os 3 testes
  passaram a usar essa função antes de acessar os campos específicos.
- **Files modified:** `src/components/analytics/EmissorViewItemList.test.tsx`,
  `src/components/blocos/GradeDeCategoriasBloco.test.tsx`,
  `src/components/blocos/SliderDeProdutos.test.tsx`
- **Verification:** `npm run typecheck` limpo; `npx jest` (231/231) verde.
- **Committed in:** `05e41bb` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (todos Rule 1 — bugs causados diretamente pela extensão
aditiva deste plano em código de fases anteriores, não escopo novo).
**Impact on plan:** Nenhum. Os 3 ajustes são consequência mecânica e obrigatória da mudança
de tipo/interface deste plano — sem eles, `npm run typecheck` (critério de aceite de todas as
3 tarefas) não passaria.

## Issues Encountered

- Meu próprio teste de ida-e-volta (`serializarFiltros(parseFiltrosDaUrl(x))`) inicialmente
  usava `Object.fromEntries(params.entries())` para reconstruir o `searchParams`, o que
  colapsa chaves multi-valor (ex.: `cor=Bege&cor=Preto`) em um único valor. Corrigido com um
  helper `paraRecord` que usa `getAll()` por chave antes que o teste falhasse — não afeta o
  código de produção, só a fixture do próprio teste.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `getProdutos`, `getTiposDeEvento`, `getCoresDisponiveis` e `src/lib/catalogo/filtros.ts`
  estão prontos para os planos de UI (05-04 a 05-07) consumirem sem precisar caçar
  assinatura no código.
- Nenhum arquivo de `cms/` ou `docs/` foi tocado — a criação do content-type
  `tipo-de-evento` no Strapi (05-03) e a documentação de divergências (05-01) continuam
  responsabilidade exclusiva dos planos correspondentes; este plano só assume o slug do
  endpoint (`tipo-de-eventos`) como contrato provisório, a confirmar contra o schema real
  quando 05-03 existir (nota já deixada no código, herdada do plano).
- `npx jest` completo (231/231), `npm run typecheck` e `npm run lint` verdes na branch do
  worktree ao final da execução.

---
*Phase: 05-catalogo*
*Completed: 2026-08-19*

## Self-Check: PASSED

- FOUND: `src/lib/catalogo/filtros.ts`
- FOUND: `src/lib/catalogo/filtros.test.ts`
- FOUND: `.planning/phases/05-catalogo/05-02-SUMMARY.md`
- FOUND commit: `c64438f`
- FOUND commit: `05a3887`
- FOUND commit: `05e41bb`
