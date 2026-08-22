# Fase 06: Categoria — Mapa de Padrões

**Mapeado em:** 2026-08-22
**Arquivos analisados:** 24 (novos/modificados)
**Analogs encontrados:** 19 / 24

---

## Achados críticos antes do mapa

### 1. `EstadoSemResultados.tsx` HOJE não aceita props — D-04 exige parametrização, não é trivial

O CONTEXT (D-04) e o UI-SPEC ("Estados da Grade — Contrato de Reuso") mandam "parametrizar o
componente existente, não duplicar". Lendo o componente real
(`src/components/catalogo/EstadoSemResultados.tsx`, 144 linhas), a interface hoje é:

```tsx
export interface EstadoSemResultadosProps {
  locale: Locale;
}
```

`eyebrow` (`"BUSCA SEM CORRESPONDÊNCIA"`), `titulo`, o texto de corpo
(`TEXTO_SEM_CORRESPONDENCIA`) e as 3 sugestões (`Remover todos os filtros` / `Ver painéis de
LED` / `Ver mesas de coquetel`) estão **hardcoded** dentro do arquivo — não são props. A Fase 6
precisa de: `eyebrow` = `"NENHUM ITEM COM ESSA COMBINAÇÃO"` (fixo, não `{{N}}`), corpo diferente,
e a UI-SPEC não pede as sugestões "Ver painéis de LED"/"Ver mesas de coquetel" na categoria (só
`Remover todos os filtros`). O plano precisa tratar isso como uma extensão real de props opcionais
com defaults apontando para os valores atuais do catálogo (mesmo padrão de `Header`/`Footer`
`logoSrc?: string = '...'`), **não** uma tarefa de "passar prop já existente".

### 2. Pitfall 1 do RESEARCH confirmado por leitura direta — `EmissorFiltroAplicado.tsx` duplica `Record<IdGrupoFiltro, ...>`

Confirmado (`src/components/analytics/EmissorFiltroAplicado.tsx`, linhas 26-35): o arquivo declara
sua própria cópia local de `CAMPO_POR_GRUPO` em vez de importar de `filtros.ts`. Assim que
`IdGrupoFiltro` ganhar o membro `'sub'` (D-10), este arquivo quebra `tsc` com "Property 'sub' is
missing" — mesmo sem a categoria importar `EmissorFiltroAplicado`. `grep -rn "Record<IdGrupoFiltro"
src/` só acha esta ocorrência (fora da própria declaração em `filtros.ts:284`, que é
`Partial<Record<...>>` e não quebra). **O plano precisa incluir, no mesmo commit que estende
`IdGrupoFiltro`, a correção deste arquivo** — a recomendação do RESEARCH (trocar a declaração local
por `import { CAMPO_POR_GRUPO } from '@/lib/catalogo/filtros'`) é a mais segura, porque
`CAMPO_POR_GRUPO` de `filtros.ts` não é exportado hoje (é `const` privada do módulo) — **precisa
virar `export`** como parte da tarefa.

### 3. `blocos.comparativo-led` (Dynamic Zone) já existe e é órfão — não confundir com o single type novo

`cms/src/components/blocos/comparativo-led.json` (14 linhas) e `blocoComparativoLed` em
`src/lib/cms/schemas.ts` (linhas 296-310) já existem desde a Fase 3, com um `tabela: json` livre.
D-08 rejeita explicitamente reusar isso. O plano NÃO deve tocar esses dois arquivos além de,
opcionalmente, documentar a substituição — criar o content-type novo `comparativo-led` como single
type é trabalho aditivo e paralelo, sem relação de código com o bloco antigo.

---

## Classificação de Arquivos

| Arquivo novo/modificado | Papel | Fluxo de dados | Analog mais próximo | Qualidade |
|---|---|---|---|---|
| `cms/src/api/subcategoria/content-types/subcategoria/schema.json` | model (Strapi content-type novo) | CRUD | `cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json` | exato |
| `cms/src/api/subcategoria/{controllers,routes,services}/subcategoria.ts` | model (boilerplate factories) | CRUD | `cms/src/api/tipo-de-evento/{controllers,routes,services}/tipo-de-evento.ts` | exato |
| `cms/src/api/comparativo-led/content-types/comparativo-led/schema.json` | model (Strapi single type novo) | CRUD | `cms/src/api/settings-globais/content-types/settings-globais/schema.json` | exato |
| `cms/src/api/comparativo-led/{controllers,routes,services}/comparativo-led.ts` | model (boilerplate factories) | CRUD | `cms/src/api/settings-globais/{controllers,routes,services}/settings-globais.ts` | exato |
| `cms/src/components/shared/aplicacao.json` | model (componente Strapi novo) | CRUD | `cms/src/components/shared/subcategoria.json` | exato |
| `cms/src/components/shared/linha-comparativo.json` | model (componente Strapi novo) | CRUD | `cms/src/components/shared/medida.json`/`caracteristica.json` (campos string simples, não lidos, mas mesma forma de `subcategoria.json`) | role-match |
| `cms/src/api/category/content-types/category/schema.json` (modificado) | model (schema existente) | CRUD | ele mesmo | exato — extensão aditiva + 1 troca de tipo |
| `cms/src/api/product/content-types/product/schema.json` (modificado) | model (schema existente) | CRUD | ele mesmo, campo `tiposDeEvento` (Fase 5) como molde da nova relação `subcategorias` | exato |
| `cms/src/components/shared/subcategoria.json` (REMOVER) | model (componente órfão) | — | n/a | remoção, não migração |
| `cms/src/index.ts` (modificado) | service (bootstrap idempotente) | batch/seed | ele mesmo (`garantirContagemSolicitacoes`, `PUBLIC_READ`, `seedEstrutura`) | exato |
| `src/app/api/revalidate/route.ts` (modificado) | route (webhook) | event-driven | ele mesmo (`MODELO_TAG`) | exato |
| `src/lib/cms/schemas.ts` (modificado) | model (Zod) | transform | ele mesmo (`tipoDeEventoSchema`, `categoriaSchema`) | exato |
| `src/lib/cms/adapters.ts` (modificado) | service (CMS adapter) | CRUD (query) | ele mesmo (`getTiposDeEvento`, `getCategoriaPorSlug`, `getProdutos`) | exato |
| `src/lib/catalogo/filtros.ts` (modificado, D-10) | utility (módulo puro de URL) | transform | ele mesmo | exato — generalização aditiva |
| `src/components/analytics/EmissorFiltroAplicado.tsx` (modificado, Pitfall 1) | component (emissor) | event-driven | ele mesmo | exato — precisa parar de duplicar `CAMPO_POR_GRUPO` |
| `src/app/[locale]/categoria/[slug]/page.tsx` | route (Server Component) | request-response (dinâmica, path param + `searchParams`) | `src/app/[locale]/catalogo/page.tsx` | role-match (path param extra) |
| `src/app/[locale]/categoria/[slug]/loading.tsx` | route (loading UI) | request-response | `src/app/[locale]/catalogo/loading.tsx` | exato (adaptar contagem de skeletons) |
| `src/app/[locale]/categoria/[slug]/error.tsx` | route (error boundary) | request-response | `src/app/[locale]/catalogo/error.tsx` | exato |
| `src/components/chrome/Breadcrumb.tsx` | component (chrome, novo) | CRUD (dado local, sem CMS) | `src/components/chrome/Footer.tsx`/`Header.tsx` (estilo de link sobre fundo escuro) | sem análogo de estrutura, exato de estilo |
| `src/components/catalogo/EstadoSemResultados.tsx` (modificado, D-04) | component (empty state) | CRUD (props) | ele mesmo | gap registrado — ver Achado crítico 1 |
| Componente novo "em preparação" (`EstadoEmPreparacao.tsx` ou nome equivalente) | component (empty state, novo) | CRUD | `src/components/feedback/EmptyState.tsx` | role-match |
| Componentes de conteúdo da categoria (hero, subcategorias numeradas, aplicações, FAQ — estrutura de arquivo discricionária) | component (Server, leitura de lista) | CRUD | `src/components/blocos/GradeDeCategoriasBloco.tsx` (grid+card) / `src/components/blocos/DestaqueLedBloco.tsx` (seção escura) | role-match |
| Filtros toggle da categoria (grupo `sub`/`ambiente`/`tipo`, botões `aria-pressed`) | component (client, event-driven) | event-driven (muda URL) | `src/components/catalogo/PainelDeFiltros.tsx` (mecanismo de URL) + `src/components/catalogo/SwatchesDeCor.tsx` (botão `aria-pressed` sem accordion) | parcial — mecanismo de URL igual, visual deliberadamente distinto (CATG-02) |
| Comparativo LED — régua + cartões P1.9/P3.9 + tabela 7 critérios (seção só em `telas-de-led`) | component (Server, condicional por slug) | CRUD | `src/components/blocos/DestaqueLedBloco.tsx` (seção escura + cartões pixel pitch "conteúdo de design") | role-match forte |
| FAQ da categoria (accordion exclusivo) | component (client, event-driven) | event-driven | `src/components/catalogo/PainelDeFiltros.tsx` (mecanismo Radix Accordion, mas `type="multiple"`) | parcial — trocar para `type="single" collapsible"` |
| Grade de produtos + estados (reuso) | component | CRUD | `src/components/catalogo/GradeDeProdutos.tsx` | exato — reuso direto, sem modificação |
| `src/lib/product/mapearParaProductCard.ts` (reuso) | utility | transform | ele mesmo | exato — reuso direto |
| `src/components/analytics/EmissorViewItemList.tsx` (reuso) | component (emissor) | event-driven | ele mesmo | exato — reuso direto |
| Script/rotina de upload das 5 imagens de hero (`projeto-base/uploads/` → Strapi) | utility/batch | file-I/O | nenhum script de upload de mídia existe no repo | sem análogo — ver "Sem Analog" |
| Testes (adapters, page, e2e) | test | request-response/CRUD | `src/lib/cms/adapters.test.ts`, `src/app/[locale]/catalogo/page.test.tsx` (não lidos nesta sessão, citados pelo padrão da Fase 5) | role-match |

---

## Atribuições de Padrão

### `cms/src/api/subcategoria/content-types/subcategoria/schema.json` (model, CRUD — content-type novo)

**Analog:** `cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json` (lido
integralmente) — é o segundo caso da mesma forma no projeto (taxonomia com `nome/slug/ordem` +
`manyToMany` com produto), copiar a estrutura quase literalmente:

```json
{
  "kind": "collectionType",
  "collectionName": "tipos_de_evento",
  "info": {
    "singularName": "tipo-de-evento",
    "pluralName": "tipo-de-eventos",
    "displayName": "Tipo de Evento",
    "description": "..."
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

**Diferenças reais para `subcategoria`** (não copiar cegamente):
1. Acrescentar `descricao: { "type": "text", ...i18n }` — a categoria precisa exibir descrição por
   subcategoria (fonte: `shared/subcategoria.json` atual, que tem `nome`+`descricao`).
2. Acrescentar a relação inversa `categoria: { "type": "relation", "relation": "manyToOne", "target": "api::category.category", "inversedBy": "subcategorias" }`
   — copiar a forma de `product.categoria` (ver abaixo), não a de `tiposDeEvento.produtos`.
3. `produtos` é `manyToMany`/`mappedBy: "subcategorias"` (plural, não singular) — decisão do
   RESEARCH confirmada pelo layout-fonte (um produto de serviço pertence a 3 subcategorias ao
   mesmo tempo).
4. `exibirNoFiltroDoCatalogo` **não** se aplica aqui — é específico de `tipo-de-evento`, não copiar.

**Relação inversa em `category.subcategorias`** (troca de `component` para `relation`, mesmo nome
de campo — molde exato já em produção em `category.produtos`, `schema.json` linhas 39-44):
```json
"produtos": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::product.product",
  "mappedBy": "categoria"
}
```
Aplicar o mesmo padrão a `subcategorias`:
```json
"subcategorias": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::subcategoria.subcategoria",
  "mappedBy": "categoria"
}
```

---

### `cms/src/api/subcategoria/{controllers,routes,services}/subcategoria.ts` (boilerplate)

**Analog:** os 3 arquivos equivalentes de `tipo-de-evento` (3 linhas cada, `factories.*`) —
copiar tal e qual, trocando o UID:
```ts
// controllers/subcategoria.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::subcategoria.subcategoria');

// routes/subcategoria.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::subcategoria.subcategoria');

// services/subcategoria.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::subcategoria.subcategoria');
```

---

### `cms/src/api/comparativo-led/content-types/comparativo-led/schema.json` (model, CRUD — single type novo)

**Analog:** `cms/src/api/settings-globais/content-types/settings-globais/schema.json` (lido
integralmente) — único outro single type do projeto, mesmo `draftAndPublish: false`:

```json
{
  "kind": "singleType",
  "collectionName": "settings_globais",
  "info": {
    "singularName": "settings-globais",
    "pluralName": "settings-globais-all",
    "displayName": "Settings Globais",
    "description": "..."
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": { /* ... campos ... */ }
}
```

**Aplicar a `comparativo-led`**, cobrindo só as 7 linhas da tabela (D-08 — régua/pixel-pitch/textos
institucionais ficam fixos no código):
```json
{
  "kind": "singleType",
  "collectionName": "comparativo_led",
  "info": {
    "singularName": "comparativo-led",
    "pluralName": "comparativo-led",
    "displayName": "Comparativo LED (P1.9 x P3.9)"
  },
  "options": { "draftAndPublish": false },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "linhas": {
      "type": "component",
      "repeatable": true,
      "component": "shared.linha-comparativo",
      "pluginOptions": { "i18n": { "localized": true } }
    }
  }
}
```
Nota de nomenclatura de `pluralName`: `settings-globais` usa `"settings-globais-all"` (não repete
o singular) — mas para `comparativo-led` repetir o singular (`"comparativo-led"`) é aceitável e
mais simples, já que não há ambiguidade de nome; não é um padrão travado.

---

### `cms/src/api/comparativo-led/{controllers,routes,services}/comparativo-led.ts` (boilerplate)

**Analog:** os 3 arquivos equivalentes de `settings-globais` (3 linhas cada) — copiar trocando o
UID, mesmo padrão de `subcategoria` acima.

---

### `cms/src/components/shared/aplicacao.json` (model, CRUD — componente novo)

**Analog:** `cms/src/components/shared/subcategoria.json` (arquivo inteiro, lido integralmente) —
espelhar linha a linha, só trocando nome/ícone:

```json
{
  "collectionName": "components_shared_subcategorias",
  "info": {
    "displayName": "Subcategoria",
    "icon": "bulletList",
    "description": "Subcategoria dentro de uma categoria."
  },
  "options": {},
  "attributes": {
    "nome": { "type": "string", "required": true },
    "descricao": { "type": "text" }
  }
}
```

**Aplicar em `aplicacao.json`** — mesma forma exata, `collectionName` novo:
```json
{
  "collectionName": "components_shared_aplicacoes",
  "info": { "displayName": "Aplicação", "icon": "bulletList" },
  "attributes": {
    "nome": { "type": "string", "required": true },
    "descricao": { "type": "text" }
  }
}
```
Em `category.schema.json`, acrescentar:
```json
"aplicacoes": {
  "type": "component",
  "repeatable": true,
  "component": "shared.aplicacao",
  "pluginOptions": { "i18n": { "localized": true } }
}
```
Sem relação, sem migração, sem entrada em `PUBLIC_READ`/`MODELO_TAG` — componente não é
content-type, herda a permissão de `category` (já pública).

---

### `cms/src/components/shared/linha-comparativo.json` (model, CRUD — componente novo)

**Sem análogo lido nesta sessão** entre os componentes `shared.*` de campos simples (`caracteristica`,
`medida` não foram lidos integralmente), mas a forma é trivial e seguro por inferência do padrão já
confirmado em `subcategoria.json`/`aplicacao.json` (campos `string`/`text` no topo, sem
aninhamento):
```json
{
  "collectionName": "components_shared_linhas_comparativo",
  "info": { "displayName": "Linha do Comparativo LED" },
  "attributes": {
    "criterio": { "type": "string", "required": true },
    "valorP19": { "type": "string", "required": true },
    "valorP39": { "type": "string", "required": true }
  }
}
```

---

### `cms/src/api/category/content-types/category/schema.json` (modificado)

**Analog:** ele mesmo (arquivo inteiro, 46 linhas, lido integralmente). Estado atual do campo a
trocar:
```json
"subcategorias": {
  "type": "component",
  "repeatable": true,
  "component": "shared.subcategoria",
  "pluginOptions": { "i18n": { "localized": true } }
},
```
**Trocar por** (mesmo nome de campo, tipo novo — seguro porque produção não tem dado aqui, D-07):
```json
"subcategorias": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::subcategoria.subcategoria",
  "mappedBy": "categoria"
}
```
**Acrescentar** (aditivo puro, sem tocar nada existente):
```json
"aplicacoes": {
  "type": "component",
  "repeatable": true,
  "component": "shared.aplicacao",
  "pluginOptions": { "i18n": { "localized": true } }
},
"emPreparacao": {
  "type": "boolean",
  "default": false,
  "pluginOptions": { "i18n": { "localized": false } }
}
```

---

### `cms/src/api/product/content-types/product/schema.json` (modificado — relação `subcategorias`)

**Analog:** o próprio arquivo, campo `tiposDeEvento` (linhas 106-111, lido integralmente) — mesma
forma exata, só troca de alvo e nome:
```json
"tiposDeEvento": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::tipo-de-evento.tipo-de-evento",
  "inversedBy": "produtos"
}
```
**Aplicar em `subcategorias`** (plural, `manyToMany` — não `manyToOne`, por causa do produto de
serviço com 3 subcategorias simultâneas no layout-fonte):
```json
"subcategorias": {
  "type": "relation",
  "relation": "manyToMany",
  "target": "api::subcategoria.subcategoria",
  "inversedBy": "produtos"
}
```

---

### `cms/src/components/shared/subcategoria.json` (REMOVER)

Sem análogo de "remoção segura" no repo — é a primeira vez que um componente Strapi é removido do
projeto. Seguir a recomendação do RESEARCH (Open Question 2): testar localmente
(`docker compose up` no `cms`) removendo o arquivo antes de assumir que é seguro; se o boot
reclamar, manter o arquivo sem uso em vez de forçar a remoção.

---

### `cms/src/index.ts` (modificado — 3 mudanças aditivas)

**Analog:** ele mesmo (389 linhas, lido integralmente) — três pontos de extensão já com molde
pronto no próprio arquivo.

**1. `PUBLIC_READ`** (linhas 12-22) — acrescentar duas entradas ao array, mesma forma das 8 já
existentes:
```ts
const PUBLIC_READ = [
  'settings-globais',
  'menu-item',
  'rodape-coluna',
  'page',
  'product',
  'category',
  'faq-item',
  'avaliacao',
  'tipo-de-evento',
  'subcategoria',
  'comparativo-led', // ver nota abaixo — comparativo-led é single type, sem findOne
];
```
`garantirPermissoesPublicas` (linhas 46-71) já trata `settings-globais` como exceção sem
`findOne` — replicar a mesma exceção para `comparativo-led` (ambos são single type):
```ts
if (name !== 'settings-globais' && name !== 'comparativo-led') acoes.push(`api::${name}.${name}.findOne`);
```

**2. Backfill idempotente de `emPreparacao`** — molde exato de `garantirContagemSolicitacoes`
(linhas 345-373, lido integralmente), adaptado de `integer` para `boolean`:
```ts
async function garantirEmPreparacao(strapi: Core.Strapi) {
  try {
    const categorias = await strapi.documents('api::category.category').findMany({
      locale: DEFAULT_LOCALE, status: 'draft', pagination: { pageSize: 100 },
    });
    let corrigidas = 0;
    for (const c of categorias) {
      if (c.emPreparacao !== null && c.emPreparacao !== undefined) continue;
      await strapi.documents('api::category.category').update({
        documentId: c.documentId, locale: DEFAULT_LOCALE, data: { emPreparacao: false },
      });
      await strapi.documents('api::category.category').publish({
        documentId: c.documentId, locale: DEFAULT_LOCALE,
      });
      corrigidas += 1;
    }
    strapi.log.info(`[seed] emPreparacao: ${corrigidas} categoria(s) inicializada(s)`);
  } catch (e) {
    strapi.log.error(`[seed] backfill emPreparacao falhou: ${(e as Error).stack ?? (e as Error).message}`);
  }
}
```
Registrar em `bootstrap()` (linha 384), na mesma lista sequencial de chamadas.

**3. Seed de conteúdo das 5 categorias (D-07)** — não existe molde de "seed com upload de mídia"
no arquivo hoje; `seedEstrutura` (linhas 73-240) só cria registros com campos de texto/relação, sem
`media`. Usar `seedEstrutura` como estrutura geral (`findFirst` por slug → `create` → `publish`,
idempotente), mas o upload das 5 imagens de `projeto-base/uploads/` é trabalho novo — ver "Sem
Analog" abaixo e a Open Question 1 do RESEARCH (decisão de planner: copiar as imagens para dentro
de `cms/` antes do build vs. passo manual documentado).

---

### `src/app/api/revalidate/route.ts` (modificado)

**Analog:** ele mesmo (47 linhas, lido integralmente) — `MODELO_TAG` (linhas 11-24) é um
`Record<string, string>` simples, acrescentar 2 entradas:
```ts
const MODELO_TAG: Record<string, string> = {
  'menu-item': 'cms:menu',
  'rodape-coluna': 'cms:rodape',
  'settings-globais': 'cms:settings',
  page: 'cms:pages',
  product: 'cms:products',
  category: 'cms:categories',
  'faq-item': 'cms:faq',
  avaliacao: 'cms:avaliacoes',
  'tipo-de-evento': 'tipos-de-evento',
  subcategoria: 'cms:subcategorias',
  'comparativo-led': 'cms:comparativo-led',
};
```
As chaves em `MODELO_TAG` precisam ser **exatamente** os mesmos valores usados em `TAG` de
`src/lib/cms/adapters.ts` (comentário do arquivo já avisa sobre a guarda de paridade de teste —
`'tipo-de-evento': 'tipos-de-evento'` é o exemplo real de uma tag sem prefixo `cms:` que já existe
e passa no teste).

---

### `src/lib/cms/schemas.ts` (modificado)

**Analog:** o próprio arquivo — 3 pontos de extensão, todos com molde já existente.

**1. `subcategoriaSchema` muda de componente embutido para entidade relacional** — molde exato:
`tipoDeEventoSchema` (linhas 115-125, lido integralmente):
```ts
export const tipoDeEventoSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  slug: z.string(),
  ordem: z.number().nullable().optional(),
  exibirNoFiltroDoCatalogo: z.boolean().nullable().optional(),
  locale: z.string().nullable().optional(),
});
export const tipoDeEventoColecao = colecao(tipoDeEventoSchema);
export type TipoDeEventoCms = z.infer<typeof tipoDeEventoSchema>;
```
**Aplicar em `subcategoriaSchema`** (troca a definição atual, linhas 86-89):
```ts
export const subcategoriaSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  slug: z.string(),
  descricao: z.string().nullable().optional(),
  ordem: z.number().nullable().optional(),
  locale: z.string().nullable().optional(),
});
export const subcategoriaColecao = colecao(subcategoriaSchema);
export type SubcategoriaCms = z.infer<typeof subcategoriaSchema>;
```
E em `categoriaSchema.subcategorias` (linha 165) — o tipo Zod não muda de forma (continua
`z.array(subcategoriaSchema).nullable().optional()`), só o shape interno de `subcategoriaSchema` já
mudou acima.

**2. `comparativoLedSchema`** — molde de "single type simples", análogo `settingsGlobaisSchema`
(linhas 53-65) adaptado para único campo repetível:
```ts
export const linhaComparativoSchema = z.object({
  criterio: z.string(),
  valorP19: z.string(),
  valorP39: z.string(),
});
export const comparativoLedSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  linhas: z.array(linhaComparativoSchema).nullable().optional(),
  locale: z.string().nullable().optional(),
});
export const comparativoLedUnico = unico(comparativoLedSchema);
export type ComparativoLedCms = z.infer<typeof comparativoLedSchema>;
```

**3. `produtoSchema.subcategorias` e `categoriaSchema.aplicacoes`/`emPreparacao`** — mesmo padrão
aditivo/opcional já usado para `categoria`/`tiposDeEvento` em `produtoSchema` (linhas 148-153,
lido integralmente):
```ts
// já existe, mesmo padrão a seguir:
tiposDeEvento: z.array(z.object({ nome: z.string(), slug: z.string() })).nullable().optional(),
// novo, análogo:
subcategorias: z.array(z.object({ nome: z.string(), slug: z.string() })).nullable().optional(),
```
Em `categoriaSchema` (linhas 159-171):
```ts
aplicacoes: z.array(z.object({ nome: z.string(), descricao: z.string().nullable().optional() })).nullable().optional(),
emPreparacao: z.boolean().nullable().optional(),
```

---

### `src/lib/cms/adapters.ts` (modificado — 4 pontos)

**Analog:** o próprio arquivo (680 linhas, lido integralmente) — os quatro pontos abaixo têm molde
exato já existente na função vizinha.

**1. `getSubcategorias`** — molde `getTiposDeEvento` (linhas 412-419):
```ts
export async function getTiposDeEvento(locale: Locale): Promise<TipoDeEvento[]> {
  const res = await fetchStrapi('tipo-de-eventos', tipoDeEventoColecao, {
    params: { locale, 'sort[0]': 'ordem:asc', 'pagination[pageSize]': 100 },
    tags: [TAG.tiposDeEvento],
  });
  return res.data.map(adaptarTipoDeEvento);
}
```
Aplicar o mesmo padrão para `subcategoria`, filtrando por categoria quando a página de categoria
precisar só das subcategorias daquela categoria (`filters[categoria][slug][$eq]`).

**2. `getComparativoLed`** — molde `getSettingsGlobais` (linhas 131-159, único outro single type),
inclusive o tratamento do 404 do Strapi como "não publicado" (não erro):
```ts
export async function getSettingsGlobais(locale: Locale): Promise<SettingsGlobais | null> {
  let res;
  try {
    res = await fetchStrapi('settings-globais', settingsGlobaisUnico, {
      params: { locale, populate: 'imagemOG' },
      tags: [TAG.settings],
    });
  } catch (erro) {
    if (erro instanceof Error && /Strapi 404 em settings-globais/.test(erro.message)) return null;
    throw erro;
  }
  const s = res.data;
  if (!s) return null;
  return { /* ... */ };
}
```
Aplicar o mesmo padrão try/catch de 404-como-null em `getComparativoLed`, trocando o endpoint e a
regex de mensagem de erro para `comparativo-led`.

**3. `getProdutos` — novo filtro `subcategorias`** — molde exato `tiposDeEvento` (linhas 351-356,
lido integralmente):
```ts
if (filtro.tiposDeEvento?.length) {
  filtro.tiposDeEvento.forEach((slug, j) => {
    params[`filters[$and][${i}][tiposDeEvento][slug][$in][${j}]`] = slug;
  });
  i += 1;
}
```
Aplicar idêntico para `subcategorias` (novo campo em `FiltroProdutos`, interface linhas 282-300):
```ts
if (filtro.subcategorias?.length) {
  filtro.subcategorias.forEach((slug, j) => {
    params[`filters[$and][${i}][subcategorias][slug][$in][${j}]`] = slug;
  });
  i += 1;
}
```
`POPULATE_PRODUTO_LISTA` (linha 262, hoje `'imagens,variacoes,categoria,tiposDeEvento'`) precisa
crescer para incluir `subcategorias`.

**4. `Categoria`/`adaptarCategoria`/`getCategoriaPorSlug`** — a interface `Categoria` (linhas
459-469) e `adaptarCategoria` (linhas 471-486) precisam de `aplicacoes` e `emPreparacao`, no mesmo
padrão de campo opcional com fallback (`c.descricao ?? null`, `c.ordem ?? 0`) já usado ali:
```ts
aplicacoes: (c.aplicacoes ?? []).map((a) => ({ nome: a.nome, descricao: a.descricao ?? null })),
emPreparacao: c.emPreparacao ?? false,
```
**Nota do RESEARCH (Open Question 3), decisão recomendada:** `getCategoriaPorSlug` (linhas
503-515) hoje popula `produtos,produtos.imagens` na mesma consulta — trocar para não popular
`produtos` (só metadados) e usar `getProdutos(locale, { categoria: slug, ...eixos, porPagina: 100
})` para a grade, consistente com o Architecture Pattern do RESEARCH (uma chamada sem filtro de
eixo para D-01, uma chamada com filtro quando ativo).

---

### `src/lib/catalogo/filtros.ts` (modificado — generalização aditiva, D-10)

**Analog:** o próprio arquivo (308 linhas, lido integralmente). Seguir o passo a passo do RESEARCH
(Pattern 1), todos os pontos de extensão já identificados no código real:

**1. `IdGrupoFiltro`** (linha 21) — adicionar membro:
```ts
export type IdGrupoFiltro = 'categoria' | 'tipo' | 'cor' | 'evento' | 'ambiente' | 'sub';
```

**2. `CAMPO_POR_GRUPO`** (linhas 135-144) — **precisa virar `export`** (hoje é privado do módulo;
`EmissorFiltroAplicado.tsx` duplica em vez de importar — ver Achado crítico 2) e ganhar a chave
nova:
```ts
export const CAMPO_POR_GRUPO: Record<
  IdGrupoFiltro,
  'categorias' | 'tiposDeItem' | 'cores' | 'tiposDeEvento' | 'ambientes' | 'subcategorias'
> = {
  categoria: 'categorias',
  tipo: 'tiposDeItem',
  cor: 'cores',
  evento: 'tiposDeEvento',
  ambiente: 'ambientes',
  sub: 'subcategorias',
};
```

**3. `FiltroCatalogo`** (linhas 112-120) — adicionar campo, nunca remover os existentes:
```ts
export interface FiltroCatalogo {
  q: string | null;
  categorias: string[];
  tiposDeItem: string[];
  cores: string[];
  tiposDeEvento: string[];
  ambientes: string[];
  subcategorias: string[];
  ordenar: ChaveDeOrdenacao | null;
}
```
E em `filtroVazio()` (linhas 122-132), acrescentar `subcategorias: []`.

**4. `CHAVES_ACEITAS`** (linha 146) e `parseFiltrosDaUrl` (linhas 184-232) — adicionar `'sub'` ao
array e um `case 'sub':` no switch, mesmo molde do `case 'evento':` (linhas 213-217):
```ts
case 'sub':
  filtro.subcategorias = dedup(
    valoresBrutos.filter((v) => allowlists.subcategorias.includes(v)),
  );
  break;
```

**5. `AllowlistDinamica`** (linhas 168-172) — adicionar `subcategorias: string[]`.

**6. `GRUPOS_DE_FILTRO`** (linhas 47-90) — **permanece intocado**, conforme o RESEARCH: o
catálogo não ganha o grupo `sub` nesta fase. A categoria monta seu próprio array de
`GrupoDeFiltro[]` (3 grupos) fora deste arquivo, reaproveitando as opções fixas de `tipo` e
`ambiente` já declaradas aqui (ex.: `GRUPOS_DE_FILTRO.find((g) => g.id === 'ambiente')`).

**7. `serializarFiltros`/`descreverChips`** (linhas 239-247, 282-297) — adicionar parâmetro
`grupos: GrupoDeFiltro[] = GRUPOS_DE_FILTRO`, com o **default apontando para a constante atual** —
nenhum call site existente precisa mudar. A categoria passa seu array de 3 grupos explicitamente.

**8. `contarFiltrosAtivos`** (linhas 300-308) — somar `filtro.subcategorias.length`:
```ts
export function contarFiltrosAtivos(filtro: FiltroCatalogo): number {
  return (
    filtro.categorias.length +
    filtro.tiposDeItem.length +
    filtro.cores.length +
    filtro.tiposDeEvento.length +
    filtro.ambientes.length +
    filtro.subcategorias.length
  );
}
```

**Regra a preservar:** `alternarValor` (linhas 255-266) já opera sobre `URLSearchParams`/
`IdGrupoFiltro` genéricos — não precisa de nenhuma mudança de corpo, só se beneficia do union
ampliado.

---

### `src/components/analytics/EmissorFiltroAplicado.tsx` (modificado — corrigir o Pitfall 1)

**Analog:** ele mesmo (72 linhas, lido integralmente). Trecho a **remover**:
```ts
const CAMPO_POR_GRUPO: Record<
  IdGrupoFiltro,
  'categorias' | 'tiposDeItem' | 'cores' | 'tiposDeEvento' | 'ambientes'
> = {
  categoria: 'categorias',
  tipo: 'tiposDeItem',
  cor: 'cores',
  evento: 'tiposDeEvento',
  ambiente: 'ambientes',
};
```
**Trocar por import** (exige que `filtros.ts` exporte `CAMPO_POR_GRUPO`, ver acima):
```ts
import { type FiltroCatalogo, type IdGrupoFiltro, CAMPO_POR_GRUPO } from '@/lib/catalogo/filtros';
```
O resto do arquivo (`GRUPOS`, `conjuntosPorGrupo`, `useEffect` de diff) não muda — já itera sobre
`Object.keys(CAMPO_POR_GRUPO)`, então herda `'sub'` automaticamente sem nenhuma outra edição.

---

### `src/app/[locale]/categoria/[slug]/page.tsx` (route, request-response dinâmica)

**Analog:** `src/app/[locale]/catalogo/page.tsx` (159 linhas, lido integralmente) — mesma família
de rota dinâmica (searchParams é `Promise`), com um path param a mais (`slug`).

**Guard de locale + params/searchParams como Promise** (page.tsx linhas 48-59) — copiar
literalmente, acrescentando `slug`:
```tsx
export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const localeTipado: Locale = locale;
  const sp = await searchParams;

  const categoria = await getCategoriaPorSlug(localeTipado, slug);
  if (!categoria) notFound();
  // ...
}
```

**Padrão de allowlist resolvida no servidor antes do parse** (page.tsx linhas 65-91) — mesma
lógica, trocando as 3 allowlists do catálogo pelas 3 desta fase (`subcategorias` da própria
categoria, `ambiente` e `tipo` fixos de `GRUPOS_DE_FILTRO`):
```tsx
const subcategorias = await getSubcategorias(localeTipado, slug);
const filtro = parseFiltrosDaUrl(sp, {
  categorias: [], // não usado nesta rota
  tiposDeEvento: [], // não usado nesta rota
  cores: [], // não usado nesta rota
  subcategorias: subcategorias.map((s) => s.slug),
});
```
(A allowlist de `parseFiltrosDaUrl` precisa aceitar objeto parcial ou os 3 campos legados vazios —
decisão de assinatura do plano; o RESEARCH não resolveu isso explicitamente.)

**Dupla consulta unfiltered/filtered (Architecture Pattern do RESEARCH, §Diagrama)** — sem análogo
direto no catálogo (que só faz uma chamada), mas reaproveita a MESMA função `getProdutos`:
```tsx
const todosDaCategoria = await getProdutos(localeTipado, { categoria: slug, porPagina: 100 });
const algumFiltroAtivo = contarFiltrosAtivos(filtro) > 0;
const produtosFiltrados = algumFiltroAtivo
  ? await getProdutos(localeTipado, {
      categoria: slug,
      subcategorias: filtro.subcategorias,
      tiposDeItem: filtro.tiposDeItem,
      ambientes: filtro.ambientes,
      porPagina: 100,
    })
  : todosDaCategoria;
```

**Erro real sobe para `error.tsx`, nunca capturado aqui** — mesma nota do catálogo (page.tsx
linhas 93-96): não envolver `getProdutos`/`getCategoriaPorSlug` em `try/catch` que devolveria grade
vazia.

**Nenhum `generateStaticParams`/`export const dynamic`/`revalidate`** — mesma nota do catálogo
(page.tsx linhas 26-37): o acesso a `searchParams` já basta.

---

### `src/app/[locale]/categoria/[slug]/loading.tsx` (route, loading UI)

**Analog:** `src/app/[locale]/catalogo/loading.tsx` (60 linhas, lido integralmente) — copiar quase
literalmente, é o primeiro (e único) `loading.tsx` do projeto:
```tsx
'use client';
import styled from 'styled-components';
import { ProductCardSkeleton } from '@/components/feedback/Skeleton';
import { Container } from '@/components/primitives/Container';

const GradeDeEsqueletos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const INDICES = [0, 1, 2, 3, 4, 5];

export default function CarregandoCategoria() {
  return (
    <Container>
      <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        CARREGANDO CATEGORIA
      </p>
      <GradeDeEsqueletos aria-busy="true">
        {INDICES.map((indice) => (
          <ProductCardSkeleton key={indice} indice={indice} />
        ))}
      </GradeDeEsqueletos>
    </Container>
  );
}
```
Diferença: o skeleton da categoria só precisa cobrir a seção `#produtos` (a UI-SPEC não pede
skeleton de hero/subcategorias/FAQ) — menos itens que o catálogo é aceitável.

---

### `src/app/[locale]/categoria/[slug]/error.tsx` (route, error boundary)

**Analog:** `src/app/[locale]/catalogo/error.tsx` (46 linhas, lido integralmente) — copiar
literalmente, só a mensagem muda (per UI-SPEC, linha "Error state"):
```tsx
'use client';
import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';
import { Button } from '@/components/primitives/Button';

const Envolucro = styled.div`
  padding-block: clamp(64px, 9vw, 144px);
`;

export default function ErroDaCategoria({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Envolucro>
      <Container>
        <Notice rotulo="ERRO" variante="escuro">
          Não foi possível carregar esta categoria agora.
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
UI-SPEC (linha 131) já registra a pendência: "confirmar com o planner se deve herdar literalmente o
`error.tsx` do catálogo" — a resposta deste documento é sim, com só a string trocada.

---

### `src/components/chrome/Breadcrumb.tsx` (component, novo)

**Sem análogo de estrutura** — é o primeiro breadcrumb do projeto (confirmado: nenhum resultado
para busca de "breadcrumb"/"Trilha" em `src/components`). Usar a especificação já fechada no
UI-SPEC (Contrato 5), mas herdar o **estilo de link sobre fundo escuro** de `Footer.tsx`/
`Header.tsx` (ambos lidos integralmente):

**Padrão de link mono sobre `tinta900` com hover em teal** (molde de `Header.tsx`, `NavLink`,
linhas 62-70):
```tsx
const NavLink = styled.a<{ $ativo?: boolean }>`
  color: ${({ theme, $ativo }) => ($ativo ? theme.cor.fundo : theme.cor.navInativo)};
  &:hover {
    color: ${({ theme }) => theme.cor.fundo};
    border-bottom-color: ${({ theme }) => theme.cor.teal};
  }
`;
```
A UI-SPEC pede cores diferentes (`textoMutedClaro` inativo, `teal` hover, `fundo` item atual) —
usar os tokens exatos do UI-SPEC, não os de `NavLink` (`navInativo` é outro token, não confundir).

**Alvo de toque 44px com texto pequeno** — mesmo padrão de `IconeBotao`/`CartLink` em `Header.tsx`
(linhas 139-153, 169-181): `min-height: 44px` no elemento clicável mesmo quando o conteúdo visual é
menor, via `display:inline-flex; align-items:center`.

**Local recomendado:** `src/components/chrome/Breadcrumb.tsx` — ao lado de `Header`/`Footer`,
conforme já registrado no UI-SPEC (linhas 279-283), porque a Fase 7 (Produto) também vai
consumi-lo.

---

### Filtros toggle da categoria (component novo, client, event-driven)

**Analog de mecanismo de URL:** `src/components/catalogo/PainelDeFiltros.tsx` (200 linhas, lido
integralmente) — reusar exatamente o padrão `useSearchParams` + `alternarValor` +
`useTransition` + `router.push`:
```tsx
const searchParams = useSearchParams();
const router = useRouter();
const [, iniciarTransicao] = useTransition();

function aoAlternar(chave: IdGrupoFiltro, valor: string) {
  const novosParams = alternarValor(searchParams, chave, valor);
  iniciarTransicao(() => {
    router.push(`?${novosParams.toString()}`);
  });
}
```

**Analog de visual "botão `aria-pressed`, sem accordion":** `src/components/catalogo/
SwatchesDeCor.tsx` (99 linhas, lido integralmente) já é o único componente do projeto que
usa botão `aria-pressed` fora de checkbox+accordion:
```tsx
<Swatch
  type="button"
  $selecionado={selecionado}
  aria-pressed={selecionado}
  onClick={() => onAlternar(cor)}
/>
```
A UI-SPEC (Contrato 3) prescreve exatamente essa mecânica para os toggles da categoria, mas com
estilo de retângulo (não círculo de cor) e cores diferentes (off: borda `theme.cor.borda` + fundo
branco; on: fundo `tinta900` — **nunca `teal`**, ver Color do UI-SPEC). Não copiar o CSS de
`Swatch`, só o padrão `aria-pressed`+`onClick` sem Radix/accordion.

**Diferença deliberada de `PainelDeFiltros`:** nada de `Accordion.Root`/`Accordion.Item` — todos
os grupos ficam sempre visíveis (`flex-wrap: wrap`), conforme CATG-02 exige contraste de padrão com
o catálogo.

---

### Estado "em preparação" (component novo, Server)

**Analog:** `src/components/feedback/EmptyState.tsx` (não lido integralmente nesta sessão, mas
citado e usado por `EstadoSemResultados.tsx` como wrapper — `<EmptyState eyebrow titulo texto>`).
Mesmo contêiner visual do estado "sem resultado" (D-04/UI-SPEC "Contrato 6": "o mesmo contêiner
visual, só o texto interno muda"), mas copy 100% fixa no código (D-03 — não aceita props de
categoria para o texto, só `subs.length` para o `{{N}}` do eyebrow):
```tsx
<EmptyState
  eyebrow={`${subcategoriasCount} SUBCATEGORIAS MAPEADAS · CADASTRO EM ANDAMENTO`}
  titulo="Os itens desta categoria ainda não estão publicados"
  texto="Já trabalhamos com os equipamentos listados acima. Enquanto o cadastro é concluído, descreva o que seu evento precisa e a equipe responde com o que temos disponível na data."
>
  {/* dois botões: SOLICITAR ORÇAMENTO (inerte) + VER TODO O CATÁLOGO */}
</EmptyState>
```
Este é um componente NOVO (não uma extensão de `EstadoSemResultados`) — D-03 e a UI-SPEC deixam
claro que "em preparação" e "sem resultado" são estados semanticamente distintos que só
compartilham o invólucro visual.

---

### `src/components/catalogo/EstadoSemResultados.tsx` (modificado — parametrização D-04)

**Analog:** ele mesmo (144 linhas, lido integralmente) — ver Achado crítico 1 para o gap real.
Estender a interface com props opcionais e defaults apontando para os textos atuais do catálogo
(mesmo padrão `logoSrc = '/uploads/logo-amr.png'` de `Footer.tsx`/`Header.tsx`):
```tsx
export interface EstadoSemResultadosProps {
  locale: Locale;
  eyebrow?: string; // default: 'BUSCA SEM CORRESPONDÊNCIA'
  texto?: string; // default: TEXTO_SEM_CORRESPONDENCIA
  mostrarSugestoesDeCategoria?: boolean; // default: true — false na categoria (sem "Ver painéis de LED"/"Ver mesas de coquetel")
}
```
`titulo` ("Amplie a busca ou fale com a equipe") **não muda** — UI-SPEC confirma que a categoria
reusa o mesmo título literal. `removerTodosOsFiltros` (linhas 87-96) já preserva `q`/`ordenar` —
mesma regra vale para a categoria sem nenhuma mudança de lógica.

---

### Comparativo LED — régua, cartões P1.9/P3.9, tabela (component novo, Server, condicional por slug)

**Analog mais forte:** `src/components/blocos/DestaqueLedBloco.tsx` (298 linhas, lido
integralmente) — é a ÚNICA seção do projeto que já trata pixel pitch como "conteúdo de design, não
do CMS" (comentário linha 108-109), exatamente o precedente que D-08 cita:
```tsx
/* Conteúdo de design, não do CMS: `blocos.destaque-led` não tem campo de pixel pitch no schema
   (confirmado em `src/lib/cms/schemas.ts`). Os dois valores são fixos, como no layout-fonte. */
const PIXEL_PITCH = [
  { valor: 'P1.9', legenda: 'Painéis P1.9mm' },
  { valor: 'P3.9', legenda: 'Painéis P3.9mm' },
] as const;
```
Aplicar o MESMO padrão para os cartões P1.9/P3.9 do comparativo (constante fixa no componente, não
vinda do single type `comparativo-led`, que só cobre as 7 linhas da tabela).

**Padrão de cartão sobre fundo escuro com borda `teal`** (`CardPixelPitch`, linhas 71-76):
```tsx
const CardPixelPitch = styled.div`
  border: 1px solid ${({ theme }) => theme.cor.teal};
  background: ${({ theme }) => theme.cor.tinta800};
  padding: 20px;
  border-radius: ${({ theme }) => theme.raio.base};
`;
```
Reusar para o cartão "P1.9 · DENSIDADE DE PONTOS ALTA" (o card P3.9 não leva borda teal, per
UI-SPEC — só P1.9 é accent).

**Padrão de seção escura com `SectionDivider`** (linhas 200-201, 295):
```tsx
<Secao>
  <SectionDivider />
  <Wrapper>{/* ... */}</Wrapper>
  <SectionDivider />
</Secao>
```

**Tabela 7 critérios — grid `auto-fit` por linha (UI-SPEC Contrato 2):** sem análogo de "tabela
como grid", mas o mecanismo `auto-fit`/`minmax` já é o mesmo de `GradeDeCategoriasBloco.tsx`
(`GradePadrao`, linhas 110-114) e `GradeDeProdutos.tsx` (`Grade`, linhas 29-33) — aplicar por linha
(3 células), não à tabela inteira:
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
gap: 16px;
```

---

### FAQ da categoria (component novo, client, event-driven — accordion exclusivo)

**Analog de mecanismo Radix:** `src/components/catalogo/PainelDeFiltros.tsx` (200 linhas, lido
integralmente) — é o único consumidor de `@radix-ui/react-accordion` no projeto, mas usa
`type="multiple"`. A UI-SPEC exige exclusivo (`type="single" collapsible`):
```tsx
<Root type="single" collapsible defaultValue={undefined}>
  {itens.map((item) => (
    <Item key={item.id} value={String(item.id)}>
      <Accordion.Header>
        <Trigger>{item.pergunta}<span className="indicador" aria-hidden="true">▾</span></Trigger>
      </Accordion.Header>
      <Content>{/* item.respostaHtml, já HtmlSeguro */}</Content>
    </Item>
  ))}
</Root>
```
Reusar o CSS de `Trigger`/`Content`/`Item` de `PainelDeFiltros.tsx` (linhas 43-86) como ponto de
partida — a única mudança estrutural é a prop `type`/`collapsible` do `Accordion.Root`, não o
estilo.

**Fonte de dados:** `getFaq(locale, { categoria: slug })` já existe e funciona
(`src/lib/cms/adapters.ts`, linhas 536-550, lido integralmente) — nenhuma mudança de adapter
necessária para o FAQ (D-06 confirma que o modelo já está pronto).

---

### Grade de produtos, `mapearParaProductCard`, `EmissorViewItemList` (reuso direto, sem modificação)

**Reuso literal**, mesma forma de `src/components/catalogo/GradeDeProdutos.tsx` (63 linhas, lido
integralmente) — nenhuma mudança de assinatura necessária, a categoria só precisa dos mesmos 2
props (`produtos`, `locale`):
```tsx
<GradeDeProdutos produtos={produtosFiltrados} locale={localeTipado} />
```
O componente já emite `view_item_list` sozinho (via `EmissorViewItemList` interno) — a categoria
não precisa montar um emissor próprio, só passar `produtos` corretos.

---

## Padrões Compartilhados

### Guard de locale + `searchParams` como `Promise` em rota do App Router
**Fonte:** `src/app/[locale]/catalogo/page.tsx`, linhas 48-59
**Aplicar em:** `categoria/[slug]/page.tsx`, com `slug` adicionado a `params`.

### Content-type novo do Strapi (taxonomia nome/slug/ordem + N:N) — copiar, não desenhar
**Fonte:** `cms/src/api/tipo-de-evento/*` (schema + 3 arquivos de boilerplate)
**Aplicar em:** `cms/src/api/subcategoria/*`

### Single type do Strapi (`draftAndPublish: false`, sem `findOne` em `PUBLIC_READ`)
**Fonte:** `cms/src/api/settings-globais/*`, `cms/src/index.ts` linha 55
**Aplicar em:** `cms/src/api/comparativo-led/*`, e a exceção em `garantirPermissoesPublicas`

### Backfill idempotente de campo novo em registro já existente
**Fonte:** `cms/src/index.ts`, `garantirContagemSolicitacoes` (linhas 345-373)
**Aplicar em:** `garantirEmPreparacao` (novo) — `"default"` no schema.json não faz backfill,
lição já documentada em `STATE.md`.

### Filtro de relação manyToMany por slug (`$and`/`$in`) — sintaxe testada em produção
**Fonte:** `src/lib/cms/adapters.ts`, `getProdutos`, filtro `tiposDeEvento` (linhas 351-356)
**Aplicar em:** novo filtro `subcategorias` no mesmo `getProdutos`

### Generalização aditiva de módulo com cobertura de teste extensa — nunca reescrever assinatura
**Fonte:** `src/lib/catalogo/filtros.ts` (308 linhas) + os 58 testes e2e do catálogo
**Aplicar em:** D-10 — todo ponto de extensão listado acima é ADIÇÃO (novo membro de union, novo
campo opcional com default), nunca remoção/renomeação de campo existente.

### `'use client'` obrigatório em qualquer componente com `styled-components`
**Fonte:** repetido em `GradeDeCategoriasBloco.tsx`, `DestaqueLedBloco.tsx`, `PainelDeFiltros.tsx`
**Aplicar em:** Breadcrumb, toggles de filtro, régua LED, FAQ accordion — todos leem `theme` via
Context.

### Grid fluido sem `@media` nova — `auto-fit`/`minmax`
**Fonte:** `src/components/blocos/GradeDeCategoriasBloco.tsx` linhas 110-114,
`src/components/catalogo/GradeDeProdutos.tsx` linhas 29-33
**Aplicar em:** subcategorias numeradas, linhas da tabela comparativa (por linha, não na tabela
inteira), grade de produtos (reuso direto).

### Pixel pitch / conteúdo de design fixo no componente, não no CMS
**Fonte:** `src/components/blocos/DestaqueLedBloco.tsx`, linhas 108-113 (comentário + constante
`PIXEL_PITCH`)
**Aplicar em:** cartões P1.9/P3.9 e posição da régua do comparativo (D-08 — só as 7 linhas da
tabela vêm do CMS).

### Emissão de evento client-side "uma vez por montagem" via `useRef`
**Fonte:** `src/components/analytics/EmissorViewItemList.tsx`, linhas 16-33
**Aplicar em:** reuso direto (nenhum emissor novo necessário — `GradeDeProdutos` já emite).

### Porta única de eventos — nunca `window.dataLayer.push` fora de `dataLayer.ts`
**Fonte:** `src/lib/analytics/dataLayer.ts`, linhas 22-51 (`ItemDeListaGA4`, `EventoDataLayer`)
**Aplicar em:** nenhum evento novo é necessário nesta fase — `filter_applied`/`view_item_list` já
cobrem os toggles e a grade, desde que `EmissorFiltroAplicado` seja corrigido (Achado crítico 2).

### Prop com fallback estático (extensão aditiva de componente existente)
**Fonte:** `src/components/chrome/Footer.tsx`, linhas 124-134 (`FooterProps`)
**Aplicar em:** `EstadoSemResultados.tsx` (D-04) — `eyebrow?`/`texto?`/
`mostrarSugestoesDeCategoria?` com defaults = valores atuais do catálogo.

---

## Sem Analog Encontrado

| Arquivo | Papel | Fluxo de dados | Motivo |
|---|---|---|---|
| Script/rotina de upload das 5 imagens de hero (`projeto-base/uploads/` → Strapi) | utility/batch | file-I/O | Nenhum upload de mídia binária existe no `bootstrap()` hoje — todo seed existente (`seedEstrutura`) só grava campos de texto/relação. Pitfall 3 do RESEARCH: as imagens no repo git **não** chegam ao volume de produção sem uma chamada de upload real. Decisão de mecanismo (bootstrap com upload via API do plugin `upload` vs. passo manual documentado) é a Open Question 1 do RESEARCH, não resolvida aqui. |
| `src/components/chrome/Breadcrumb.tsx` (estrutura semântica `<nav><ol>` com `aria-current`) | component | CRUD | Primeiro breadcrumb do projeto — nenhum `<nav aria-label="Trilha`/`aria-current="page"` existe em `src/components` hoje. O UI-SPEC (Contrato 5) já resolve a especificação completa; o estilo de link é o único ponto com análogo real (`Header`/`Footer`). |
| FAQ accordion exclusivo (`type="single" collapsible"`) | component | event-driven | Nenhum componente de FAQ existe no projeto (`find -iname "*faq*"` em `src/` não retorna nada) — só o mecanismo Radix (`type="multiple"` de `PainelDeFiltros`) é reaproveitável, a exclusividade é nova. |
| Filtros toggle sem accordion (`aria-pressed`, sempre visíveis, `flex-wrap`) | component | event-driven | Nenhum grupo de filtro do projeto hoje é renderizado fora de um `Accordion.Item` — CATG-02 exige explicitamente esse contraste de padrão com o catálogo. O mecanismo de URL (`alternarValor`) é 100% reusado; só a apresentação (sem Radix Accordion) é nova. |
| Grid de subcategorias numeradas com `gap: 1px` + `background: borda` (efeito de linha divisória) | component | CRUD | Técnica citada no UI-SPEC como "já usada no layout-fonte", mas nenhum componente atual do design system usa esse truque de grid+background para simular divisórias finas — é padrão novo para o código React, mesmo que a ideia visual já exista no HTML-fonte. |
| Comparativo LED — régua acessível `role="img"` com marcadores `aria-hidden` | component | CRUD | Nenhum componente do projeto usa `role="img"` em um grupo de `div`s decorativos com dado numérico real ao lado — é a primeira "régua" do design system. UI-SPEC (Contrato 1) já resolve a especificação de acessibilidade completa. |
| Testes novos (`categoria/page.test.tsx`, e2e do fluxo de filtro/estado da categoria) | test | request-response/event-driven | Não lidos nesta sessão (fora do escopo de leitura orçado), mas o padrão análogo é `src/app/[locale]/catalogo/page.test.tsx` e a suíte e2e do catálogo (58 testes verdes, citada em D-10) — seguir a mesma estrutura de fixture e mock de `dataLayer`. |

---

## Metadados

**Escopo de busca de analogs:** `cms/src/api`, `cms/src/components`, `cms/src/index.ts`,
`src/app`, `src/components`, `src/lib/cms`, `src/lib/catalogo`, `src/lib/analytics`,
`src/lib/product`
**Arquivos lidos integralmente nesta sessão:** `cms/src/api/category/content-types/category/schema.json`,
`cms/src/api/product/content-types/product/schema.json`,
`cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json`,
`cms/src/api/faq-item/content-types/faq-item/schema.json`,
`cms/src/components/shared/subcategoria.json`,
`cms/src/api/settings-globais/*` (4 arquivos),
`cms/src/components/blocos/comparativo-led.json`, `cms/src/index.ts`,
`src/app/api/revalidate/route.ts`, `src/lib/catalogo/filtros.ts`, `src/lib/cms/adapters.ts`,
`src/lib/cms/schemas.ts`, `src/components/catalogo/EstadoSemResultados.tsx`,
`src/app/[locale]/catalogo/page.tsx`, `src/app/[locale]/catalogo/error.tsx`,
`src/app/[locale]/catalogo/loading.tsx`, `src/components/chrome/Header.tsx`,
`src/components/chrome/Footer.tsx`, `src/components/primitives/Chip.tsx`,
`src/components/catalogo/SwatchesDeCor.tsx`, `src/components/analytics/EmissorViewItemList.tsx`,
`src/components/analytics/EmissorFiltroAplicado.tsx`,
`src/components/blocos/GradeDeCategoriasBloco.tsx`, `src/components/blocos/DestaqueLedBloco.tsx`,
`src/lib/product/mapearParaProductCard.ts`, `src/lib/analytics/dataLayer.ts`,
`src/components/catalogo/PainelDeFiltros.tsx`, `src/components/catalogo/ToolbarDoCatalogo.tsx`,
`src/components/catalogo/GradeDeProdutos.tsx`.
**Data da extração de padrões:** 2026-08-22
