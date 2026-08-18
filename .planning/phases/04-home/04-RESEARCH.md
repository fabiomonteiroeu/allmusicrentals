# Phase 4: Home - Research

**Researched:** 2026-08-18
**Domain:** Next.js 16 App Router (Server Components + Dynamic Zone), styled-components 6, dataLayer tipado, ISR por tag
**Confidence:** HIGH

## Summary

A Fase 4 conecta `/[locale]` ao CMS já verificado na Fase 3 e estabelece três padrões que as Fases
5–11 vão herdar: o renderizador de Dynamic Zone, a fronteira Server/Client, e o módulo `dataLayer`
tipado. A pesquisa confirmou a stack real (Next 16.3.1, ESLint 9 flat config, `noUncheckedIndexedAccess`)
contra `node_modules/next/dist/docs/` (não contra blog posts de Next 13/14, que estão desatualizados
em pontos específicos — ver State of the Art) e inspecionou o código já entregue nas Fases 2 e 3.

Três achados mudam o escopo real do que o planejador precisa cobrir, além do que o CONTEXT.md já
descreve:

1. **`Header`/`Footer`/`TopBar` não estão montados em nenhum lugar da árvore.** `[locale]/layout.tsx`
   hoje só renderiza `StyledRegistry` + `StoreProvider` + `children`. `Header` e `Footer` já aceitam
   `itens`/`colunas` por prop (prontos para CMS), mas `TopBar` **não tem nenhuma prop** — importa
   `contato`/`textosLegais` direto do módulo estático. Fechar a divergência do item 6 exige (a) dar
   props a `TopBar`, e (b) montar o chrome completo em `[locale]/layout.tsx`, que já é `async` e já
   busca `locale` — é o lugar certo para buscar nav/rodapé/settings uma vez para todas as páginas
   futuras, não só a Home.
2. **O estado "carregando" de avaliações é estruturalmente inalcançável em produção** com a arquitetura
   travada (ADR-001: busca sempre em Server Component, sem fetch no cliente, sem `cacheComponents`
   habilitado). Uma página sem Request-Time APIs é pré-renderizada inteira no build/ISR; um `<Suspense>`
   ao redor de um bloco assíncrono é resolvido durante o próprio prerender, não em runtime por
   requisição. Ver Pitfall 1 e Open Question 1 — decisão necessária antes de planejar a tarefa.
3. **Falta configuração de imagem remota para a mídia do Strapi.** `next.config.ts` não tem
   `images.remotePatterns`; sem isso, `next/image` rejeita a URL do upload do Strapi com erro em
   runtime. `NEXT_PUBLIC_STRAPI_MEDIA_URL` também não existe em `.env.example`.

**Primary recommendation:** montar o chrome (TopBar/Header/Footer) no `[locale]/layout.tsx` com dados
buscados uma vez ali (Server Component), construir o renderizador de Dynamic Zone com `switch` exaustivo
sobre `__component` (não `Record` lookup — evita `| undefined` de `noUncheckedIndexedAccess`), implementar
o slider com CSS `scroll-snap` nativo (zero biblioteca), e criar o módulo `dataLayer` com fila seno-op e
`no-restricted-properties` (não `no-restricted-syntax`) para barrar acesso solto.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Busca de conteúdo da Home no Strapi | API/Backend (Strapi) via Server Component | — | `getPagina` já é server-only (Fase 3); página busca no servidor, nunca no cliente (ADR-001) |
| Renderização dos 9 blocos | Frontend Server (RSC) | Browser (folhas `"use client"`) | Árvore é Server Component por padrão; interação (slider, busca, toast) vira client só na folha |
| Chrome (TopBar/Header/Footer) | Frontend Server (`[locale]/layout.tsx` busca) | Browser (Header/MobileMenu interativos) | Layout é `async`, já busca `locale`; é o ponto único de busca de nav/rodapé para toda futura página |
| Slider de produtos em destaque | Browser (CSS + JS mínimo) | — | `scroll-snap` nativo; JS só para setar `aria-live`/contador e mover foco, sem lib |
| Emissão de eventos (`view_item_list`) | Browser (módulo `dataLayer`) | — | `window.dataLayer` só existe no cliente; o módulo enfileira antes do GTM (Fase 13) existir |
| Revalidação por publicação no CMS | API/Backend (Route Handler `/api/revalidate`) | Frontend Server (tags no `fetch`) | Webhook já existe (Fase 3); a Home só precisa propagar `tags` nos `fetch` dos adaptadores (já feito) |
| Imagem de mídia do Strapi | CDN/Static (`next/image` + Image Optimization) | — | Requer `images.remotePatterns` apontando para o host de upload do Strapi (gap atual) |

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions

**Regra inviolável (herdada, TRAVADA):** Nenhum preço, valor monetário ou vocabulário de compra em
nenhum bloco da Home. A guarda `src/__tests__/guards/no-price.test.ts` já varre `src/` e falha o build.
`view_item_list` **não pode** carregar `value`, `currency`, `price` ou `revenue`.

**Origem dos dados: CMS, não módulo estático**
- A Home busca por `getPagina(locale, 'home')` — `src/lib/cms/adapters.ts`, já implementado e verificado.
- Nav e rodapé passam a vir de `getNavPrincipal` / `getColunasRodape` / `getSettingsGlobais`,
  substituindo o placeholder `src/lib/site/navigation.ts`. Fecha a pendência do item 6 de
  `docs/00-divergencias.md` (hrefs de âncora → slugs reais: `estruturas`, `telas-de-led`, `luz-e-som`,
  `tendas`, `moveis`).
- Avaliações vêm de `getAvaliacoes()`, que filtra `publicada`. **Nunca semear depoimento fictício** —
  quando não há avaliação real, renderizar o estado vazio do design.

**O que a Fase 2 já entregou e NÃO deve ser reimplementado:** Tema (`src/lib/theme`), primitivos
(`Typography`, `Button`, `Field`, `Chip`, `QuantityStepper`, `ColorSwatches`, `Container`), chrome
(`TopBar`, `Header`, `MobileMenu`, `Footer`), feedback (`Notice`, `Toast`, `SectionDivider`, `Skeleton`,
`EmptyState`), media (`ImagePlaceholder`) e `ProductCard` com 3 variantes. Os blocos da Home **compõem**
esses componentes; se algum precisar de variante nova, estender o existente, não criar paralelo.

**Blocos da Home e o componente do CMS que os alimenta** (ordem exata do layout):

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

Blocos 4, 5 e 8 têm dado próprio (produtos, avaliações) que o componente do CMS **não** carrega — o
bloco traz só o cabeçalho da seção; a lista vem por adaptador.

**Renderizador da Dynamic Zone**
- Um mapa `__component → componente React`, com bloco desconhecido **ignorado silenciosamente**
  (o adaptador `adaptarBlocos` já filtra `null`; o renderizador não deve quebrar se receber tipo novo).
- Blocos são Server Components por padrão. `"use client"` só onde há interação real: slider de
  destaques, campo de busca, toast. Fronteira o mais fundo possível.
- Rich text já chega sanitizado como `HtmlSeguro` — o renderizador nunca chama `sanitizarRichText` de
  novo, e nunca aceita string crua em `dangerouslySetInnerHTML` (guarda `html-sanitizado.test.ts` já
  barra).

**Módulo `dataLayer` tipado (MED-01)**
- Módulo único, união discriminada por nome de evento e payload tipado por evento.
- `window.dataLayer.push` direto é **proibido fora do módulo**, barrado por regra de lint (ESLint flat
  config) mais teste de guarda no padrão das guardas existentes.
- Fila segura: se `dataLayer` ainda não existe (GTM entra só na Fase 13), o módulo enfileira sem
  quebrar. Nada de `window.dataLayer = window.dataLayer || []` espalhado pelo código.
- Nesta fase só `view_item_list` é emitido.

**Fidelidade (HOME-04)**
- Comparação lado a lado com `projeto-base/All Music Rentals - Home.dc.html` em desktop e em 375px.
- Sem `@media` inventada: layout-fonte fluido por `clamp()` e grid `auto-fit/minmax`. A única media
  query permitida é a do chrome em 1080px (`docs/divergencias.md` D1).
- 375px sem scroll horizontal.

### Claude's Discretion
- Estrutura de arquivos dos blocos (`src/components/blocos/` ou `src/app/[locale]/(home)/blocos/`).
- Implementação do slider (CSS scroll-snap é preferível a biblioteca, pelo orçamento de JS).
- Como a Home degrada se o CMS estiver indisponível ou a página `home` não existir no Strapi.

### Deferred Ideas (OUT OF SCOPE)
- GTM/GA4/Pixel e Consent Mode — Fase 13.
- Metadata API, hreflang, JSON-LD `ItemList` da Home — Fase 12.
- Lighthouse CI e orçamento de JS por rota — Fase 14.
- CSP com nonce (afeta styled-components e GTM) — Fase 15.
- Página de catálogo, categoria e produto — Fases 5 a 7.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HOME-01 | `/[locale]` renderiza hero, busca grande, grade de categorias e CTA final vindos do CMS | Ver `## Architecture Patterns` (Dynamic Zone) e `## Code Examples` (switch exaustivo, chrome no layout) |
| HOME-02 | Slider de produtos em destaque + seção Painéis de LED (P1.9/P3.9 + listas + galeria de 3) | Ver Pitfall/Pattern do slider (`scroll-snap`) e `## Don't Hand-Roll` (não reimplementar `ProductCard`) |
| HOME-03 | "Como funciona" (4 etapas), "diferenciais" (5 blocos) e avaliações com estados vazio/carregando, sem conteúdo fictício | Ver Pitfall 1 (estado "carregando" inalcançável em produção) e `EmptyState`/`ProductCardSkeleton` já existentes |
| HOME-04 | Fidelidade lado a lado com `Home.dc.html` em desktop e 375px | Ver `## Code Examples` (markup fonte extraído) e nota sobre D2 (ProductCard usa swatches, não `<select>`) |
| HOME-05 | `view_item_list` emitido nos blocos de listagem | Ver `## Code Examples` (payload GA4 sem campo monetário) e `## Common Pitfalls` (Pitfall 4) |
| MED-01 | Módulo `dataLayer` tipado como única porta de saída; lint barra `window.dataLayer.push` solto | Ver `## Architecture Patterns` Pattern 3 e `## Code Examples` (regra ESLint verificada) |

</phase_requirements>

## Standard Stack

Nenhuma dependência nova é necessária nesta fase — toda a stack já está instalada e verificada
(`package.json` lido nesta sessão). A tabela documenta as peças **existentes** que a Fase 4 usa.

### Core (já instalado, versões confirmadas em `package.json`/`npm view`)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.1 [VERIFIED: node_modules/next/package.json] | App Router, `next/image`, `revalidateTag` | Já a base do projeto |
| react / react-dom | 19.2.8 [VERIFIED: package.json] | Server/Client Components | Já a base do projeto |
| styled-components | 6.5.2 [VERIFIED: package.json] | Componentes-folha estilizados | ADR-001 travado |
| zod | 4.4.3 [VERIFIED: npm view zod version = 4.4.3] | Já usado nos schemas do CMS (Fase 3) | Nenhum schema novo necessário nesta fase (blocos já validados) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@/lib/cms/adapters` | interno | `getPagina`, `getNavPrincipal`, `getColunasRodape`, `getSettingsGlobais`, `getAvaliacoes` | Toda busca de dados da Home e do chrome |
| `@/components/{chrome,feedback,media,product}` | interno | Header, Footer, TopBar, Notice, Toast, Skeleton, EmptyState, ImagePlaceholder, ProductCard | Compor os blocos, nunca recriar |

### Alternativas consideradas
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `scroll-snap` para o slider | Biblioteca (Swiper, Embla) | Biblioteca adiciona ~10-30KB gzip ao orçamento de JS (`scripts/check-bundle-budget.mjs` já aperta o teto); `scroll-snap` nativo cobre navegação por teclado (foco em `<a>`/`<button>` dentro do carrossel), `prefers-reduced-motion` (já tratado globalmente em `GlobalStyle.ts`) e não tem custo de JS de runtime |
| `no-restricted-properties` para barrar `window.dataLayer` | `no-restricted-syntax` com seletor AST | `no-restricted-syntax` é mais flexível (pode restringir só `CallExpression` de `.push`), mas `no-restricted-properties` é a regra desenhada especificamente para "objeto.propriedade" e tem schema mais simples e testado; usar as duas juntas é redundante para este caso |

**Instalação:** nenhuma — sem novo pacote.

## Package Legitimacy Audit

Nenhum pacote novo é instalado nesta fase. Todos os componentes e bibliotecas usados já estão em
`package.json` e foram auditados nas Fases 1–3. **Disposição: não aplicável.**

## Architecture Patterns

### System Architecity — fluxo de dados da Home

```
Requisição GET /pt-BR
        │
        ▼
[locale]/layout.tsx (Server Component, async)
        │  await getNavPrincipal(locale)
        │  await getColunasRodape(locale)
        │  await getSettingsGlobais(locale)
        │
        ├──▶ <TopBar tagline settings.contato />         (chrome, topo)
        ├──▶ <Header itens={nav} />                       (chrome, sticky)
        │
        ▼
[locale]/page.tsx (Server Component, async — a Home)
        │  await getPagina(locale, 'home')  ──▶ Strapi (fetchStrapi, tags: ['cms:pages'])
        │  await getProdutos(locale, { destaque: true }) ──▶ (tags: ['cms:products'])
        │  await getAvaliacoes()                          ──▶ (tags: ['cms:avaliacoes'])
        │
        ▼
adaptarBlocos(pagina.blocos)  →  Bloco[] (union discriminada, rich text já sanitizado)
        │
        ▼
<RenderizadorDeBlocos blocos={blocos} produtosDestaque=... avaliacoes=... />
        │  switch (bloco.__component) { case 'blocos.hero': ...; default: return null }
        │
        ├──▶ <HeroBloco />            (Server Component puro)
        ├──▶ <BuscaBloco />           ("use client" — folha, só o <form>)
        ├──▶ <GradeDeCategoriasBloco />
        ├──▶ <ProdutosEmDestaqueBloco>
        │        └──▶ <SliderDeProdutos> ("use client" — folha, scroll-snap + botões)
        │                 └──▶ <ProductCard /> × 5   (já "use client", Fase 2)
        ├──▶ <DestaqueLedBloco />
        ├──▶ <ComoFuncionaBloco />
        ├──▶ <DiferenciaisBloco />
        ├──▶ <AvaliacoesBloco>
        │        ├──▶ cheio → grid de <figure> (Server Component puro)
        │        └──▶ vazio → <EmptyState />           (Fase 2, já client mas sem interação real)
        └──▶ <ChamadaFinalBloco />
        │
        ▼
<Footer colunas={colunas} contato={settings.contato} />
        │
        ▼
HTML completo devolvido ao navegador (nenhum fetch client-side)
        │
        ▼ (evento de interação real: clique num item da lista)
"use client" dentro de <SliderDeProdutos> chama dataLayer.push('view_item_list', {...})
```

### Recommended Project Structure
```
src/
├── lib/
│   └── analytics/
│       └── dataLayer.ts         # módulo único, única porta de saída (MED-01)
├── components/
│   └── blocos/
│       ├── renderizador.tsx      # switch exaustivo __component → JSX
│       ├── HeroBloco.tsx
│       ├── BuscaBloco.tsx        # "use client" (folha)
│       ├── GradeDeCategoriasBloco.tsx
│       ├── ProdutosEmDestaqueBloco.tsx
│       ├── SliderDeProdutos.tsx  # "use client" (folha) — scroll-snap
│       ├── DestaqueLedBloco.tsx
│       ├── ComoFuncionaBloco.tsx
│       ├── DiferenciaisBloco.tsx
│       ├── AvaliacoesBloco.tsx
│       └── ChamadaFinalBloco.tsx
└── app/
    └── [locale]/
        ├── layout.tsx            # busca nav/rodapé/settings; monta TopBar+Header+Footer
        ├── page.tsx               # a Home: getPagina + getProdutos + getAvaliacoes
        └── error.tsx              # fallback só do segmento da página (chrome sobrevive)
```

**Por que `src/components/blocos/` e não `src/app/[locale]/(home)/blocos/`:** o nome espelha
`cms/src/components/blocos/*.json` (Fase 3) e, mais importante, o renderizador e a maioria dos blocos
de conteúdo (`texto-rico`, `faq`, `comparativo-led`, `formulario-contato`) são reutilizados pelas
Fases 6 (Categoria) e 11 (Institucionais), que também consomem `PaginaCms.blocos`. Colocar sob uma
route group `(home)` sugeriria escopo exclusivo da Home e forçaria reimportação cross-route depois.

### Pattern 1: Dynamic Zone com `switch` exaustivo (não `Record` lookup)

**What:** mapear `__component` para componente React usando `switch` sobre a união discriminada, com
`default: return null`.

**When to use:** sempre que `noUncheckedIndexedAccess: true` estiver ativo (está — `tsconfig.json`
confirmado nesta sessão) e o mapeamento for de uma união discriminada finita. Um `Record<string, FC>`
exigiria indexação (`mapa[bloco.__component]`), que o TS tipa como `FC | undefined` sob esse flag —
forçando um `if` de runtime redundante em todo lugar. O `switch` preserva o narrowing de tipo do TS
sem indexação.

**Example:**
```typescript
// Padrão já usado em src/lib/cms/adapters.ts:436 (adaptarBloco) — mesma técnica, aplicada ao render.
import type { Bloco } from '@/lib/cms/adapters';

export function RenderizadorDeBlocos({ blocos, ...dadosProprios }: { blocos: Bloco[] /* + dados de produtos/avaliações */ }) {
  return (
    <>
      {blocos.map((bloco, i) => {
        switch (bloco.__component) {
          case 'blocos.hero':
            return <HeroBloco key={bloco.id ?? i} {...bloco} />;
          case 'blocos.busca':
            return <BuscaBloco key={bloco.id ?? i} {...bloco} />;
          case 'blocos.produtos-em-destaque':
            return <ProdutosEmDestaqueBloco key={bloco.id ?? i} cabecalho={bloco} produtos={dadosProprios.produtosDestaque} />;
          case 'blocos.avaliacoes':
            return <AvaliacoesBloco key={bloco.id ?? i} cabecalho={bloco} avaliacoes={dadosProprios.avaliacoes} />;
          // ... demais 9 componentes
          default:
            return null; // bloco desconhecido — nunca quebra a página
        }
      })}
    </>
  );
}
```

### Pattern 2: Fronteira Server/Client no slider

**What:** o bloco `ProdutosEmDestaqueBloco` é Server Component; só `SliderDeProdutos` (o carrossel em
si) é `"use client"`. `ProductCard` já é `"use client"` (Fase 2) e é importado dentro da folha client,
não no componente server.

**When to use:** qualquer bloco com interação real (clique, hover, foco). Regra do ADR-001: a fronteira
fica no componente mais fundo possível, nunca na página.

**Example:**
```typescript
// ProdutosEmDestaqueBloco.tsx — Server Component (sem "use client")
import { SliderDeProdutos } from './SliderDeProdutos';
import type { Produto } from '@/lib/cms/adapters';

export function ProdutosEmDestaqueBloco({ titulo, subtitulo, produtos }: { titulo: string | null; subtitulo: string | null; produtos: Produto[] }) {
  return (
    <section>
      <h2>{titulo}</h2>
      <p>{subtitulo}</p>
      <SliderDeProdutos produtos={produtos} />
    </section>
  );
}
```
```typescript
// SliderDeProdutos.tsx — "use client" (folha)
'use client';
import { useRef } from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { emitirEvento } from '@/lib/analytics/dataLayer';
import type { Produto } from '@/lib/cms/adapters';

export function SliderDeProdutos({ produtos }: { produtos: Produto[] }) {
  const trilhaRef = useRef<HTMLDivElement>(null);
  // scroll-snap nativo — ver Code Examples para o CSS completo
  return (
    <div>
      <button type="button" onClick={() => trilhaRef.current?.scrollBy({ left: -320, behavior: 'smooth' })} aria-label="Produtos anteriores">←</button>
      <button type="button" onClick={() => trilhaRef.current?.scrollBy({ left: 320, behavior: 'smooth' })} aria-label="Próximos produtos">→</button>
      <div ref={trilhaRef} role="list" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {produtos.map((p) => (
          <div key={p.id} role="listitem" style={{ scrollSnapAlign: 'start', flex: '0 0 320px' }}>
            <ProductCard produto={mapearParaProductCard(p)} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 3: Módulo `dataLayer` tipado (fila segura + porta única)

**What:** módulo único com união discriminada por evento; enfileira em `window.dataLayer` (criando o
array se ainda não existir) e nunca lança se `window` não existir (SSR-safe, embora só deva ser chamado
de código client).

**Example:**
```typescript
// src/lib/analytics/dataLayer.ts — ÚNICO arquivo autorizado a tocar window.dataLayer
'use client';

interface ItemDeListaGA4 {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  index?: number;
}

type EventoDataLayer =
  | {
      event: 'view_item_list';
      item_list_id: string;
      item_list_name: string;
      items: ItemDeListaGA4[];
    };
  // demais eventos entram nas fases que os usam (Fase 5+)

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Única função autorizada a enfileirar no dataLayer. Fila segura: funciona antes do GTM existir. */
export function emitirEvento(evento: EventoDataLayer): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}
```

### Anti-Patterns to Avoid
- **`Record<Componente, FC>` para a Dynamic Zone:** força `| undefined` sob `noUncheckedIndexedAccess`
  e não dá narrowing de tipo nas props. Use `switch` (Pattern 1).
- **Buscar `getNavPrincipal`/`getColunasRodape` dentro da própria página `page.tsx` da Home:** duplica
  a busca em toda página futura. Buscar uma vez em `[locale]/layout.tsx`.
- **`window.dataLayer.push` direto em qualquer componente:** é exatamente o que a regra de lint (Pattern
  3 + Code Examples) precisa impedir. Mesmo dentro de um `useEffect` "só uma vez", passa pela porta única.
- **Reimplementar seletor de cor com `<select>` para o slider:** o `Home.dc.html` (mock estático) mostra
  um `<select>`, mas `docs/divergencias.md` D2 já decidiu que `ProductCard` unifica todas as páginas com
  `ColorSwatches`. Usar `ProductCard` como está, não copiar o markup do mock.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Card de produto no slider | Novo componente de card | `ProductCard` (`src/components/product/ProductCard.tsx`) | Já cobre 3 variantes, acessibilidade (foco, `aria-label`), estados; D2 já decidiu isso |
| Estado vazio de avaliações | Novo bloco de "sem dados" | `EmptyState` (`src/components/feedback/EmptyState.tsx`) | Já implementa eyebrow+título+texto+ações no padrão do design system |
| Skeleton de avaliações | Novo skeleton | `SkeletonBar`/padrão de `ProductCardSkeleton` (`src/components/feedback/Skeleton.tsx`) | Já usa `amrPulse` com stagger por índice — só adaptar o card interno para avaliação |
| Sanitização de rich text | Nova chamada a `sanitizarRichText` no renderizador | Usar o campo já sanitizado (`HtmlSeguro`) que `adaptarBlocos` devolve | Duplicar sanitização é bloqueado pela guarda `html-sanitizado.test.ts` e é trabalho refeito |
| Media query de troca desktop/mobile | Nova lógica de `window.innerWidth` | `media.mobile`/`media.desktop` (`src/lib/theme/media.ts`) | D1 já decidiu isso; útil só se algum bloco precisar de troca de layout |
| `prefers-reduced-motion` no slider | CSS próprio de `@media (prefers-reduced-motion)` | Já global em `GlobalStyle.ts` (`scroll-behavior: auto !important`) | O comportamento de `scroll-behavior: smooth` do slider já é desabilitado globalmente — não duplicar a regra |

**Key insight:** a Fase 2 e a Fase 3 já entregaram quase toda a "matéria-prima" visual e de dados da
Home. O trabalho real da Fase 4 é **composição e fiação** (renderizador + fronteira client + módulo de
eventos), não criação de UI nova.

## Common Pitfalls

### Pitfall 1: Estado "carregando" de avaliações inalcançável em produção
**What goes wrong:** HOME-03 pede estado "carregando" para avaliações, mas a página não tem nenhuma
Request-Time API (`cookies()`, `headers()`, `searchParams` dinâmico) e `cacheComponents` não está
habilitado em `next.config.ts` (confirmado nesta sessão). Sem PPR/Cache Components, um `<Suspense>` ao
redor de um Server Component assíncrono é resolvido **durante o prerender** (build ou primeira geração
ISR) — o usuário final nunca vê o fallback, porque o HTML servido já está totalmente resolvido.
**Why it happens:** streaming real de Suspense por segmento é um recurso do PPR/`cacheComponents`
(Next 16, opt-in via flag), não do modelo de cache padrão que este projeto usa (`fetch` + `next.tags` +
`revalidateTag`, documentado em `docs/01-app/02-guides/caching-without-cache-components.md`).
**How to avoid:** tratar o estado "carregando" como um artefato do design system, não um estado real de
produção: implementar o componente de skeleton, testá-lo isoladamente (jest + mostrar na showcase
`/[locale]/design-system`), mas não prometer que ele apareça na Home publicada. Documentar essa decisão
explicitamente (ver Open Question 1) em vez de inventar um fetch client-side só para forçar o loading
(o que violaria a restrição "não introduzir fetch no cliente").
**Warning signs:** qualquer tarefa que proponha `useEffect` + `fetch('/api/avaliacoes')` no cliente para
"ver o loading funcionar" — é exatamente a dívida técnica que o CONTEXT.md proíbe.

### Pitfall 2: `next/image` sem `remotePatterns` quebra em runtime, não em build
**What goes wrong:** `next.config.ts` (lido nesta sessão) não tem `images.remotePatterns`. Se um bloco
usar `<Image src={imagem.url} />` com a URL absoluta do Strapi (`adaptarImagem` já monta essa URL via
`NEXT_PUBLIC_STRAPI_MEDIA_URL`), o Next aceita a prop em build mas responde **400** em runtime ao pedir
a imagem otimizada — não é um erro de compilação.
**Why it happens:** `next/image` bloqueia qualquer host remoto não declarado por padrão (mitigação de
SSRF/abuso do endpoint de otimização), comportamento documentado em
`docs/01-app/03-api-reference/02-components/image.md`.
**How to avoid:** adicionar `images.remotePatterns` para o host do Strapi (dev: `localhost:1337` ou o
serviço `cms` do compose; produção: o domínio real) e criar/documentar `NEXT_PUBLIC_STRAPI_MEDIA_URL`
em `.env.example` (hoje ausente). Sem isso, qualquer bloco com imagem do CMS (hero, categorias,
galeria LED) falha silenciosamente em runtime.
**Warning signs:** imagem quebrada (ícone de erro do navegador) só ao rodar contra o Strapi real, nunca
nos testes unitários com props mockadas.

### Pitfall 3: `sharp` ausente não bloqueia dev, mas degrada a otimização de imagem no Docker
**What goes wrong:** `sharp` não está em `package.json` nem no `Dockerfile` (confirmado nesta sessão).
Em produção standalone, o Next usa `sharp` quando disponível para otimização de imagem; sem ele, cai
para um caminho mais lento ou emite aviso.
**Why it happens:** `sharp` é um binário nativo opcional — não é instalado automaticamente.
**How to avoid:** não é bloqueante para a Fase 4 (rodar local/dev funciona sem `sharp`), mas deixar
registrado para a Fase 14 (Performance) ou 17 (Docker de produção) adicionar `sharp` às dependências de
produção antes do primeiro deploy real com imagens do CMS.
**Warning signs:** log do Next mencionando "sharp is not installed" no build/start de produção.

### Pitfall 4: Confundir o payload de `view_item_list` com campos de e-commerce padrão do GA4
**What goes wrong:** o exemplo oficial do GA4 para `items[]` inclui `price`, `discount`, `coupon` e
`affiliation` como campos opcionais — comuns em qualquer tutorial de e-commerce. Copiar o exemplo
padrão sem filtrar violaria PRECO-04 (Fase 13) e a regra inviolável desde a raiz do tipo.
**Why it happens:** a documentação do GA4 é genérica para e-commerce; este produto não é e-commerce
(regra `Core Value` do projeto).
**How to avoid:** o tipo `ItemDeListaGA4` (Pattern 3, Code Examples) já **omite estruturalmente**
`price`, `discount`, `coupon`, `affiliation`, `quantity`, `value`, `currency` — a prevenção é em tempo de
compilação, não apenas no guard de lint/teste em runtime. Isso também facilita a Fase 13, que só herda o
tipo.
**Warning signs:** qualquer PR que adicione um campo numérico ao tipo do evento sem que o requisito o
peça explicitamente.

### Pitfall 5: `error.tsx` com prop `reset` copiado de tutorial desatualizado
**What goes wrong:** a maioria dos tutoriais de `error.tsx` (Next 13/14) usa `{ error, reset }`. A partir
do Next 16.3 (a versão exata deste projeto), a prop recomendada é `retry` (`reset` ainda funciona, mas a
doc atual diz "in most cases, use retry() instead").
**Why it happens:** `retry` só ficou estável em `v16.3.0` (ver State of the Art); a maior parte do
conteúdo indexado na internet é anterior a essa versão.
**How to avoid:** usar `{ error, retry }` no `error.tsx` do segmento `[locale]` (ou de um segmento mais
fundo, se a Home quiser isolar erro só do bloco de conteúdo — ver Open Question 2).
**Warning signs:** TypeScript não vai reclamar se você usar `reset` (ainda suportado), então isso só
aparece em code review ou ao testar o botão "Tentar novamente" e notar que ele não teve o efeito
esperado de re-fetch.

## Code Examples

### Regra ESLint que barra `window.dataLayer.push` e `dataLayer.push` soltos
```javascript
// Source: https://eslint.org/docs/latest/rules/no-restricted-properties (verificado via WebFetch nesta sessão)
// eslint.config.mjs — adicionar ao array de config (mantém coreWebVitals + typescript já existentes)
{
  rules: {
    'no-restricted-properties': [
      'error',
      {
        object: 'window',
        property: 'dataLayer',
        message:
          'Não acesse window.dataLayer direto. Use emitirEvento() de @/lib/analytics/dataLayer.',
      },
      {
        object: 'dataLayer',
        property: 'push',
        message: 'Não chame dataLayer.push direto. Use emitirEvento() de @/lib/analytics/dataLayer.',
      },
    ],
  },
},
// Exceção restrita a um único arquivo — objeto de config separado, depois do global
// (flat config: objetos posteriores que casam o mesmo arquivo sobrescrevem o anterior)
{
  files: ['src/lib/analytics/dataLayer.ts'],
  rules: {
    'no-restricted-properties': 'off',
  },
},
```
**Por que `no-restricted-properties` e não `no-restricted-syntax`:** testado contra o código-fonte de
teste do próprio ESLint (`tests/lib/rules/no-restricted-properties.js`) — a opção `object` casa o
identificador exato (`window`, ou `dataLayer` quando usado sem `window.`), e a regra dispara na
*primeira* propriedade acessada da cadeia (`window.dataLayer` já é sinalizado, não precisa chegar em
`.push`). Isso cobre tanto leitura quanto atribuição (`window.dataLayer = [...]`), que é exatamente o
padrão que o CONTEXT.md proíbe ("nada de `window.dataLayer = window.dataLayer || []` espalhado").

### Teste de guarda complementar (padrão das guardas existentes)
```typescript
// Source: padrão adaptado de src/__tests__/guards/html-sanitizado.test.ts (lido nesta sessão)
// src/__tests__/guards/dataLayer-porta-unica.test.ts
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC_DIR = join(process.cwd(), 'src');
const ARQUIVO_PERMITIDO = join(SRC_DIR, 'lib', 'analytics', 'dataLayer.ts');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe('guarda da porta única do dataLayer', () => {
  it('nenhum arquivo fora do módulo acessa window.dataLayer ou dataLayer.push', () => {
    const violacoes: string[] = [];
    for (const arquivo of walk(SRC_DIR)) {
      if (arquivo === ARQUIVO_PERMITIDO || arquivo.endsWith('dataLayer-porta-unica.test.ts')) continue;
      const conteudo = readFileSync(arquivo, 'utf8');
      conteudo.split('\n').forEach((linha, i) => {
        if (/window\.dataLayer|(?<!window\.)dataLayer\.push/.test(linha)) {
          violacoes.push(`${relative(process.cwd(), arquivo)}:${i + 1}  ${linha.trim()}`);
        }
      });
    }
    expect(violacoes).toEqual([]);
  });
});
```

### `next.config.ts` — `images.remotePatterns` para a mídia do Strapi
```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md (lido nesta sessão)
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    // dev: serviço `cms` do docker-compose ou localhost:1337
    { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
    { protocol: 'http', hostname: 'cms', port: '1337', pathname: '/uploads/**' },
    // produção: preencher com o domínio real do Strapi quando a Fase 17 definir
  ],
},
```

### `revalidateTag` — já correto, apenas confirmar o modelo (Next 16, sem `cacheComponents`)
```typescript
// Source: node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md (lido nesta sessão)
// src/app/api/revalidate/route.ts já faz isto corretamente:
revalidateTag(tag, 'max'); // stale-while-revalidate: serve o conteúdo antigo enquanto revalida em segundo plano
```
Nada precisa mudar nos adaptadores: `fetchStrapi` já passa `next: { tags: options.tags }` (sem
`cache: 'force-cache'` explícito). Pelo comportamento documentado do `fetch` estendido, isso resulta em
`auto no store`: a rota `/[locale]` (sem Request-Time APIs) é pré-renderizada uma vez no build/primeira
requisição, e o webhook do Strapi mantém isso fresco via `revalidateTag` — sem precisar de
`export const revalidate = N` na página. **Não é necessário adicionar nenhum `revalidate` de rota.**

### `error.tsx` do segmento `[locale]` — chrome sobrevive ao erro da página
```tsx
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md (lido nesta sessão)
// src/app/[locale]/error.tsx
'use client'; // Error boundaries precisam ser Client Components

export default function ErroDaHome({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <section role="alert">
      <h2>Não foi possível carregar o conteúdo agora.</h2>
      <button type="button" onClick={() => retry()}>Tentar novamente</button>
    </section>
  );
}
```
**Importante:** `error.js` de um segmento envolve o `page.js` **desse mesmo segmento**, mas não o
`layout.js` do mesmo segmento. Como o chrome (TopBar/Header/Footer) é montado em `[locale]/layout.tsx`
e a busca de `getPagina` acontece em `[locale]/page.tsx`, um erro ao buscar a página da Home aciona
este `error.tsx` **sem derrubar o chrome** — exatamente o comportamento que o CONTEXT.md deixa em
aberto ("Como a Home degrada..."). Ver Open Question 2 para a decisão final de granularidade.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `error.tsx` com `{ error, reset }` | `{ error, retry }` (mesma função, nome/semântica atualizados: tenta re-fetch e re-render) | `retry` estável desde Next `v16.3.0` (a versão exata do projeto) | Tutoriais pré-16.3 (a maioria do conteúdo indexado) mostram `reset`; ainda funciona, mas a doc atual recomenda `retry` |
| `fetch` cacheado por padrão ("force-cache" implícito) | `fetch` **não cacheado por padrão** desde Next 15 ("auto no store"); cache é opt-in | Next 15 (mudança de default, mantida no 16) | Blogs de Next 13/14 assumem cache automático; este projeto já está correto (`fetchStrapi` não seta `cache: 'force-cache'`, depende de `tags` + `revalidateTag`) |
| PPR (`experimental.ppr`) como flag isolada | Absorvido em `cacheComponents` (Next 16) | Next 16 | Não relevante aqui porque o projeto não habilita `cacheComponents` — mas explica por que Suspense não faz streaming real nesta arquitetura (Pitfall 1) |

**Deprecated/outdated:**
- Middleware chamado `middleware.ts`: Next 16 renomeou para `proxy.ts` (já refletido no projeto,
  `src/proxy.ts` — nenhuma ação necessária, só uma confirmação de que a base está atualizada).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | O botão "adicionar ao orçamento" do `ProductCard` no slider de destaques pode ficar visualmente presente mas funcionalmente no-op (sem Redux, que só existe na Fase 8) nesta fase, sem violar HOME-04 (fidelidade visual). | Pattern 2 / Open Question 3 | Se o time esperar que o clique já grave no Redux, a tarefa fica maior do que o planejado; precisa confirmação explícita antes do plano |
| A2 | O formulário de busca grande da Home só precisa navegar (GET) para `/[locale]/catalogo?q=...`, sem emitir evento `search` nem implementar lógica de busca (isso é CATA-01/CATA-06, Fase 5). A rota de destino não existirá até a Fase 5, o que é aceitável durante desenvolvimento. | Open Question 4 | Se o revisor esperar um comportamento funcional completo de busca na Home, a tarefa está subestimada |
| A3 | O estado "carregando" de avaliações (HOME-03) é satisfeito por um componente testável isoladamente (design system/testes), não por um estado real e alcançável na Home publicada, dado que a arquitetura não usa `cacheComponents`. | Pitfall 1 / Open Question 1 | Se essa leitura estiver errada e o cliente exigir loading real percebido pelo usuário, a solução exigiria habilitar `cacheComponents` (mudança maior, fora do escopo desta fase) ou aceitar fetch client-side (violaria a restrição existente) |

**Nenhuma dessas afeta a stack, versões ou APIs — são decisões de escopo/comportamento que o
`/gsd-discuss-phase` ou o planejador deveriam confirmar explicitamente antes de detalhar as tarefas.**

## Open Questions

1. **O estado "carregando" de avaliações deve ser visível em produção, mesmo que estruturalmente raro?**
   - O que sabemos: sem `cacheComponents`, a Home é pré-renderizada inteira; o fallback de qualquer
     `<Suspense>` nunca aparece para um usuário real de uma rota totalmente estática.
   - O que é incerto: se o time aceita que "carregando" seja só um estado de design system/QA, ou se
     quer forçar uma janela real de loading (o que exigiria tornar a rota dinâmica ou habilitar
     `cacheComponents` — ambos fora do escopo desta fase pelas restrições do CONTEXT.md).
   - Recomendação: assumir A3 (estado testável, não garantidamente visível em produção) e registrar a
     decisão no plano; se o cliente exigir loading real, isso é trabalho de Fase 14 (Performance/PPR).

2. **Granularidade do `error.tsx`: no segmento `[locale]` ou mais fundo, ao redor só do conteúdo da Home?**
   - O que sabemos: um `error.tsx` em `[locale]/error.tsx` protege o chrome (layout) mas cobre TODAS as
     páginas futuras daquele segmento (não é exclusivo da Home).
   - O que é incerto: se isso é desejável agora (proteção genérica reaproveitável pelas Fases 5-11) ou
     se a Home deveria ter seu próprio limite de erro mais isolado (ex.: um `<Suspense>`+boundary por
     bloco, para que uma falha em "avaliações" não derrube toda a Home).
   - Recomendação: começar com `[locale]/error.tsx` (mais simples, já resolve a degradação básica) e
     considerar granularidade por bloco só se a Fase 3 mostrar que blocos individuais podem falhar
     independentemente (hoje `getPagina` é uma chamada única — falha tudo ou nada).

3. **O clique em "adicionar ao orçamento" no slider da Home deve fazer algo nesta fase?**
   - O que sabemos: o Redux do carrinho só existe na Fase 8; `ProductCard.onAdicionar` é opcional.
   - O que é incerto: se o botão deve ficar sem `onClick` (visualmente presente, funcionalmente inerte)
     ou se deve navegar para algum lugar / mostrar um toast de "em breve".
   - Recomendação: omitir `onAdicionar` (o componente já lida com isso) e não simular nenhum efeito —
     fidelidade visual (HOME-04) não exige funcionalidade que pertence à Fase 8.

4. **Para onde a busca grande da Home deve navegar, já que `/catalogo` não existe até a Fase 5?**
   - O que sabemos: `blocos.busca` só tem `titulo`/`subtitulo`/`placeholder` — nenhuma lógica de busca
     no CMS.
   - O que é incerto: se o formulário deve navegar para `/[locale]/catalogo?q=...` (404 até a Fase 5,
     aceitável em desenvolvimento) ou ficar sem `action` real nesta fase.
   - Recomendação: implementar a navegação real (GET para `/[locale]/catalogo?q=...`) — é o
     comportamento final correto e a Fase 5 só precisa existir para o link resolver; não é dívida
     técnica, é sequenciamento normal do roadmap.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Strapi (serviço `cms` no compose) | `getPagina`/`getProdutos`/`getAvaliacoes` em runtime real | ✓ (profile `cms` do docker-compose, verificado na Fase 3 UAT) | 5.52 | — |
| `NEXT_PUBLIC_STRAPI_MEDIA_URL` | Resolver URL de imagem do Strapi (`adaptarImagem`) | ✗ (ausente em `.env.example`) | — | Adicionar a variável; sem ela, `MEDIA_BASE` cai para string vazia e a URL da imagem fica relativa/quebrada |
| `images.remotePatterns` no `next.config.ts` | `next/image` com fonte do Strapi | ✗ (ausente, confirmado nesta sessão) | — | Adicionar o padrão do host do Strapi (Code Examples); sem isso, `next/image` responde 400 em runtime |
| `sharp` | Otimização de imagem em produção standalone | ✗ (não instalado) | — | Não bloqueia dev; registrar para Fase 14/17 antes do primeiro deploy |

**Missing dependencies with no fallback:**
- Nenhuma — todas as ausências acima têm correção direta (variável de ambiente + config), sem exigir
  nova infraestrutura.

**Missing dependencies with fallback:**
- `sharp`: ausência não impede a Fase 4; só degrada otimização de imagem em produção (tratar depois).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V5 Input Validation | Sim (mínimo) | Campo de busca grande é `type="search"` com `novalidate` + validação client (não vazio) antes de navegar; nenhum dado é enviado a um backend próprio nesta fase (é só um GET para uma rota própria) |
| V13 API and Web Service | Sim (já cumprido) | `fetchStrapi` já valida toda resposta com Zod na borda (Fase 3); a Fase 4 não adiciona nenhuma chamada nova sem esse schema |
| V6 Cryptography | Não se aplica | Nenhum dado sensível ou segredo é manipulado nesta fase (token do Strapi já é server-only, herdado) |
| V2/V3/V4 (Auth/Sessão/Acesso) | Não se aplica | A Home é pública, sem autenticação |

### Known Threat Patterns for esta fase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Injeção via querystring da busca (`?q=`) refletida sem escape | Tampering | React já escapa por padrão qualquer texto interpolado em JSX; não usar `dangerouslySetInnerHTML` para exibir o termo buscado (nenhum bloco da Home precisa disso) |
| SSRF via `next/image` otimizando URL arbitrária | Tampering/Info disclosure | `images.remotePatterns` (Pitfall 2) restringe a lista de hosts aceitos — não usar `unoptimized: true` como atalho, pois isso desabilita a proteção junto com a otimização |
| Bloco desconhecido do CMS injetando HTML não sanitizado | Tampering | Já mitigado pela guarda `html-sanitizado.test.ts` (Fase 3) + `blocoTolerante` (bloco desconhecido vira `null`) |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md` — `revalidateTag`, `cacheLife`, modelo de cache
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — modelo de cache "Previous Model" (o que este projeto usa)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/fetch.md` — comportamento padrão de `fetch` (`auto no store`)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` — `error.tsx`, `retry` vs `reset`, version history
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` — `remotePatterns`
- Leitura direta do código-fonte do projeto: `src/lib/cms/{adapters,schemas,client}.ts`, `src/components/**`, `src/lib/theme/**`, `src/app/**`, `eslint.config.mjs`, `tsconfig.json`, `next.config.ts`, `.env.example`, `docker-compose.yml`, `docs/adr/001-styled-components.md`, `docs/divergencias.md`, `projeto-base/All Music Rentals - Home.dc.html`
- `package.json` + `npm view next/zod/sharp version` — versões confirmadas nesta sessão

### Secondary (MEDIUM confidence)
- eslint.org — `no-restricted-properties` e configuração de `files`/cascata em flat config (WebFetch, cruzado com o próprio código-fonte de teste do ESLint no GitHub)
- developers.google.com — schema de `view_item_list` e campos de `items[]` (WebFetch, resumo de uma página oficial — recomenda-se confirmar campo a campo ao implementar o tipo final)

### Tertiary (LOW confidence)
- Nenhuma claim depende só de busca não verificada.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — nenhuma dependência nova; versões confirmadas em `package.json`/`npm view`
- Architecture: HIGH — padrões derivados da leitura direta do código já entregue (Fases 1-3) e da doc oficial do Next instalado no projeto
- Pitfalls: HIGH para os itens 2, 3, 5 (verificados em doc oficial); MEDIUM para o item 1 (inferência arquitetural correta, mas depende de decisão de produto — ver Open Question 1); MEDIUM para o item 4 (payload GA4 resumido via WebFetch, recomenda-se conferência campo a campo na implementação)

**Research date:** 2026-08-18
**Valid until:** 2026-09-17 (30 dias — stack estável, mas Next 16 ainda recebe releases minor frequentes; reconferir `retry`/`cacheComponents` se a versão do `next` mudar)
