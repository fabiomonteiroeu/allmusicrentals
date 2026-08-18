---
phase: 4
slug: 04-home
status: draft
shadcn_initialized: false
preset: none
created: 2026-08-18
---

# Phase 4 — Home — Contrato de Design UI

> Contrato visual e de interação para `/[locale]`. Todo valor abaixo foi extraído de
> `projeto-base/All Music Rentals - Home.dc.html` (fonte da verdade) ou do design system já
> construído na Fase 2 (`src/lib/theme/`, `src/components/`). Nenhum valor foi inventado.
> Onde o HTML-fonte não trouxer a informação, está marcado explicitamente como **PENDENTE**.
>
> Gerado por gsd-ui-researcher, verificado por gsd-ui-checker.

---

## Sistema de Design

| Property | Value |
|----------|-------|
| Tool | none — design system próprio construído na Fase 2 (styled-components), sem shadcn |
| Preset | not applicable |
| Component library | nenhuma (Radix presente no projeto para accordion/dialog, mas não é usado por nenhum bloco da Home) |
| Icon library | nenhuma — glifos CSS/Unicode (`→`, `←`, `+`, `−`, `×`), quadrados/pontos `<span>` sólidos |
| Font | `Archivo` (display, `wdth 75`, peso 800, uppercase) · `Public Sans` (corpo, 400/500) · `IBM Plex Mono` (rótulos/mono, 400/500) — todas via `next/font`, já configuradas na Fase 2 |

**Regra de reuso (obrigatória):** os 9 blocos da Home **compõem** os componentes já entregues na
Fase 2 — não recriam. Inventário do que já existe e pode ser usado direto:

- Primitivos: `Typography` (`Heading`, `Eyebrow`, `Body`, `Mono`), `Button`, `Field` (`Input`,
  `Select`, `Textarea`, `CampoWrap`, `RotuloMono`, `MensagemErro`), `Chip`, `QuantityStepper`,
  `ColorSwatches`, `Container`.
- Chrome: `TopBar`, `Header`, `MobileMenu`, `Footer` — não tocados nesta fase além de passar a
  receber dados do CMS (`getNavPrincipal`/`getColunasRodape`/`getSettingsGlobais`) em vez do
  placeholder estático.
- Feedback/media: `Notice`, `Toast`, `SectionDivider`, `SkeletonBar`/`ProductCardSkeleton`,
  `EmptyState`, `ImagePlaceholder`.
- Produto: `ProductCard` (variantes por props `ehServico`/`escopo`/`cores`, conforme D2 —
  **não** existe seletor `<select>` de cor; cor sempre via `ColorSwatches`).

Onde um bloco da Home precisar de algo que não existe, isso está registrado explicitamente na
seção **Extensões necessárias ao Design System**, abaixo — nenhuma extensão é decidida
silenciosamente dentro do contrato de um bloco.

---

## Escala de Espaçamento

Reaproveitada de `theme.espaco` (Fase 2) — múltiplos de 4, com a base 2px do layout preservada
nos poucos casos já herdados (2, 6, 10, 14, 18, 28). Não há espaçamento novo nesta fase.

| Token | Valor | Uso nesta fase |
|-------|-------|-----------------|
| `espaco[8]` | 8px | gap de setas do slider, gap de listas O QUE INSTALAMOS/EXIBIMOS |
| `espaco[12]` | 12px | gap interno de card, gap de blocos PIXEL PITCH |
| `espaco[16]` | 16px | gap da grade de listas LED, padding do aviso "Como funciona" |
| `espaco[20]` | 20px | padding lateral do `Container` (1280px), padding do corpo do card |
| `espaco[24]` | 24px | gap da grade de categorias/cards, padding de card de diferencial |
| `espaco[32]` | 32px | gap do grid busca, margem inferior de blocos PIXEL PITCH |
| `espaco[40]` | 40px | gap da seção "Comece a montar seu evento", margem de listas "Como funciona" |

**Paddings de seção fluidos (`clamp()`, sem `@media` nova) — valores exatos do HTML-fonte:**

| Bloco | `padding-block` |
|---|---|
| Hero | `clamp(64px, 9vw, 144px)` |
| Busca grande | `clamp(48px, 6vw, 64px)` |
| Grade de categorias | `clamp(64px, 9vw, 144px)` |
| Produtos em destaque | `clamp(56px, 7vw, 96px)` |
| Painéis de LED | `clamp(72px, 10vw, 144px)` |
| Como funciona | `clamp(64px, 9vw, 144px)` |
| **Diferenciais** | **`64px` fixo** (não é `clamp()` no HTML-fonte — reproduzir fixo, não fluidificar) |
| Avaliações | `clamp(56px, 7vw, 96px)` |
| CTA final | `clamp(64px, 9vw, 144px)` |

Exceções: nenhum espaçamento fora da escala de 4px. O único valor "fixo não-fluido" é o padding de
`diferenciais` (64px), que é assim no HTML-fonte — não inventar um `clamp()` para ele.

---

## Typography

Escala tipográfica **herdada do tema da Fase 2** (`theme.fluido`, `theme.tamanho`, `theme.peso`,
`theme.tracking`, `theme.leading`) — não são criados tamanhos novos. Tabela-resumo pedida pelo
template + mapeamento completo por papel usado na Home:

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | `theme.tamanho[16]` (16px) / `theme.fluido.corpoGrande` (`clamp(16px,1.2vw,17px)` em intros de seção) | 400 | 1.5 (`theme.leading.corpo`) |
| Label (mono) | `theme.tamanho[12]`–`[13]` | 500 | 1 |
| Heading (H2 de seção) | `theme.fluido.h2` (`clamp(28px,4vw,48px)`) | 800 (display) | 0.98 (`theme.leading.display`) |
| Display (H1 hero) | `theme.fluido.h1` (`clamp(40px,5vw,64px)`) | 800 (display) | **0.92** (`theme.leading.displayApertado`) — ver extensão necessária |

**Mapeamento por elemento (valor exato do HTML-fonte → token do tema):**

| Elemento | HTML-fonte | Token do tema |
|---|---|---|
| H1 hero "O palco é seu..." | Archivo 800, `clamp(40px,5.6vw,72px)`, line-height 0.92, tracking -0.01em, uppercase | `Heading` com `$nivel="h1"` (`theme.fluido.h1`) + line-height `displayApertado` — teto do HTML (72px) é maior que o teto do tema (64px); manter o token do tema (decisão já fixada na Fase 2, não reaberta aqui) |
| H2 de seção (todas as seções, exceto onde indicado) | Archivo 800, `clamp(30px,3.4vw,44px)`, line-height 0.98 | `Heading` com `$nivel="h2"` (`theme.fluido.h2`) |
| H2 do bloco LED | Archivo 800, `clamp(30px,3.8vw,44px)`, line-height 0.98 | `Heading` `$nivel="h2"` (mesmo token; vw um pouco maior no HTML, não recriar) |
| H3 do card-bandeira LED | Archivo 800, `clamp(28px,3vw,40px)`, uppercase | `Heading` `$nivel="h3"` — HTML é maior que o token `h3` do tema (`clamp(24px,2.8vw,30px)`); usar o token existente mais próximo, sem inventar clamp novo (registrar como nota de fidelidade abaixo) |
| H3 dos 4 cards de categoria / cards de diferencial / cards do slider | Public Sans 500, 22px, line-height 1.3 — **não é display, não é uppercase** | `Heading` não se aplica (é display por padrão); usar elemento próprio com `font: theme.peso.medio theme.tamanho[22]`, `line-height 1.3`, `font-family: theme.fonte.corpo` — já é exatamente como `ProductCard`'s `Nome` estilizado; para os cards de categoria/diferencial, replicar o mesmo padrão de texto (não o `Heading` primitivo) |
| Eyebrow (rótulo mono, uppercase) sobre fundo claro | mono 500 12px, tracking 0.06em, cor `#1A7F82` (tealLink) | `Eyebrow` (já usa `theme.cor.tealLink`) — usar direto |
| Eyebrow sobre fundo escuro (Hero, LED) | mono 500 12px, tracking 0.06em, cor `#2FB6B9` (**teal**, não tealLink) | `Eyebrow` **não serve como está** — precisa de variante `$sobreEscuro`; ver extensão necessária |
| Parágrafo de introdução de seção (corpo grande) | Public Sans 400, `clamp(16px,1.2vw,17px)`, line-height 1.55, cor `#4A4E50` (tinta600) | `Body` com `font-size: theme.fluido.corpoGrande`; **cor**: usar `theme.cor.tinta600` explícito, não a prop `$mid` (que aponta para `textoMid` `#5A5F61` — ver nota de fidelidade na seção Cor) |
| Descrição de card (categoria, slider, diferencial) | Public Sans 400, 15px, line-height 1.5, cor `#4A4E50` (tinta600) | Igual ao `Descricao` do `ProductCard` — `theme.tamanho[15]`, `theme.cor.tinta600` |
| CTA de link com seta ("VER TELAS DE LED →") | Archivo 800, 14–15px, uppercase, cor teal/tealLink | Não é um `Button`; é texto+seta inline — replicar como span com `font: theme.fonte.display` + seta `aria-hidden` |
| Mono de legenda/spec (barra sobre imagem do card) | mono 500 13px, tracking 0.04em | Igual ao `SpecBar` do `ProductCard` — reusar padrão idêntico |

---

## Color

60/30/10 herdado do tema da Fase 2 — nenhuma cor nova.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `theme.cor.fundo` (`#F1F2F2`) | Fundo das seções claras: busca, grade de categorias, produtos em destaque, como funciona, diferenciais, avaliações |
| Secondary (30%) | `theme.cor.branco` (`#FFFFFF`) para cartões/superfícies elevadas **+** `theme.cor.tinta900` (`#0B0C0D`) para as seções escuras (Hero, Painéis de LED, CTA final, rodapé) | Cards de categoria/slider/avaliação (branco); seções de "moldura" escura que abrem/fecham a página |
| Accent (10%) | `theme.cor.teal` (`#2FB6B9`) | Reservado para: eyebrow sobre fundo escuro, CTA primário (`Button $variante="primario"`), borda ativa/hover do card-bandeira LED, marcador `•` de listas LED, borda do toast, foco visível (`:focus-visible`) |
| Destructive | `theme.cor.erro` (`#8C2A2A`) | Único uso nesta fase: mensagem de erro da busca grande ("Digite um produto...") |

Accent (`teal`) reservado exatamente para: eyebrow em fundo escuro, botões primários, borda/hover do
card-bandeira, marcadores de lista da seção LED, borda do Toast, contorno de foco. **Nunca** usar
teal para texto de leitura longa (parágrafos) — no HTML-fonte o teal nunca aparece em corpo de texto.

**Nota de fidelidade (importante para HOME-04):** o primitivo `Body $mid` da Fase 2 mapeia para
`theme.cor.textoMid` (`#5A5F61`). No HTML-fonte, os parágrafos de introdução de seção (sob os H2) e
as descrições de card usam consistentemente `#4A4E50` — que é `theme.cor.tinta600`, um token
**diferente**. O `ProductCard` já existente acerta isso (sua `Descricao` usa `tinta600` direto, não
`Body $mid`). Nos blocos novos da Home, **não usar `Body $mid` sem sobrescrever a cor** — aplicar
`theme.cor.tinta600` explicitamente nesses parágrafos, para não gerar divergência visível na
comparação lado a lado.

---

## Regras estruturais herdadas (não renegociáveis nesta fase)

- **Âncora visual primário da página: o Hero** (mosaico + H1 "O palco é seu. Nós levamos a
  estrutura."). É o único bloco em fundo escuro e carrega o maior tipo da página
  (`clamp(40px,5.6vw,72px)`, `line-height: 0.92`). Nenhum bloco posterior deve competir com ele em
  peso visual — em caso de dúvida sobre proeminência entre dois blocos, o Hero vence. O segundo nível
  de ênfase é o **card-bandeira LED** do Bloco 3, que tem tratamento próprio documentado ali.
  *(Registrado a pedido do `gsd-ui-checker`, Dimensão 2: sem isto o executor teria de inferir a
  hierarquia pela ordem do documento.)*
- **Sem `@media` nova.** Toda fluidez é `clamp()` + grid `auto-fit/minmax`, como no HTML-fonte. A
  única media query do projeto é a troca de chrome em 1080px (`theme.breakpoint.header`, D1) — já
  implementada na Fase 2 no `Header`/`MobileMenu`, não tocada aqui.
- **375px sem scroll horizontal** (HOME-04) — todo grid/flex precisa reduzir para 1 coluna nessa
  largura via `minmax()`/`auto-fit`, nunca via largura fixa maior que o viewport.
- **Sem preço.** Nenhum bloco mostra valor monetário, "a partir de", ou vocabulário de compra. O
  guard `no-price.test.ts` cobre isso; nenhum bloco da Home deve tentar contornar.
- **`prefers-reduced-motion` obrigatório** em qualquer animação nova desta fase (mosaico do hero,
  transição do slider, pulso do skeleton) — já há suporte global em `GlobalStyle.ts`
  (`@media (prefers-reduced-motion: reduce)` zera duração), mas onde a Home tiver lógica JS de
  animação (ex.: stagger do mosaico do hero) o componente também precisa checar
  `window.matchMedia('(prefers-reduced-motion: reduce)')` antes de agendar delays — replicando a
  função `reduced()` do HTML-fonte.
- **Alvo de toque ≥44px, foco visível, contraste AA** — herdado da Fase 2, todo controle novo desta
  fase (setas do slider, botão de busca) precisa respeitar.

---

## Extensões necessárias ao Design System

Registradas explicitamente, conforme exigido — nenhuma decidida "dentro" da spec de um bloco sem
aparecer aqui:

| # | Componente | Extensão necessária | Motivo |
|---|---|---|---|
| E1 | `Eyebrow` (`Typography.tsx`) | Adicionar prop `$sobreEscuro?: boolean` que troca a cor de `theme.cor.tealLink` para `theme.cor.teal` | No HTML-fonte, o eyebrow usa `tealLink` (`#1A7F82`) sobre fundo claro e `teal` (`#2FB6B9`) sobre fundo escuro (Hero, LED). O primitivo atual está fixo em `tealLink`. Padrão idêntico ao que `Button` já faz com `$sobreEscuro`. |
| E2 | `Heading` (`Typography.tsx`) | O nível `$nivel="h1"` (hero) precisa de `line-height: theme.leading.displayApertado` (0.92) em vez do `theme.leading.display` (0.98) fixo atual | No HTML-fonte, **só** o H1 do hero usa 0.92; todos os H2 de seção usam 0.98 (já correto). O primitivo atual aplica 0.98 para todos os níveis. |
| E3 | `Button` (`Button.tsx`) | Nova variante `$variante="pretoSolido"` (background `tinta900`, cor `fundo`, hover `tealLink`, sem borda) | O botão de busca ("BUSCAR"/"BUSCANDO") é sólido preto colado ao input, sem radius no lado esquerdo — nenhuma variante atual cobre isso. Reusável também no Catálogo (Fase 5), que tem a mesma busca. |
| E4 | Novo primitivo `Spinner` (sugestão: `src/components/feedback/Spinner.tsx`) | Círculo 13px, borda 2px `rgba(241,242,242,0.35)`, `border-top-color: teal`, `animation: amrSpin 0.7s linear infinite`, oculto/parado sob `prefers-reduced-motion` | Usado no botão de busca durante `searchBusy`. Não existe spinner no design system atual (só `amrSpin` está definido em `GlobalStyle`, sem componente). |
| E5 | Composto `SearchBarGrande` (bloco 2) | Caixa com borda `1px solid tinta900`, `Input` sem borda interna + `Button $variante="pretoSolido"` anexado + `Spinner` condicional + `MensagemErro` (de `Field.tsx`, reusar direto) | Não é um `Field` padrão (que tem borda própria em todo o retângulo); é uma composição nova, mas feita 100% de primitivos existentes + E3/E4. |

Nenhuma outra extensão foi identificada nos blocos 1–7 até este ponto do levantamento.

---

## Contrato por Bloco

### Bloco 1 — Hero (`blocos.hero`)

**Layout:** `section` fundo `tinta900`, texto `fundo` (claro). `Container` (1280/20px) com
`padding-block: clamp(64px,9vw,144px)`. Conteúdo em coluna única, `max-width: 640px`.

**Fundo decorativo (mosaico):** grid de células (`cols` fixo = 12, `rows = round(cols*0.5)` = 6 —
**não depende de largura de viewport**, é uma contagem fixa, sem risco de hidratação) recortando a
mesma imagem de fundo por posição (`background-position` fracionado por célula), com
`gap: 2px; background: tinta900`. Cada célula anima `amrMod .34s ease-out both` com
`animation-delay: (r+c)*0.045+0.15s` — **só se** `prefers-reduced-motion` não estiver ativo (replicar
`reduced()` do HTML-fonte). Sobre o mosaico, scrim `linear-gradient(100deg, rgba(11,12,13,.96) 0%,
rgba(11,12,13,.88) 40%, rgba(11,12,13,.66) 62%, rgba(11,12,13,.40) 80%, rgba(11,12,13,.12) 100%)`.
Todo o bloco é `aria-hidden="true"` (decorativo).
- Fonte da imagem: campo `imagem` do bloco `blocos.hero` (CMS). **Sem imagem cadastrada:** renderizar
  fundo sólido `tinta900` sem mosaico e sem scrim (nada para dar legibilidade contra) — conteúdo de
  texto segue igual.

**Conteúdo:**
| Elemento | Spec |
|---|---|
| Eyebrow | "Locação para eventos · Flórida" — mono 12px/1, peso 500, tracking 0.06em, uppercase, cor **teal** (extensão E1, `$sobreEscuro`), margin-bottom 20px |
| H1 | "O palco é seu.<br>Nós levamos a estrutura." — `Heading $nivel="h1"` com line-height `displayApertado` (extensão E2), margin-bottom 24px, `text-wrap: balance` |
| Body 1 | Parágrafo institucional, `theme.fluido.corpoGrande`/1.55, cor `theme.cor.navInativo` (`#C7CACB`→`#C9CBCC` unificado), `max-width: 52ch`, margin-bottom 20px |
| Body 2 (citação) | Parágrafo com `border-left: 2px solid teal`, `padding-left: 16px`, 15px/1.5, cor `navInativo`, `max-width: 52ch`, margin-bottom 32px |
| CTAs | `display:flex; flex-wrap:wrap; gap:12px`. Primário: `Button $variante="primario" $tamanho="lg"` ("EXPLORAR CATÁLOGO"). Secundário: `Button $variante="outlineClaro" $tamanho="lg"` ("SOLICITAR ORÇAMENTO" → rota real `/[locale]/solicitar-orcamento`) |
| Legenda de vídeo | "VÍDEO · PALCO COM PAINEL DE LED · 16:9" — mono 13px/1.4, tracking 0.04em, cor `textoMutedClaro`, margin-top 32px. **Não há vídeo real no HTML-fonte** — é só rótulo textual sobre o mosaico; não implementar player. |

Rodapé do bloco: `SectionDivider` (variante escura, `tinta750`), 2px.

**Destino do CTA primário ("EXPLORAR CATÁLOGO"):** no HTML-fonte é `href="#destaques"` (rola até o
slider de produtos, dentro da própria Home). Ver **Questões em aberto**.

---

### Bloco 2 — Busca grande (`blocos.busca`)

**Layout:** `section` fundo `theme.cor.fundo`. `Container`, `padding-block: clamp(48px,6vw,64px)`.
Grid interno: `grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 32px; align-items: end`.

**Coluna esquerda:**
- H2 "Encontre o que seu evento precisa" — `Heading $nivel="h2"`, margin-bottom 12px.
- Body — "Pesquise diretamente pelo equipamento..." — `theme.tamanho[17]`/1.55, cor `theme.cor.tinta600` (nota de fidelidade — não `Body $mid`), `max-width: 52ch`.

**Coluna direita — `SearchBarGrande` (composto, ver extensão E5):**
- `<form novalidate>`. Caixa: `display:flex; border:1px solid tinta900; background:branco`.
- `input[type=search]` sem borda interna, `flex:1`, `min-width:200px`, padding 16px, `font-size:16px`,
  placeholder "Busque por mesa, capa, guarda-sol, painel de LED...", `:focus-visible` outline teal
  `outline-offset:-2px` (para dentro, já que não há borda própria).
- `button[type=submit]` `Button $variante="pretoSolido"` (E3): `border-left:1px solid tinta900`,
  padding `16px 28px`, label muda "BUSCAR" → "BUSCANDO" quando `searchBusy`, com `Spinner` (E4) ao
  lado quando `busy`. `disabled` quando `busy`.
- **Validação:** ao submeter com campo vazio, mostra `MensagemErro` (de `Field.tsx`, reusar direto)
  com texto **exato do HTML-fonte**: "Digite um produto, equipamento ou solução para buscar." —
  `role="alert"`, ícone quadrado 14px `theme.cor.erro`, margin-top 10px.
- **Estado `busy` no HTML-fonte é simulado (setTimeout 1400ms)** — nesta fase, a busca ainda não tem
  back-end de catálogo (Fase 5); o comportamento visual (label/spinner/disabled) deve existir, mas o
  destino do submit válido é **PENDENTE de decisão de produto**: navegar para
  `/[locale]/catalogo?q=...` é a opção natural (rota existe a partir da Fase 5), mas essa integração
  cruza fases — registrar como dependência da Fase 5, não bloquear a Fase 4 com uma rota que ainda
  não existe.

Rodapé do bloco: `SectionDivider` (variante clara, `theme.cor.borda`), dentro do `Container`.

---

### Bloco 3 — Grade de categorias (`blocos.grade-de-categorias`)

**Layout:** `section` fundo `fundo`. `Container`, `padding-block: clamp(64px,9vw,144px)`.
Cabeçalho: Eyebrow "Catálogo" (tealLink, uso padrão, sem E1), H2 "Explore nossas categorias"
(margin-bottom 12px), Body "Encontre os produtos..." (17px/1.55, cor `tinta600`, `max-width:58ch`,
margin-bottom 40px).

**Fonte dos cards:** `getCategorias(locale)` (5 categorias reais: `estruturas`, `telas-de-led`,
`luz-e-som`, `tendas`, `moveis`). **Não há campo `destaque` no schema de categoria** — a categoria
`telas-de-led` é identificada por **slug** (`slug === 'telas-de-led'`) para receber o tratamento de
card-bandeira; as outras 4 renderizam como cards padrão, na ordem restante de `ordem`.

**Card-bandeira LED** (link para `/[locale]/categoria/telas-de-led`, `margin-bottom:24px`):
- `display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr))` — 2 "colunas" (imagem +
  conteúdo), empilha em 1 coluna quando estreito (sem `@media`, fluido).
- Fundo `tinta900`, cor `fundo`, borda `1px solid tinta900`, hover → `border-color: teal`,
  foco → `outline:2px solid tealLink; outline-offset:3px`.
- Imagem: `aspect-ratio:16/9`, `object-fit:cover` — fonte real vem do campo `hero` da categoria
  (fallback: `ImagePlaceholder` se ausente, nunca imagem inventada).
- Conteúdo: padding `clamp(24px,3vw,40px)`, `display:flex; flex-direction:column; gap:12px`.
  - Eyebrow "Produto-bandeira" — mono 12px, teal (**sobre escuro**, extensão E1).
  - H3 (nome da categoria) — Archivo 800, uppercase, `clamp(28px,3vw,40px)`, line-height 0.98 (ver
    nota de fidelidade na Tipografia — mais largo que o token `h3` do tema).
  - Body (descrição) — 17px/1.5, cor `theme.cor.superficie200` (`#DDE0E0`), `max-width:44ch`.
  - Link "VER {NOME} →" — Archivo 800, 15px, cor **teal**, `gap:10px`, seta `aria-hidden`.

**4 cards padrão** (Estruturas, Luz & Som, Tendas, Móveis → `/[locale]/categoria/{slug}`):
- Grid: no HTML-fonte é `{{ gridQuatro }}` — **calculado em JS por `window.innerWidth`** (1 coluna
  `<760px`, 2 colunas `<1180px`, 4 colunas `≥1180px`). Isto repete o mesmo problema que a Fase 2
  resolveu no chrome (D1: leitura de `window.innerWidth` = mismatch de hidratação + CLS). **Não
  decido este ponto sozinho** — ver **Questões em aberto**, item Q1.
- Cada card: `display:flex; flex-direction:column`, fundo `branco`, borda `1px solid theme.cor.borda`,
  hover → `border-color:tinta900`, foco → `outline:2px solid tealLink; outline-offset:3px`.
- Imagem: `aspect-ratio:16/9`, `object-fit:cover`, `border-bottom:1px solid borda`.
- Corpo: padding 24px (fixo, não `clamp`), `gap:12px`, `flex:1`.
  - H3 (nome) — **Public Sans 500, 22px/1.3, sem uppercase** (não é `Heading` — ver Tipografia).
  - Body (descrição) — 15px/1.5, cor `theme.cor.tinta600`, `flex:1`.
  - Link "VER {NOME} →" — Archivo 800, **14px** (1px menor que o do card-bandeira), cor **tealLink**
    (não teal — cards padrão são sobre fundo claro), `gap:8px`.

**Diferença exata card-bandeira vs. card padrão** (resumo para o checker):

| Aspecto | Card-bandeira (LED) | Card padrão (4) |
|---|---|---|
| Fundo/cor | `tinta900` / `fundo` (escuro) | `branco` / `tinta900` (claro) |
| Eyebrow | Sim, "Produto-bandeira", teal | Não tem |
| Fonte do título | Archivo display, uppercase, `clamp(28,3vw,40)` | Public Sans, sem uppercase, 22px fixo |
| Cor do link CTA | teal (`#2FB6B9`) | tealLink (`#1A7F82`) |
| Tamanho do link CTA | 15px | 14px |
| Padding do corpo | `clamp(24px,3vw,40px)` fluido | 24px fixo |
| Posição | Sozinho, linha própria, `margin-bottom:24px` | Em grade de 4, abaixo do bandeira |
| Borda hover | → teal | → tinta900 |

Rodapé do bloco: `SectionDivider` (variante clara), dentro do `Container`.

---

### Bloco 4 — Produtos em destaque / slider (`blocos.produtos-em-destaque`)

**Layout:** `section` fundo `fundo`. `Container`, `padding-block: clamp(56px,7vw,96px)`.
Cabeçalho: Eyebrow "Seleção" (tealLink), H2 "Produtos em destaque" (margin-bottom 12px). Linha
seguinte (`flex-wrap; gap:24px; align-items:flex-end; justify-content:space-between;
margin-bottom:40px`): Body "Selecione os produtos..." (17px/1.55, `tinta600`, `max-width:58ch`) +
controles do slider (contador + setas).

**Fonte dos itens:** `getProdutos(locale, { destaque: true })` — 5 produtos reais com
`tipoDeItem`/`cores`/`ehServico` traduzidos pelo adaptador (D2). Cada item renderiza via
`ProductCard` já existente — **não recriar** a anatomia do card (foto 4:3 com hover, spec-bar,
categoria mono, nome, descrição, swatches de cor se `temCor`, `QuantityStepper`, 2 botões). O único
trabalho novo deste bloco é o **contêiner de slider** em torno de instâncias de `ProductCard`.

**Contrato de interação do slider (specs completas abaixo, seção dedicada).**

Rodapé do bloco: nenhum `SectionDivider` explícito no HTML-fonte entre este bloco e o próximo (o
bloco 5 já abre com o seu próprio divisor escuro) — não adicionar um.

---

### Bloco 5 — Painéis de LED (`blocos.destaque-led`)

**Layout:** `section` fundo `tinta900`, cor `fundo`. Abre com `SectionDivider` (variante escura).
`Container`, `padding-block: clamp(72px,10vw,144px)`. Grid:
`grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); gap: clamp(32px,5vw,64px);
align-items:start` — 2 colunas (texto + galeria), empilha fluido.

**Coluna de texto:**
| Elemento | Spec |
|---|---|
| Eyebrow | "Painéis de LED" — mono 12px, cor **teal** (sobre escuro, E1), margin-bottom 16px |
| H2 | "Painéis de LED para transformar seu evento" — `clamp(30px,3.8vw,44px)`/0.98, margin-bottom 20px |
| Body 1 | 17px/1.55, cor `superficie200` (`#DDE0E0`), `max-width:52ch`, margin-bottom 16px |
| Body 2 | 17px/1.55, cor `textoMutedClaro` (`#9EA3A5`), `max-width:52ch`, margin-bottom 32px |
| Cards PIXEL PITCH (2×) | Grid `auto-fit,minmax(180px,1fr)`, gap 16px, margin-bottom 32px. Cada card: `border:1px solid teal; background:tinta800; padding:20px; border-radius:2px`. Rótulo mono 12px teal "PIXEL PITCH"; valor Archivo 800 34px/1 ("P1.9"/"P3.9" + "mm" em 20px inline); legenda 15px/1.4 `textoMutedClaro` |
| Listas O QUE INSTALAMOS / O QUE EXIBIMOS | Grid `auto-fit,minmax(220px,1fr)`, gap `24px 32px`, margin-bottom 40px. Cada coluna: rótulo mono 12px `textoMutedClaro`, `border-bottom:1px solid tinta700`, `padding-bottom:8px`, margin-bottom 12px. Lista sem marcador nativo: `<li>` com `<span>` quadrado 6×6px `background:teal` + texto 17px/1.4 `superficie200`, `gap:10px`, `align-items:baseline` |
| CTA | "CONHECER NOSSAS SOLUÇÕES EM LED" — `Button $variante="primario" $tamanho="lg"` (padding 17px 26px) |

**Listas exatas (copy do HTML-fonte, não reescrever):**
- O QUE INSTALAMOS: "Tamanhos personalizados" · "Instalação profissional" · "Configurações internas
  e externas" · "Suporte técnico disponível".
- O QUE EXIBIMOS: "Compatibilidade com vídeos" · "Compatibilidade com apresentações" ·
  "Possibilidade de transmissão ao vivo" · "Exibição de conteúdos de patrocinadores".

**Galeria de 3 imagens:** `display:grid; gap:2px; grid-template-columns:1fr 1fr; background:tinta900`.
- Imagem 1: `grid-column: span 2`, `aspect-ratio:16/10`, `object-fit:cover` (imagem larga no topo).
- Imagens 2 e 3: `aspect-ratio:1/1` cada, `object-fit:cover`, lado a lado.
- Fonte: campo `imagens` do bloco (array de mídia) — usar as 3 primeiras, nesta ordem exata (larga,
  quadrada, quadrada). **Sem imagem cadastrada:** `ImagePlaceholder` por posição, com a proporção
  correspondente (`ratio="16/10"` na primeira, `ratio="1/1"` nas outras duas) — nunca reduzir para
  menos de 3 posições nem inventar foto.

Rodapé: `SectionDivider` (variante escura).

**CTA "CONHECER NOSSAS SOLUÇÕES EM LED":** no HTML-fonte aponta para `href="#led-solucoes"`, um
**ancora que não existe em nenhum lugar da página** (link morto já no layout-fonte). Decisão: usar a
rota real `/[locale]/categoria/telas-de-led` em vez de reproduzir o link morto.

---

### Bloco 6 — Como funciona (`blocos.como-funciona`)

**Layout:** `section` fundo `fundo`. `Container`, `padding-block: clamp(64px,9vw,144px)`.
H2 "Monte seu orçamento em quatro etapas" — margin-bottom 40px.

**Lista de 4 etapas:** `<ol>` sem marcador nativo, grid `auto-fit,minmax(240px,1fr)`, gap 24px,
margin-bottom 40px. Cada `<li>`: `border-top:2px solid tinta900; padding-top:20px`.
- Número — Archivo 800, 44px/1, cor **tealLink**, margin-bottom 16px.
- H3 (título do passo) — Public Sans 500, 22px/1.3, margin-bottom 8px.
- Body — 15px/1.5, cor `tinta600`.

**Copy exata das 4 etapas (payload esperado do CMS em `passos[]`, HTML-fonte):**
1. "Escolha os produtos" — "Navegue pelo catálogo e encontre os itens que deseja incluir no evento."
2. "Adicione ao orçamento" — "Escolha a quantidade, a cor ou a configuração e adicione os itens ao carrinho."
3. "Envie os dados do evento" — "Informe a data, o endereço, o tipo de evento e as necessidades de montagem."
4. "Receba sua proposta" — "Nossa equipe analisará a solicitação e enviará um orçamento personalizado."

**Aviso final do bloco:** usar `Notice` (já existente, variante padrão — faixa `superficie150` +
`border-left:2px solid tealLink`) com rótulo "AVISO" e texto exato: "Os produtos não ficam
reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe."
`max-width:840px`. **Este texto vem de `settings-globais` (microcopy legal), não é hardcoded** — o
bloco só define a posição/estilo do `Notice`; o conteúdo é o mesmo texto reusado no rodapé e no
Toast (já mapeado no design system da Fase 2).

Rodapé: `SectionDivider` (variante clara), dentro do `Container`.

---

### Bloco 7 — Diferenciais (`blocos.diferenciais`)

**Layout:** `section` fundo `fundo`. `Container`, `padding: 64px 20px` — **fixo, não `clamp()`**
(único bloco da Home sem padding fluido; reproduzir exatamente assim, não "corrigir" para fluido).
H2 "Estrutura e suporte para seu evento" — margin-bottom 32px.

**Grade de 5 blocos:** `display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
gap:1px; background:theme.cor.borda; border:1px solid theme.cor.borda` — o efeito visual é uma
grade com **linhas finas de 1px** entre os cards (o `gap` de 1px sobre fundo cinza cria as divisórias,
não são bordas individuais). Cada célula: `background:fundo; padding:24px`.
- H3 — Public Sans 500, 22px/1.3, margin-bottom 8px (mesmo padrão dos cards de categoria/etapas).
- Body — 15px/1.5, cor `tinta600`.

**Copy exata dos 5 diferenciais (HTML-fonte):**
1. "Produtos e equipamentos" — "Equipamentos selecionados para criar ambientes funcionais, organizados e profissionais."
2. "Atendimento personalizado" — "Cada solicitação é analisada individualmente pela equipe."
3. "Entrega e montagem" — "Entrega, instalação, desmontagem e retirada podem ser incluídas na proposta."
4. "Suporte técnico" — "Soluções técnicas para painéis de LED e produções que exigem acompanhamento especializado."
5. "Atendimento em diferentes regiões" — "Atendimento disponível em cidades selecionadas da Flórida, de acordo com a data e a logística do evento."

Rodapé: `SectionDivider` (variante clara), dentro do `Container`.

---

## Contrato de interação — Slider de produtos em destaque (Bloco 4)

**Como é no HTML-fonte:** um `<div style="overflow:hidden">` com uma faixa `flex` que recebe
`transform: translateX(...)` calculado em JS a partir de `perView()` (1/2/3/4 cards por vez, definido
por `window.innerWidth < 700/1080/1280`) — o mesmo padrão de leitura de viewport que a Fase 2 já
rejeitou no chrome (D1: mismatch de hidratação + CLS). Não há dots; há só duas setas (`←`/`→`) e um
contador textual mono ("N–M / 5").

**Decisão desta fase (Claude's Discretion, conforme `04-CONTEXT.md`: "CSS scroll-snap é preferível a
biblioteca"):** substituir o par `perView()`/`transform` por um contêiner de **rolagem nativa com
scroll-snap**, sem JS de largura de viewport — elimina o problema de hidratação na raiz, e a
quantidade de cards visíveis passa a ser uma consequência fluida da largura, não uma lista de
degraus fixos.

### Estrutura
- Contêiner externo: `role="region"`, `aria-label="Produtos em destaque"`, `overflow-x:auto`,
  `overflow-y:hidden`, `scroll-snap-type: x mandatory`, `display:flex`, `gap:24px` (mesmo `gap` do
  HTML-fonte).
- Cada item: `<ProductCard>` existente, envolto em wrapper com `flex: 0 0 clamp(260px, 26vw, 300px)`
  (fluido — sem media query; a 1280px de container isso aproxima 4 cards visíveis como no
  HTML-fonte; a 375px aproxima 1 card, sem scroll horizontal da página porque o scroll é interno ao
  contêiner do slider), `scroll-snap-align: start`, `min-width:0`.
- 5 itens vêm de `getProdutos(locale, { destaque: true })`.

### Controles
- Duas setas (sem dots — o HTML-fonte não tem indicador de bolinhas, só as duas setas e o contador):
  `←` "Produtos anteriores" / `→` "Próximos produtos". 48×48px, `border:1px solid tinta900`,
  `border-radius:2px`, hover → fundo `tinta900`/cor `fundo`, foco → `outline:2px solid tealLink;
  outline-offset:3px`. Clique: `scrollBy({ left: ±(larguraDoPrimeiroCard + 24), behavior })`, medindo
  a largura real do primeiro card no DOM (nunca assumindo um valor fixo por breakpoint).
- Contador textual mono ("N–M / 5"): calculado via `IntersectionObserver` nos 5 wrappers de card
  (threshold ~0.6) para saber quais estão predominantemente visíveis — atualiza `N` (primeiro
  visível) e `M` (último visível) a cada mudança de interseção, sem *polling* de `scroll`.
- Estado das setas: seta "anterior" desabilitada (`disabled`, `opacity:.3`) quando
  `scrollLeft <= 0`; seta "próxima" desabilitada quando
  `scrollLeft + clientWidth >= scrollWidth - 1` (epsilon de 1px para arredondamento).

### Teclado e ordem de foco
- Os 5 `ProductCard` ficam todos no DOM (sem virtualização) — a ordem de foco por `Tab` é a ordem do
  DOM: [seta anterior] → [seta próxima] → [card 1: link "VER DETALHES" → swatches de cor, se
  `temCor` → stepper `−`/input/`+` → botão secundário] → [card 2: mesma sequência] → ... → [card 5].
- Um card fora da área visível que recebe foco por `Tab` deve entrar em vista: isso é comportamento
  nativo do navegador para contêineres `overflow:auto` com foco dentro (`scrollIntoView` implícito) —
  não é necessário JS adicional para isso.
- As setas Prev/Next são `<button>` nativos — Enter/Espaço já ativam por padrão do HTML.
- Não é necessário capturar `ArrowLeft`/`ArrowRight` no contêiner: o scroll nativo por teclado já
  funciona quando o contêiner (ou um filho) está focado, e as setas de UI cobrem a navegação
  explícita por clique/Enter.

### `prefers-reduced-motion`
- `scroll-behavior` do contêiner e o `behavior` passado a `scrollBy`/`scrollTo` devem ser `'auto'`
  (salto instantâneo) quando `window.matchMedia('(prefers-reduced-motion: reduce)').matches` for
  verdadeiro; `'smooth'` caso contrário. (A regra global do `GlobalStyle.ts` já zera
  `scroll-behavour` para `auto` sob reduced-motion — o componente só precisa não forçar `'smooth'`
  via JS por cima disso.)
- O hover/foco da `SpecBar` do `ProductCard` (barra de spec subindo) já usa `transition`, coberta
  pela regra global de `animation-duration`/`transition-duration` zerada — nenhum tratamento extra
  aqui.

---

### Bloco 8 — Avaliações (`blocos.avaliacoes`) — estados cheio / vazio / carregando

**Cabeçalho comum aos 3 estados:** `section` fundo `fundo`, `Container`, `padding-block:
clamp(56px,7vw,96px)`. Eyebrow "Avaliações" (tealLink), H2 "A confiança de quem já realizou eventos
conosco" (margin-bottom 12px), Body "Conheça a experiência de clientes..." (17px/1.55, cor
`tinta600`, `max-width:58ch`, margin-bottom 32px).

**Fonte de dados e regra inviolável:** `getAvaliacoes()` filtra `publicada`. O HTML-fonte tem 4
depoimentos nomeados (Marina Alcântara, Rodrigo Beltrão, Camila Ferreira, Diego Nascimento) — são
**exemplos de design, fechados como ℹ️ INTENCIONAL** (`docs/00-divergencias.md` item 13). **Nunca
semear ou renderizar depoimento fictício.** Com o CMS recém-instalado (Fase 3, sem conteúdo), o
estado real na primeira publicação é o **estado vazio** — por isso ele recebe a mesma especificação
detalhada que o estado cheio, não um tratamento secundário.

#### Estado "cheio" (avaliações reais publicadas)

- Grid: `{{ gridQuatro }}` no HTML-fonte — **mesmo padrão JS de breakpoint do Bloco 3** (ver
  **Questões em aberto**, Q1). Aplica-se aqui a mesma decisão pendente.
- Cada avaliação é um `<figure>`: `margin:0; background:branco; border:1px solid borda;
  border-radius:2px; padding:24px; display:flex; flex-direction:column; gap:14px`.
  - Nota: `display:flex; align-items:baseline; gap:10px`. Valor — Archivo 800, 28px/1, cor
    `tinta900`. Sufixo "/ 5,0" — mono 12px/1, tracking 0.06em, cor `tealLink`.
    **Pendente de decisão de i18n:** o HTML-fonte só mostra o formato pt-BR (vírgula decimal, ex.
    "5,0"). O schema (`avaliacaoSchema.nota`) é `number`. Para `en`/`es`, formatar com
    `Intl.NumberFormat(locale, { minimumFractionDigits: 1 })` em vez de fixar a vírgula — **o
    HTML-fonte não especifica o comportamento nos outros locales; marcar como pendente para
    confirmação do time, não decidir a formatação por conta própria além da recomendação técnica
    acima.**
  - Citação: `<blockquote>` 15px/1.55, cor `theme.cor.tinta750` (`#2A2D2F`), `flex:1;
    text-wrap:pretty`.
  - Rodapé (`<figcaption>`): `border-top:1px solid borda; padding-top:14px`. Nome — 17px/1.3, peso
    500, `tinta900`, margin-bottom 2px. Empresa — 15px/1.4, `tinta600`, margin-bottom 8px. **Se
    `empresa` vier vazia/nula, omitir a linha inteira** (o HTML-fonte tem um exemplo com empresa
    vazia — decisão: não reservar espaço em branco). Cidade + tipo de evento — mono 13px/1.4,
    tracking 0.04em, `textoMuted`, em duas linhas (`<br>` entre `cidade` e `tipo`).

#### Estado "vazio" (esperado ser o real no lançamento)

Layout: caixa com `border:1px solid borda; background:branco; border-radius:2px; padding:
clamp(28px,4vw,48px)` — **exatamente a mesma caixa do `EmptyState` já existente**, mas com um
conteúdo em **2 colunas** (`grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:32px;
align-items:center`), diferente do arranjo em coluna única padrão do `EmptyState`. **Extensão
necessária (E6):** ou o `EmptyState` recebe uma variante de layout de 2 colunas, ou este bloco é
composto manualmente reaproveitando `Eyebrow`/`Heading $nivel="h3"`/`Body` soltos dentro da mesma
caixa estilizada — registrar a escolha no plano de execução, não decidir silenciosamente dentro do
componente.

**Coluna esquerda (texto — copy exata do HTML-fonte, não reescrever):**
- Eyebrow: "NENHUMA AVALIAÇÃO PUBLICADA" — mono 12px, cor `textoMuted` (**não** teal/tealLink aqui;
  é neutro, diferente do eyebrow padrão de seção).
- H3: "Publicamos apenas avaliações reais de clientes." — Public Sans 500, 22px/1.3, margin-bottom 10px.
- Body: "Assim que os primeiros eventos forem entregues, as avaliações verificadas aparecem aqui,
  com cidade, tipo de evento e nota." — 15px/1.5, `tinta600`, `max-width:46ch`.

**Coluna direita (estrutura + CTA):**
- Caixa tracejada: `border:1px dashed borda; padding:16px; border-radius:2px`. Rótulo mono 12px
  `textoMuted` "ESTRUTURA DA AVALIAÇÃO", seguido de 4 linhas mono 13px/1.4 `textoMuted`:
  "NOME · EMPRESA" / "CIDADE · TIPO DE EVENTO" / "NOTA · 0,0 / 5" / "TEXTO COMPLETO DA AVALIAÇÃO".
  **Este bloco é decorativo/explicativo** (mostra a "forma" de uma avaliação, não dados reais) —
  reproduzir literalmente, é assim no HTML-fonte.
- CTA: "SOLICITAR ORÇAMENTO" — `Button $variante="outlinePreto" $tamanho="sm"` (borda `tinta900`,
  hover invertido) → rota real `/[locale]/solicitar-orcamento` (no HTML-fonte é `href="#solicitar"`,
  âncora interna à Home; decisão: usar a rota real, mesma lógica aplicada aos outros CTAs
  "SOLICITAR ORÇAMENTO" da página).

#### Estado "carregando" (skeleton)

- Grid: `repeat(auto-fit, minmax(280px,1fr))`, `gap:24px` — **este estado já usa `auto-fit` nativo no
  HTML-fonte** (diferente do `gridQuatro` do estado cheio — inconsistência do próprio layout-fonte,
  não corrigida aqui; ver Q1).
- **Exatamente 3 cards-esqueleto no HTML-fonte** (não 4, mesmo o estado "cheio" mostrando 4 por
  linha) — reproduzir fielmente essa contagem, não completar para 4 "para bater" com o outro estado;
  é assim no código-fonte.
- Cada esqueleto: `border:1px solid borda; background:branco; padding:24px; border-radius:2px;
  display:grid; gap:12px`, com `animation: amrPulse 1.3s ease-in-out infinite` (mesmo padrão de
  `CardEsqueleto` em `Skeleton.tsx`, mas sem o bloco de foto — este esqueleto é só texto).
  Reaproveitar o `SkeletonBar` já exportado de `Skeleton.tsx` para as 4 barras de cada card, com as
  larguras exatas do HTML-fonte:
  - Card 1: alturas `14/12/12/12px`, larguras `40%/60%/100%/85%`.
  - Card 2: alturas `14/12/12/12px`, larguras `35%/55%/100%/70%`.
  - Card 3: alturas `14/12/12/12px`, larguras `45%/50%/95%/80%`.

---

### Bloco 9 — CTA final (`blocos.chamada-final`)

**Layout:** `section` fundo `tinta900`, cor `fundo`. Abre com `SectionDivider` (variante escura).
`Container`, `padding-block: clamp(64px,9vw,144px)`. Grid:
`grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap:40px; align-items:end`.

| Elemento | Spec |
|---|---|
| H2 | "Comece a montar seu evento" — `clamp(30px,4vw,44px)`/0.98, margin-bottom 16px |
| Body | "Explore o catálogo, selecione os produtos e envie sua solicitação para nossa equipe." — 17px/1.55, cor `superficie200` (`#DDE0E0`), `max-width:52ch` |
| CTA 1 | "VER TODOS OS PRODUTOS" — `Button $variante="outlineClaro" $tamanho="lg"` |
| CTA 2 | "SOLICITAR ORÇAMENTO" — `Button $variante="primario" $tamanho="lg"` → `/[locale]/solicitar-orcamento` |

Não há `SectionDivider` de rodapé aqui — o `Footer` que segue já abre com sua própria
`border-top:1px solid tinta800` (chrome da Fase 2, não repetido nesta fase).

**Destino do CTA 1 ("VER TODOS OS PRODUTOS"):** no HTML-fonte é `href="#destaques"` (rola até o
slider da própria Home, Bloco 4). Mesma questão em aberto do CTA primário do Hero — ver Q2.

---

## Toast (reuso 1:1 do componente da Fase 2)

O toast de "adicionado ao orçamento" da Home **não precisa de nenhuma alteração** no componente
`Toast.tsx` — é reuso direto. Composição esperada neste bloco:

```
<Toast
  titulo="Produto adicionado ao seu orçamento"
  sub={`${nomeProduto.toUpperCase()} · QTD ${quantidade}`}
  nota={microcopyLegal}            // de settings-globais — mesmo texto do rodapé e do aviso do Bloco 6
  offsetBarra={false}              // a Home NÃO tem barra fixa de orçamento (ℹ️ INTENCIONAL, item 10)
  onFechar={fecharToast}
  acoes={<>
    <Button $variante="outlineClaro" onClick={fecharToast}>CONTINUAR NAVEGANDO</Button>
    <Button as="a" href="/[locale]/meu-orcamento" $variante="primario">VER MEU ORÇAMENTO</Button>
  </>}
/>
```

Auto-fecha em 7000ms (`duracaoMs` já tem esse default no componente, igual ao HTML-fonte).

---

## Comportamento sem CMS (Claude's Discretion, `04-CONTEXT.md`)

Se `getPagina(locale, 'home')` retornar `null` (Strapi indisponível, ou a página `home` ainda não foi
criada no CMS): **não quebrar a página, não mostrar tela branca.** Renderizar:
- `Header`/`Footer`/`TopBar` normalmente (eles têm sua própria fonte de dados via
  `getNavPrincipal`/`getColunasRodape`/`getSettingsGlobais`, com fallback próprio caso também
  falhem).
- No lugar da Dynamic Zone, um único `Notice` (variante `escuro`, já existente) centrado no
  `Container`, com rótulo "CONTEÚDO INDISPONÍVEL" e texto: "Não foi possível carregar o conteúdo da
  página no momento. Tente novamente em alguns minutos." **Esta cópia é uma proposta desta pesquisa,
  não vem do HTML-fonte (que não tem estado de falha de CMS) — marcar como copy a confirmar com o
  time antes de travar no código.**
- Nenhum bloco parcial: ou a Dynamic Zone renderiza todos os blocos recebidos (blocos desconhecidos
  filtrados para `null` pelo adaptador, conforme já implementado em `adaptarBlocos`), ou cai neste
  fallback único — sem estado intermediário "alguns blocos sim, outros quebrados".

---

## Eventos desta fase (`view_item_list`, MED-01/HOME-05)

A implementação do módulo `dataLayer` tipado é tarefa do plano 04-01 (fora do escopo visual desta
spec) — aqui vai só o contrato de **onde** disparar e **o que não pode conter**, para o plano de
execução não inventar por conta própria:

- Disparar `view_item_list` em **2 pontos de listagem** da Home:
  1. Grade de categorias (Bloco 3) — lista com as 5 categorias (incluindo a bandeira), na ordem
     renderizada.
  2. Produtos em destaque (Bloco 4) — lista com os 5 produtos do slider, na ordem renderizada.
- Avaliações **não** é uma lista de item de catálogo (são depoimentos, não produtos) — não emite
  `view_item_list`.
- Payload por item: identificador + nome + categoria + posição (`index`). **Nunca** incluir `price`,
  `value`, `currency` ou `revenue` — reforça PRECO-01/PRECO-04, já cobertos pelo guard existente.
- Disparo: uma vez por montagem da lista (não a cada scroll/hover do slider).

---

## Questões em aberto (não decidido nesta pesquisa — registrar para o planejador confirmar)

**Q1 — Grid de 4 colunas por JS (`gridQuatro`) nos Blocos 3 e 8.** O HTML-fonte calcula
`grid-template-columns` em JS a partir de `window.innerWidth` (1 coluna `<760px`, 2 colunas
`<1180px`, 4 colunas `≥1180px`), usado nos 4 cards de categoria (Bloco 3) e na grade de avaliações
"cheio" (Bloco 8). Isso é o mesmo problema que a Fase 2 já resolveu no chrome via `@media` (D1:
leitura de `window.innerWidth` no cliente = mismatch de hidratação + CLS). A regra desta fase impede
adicionar `@media` nova sem registrar como questão aberta — por isso não decido aqui. **Recomendação
técnica (não é decisão):** substituir por `grid-template-columns: repeat(auto-fit, minmax(260px,
1fr))`, que é o mesmo padrão já usado no card-bandeira (Bloco 3) e no próprio estado "carregando" do
Bloco 8 — elimina o JS de viewport sem introduzir `@media`, ao custo de os pontos de quebra exatos
(760px/1180px) não serem mais idênticos aos do HTML-fonte (o número de colunas em larguras
intermediárias pode variar em ±1 coluna comparado ao original). Precisa de confirmação antes de
implementar, porque afeta a comparação lado a lado do HOME-04.

**Q2 — Destino de "EXPLORAR CATÁLOGO" (Hero) e "VER TODOS OS PRODUTOS" (CTA final).** No HTML-fonte,
ambos são âncoras internas (`#destaques`) que rolam até o slider de 5 produtos da própria Home. Como
existe uma página de Catálogo real a partir da Fase 5 (`/[locale]/catalogo`), pode fazer mais sentido
produto navegar para lá em vez de rolar dentro da Home (que só tem 5 itens, não o catálogo
completo). Não decidido aqui porque é uma escolha de IA/produto, não uma questão puramente visual —
registrar para confirmação; enquanto a Fase 5 não existe, o comportamento de rolagem interna
(`#destaques`) continua funcionando sem quebrar nada.

**Q3 — Destino do submit de busca (Bloco 2) e formatação de nota (Bloco 8, i18n).** Já registrados
inline nas seções dos respectivos blocos — repetidos aqui só para rastreabilidade.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | "SOLICITAR ORÇAMENTO" — em todo lugar que aparece nesta fase (Hero, CTA final, Header, estado vazio de avaliações, Toast) aponta para a rota real `/[locale]/solicitar-orcamento` |
| Empty state heading (avaliações) | "Publicamos apenas avaliações reais de clientes." |
| Empty state body (avaliações) | "Assim que os primeiros eventos forem entregues, as avaliações verificadas aparecem aqui, com cidade, tipo de evento e nota." + CTA "SOLICITAR ORÇAMENTO" |
| Empty state eyebrow (avaliações) | "NENHUMA AVALIAÇÃO PUBLICADA" (cor neutra `textoMuted`, não teal) |
| Error state (busca grande) | "Digite um produto, equipamento ou solução para buscar." — `role="alert"`, sem sugestão de novo termo (o HTML-fonte não tem "tente de novo" — é só a instrução de preencher o campo) |
| CMS indisponível (fallback de página, proposta desta pesquisa — confirmar antes de travar) | Rótulo "CONTEÚDO INDISPONÍVEL" + "Não foi possível carregar o conteúdo da página no momento. Tente novamente em alguns minutos." |
| Aviso "Como funciona" (Bloco 6, vem de `settings-globais`) | "Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe." |
| Toast — título fixo | "Produto adicionado ao seu orçamento" |
| Toast — nota legal | mesmo texto do aviso acima, de `settings-globais` |
| Destructive confirmation | Não há ação destrutiva na Home (remover/limpar é do carrinho, Fase 8) — not applicable nesta fase |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|--------------|
| shadcn official | nenhum — projeto não usa shadcn | not applicable |
| third-party | nenhum registro de terceiros usado | not applicable |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
