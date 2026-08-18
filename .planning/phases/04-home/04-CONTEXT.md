# Phase 4: Home - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning
**Source:** Orquestrador — derivado do ROADMAP, `docs/00-inventario.md`, dos blocos reais do CMS
(`cms/src/components/blocos/`) e do que as Fases 2 e 3 já entregaram

<domain>
## Phase Boundary

A Fase 4 liga a primeira página real ao CMS: `/[locale]` renderiza os 9 blocos da Home a partir da
Dynamic Zone do Strapi, com fidelidade ao `Home.dc.html` e sem preço em lugar nenhum.

É também a fase que estabelece **três padrões que as Fases 5 a 11 vão herdar**, e por isso eles
importam mais que a Home em si:

1. **O renderizador de Dynamic Zone** — como um array de `__component` vira árvore de componentes.
   Toda página de conteúdo do projeto passa a usar isto.
2. **A fronteira Server/Client** — busca de dados no Server Component, componentes estilizados nas
   folhas recebendo props (decisão travada `DEC-styled-components`).
3. **O módulo `dataLayer` tipado** — porta única de saída de eventos, com lint barrando
   `window.dataLayer.push` solto. Puxado da Fase 13 para cá porque as Fases 4–11 já emitem eventos.

**Dentro do escopo:** rota `/[locale]`, renderizador da Dynamic Zone, os 9 blocos da Home, o módulo
`dataLayer` com `view_item_list`, e a conferência de fidelidade em desktop e 375px.

**Fora do escopo:**
- GTM, GA4, Pixel e Consent Mode — Fase 13. Esta fase entrega só a **porta tipada**; o transporte vem depois.
- Catálogo, categoria, produto — Fases 5 a 7.
- Metadata/JSON-LD da Home — Fase 12 (a Home terá `<title>` básico, não o pacote de SEO).
- Otimização de Core Web Vitals — Fase 14 (mas não introduzir dívida óbvia: imagem sem dimensão, fetch no cliente).

</domain>

<decisions>
## Implementation Decisions

### Regra inviolável (herdada, TRAVADA)
Nenhum preço, valor monetário ou vocabulário de compra em nenhum bloco da Home. A guarda
`src/__tests__/guards/no-price.test.ts` já varre `src/` e falha o build. `view_item_list` **não pode**
carregar `value`, `currency`, `price` ou `revenue`.

### Origem dos dados: CMS, não módulo estático
- A Home busca por `getPagina(locale, 'home')` — `src/lib/cms/adapters.ts`, já implementado e
  verificado na Fase 3.
- Nav e rodapé passam a vir de `getNavPrincipal` / `getColunasRodape` / `getSettingsGlobais`,
  substituindo o placeholder `src/lib/site/navigation.ts`. **Isto fecha a pendência do item 6 de
  `docs/00-divergencias.md`**, onde os hrefs ainda são âncoras (`#led`, `#luzsom`) em vez dos slugs
  reais das 5 categorias (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`).
- Avaliações vêm de `getAvaliacoes()`, que filtra `publicada`. **Nunca semear depoimento fictício** —
  quando não há avaliação real, renderizar o estado vazio do design.

### O que a Fase 2 já entregou e NÃO deve ser reimplementado
Tema (`src/lib/theme`), primitivos (`Typography`, `Button`, `Field`, `Chip`, `QuantityStepper`,
`ColorSwatches`, `Container`), chrome (`TopBar`, `Header`, `MobileMenu`, `Footer`), feedback
(`Notice`, `Toast`, `SectionDivider`, `Skeleton`, `EmptyState`), media (`ImagePlaceholder`) e
`ProductCard` com 3 variantes. Os blocos da Home **compõem** esses componentes; se algum precisar de
variante nova, estender o existente, não criar paralelo.

### Blocos da Home e o componente do CMS que os alimenta
Ordem exata do layout (`docs/00-inventario.md` §Home):

| # | Bloco | Componente Strapi |
|---|---|---|
| 1 | Hero — "O palco é seu. Nós levamos a estrutura." | `blocos.hero` |
| 2 | Busca grande | `blocos.busca` |
| 3 | Grade de categorias — card-bandeira LED + 4 | `blocos.grade-de-categorias` |
| 4 | Produtos em destaque (slider, 5 itens) | `blocos.produtos-em-destaque` |
| 5 | Painéis de LED — P1.9/P3.9, listas, galeria de 3 | `blocos.destaque-led` |
| 6 | Como funciona (4 etapas) | `blocos.como-funciona` |
| 7 | Diferenciais (5 blocos) | `blocos.diferenciais` |
| 8 | Avaliações (estados cheio/vazio/carregando) | `blocos.avaliacoes` |
| 9 | CTA final | `blocos.chamada-final` |

Os schemas Zod dos 13 blocos já existem em `src/lib/cms/schemas.ts` e há teste de contrato garantindo
que modelo e schema não derivem. Blocos 4, 5 e 8 têm dado próprio (produtos, avaliações) que o
componente do CMS **não** carrega — o bloco traz só o cabeçalho da seção; a lista vem por adaptador.

### Renderizador da Dynamic Zone
- Um mapa `__component → componente React`, com bloco desconhecido **ignorado silenciosamente** (o
  adaptador `adaptarBlocos` já filtra `null`; o renderizador não deve quebrar se receber tipo novo).
- Blocos são Server Components por padrão. `"use client"` só onde há interação real: slider de
  destaques, campo de busca, toast. Fronteira o mais fundo possível.
- Rich text já chega sanitizado como `HtmlSeguro` — o renderizador nunca chama `sanitizarRichText`
  de novo, e nunca aceita string crua em `dangerouslySetInnerHTML` (guarda
  `src/__tests__/guards/html-sanitizado.test.ts` já barra).

### Módulo `dataLayer` tipado (MED-01)
- Um módulo único, com união discriminada por nome de evento e payload tipado por evento.
- `window.dataLayer.push` direto é **proibido fora do módulo** e barrado por regra de lint (ESLint
  flat config) mais teste de guarda no padrão das guardas existentes.
- Fila segura: se o `dataLayer` ainda não existe (GTM entra só na Fase 13), o módulo enfileira sem
  quebrar. Nada de `window.dataLayer = window.dataLayer || []` espalhado pelo código.
- Nesta fase só `view_item_list` é emitido. O catálogo de eventos completo vem com as fases que os
  usam.

### Fidelidade (HOME-04)
- Comparação lado a lado com `projeto-base/All Music Rentals - Home.dc.html` em desktop e em 375px.
- Sem `@media` inventada: o layout-fonte é fluido por `clamp()` e grid `auto-fit/minmax`. A única
  media query permitida é a do chrome em 1080px, já decidida em `docs/divergencias.md` D1.
- 375px sem scroll horizontal.

### Claude's Discretion
- Estrutura de arquivos dos blocos (`src/components/blocos/` ou `src/app/[locale]/(home)/blocos/`).
- Implementação do slider (CSS scroll-snap é preferível a biblioteca, pelo orçamento de JS).
- Como a Home degrada se o CMS estiver indisponível ou a página `home` não existir no Strapi.

</decisions>

<canonical_refs>
## Canonical References

### Fonte da verdade visual
- `projeto-base/All Music Rentals - Home.dc.html` — layout-fonte da Home
- `docs/00-inventario.md` §Home (linha 71) — ordem e conteúdo dos blocos
- `docs/tokens/tokens.json` e `docs/tokens/tokens.md` — tokens extraídos

### Camada CMS (Fase 3, verificada)
- `src/lib/cms/adapters.ts` — `getPagina`, `getCategorias`, `getAvaliacoes`, `getProdutos`, `getNavPrincipal`, `getColunasRodape`, `getSettingsGlobais`
- `src/lib/cms/schemas.ts` — schemas dos 13 blocos, `blocoTolerante`, `adaptarBlocos`
- `src/lib/cms/sanitize.ts` — `HtmlSeguro`, o tipo que o renderizador exige
- `cms/src/components/blocos/*.json` — os campos reais de cada bloco

### Design system (Fase 2)
- `src/lib/theme/` — tema, escala fluida, keyframes, helper de media
- `src/components/primitives/`, `chrome/`, `feedback/`, `media/`, `product/`
- `src/app/[locale]/design-system` — showcase de todos os componentes e estados

### Decisões travadas
- `docs/adr/001-styled-components.md` — busca em Server Component, estilo nas folhas
- `docs/adr/002-locale-padrao.md` — pt-BR padrão, roteamento por prefixo
- `docs/divergencias.md` D1 (media query do chrome) e D2 (props do ProductCard)
- `.planning/phases/03-strapi-cms/03-VERIFICATION.md` — o que a Fase 3 garante

</canonical_refs>

<specifics>
## Specific Ideas

- Hero: título "O palco é seu. Nós levamos a estrutura."
- Grade de categorias: **card-bandeira LED** (destaque) + 4 cards (Estruturas, Luz & Som, Tendas, Móveis).
- Seção LED: listas "O QUE INSTALAMOS" / "O QUE EXIBIMOS" + galeria de 3 imagens.
- Avaliações: 4 depoimentos no layout-fonte, mas **são exemplos de design** (item 13 de
  `docs/00-divergencias.md`, fechado como ℹ️ INTENCIONAL). Com o CMS vazio, renderiza o estado vazio.
- Skeleton de avaliações usa `amrPulse`, já no tema.
- Contato global: `(689) 242-1871` / `contato@allmusicbr.com` — vem de `settings-globais`, não hardcoded.
- Sem endereço físico, mapa ou redes sociais em nenhuma página.
- A Home **não** tem barra fixa de orçamento (presença condicional — item 10, ℹ️ INTENCIONAL).

</specifics>

<deferred>
## Deferred Ideas

- GTM/GA4/Pixel e Consent Mode — Fase 13
- Metadata API, hreflang, JSON-LD `ItemList` da Home — Fase 12
- Lighthouse CI e orçamento de JS por rota — Fase 14
- CSP com nonce (afeta styled-components e GTM) — Fase 15
- Página de catálogo, categoria e produto — Fases 5 a 7

</deferred>

---

*Phase: 04-home*
*Context gathered: 2026-08-17 pelo orquestrador*
