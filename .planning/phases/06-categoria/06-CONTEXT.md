# Phase 6: Categoria - Context

**Gathered:** 2026-08-22
**Status:** Ready for planning

<domain>
## Phase Boundary

A Fase 6 entrega `/[locale]/categoria/[slug]`: um único modelo de página servindo as 5 categorias
(`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`), com hero, subcategorias numeradas,
aplicações, FAQ, filtros toggle horizontais, grade de produtos, breadcrumb e `ItemList`. O
comparativo LED P1.9 × P3.9 aparece **só** em `telas-de-led`.

**Dentro do escopo, além da rota:**
- Componente `shared.aplicacao` no CMS e campo `aplicacoes` na categoria (D-04)
- Flag `emPreparacao` na categoria (D-01)
- Relação produto → subcategoria (D-09)
- Single type "Comparativo LED" (D-08)
- **Seed pt-BR do conteúdo das 5 categorias** (D-06) — sem ele nenhum critério é verificável
- Componente de breadcrumb (não existe no projeto)
- Generalização de `src/lib/catalogo/filtros.ts` para grupos parametrizados (D-10)

**Fora do escopo:**
- Página de produto (Fase 7) — o card da grade linka para lá e dará 404 até então, mesma regra das
  Fases 4 e 5
- Carrinho/orçamento (Fase 8) — o CTA "SOLICITAR ORÇAMENTO" do estado "em preparação" fica inerte
- Eixos de filtro `porte`, `montagem` e `distancia` (D-09) — sem campo no CMS, adiados
- SEO/metadata e JSON-LD da rota (Fase 12); GTM (Fase 13)
- Locales `en` e `es` do conteúdo cadastrado — pt-BR primeiro, como no catálogo

</domain>

<decisions>
## Implementation Decisions

### Estado "em preparação" e estados vazios

- **D-01:** Uma categoria mostra "em preparação" quando a flag booleana `emPreparacao` está marcada
  no CMS **ou** quando não há produtos publicados nela. Híbrido deliberado: a contagem cobre "ainda
  não cadastrei nada" sem manutenção, a flag cobre "tenho produtos mas a categoria não está pronta".
  O layout-fonte já usava só a contagem (`emPreparacao: c.produtos.length === 0`), então a flag é
  acréscimo, não conflito.
- **D-02:** **O critério do ROADMAP está desatualizado e deve ser reescrito.** Ele fixa
  `luz-e-som`, `tendas` e `moveis` como as categorias "em preparação". A contagem real medida em
  produção em 2026-08-22 é: `estruturas` 0 · `telas-de-led` 4 · `luz-e-som` 0 · `tendas` 1 ·
  `moveis` 5. Duas da lista têm produto e `estruturas`, que está vazia, ficou de fora. O critério
  passa a ser condicional, não uma lista. Isso encerra o conflito que `05-CONTEXT.md` §conflitos
  deixou explicitamente para esta fase.
- **D-03:** A cópia do estado "em preparação" fica **fixa no código**, igual ao layout-fonte, e é
  traduzida pela mesma via dos outros textos de UI. É cópia institucional, não varia por categoria.
  O estado substitui **apenas a grade** — hero e subcategorias permanecem acima dele (o texto diz
  "os equipamentos listados acima", o que prova a posição).
- **D-04:** O estado "sem resultado" **reusa `src/components/catalogo/EstadoSemResultados.tsx`**
  (Fase 5), parametrizando eyebrow, corpo e ação. O CATG-04 pede texto distinto do catálogo; o
  layout entrega isso pelo eyebrow e pelo corpo, mantendo o mesmo título. Não criar um segundo
  componente — duplicação foi exatamente como o defeito de contraste do rodapé sobreviveu à Fase 5.

### Conteúdo da categoria no CMS

- **D-05:** `aplicacoes` vira um **componente novo `shared.aplicacao`** com a mesma forma de
  `shared/subcategoria.json` (`nome: string obrigatório`, `descricao: text`), repetível na
  categoria. Não reusar `shared.subcategoria` diretamente: o admin exibiria "Subcategoria" dentro do
  campo Aplicações, e as duas coisas convivem na mesma categoria.
- **D-06:** O **FAQ da categoria já está modelado** — `cms/src/api/faq-item` já tem
  `categoria → api::category.category`, mais `ordem` e `destaque`. Nenhuma mudança de modelo
  necessária: basta filtrar por relação. (Descoberto na análise; não presumir que falta.)
- **D-07:** O **seed pt-BR das 5 categorias entra no escopo desta fase**, espelhando a Fase 5 (que
  cadastrou os 10 produtos). Hoje as 5 categorias existem em produção completamente vazias — sem
  `descricao`, sem `hero`, sem subcategorias — e há 0 `faq-items`. Sem seed, o critério "hero,
  subcategorias numeradas, aplicações e FAQ próprios do CMS" não pode ser demonstrado. Volume no
  layout-fonte: 48 itens `{nome, desc}` entre subcategorias e aplicações, mais 11 perguntas de FAQ.

### Comparativo LED

- **D-08:** O conteúdo do comparativo é **editável no CMS**, como um **single type "Comparativo
  LED"**, e o código o renderiza **somente quando o slug é `telas-de-led`** — a mesma guarda que o
  layout usa (`ehLed: c.slug === 'telas-de-led'`). Single type e não componente de categoria: existe
  exatamente um comparativo no projeto, então é impossível duplicá-lo ou colá-lo na categoria
  errada, e a garantia do CATG-03 vira estrutural em vez de editorial.
  > **Divergência registrada:** a recomendação era manter tudo no código, seguindo o precedente do
  > `DestaqueLedBloco` da Home (que trata pixel pitch como "conteúdo de design, não do CMS") e o
  > fato de a régua ser derivada dos próprios números 1,9 e 3,9. O usuário optou por CMS editável
  > em 2026-08-22, ciente do custo de cadastrar 7 linhas × 3 colunas no admin. Decisão do usuário
  > prevalece.

### Filtros da categoria

- **D-09:** A fase entrega **3 eixos de filtro**: `subcategoria` (novo — relação produto →
  subcategoria), `ambiente` e `tipoDeItem` (ambos já existem como enum no produto). Os eixos
  `porte`, `montagem` e `distancia` que o layout mostra **não têm campo no CMS** e ficam adiados:
  exigiriam três taxonomias novas mais a reclassificação dos 10 produtos já cadastrados, com
  informação que ninguém tem hoje. `subcategoria` entra porque é o eixo estruturante da página — sem
  ele a lista de subcategorias numeradas não filtra nada — e porque a Fase 5 já decidiu que "os
  rótulos do catálogo são subcategorias".
- **D-10:** **Generalizar `src/lib/catalogo/filtros.ts`** (308 linhas) para grupos parametrizados,
  em vez de criar um módulo paralelo. Hoje `IdGrupoFiltro` é um union fixo
  (`categoria|tipo|cor|evento|ambiente`); a categoria precisa de `sub` com **rótulo variável por
  categoria** ("Subcategoria" em `estruturas`, "Configuração" em `telas-de-led`).
  `parseFiltrosDaUrl`, `serializarFiltros`, `alternarValor`, `descreverChips` e
  `contarFiltrosAtivos` são reaproveitados. Os 58 testes e2e do catálogo (verdes em 2026-08-21) são
  a rede de segurança contra regressão.

### Claude's Discretion

- Forma exata do componente de breadcrumb (não existe no projeto; CATG-05 exige um) e onde ele mora
  na árvore de componentes.
- Se o filtro por subcategoria consulta o Strapi por parâmetro ou filtra em memória — mesma decisão
  que a Fase 5 deixou em aberto, com os mesmos critérios (decidir olhando o futuro, e justificar).
- Estrutura de arquivos dos componentes da categoria.
- Como a relação produto → subcategoria é modelada no Strapi (componente repetível, relação a um
  content-type novo, ou enum por categoria) — desde que o filtro seja query real e não texto livre,
  a mesma lição que motivou `tipo-de-evento` na Fase 5.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Fonte da verdade visual e de conteúdo
- `projeto-base/All Music Rentals - Categoria.dc.html` — layout-fonte da página. Contém o array
  `CATEGORIAS` (5 categorias com `subs`, `aplicacoes`, `faq`, `filtros`, `hero`), o array
  `COMPARATIVO` (as 7 linhas da tabela LED), o método `tabela()` que a renderiza, e `filtrosUI()`
- `docs/00-inventario.md` §130 — taxonomias e a regra AND entre grupos / OR dentro do grupo

### Decisões anteriores que restringem esta fase
- `.planning/phases/05-catalogo/05-CONTEXT.md` — §conflitos deixou a decisão do "em preparação"
  explicitamente para a Fase 6 (encerrada aqui em D-02); decisão 2 fixou que os rótulos do catálogo
  são subcategorias
- `.planning/phases/04-home/04-CONTEXT.md` — divergência D3: `auto-fit` no lugar de grid por JS
- `docs/adr/001-*.md` — busca em Server Component, estilo nas folhas

### Camada CMS
- `cms/src/api/category/content-types/category/schema.json` — hoje: `nome, slug, descricao,
  subcategorias, hero, ordem, produtos, seo`. A estender com `aplicacoes` e `emPreparacao`
- `cms/src/api/faq-item/content-types/faq-item/schema.json` — **já tem** `categoria`, `ordem`,
  `destaque`
- `cms/src/api/product/content-types/product/schema.json` — tem `ambiente` e `tipoDeItem` (enums);
  **não** tem subcategoria, porte, montagem nem distância
- `cms/src/components/shared/subcategoria.json` — a forma a espelhar em `shared.aplicacao`
- `cms/src/index.ts` — `garantirPermissoesPublicas()` libera `find`/`findOne` por código; qualquer
  content-type novo (o single type do comparativo) precisa entrar na lista `PUBLIC_READ`
- `src/lib/cms/adapters.ts` — `getCategorias`, `getProdutos(locale, filtro)`; as tags de cache
- `src/app/api/revalidate/route.ts` — `MODELO_TAG`; um modelo novo sem entrada aqui não revalida

### Padrões a reusar (não reinventar)
- `src/lib/catalogo/filtros.ts` — a camada a generalizar (D-10)
- `src/components/catalogo/EstadoSemResultados.tsx` — o estado vazio a parametrizar (D-04)
- `src/components/catalogo/PainelDeFiltros.tsx`, `SwatchesDeCor.tsx`, `ToolbarDoCatalogo.tsx` — os
  filtros do catálogo, dos quais os toggles da categoria devem ser **visualmente distintos** (CATG-02)
- `src/components/blocos/GradeDeCategoriasBloco.tsx:203` — **já linka para
  `/${locale}/categoria/${slug}`**; a rota está fixada desde a Fase 4 e está em produção
- `src/components/blocos/DestaqueLedBloco.tsx` — o bloco LED da Home; precedente de pixel pitch
- `src/lib/product/mapearParaProductCard.ts` — ponte `Produto` → `ProdutoResumo`
- `src/lib/analytics/dataLayer.ts` — `emitirEvento` é a porta única; esta fase emite `view_item_list`
- `src/lib/theme/theme.ts` — `textoMutedClaro` é o token para texto sobre fundo escuro

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `filtros.ts` (308 linhas): estado na URL, toggle, chips e contagem já resolvidos e cobertos por
  e2e. Generalizar, não duplicar.
- `EstadoSemResultados.tsx`: já passou pelo axe depois da correção de contraste de 2026-08-21.
- `faq-item` com relação a categoria: metade do CATG-01 já modelada.
- Componentes `shared/`: `subcategoria`, `pergunta-resposta`, `caracteristica`, `medida`,
  `variacao`, `seo` — o vocabulário de componentes já existe.

### Established Patterns
- **Sem preço em nenhuma camada.** Ver a pendência sobre o rótulo do critério 7, abaixo.
- **Sem `@media` nova.** Fluidez por `clamp()` e `auto-fit/minmax`; a única media query do projeto é
  a troca de chrome em 1080px. O layout-fonte empilha a tabela LED em 760px medindo viewport em
  **JS** (`vw < 760 ? '1fr' : 'repeat(2,1fr)'`) — **não copiar essa abordagem**; a Fase 4 resolveu o
  caso análogo com `auto-fit` (divergência D3).
- **`'use client'` em todo componente que declara `styled`** — o `ThemeContext` não existe em Server
  Component puro (lição da Fase 4).
- **Contraste medido contra a superfície real.** O layout-fonte usa `#6B7072` (o antigo `textoMuted`)
  para rótulos sobre a tabela escura `#141618`/`#1C1E20` — exatamente o defeito corrigido no rodapé
  em 2026-08-21 (3.85:1). Usar `textoMutedClaro` sobre fundo escuro. **Não replicar o layout aqui.**
- **Toda resposta do CMS validada por Zod na borda** (`src/lib/cms/client.ts`).

### Integration Points
- A rota nova herda o chrome de `src/app/[locale]/layout.tsx`.
- `hero` da categoria é campo de **media**: o seed exige upload de imagem. Atenção ao volume montado
  em `/app/public/uploads` em produção — foi ele que obrigou `--exclude files` no `strapi transfer`
  de 2026-08-21. Planejar o caminho das imagens antes de executar o seed.
- Content-type novo exige entrada em `PUBLIC_READ` (`cms/src/index.ts`) **e** em `MODELO_TAG`
  (`src/app/api/revalidate/route.ts`), senão a leitura pública dá 403 e a edição não revalida.

</code_context>

<specifics>
## Specific Ideas

**Cópia exata do estado "em preparação"** (layout-fonte, fixada em D-03):
> eyebrow `CATEGORIAS MAPEADAS · CADASTRO EM ANDAMENTO`
> título **Os itens desta categoria ainda não estão publicados**
> corpo "Já trabalhamos com os equipamentos listados acima. Enquanto o cadastro é concluído,
> descreva o que seu evento precisa e a equipe responde com o que temos disponível na data."
> ações `SOLICITAR ORÇAMENTO` (inerte até a Fase 9) e `VER TODO O CATÁLOGO` (destino real)

**Cópia exata do estado "sem resultado"**:
> eyebrow `NENHUM ITEM COM ESSA COMBINAÇÃO`
> título "Amplie a busca ou fale com a equipe" (o mesmo do catálogo)
> corpo "Tente remover o filtro mais específico. Se o item que você procura não estiver publicado,
> descreva a necessidade — trabalhamos com configurações sob medida."
> ação `Remover todos os filtros`

**Comparativo LED** — eyebrow `ESCOLHA DA TELA`, título "P1.9 ou P3.9: qual tela o seu evento pede",
parágrafo didático sobre pixel pitch, dois cartões (P1.9 "DENSIDADE DE PONTOS ALTA" / P3.9
"DENSIDADE DE PONTOS MÉDIA"), bloco `REGRA PRÁTICA`, régua **0 M → 10 M** com marcadores em
**1,9 M · P1.9** e **3,9 M · P3.9** (a posição percentual é o próprio pitch sobre a escala de 10),
duas notas de público (menos de 2 m / mais de 4 m), a tabela de 7 critérios, e o CTA
`NÃO SEI QUAL ESCOLHER — QUERO AJUDA`.

**As 7 linhas da tabela** (array `COMPARATIVO`): Distância mínima confortável · Público típico ·
Conteúdo que se sai melhor · Ambiente · Uso mais comum · Módulo · Área de tela pelo mesmo
investimento.

**Rótulo do grupo `sub` varia por categoria** — "Subcategoria" em `estruturas` e `luz-e-som`,
"Configuração" em `telas-de-led`. O subtítulo da seção também muda: "Navegue por subcategoria" vs
"O que compõe uma tela de LED".

</specifics>

<pendencias>
## Pendências levantadas e ainda não decididas

- **Rótulo do critério 7 do comparativo.** "Área de tela pelo mesmo **investimento**" não mostra
  valor algum, mas a palavra encosta na regra transversal de não exibir preço. Decidir a redação
  **antes** do seed, já que o cadastro entra no escopo desta fase.
- **Tensão de rota com a Fase 7.** O PROD-01 exige guarda contra "colisão entre slug de produto e
  slug de categoria", mas a categoria vive sob `/[locale]/categoria/[slug]` (fixado pela Fase 4 e em
  produção) enquanto o produto é `/[locale]/[categoria]/[slug]`. Nesse desenho a colisão não pode
  acontecer, e a guarda perde o sentido — ou o requisito quer dizer outra coisa. **Resolver na
  Fase 7**, não aqui.

</pendencias>

<deferred>
## Deferred Ideas

- Eixos de filtro `porte` (Até 200 / 200 a 1.000 / Acima de 1.000), `montagem` (Montagem pela
  equipe / …) e `distancia` (Menos de 2 m / 2 a 4 m / Mais de 4 m) — sem campo no CMS; exigiriam três
  taxonomias novas e reclassificar os 10 produtos. Fase futura, quando o cliente tiver essa
  informação.
- Locales `en` e `es` do conteúdo das categorias — pt-BR primeiro, como no catálogo.
- CTA "SOLICITAR ORÇAMENTO" com destino real — Fase 9 (formulário).
- Metadata, JSON-LD e `hreflang` da rota — Fase 12. O `ItemList` do CATG-05 é emitido nesta fase
  como estrutura de dados; a serialização em JSON-LD para SEO é da Fase 12.

</deferred>

---

*Phase: 06-categoria*
*Context gathered: 2026-08-22*
