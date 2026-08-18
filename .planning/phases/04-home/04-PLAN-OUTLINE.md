# Fase 4 — Home — Divisão de planos

**Criado:** 2026-08-18
**Planos:** 7 (o ROADMAP previa 4; ver justificativa abaixo)
**Waves:** 3

## Tabela de planos

| Plan ID | Objetivo | Wave | Depends On | Requirements |
|---|---|---|---|---|
| 04-01 | Porta única de eventos: módulo `dataLayer` tipado + regra ESLint + guarda de varredura; emissor client de `view_item_list`; `images.remotePatterns` + `NEXT_PUBLIC_STRAPI_MEDIA_URL` | 1 | — | MED-01, HOME-05 |
| 04-02 | Chrome alimentado pelo CMS em `[locale]/layout.tsx` (fecha divergência item 6), extensões E1–E4 do design system + `@keyframes amrMod`, `error.tsx` com `retry` | 1 | — | HOME-01, HOME-04 |
| 04-03 | Blocos escuros de abertura e fechamento: `HeroBloco` (mosaico 12×6 em CSS) e `ChamadaFinalBloco` | 2 | 04-01, 04-02 | HOME-01, HOME-04 |
| 04-04 | Busca grande (composto E5) e grade de categorias (card-bandeira LED + 4 cards) com `view_item_list` | 2 | 04-01, 04-02 | HOME-01, HOME-04, HOME-05 |
| 04-05 | Vitrine: `Produto.categoria` no adaptador, `mapearParaProductCard`, slider `scroll-snap` com `view_item_list`, seção Painéis de LED | 2 | 04-01, 04-02 | HOME-02, HOME-04, HOME-05 |
| 04-06 | Prova e processo: como funciona (4 etapas), diferenciais (5 blocos), avaliações (cheio/vazio/carregando) + skeleton na showcase | 2 | 04-02 | HOME-03, HOME-04 |
| 04-07 | Renderizador da Dynamic Zone (`switch` exaustivo), `page.tsx` da Home com fallback de CMS indisponível, conferência de fidelidade desktop + 375px | 3 | 04-03, 04-04, 04-05, 04-06 | HOME-01, HOME-04 |

## Por que 7 e não 4

O ROADMAP previa 4 planos e não contemplava dois trabalhos obrigatórios descobertos na pesquisa:

1. **Pré-requisito de imagem** (`images.remotePatterns` + `NEXT_PUBLIC_STRAPI_MEDIA_URL`) — sem ele
   `next/image` responde 400 em runtime para toda imagem do Strapi. Precisa vir antes de Hero, grade de
   categorias e galeria de LED.
2. **Chrome no `[locale]/layout.tsx`** — `TopBar`/`Header`/`Footer` não estão montados em nenhum lugar da
   árvore hoje, e `TopBar` não tem props. É o ponto único herdado pelas Fases 5–11.

Além disso, as 6 extensões do design system (E1–E6) e o gap `Produto → ProdutoResumo` são trabalho real
que não cabia nos 4 planos originais sem estourar o orçamento de contexto (2–3 tarefas por plano).

Cada plano continua com 2–3 tarefas. Wave 2 tem 4 planos em paralelo (04-03 a 04-06), sem sobreposição de
`files_modified`.

## Estrutura de waves e propriedade de arquivos

**Wave 1** (paralelo, zero sobreposição):
- 04-01: `src/lib/analytics/*`, `src/components/analytics/*`, `src/__tests__/guards/dataLayer-porta-unica.test.ts`, `eslint.config.mjs`, `next.config.ts`, `.env.example`
- 04-02: `src/components/chrome/{TopBar,Footer}.tsx`, `src/app/[locale]/{layout,error}.tsx`, `src/components/primitives/{Typography,Button}.tsx`, `src/components/feedback/Spinner.tsx`, `src/lib/theme/GlobalStyle.ts`, `src/app/[locale]/design-system/page.tsx`

**Wave 2** (paralelo, zero sobreposição):
- 04-03: `src/components/blocos/{HeroBloco,ChamadaFinalBloco}.tsx` + testes
- 04-04: `src/components/blocos/{BuscaBloco,SearchBarGrande,GradeDeCategoriasBloco}.tsx` + testes
- 04-05: `src/lib/cms/{schemas,adapters}.ts`, `src/lib/product/mapearParaProductCard.ts`, `src/components/blocos/{ProdutosEmDestaqueBloco,SliderDeProdutos,DestaqueLedBloco}.tsx` + testes
- 04-06: `src/components/blocos/{ComoFuncionaBloco,DiferenciaisBloco,AvaliacoesBloco}.tsx` + testes, `src/app/[locale]/design-system/page.tsx` (wave posterior a 04-02, que também o toca)

**Wave 3**:
- 04-07: `src/components/blocos/renderizador.tsx`, `src/app/[locale]/page.tsx`, `docs/divergencias.md`

**Por que o renderizador vem por último:** o `switch` exaustivo importa os 9 componentes de bloco. Se ele
fosse criado antes, cada plano de bloco precisaria editar `renderizador.tsx`, criando sobreposição de
arquivo e forçando os 4 planos de bloco a waves sequenciais. Criando-o no fim, os 4 planos de bloco rodam
em paralelo e cada um se verifica por teste unitário + asserção sobre a fonte, não pela página montada.

## As 4 questões em aberto — decididas

### Q1 — grid `gridQuatro` por JS nos Blocos 3 e 8
**Decisão:** substituir por `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))`. Nenhuma `@media`
nova, nenhuma leitura de `window.innerWidth`.
**Justificativa:** D1 de `docs/divergencias.md` já rejeitou layout dirigido por `window.innerWidth` (mismatch
de hidratação + CLS) e a regra da fase proíbe `@media` nova. O próprio HTML-fonte já usa `auto-fit` no
card-bandeira do Bloco 3 e no estado "carregando" do Bloco 8 — a decisão unifica o layout-fonte, não o
contraria. **Custo aceito:** em larguras intermediárias o número de colunas pode diferir em ±1 dos degraus
760px/1180px do original. Registrar como divergência D3 em `docs/divergencias.md` no plano 04-07, para a
conferência de HOME-04 não tratar isso como defeito.
**Onde:** 04-04 (Bloco 3) e 04-06 (Bloco 8).

### Q2 — granularidade do `error.tsx`
**Decisão:** um único boundary em `src/app/[locale]/error.tsx`, com a prop `retry` (não `reset`).
**Justificativa:** `getPagina` é uma chamada única — a falha é tudo-ou-nada, não há modo de falha
independente por bloco que um boundary por bloco pudesse isolar. O chrome já sobrevive porque vive em
`layout.tsx`, e `error.js` de um segmento envolve o `page.js` daquele segmento, não o `layout.js`. Um
boundary por bloco adicionaria 9 fronteiras client sem ganho. Reavaliar só quando um bloco tiver fonte de
dados própria e independente.
**Onde:** 04-02.

### Q3 — botão "adicionar ao orçamento" no slider da Home
**Decisão:** presente e inerte — `ProductCard` é renderizado **sem** a prop `onAdicionar`.
**Justificativa:** HOME-04 exige o botão visível (está no layout-fonte); o carrinho é Fase 8.
`onAdicionar` já é opcional em `ProductCardProps` e o componente lida com a ausência. A validação de cor
obrigatória (`precisaCor` → `SELECIONAR COR` + erro no `ColorSwatches`) continua funcionando sem Redux,
porque é estado local. **Nada de toast "em breve"** — seria cópia que não existe no layout-fonte.
**Onde:** 04-05.

### Q4 — distribuição das extensões E1–E6
| Ext. | O que é | Plano |
|---|---|---|
| E1 | `Eyebrow` ganha `$sobreEscuro` (`tealLink` → `teal`) | 04-02 |
| E2 | `Heading $nivel="h1"` usa `leading.displayApertado` (0.92) | 04-02 |
| E3 | `Button` ganha variante `pretoSolido` | 04-02 |
| E4 | novo `Spinner` (`amrSpin`, 13px, borda 2px) | 04-02 |
| E5 | composto `SearchBarGrande` (vive em `src/components/blocos/`, não em `primitives/`) | 04-04 |
| E6 | estado vazio de avaliações em 2 colunas | 04-06 — **rota 2: composição local**, sem tocar em `EmptyState` |

**Justificativa do E6 (rota 2):** `EmptyState` de coluna única já é consumido pelas Fases 5–6; adicionar
prop de layout condicional aumentaria a superfície de teste de um primitivo compartilhado por um caso de uso
único. `AvaliacoesBloco.tsx` replica a `Caixa` (mesma borda/padding/raio) e compõe `Eyebrow`/`Heading
$nivel="h3"`/`Body` soltos.

## Decisões extras fechadas neste planejamento

- **Mosaico do Hero é 100% CSS, sem `window.matchMedia`.** As delays por célula são geradas no servidor por
  props do styled-components (`animation-delay: ${(r+c)*0.045+0.15}s`) e o respeito a
  `prefers-reduced-motion` sai de uma linha nova no bloco global de `GlobalStyle.ts`
  (`animation-delay: 0s !important`). Consequência: `HeroBloco` fica Server Component puro, sem `'use
  client'` e sem risco de hidratação. Isto **melhora** a recomendação do RESEARCH/PATTERNS, que assumia JS
  porque o HTML-fonte usava JS.
- **`Produto` passa a carregar `categoria: { nome, slug } | null`.** `ProdutoResumo.categoria` é obrigatório
  e `Produto` não tinha o campo. A relação `categoria` existe no content-type do Strapi
  (`cms/src/api/product/content-types/product/schema.json`, `manyToOne` → `api::category.category`) e
  `getProdutos` já filtra por `filters[categoria][slug][$eq]`. A correção é aditiva: `populate` passa a
  incluir `categoria` e o schema Zod ganha o campo opcional. Alternativa rejeitada: derivar a linha de
  categoria de `tipoDeItem` — `tipoDeItem` é `fisico|com-variacao|servico-tecnico|pacote`, não é nome de
  categoria, e produziria um rótulo errado no card.
- **Formatação da nota da avaliação:** `Intl.NumberFormat(locale, { minimumFractionDigits: 1,
  maximumFractionDigits: 1 })` para o valor **e** para o sufixo (`/ ${fmt.format(5)}`), o que dá "/ 5,0" em
  pt-BR e "/ 5.0" em `en`. Fecha a pendência de i18n do Bloco 8 sem fixar a vírgula.
- **Cópia de CMS indisponível travada como proposta do UI-SPEC:** rótulo "CONTEÚDO INDISPONÍVEL" + "Não foi
  possível carregar o conteúdo da página no momento. Tente novamente em alguns minutos." — registrada como
  divergência D4 em 04-07, por não vir do HTML-fonte.
- **Fallback de nav/rodapé vazios:** o layout passa `itens={nav.length > 0 ? nav : undefined}` e
  `colunas={colunas.length > 0 ? colunas : undefined}`, deixando o default estático de `Header`/`Footer`
  agir quando o CMS não tem menu publicado. Sem isso a Home ficaria sem navegação em CMS vazio.

## Auditoria de cobertura multi-fonte

### GOAL — objetivo do ROADMAP
| Item | Status | Plano |
|---|---|---|
| Home renderiza todos os blocos a partir do CMS | COVERED | 04-03..04-07 |
| Fidelidade ao layout | COVERED | 04-07 (checkpoint) + asserções de valor em 04-03..04-06 |
| Sem preço | COVERED | guarda existente + `ItemDeListaGA4` sem campo monetário (04-01) |

### REQ — requisitos da fase
| ID | Status | Plano(s) |
|---|---|---|
| HOME-01 | COVERED | 04-02, 04-03, 04-04, 04-07 |
| HOME-02 | COVERED | 04-05 |
| HOME-03 | COVERED | 04-06 |
| HOME-04 | COVERED | 04-02, 04-03, 04-04, 04-05, 04-06, 04-07 |
| HOME-05 | COVERED | 04-01, 04-04, 04-05 |
| MED-01 | COVERED | 04-01 |

### RESEARCH — achados que mudam o plano
| Item | Status | Plano |
|---|---|---|
| Chrome não montado + `TopBar` sem props | COVERED | 04-02 |
| Estado "carregando" inalcançável (Pitfall 1) | COVERED | 04-06 (componente + teste + showcase, sem promessa de produção) |
| `images.remotePatterns` + `NEXT_PUBLIC_STRAPI_MEDIA_URL` (Pitfall 2) | COVERED | 04-01 |
| `sharp` ausente (Pitfall 3) | EXCLUÍDO | registrado para Fase 14/17 pelo próprio RESEARCH |
| Payload GA4 sem campo monetário (Pitfall 4) | COVERED | 04-01 |
| `error.tsx` com `retry` (Pitfall 5) | COVERED | 04-02 |
| `switch` exaustivo (Pattern 1) | COVERED | 04-07 |
| Fronteira Server/Client (Pattern 2) | COVERED | 04-03..04-06 |
| `dataLayer` tipado (Pattern 3) | COVERED | 04-01 |
| `no-restricted-properties` + exceção por `files` | COVERED | 04-01 |
| `revalidateTag` já correto — nada a mudar | EXCLUÍDO (nenhuma ação) | — |

### CONTEXT — decisões travadas
| Decisão | Status | Plano |
|---|---|---|
| Dados do CMS, não módulo estático (nav/rodapé/settings) | COVERED | 04-02 |
| Nunca semear depoimento fictício; estado vazio real | COVERED | 04-06 |
| 9 blocos na ordem exata, cada um do seu componente Strapi | COVERED | 04-03..04-07 |
| Renderizador ignora bloco desconhecido silenciosamente | COVERED | 04-07 |
| `dataLayer` tipado com fila segura, lint barrando acesso solto | COVERED | 04-01 |
| Sem `@media` nova; fluidez por `clamp()`/`auto-fit` | COVERED | 04-03..04-06 (asserções de valor) |
| 375px sem scroll horizontal | COVERED | 04-07 (checkpoint) |
| Estado "carregando" é componente testável, não garantia de produção | COVERED | 04-06 |
| CTAs e busca apontam para rotas finais (404 até Fase 5) | COVERED | 04-03, 04-04, 04-06 |
| Pré-requisito de imagem antes de qualquer bloco com foto | COVERED | 04-01 (wave 1, antes de tudo) |
| Não habilitar `cacheComponents` nesta fase | COVERED (nenhuma tarefa habilita) | — |
| Discricionário: pasta dos blocos | DECIDIDO: `src/components/blocos/` | — |
| Discricionário: slider por `scroll-snap` | DECIDIDO | 04-05 |
| Discricionário: degradação sem CMS | DECIDIDO: `Notice` variante `escuro` | 04-07 |

### Itens fora de escopo (não são lacunas)
GTM/GA4/Pixel/Consent (Fase 13), Metadata/JSON-LD (Fase 12), Lighthouse/orçamento de JS (Fase 14), CSP com
nonce (Fase 15), páginas de catálogo/categoria/produto (Fases 5–7), Storybook (v2), `sharp` (Fase 14/17).

**Resultado: nenhum item MISSING.**
