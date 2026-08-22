---
phase: 6
slug: categoria
status: draft
shadcn_initialized: false
preset: none
created: 2026-08-22
---

# Phase 6 — Categoria — UI Design Contract

> Contrato visual e de interação de `/[locale]/categoria/[slug]`. Gerado por gsd-ui-researcher a
> partir de `06-CONTEXT.md`, `src/lib/theme/theme.ts` e
> `projeto-base/All Music Rentals - Categoria.dc.html`. Verificado por gsd-ui-checker.

**Nenhuma pergunta interativa foi necessária nesta sessão** — `06-CONTEXT.md` já travou o
conteúdo, os estados e o modelo de dados; este documento traduz essas decisões em tokens, medidas
e padrões de componente concretos, e resolve os 6 problemas visuais levantados pelo orquestrador
com uma técnica prescrita (não uma lista de opções).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — design system próprio (styled-components + tema tipado), sem shadcn/`components.json` |
| Preset | não aplicável |
| Component library | Radix UI primitives, usados diretamente (`@radix-ui/react-accordion` já em `PainelDeFiltros.tsx`; `@radix-ui/react-dialog` já em `DrawerDeFiltros.tsx`) |
| Icon library | nenhuma — o layout-fonte usa glifos de texto (▾ × + – →), não SVG icon set; manter o padrão |
| Font | Archivo (`fonte.display`, `wdth 75`, peso 800) para títulos/CTAs · Public Sans (`fonte.corpo`) para corpo · IBM Plex Mono (`fonte.mono`) para eyebrow/rótulo/mono-labels |

Fonte de verdade dos tokens: `src/lib/theme/theme.ts` (Fase 2, imutável nesta fase — a Fase 6 **usa**
o tema, não o estende, exceto pelos tokens já existentes citados abaixo).

---

## Spacing Scale

O projeto não usa a escala genérica 4/8/16/24/32/48/64 do template — usa `theme.espaco` (base 2,
ritmo de 4) para espaçamento de componente e `clamp()` para padding de seção (sem `@media`). Esta
fase reaproveita os dois, sem token novo.

| Token | Value | Usage nesta fase |
|-------|-------|-------|
| `espaco[4]` | 4px | gap entre linhas da tabela comparativa quando empilhada |
| `espaco[8]` | 8px | gap entre botões toggle de um mesmo grupo de filtro |
| `espaco[12]` | 12px | gap entre grupos de filtro toggle; padding vertical dos cartões P1.9/P3.9 |
| `espaco[16]` | 16px | gap do grid de subcategorias/aplicações; gap das 3 colunas da tabela comparativa quando não-empilhada |
| `espaco[24]` | 24px | gap entre cartões P1.9/P3.9; padding dos estados "em preparação"/"sem resultado" (mínimo do `clamp`) |
| `clamp(40px,5vw,64px)` | 40–64px | padding de seção clara (subcategorias, aplicações, FAQ) |
| `clamp(56px,8vw,144px)` | 56–144px | padding de seção escura (comparativo LED, CTA final) |
| `44px` | fixo | alvo de toque mínimo — breadcrumb link, botão toggle, item de subcategoria clicável, CTA |

Exceptions: nenhuma nova. O breadcrumb usa `min-height: 44px` no link clicável mesmo sendo texto
mono pequeno (13px) — mesma regra de alvo de toque de `DS-07`/`CATA-05`.

---

## Typography

A escala tipográfica do projeto (Fase 2) já está fechada e é mais ampla que o "3–4 tamanhos, 2
pesos" genérico do template — esta fase **usa papéis já existentes** do tema, não cria escala nova.
Tabela abaixo mapeada aos 4 papéis do template com os tokens reais usados nesta fase:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | `theme.tamanho[16]` (16px) — texto corrido; `tamanho[15]` (15px) para legendas/notas | `peso.corpo` (400) | `leading.corpo` (1.5) |
| Label | `tamanho[12]`–`tamanho[13]` (12–13px) — eyebrow, mono-label, número da subcategoria, rótulo de grupo de filtro | `peso.medio` (500) | `leading.unidade` (1) |
| Heading | `fluido.h2` (`clamp(28px,4vw,48px)`) — títulos de seção; `fluido.h3` (`clamp(24px,2.8vw,30px)`) — título dos estados "em preparação"/"sem resultado" | `peso.display` (800), Archivo `wdth 75`, caixa-alta | `leading.display` (0.98) |
| Display | 52px fixo (`p19`/`p39` nos cartões pixel pitch) + 26px para o sufixo "mm" | `peso.display` (800) | `leading.unidade` (1) |

Regra herdada (não redefinida aqui): Archivo sempre `text-transform: uppercase` +
`font-variation-settings: 'wdth' 75`; nunca usar peso intermediário fora de `peso.medio`/`peso.display`.

---

## Color

O projeto tem um sistema de duas superfícies (clara e escura), não um único par 60/30/10 — a
página de Categoria usa as duas: hero e comparativo LED são escuros, o resto é claro. A tabela
abaixo descreve a distribuição real da rota, com ratio de contraste calculado contra a superfície
onde cada cor realmente pousa (regra do hard constraint 3).

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `theme.cor.fundo` `#F1F2F2` | Fundo das seções claras: subcategorias, grade de produtos, aplicações, FAQ |
| Secondary (30%) | `theme.cor.tinta900` `#0B0C0D` | Fundo das seções escuras: hero e comparativo LED (só em `telas-de-led`) |
| Accent (10%) | `theme.cor.teal` `#2FB6B9` | Reservado para: eyebrow ativo, CTA primário (`SOLICITAR ORÇAMENTO`, `VER PRODUTOS`, `NÃO SEI QUAL ESCOLHER`), badge do botão toggle de filtros ativo (mobile, herdado de `ToolbarDoCatalogo`), marcador P1.9 da régua, cartão P1.9 (borda + rótulo "PIXEL PITCH" + "DENSIDADE DE PONTOS: ALTA"). Nunca em texto corrido, nunca como cor de fundo de bloco de texto extenso. |
| Destructive | não aplicável nesta fase | Não há ação destrutiva em `/categoria/[slug]` — remover filtro é reversível e não usa `theme.cor.erro` (chip "×" usa `textoMuted`, igual ao catálogo) |

Pares de contraste específicos desta fase (calculados, não estimados):

| Par | Ratio | Veredito |
|-----|-------|----------|
| `textoMutedClaro` `#9EA3A5` sobre `tinta900` `#0B0C0D` (breadcrumb inativo, notas do hero escuro) | 7.68:1 | PASS AA |
| `teal` `#2FB6B9` sobre `tinta900` (eyebrow, links ativos, hover) | 7.94:1 | PASS AA |
| `fundo` `#F1F2F2` sobre `tinta900` (breadcrumb da página atual, headings escuros) | 17.46:1 | PASS AA |
| `textoMutedClaro` `#9EA3A5` sobre a linha par da tabela `#1C1E20` (=`tinta800`) | 6.56:1 | PASS AA |
| `textoMutedClaro` `#9EA3A5` sobre a linha ímpar da tabela `#141618` | 7.11:1 | PASS AA |
| `fundo`/`teal` sobre `#141618` (cabeçalho P1.9MM/P3.9MM, valores) | 16.17:1 / 7.35:1 | PASS AA |
| `textoMid` `#5A5F61` ou `tinta600` `#4A4E50` sobre `branco` (texto do botão toggle inativo) | 6.47:1 / 8.41:1 | PASS AA |
| `tealLink` `#157A7D` sobre `tinta900` | 3.83:1 | **FAIL — proibido**. `tealLink` é token de superfície CLARA (corrigido em 2026-08-21 para 4.55:1 sobre `fundo`). Nunca usar sobre fundo escuro. |
| `textoMuted` `#6A6F71` (o antigo `#6B7072`) sobre `tinta900`/tabela escura | 3.85:1 | **FAIL — é exatamente o defeito do layout-fonte.** Não copiar as cores inline do `.dc.html` para rótulos de critério da tabela ou legendas "0 M"/"10 M" da régua — usar `textoMutedClaro` nessas posições. |

Accent reserved for: CTA primário, eyebrow, badge de contagem de filtros, marcador/legenda P1.9 da
régua, cartão P1.9. **Nunca** para texto corrido, nunca para o botão toggle "ativo" (que usa
`tinta900`/`branco`, não teal — ver Bloco 4 abaixo), nunca para o CTA secundário (outline).

---

## Copywriting Contract

Toda cópia desta fase já está travada em `06-CONTEXT.md`; a tabela abaixo consolida o essencial
para o executor sem reabrir a decisão.

| Element | Copy |
|---------|------|
| Primary CTA (fora do LED) | `SOLICITAR ORÇAMENTO` — verbo + substantivo, idêntico ao usado no catálogo/Home; inerte até a Fase 9 |
| Primary CTA (bloco LED) | `NÃO SEI QUAL ESCOLHER — QUERO AJUDA` — mesmo destino `#solicitar`/rota de orçamento |
| CTA secundário do hero | `VER PRODUTOS` (âncora para a grade) |
| Empty state "em preparação" — eyebrow | `{{N}} SUBCATEGORIAS MAPEADAS · CADASTRO EM ANDAMENTO` (N = `subs.length` real da categoria) |
| Empty state "em preparação" — título | Os itens desta categoria ainda não estão publicados |
| Empty state "em preparação" — corpo | Já trabalhamos com os equipamentos listados acima. Enquanto o cadastro é concluído, descreva o que seu evento precisa e a equipe responde com o que temos disponível na data. |
| Empty state "em preparação" — ações | `SOLICITAR ORÇAMENTO` (inerte) + `VER TODO O CATÁLOGO` (destino real: `/[locale]/catalogo`) |
| Empty state "sem resultado" — eyebrow | `NENHUM ITEM COM ESSA COMBINAÇÃO` |
| Empty state "sem resultado" — título | Amplie a busca ou fale com a equipe (mesmo título do catálogo — reuso literal de `EstadoSemResultados`) |
| Empty state "sem resultado" — corpo | Tente remover o filtro mais específico. Se o item que você procura não estiver publicado, descreva a necessidade — trabalhamos com configurações sob medida. |
| Empty state "sem resultado" — ação | `Remover todos os filtros` (preserva `q`/`ordenar`, remove só os grupos da categoria — mesma regra de `EstadoSemResultados.removerTodosOsFiltros`) |
| Empty state "sem aplicações"/"sem FAQ" (categoria sem conteúdo cadastrado) | `CONTEÚDO EM PREPARAÇÃO` / "As aplicações desta categoria serão publicadas junto com os produtos. Descreva o tipo de evento na solicitação e a equipe indica a configuração adequada." — e para FAQ: "Ainda não publicamos as perguntas frequentes de {{nomeCategoria}}. Enquanto isso, fale direto com a equipe — respondemos por telefone, e-mail ou junto com a proposta." + telefone/e-mail |
| Error state (rota falha ao carregar) | Não especificado em `06-CONTEXT.md` — **default proposto**, mesmo padrão de `error.tsx` da Fase 4 (`04-02`): título "Não foi possível carregar esta categoria agora." + corpo curto + botão `TENTAR NOVAMENTE` (retry do Next `error.tsx`). Confirmar com o planner se deve herdar literalmente o `error.tsx` do catálogo (Fase 5) em vez de escrever um novo. |
| Destructive confirmation | Não aplicável — nenhuma ação destrutiva nesta fase |
| Rótulo do grupo `sub` (varia por categoria) | "Subcategoria" (`estruturas`, `luz-e-som`, `tendas`, `moveis`) · "Configuração" (`telas-de-led`) — vem do campo, não é hardcode de UI |
| Subtítulo da seção de subcategorias | "Navegue por subcategoria" (default) · "O que compõe uma tela de LED" (`telas-de-led`) |

**Pendência herdada de `06-CONTEXT.md` a resolver antes do seed:** o rótulo do 7º critério da
tabela comparativa ("Área de tela pelo mesmo investimento") esbarra na regra anti-preço. Este
UI-SPEC não resolve a redação — está fora do escopo de design visual — mas registra que o
planner/executor devem tratá-la como bloqueante do seed (D-07), não como nice-to-have.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | nenhum | não aplicável — projeto não usa shadcn |
| terceiros | nenhum | não aplicável |

---

## Contratos Específicos da Fase

Os 6 problemas do prompt do orquestrador, cada um com uma técnica prescrita — não uma lista de
opções — para o planner e o executor implementarem sem ambiguidade.

### 1. Régua LED (0 M → 10 M) — dado, não decoração

O layout-fonte posiciona os marcadores só com `style="left:19%"`/`left:39%"` e não expõe o dado a
tecnologia assistiva. Contrato:

- A régua inteira (trilho + 4 marcadores + legenda) é um grupo `role="img"` com
  `aria-label="Régua de distância de visualização de 0 a 10 metros, com marcador em 1,9 metro para a tela P1.9 e em 3,9 metros para a tela P3.9"`.
- Os 4 `div` posicionados (`0%`, `19%`, `39%`, `100%`) ficam `aria-hidden="true"` — são o desenho
  do grupo já descrito pelo `aria-label`.
- O dado numérico "1,9 M · P1.9" / "3,9 M · P3.9" já é **texto visível real** logo abaixo do
  trilho (não é só posição) — mantém exatamente como no layout-fonte, mas trocando
  `textoMuted`/`#6B7072` das legendas "0 M"/"10 M" por `theme.cor.textoMutedClaro` (7.68:1 sobre
  `tinta900`, ver tabela de Color acima — o layout-fonte usa a cor errada aqui).
- Posição dos marcadores continua sendo `left: {pitch/10 * 100}%` calculado em build/render
  time a partir dos números 1.9 e 3.9 (mesmo princípio de `DestaqueLedBloco`: "conteúdo de design,
  não do CMS" — os dois valores de pitch são fixos no código, não vêm do single type Comparativo
  LED, que cobre só as 7 linhas da tabela, per D-08).
- Marcador do 0 e do 10 usam `tinta700`/`3A3E40` (trilho); marcador do 1,9 usa `teal`; marcador do
  3,9 usa `fundo` (branco) — igual ao layout-fonte, ambos calculados sobre `tinta900`.

### 2. Tabela de 7 critérios — empilhamento sem `@media` e sem JS

**Proibido:** reproduzir `this.state.vw < 760` (JS de viewport) ou criar um `@media` novo. A
técnica prescrita é a mesma já aprovada pela Fase 4 (D3) e usada em 10+ componentes do projeto:
`grid-template-columns: repeat(auto-fit, minmax(Npx, 1fr))`, aplicado **por linha** (3 células:
critério · valor P1.9 · valor P3.9), não à tabela inteira como bloco único.

- `minmax(220px, 1fr)` com `gap: 16px` por linha. Cálculo do breakpoint efetivo: o conteúdo da
  seção do comparativo tem `max-width: 1280px` com `padding: 0 20px`, e a caixa da tabela tem
  `padding: 16px 20px` por linha — em viewport 760px a largura útil da linha é
  `760 − 40 (container) − 40 (padding da linha) ≈ 680px`. Com `minmax(220px,1fr)` e 2 gaps de
  16px, 3 células exigem `3×220 + 32 = 692px` > 680px — portanto empilham logo abaixo de ~760px de
  viewport, reproduzindo o comportamento do layout-fonte de forma fluida (sem ponto de quebra
  fixo, o que é preferível, não uma regressão).
- O cabeçalho (`CRITÉRIO` / `P1.9MM` / `P3.9MM`) usa o **mesmo** `grid-template-columns:
  repeat(auto-fit, minmax(220px,1fr))` — ele também empilha em vez de desaparecer. Isso é uma
  divergência deliberada do layout-fonte (que escondia o cabeçalho via JS abaixo de 760px):
  manter o cabeçalho sempre presente é mais simples e não perde informação.
- **Rótulos inline "P1.9"/"P3.9" nas células de valor são renderizados sempre, em toda largura**
  — não condicionalmente. No layout-fonte eles só aparecem quando `vw<760` (para dar contexto
  quando a tabela empilha); aqui, como não há JS de viewport para decidir isso em CSS puro, a
  solução é mostrá-los sempre como um pequeno chip mono antes do valor (`P1.9` em `teal`, `P3.9`
  em `textoMutedClaro`, 12px `fonte.mono`). Em telas largas isso é redundante com o cabeçalho
  (aceitável, reforça a associação de cor) e em telas estreitas é o que garante que o valor
  empilhado não perca contexto — resolve o problema sem CSS condicional e sem JS.
- Zebra de linha mantém `tinta800`/`#141618` alternados (contraste de texto verificado acima).

### 3. Filtros toggle da categoria — distintos do acordeão do catálogo (CATG-02)

Contraste de padrão obrigatório com `PainelDeFiltros.tsx` (catálogo): lá é `Accordion.Root`
(Radix, grupos colapsáveis) + `<input type="checkbox">` dentro de `<label>`. Aqui:

- **Sem acordeão** — todos os grupos ficam sempre visíveis, lado a lado (`flex-wrap: wrap`,
  `gap: 24px 32px` entre grupos, como no layout-fonte), nunca colapsáveis.
- Cada opção é um `<button type="button" aria-pressed={on}>` — nunca checkbox. Estado:
  - Off: `border: 1px solid theme.cor.borda` (`#C9CBCC`), `background: theme.cor.branco`,
    `color: theme.cor.tinta600` (8.41:1 sobre branco).
  - On: `border: 1px solid theme.cor.tinta900`, `background: theme.cor.tinta900`,
    `color: theme.cor.fundo` (19.58:1).
  - **Nunca usar `teal` no estado "on" deste componente** — o teal é reservado para CTA/eyebrow
    (ver Color acima); usar `teal` aqui colidiria visualmente com o botão de solicitar orçamento
    logo abaixo, diluindo o significado do accent.
  - `min-height: 36px`, `padding: 0 12px`, `border-radius: theme.raio.base`, `font-size:
    theme.tamanho[15]`, `font-family: theme.fonte.corpo` (Public Sans, não mono — outro ponto de
    distinção do chip mono do catálogo).
- Rótulo do grupo acima dos botões: mono, `tamanho[12]`, `letter-spacing: tracking.rotuloForte`,
  `color: textoMuted`, `text-transform: uppercase` — mesmo padrão visual de rótulo mono do
  catálogo (consistência de sistema), mas sem o container de accordion.
- O rótulo do grupo `sub` é dado pelo campo, não hardcoded (ver Copywriting acima).
- Os chips de filtro ativo abaixo da toolbar **reaproveitam `ChipFiltro`** (`src/components/
  primitives/Chip.tsx`) sem alteração — chip de resultado não precisa ser distinto, só o
  controle de entrada (o toggle) precisa.

### 4. Subcategorias numeradas

- Grid `repeat(auto-fit, minmax(240px,1fr))`, `gap: 1px`, `background: theme.cor.borda` (efeito
  de linha divisória fina entre células, técnica já usada no layout-fonte e reproduzível sem
  `border` por célula).
- Cada célula: número `String(i+1).padStart(2,'0')` em mono 12px `textoMuted`, nome em Public Sans
  medio 17px, descrição em Public Sans 15px `tinta600`, e um rótulo final "VER ITENS →" em
  Archivo 800 13px `tealLink` (sobre fundo claro — 4.55:1, correto aqui pois a célula tem fundo
  `fundo`, não `tinta900`).
- Clique na célula filtra a grade pelo grupo `sub` com aquele valor E rola até `#produtos` — não
  navega para outra rota.
- Contagem "N SUBCATEGORIAS" ao lado do título da seção usa `subs.length` real (não hardcode),
  mono 13px `textoMuted`.
- Heading da seção varia por categoria (ver Copywriting acima).

### 5. Breadcrumb (componente novo)

Não existe precedente no projeto — proposta de contrato para o planner instanciar:

- Estrutura semântica: `<nav aria-label="Trilha de navegação"><ol>` com `<li>` por nível,
  `aria-current="page"` no último item (não um link).
- Sobre fundo escuro (hero da categoria): links inativos `textoMutedClaro` (7.68:1), hover `teal`
  (7.94:1), item atual `fundo` (17.46:1). Separador "/" é `aria-hidden="true"`,
  `color: textoMutedClaro`, `padding: 0 8px`.
- Fonte: mono, `tamanho[13]`, `letter-spacing: tracking.rotulo`, sem uppercase forçado no nome da
  categoria (o layout-fonte já usa o texto como veio).
- Alvo de toque: cada link tem `min-height: 44px` com `display:inline-flex;align-items:center`
  (o texto é pequeno, a área de toque não).
- Trilha desta fase: `Início / Catálogo / {{nome da categoria}}` — 3 níveis fixos, sem
  aninhamento dinâmico (a página de categoria é sempre filha direta do catálogo).
- Local recomendado no código: `src/components/chrome/Breadcrumb.tsx` (ao lado de
  `TopBar`/`Header`/`Footer`) — é um primitivo de chrome reutilizável, não específico do
  catálogo; a Fase 7 (Produto) também precisará dele (PROD-05 menciona breadcrumb). Estrutura de
  arquivo final é discricionária do planner (per `06-CONTEXT.md`), mas o local sugerido evita
  duplicação quando a Fase 7 chegar.
- `ItemList`/`BreadcrumbList` JSON-LD (CATG-05) é dado estruturado, não visual — fora deste
  UI-SPEC; o componente visual só precisa expor a lista de `{ nome, href }` que o serializador de
  `ItemList` desta fase e o JSON-LD da Fase 12 vão consumir depois.

### 6. Posição do estado "em preparação"

- Vive **dentro da seção `#produtos`**, no lugar exato onde a grade apareceria — nunca substitui
  hero, subcategorias ou aplicações/FAQ, que continuam renderizando acima e abaixo normalmente.
  Isso já está provado pelo próprio texto da cópia ("os equipamentos listados acima").
  A ordem vertical da página nunca muda entre os 3 estados possíveis da seção `#produtos`
  (grade / "em preparação" / "sem resultado") — só o conteúdo daquele bloco troca.
- Container do card do estado: `border: 1px solid theme.cor.borda`, `background: theme.cor.branco`,
  `border-radius: theme.raio.base`, `padding: clamp(28px,4vw,48px)`, `max-width: 720px`,
  `display: grid`, `gap: 24px` — idêntico entre "em preparação" e "sem resultado" (o mesmo
  contêiner visual, só o texto interno muda — reforça D-04, não duplicar componente).
- Toolbar (ordenação) e filtros toggle continuam visíveis **acima** do card mesmo em "em
  preparação" — o visitante pode ver os grupos de filtro mesmo sem produtos, porque os filtros
  descrevem a categoria, não o resultado da busca atual.

---

## Estados da Grade — Contrato de Reuso

| Estado | Fonte visual | Componente |
|--------|-------------|------------|
| Com resultado | `GradeDeProdutos.tsx` (Fase 5), `auto-fit minmax(280px,1fr)` — sem alteração | Reuso direto |
| "Em preparação" | Card novo, copy fixa no código (ver Copywriting) | Novo componente próprio (copy não é parametrizável por categoria — D-03) |
| "Sem resultado" | `EstadoSemResultados.tsx` (Fase 5), parametrizado por prop (`eyebrow`, `corpo`, `sugestões`) | **Parametrizar o componente existente, não duplicar** (D-04) — adicionar props opcionais com os defaults atuais do catálogo, e passar os valores da categoria quando a rota for `/categoria/[slug]` |
| Carregando | Skeletons — mesmo padrão de `catalogo/loading.tsx` (`auto-fit minmax(280px,1fr)` de placeholders) | Reuso do padrão, arquivo próprio `categoria/[slug]/loading.tsx` |
| Erro de rota | Ver linha "Error state" em Copywriting | Novo `error.tsx` ou herdado — decisão do planner |

---

## Acessibilidade — Notas Transversais da Fase

- Todo componente novo com `styled` precisa de `'use client'` (hard constraint 4) — isso inclui
  o `Breadcrumb`, os botões toggle e a régua LED, já que todos leem `theme` via Context.
- axe roda em 1280px e 375px, incluindo qualquer estado de drawer/menu aberto (hard constraint 5)
  — o breadcrumb e os toggles precisam ser navegáveis por teclado com foco visível
  (`outline: 2px solid theme.cor.tealLink` sobre fundo claro / `theme.cor.teal` sobre fundo
  escuro — nunca `tealLink` sobre escuro, ver tabela de Color).
- `aria-pressed` nos botões toggle (já usado no layout-fonte, manter).
- FAQ da categoria reusa o padrão de accordion exclusivo (um aberto por vez,
  `aria-expanded`) — mesmo padrão que a Fase 11 (Institucional) vai usar para o FAQ geral; não
  inventar um terceiro padrão de accordion nesta fase além do já existente em `PainelDeFiltros`
  (múltiplo) — o FAQ é exclusivo (comportamento diferente, mesma biblioteca Radix se o Radix
  Accordion suportar `type="single" collapsible`, o que suporta).
- Nenhum preço em nenhuma tela desta fase, incluindo o rótulo pendente do critério 7 da tabela
  (ver Copywriting) — regra transversal do projeto.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
