# Fase 05: Catálogo — Mapa de Padrões

**Mapeado em:** 2026-08-19
**Arquivos analisados:** 17 (novos/modificados)
**Analogs encontrados:** 14 / 17

---

## Achado crítico antes do mapa: o "drawer com Radix" citado no RESEARCH/UI-SPEC não existe no código

O RESEARCH.md (§3) e o UI-SPEC.md (Bloco 6) afirmam que `src/components/chrome/MobileMenu.tsx` é
"um precedente direto" de drawer com `@radix-ui/react-dialog`, foco preso, `Esc` e retorno de foco.

**Isso não é verdade.** Verifiquei:

```
grep -rln "from '@radix-ui" src   →  (nenhum resultado)
```

`@radix-ui/react-dialog` e `@radix-ui/react-accordion` estão em `package.json` (dependências
instaladas), mas **nenhum componente em `src/` os importa ainda**. `MobileMenu.tsx` não usa Radix —
é `display: none/block` via media query (`media.mobile`/`media.desktop` de `src/lib/theme/media.ts`)
comandado pelo Redux (`useAppSelector((s) => s.ui.menuMobileAberto)`, `store/slices/uiSlice.ts`). Não
há foco preso, não há `Esc`, não há retorno de foco — é puramente CSS + boolean de estado global.

**Consequência para o planner:** o Drawer mobile de filtros (Bloco 6 do UI-SPEC) e o Acordeão do
painel de filtros (Bloco 3) são os **primeiros consumidores reais** de `@radix-ui/react-dialog` e
`@radix-ui/react-accordion` no projeto. Não há analog interno para o comportamento de foco — a
implementação deve seguir a documentação oficial do Radix diretamente (`Dialog.Root`,
`Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content` para o drawer; `Accordion.Root type="multiple"`
para o painel, já que o UI-SPEC exige "múltiplo, não exclusivo"). `MobileMenu.tsx` continua sendo o
analog **de estilo** (cores, espaçamento, `Rodape`/`ContatoBloco`) e do padrão "estado de UI efêmero
mora no `uiSlice`", não de mecanismo de acessibilidade. Já existe até o campo certo no slice:
`drawerFiltrosAberto` (`src/store/slices/uiSlice.ts`, linha 8) — criado antecipadamente, ainda sem
consumidor.

---

## Classificação de Arquivos

| Arquivo novo/modificado | Papel | Fluxo de dados | Analog mais próximo | Qualidade |
|---|---|---|---|---|
| `src/app/[locale]/catalogo/page.tsx` | route (Server Component) | request-response (dinâmica, `searchParams`) | `src/app/[locale]/page.tsx` | role-match (Home é estática; catálogo é dinâmica) |
| `src/app/[locale]/catalogo/error.tsx` | route (error boundary) | request-response | `src/app/[locale]/error.tsx` | exato |
| `src/app/[locale]/catalogo/loading.tsx` | route (loading UI) | request-response | nenhum `loading.tsx` existe no projeto ainda | sem analog direto (ver seção "Sem Analog") |
| `src/components/catalogo/PainelDeFiltros.tsx` (ou similar) | component (acordeão de filtros) | event-driven (client, muda URL) | `src/components/chrome/MobileMenu.tsx` (estilo) + Radix Accordion (mecanismo) | parcial |
| `src/components/catalogo/DrawerDeFiltros.tsx` | component (drawer mobile) | event-driven | `src/components/chrome/MobileMenu.tsx` (estilo/copy) + Radix Dialog (mecanismo) | parcial |
| `src/components/catalogo/BarraDeBusca.tsx` (ou reuso direto) | component (busca) | request-response (submit → navigate) | `src/components/blocos/SearchBarGrande.tsx` | exato |
| `src/components/catalogo/ChipsDeFiltro.tsx` | component (lista de chips ativos) | transform (deriva da URL) | `src/components/primitives/Chip.tsx` (`ChipFiltro`, já existe pronto) | exato — reuso direto, não recriar |
| `src/components/catalogo/Toolbar.tsx` | component (contagem + ordenação + botão filtros mobile) | request-response | `src/components/blocos/GradeDeCategoriasBloco.tsx` (cabeçalho de seção) | role-match |
| `src/components/catalogo/GradeDeProdutos.tsx` | component (grade + estados) | CRUD (lista) | `src/components/blocos/ProdutosEmDestaqueBloco.tsx` + `GradeDeCategoriasBloco.tsx` (`GradePadrao`, `auto-fit`) | exato (padrão de grid D3/D5) |
| `src/lib/cms/adapters.ts` (`getProdutos`, `FiltroProdutos`) | service (CMS adapter) | CRUD (query) | próprio arquivo, extensão aditiva do padrão existente | exato |
| `src/lib/cms/schemas.ts` (`produtoSchema`, novo `tipoDeEventoSchema`) | model (Zod) | transform | próprio arquivo (`categoriaSchema`, `subcategoriaSchema`) | exato |
| `src/lib/analytics/dataLayer.ts` (`EventoDataLayer` +`search`/`filter_applied`) | service (porta de eventos) | event-driven | próprio arquivo (padrão de união discriminada) | exato |
| `src/components/analytics/EmissorSearch.tsx` / reuso de `EmissorViewItemList` | component (emissor de evento) | event-driven | `src/components/analytics/EmissorViewItemList.tsx` | exato |
| `cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json` + `controllers/routes/services` | model (Strapi content-type) | CRUD | `cms/src/api/category/*` | exato |
| `cms/src/api/product/content-types/product/schema.json` (campo `tiposDeEvento` manyToMany) | model (Strapi schema, modificado) | CRUD | próprio arquivo (`relacionados`, `alugadoComFrequencia`, mesmo padrão manyToMany) | exato |
| teste e2e Playwright do fluxo de filtro | test | event-driven | nenhum teste Playwright existe ainda no repo (ver "Sem Analog") | sem analog |
| `src/app/[locale]/catalogo/page.test.tsx` | test | request-response | `src/app/[locale]/page.test.tsx` | exato |
| `src/lib/cms/adapters.test.ts` (extensão dos testes de `getProdutos`) | test | CRUD | próprio arquivo (`describe('adaptadores CMS → props')`) | exato |

---

## Atribuições de Padrão

### `src/app/[locale]/catalogo/page.tsx` (route, request-response dinâmica)

**Analog:** `src/app/[locale]/page.tsx`

**Imports pattern** (page.tsx, linhas 1-7):
```tsx
import styled from 'styled-components';
import { isLocale, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';
import { getPagina, getCategorias, getProdutos, getAvaliacoes } from '@/lib/cms/adapters';
import { RenderizadorDeBlocos } from '@/components/blocos/renderizador';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';
```

**Guard de locale** (page.tsx, linhas 30-33) — copiar literalmente:
```tsx
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const localeTipado: Locale = locale;
```

**Diferença obrigatória para o catálogo — `searchParams` é Promise (Next 16, confirmado em
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`)**:
```tsx
export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  // ...
}
```
Isso torna a rota dinâmica (renderizada sob demanda), diferente da Home (SSG). Não acrescentar
`export const dynamic = 'force-dynamic'` — a presença de `searchParams` já basta (mesma lição do
comentário em `page.tsx` linhas 13-19 sobre não forçar modo dinâmico manualmente).

**Fallback de indisponibilidade** (page.tsx, linhas 22-28 e 47-58) — mesmo padrão para "erro ao
consultar o CMS" (estado 4 do Bloco 8 do UI-SPEC), mas usar `EmptyState`/`Notice` conforme a cópia
"SEM CORRESPONDÊNCIA" do UI-SPEC em vez do texto genérico da Home:
```tsx
const TITULO_INDISPONIVEL = 'CONTEÚDO INDISPONÍVEL';
const TEXTO_INDISPONIVEL =
  'Não foi possível carregar o conteúdo da página no momento. Tente novamente em alguns minutos.';
// ...
if (!pagina) {
  return (
    <FallbackWrapper>
      <Notice rotulo={TITULO_INDISPONIVEL} variante="escuro">
        {TEXTO_INDISPONIVEL}
      </Notice>
    </FallbackWrapper>
  );
}
```

**Busca em Server Component (ADR 001):** montar `FiltroProdutos` a partir de `sp` (searchParams) e
chamar `getProdutos(localeTipado, filtro)` diretamente no page.tsx, no mesmo estilo de
`Promise.all([getCategorias(...), getProdutos(...), getAvaliacoes()])` (page.tsx, linhas 39-45) —
mas aqui sem `Promise.all` desnecessário se só há uma consulta dependente dos filtros.

---

### `src/app/[locale]/catalogo/error.tsx` (route, error boundary)

**Analog:** `src/app/[locale]/error.tsx` — copiar quase literalmente, é o primeiro (e único)
`error.tsx` do projeto e já resolve a granularidade certa (um boundary por segmento, `retry`
disponível desde Next 16.3):

```tsx
'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';
import { Button } from '@/components/primitives/Button';

const Envolucro = styled.div`
  padding-block: clamp(64px, 9vw, 144px);
`;

export default function ErroDoSegmento({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Envolucro>
      <Container>
        <Notice rotulo="ERRO" variante="escuro">
          Não foi possível carregar o conteúdo desta página agora.
        </Notice>
        <div style={{ marginTop: 16 }}>
          <Button $variante="primario" type="button" onClick={() => retry()}>
            TENTAR NOVAMENTE
          </Button>
        </div>
      </Container>
    </Envolucro>
  );
}
```
Ajustar a cópia interna do `Notice` para o texto do estado 4 do UI-SPEC ("Amplie a busca ou fale com
a equipe" é o estado *sem resultados*, não o de *erro* — não confundir os dois; erro é falha real de
rede/CMS, cópia genérica está correta aqui).

---

### `src/components/catalogo/BarraDeBusca.tsx` (component, request-response)

**Analog:** `src/components/blocos/SearchBarGrande.tsx` — o RESEARCH recomenda que **o catálogo
emita `search`** ao processar `?q=`, e que a Home só navegue. Isso significa que este componente é
provavelmente uma variação do mesmo padrão de `SearchBarGrande`, mas sem `router.push` de navegação
entre rotas — em vez disso, atualiza a própria URL do catálogo (`router.push`/`router.replace` com
os mesmos `searchParams`, preservando os outros filtros).

**Estado `busy` real via `useTransition`** (SearchBarGrande.tsx, linhas 60-64, 70-83) — copiar o
mecanismo, não a navegação para `/catalogo`:
```tsx
const router = useRouter();
const [termo, setTermo] = useState('');
const [erro, setErro] = useState(false);
const [pendente, iniciarTransicao] = useTransition();

function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
  evento.preventDefault();
  const termoLimpo = termo.trim();
  if (termoLimpo === '') { setErro(true); return; }
  setErro(false);
  iniciarTransicao(() => {
    router.push(`?q=${encodeURIComponent(termoLimpo)}`); // dentro da própria rota /catalogo
  });
}
```

**Botão com spinner** (linhas 97-106) — reusar tal e qual, inclusive a variante `pretoSolido` do
`Button` (já documentada em `Button.tsx` linha 133-135 como "Reusável no Catálogo (Fase 5), que tem
a mesma busca"):
```tsx
<BotaoBuscar type="submit" $variante="pretoSolido" disabled={pendente}>
  {pendente ? (
    <RotuloComSpinner><Spinner />BUSCANDO</RotuloComSpinner>
  ) : 'BUSCAR'}
</BotaoBuscar>
```

**`Input` primitivo** (Field.tsx, linhas 31-33): `<Input type="search" ...>` já é o padrão — o
UI-SPEC pede `id="busca-catalogo"` e placeholder
`"Busque por mesa, capa, guarda-sol, painel de LED..."`, que já é o default de
`SearchBarGrande` (linha 93) — reaproveitar o texto exato.

**Divergência a decidir no plano:** se dá para **compor** com `SearchBarGrande` (prop extra tipo
`modo: 'home' | 'catalogo'`) em vez de duplicar o arquivo. RESEARCH.md e CONTEXT.md deixam essa
decisão em aberto ("conferir o que dá para compor").

---

### `src/components/catalogo/ChipsDeFiltro.tsx` (component, transform)

**Analog:** `src/components/primitives/Chip.tsx` — **não recriar**, o componente `ChipFiltro` já
existe pronto, inclusive com `aria-label` de remoção e alvo de toque adequado:

```tsx
export interface ChipFiltroProps {
  rotulo: string;
  valor: string;
  onRemover: () => void;
}

export function ChipFiltro({ rotulo, valor, onRemover }: ChipFiltroProps) {
  return (
    <ChipBotao type="button" onClick={onRemover} aria-label={`Remover filtro ${rotulo}: ${valor}`}>
      <ChipRotulo>{rotulo}</ChipRotulo>
      {valor}
      <ChipX>×</ChipX>
    </ChipBotao>
  );
}
```

O trabalho novo é só o componente contêiner que lê `searchParams`, gera um `ChipFiltro` por valor
ativo e, no `onRemover`, reescreve a URL sem aquele valor (armadilha 2 do RESEARCH §6 — testar
recarregar e voltar no histórico, não só o clique).

Para o filtro de cor, UI-SPEC exige "o chip mostra o nome da cor" — usar o mesmo `Record<string,
string>` `coresProduto` de `src/lib/site/navigation.ts` (linhas 74-80) só para resolver o rótulo
amigável se necessário; o `ColorSwatches` (abaixo) já convive com esse mapa.

---

### `src/components/product/ColorSwatches.tsx` — reuso no filtro "Cor" (não modificar)

**Analog:** `src/components/primitives/ColorSwatches.tsx` — já é genérico o bastante (recebe
`cores: string[]`, `selecionada`, `onSelecionar`, `erro`) para funcionar tanto no `ProductCard`
quanto no grupo de filtro "Cor" do painel. As três cores do filtro (`Bege #D8C9A8`, `Preto
#0B0C0D`, `Branco #FFFFFF`) já são exatamente as três primeiras entradas de `coresProduto`
(`src/lib/site/navigation.ts`, linhas 75-77) — não hardcodar hex novo no painel de filtros, importar
o mesmo mapa.

```tsx
export const coresProduto: Record<string, string> = {
  Bege: '#D8C9A8',
  Preto: '#0B0C0D',
  Branco: '#FFFFFF',
  'Azul-marinho': '#1F2A44',
  Bordô: '#5A2020',
};
```

Diferença de uso: no `ProductCard` é seleção única obrigatória (rótulo "COR · OBRIGATÓRIO"); no
painel de filtro é multi-seleção (`$in`) e opcional — o componente aceita só uma `selecionada`
(string), então o painel de filtros provavelmente precisa de uma variante própria de swatches
multi-select, ou de um wrapper que gerencia um `Set<string>` por fora e chama `onSelecionar` por
clique acumulado. **Registrar como decisão do plano**, não montar a variante multi-select
silenciosamente dentro do primitivo compartilhado com o card.

---

### `src/components/catalogo/GradeDeProdutos.tsx` (component, CRUD/lista)

**Analog:** `src/components/blocos/GradeDeCategoriasBloco.tsx` (`GradePadrao`, linhas 110-114) +
`src/components/blocos/ProdutosEmDestaqueBloco.tsx` (como consumir `Produto[]` + `mapearParaProductCard`).

**Grid `auto-fit` (D3/D5)** — copiar literalmente o padrão, ajustando o `minmax` para 280px
conforme o UI-SPEC (Bloco 7: `repeat(auto-fit, minmax(280px, 1fr))`):
```tsx
const GradePadrao = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;
```

**Ponte de dados** (`mapearParaProductCard.ts`, arquivo inteiro, 53 linhas) — usar sem modificar:
```ts
export function mapearParaProductCard(produto: Produto, locale: Locale): ProdutoResumo {
  // spec: primeira medida, senão material, senão 'ESPECIFICAÇÃO SOB CONSULTA'
  // descricao: sempre descricaoCurta (texto puro, nunca HTML)
  // cores: nomes das variações tipo 'cor'
  // href: `/${locale}/${categoria.slug}/${slug}` — só se categoria existir
}
```

**Renderização do card** — `ProductCard` já tem 3 variantes internas (serviço/com-cor/físico) só
por causa de `produto.ehServico`/`produto.cores` — o consumidor não escolhe variante, só passa
`ProdutoResumo`:
```tsx
{produtos.map((p) => (
  <ProductCard key={p.slug} produto={mapearParaProductCard(p, locale)} />
))}
```
Botão "adicionar ao orçamento" **fica inerte** — não passar `onAdicionar` (a prop é opcional,
`onAdicionar?.(...)`), exatamente como a decisão Q3 da Fase 4 já aplicou no slider da Home.

---

### `src/lib/cms/adapters.ts` — `getProdutos`/`FiltroProdutos` (service, CRUD, extensão)

**Analog:** o próprio arquivo, função já existente (linhas 252-275) — extensão aditiva, não reescrita:

```ts
export interface FiltroProdutos {
  categoria?: string;
  destaque?: boolean;
  busca?: string;
  pagina?: number;
  porPagina?: number;
}

export async function getProdutos(locale: Locale, filtro: FiltroProdutos = {}): Promise<Produto[]> {
  const params: Record<string, string | number | boolean> = {
    locale,
    populate: POPULATE_PRODUTO_LISTA,
    'sort[0]': 'nome:asc',
    'pagination[page]': filtro.pagina ?? 1,
    'pagination[pageSize]': filtro.porPagina ?? 24,
  };
  if (filtro.categoria) params['filters[categoria][slug][$eq]'] = filtro.categoria;
  if (filtro.destaque !== undefined) params['filters[destaque][$eq]'] = filtro.destaque;
  if (filtro.busca) params['filters[nome][$containsi]'] = filtro.busca;

  const res = await fetchStrapi('products', produtoColecao, { params, tags: [TAG.products] });
  return res.data.map(adaptarProduto);
}
```

Campos novos a acrescentar em `FiltroProdutos` (5 grupos do UI-SPEC): `tipoDeItem?: string[]`,
`cor?: string[]`, `tipoDeEvento?: string[]`, `ambiente?: string`, `ordenar?: string`. Sintaxe de
query já **testada de verdade** contra o Strapi (RESEARCH §1) — usar exatamente esta forma para
OR-dentro-do-grupo / AND-entre-grupos:
```
filters[$and][0][$or][0][tipoDeItem][$eq]=pacote
filters[$and][0][$or][1][tipoDeItem][$eq]=servico-tecnico
filters[$and][1][variacoes][nome][$in][0]=Bege
filters[$and][1][variacoes][nome][$in][1]=Preto
```
`populate` precisa crescer para incluir a nova relação `tiposDeEvento` quando esse filtro for usado
(mesma lista `POPULATE_PRODUTO_LISTA`, linha 248, hoje `'imagens,variacoes,categoria'`).

`sort[0]` precisa de mapa rótulo→campo Strapi para as 5 opções do UI-SPEC (Bloco 4): "Nome de A a Z"
→ `nome:asc` (já é o default), "Nome de Z a A" → `nome:desc` (testado no RESEARCH §1, linha 53-55),
"Mais recentes" → `createdAt:desc` (padrão já usado em `getAvaliacoes`, adapters.ts linha 409),
"Produtos em destaque" → provavelmente `destaque:desc,nome:asc`. "Mais solicitados" **não tem campo
no modelo** — Q2 do UI-SPEC, decidir no plano antes de implementar.

---

### `src/lib/cms/schemas.ts` — `tipoDeEventoSchema` + extensão de `produtoSchema` (model, transform)

**Analog:** `categoriaSchema`/`subcategoriaSchema` no próprio arquivo (linhas 86-89, 134-146) — a
nova taxonomia é estruturalmente idêntica a uma categoria simples (`nome`, `slug`, `ordem`):

```ts
export const tipoDeEventoSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  slug: z.string(),
  ordem: z.number().nullable().optional(),
  locale: z.string().nullable().optional(),
});
export const tipoDeEventoColecao = colecao(tipoDeEventoSchema);
export type TipoDeEventoCms = z.infer<typeof tipoDeEventoSchema>;
```

Extensão de `produtoSchema` (linha 130, mesmo padrão da relação `categoria` já aditiva/opcional):
```ts
// já existe, mesmo padrão a seguir:
categoria: z.object({ nome: z.string(), slug: z.string() }).nullable().optional(),
// novo, análogo, manyToMany então é array:
tiposDeEvento: z.array(z.object({ nome: z.string(), slug: z.string() })).nullable().optional(),
```

**Nota de migração:** `aplicacoes` (linha 119, `z.array(z.string()).nullable().optional()`)
**permanece no schema** — CONTEXT.md decisão 1: o campo continua existindo para texto livre
editorial, só deixa de ser a fonte do filtro.

---

### `src/lib/analytics/dataLayer.ts` — eventos `search` e `filter_applied` (service, event-driven)

**Analog:** o próprio arquivo — `EventoDataLayer` é uma união discriminada por `event` com **um
único membro hoje** (`view_item_list`, linhas 34-39). É preciso ampliar a união, não substituí-la:

```ts
export type EventoDataLayer =
  | {
      event: 'view_item_list';
      item_list_id: string;
      item_list_name: string;
      items: ItemDeListaGA4[];
    }
  | {
      event: 'search';
      search_term: string;
    }
  | {
      event: 'filter_applied';
      filter_type: string; // ex.: 'categoria' | 'tipoDeItem' | 'cor' | 'tipoDeEvento' | 'ambiente'
      filter_value: string;
    };
```

`emitirEvento` (linhas 51-55) não muda — já aceita qualquer membro da união:
```ts
export function emitirEvento(evento: EventoDataLayer): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}
```
**Regra inviolável preservada:** nenhum campo monetário pode entrar em nenhum novo membro da união —
é assim que o TypeScript barra em compilação (o "truque" já provado na Fase 4 com `error TS2353`
para campo extra não declarado).

O teste-guarda `src/__tests__/guards/dataLayer-porta-unica.test.ts` (citado no comentário do
arquivo) deve continuar passando sem alteração — ele testa que nenhum outro arquivo chama
`window.dataLayer.push`/`dataLayer.push` direto, não a forma da união.

---

### `src/components/analytics/EmissorSearch.tsx` (component, event-driven) — ou emissão inline

**Analog:** `src/components/analytics/EmissorViewItemList.tsx` — mesmo mecanismo de "montagem única"
via `useRef` + `useEffect` vazio de dependências, necessário porque blocos de listagem são Server
Components e a fila de eventos só existe no navegador:

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { emitirEvento } from '@/lib/analytics/dataLayer';

export function EmissorSearch({ termo }: { termo: string }) {
  const jaEmitiu = useRef(false);
  useEffect(() => {
    if (jaEmitiu.current) return;
    jaEmitiu.current = true;
    emitirEvento({ event: 'search', search_term: termo });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
```

`EmissorViewItemList` em si é **reusado sem modificação** para a grade de resultados — só o
`item_list_id` muda por chamada (Q3 do UI-SPEC, decidir se é fixo `catalogo` ou derivado dos
filtros; o precedente de `GradeDeCategoriasBloco.tsx` usa um id fixo por bloco, `home_categorias`,
o que sugere um id fixo `catalogo_resultados` também é aceitável e mais simples).

**Quando emitir `filter_applied`:** provavelmente um `useEffect` no componente cliente que lê os
`searchParams` correntes (via `useSearchParams` do Next) e dispara por filtro alterado — não há
analog interno para "emitir a cada mudança de query string"; seguir o mesmo mecanismo de trava por
`useRef` mas comparando o valor anterior, não só "já montou".

---

### `cms/src/api/tipo-de-evento/*` (model, CRUD — content-type novo do Strapi)

**Analog:** `cms/src/api/category/*` (schema + controller + routes + service) — é o content-type
mais próximo estruturalmente (nome/slug/ordem, sem campos complexos):

**schema.json** (`cms/src/api/category/content-types/category/schema.json`, linhas 1-64) — copiar a
estrutura, trocar `singularName`/`pluralName`/`displayName`/`collectionName` e remover os campos que
não se aplicam (`descricao`, `subcategorias`, `hero`, `seo`):
```json
{
  "kind": "collectionType",
  "collectionName": "tipos-de-evento",
  "info": {
    "singularName": "tipo-de-evento",
    "pluralName": "tipos-de-evento",
    "displayName": "Tipo de Evento",
    "description": "Taxonomia de tipo de evento — alimenta o filtro do catálogo (Fase 5) e o formulário de orçamento (Fase 9)."
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "nome": { "type": "string", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "slug": { "type": "uid", "targetField": "nome", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "ordem": { "type": "integer", "default": 0, "pluginOptions": { "i18n": { "localized": false } } },
    "produtos": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::product.product",
      "mappedBy": "tiposDeEvento"
    }
  }
}
```

**controllers/routes/services** (`category.ts`, 3 arquivos de 3 linhas cada) — os três são
boilerplate puro de `factories`, copiar tal e qual trocando o UID:
```ts
// controllers/tipo-de-evento.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::tipo-de-evento.tipo-de-evento');

// routes/tipo-de-evento.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::tipo-de-evento.tipo-de-evento');

// services/tipo-de-evento.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::tipo-de-evento.tipo-de-evento');
```

**`cms/src/api/product/content-types/product/schema.json`** (modificado, linhas 97-106) — o padrão
de relação manyToMany já existe no mesmo arquivo, duas vezes (`relacionados`,
`alugadoComFrequencia`), ambas auto-relação; a nova é heteróloga (aponta para outro content-type),
mas a sintaxe é a mesma, espelhando `categoria` (linhas 34-39) do lado inverso:
```json
"tiposDeEvento": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::tipo-de-evento.tipo-de-evento",
  "inversedBy": "produtos"
}
```

**Migração de conteúdo** (`aplicacoes` → `tiposDeEvento` nos 10 produtos já cadastrados): não há
analog de script de migração no repo — é trabalho novo, provavelmente um script Node único
(`cms/scripts/` ou execução manual via Admin API do Strapi), não um padrão a copiar.

---

### `src/app/[locale]/catalogo/page.test.tsx` e `src/lib/cms/adapters.test.ts` (test)

**Analog:** `src/app/[locale]/page.test.tsx` (padrão de teste de página) e
`src/lib/cms/adapters.test.ts` (padrão de teste de adaptador — `describe('adaptadores CMS →
props')`, fixture `ProdutoCms` mínima, linhas 1-30, e casos "sem campos opcionais não quebra").
Seguir a mesma fixture-base (`produtoCru`) para os novos testes de `getProdutos` com os 5 grupos de
filtro.

**Mock obrigatório do dataLayer** (CONTEXT.md): `mockar @/lib/analytics/dataLayer` — não há um
arquivo de mock canônico ainda visível no fluxo lido, mas o padrão já documentado no CONTEXT.md é
`jest.mock('@/lib/analytics/dataLayer')` por arquivo de teste que renderiza `EmissorViewItemList`.

---

## Padrões Compartilhados

### Guard de locale em rota do App Router
**Fonte:** `src/app/[locale]/page.tsx`, linhas 30-33; `src/app/[locale]/layout.tsx`, linhas 24-26
**Aplicar em:** `catalogo/page.tsx`
```tsx
const { locale } = await params;
if (!isLocale(locale)) notFound();
const localeTipado: Locale = locale;
```

### `searchParams` é `Promise` no Next 16 (breaking change vs. treinamento)
**Fonte:** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md`
(confirmado no RESEARCH.md §2)
**Aplicar em:** `catalogo/page.tsx` — `searchParams: Promise<{ [key: string]: string | string[] |
undefined }>`, sempre com `await`.

### Grid fluido sem `@media` nova — `auto-fit`/`minmax` (D3, estendido como D5)
**Fonte:** `src/components/blocos/GradeDeCategoriasBloco.tsx`, linhas 110-114
**Aplicar em:** `GradeDeProdutos.tsx` (grid de produtos), possivelmente no hero de 2 colunas do
Bloco 1 do UI-SPEC
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 24px;
```

### Única media query aprovada — troca de chrome em 1080px
**Fonte:** `src/lib/theme/media.ts` (arquivo inteiro, 15 linhas)
**Aplicar em:** visibilidade do botão "Filtros" (Q1 do UI-SPEC, recomendação (a)) e no colapso do
aside de 272px para o drawer
```ts
export const media = {
  mobile: `@media (max-width: ${px - 0.02}px)`,
  desktop: `@media (min-width: ${px}px)`,
};
```

### `'use client'` obrigatório em qualquer componente com `styled-components`
**Fonte:** comentários repetidos em `GradeDeCategoriasBloco.tsx` linha 18, `ProdutosEmDestaqueBloco.tsx`
linha 19 — "`theme` de styled-components só resolve via Context dentro da árvore de Client
Components"
**Aplicar em:** todos os novos componentes de `src/components/catalogo/*`.

### Emissão de evento client-side "uma vez por montagem" via `useRef`
**Fonte:** `src/components/analytics/EmissorViewItemList.tsx`, linhas 16-36
**Aplicar em:** `EmissorSearch` e qualquer novo emissor de `filter_applied`.

### Porta única de eventos — nunca `window.dataLayer.push` fora de `dataLayer.ts`
**Fonte:** `src/lib/analytics/dataLayer.ts`, linhas 1-14 e 51-55
**Aplicar em:** todos os pontos de emissão desta fase (`search`, `filter_applied`,
`view_item_list`); a regra ESLint `no-restricted-properties` e o teste-guarda já impedem violação
acidental.

### Content-type simples do Strapi (nome/slug/ordem) — boilerplate `factories`
**Fonte:** `cms/src/api/category/*` (schema + 3 arquivos de 3 linhas)
**Aplicar em:** `cms/src/api/tipo-de-evento/*`

### Ponte `Produto` → `ProdutoResumo`, nunca reimplementar no componente
**Fonte:** `src/lib/product/mapearParaProductCard.ts` (arquivo inteiro)
**Aplicar em:** `GradeDeProdutos.tsx` — chamar a função existente, não montar `ProdutoResumo` à mão.

---

## Sem Analog Encontrado

Arquivos sem correspondência próxima no código (o planner deve se apoiar no RESEARCH.md/UI-SPEC.md e
na documentação oficial das libs em vez de um analog interno):

| Arquivo | Papel | Fluxo de dados | Motivo |
|---|---|---|---|
| Drawer mobile de filtros (mecanismo Radix Dialog: foco preso, `Esc`, retorno de foco) | component | event-driven | `@radix-ui/react-dialog` está instalado mas **nunca foi usado** em `src/` — `MobileMenu.tsx` (citado como precedente no RESEARCH/UI-SPEC) usa CSS+Redux, não Radix. Ver seção "Achado crítico" no topo deste documento. |
| Acordeão do painel de filtros (mecanismo Radix Accordion, `type="multiple"`) | component | event-driven | `@radix-ui/react-accordion` também está instalado e nunca usado. Nenhum acordeão existe no projeto ainda. |
| `src/app/[locale]/catalogo/loading.tsx` | route | request-response | Nenhum `loading.tsx` existe em nenhuma rota do projeto — a Home é SSG e nunca teve estado de loading real (RESEARCH §2 confirma: "diferente da Home, onde o `<Suspense>` resolvia no prerender e o fallback nunca aparecia"). Este é o primeiro `loading.tsx` alcançável em produção. Usar `ProductCardSkeleton` (`src/components/feedback/Skeleton.tsx`, linhas 33-47) como bloco de composição, mas a estrutura do arquivo em si (grid de N skeletons) é nova. |
| Script de migração `aplicacoes` → `tiposDeEvento` (10 produtos) | utility/batch | batch | Nenhum script de migração de dados existe no repo. Provavelmente uma chamada pontual via Admin API do Strapi ou seed script — não é um padrão de código de produto, então não precisa seguir convenção de `src/`. |
| Teste e2e Playwright do fluxo de filtro (drawer, foco, chips↔URL) | test | event-driven | RESEARCH §6 confirma que o Chromium foi baixado na Fase 4, mas nenhum arquivo `.spec.ts`/diretório `e2e/`/`playwright.config.ts` foi encontrado no repo ainda — é a primeira suíte Playwright do projeto. Buscar por `playwright.config.*` no início do plano para confirmar se a config já existe fora do que foi varrido aqui. |
| Multi-seleção do `ColorSwatches` no painel de filtro (vs. seleção única no `ProductCard`) | component (variação) | transform | O primitivo atual só suporta uma cor selecionada por vez (`selecionada?: string`). Não há variante multi-select no design system ainda — decisão de implementação fica para o plano (variante nova vs. wrapper por fora). |

---

## Metadados

**Escopo de busca de analogs:** `src/app`, `src/components`, `src/lib`, `src/store`, `cms/src/api`
**Arquivos varridos (Read/Grep):** ~24
**Data da extração de padrões:** 2026-08-19
