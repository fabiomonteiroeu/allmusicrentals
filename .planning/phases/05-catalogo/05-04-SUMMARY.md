---
phase: 05-catalogo
plan: 04
subsystem: ui
tags: [nextjs-app-router, styled-components, server-component, searchParams-promise, jest, testing-library]

# Dependency graph
requires:
  - phase: 05-catalogo (05-02)
    provides: parseFiltrosDaUrl, GRUPOS_DE_FILTRO, getProdutos/getCoresDisponiveis/getTiposDeEvento em src/lib/cms/adapters.ts
  - phase: 05-catalogo (05-03)
    provides: CMS no ar com taxonomia tipo-de-evento e 10 produtos com tiposDeEvento preenchido
provides:
  - Rota /[locale]/catalogo ao vivo, dinâmica (searchParams como Promise), com guarda de locale
  - HeroCatalogo (card SOBRE OS VALORES, D-04) e BarraDeBuscaCatalogo (busca sem navegar entre rotas, preserva filtros)
  - LayoutCatalogo — shell de duas colunas (272px minmax(0,1fr) em media.desktop, uma coluna abaixo de 1080px)
  - loading.tsx (grade de 8 ProductCardSkeleton, aria-busy) e error.tsx (Notice + retry, sem vazar detalhe interno) do segmento
  - Marcador do aside alimentado por getCoresDisponiveis (D8), pronto para 05-05 substituir por PainelDeFiltros
affects: [05-05, 05-06, 05-07, 05-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Primeira rota dinâmica do projeto: acessar searchParams (Promise) opta a rota por renderização sob demanda, sem export const dynamic/revalidate"
    - "loading.tsx/error.tsx de segmento como Client Component com 'use client' explícito quando usam styled-components — permitido pela doc instalada do Next 16"
    - "Teste de acessibilidade em elemento condicionalmente display:none via media query: usar getByRole(..., { hidden: true }) quando o jsdom não avalia @media (min-width) e não há alternativa de estrutura a corrigir"

key-files:
  created:
    - src/components/catalogo/HeroCatalogo.tsx
    - src/components/catalogo/HeroCatalogo.test.tsx
    - src/components/catalogo/BarraDeBuscaCatalogo.tsx
    - src/components/catalogo/BarraDeBuscaCatalogo.test.tsx
    - src/components/catalogo/LayoutCatalogo.tsx
    - src/app/[locale]/catalogo/page.tsx
    - src/app/[locale]/catalogo/page.test.tsx
    - src/app/[locale]/catalogo/loading.tsx
    - src/app/[locale]/catalogo/error.tsx
  modified: []

key-decisions:
  - "Correção do teste 'os nomes devolvidos por getCoresDisponiveis aparecem no marcador do aside': a hipótese inicial (aside role degradado a generic por estar aninhado em sectioning content) foi verificada e descartada — o <aside aria-label=\"Filtros\"> do page.tsx não está aninhado em nenhum article/aside/nav/section (o único <section> da árvore é irmão, do HeroCatalogo, e fecha antes do wrapper do LayoutCatalogo abrir). A causa real: ColunaAside (LayoutCatalogo.tsx) é display:none fora de media.desktop (mobile-first, D5/D7 — abaixo de 1080px o drawer de 05-06 assume os filtros), e o jsdom deste projeto não avalia @media (min-width:...) nem reage a mudanças de window.innerWidth (confirmado experimentalmente: forçar innerWidth para 1280 e disparar resize não altera o display computado). Isso torna o <aside> sempre 'invisível' para a árvore de acessibilidade dentro do teste, mesmo com a marcação correta. A estrutura do componente está correta (D5/D7); a query do teste é que precisava reconhecer a limitação do ambiente. Fix: getByRole('complementary', { name: 'Filtros', hidden: true }) — preserva a prova de D8 (role + nome + conteúdo textual dos nomes de cor) sem depender da avaliação de media query que o jsdom não faz"
  - "Task 3: nenhuma criação de LayoutCatalogo.test.tsx dedicado — o plano não listava esse arquivo em files_modified e a responsividade do shell (aside some/aparece por breakpoint) fica coberta visualmente/pelo drawer de 05-06, não por asserção de display em jsdom (mesma limitação documentada acima)"

patterns-established:
  - "error.tsx de segmento: comentários no código NÃO devem citar literalmente strings que os critérios de aceitação verificam por ausência (ex.: a palavra 'reset', a frase de sem-resultados, 'error.message'/'error.digest') — mencionar essas strings em um comentário explicativo derruba o grep negativo do critério mesmo sem repetir o comportamento proibido"

requirements-completed: [CATA-01, CATA-04]

# Metrics
duration: ~50min (retomada após travamento do executor anterior na Task 2)
completed: 2026-08-19
---

# Phase 05 Plan 04: Rota /[locale]/catalogo, hero, busca e os 4 estados (parcial) Summary

**Rota dinâmica `/[locale]/catalogo` no ar como Server Component, com hero + card SOBRE OS VALORES, busca que preserva filtros na URL, shell de duas colunas (D5/D7) e os estados `loading`/`error` do App Router — cores do painel resolvidas no servidor via `getCoresDisponiveis` (D8).**

## Retomada após travamento do executor anterior

Esta sessão é uma **continuação**: o executor anterior travou (watchdog de stream, 600s sem
progresso) exatamente ao anunciar que ia rodar os testes/verificações da Task 2, com a Task 1 já
commitada (`8e78769`) e a Task 2 já escrita no disco mas não commitada (`LayoutCatalogo.tsx`,
`page.tsx`, `page.test.tsx` untracked). Nenhum trabalho foi perdido ou refeito — esta sessão
confirmou o estado via `git log`/`git status`, leu os três arquivos não commitados, diagnosticou e
corrigiu a única falha de teste (`247 passam, 1 falha` → `248 passam, 0 falhas`), commitou a Task 2,
executou e commitou a Task 3, e escreveu este SUMMARY.

## Performance

- **Tasks:** 3/3 (Task 1 herdada já commitada; Task 2 fechada nesta sessão; Task 3 executada nesta sessão)
- **Files modified:** 9 criados (0 modificados)

## Accomplishments

- `/pt-BR/catalogo` (e `/en`, `/es`) responde como rota **dinâmica** (`ƒ` na saída de `npm run build`), com guarda de locale (`notFound` para locale desconhecido)
- Hero escuro com H1, subtítulo e o card "SOBRE OS VALORES" — cópia literal do layout-fonte (D-04), sem paráfrase
- `BarraDeBuscaCatalogo`: busca vazia mostra erro inline e não navega; busca válida reescreve só `?q=` preservando os demais filtros já na URL (`?cor=Bege` sobrevive à busca)
- `page.tsx` saneia toda entrada de `searchParams` via `parseFiltrosDaUrl` antes de qualquer chamada ao CMS (T-05-14); `?tipo=DROP` é barrado, `?cor=Bordô` (na paleta, ausente do CMS) sobrevive ao parse por design (allowlist de 5 nomes, não os 3 exibidos — D8)
- `getCoresDisponiveis` é a única fonte da lista de cores exibida ao painel (D8), chamada só com o locale, nunca derivada do resultado filtrado
- `getProdutos` chamado com `porPagina: 100`, fechando a armadilha de contagem divergente da grade (RESEARCH §6)
- `LayoutCatalogo`: grid `272px minmax(0,1fr)` dentro de `media.desktop`, uma coluna só e aside escondido abaixo de 1080px — nenhuma media query nova (D5/D7)
- `loading.tsx`: grade real de 8 `ProductCardSkeleton` com `aria-busy="true"` e texto acessível "CARREGANDO PRODUTOS" — primeiro `loading.tsx` do projeto alcançável em produção (a rota é dinâmica, ao contrário da Home SSG)
- `error.tsx`: `Notice` genérico + botão "TENTAR NOVAMENTE" chamando `retry()`, sem vazar `error.message`/`error.digest` e sem reusar a cópia de "sem resultados" (T-05-16)

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: `HeroCatalogo` + `BarraDeBuscaCatalogo`** — `8e78769` (feat) — *herdada do executor anterior, já commitada antes desta sessão*
2. **Task 2: Rota `/[locale]/catalogo` (Server Component) + `LayoutCatalogo`** — `6c1f639` (feat) — inclui a correção do teste de `getByRole('complementary')` (ver Decisões)
3. **Task 3: `loading.tsx` + `error.tsx` do segmento** — `f28579f` (feat)

**Plan metadata:** commit deste SUMMARY (a seguir)

## Files Created/Modified

- `src/components/catalogo/HeroCatalogo.tsx` / `.test.tsx` — hero escuro + card SOBRE OS VALORES (D-04), `$sobreEscuro` no `Heading`
- `src/components/catalogo/BarraDeBuscaCatalogo.tsx` / `.test.tsx` — busca com validação, estado `pendente` via `useTransition`, preserva filtros na URL
- `src/components/catalogo/LayoutCatalogo.tsx` — shell de duas colunas (D5/D7), props `aside`/`children`
- `src/app/[locale]/catalogo/page.tsx` — Server Component, guarda de locale, `parseFiltrosDaUrl`, `Promise.all` de categorias/tipos/cores, `getProdutos` com `porPagina: 100`, marcador do aside alimentado por `getCoresDisponiveis`
- `src/app/[locale]/catalogo/page.test.tsx` — cobre allowlist (D8, `?tipo=DROP`, `?cor=Bordô`), `porPagina: 100`, marcador do aside
- `src/app/[locale]/catalogo/loading.tsx` — 8 `ProductCardSkeleton`, `aria-busy`
- `src/app/[locale]/catalogo/error.tsx` — `Notice` + `retry()`, sem detalhe interno de erro

## Decisions Made

1. **Correção do teste `getByRole('complementary', { name: 'Filtros' })`** — ver `key-decisions` no frontmatter para a análise completa. Resumo: a hipótese de aninhamento em `sectioning content` foi investigada e refutada lendo o DOM renderizado real (o `<section>` do hero fecha antes do wrapper do `LayoutCatalogo` abrir — não há ancestralidade); a causa raiz confirmada experimentalmente é que `ColunaAside` é `display: none` fora de `media.desktop` e o jsdom deste projeto não avalia `@media (min-width:...)` (testado forçando `window.innerWidth` e disparando `resize`, sem efeito no `getComputedStyle`). A estrutura do componente está correta e conforme D5/D7; a correção foi no teste, com `hidden: true` para preservar a prova de que os nomes de `getCoresDisponiveis` chegam ao marcador (D8), documentando o porquê em comentário no próprio teste.
2. **`error.tsx`: comentários explicativos reescritos para não citar literalmente as strings vetadas** (`reset`, a cópia de sem-resultados, `error.message`/`error.digest`) — os critérios de aceitação do plano usam `grep` negativo sobre essas strings; mencioná-las em prosa explicativa (mesmo sem usá-las no código) derrubava o critério. Resolvido descrevendo o mesmo comportamento sem repetir os literais proibidos.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Teste `page.test.tsx` usava `getByRole('complementary')` sem considerar que o jsdom não avalia media queries de largura**
- **Found during:** retomada da Task 2 (verificação herdada do executor anterior)
- **Issue:** `screen.getByRole('complementary', { name: 'Filtros' })` falhava porque o `<aside>` fica `display: none` fora de `media.desktop`, e o jsdom deste projeto nunca considera `@media (min-width:...)` como satisfeita, independente do `window.innerWidth` — isso exclui o elemento da árvore de acessibilidade por padrão em qualquer teste
- **Fix:** `getByRole('complementary', { name: 'Filtros', hidden: true })`, com comentário no teste explicando a limitação de ambiente e por que a estrutura do componente não muda
- **Files modified:** `src/app/[locale]/catalogo/page.test.tsx`
- **Verification:** `npx jest` — 248 passam, 0 falham (era 247 passam, 1 falha antes da correção)
- **Committed in:** `6c1f639` (Task 2 commit)

**2. [Rule 1 - Bug] Comentários de `error.tsx` citavam literalmente strings vetadas pelos critérios de aceitação (grep negativo)**
- **Found during:** Task 3, ao rodar os `grep` de aceitação após escrever o arquivo
- **Issue:** os comentários explicativos mencionavam `reset()`, a frase "Amplie a busca ou fale com a equipe" e `error.message`/`error.digest` — os critérios exigem a **ausência** dessas strings no arquivo inteiro, não só fora do JSX renderizado
- **Fix:** reescritos os comentários para descrever o mesmo raciocínio sem repetir os literais proibidos
- **Files modified:** `src/app/[locale]/catalogo/error.tsx`
- **Verification:** `grep -q 'reset'` → 1 (ausente); `grep -q 'Amplie a busca'` → 1 (ausente); `grep -Eq 'error\.(message|digest)'` → 1 (ausente); `grep -q 'retry'` → 0 (presente)
- **Committed in:** `f28579f` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (ambos Rule 1 — correção de bug/teste, sem mudança de escopo)
**Impact on plan:** Nenhum. Ambas as correções preservam integralmente a prova/intenção original do plano (D8 no teste do aside; T-05-16 no error.tsx) e não alteram comportamento do produto.

## Issues Encountered

- O executor anterior travou (watchdog de stream, 600s sem progresso) ao anunciar a execução dos
  testes da Task 2 — nenhum código ou decisão foi perdido; o estado no disco (arquivos não
  commitados) estava correto e íntegro, apenas com uma falha de teste pendente de diagnóstico.
- A hipótese de causa fornecida no contexto de retomada (role `aside` degradado a `generic` por
  aninhamento em `sectioning content`) foi checada e **não** correspondia à árvore real renderizada
  — investigação com `aria-query`/`dom-accessibility-api` e um teste isolado confirmou que o
  mapeamento de role em si funciona corretamente (mesmo com `aria-label` presente, HTML-AAM
  resolveria `complementary` mesmo aninhado); a causa era a avaliação de media query no jsdom, não
  o mapeamento ARIA.

## User Setup Required

None - nenhuma configuração de serviço externo necessária.

## Next Phase Readiness

- A rota `/[locale]/catalogo` está pronta para os planos 05-05 (painel de filtros — substitui o
  marcador atual do aside, que já recebe a prop com os nomes de `getCoresDisponiveis`), 05-06
  (drawer mobile — usa o mesmo breakpoint de 1080px, sem media query nova) e 05-07 (grade real de
  produtos e estado "sem resultados", que substitui o `<section>` de contagem em texto simples)
- `loading.tsx` e `error.tsx` cobrem 2 dos 4 estados de CATA-04; os outros dois ("vazio" e "sem
  resultados") ficam para 05-07 conforme o plano
- Nenhum bloqueio identificado para a wave seguinte

---
*Phase: 05-catalogo*
*Completed: 2026-08-19*
