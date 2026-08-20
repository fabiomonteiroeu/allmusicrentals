---
phase: 05-catalogo
plan: 05
subsystem: ui
tags:
  [radix-accordion, styled-components, url-as-state, useTransition, jest, testing-library, a11y]

# Dependency graph
requires:
  - phase: 05-catalogo (05-02)
    provides: alternarValor, serializarFiltros, GRUPOS_DE_FILTRO, ORDENACOES_UI em src/lib/catalogo/filtros.ts; getCategorias e getCoresDisponiveis em src/lib/cms/adapters.ts
  - phase: 05-catalogo (05-03)
    provides: taxonomia tipo-de-evento no CMS (11 registros, exibirNoFiltroDoCatalogo) e 5 categorias reais
  - phase: 05-catalogo (05-04)
    provides: rota /[locale]/catalogo, LayoutCatalogo com ColunaAside, e o marcador de cores do aside que este plano substitui
  - phase: 02-design-system
    provides: primitives/ColorSwatches.tsx (seleção única do ProductCard) como referência não modificada
provides:
  - PainelDeFiltros — acordeão múltiplo (Radix, type="multiple") dos 5 grupos, sem estado local de filtro
  - SwatchesDeCor — multi-seleção de cor cuja lista é exatamente a prop vinda do CMS (D8)
  - ToolbarDoCatalogo — contagem em aria-live, select com as 5 ORDENACOES_UI e botão FILTROS restrito a media.mobile
  - D-09 (AND entre grupos, OR dentro do grupo) observável na tela, não só testado em isolamento
  - Padrão de teclado do acordeão estabelecido do zero — não havia precedente Radix no projeto
affects: [05-06, 05-07, 05-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Primeiro consumidor de @radix-ui/react-accordion no projeto: API lida do d.ts instalado, type="multiple", sem handler de teclado próprio (o Trigger do Radix já responde a Enter/Space com aria-expanded correto)'
    - 'URL como única fonte de verdade do filtro: componentes leem useSearchParams() e escrevem via alternarValor + router.push dentro de useTransition — nenhum estado local espelhando o filtro'
    - 'Componente local ao domínio em vez de generalizar o primitivo: SwatchesDeCor (multi-seleção) coexiste com primitives/ColorSwatches.tsx (seleção única) sem tocá-lo'
    - 'Seleção de swatch distinguível por outline (estrutura), não só por matiz — cobre o caso da cor branca e não depende de percepção de cor'

key-files:
  created:
    - src/components/catalogo/SwatchesDeCor.tsx
    - src/components/catalogo/SwatchesDeCor.test.tsx
    - src/components/catalogo/PainelDeFiltros.tsx
    - src/components/catalogo/PainelDeFiltros.test.tsx
    - src/components/catalogo/ToolbarDoCatalogo.tsx
    - src/components/catalogo/ToolbarDoCatalogo.test.tsx
  modified:
    - src/app/[locale]/catalogo/page.tsx
    - src/app/[locale]/catalogo/page.test.tsx

key-decisions:
  - 'Grupo cor não conhece a paleta: a lista de swatches é exatamente a prop `cores` (D8). `coresProduto` entra só como índice nome→hex; nome sem entrada no mapa não renderiza swatch.'
  - 'Assimetria de D8 preservada: a allowlist de parse continua `Object.keys(coresProduto)` (5 nomes), superconjunto intencional do conjunto exibido — barreira de segurança não pode variar com conteúdo editorial.'
  - 'Categoria/Tipo de item/Cor abertos de saída; Tipo de evento/Ambiente fechados (`abertoPorPadrao`).'
  - 'Nenhum handler de teclado próprio no acordeão — delegado ao Radix, que já entrega Enter/Space e aria-expanded.'

patterns-established:
  - 'URL-as-state: filtro nunca duplicado em useState; leitura por useSearchParams, escrita por router.push em useTransition'
  - 'Acordeão de filtros com Radix type="multiple" e grupos abertos por padrão declarados por dado, não por índice'
  - 'Contagem de resultados em aria-live alimentada pelo mesmo array que a grade recebe — evita a divergência contagem×grade apontada como armadilha no RESEARCH §6'

requirements-completed: [CATA-02, CATA-03, CATA-05]

# Metrics
duration: ~135min
completed: 2026-08-20
---

# Fase 05 — Plano 05: Painel de filtros e toolbar

**Acordeão Radix múltiplo dos 5 grupos de filtro com a URL como única fonte de verdade, multi-seleção de cor derivada do CMS (D8) e toolbar com contagem em `aria-live` e as 5 ordenações de CATA-03.**

## Performance

- **Duration:** ~135 min (execução interrompida por travamento de infraestrutura — ver Issues)
- **Started:** 2026-08-19T23:32:23-03:00 (primeiro commit)
- **Completed:** 2026-08-20T01:46:33-03:00 (último commit de código)
- **Tasks:** 3 de 3
- **Files modified:** 8 (6 criados, 2 modificados)

## Accomplishments

- **D-09 saiu do teste e entrou na tela.** AND entre grupos e OR dentro do grupo deixou de ser lógica verificada em isolamento no `filtros.ts` e passou a ser comportamento observável do painel.
- **Primeiro consumidor de Radix no projeto, com padrão de teclado estabelecido do zero.** O `MobileMenu.tsx`, citado como precedente no RESEARCH e no UI-SPEC, não usa Radix nem gerencia foco — não havia o que herdar. A API foi lida do `d.ts` instalado em vez de escrita de memória.
- **D8 honrada sem lista de cores própria.** Os swatches são exatamente a prop recebida, resolvida no servidor por `getCoresDisponiveis`. É o que torna verdadeira a microcopy literal do layout, "Outras cores cadastradas aparecem aqui."
- **Contagem e grade alimentadas pela mesma fonte.** A armadilha nº 1 do RESEARCH §6 (contagem divergente do que a grade mostra, que passa com fixture e falha em produção) foi fechada por construção: a contagem vem de `produtos.length`, o mesmo array que a grade recebe.

## Task Commits

1. **Task 1: Multi-seleção de cor (`SwatchesDeCor`) sem tocar no primitivo do card** — `e12156e` (feat)
2. **Task 2: `PainelDeFiltros` — acordeão múltiplo dos 5 grupos ligado à URL** — `2ed19cf` (feat)
3. **Task 3: `ToolbarDoCatalogo` (contagem, ordenação de 5 opções, botão FILTROS) e montagem no `page.tsx`** — `4d0f8a0` (feat)

**Plan metadata:** este SUMMARY (docs: complete plan)

## Files Created/Modified

- `src/components/catalogo/SwatchesDeCor.tsx` — multi-seleção de cor; a lista é a prop `cores` (D8), `coresProduto` só resolve hex por índice
- `src/components/catalogo/SwatchesDeCor.test.tsx` — prova que o componente não tem lista própria e que nome fora da paleta não vira swatch
- `src/components/catalogo/PainelDeFiltros.tsx` — acordeão Radix `type="multiple"` dos 5 grupos; lê `useSearchParams()`, escreve por `alternarValor` + `router.push` em `useTransition`
- `src/components/catalogo/PainelDeFiltros.test.tsx` — AND/OR observável, grupos abertos de saída, teclado e `aria-expanded`
- `src/components/catalogo/ToolbarDoCatalogo.tsx` — contagem em `aria-live`, select com as 5 `ORDENACOES_UI`, botão `FILTROS` restrito a `media.mobile` (D7) despachando `definirDrawerFiltros`
- `src/components/catalogo/ToolbarDoCatalogo.test.tsx` — as 5 opções, a contagem e o despacho do drawer
- `src/app/[locale]/catalogo/page.tsx` — `PainelDeFiltros` substitui o marcador de texto do aside deixado por 05-04; `ToolbarDoCatalogo` substitui o parágrafo de contagem solto
- `src/app/[locale]/catalogo/page.test.tsx` — o teste do marcador de cores passou a asserir os swatches por `aria-label`, porque `SwatchesDeCor` não tem texto visível

## Decisions Made

- **A lista de cores nunca é reconstruída no cliente.** `getCoresDisponiveis` resolve no servidor e desce por prop. A allowlist de parse permanece `Object.keys(coresProduto)` (5 nomes) — superconjunto deliberado do que é exibido, porque barreira de segurança não pode variar conforme o conteúdo editorial do CMS. Essa assimetria está registrada em D8 e foi preservada.
- **O primitivo `ColorSwatches.tsx` não foi generalizado.** Ele serve a seleção única no `ProductCard`; forçar multi-seleção nele teria acoplado dois casos de uso distintos. `SwatchesDeCor` é local ao catálogo.
- **Seleção de swatch por `outline`, não por matiz.** Distinção estrutural, que cobre a cor branca e não depende de percepção de cor.
- **Nenhum handler de teclado próprio no acordeão.** O `Trigger` do Radix já responde a Enter/Space com `aria-expanded` correto — escrever handler em cima seria duplicar e divergir.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug in touched code] `@media (prefers-reduced-motion)` duplicado no `PainelDeFiltros`**

- **Found during:** Task 3 (montagem no `page.tsx`)
- **Issue:** o componente declarava sua própria regra de `prefers-reduced-motion`, mas o `GlobalStyle.ts` já zera `transition-duration` globalmente — regra redundante, e uma media query a mais num plano regido por D-07 ("sem `@media` nova")
- **Fix:** removida a regra local, mantendo o comportamento pelo global — mesmo padrão já usado por `HeroBloco` e `loading.tsx`
- **Files modified:** `src/components/catalogo/PainelDeFiltros.tsx`
- **Verification:** `npm run lint` e `format:check` verdes; nenhuma media query nova no diff
- **Committed in:** `4d0f8a0` (parte do commit da Task 3)

**2. [Rule 1 — Bug in touched code] Asserção do marcador de cores do `page.test.tsx` incompatível com o componente real**

- **Found during:** Task 3 (montagem no `page.tsx`)
- **Issue:** o teste herdado de 05-04 usava `toHaveTextContent` para conferir os nomes de cor no aside, o que só funcionava enquanto o aside tinha o **marcador de texto** provisório. Substituído o marcador por `PainelDeFiltros` real, `SwatchesDeCor` não expõe texto visível — só `aria-label`
- **Fix:** a asserção passou a verificar os swatches por `aria-label`, preservando a prova de D8 (os nomes vindos de `getCoresDisponiveis` chegam à tela)
- **Files modified:** `src/app/[locale]/catalogo/page.test.tsx`
- **Verification:** `npx jest` verde; a prova de D8 continua existindo, agora no nível certo
- **Committed in:** `4d0f8a0` (parte do commit da Task 3)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 — bug em código tocado)
**Impact on plan:** ambos decorrem de a Task 3 substituir andaimes deixados por 05-04. Nenhum scope creep; nenhuma prova removida.

## Issues Encountered

- **Travamento de infraestrutura ao final, duas vezes na fase.** O agente executor foi encerrado por watchdog de stream ("no progress for 600s") exatamente ao anunciar a rodada de verificação final — o mesmo ponto onde o executor do plano 05-04 travou. As três tarefas já estavam commitadas e a árvore limpa; nenhum trabalho foi perdido. O orquestrador executou a verificação diretamente e escreveu este SUMMARY a partir dos commits. **Padrão a levar para as waves seguintes:** a suíte completa rodada em sequência dentro do agente é o gatilho provável; convém que o orquestrador assuma a verificação final, ou que ela seja fatiada.

## Verification

Executada pelo orquestrador na árvore principal, após os 3 commits:

| Gate                            | Resultado          |
| ------------------------------- | ------------------ |
| `npx jest`                      | **269 passam, 0 falham** |
| `npm run typecheck`             | exit 0             |
| `npm run lint`                  | exit 0             |
| `npm run format:check`          | exit 0             |
| `npm run verifica:bundle-segredo` | exit 0           |

Árvore de trabalho limpa. `@radix-ui/react-accordion` confirmado como importado em `src/components/catalogo/PainelDeFiltros.tsx` — antes deste plano não havia nenhuma importação de Radix em `src/`.

**Limite conhecido desta verificação:** a visibilidade do botão `FILTROS` por `media.mobile` e o colapso do aside por `media.desktop` **não** são provados aqui. O jsdom deste projeto não avalia `@media (min-width:...)` — verificado experimentalmente no plano 05-04, inclusive descartando a rota `window.innerWidth` + `resize`, que não surte efeito no `getComputedStyle`. Os testes cobrem estrutura e atributos; a prova de visibilidade real é escopo do plano 05-08 (Playwright).

## User Setup Required

None — nenhuma configuração de serviço externo é necessária.

## Next Phase Readiness

- **Pronto para 05-06:** o `ToolbarDoCatalogo` já despacha `definirDrawerFiltros`, e o `PainelDeFiltros` é o mesmo componente que o drawer vai servir abaixo de 1080px — o drawer não precisa reimplementar o painel.
- **Pronto para 05-07:** a contagem já vem do mesmo array que a grade receberá, então a grade pode consumir `produtos` sem risco de divergir da contagem exibida.
- **Dívida encaminhada a 05-08:** teclado e foco estão cobertos por teste em jsdom, mas foco preso no drawer, visibilidade por media query e axe em navegador real dependem do Playwright.

---

_Phase: 05-catalogo_
_Completed: 2026-08-20_
