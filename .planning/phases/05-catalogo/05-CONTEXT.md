# Phase 5: Catálogo - Context

**Gathered:** 2026-08-18
**Status:** Ready for planning
**Source:** Orquestrador — ROADMAP, `docs/00-inventario.md`, o array `CATALOGO` do layout-fonte, o
modelo real do Strapi, e 3 decisões do usuário tomadas em 2026-08-18

<domain>
## Phase Boundary

A Fase 5 entrega `/[locale]/catalogo`: busca por texto, 5 grupos de filtro combinados, drawer mobile,
chips de filtro ativo, ordenação, grade e os quatro estados (vazio, carregando, sem resultados, erro).

**Dentro do escopo:** a rota e tudo que ela contém, mais a **taxonomia `tipo-de-evento` no CMS**
(decisão 1 abaixo), que não existia.

**Fora do escopo:**
- Página de categoria (Fase 6) e de produto (Fase 7) — o card do catálogo linka para elas, e os links
  darão 404 até lá. Mesma regra já aplicada na Fase 4.
- Carrinho/orçamento (Fase 8) — o botão "adicionar" do card fica **inerte**, como já ficou no slider
  da Home.
- SEO/metadata da rota (Fase 12) e medição via GTM (Fase 13).

</domain>

<decisions>
## Decisões do usuário (2026-08-18, TRAVADAS)

### 1. `tipo-de-evento` vira taxonomia de primeira classe no CMS
O filtro "Tipo de evento" não tinha campo no modelo — o mais próximo era `aplicacoes`, um `json` de
texto livre, que torna a query frágil (sem vocabulário controlado, quebra com variação de grafia).

**Decisão:** criar a taxonomia no Strapi e relacioná-la ao produto (many-to-many), de modo que o filtro
seja query real e indexável. Serve também à **Fase 9**, cuja etapa 2 do formulário tem "Tipo de evento"
com 10 opções — a mesma taxonomia deve alimentar os dois.

Vocabulário observado nos 10 produtos do layout-fonte (9 valores):
`Casamento · Aniversário · Festa · Evento ao ar livre · Feira · Evento corporativo · Ativação de marca · Show · Festival`

Ao criar, **migrar o conteúdo de `aplicacoes`** dos 10 produtos já cadastrados para a nova relação.
O campo `aplicacoes` pode continuar existindo para texto livre editorial, mas **não** é mais a fonte do
filtro.

### 2. Os rótulos do catálogo são subcategorias, não categorias
O layout-fonte filtra por `Área externa · Mesas de coquetel · Capas de mesa · Painéis de LED`, que
**não são** as 5 categorias do site (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`).

**Decisão:** as 5 categorias seguem sendo a taxonomia de navegação; os rótulos do catálogo viram
**subcategorias** (o campo `subcategorias` já existe no content-type de categoria). O filtro
"Categoria" do catálogo usa as 5 reais. Isso é coerente com a divergência 11, já fechada como "o
produto no CMS é a fonte única".

### 3. Os 10 produtos do layout foram cadastrados (feito pelo orquestrador, ambiente pronto)
Extraídos do array `CATALOGO` de `projeto-base/All Music Rentals - Catalogo.dc.html` — cópia real do
layout-fonte, conteúdo de **estrutura**, não fictício. Já publicados em pt-BR:

| slug | categoria | tipoDeItem | cores |
|---|---|---|---|
| guarda-sol | tendas | fisico | Bege |
| mesa-alta | moveis | fisico | — |
| capa-spandex | moveis | **com-variacao** | Preto, Branco, Bege |
| capa-6 | moveis | fisico | Preto |
| led-p19 | telas-de-led | fisico | — |
| led-p39 | telas-de-led | fisico | — |
| led-pacote | telas-de-led | **pacote** | — |
| operacao-led | telas-de-led | **servico-tecnico** | — |
| lounge | moveis | fisico | Bege, Preto |
| mesa-bistro | moveis | fisico | Preto |

Os 4 arquétipos de `tipoDeItem` estão representados — útil para a Fase 7. 5 deles estão marcados
`destaque: true` (o slider da Home esperava 5 e estava vazio).

**Divergência do inventário:** `docs/00-inventario.md` diz "Grade (11 produtos)"; o array real tem
**10**. Registrar.

</decisions>

<conflitos>
## Conflito aberto que a Fase 6 precisa resolver

O ROADMAP da **Fase 6** declara como critério de sucesso: *"`luz-e-som`, `tendas` e `moveis` mostram o
estado 'em preparação' em vez de uma grade vazia"* — ou seja, essas 3 categorias deveriam estar **sem
produtos**.

Mas o mapeamento natural dos produtos do layout coloca 5 em `moveis` (mesas, capas, lounge) e 1 em
`tendas` (guarda-sol). Só `luz-e-som` fica realmente vazia.

Mapeei pela natureza do produto, porque é o que o cliente reconhece, e **não** forcei tudo em
`estruturas` só para preservar a expectativa da Fase 6. As duas leituras possíveis:
- **(a)** a Fase 6 estava assumindo um catálogo vazio, e o critério deve ser reescrito para "categoria
  sem produtos mostra 'em preparação'" — condicional, não lista fixa; ou
- **(b)** o mapeamento deve mudar quando o cliente definir o conteúdo real.

Não decidi por nenhuma — é decisão de conteúdo. **Levar ao usuário antes de planejar a Fase 6.**

</conflitos>

<decisoes_tecnicas>
## Decisões técnicas herdadas (não renegociáveis)

- **Sem preço.** O card do catálogo não mostra valor. O card "SOBRE OS VALORES" do hero é justamente a
  explicação de por que não há preço — cópia exata do layout-fonte.
- **`emitirEvento` é a porta única de eventos** (`src/lib/analytics/dataLayer.ts`, Fase 4). Esta fase
  emite `search`, `filter_applied` e `view_item_list`. O tipo rejeita campo monetário em compilação;
  ESLint barra `window.dataLayer.push` e `dataLayer.push`. Em teste, mocke
  `@/lib/analytics/dataLayer`.
- **Busca em Server Component, estilo nas folhas** (ADR 001). Mas atenção à lição da Fase 4: todo
  componente que declara `styled` precisa de `'use client'` — o `ThemeContext` não existe em Server
  Component puro.
- **Sem `@media` nova.** Fluidez por `clamp()` e grid `auto-fit/minmax`. A única media query do projeto
  é a troca do chrome em 1080px (D1). O drawer mobile de filtros precisa resolver a troca sem
  introduzir breakpoint novo — ver Q1 do UI-SPEC da Fase 4, que decidiu `auto-fit` no lugar de grid por
  JS (divergência D3).
- **`mapearParaProductCard`** (`src/lib/product/`, Fase 5 herda da Fase 4) é a ponte `Produto` →
  `ProdutoResumo`. O card não conhece o modelo do CMS.
- **AND entre grupos, OR dentro do grupo** — regra do inventário (§130), vale para os 5 filtros.

## Claude's Discretion

- Onde a filtragem acontece: query ao Strapi por parâmetro de URL, ou carregar e filtrar no cliente.
  Com 10 produtos qualquer um serve, mas a escolha define o comportamento com centenas — decidir com
  os olhos no futuro, e justificar.
- Se o estado dos filtros vive na URL (compartilhável, volta pelo histórico) ou só em memória.
  A busca já chega por `?q=` vinda da Home, o que sugere URL.
- Estrutura de arquivos dos componentes de filtro.

</decisoes_tecnicas>

<canonical_refs>
## Canonical References

### Fonte da verdade visual e de dados
- `projeto-base/All Music Rentals - Catalogo.dc.html` — layout-fonte; contém o array `CATALOGO` (10
  produtos com os 5 eixos de filtro) e o array de grupos de filtro com seus rótulos e estado `aberto`
- `docs/00-inventario.md` §Catálogo (linha ~74) e §130 (taxonomias e regra AND/OR)

### Camada CMS
- `src/lib/cms/adapters.ts` — `getProdutos(locale, filtro)` já aceita `categoria`, `destaque`, `busca`,
  paginação; `getCategorias`
- `src/lib/cms/schemas.ts` — `produtoSchema` (com `categoria`, `tipoDeItem`, `ambiente`, `variacoes`,
  `aplicacoes`)
- `cms/src/api/product/content-types/product/schema.json` — o modelo a estender com `tipo-de-evento`

### Padrões da Fase 4 a reusar (não reinventar)
- `src/components/blocos/renderizador.tsx` — `switch` exaustivo da Dynamic Zone
- `src/components/blocos/SearchBarGrande.tsx` — a busca da Home (extensão E5); o catálogo tem busca
  própria, conferir o que dá para compor
- `src/components/analytics/EmissorViewItemList.tsx` — emissão de `view_item_list`
- `src/lib/product/mapearParaProductCard.ts`
- `src/app/[locale]/layout.tsx` — chrome e `<main>` já montados; a rota nova herda

### Design system
- `src/components/primitives/` — Chip (para os chips de filtro), Field, Button, ColorSwatches (para o
  filtro de cor), QuantityStepper, Container
- `src/components/feedback/` — Skeleton, EmptyState, Notice, Toast
- `src/components/product/ProductCard.tsx` — 3 variantes
- `src/app/[locale]/design-system` — showcase

</canonical_refs>

<specifics>
## Specific Ideas

- Grupos de filtro do layout, com o estado inicial `aberto` que o array define: Categoria · Tipo de
  item · Cor (swatches `Bege #D8C9A8`, `Preto #0B0C0D`, `Branco #FFFFFF`) · Tipo de evento · Ambiente.
- Ordenação: 5 opções (conferir os rótulos exatos no layout-fonte).
- Estado sem resultados: **"Amplie a busca ou fale com a equipe"** — texto do layout.
- A barra fixa de orçamento existe no catálogo (ausente na Home) — item 10 das divergências, fechado
  como ℹ️ INTENCIONAL: é presença condicional, e a implementação é da Fase 8.
- A busca da Home já navega para `/[locale]/catalogo?q=...` — este é o primeiro consumidor real desse
  contrato.

</specifics>

<deferred>
## Deferred Ideas

- Página de categoria (Fase 6), produto (Fase 7), carrinho (Fase 8)
- Metadata/JSON-LD `ItemList` da rota (Fase 12)
- GTM/GA4/Pixel (Fase 13) — esta fase só emite pela porta tipada
- Paginação ou scroll infinito, se o catálogo crescer — com 10 produtos não se justifica; registrar
  como decisão adiada em vez de implementar por antecipação

</deferred>

---

*Phase: 05-catalogo*
*Context gathered: 2026-08-18 pelo orquestrador*
