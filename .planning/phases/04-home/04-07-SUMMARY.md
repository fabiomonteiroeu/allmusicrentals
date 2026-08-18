---
phase: 04-home
plan: 07
subsystem: ui
tags: [nextjs, react-server-components, styled-components, strapi, dynamic-zone, a11y]

# Dependency graph
requires:
  - phase: 04-home (04-03, 04-04, 04-05, 04-06)
    provides: os 9 componentes de bloco da Home (HeroBloco, BuscaBloco, GradeDeCategoriasBloco,
      ProdutosEmDestaqueBloco, DestaqueLedBloco, ComoFuncionaBloco, DiferenciaisBloco,
      AvaliacoesBloco, ChamadaFinalBloco), o módulo `dataLayer` e `mapearParaProductCard`
provides:
  - RenderizadorDeBlocos — dispatcher da Dynamic Zone via switch exaustivo (padrão para as Fases 5-11)
  - src/app/[locale]/page.tsx ligado ao CMS real, com degradação para CMS indisponível
  - Extensão E7 do design system (Heading $sobreEscuro)
  - Landmark <main> único no layout de [locale]
  - adaptarBloco resolvendo mídia de bloco (hero/destaque-led) via MEDIA_BASE
  - D3/D4 registradas em docs/divergencias.md e fechamento do item 6
affects: [05-catalogo, 06-categoria, 07-produto, 08-carrinho, 09-checkout, 10-conta, 11-conteudo-institucional]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic Zone renderer: switch exaustivo sobre __component (não Record/lookup), preserva
      narrowing de tipo por causa de noUncheckedIndexedAccess"
    - "Todo componente de bloco que define styled-components precisa de 'use client' — mesmo
      sendo apresentação pura sem estado, porque o ThemeContext do styled-components só resolve
      dentro da árvore de Client Components"
    - "Chave de lista vinda do CMS nunca deve depender só do id do registro — ids de componente
      do Strapi são sequenciais por tabela de componente e colidem entre tipos diferentes na
      mesma Dynamic Zone; compor a chave com índice + tipo (ou qualquer campo garantidamente
      único na zona)"
    - "Todo campo de mídia de bloco (Dynamic Zone) precisa passar por adaptarImagem/adaptarImagens
      no adaptador — nunca expor a mídia crua do Strapi (URL relativa) a um componente"
    - "Landmark <main> é responsabilidade do layout, não de cada page.tsx — evita repetição e
      garante exatamente um por rota"
    - "Testes de contraste de cor precisam de getComputedStyle comparando elemento×fundo — a
      regra color-contrast do axe-core não roda em jsdom (fica 'incomplete', nunca 'violation')"

key-files:
  created:
    - src/components/blocos/renderizador.tsx
    - src/components/blocos/renderizador.test.tsx
    - src/components/blocos/contraste-fundo-escuro.test.tsx
    - src/app/[locale]/page.test.tsx
  modified:
    - src/app/[locale]/page.tsx
    - src/app/[locale]/layout.tsx
    - src/lib/cms/adapters.ts
    - src/lib/cms/adapters.test.ts
    - src/components/primitives/Typography.tsx
    - src/components/primitives/primitives.test.tsx
    - src/components/blocos/HeroBloco.tsx
    - src/components/blocos/BuscaBloco.tsx
    - src/components/blocos/GradeDeCategoriasBloco.tsx
    - src/components/blocos/ProdutosEmDestaqueBloco.tsx
    - src/components/blocos/DestaqueLedBloco.tsx
    - src/components/blocos/ComoFuncionaBloco.tsx
    - src/components/blocos/DiferenciaisBloco.tsx
    - src/components/blocos/AvaliacoesBloco.tsx
    - src/components/blocos/ChamadaFinalBloco.tsx
    - docs/divergencias.md
  removed:
    - src/components/FoundationStatus.tsx

key-decisions:
  - "E7 — Heading ganha prop $sobreEscuro (mesmo padrão de Eyebrow/E1): sem ela, 4 títulos
    (Hero, card-bandeira LED, Painéis de LED, CTA final) ficavam com contraste 1.00 sobre o
    próprio fundo escuro — literalmente invisíveis, embora presentes no DOM/HTML servido"
  - "Chave da Dynamic Zone é ${indice}-${__component}, nunca só bloco.id — ids de componente do
    Strapi colidem entre tipos diferentes na mesma zona (8 dos 9 blocos da página home real têm
    id: 7)"
  - "Landmark <main> vive em [locale]/layout.tsx, não em cada page.tsx — dono único, herdado por
    toda página do site"
  - "adaptarBloco resolve blocos.hero.imagem e blocos.destaque-led.imagens pelos helpers
    adaptarImagem/adaptarImagens já existentes; tipo Bloco passa a expor Imagem/Imagem[] nesses
    dois campos, igual a produto/categoria"
  - "Os 9 componentes de bloco precisam de 'use client' — styled-components não resolve theme via
    Context em Server Component puro; corrige o desenho original de 04-PATTERNS.md, que previa
    blocos de apresentação pura como Server Component"

patterns-established:
  - "RenderizadorDeBlocos: switch exaustivo sobre __component, default: return null, chave
    ${i}-${__component}"
  - "'use client' obrigatório em qualquer componente de bloco que define styled.* diretamente"
  - "Mídia de bloco (Dynamic Zone) sempre adaptada no servidor antes de chegar ao componente"

requirements-completed: [HOME-01, HOME-04]

# Metrics
duration: 2h10min
completed: 2026-08-18
---

# Phase 4 Plan 7: Renderizador da Dynamic Zone e Home ligada ao CMS Summary

**`RenderizadorDeBlocos` (switch exaustivo) liga `/[locale]` aos 9 blocos reais do Strapi, com degradação para CMS indisponível — e o checkpoint de fidelidade encontrou e corrigiu 3 defeitos de contraste, chave de lista e URL de mídia que 163 testes unitários não pegavam.**

## Performance

- **Duration:** ~2h10min (do primeiro commit ao fechamento do checkpoint, incluindo 3 rodadas de correção pós-conferência visual)
- **Started:** 2026-08-18T19:37:00-03:00
- **Completed:** 2026-08-18T20:48:43-03:00 (código) + reconferência final aprovada pelo usuário
- **Tasks:** 2 automáticas + 1 checkpoint de fidelidade (HOME-04)
- **Files modified:** 23 (4 criados, 18 modificados, 1 removido)

## Accomplishments

- `RenderizadorDeBlocos` — o dispatcher da Dynamic Zone que as Fases 5–11 vão herdar: `switch`
  exaustivo sobre `__component`, `default: return null` para blocos desconhecidos/de outra
  página, sem `Record`/lookup (por causa de `noUncheckedIndexedAccess: true`).
- `/pt-BR`, `/en` e `/es` renderizando os 9 blocos reais do Strapi, com degradação para um único
  aviso "CONTEÚDO INDISPONÍVEL" quando a página `home` não existe ou o CMS falha — sem tela
  branca e sem gastar 3 requisições extra nesse caminho.
- **3 defeitos reais encontrados e corrigidos no checkpoint de fidelidade** (ver seção dedicada
  abaixo) — nenhum deles aparecia nos 163 testes unitários herdados das waves 1 e 2, porque
  exigiam navegador real + build real + dados reais do CMS para se manifestar.
- D3, D4 e o fechamento do item 6 registrados em `docs/divergencias.md`.
- Placeholder `FoundationStatus.tsx` (Fase 1) removido, sem consumidor restante.

## Task Commits

Cada tarefa foi commitada atomicamente; as correções pós-checkpoint entraram como commits `fix`
adicionais, no mesmo padrão:

1. **Task 1: RenderizadorDeBlocos — switch exaustivo** - `135194c` (feat)
2. **Task 2: page.tsx da Home com degradação, D3/D4** - `77ff5a1` (feat) — inclui a correção
   emergencial de `'use client'` nos 9 blocos (ver Deviations)
3. **Task 3: checkpoint de fidelidade — correções encontradas na conferência:**
   - `f43a471` (fix) — E7: `Heading $sobreEscuro`, 4 títulos invisíveis
   - `8b2f64c` (fix) — chave estável na Dynamic Zone + landmark `<main>`
   - `36e7e48` (fix) — `adaptarBloco` resolve mídia de hero/destaque-led

**Plan metadata:** (este commit, a seguir)

## Files Created/Modified

- `src/components/blocos/renderizador.tsx` - dispatcher da Dynamic Zone (switch exaustivo, 9 `case` + `default`)
- `src/components/blocos/renderizador.test.tsx` - 6 testes (ordem, bloco não-Home, tipo inventado, array vazio, ordem invertida, chave não-duplicada com `id` colidido)
- `src/app/[locale]/page.tsx` - busca `getPagina`/`getCategorias`/`getProdutos`/`getAvaliacoes`, degrada para `Notice` único sem página
- `src/app/[locale]/page.test.tsx` - 3 testes (2 blocos + buscas paralelas, `null` sem buscas extra, locale inválido → `notFound`)
- `src/app/[locale]/layout.tsx` - landmark `<main>` único envolvendo `{children}`
- `src/lib/cms/adapters.ts` - `adaptarBloco` resolve mídia de `blocos.hero`/`blocos.destaque-led`; tipo `Bloco` reflete `Imagem`/`Imagem[]` nesses campos
- `src/lib/cms/adapters.test.ts` - 3 testes novos (URL relativa → prefixo `MEDIA_BASE`, URL absoluta inalterada, `destaque-led.imagens`)
- `src/components/primitives/Typography.tsx` - **E7**: `Heading` ganha `$sobreEscuro?: boolean`
- `src/components/primitives/primitives.test.tsx` - 2 testes de unidade da E7
- `src/components/blocos/contraste-fundo-escuro.test.tsx` - guarda de regressão: renderiza os 4 blocos reais de fundo escuro e compara `getComputedStyle` do heading × fundo
- `src/components/blocos/HeroBloco.tsx`, `BuscaBloco.tsx`, `GradeDeCategoriasBloco.tsx`, `ProdutosEmDestaqueBloco.tsx`, `DestaqueLedBloco.tsx`, `ComoFuncionaBloco.tsx`, `DiferenciaisBloco.tsx`, `AvaliacoesBloco.tsx`, `ChamadaFinalBloco.tsx` - ganharam `'use client'` (blocking fix); `HeroBloco`/`GradeDeCategoriasBloco`/`DestaqueLedBloco`/`ChamadaFinalBloco` também ganharam `$sobreEscuro` no heading; `DestaqueLedBloco` também trocou `.alternativeText` por `.alt`
- `docs/divergencias.md` - D3 (grid `auto-fit`), D4 (cópia de CMS indisponível), fechamento do item 6
- `src/components/FoundationStatus.tsx` - **removido** (placeholder da Fase 1, sem consumidor)

## Decisions Made

- **Landmark `<main>` é responsabilidade do `layout.tsx`, não de cada `page.tsx`** — toda página
  futura (Fases 5–11) herda o mesmo destino de "pular para o conteúdo" sem repetir a tag.
- **Chave da Dynamic Zone é `${índice}-${__component}`, nunca só `bloco.id`** — o índice já
  bastaria (ordem estável dentro de um render); o `__component` é só para legibilidade no
  DevTools.
- **`adaptarBloco` resolve mídia usando os mesmos helpers de produto/categoria** — nenhuma lógica
  nova de resolução de URL, só a aplicação dos helpers existentes aos 2 campos que faltavam.
- **E7 segue o mesmo padrão de E1** (`Eyebrow $sobreEscuro`) em vez de qualquer solução ad-hoc —
  mantém o design system consistente para as próximas fases.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Os 9 componentes de bloco não tinham `'use client'`, e a Home real não renderizava (500 em runtime)**
- **Found during:** Task 2, ao ligar `page.tsx` ao CMS pela primeira vez e testar com `next dev`/`next build` reais
- **Issue:** `HeroBloco`, `BuscaBloco`, `GradeDeCategoriasBloco`, `ProdutosEmDestaqueBloco`, `DestaqueLedBloco`, `ComoFuncionaBloco`, `DiferenciaisBloco`, `AvaliacoesBloco` e `ChamadaFinalBloco` (criados nas waves 1 e 2, planos 04-03 a 04-06) definem `styled-components` diretamente, mas eram Server Components puros (sem `'use client'`), seguindo a orientação de `04-PATTERNS.md`. Em Server Component puro, o `ThemeContext` do styled-components resolve para `undefined` (Context só existe na árvore de Client Components) — todo bloco lançava `Cannot read properties of undefined (reading 'cor')` em runtime real. Os 163 testes Jest herdados passavam porque Jest não distingue Server/Client Component.
- **Fix:** `'use client'` adicionado aos 9 arquivos, conforme `docs/adr/001-styled-components.md` regra 3 ("componentes estilizados vivem em Client Components").
- **Files modified:** os 9 arquivos de bloco listados acima
- **Verification:** `next dev`/`next build` reais confirmando 200 nas 3 rotas de locale antes/depois
- **Committed in:** `77ff5a1` (parte do commit da Task 2)

**2. [Rule 1 - Bug] 4 títulos com contraste 1.00 sobre fundo escuro (texto invisível)**
- **Found during:** Task 3 (checkpoint de fidelidade, primeira rodada de conferência do usuário no navegador)
- **Issue:** `Heading` (`Typography.tsx`) tinha `color: theme.cor.tinta900` fixo. Sobre as 4 seções/cards de fundo escuro (Hero H1, card-bandeira LED H3, Painéis de LED H2, CTA final H2), o título ficava com a mesma cor do próprio fundo — contraste 1.00, texto presente no DOM/HTML mas literalmente invisível. `jest-axe` não pegou isso porque a regra `color-contrast` do `axe-core` não roda em jsdom (fica "incomplete", nunca "violation").
- **Fix:** Extensão **E7** — `Heading` ganhou `$sobreEscuro?: boolean` (mesmo padrão de `Eyebrow`/E1), trocando a cor para `theme.cor.fundo`. Aplicada nos 4 pontos de uso.
- **Files modified:** `Typography.tsx`, `HeroBloco.tsx`, `GradeDeCategoriasBloco.tsx`, `DestaqueLedBloco.tsx`, `ChamadaFinalBloco.tsx`
- **Verification:** teste de regressão `contraste-fundo-escuro.test.tsx` (comparação `getComputedStyle` heading×fundo nos 4 blocos reais) — confirmado manualmente que falha sem a correção; reconferência do usuário no navegador: 24 títulos na página, 0 abaixo de AA
- **Committed in:** `f43a471`

**3. [Rule 1 - Bug] Chave duplicada na Dynamic Zone (`Encountered two children with the same key`)**
- **Found during:** Task 3 (checkpoint de fidelidade, segunda rodada de conferência)
- **Issue:** `RenderizadorDeBlocos` usava `key={bloco.id ?? i}`. Os ids de componente do Strapi são sequenciais por *tabela* de componente, não por Dynamic Zone — colidem entre tipos diferentes (8 dos 9 blocos da página `home` real do Strapi têm `id: 7`). React reportava 7 erros no overlay e 28 ocorrências no console; risco real de blocos trocarem de identidade entre renders/revalidações.
- **Fix:** chave composta `${i}-${bloco.__component}` em todos os 9 `case`.
- **Files modified:** `renderizador.tsx`
- **Verification:** `renderizador.test.tsx` ganhou caso com dois blocos de tipos diferentes carregando o mesmo `id: 7` — confirmado manualmente que falha com a chave antiga (React `console.error` "Encountered two children with the same key") e passa com a corrigida; reconferência do usuário: zero avisos de chave duplicada
- **Committed in:** `8b2f64c`

**4. [Rule 2 - Missing Critical] Nenhuma rota tinha landmark `<main>`**
- **Found during:** Task 3 (checkpoint de fidelidade, segunda rodada), junto com o defeito 3
- **Issue:** `document.querySelectorAll('main').length === 0` nos três locales — leitores de tela sem atalho para o conteúdo principal, "pular para o conteúdo" sem destino.
- **Fix:** `[locale]/layout.tsx` envolve `{children}` em `<main>` — dono único do landmark, herdado por toda página do site (não repetido em cada `page.tsx`).
- **Files modified:** `layout.tsx`
- **Verification:** Playwright headless confirmando `main: 1` em `/pt-BR`; reconferência do usuário: `main=1` nas 4 combinações verificadas (3 locales desktop + pt-BR 375px)
- **Committed in:** `8b2f64c`

**5. [Rule 1 - Bug] `adaptarBloco` não resolvia mídia de bloco — URL relativa causava 404**
- **Found during:** Task 3 (checkpoint de fidelidade, terceira rodada de conferência)
- **Issue:** `adaptarBloco` tratava rich text mas nunca passava os campos de mídia (`blocos.hero.imagem`, `blocos.destaque-led.imagens`) por `adaptarImagem`/`adaptarImagens`. A URL relativa do Strapi (`/uploads/...`) chegava crua ao componente, e `next/image`/`background-image` resolviam contra a origem do próprio front (`localhost:3000`) em vez da origem do Strapi (`localhost:1337`) — 404, e o mosaico inteiro do Hero ficava sem imagem de fundo. Produtos e categorias não tinham esse problema porque já passavam pelos helpers; `blocos.hero`/`blocos.destaque-led` são os primeiros consumidores de mídia de bloco da Dynamic Zone.
- **Fix:** `adaptarBloco` resolve os dois campos com os helpers já existentes; tipo `Bloco` ajustado para refletir `Imagem`/`Imagem[]` nesses campos (igual a produto/categoria).
- **Files modified:** `adapters.ts`, `DestaqueLedBloco.tsx` (`.alternativeText` → `.alt`)
- **Verification:** 3 testes novos em `adapters.test.ts`, confirmados manualmente como falhando sem a correção (reversão temporária + restauração a partir de backup, com `diff` conferido); Playwright headless: 0 requisições com falha; reconferência do usuário: Hero com as 72 células do mosaico carregando a imagem real, H1 legível por cima
- **Committed in:** `36e7e48`

---

**Total deviations:** 5 auto-fixed (1 blocking, 3 bugs, 1 missing-critical)
**Impact on plan:** Todos os 5 auto-fixes eram necessários para a Home sequer renderizar ou para atender aos critérios de aceite (HOME-04, acessibilidade). Nenhum scope creep — nenhuma mudança tocou funcionalidade fora do que a Home já previa.

## Lição transversal (para as Fases 5–11)

**Os 3 defeitos encontrados no checkpoint de fidelidade (contraste, chave duplicada, mídia crua)
escaparam de 163 testes unitários verdes e só apareceram com navegador real + build real + dados
reais do Strapi.** Nenhum é culpa de teste malfeito — são categorias de defeito que Jest/jsdom
estruturalmente não enxerga:

- **Contraste de cor** exige `getComputedStyle` comparando elemento×fundo (a regra
  `color-contrast` do `axe-core` fica "incomplete" em jsdom, nunca "violation" — precisa de teste
  explícito, não `axe` sozinho).
- **Chave duplicada em lista renderizada a partir do CMS** só aparece com **dados reais** (ids de
  componente colidindo entre tipos) — fixtures de teste com ids artificiais e distintos escondem
  esse problema.
- **URL de mídia relativa vs. absoluta** só quebra com **`next dev`/`next build` reais** servindo
  a página — Jest nunca faz uma requisição de rede de verdade para a imagem.

**Recomendação explícita para as Fases 5–11** (que herdam o mesmo `RenderizadorDeBlocos` e os
mesmos padrões de adaptador): antes de fechar qualquer checkpoint de fidelidade visual,
1. rodar a página real com `next dev` + Strapi real (não só os testes unitários dos componentes
   isolados);
2. conferir contraste com o navegador ou uma ferramenta que renderize de verdade (não confiar
   só em `jest-axe`);
3. se a Dynamic Zone tiver mais de um bloco do mesmo tipo, ou payload real de conteúdo, testar
   a chave de lista com ids potencialmente repetidos entre tipos;
4. checar todo campo de mídia novo introduzido por um bloco contra o adaptador — se o bloco é o
   primeiro a consumir aquele campo, não assumir que a resolução de URL "já funciona".

## Issues Encountered

Nenhum além dos 5 desvios documentados acima — todos encontrados e resolvidos dentro do próprio
checkpoint de fidelidade, em 3 rodadas de conferência/correção com o usuário.

## User Setup Required

None - nenhuma configuração de serviço externo necessária. (O usuário precisou adicionar
`NEXT_PUBLIC_STRAPI_MEDIA_URL` ao próprio `.env.local`, mas isso revelou o defeito 5 de código —
a variável sozinha não resolvia o problema.)

## Next Phase Readiness

- `RenderizadorDeBlocos` é o padrão pronto para as Fases 5–11 reusarem — qualquer página nova de
  Dynamic Zone segue o mesmo `switch` exaustivo, a mesma regra de chave composta, e a mesma
  exigência de `'use client'` em blocos com styled-components.
- `adaptarBloco` agora resolve mídia de bloco corretamente — qualquer novo bloco com campo de
  imagem deve seguir o mesmo padrão (passar por `adaptarImagem`/`adaptarImagens`), não assumir
  que a URL do Strapi já vem absoluta.
- Landmark `<main>` já existe no layout — páginas novas não precisam adicioná-lo.
- HOME-01 e HOME-04 aceitos: a Home é fiel ao layout-fonte em desktop e 375px, sem scroll
  horizontal, com contraste AA, teclado e `prefers-reduced-motion` conferidos, e revalidação por
  publicação no Strapi comprovada sem novo deploy.
- Fase 4 (Home) concluída — sem blocker para a Fase 5 (Catálogo).

---
*Phase: 04-home*
*Completed: 2026-08-18*

## Self-Check: PASSED

Todos os arquivos citados (`renderizador.tsx`, `renderizador.test.tsx`, `page.tsx`, `page.test.tsx`,
`layout.tsx`, `adapters.ts`, `adapters.test.ts`, `Typography.tsx`, `primitives.test.tsx`,
`contraste-fundo-escuro.test.tsx`, `HeroBloco.tsx`, `DestaqueLedBloco.tsx`, `docs/divergencias.md`,
este SUMMARY) confirmados presentes; `FoundationStatus.tsx` confirmado ausente. Todos os 5 hashes
de commit (`135194c`, `77ff5a1`, `f43a471`, `8b2f64c`, `36e7e48`) confirmados em `git log`.
