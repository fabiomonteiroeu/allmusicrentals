# Fase 4: Home - Mapa de Padrões

**Mapeado:** 2026-08-18
**Arquivos analisados:** 25 (novos + modificados)
**Analogs encontrados:** 20 / 25 (5 sem análogo direto — ver seção dedicada)

Regra de leitura deste documento: cada arquivo novo **compõe** algo que já existe. Onde a composição
não é óbvia (ex.: `ProductCard` espera `ProdutoResumo`, não `Produto` do adaptador), isso está marcado
explicitamente como **gap de mapeamento** — o planejador precisa prever uma função adaptadora, não
assumir prop-compatibilidade direta.

---

## File Classification

| Novo/Modificado | Papel | Fluxo de dados | Análogo mais próximo | Qualidade |
|---|---|---|---|---|
| `src/app/[locale]/layout.tsx` | provider/layout (Server Component) | request-response | ele mesmo (versão atual, já `async`) | exact — só adicionar buscas + chrome |
| `src/app/[locale]/page.tsx` | route/page (Server Component) | request-response | ele mesmo (placeholder atual) + `src/lib/cms/adapters.ts` (`getPagina`) | exact — reescrita completa sobre o esqueleto |
| `src/app/[locale]/error.tsx` | error boundary (Client Component) | event-driven | **nenhum no projeto** | sem análogo — ver seção dedicada |
| `src/components/blocos/renderizador.tsx` | controller/dispatcher (Server Component) | transform (union → JSX) | `adaptarBloco` em `src/lib/cms/adapters.ts:436-447` (switch exaustivo) | exact — mesma técnica, aplicada à view |
| `src/components/blocos/HeroBloco.tsx` | component (Server, decorativo com detalhe client de reduced-motion) | CRUD (leitura) | `src/components/chrome/TopBar.tsx` (seção escura, `styled` + tema) | role-match |
| `src/components/blocos/BuscaBloco.tsx` | component ("use client", folha) | request-response (navegação GET) | `src/components/primitives/Field.tsx` + `src/components/chrome/Header.tsx` (form/estado local) | role-match |
| `src/components/blocos/GradeDeCategoriasBloco.tsx` | component (Server) | CRUD (leitura de lista) | `src/components/product/ProductCard.tsx` (card com imagem+corpo+CTA) | role-match |
| `src/components/blocos/ProdutosEmDestaqueBloco.tsx` | component (Server, wrapper) | CRUD (leitura de lista) | Pattern 2 do RESEARCH (`ProdutosEmDestaqueBloco`/`SliderDeProdutos`) | exact — já vem pronto do RESEARCH |
| `src/components/blocos/SliderDeProdutos.tsx` | component ("use client", interação real) | event-driven (scroll/foco) + CRUD (leitura) | `src/components/chrome/MobileMenu.tsx` (único client com estado Redux) + `src/components/feedback/Toast.tsx` (`useEffect` + client puro sem Redux) | role-match |
| `src/components/blocos/DestaqueLedBloco.tsx` | component (Server) | CRUD (leitura) | `src/components/blocos/HeroBloco.tsx` (mesma família: seção escura + eyebrow sobre escuro) | role-match (interno à fase) |
| `src/components/blocos/ComoFuncionaBloco.tsx` | component (Server) | CRUD (leitura de lista) | `src/components/feedback/Notice.tsx` (aviso) + `src/components/product/ProductCard.tsx` (`Nome`/`Descricao` Public Sans 22px) | role-match |
| `src/components/blocos/DiferenciaisBloco.tsx` | component (Server) | CRUD (leitura de lista) | `src/components/blocos/ComoFuncionaBloco.tsx` (mesmo padrão de item title+body) | role-match (interno à fase) |
| `src/components/blocos/AvaliacoesBloco.tsx` | component (Server, com 3 sub-estados) | CRUD (leitura) + estado vazio/carregando | `src/components/feedback/EmptyState.tsx` (vazio) + `src/components/feedback/Skeleton.tsx` (`ProductCardSkeleton`, carregando) | role-match, com gap (E6) no estado vazio |
| `src/components/blocos/ChamadaFinalBloco.tsx` | component (Server) | CRUD (leitura) | `src/components/chrome/Footer.tsx` (CTA final em seção escura, grid 2 colunas) | role-match |
| `src/lib/analytics/dataLayer.ts` | service/utility (módulo único, "use client") | event-driven (fila) | `src/lib/cms/sanitize.ts` (módulo único server-only análogo — mesma ideia de "porta única tipada", lado client) | role-match (padrão espelhado, não idêntico) |
| `src/__tests__/guards/dataLayer-porta-unica.test.ts` | test (guarda) | batch (varredura de arquivos) | `src/__tests__/guards/html-sanitizado.test.ts` (varredura de `src/`, allowlist por sufixo de arquivo) | exact |
| `eslint.config.mjs` | config | — | ele mesmo (estrutura flat config atual) | exact — só adicionar objetos de regra |
| `next.config.ts` | config | — | ele mesmo (`images.formats` já presente) | exact — só adicionar `remotePatterns` |
| `.env.example` | config | — | ele mesmo (`STRAPI_API_URL`/`STRAPI_API_TOKEN` já documentados) | exact — só adicionar `NEXT_PUBLIC_STRAPI_MEDIA_URL` |
| `src/components/primitives/Typography.tsx` (extensão E1+E2) | primitive (modificação) | CRUD (props) | ele mesmo — estender `Eyebrow`/`Heading` existentes | exact — extensão aditiva |
| `src/components/primitives/Button.tsx` (extensão E3) | primitive (modificação) | CRUD (props) | ele mesmo — adicionar `case 'pretoSolido'` no switch de variante | exact — mesmo padrão dos outros `case` |
| `src/components/feedback/Spinner.tsx` (E4) | primitive (novo) | CRUD (visual puro) | `src/lib/theme/GlobalStyle.ts` (`amrSpin` já existe, falta o componente) | role-match — keyframe existe, componente não |
| `src/components/blocos/SearchBarGrande.tsx` (E5, composto do Bloco 2) | component ("use client", folha) | request-response | `src/components/primitives/Field.tsx` (`Input`, `MensagemErro`) + E3 (`Button $variante="pretoSolido"`) + E4 (`Spinner`) | role-match — composição, não componente novo do zero |
| `src/components/feedback/EmptyState.tsx` (extensão E6, avaliada) | primitive (modificação OU composição manual) | CRUD (props) | ele mesmo | gap registrado — decisão de escopo necessária (ver E6 abaixo) |
| `src/lib/theme/GlobalStyle.ts` (keyframe `amrMod`) | config/tema (modificação) | CRUD (CSS) | ele mesmo — mesmo padrão dos outros 6 `@keyframes` já ali | gap — keyframe não existe, ver seção dedicada |

---

## Pattern Assignments

### `src/components/blocos/renderizador.tsx` (dispatcher, Server Component)

**Análogo:** `src/lib/cms/adapters.ts` (função `adaptarBloco`, linhas 436-447)

**Padrão a copiar** (linhas 436-447 do análogo):
```typescript
function adaptarBloco(b: BlocoCms): Bloco {
  switch (b.__component) {
    case 'blocos.texto-rico':
      return { ...b, conteudoHtml: sanitizarRichText(b.conteudo) };
    case 'blocos.faq':
      return { ...b, itens: (b.itens ?? []).map(adaptarPerguntaResposta) };
    case 'blocos.comparativo-led':
      return { ...b, introducaoHtml: sanitizarRichText(b.introducao) };
    default:
      return b;
  }
}
```

**Por que este é o molde certo:** o motivo documentado no RESEARCH.md (Pattern 1) é técnico —
`tsconfig.json` tem `noUncheckedIndexedAccess: true`, então um `Record<Componente, FC>` forçaria
`FC | undefined` em toda chamada. O `switch` sobre a união discriminada `Bloco` (exportada de
`src/lib/cms/adapters.ts:418`) preserva o narrowing sem indexação. Use exatamente essa estrutura,
troque o corpo de cada `case` por `return <XBloco key={bloco.id ?? i} {...bloco} />` e mantenha
`default: return null` (bloco desconhecido nunca quebra a página — mesma garantia que
`adaptarBlocos` já dá no nível de dados).

**Import de tipo** — usar o tipo já pronto, não redeclarar:
```typescript
import type { Bloco, Produto, Avaliacao } from '@/lib/cms/adapters';
```

**Assinatura recomendada** (dados próprios dos blocos 4/5/8 entram por prop separada, não pelo CMS):
```typescript
export function RenderizadorDeBlocos({
  blocos,
  produtosDestaque,
  avaliacoes,
}: {
  blocos: Bloco[];
  produtosDestaque: Produto[];
  avaliacoes: Avaliacao[];
}) { /* switch aqui */ }
```

---

### `src/app/[locale]/layout.tsx` (modificação)

**Análogo:** ele mesmo, versão atual (lida nesta sessão) + `src/lib/cms/adapters.ts` para as três buscas.

**Estado atual** (arquivo completo, 33 linhas) — o esqueleto a preservar:
```tsx
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const lang: Locale = locale;

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <StyledRegistry>
          <StoreProvider>{children}</StoreProvider>
        </StyledRegistry>
      </body>
    </html>
  );
}
```

**O que entra:** três `await` (`getNavPrincipal`, `getColunasRodape`, `getSettingsGlobais`, todos de
`@/lib/cms/adapters`) entre a validação de locale e o `return`, e `<TopBar>`/`<Header>`/`<Footer>`
(de `@/components/chrome/*`) envolvendo `{children}` dentro do `StoreProvider`. **Gap de
mapeamento (bloqueador, já registrado no RESEARCH):** `TopBar` hoje **não tem nenhuma prop** — importa
`contato`/`textosLegais` direto de `@/lib/site/navigation` (ver excerto abaixo). Antes de este layout
poder passar dados do CMS, `TopBar.tsx` precisa ganhar props (`tagline`, `contato`), no mesmo padrão
que `Header`/`Footer`/`MobileMenu` já usam (prop com default apontando para o módulo estático — ver
próximo bloco).

**Padrão de prop com fallback estático, já usado em `Header`/`Footer`/`MobileMenu` (copiar para
`TopBar`):**
```tsx
// src/components/chrome/Footer.tsx:114-122 — molde exato do padrão prop+default
export interface FooterProps {
  logoSrc?: string;
  colunas?: ColunaRodape[];
}
export function Footer({
  logoSrc = '/uploads/logo-amr.png',
  colunas = colunasRodape, // fallback = módulo estático, se a prop não vier
}: FooterProps) { /* ... */ }
```
Aplicar o mesmo padrão em `TopBar` (`contato?: DadosContato`, `tagline?: string`) e em `Header`
(`itens?: ItemNav[]` já existe — só passar via prop no layout em vez de deixar o default agir).

---

### `src/app/[locale]/page.tsx` (reescrita sobre o esqueleto atual)

**Análogo:** o próprio placeholder atual (busca no servidor + passa props à folha) e
`src/lib/cms/adapters.ts` para as três chamadas de dados da Home.

**Placeholder atual (padrão de fronteira Server/Client a preservar):**
```tsx
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <FoundationStatus
      siteName={dict.meta.siteName}
      // ...props, nunca fetch dentro do componente-folha
    />
  );
}
```

**Chamadas a fazer** (todas de `@/lib/cms/adapters`, já implementadas e testadas na Fase 3):
```typescript
const pagina = await getPagina(locale, 'home');
const produtosDestaque = pagina ? await getProdutos(locale, { destaque: true }) : [];
const avaliacoes = pagina ? await getAvaliacoes() : [];
```
Se `pagina` for `null`, renderizar o `Notice` de fallback (ver CONTEXT.md "Comportamento sem CMS") —
**não** um `notFound()` (o chrome deve sobreviver, conforme `error.tsx`/degradação documentados no
RESEARCH). `Notice` já existe em `@/components/feedback/Notice` com variante `escuro` disponível.

---

### `src/components/blocos/HeroBloco.tsx` (Server Component)

**Análogo mais próximo:** `src/components/chrome/TopBar.tsx` — mesma família de seção escura com
`styled` direto no tema (`theme.cor.tinta900`, `theme.cor.teal`), embora `TopBar` seja mais simples.

**Padrão de seção escura a replicar** (excerto de `TopBar.tsx:7-13`):
```typescript
const Barra = styled.div`
  background: ${({ theme }) => theme.cor.tinta900};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta800};
`;
```

**Gap real deste bloco — o mosaico animado não tem análogo nenhum no projeto.** UI-SPEC (Bloco 1)
pede `animation: amrMod .34s ease-out both`, mas `amrMod` **não existe** em
`src/lib/theme/GlobalStyle.ts` (confirmado por leitura direta — só existem `amrFade`, `amrToast`,
`amrSpin`, `amrPulse`, `amrDrawer`, `amrErro`). Duas rotas possíveis, a decidir no plano:
1. Adicionar `@keyframes amrMod` em `GlobalStyle.ts`, no mesmo bloco dos outros 6 (linhas 42-67),
   seguindo o padrão de comentário `/* Keyframes do layout... */`.
2. Fazer o keyframe local ao componente via `styled-components` `keyframes` import, se o time preferir
   não crescer o `GlobalStyle` para uma animação usada só neste bloco.
**Recomendação:** seguir a rota 1 — todos os outros keyframes do projeto vivem centralizados em
`GlobalStyle.ts`, e a Fase 2 documentou essa lista como o inventário fechado. Adicionar um sétimo lá
mantém o padrão existente.

**`reduced()` do HTML-fonte:** onde houver `animation-delay` calculado em JS (stagger das células do
mosaico), replicar a checagem já usada implicitamente pela regra global — mas como aqui é JS que
*agenda* delays (não CSS puro), o componente precisa checar
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` antes de aplicar qualquer
`animation-delay` — não há análogo de componente no projeto que faça isso em JS (todos os outros usos
de reduced-motion são só CSS via `GlobalStyle.ts:69-76`). Ver seção "Sem análogo" para o padrão exato
recomendado (extraído do próprio RESEARCH, não do código existente).

**Extensões de tipografia usadas aqui (Typography.tsx):** `Eyebrow $sobreEscuro` (E1) e
`Heading $nivel="h1"` com `leading.displayApertado` (E2) — ver seção "Extensões ao Design System"
abaixo para o excerto exato do que precisa mudar em `Typography.tsx`.

---

### `src/components/blocos/BuscaBloco.tsx` + `SearchBarGrande.tsx` ("use client", folha)

**Análogo de composição de formulário:** `src/components/primitives/Field.tsx` (`Input`,
`MensagemErro`) — reusar direto, sem recriar.

**`MensagemErro` — molde exato a reusar (linhas 96-103 de `Field.tsx`):**
```tsx
export function MensagemErro({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <ErroTexto role="alert" id={id}>
      <ErroIcone />
      {children}
    </ErroTexto>
  );
}
```
Texto exato exigido pelo UI-SPEC: "Digite um produto, equipamento ou solução para buscar."

**Análogo de estado local + `useState` em componente-folha:** `src/components/product/ProductCard.tsx`
(múltiplos `useState` locais, sem Redux) — mesmo padrão para `busy`/erro de validação da busca.

**Extensões necessárias antes de implementar (E3, E4, E5 — já registradas no UI-SPEC, repetidas aqui
como referência de código):**
- **E3** — `Button.tsx`: novo `case 'pretoSolido'` no switch de variante (linhas 84-135), seguindo
  exatamente o padrão dos casos `outlinePreto`/`outlineClaro` já ali.
- **E4** — `Spinner.tsx` (novo arquivo em `src/components/feedback/`): usar `amrSpin` que **já existe**
  em `GlobalStyle.ts:50-52` (`@keyframes amrSpin { to { transform: rotate(360deg); } }`) — só falta o
  componente `styled.span` que aplica `animation: amrSpin 0.7s linear infinite`. Seguir o padrão de
  `SkeletonBar` (`src/components/feedback/Skeleton.tsx:6-12`) como molde de "primitivo visual simples,
  sem estado".
- **E5** — o composto `SearchBarGrande` é 100% composição de `Input` (sem borda própria, `campoBase`
  em `Field.tsx:10-29` precisa de override local) + `Button $variante="pretoSolido"` + `Spinner`
  condicional + `MensagemErro`. Não é um primitivo novo do design system — vive em
  `src/components/blocos/`, não em `src/components/primitives/`.

---

### `src/components/blocos/ProdutosEmDestaqueBloco.tsx` + `SliderDeProdutos.tsx`

**Análogo de fronteira Server/Client:** o próprio Pattern 2 do RESEARCH.md (já com código completo,
lido nesta sessão) — copiar a estrutura exatamente como está lá:
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

**GAP DE MAPEAMENTO CRÍTICO — `ProductCard` não aceita `Produto` do adaptador diretamente.**
`ProductCard` (`src/components/product/ProductCard.tsx:10-24`) espera `ProdutoResumo`:
```typescript
export interface ProdutoResumo {
  nome: string;
  categoria: string;
  spec: string;
  descricao: string;
  fotoSrc?: string;
  // ...
  cores?: string[];
  href?: string;
}
```
Mas `Produto` (`src/lib/cms/adapters.ts:180-198`) tem forma completamente diferente: `slug`,
`descricaoHtml: HtmlSeguro`, `imagens: Imagem[]`, `tipoDeItem`, `variacoes: {tipo,nome,valorExibido}[]`,
sem `categoria` (a categoria do produto não está no schema de `Produto`, só em `Categoria.produtos`).
**O plano de execução precisa incluir explicitamente uma função `mapearParaProductCard(produto:
Produto): ProdutoResumo`** — não existe hoje em nenhum lugar do código. Decisões que essa função
precisa tomar (nenhuma decidida por este documento, só sinalizadas):
- `categoria`: de onde vem, já que `Produto` não carrega isso? (Provavelmente precisa vir junto do
  `getProdutos` com populate de categoria, ou ser fixo/omitido nesta fase.)
- `spec`: qual campo de `Produto.medidas`/`variacoes` mapeia para a spec-bar de uma linha.
- `cores`: `Produto.variacoes` tem `{tipo, nome, valorExibido}` — extrair as que têm `tipo === 'cor'`
  (nome exato do tipo a confirmar contra o seed real do Strapi).
- `ehServico`: de `Produto.tipoDeItem === 'servico-tecnico'` (conversão direta, D2 já decidiu isso).

**Análogo de contêiner de scroll nativo:** nenhum componente existente no projeto usa
`overflow-x: auto` + `scroll-snap` — é interação genuinamente nova. Use o Pattern 2 do RESEARCH como
ponto de partida (`SliderDeProdutos.tsx`, já com `scrollBy`, `role="list"`, `scrollSnapAlign`), e
aplique as regras adicionais do contrato de interação do UI-SPEC (contador via `IntersectionObserver`,
estado das setas, medição real da largura do card). Estrutura de client component sem Redux mais
próxima no projeto: `src/components/feedback/Toast.tsx` (`useEffect` de ciclo de vida, sem estado
global) — use o mesmo estilo de organização (props tipadas, `useEffect` isolado por preocupação).

---

### `src/components/blocos/AvaliacoesBloco.tsx` (3 estados)

**Estado cheio — análogo:** nenhum grid de `<figure>` existe ainda; a peça de tipografia mais próxima
é `src/components/product/ProductCard.tsx` (`Nome`/`Descricao`, Public Sans 500 22px / 15px `tinta600`
— mesmos tokens que o UI-SPEC pede para nome/empresa da avaliação).

**Estado vazio — análogo:** `src/components/feedback/EmptyState.tsx` completo (52 linhas, lido nesta
sessão):
```tsx
export interface EmptyStateProps {
  eyebrow: string;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}

export function EmptyState({ eyebrow, titulo, texto, children }: EmptyStateProps) {
  return (
    <Caixa>
      <Bloco>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h3" $nivel="h3">{titulo}</Heading>
        <Body $mid>{texto}</Body>
      </Bloco>
      {children && <Acoes>{children}</Acoes>}
    </Caixa>
  );
}
```
**Extensão E6, já registrada no UI-SPEC como decisão aberta:** o layout do estado vazio de avaliações
é **2 colunas** (`grid-template-columns:repeat(auto-fit,minmax(260px,1fr))`), mas `EmptyState` hoje é
**coluna única** (`Bloco` é `display:grid` sem `grid-template-columns`, e não há segunda coluna com a
caixa tracejada "ESTRUTURA DA AVALIAÇÃO"). Duas rotas, nenhuma decidida aqui:
1. Adicionar uma prop de layout a `EmptyState` (ex.: `$colunas?: 'unica' | 'duas'`), preservando
   `Caixa` como wrapper e só alterando o `Bloco` interno.
2. Compor manualmente dentro de `AvaliacoesBloco.tsx`, reaproveitando `Eyebrow`/`Heading
   $nivel="h3"`/`Body` soltos dentro de uma `styled.div` com a mesma borda/padding/`border-radius` de
   `Caixa` (linhas 10-18 do arquivo), sem tocar no primitivo compartilhado.
**Recomendação:** rota 2 (compor local) é mais segura — `EmptyState` de coluna única já é usado em
outros lugares do design system (catálogo/categoria, Fases 5-6) e uma prop de layout condicional
aumentaria a superfície de teste do primitivo compartilhado sem necessidade clara de reuso futuro.
Mas a decisão final é do planejador/executor, não deste documento.

**Estado carregando — análogo:** `src/components/feedback/Skeleton.tsx`, especificamente o padrão de
`ProductCardSkeleton` (linhas 14-21 e 35-48):
```typescript
const CardEsqueleto = styled.div<{ $indice: number }>`
  border: 1px solid ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
  overflow: hidden;
  animation: amrPulse 1.3s ease-in-out infinite;
  animation-delay: ${({ $indice }) => `${$indice * 0.09}s`};
`;
```
E reusar `SkeletonBar` (já exportado, linhas 6-12) para as 4 barras de cada um dos 3 cards, com as
larguras/alturas exatas listadas no UI-SPEC (Card 1/2/3) — **sem** o bloco `Foto` (este skeleton é só
texto, diferente do `ProductCardSkeleton`). Criar `AvaliacaoSkeleton` como componente novo em
`src/components/blocos/AvaliacoesBloco.tsx` (ou extrair para `Skeleton.tsx` se o time preferir manter
todos os skeletons centralizados — decisão de organização, não de padrão visual).

**Nota de arquitetura (Pitfall 1 do RESEARCH, já decidida em CONTEXT.md):** este estado "carregando"
é testável isoladamente (Jest + showcase), mas não é alcançável na Home publicada com a arquitetura
atual (sem `cacheComponents`). Não é dívida técnica — é a decisão travada A3.

---

### `src/lib/analytics/dataLayer.ts` (módulo único)

**Análogo de "módulo único tipado" no projeto:** `src/lib/cms/sanitize.ts` — mesma filosofia (porta
única, tipo marcado/branded para impedir uso indevido fora do módulo), mas do lado servidor. O
`dataLayer` é o equivalente client-side dessa ideia.

**Excerto do padrão de tipo branded em `sanitize.ts:16-19` (para inspiração da união discriminada,
não para copiar literalmente — `dataLayer` usa união por `event`, não branding):**
```typescript
declare const marcaHtmlSeguro: unique symbol;
export type HtmlSeguro = string & { readonly [marcaHtmlSeguro]: true };
```

**Implementação completa já fornecida pelo RESEARCH.md (Pattern 3), copiar literalmente como ponto de
partida:**
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

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function emitirEvento(evento: EventoDataLayer): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}
```
**Regra de tipo (Pitfall 4 do RESEARCH):** `ItemDeListaGA4` omite estruturalmente `price`, `discount`,
`coupon`, `affiliation`, `quantity`, `value`, `currency` — a prevenção é em tempo de compilação. Não
adicionar nenhum desses campos, mesmo que "opcional".

---

### `src/__tests__/guards/dataLayer-porta-unica.test.ts`

**Análogo:** `src/__tests__/guards/html-sanitizado.test.ts` (61 linhas, lido nesta sessão) — mesma
estrutura de varredura (`walk` recursivo em `src/`, allowlist por arquivo, `expect(violacoes).toEqual([])`).

**Trecho do molde a seguir (linhas 17-27, função `walk`):**
```typescript
function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry) && !EXCLUDE_FILE_SUFFIXES.some((s) => full.endsWith(s)))
      out.push(full);
  }
  return out;
}
```
O RESEARCH.md já forneceu a versão adaptada completa (arquivo
`dataLayer-porta-unica.test.ts` no bloco "Code Examples") — usar aquele código como está, só
confirmando que o caminho `ARQUIVO_PERMITIDO` aponta para `src/lib/analytics/dataLayer.ts`.

Há também `src/__tests__/guards/no-price.test.ts` (77 linhas) como segunda referência de guarda — mais
relevante para conferir que o payload de `view_item_list` não introduz nenhum termo da allowlist
`FORBIDDEN` (linhas 24-37) durante a implementação (ex.: não nomear nenhum campo `price:` no tipo
`ItemDeListaGA4`).

---

### `eslint.config.mjs` (modificação)

**Análogo:** ele mesmo — estrutura flat config atual (33 linhas, lida nesta sessão):
```javascript
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  { ignores: [ /* ... */ ] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [ /* ... */ ],
    },
  },
];
export default config;
```
**Padrão a seguir:** adicionar um novo objeto ao array `config` (não modificar os existentes) com
`no-restricted-properties` (regra exata já no RESEARCH.md, seção "Code Examples"), e um segundo objeto
com `files: ['src/lib/analytics/dataLayer.ts']` que desativa a regra só ali — a ordem importa em flat
config (objetos posteriores que casam o mesmo arquivo sobrescrevem os anteriores), então esse objeto de
exceção deve vir **depois** do objeto de regra global no array.

---

### `next.config.ts` / `.env.example` (modificação — pré-requisito de infraestrutura)

**Análogo:** eles mesmos. `next.config.ts` já tem `images: { formats: [...] }` (linha ~42) — só
adicionar a chave `remotePatterns` ao mesmo objeto `images`, usando o excerto já verificado do
RESEARCH.md contra `node_modules/next/dist/docs/`:
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  remotePatterns: [
    { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
    { protocol: 'http', hostname: 'cms', port: '1337', pathname: '/uploads/**' },
  ],
},
```
`.env.example` já documenta `STRAPI_API_URL`/`STRAPI_API_TOKEN` sob o comentário "Servidor (nunca
expor)" — adicionar `NEXT_PUBLIC_STRAPI_MEDIA_URL` sob o bloco "Público (pode ir ao cliente)" (linha
~5, junto de `NEXT_PUBLIC_SITE_URL`), pois é essa variável que `adaptarImagem` em
`src/lib/cms/adapters.ts:46` já lê via `process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL`.

---

## Shared Patterns

### Fronteira Server/Client (ADR-001)
**Fonte:** todo o chrome existente já modela isso — Server Component busca (futuro
`[locale]/layout.tsx`/`page.tsx`), `styled` fica nas folhas client (`TopBar`, `Header`, `MobileMenu`,
`Footer`, `Toast`, `EmptyState`, `Skeleton`, `ProductCard` — **todos** têm `'use client'` no topo,
mesmo sendo "apresentação"). **Aplicar a todos os 9 blocos:** cada `XBloco.tsx` que só recebe props e
renderiza é Server Component (sem `'use client'`); só `BuscaBloco`/`SearchBarGrande` e
`SliderDeProdutos` precisam da diretiva, porque têm estado local (`useState`) ou efeito
(`useEffect`/`IntersectionObserver`).

### Import de tipos do CMS
**Fonte:** `src/lib/cms/adapters.ts` exporta todos os tipos de view-model já adaptados (`Bloco`,
`Produto`, `Categoria`, `Avaliacao`, `Imagem`, `Seo`). **Aplicar a todos os blocos:** nunca importar
tipos de `src/lib/cms/schemas.ts` (esses são o formato *cru* do Strapi, pré-adaptação) num componente
de apresentação — sempre os tipos pós-adaptador de `adapters.ts`.

### Tema — cor/tipografia/espaçamento
**Fonte:** `src/lib/theme/theme.ts` (lido nesta sessão, tokens completos). **Aplicar a todos os
blocos:** nenhuma cor/tamanho/espaçamento literal — sempre `theme.cor.*`/`theme.tamanho[*]`/
`theme.fluido.*`/`theme.espaco[*]`. Nota de fidelidade já registrada no UI-SPEC: usar
`theme.cor.tinta600` explícito em parágrafos de introdução de seção, **não** `Body $mid` (que aponta
para `theme.cor.textoMid`, um token diferente — ver `Typography.tsx:45-49`).

### `SectionDivider` — prop booleana, não variante string
**Fonte:** `src/components/feedback/SectionDivider.tsx` (16 linhas). **Atenção:** o CONTEXT.md e o
UI-SPEC descrevem "variante escura"/"variante clara", mas a API real do componente é um booleano:
```typescript
export const SectionDivider = styled.div.attrs({ 'aria-hidden': true })<{ $claro?: boolean }>`...`;
```
Usar `<SectionDivider $claro />` para a variante clara e `<SectionDivider />` (sem prop) para a
escura — não existe prop `variante="escura"` nem `"clara"` no componente real.

### Sanitização de rich text — nunca reaplicar
**Fonte:** `src/lib/cms/sanitize.ts` + guarda `src/__tests__/guards/html-sanitizado.test.ts`.
**Aplicar a:** nenhum bloco desta fase usa `dangerouslySetInnerHTML` diretamente (os 9 blocos da Home
não têm campo de rich text nos schemas — só `blocos.texto-rico`/`blocos.faq`/`blocos.comparativo-led`
têm, e esses são reservados para as Fases 6/11). Se algum bloco precisar renderizar HTML no futuro,
o campo já chega como `HtmlSeguro` — nunca chamar `sanitizarRichText` de novo.

### Regra anti-preço
**Fonte:** `src/__tests__/guards/no-price.test.ts` (varre `src/**` e `cms/src/**`).
**Aplicar a:** `ItemDeListaGA4` (módulo `dataLayer`) e a todos os textos/copy dos 9 blocos — nenhum
campo com `price`/`preço`/`subtotal`/etc., mesmo em comentário de código.

---

## Sem Análogo (registrado explicitamente, conforme pedido)

| Arquivo | Motivo | Referência a usar em vez de análogo interno |
|---|---|---|
| `src/app/[locale]/error.tsx` | Não existe nenhum `error.tsx` no projeto hoje (confirmado por `find`/`Glob`). É o primeiro error boundary do App Router do projeto. | Doc oficial `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` — usar prop `retry` (não `reset`, ver Pitfall 5 do RESEARCH). Estrutura mínima já fornecida no RESEARCH.md ("Code Examples", bloco `error.tsx`). |
| `@keyframes amrMod` (mosaico do Hero) | Não existe em `GlobalStyle.ts` — o inventário de 6 keyframes ali é fechado desde a Fase 2 e não inclui este. | Seguir o padrão estrutural dos outros 6 `@keyframes` já no arquivo (linhas 42-67) — é adição aditiva ao mesmo bloco, não um padrão novo de organização. |
| Checagem de `prefers-reduced-motion` via JS (`window.matchMedia`) para agendar `animation-delay` | Todo uso existente de reduced-motion no projeto é só CSS (`GlobalStyle.ts:69-76`, zera `animation-duration` globalmente); nenhum componente hoje precisa decidir em JS se agenda ou não um delay. | Função `reduced()` do `Home.dc.html` (fonte visual) — `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, checada uma vez antes de calcular os delays do mosaico. |
| Contador do slider via `IntersectionObserver` | Nenhum componente do projeto usa `IntersectionObserver` hoje. | Especificação completa já está no UI-SPEC (seção "Controles" do Bloco 4) — implementar do zero seguindo a spec, sem molde de código interno. |
| `mapearParaProductCard(produto: Produto): ProdutoResumo` | Não existe função de mapeamento entre o tipo do adaptador CMS (`Produto`) e o tipo de prop do componente de apresentação (`ProdutoResumo`) — é o primeiro ponto do projeto onde um bloco de conteúdo precisa dessa ponte. | Ver gap detalhado na seção `ProdutosEmDestaqueBloco.tsx` acima — este documento sinaliza os campos que precisam de decisão, não resolve a função por conta própria. |

---

## Metadata

**Escopo da busca de análogos:** `src/components/**`, `src/lib/**`, `src/app/**`,
`src/__tests__/guards/**`, `eslint.config.mjs`, `next.config.ts`, `.env.example`, `next/dist/docs`
(para o único item sem análogo interno, `error.tsx`).
**Arquivos lidos integralmente nesta sessão:** `adapters.ts`, `schemas.ts`, `sanitize.ts`,
`[locale]/layout.tsx`, `[locale]/page.tsx`, `TopBar.tsx`, `Header.tsx`, `MobileMenu.tsx`, `Footer.tsx`,
`navigation.ts`, `EmptyState.tsx`, `Skeleton.tsx`, `Toast.tsx`, `Notice.tsx`, `SectionDivider.tsx`,
`ProductCard.tsx`, `Typography.tsx`, `Button.tsx`, `Field.tsx`, `Container.tsx`, `media.ts`, `theme.ts`
(trecho), `GlobalStyle.ts`, `ColorSwatches.tsx`, `ImagePlaceholder.tsx`, `route.ts` (revalidate),
`eslint.config.mjs`, `next.config.ts`, `.env.example`, `html-sanitizado.test.ts`, `no-price.test.ts`,
`design-system/page.tsx`, `ProductCard.test.tsx` (trecho).
**Data de extração:** 2026-08-18
