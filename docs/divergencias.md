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

## D3 — Grid de 4 colunas por JS substituído por `auto-fit`

**Fase:** 04 · **Data:** 2026-08-18

**No layout:** o layout-fonte calcula `grid-template-columns` em JS a partir de
`window.innerWidth` (1 coluna `<760px`, 2 `<1180px`, 4 `≥1180px`) nos 4 cards de categoria
(Bloco 3 da Home) e na grade de avaliações do estado cheio (Bloco 8).

**Divergência:** substituído por `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`.

**Motivo (técnico):**
1. D1 (acima) já rejeitou layout dirigido por `window.innerWidth` no cliente — mismatch de
   hidratação e CLS na primeira pintura.
2. A Fase 4 proíbe `@media` nova; `auto-fit`/`minmax` resolve a fluidez inteiramente em CSS,
   sem JS de viewport e sem media query.
3. O próprio layout-fonte já usa `auto-fit` no card-bandeira do Bloco 3 e no estado
   "carregando" do Bloco 8 — o padrão substituto já existe no HTML-fonte, não é inventado.

**Escopo:** grade de 4 cards de categoria (Bloco 3) e grade de avaliações no estado cheio
(Bloco 8).

**Consequência aceita:** em larguras intermediárias o número de colunas pode diferir em ±1 do
original (os degraus 760px/1180px não são mais idênticos).

**Status:** ✅ RESOLVIDO POR DECISÃO.

**Reversível:** trocar `auto-fit`/`minmax` por um valor de `grid-template-columns` calculado em
JS é local a `GradeDeCategoriasBloco.tsx` e `AvaliacoesBloco.tsx`.

## D4 — Cópia do estado "CMS indisponível" não vem do layout-fonte

**Fase:** 04 · **Data:** 2026-08-18

**No layout:** `Home.dc.html` não tem estado de falha de CMS — o layout-fonte é HTML estático,
sem cenário de "o backend não respondeu".

**Divergência:** quando `getPagina(locale, 'home')` devolve `null` (Strapi indisponível, ou a
página `home` ainda não existe), `/[locale]/page.tsx` renderiza um único `Notice` com rótulo
"CONTEÚDO INDISPONÍVEL" e o texto "Não foi possível carregar o conteúdo da página no momento.
Tente novamente em alguns minutos." — cópia proposta na pesquisa da Fase 4 e travada no
planejamento (04-UI-SPEC.md, "Comportamento sem CMS").

**Motivo (técnico):** o chrome (`Header`/`Footer`/`TopBar`) sobrevive porque vive em
`[locale]/layout.tsx`; sem esse fallback a página ficaria em branco ou o build falharia — não é
opção aceitável para uma falha de rede transitória.

**Status:** ℹ️ INTENCIONAL — confirmar com o time na revisão de conteúdo (Fase 11/12) se a cópia
final muda.

**Reversível:** o texto vive só em `src/app/[locale]/page.tsx` (duas constantes de módulo);
trocar a cópia não afeta nenhum outro arquivo.

## D5 — Os três grids por JS do catálogo viram `auto-fit` / coluna fixa

**Fase:** 05 · **Data:** 2026-08-19

**No layout:** `heroCols`, `layoutCols` e `gridProdutos` são calculados em JavaScript a partir de
`this.state.vw` (largura de viewport lida no cliente).

**Divergência:** substituição por CSS puro, sem JS de viewport: `heroCols` →
`repeat(auto-fit, minmax(280px, 1fr))`; `layoutCols` → `272px minmax(0, 1fr)` fixo, com o aside
colapsando pelo drawer (ver D7); `gridProdutos` → `repeat(auto-fit, minmax(280px, 1fr))`.

**Motivo (técnico):** idêntico ao já aceito em D1 e D3 — ler `window.innerWidth` (ou qualquer
estado de viewport equivalente, aqui `this.state.vw`) causa mismatch de hidratação, flash e CLS
na primeira pintura, violando as metas de Core Web Vitals do projeto.

**Escopo:** os três grids calculados por JS do catálogo (hero, layout de 2 colunas, grade de
produtos), alvo concreto dos planos 05-04/05-05/05-07.

**Consequência aceita:** ±1 coluna em larguras intermediárias, o mesmo custo já aceito em D3.

**Reversível:** trocar `auto-fit`/`minmax` por um cálculo de `grid-template-columns` em JS é local
aos componentes de grid do catálogo.

## D6 — "Mais solicitados" passa a ordenar por um campo real, `contagemSolicitacoes`

**Fase:** 05 · **Data:** 2026-08-19

**No layout:** a quinta opção do `<select>` de ordenação do catálogo é `Mais solicitados`, e o
modelo do Strapi não tem campo correspondente.

**Divergência:** a opção **não é removida** (CATA-03 exige as 5 opções) e **não** vira apelido de
`destaque`. Cria-se o atributo `contagemSolicitacoes` (`integer`, `default: 0`, não localizado) em
`cms/src/api/product/content-types/product/schema.json`, com ordenação
`sort[0]=contagemSolicitacoes:desc` e `sort[1]=nome:asc` como desempate determinístico.

**Motivo (técnico):** o contador começa em 0 para todos os produtos, e enquanto isso a ordenação é
honesta (campo real, valor real) e determinística pelo desempate por nome — nenhum dado fictício é
semeado. **A Fase 9 é quem passa a incrementá-lo**, no Route Handler de envio da solicitação
(plano `09-05`).

**Escopo:** apenas a criação do campo `contagemSolicitacoes` e a troca do critério de ordenação da
opção "Mais solicitados" do catálogo (Fase 5). A obrigação da Fase 9 de incrementar o contador foi
cravada explicitamente na linha do plano `09-05` em `.planning/ROADMAP.md` — sem essa referência
cruzada, o contador ficaria permanentemente em 0 e "Mais solicitados" seria idêntico à ordenação
alfabética para sempre.

**Reversível:** sim — remover o campo e o critério de ordenação restaura o estado anterior (a
opção do `<select>` continuaria existindo, mas sem efeito real de ordenação).

## D7 — A visibilidade do botão `FILTROS` e o colapso do aside usam a media query única de 1080px

**Fase:** 05 · **Data:** 2026-08-19

**No layout:** o botão `FILTROS` só aparece quando `this.state.mobile` é verdadeiro, estado
derivado de leitura de viewport em JS.

**Divergência:** a implementação usa `media.mobile` / `media.desktop` de
`src/lib/theme/media.ts` (`theme.breakpoint.header`, 1080px), a única media query aprovada do
projeto (D1) — nenhum breakpoint novo é criado, respeitando D-07.

**Motivo (técnico):** idêntico a D1 — estado de viewport lido no cliente causa mismatch de
hidratação e CLS; media query CSS resolve no mesmo ponto de troca sem JS.

**Escopo:** visibilidade do botão `FILTROS` e do aside de filtros (272px) do catálogo. Consequência
registrada: o aside fica visível a partir de 1080px e, abaixo disso, o mesmo painel é servido
dentro do drawer. Resolve a Q1 do UI-SPEC pela saída (a).

**Reversível:** trocar a media query por estado JS ou por container query é local ao componente do
painel de filtros do catálogo.

## D8 — A lista de cores do filtro é derivada do CMS, não a lista fixa de três valores do layout

**Fase:** 05 · **Data:** 2026-08-19

**No layout:** — e no **Bloco 3** do `05-UI-SPEC.md`, que o transcreve — o grupo `Cor` do painel de
filtros tem três swatches fixos, embutidos no `const HEX` do arquivo-fonte: `Bege #D8C9A8`,
`Preto #0B0C0D`, `Branco #FFFFFF`.

**Divergência:** é de **fonte**, não de resultado. A implementação monta a lista chamando
`getCoresDisponiveis(locale)` (`src/lib/cms/adapters.ts`, criado em 05-02), que coleta
`variacoes[].nome` dos produtos cadastrados e mantém apenas os nomes que existem como chave em
`coresProduto` de `src/lib/site/navigation.ts`. Com os 10 produtos semeados hoje o retorno é
exatamente `Bege`, `Preto`, `Branco` — **não há nenhuma diferença observável na tela**, e é por
isso que a divergência é de fonte e precisa ser registrada mesmo sem sintoma visível.

**Motivo (técnico):** é o que torna verdadeira a microcopy **literal do próprio layout**, "Outras
cores cadastradas aparecem aqui." Com lista fixa, cadastrar no CMS um produto com a variação
`Bordô` não faria swatch algum aparecer, e a nota do layout seria uma promessa falsa impressa na
tela.

**Escopo:** os hex continuam saindo exclusivamente do `Record` `coresProduto` (nenhum hex é
redigitado, e nome de variação fora da paleta conhecida nunca vira opção de filtro); a allowlist de
parse de `parseFiltrosDaUrl` permanece sendo a paleta inteira (`Object.keys(coresProduto)`, 5
nomes), deliberadamente um **superconjunto** do que é exibido, porque barreira de segurança não
pode variar conforme o conteúdo editorial do CMS.

**Reversível:** sim — trocar a chamada por um array literal de três nomes restaura exatamente o
comportamento do layout, em uma linha.

## Item 6 (docs/00-divergencias.md) — hrefs de âncora `#led`/`#luzsom` no lugar dos slugs reais

**Fase:** 04 · **Data:** 2026-08-18

**Status:** ✅ RESOLVIDO. O plano 04-02 ligou a navegação do chrome ao CMS
(`getNavPrincipal`/`getColunasRodape`), substituindo o placeholder estático de
`src/lib/site/navigation.ts`; o plano 04-04 ligou os cards de categoria da Home aos slugs reais
das 5 categorias (`/[locale]/categoria/{slug}`) em vez de âncoras internas. Não há mais href de
âncora `#led`/`#luzsom` em nenhum ponto coberto por esta fase.
