# Divergências técnicas de implementação

> Registradas **antes de implementar**, conforme a regra do plano: "Se você precisar divergir do HTML
> original por razão técnica, registre aqui com o motivo, antes de implementar."
> (Divergências de conteúdo/design da Fase 00 ficam em `docs/00-divergencias.md`.)

## D1 — Troca desktop↔mobile do chrome: media query em vez de `window.innerWidth`

**Fase:** 02 · **Data:** 2026-08-14

**No layout:** o header/topbar/menu trocam entre desktop e mobile lendo `window.innerWidth < 1080`
em estado React (`this.state.mobile`), injetando `display: flex|none` no `render()`. Não há `@media`.

**Divergência:** implemento a troca com **media query CSS no mesmo breakpoint (1080px)** via
styled-components, em vez de estado JS de viewport.

**Motivo (técnico):**
1. Ler `window.innerWidth` no cliente causa **mismatch de hidratação** (o servidor não conhece a
   largura) e um **flash** + **CLS** na primeira pintura — viola diretamente as metas de Core Web
   Vitals (LCP/CLS) do projeto.
2. Media query resolve no CSS, sem JS, sem shift, e mantém o **mesmo ponto de troca (1080px)** —
   o resultado visual é idêntico ao layout.

**Escopo:** apenas a *visibilidade* desktop/mobile do chrome. Toda a escala fluida (clamp) e os grids
`auto-fit` seguem exatamente como no layout. O breakpoint fica em `theme.breakpoint.header` (1080px).

**Reversível:** trocar a media query por container query ou por estado é local ao componente `Header`.

## D2 — Card de produto: variantes por props booleanas, não por `tipoDeItem`

**Fase:** 02 · **Data:** 2026-08-17

**No layout:** o card de produto tinha três variações de controle conforme a página — seletor de cor
via `<select>` na Home, cor via swatches + badge "SERVIÇO TÉCNICO" + bloco "ESCOPO" no Catálogo, e
badge/escopo sem seletor de cor na Categoria (`docs/00-divergencias.md` item 7).

**Divergência:** `src/components/product/ProductCard.tsx` implementa um único componente
`ProductCard` (`ProdutoResumo`) cujas variantes de controle vêm das props `ehServico`, `escopo` e
`cores` — não existe uma prop `tipoDeItem` no componente, e o seletor de cor é sempre `ColorSwatches`
(o `<select>` da Home não foi reconstituído).

**Motivo (técnico):**
1. A variação de controle foi unificada em swatches + `ehServico`/`escopo`, que já cobrem as três
   apresentações do layout com um único componente de apresentação.
2. O `tipoDeItem` do CMS (`fisico`, `com-variacao`, `servico-tecnico`, `pacote`, em
   `cms/src/api/product/content-types/product/schema.json`) é traduzido para essas props no
   adaptador (`src/lib/cms/adapters.ts`), e não dentro do componente — para manter o card sem
   conhecimento do modelo do CMS.
3. Essa tradução acontece nas fases 5 e 7, quando as páginas de catálogo e produto forem ligadas ao
   CMS de verdade.

**Escopo:** apenas a origem do dado de controle do `ProductCard` (props booleanas/escalares em vez de
uma prop `tipoDeItem`). A anatomia visual do card (badge, escopo, swatches, stepper) segue fiel ao
layout.

**Reversível:** trocar as props booleanas por uma prop única `tipoDeItem` é local ao componente
`ProductCard` e ao adaptador que o alimenta.
