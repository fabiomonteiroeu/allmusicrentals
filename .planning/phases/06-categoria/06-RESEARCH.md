# Phase 6: Categoria - Research

**Researched:** 2026-08-22
**Domain:** Strapi 5 content modeling (relação nova + single type), refactor de módulo URL-driven em produção, seed de conteúdo com upload de mídia, roteamento Next 16 App Router com path param + searchParams simultâneos
**Confidence:** HIGH (achados verificados no código real do repositório; poucos pontos MEDIUM onde a decisão fica com o planner)

## Summary

A Fase 6 não é uma fase de UI nova — a UI já está fechada em `06-UI-SPEC.md`. É uma fase de **modelagem
de dados sob um sistema já em produção**: quatro mudanças de schema no Strapi (`shared.aplicacao`,
`emPreparacao`, subcategoria como relação real, single type Comparativo LED) e uma generalização de um
módulo de filtros de 308 linhas coberto por 58 testes e2e vivos. As quatro descobertas mais importantes
desta pesquisa, todas verificadas contra o código-fonte real (não assumidas):

1. **`subcategorias` hoje é um componente Strapi, e componentes não podem ser alvo (`target`) de um
   campo `relation`** — confirmado na documentação oficial do Strapi 5
   (`docs.strapi.io/cms/backend-customization/models`: "Accepts a string value as the name of the
   target content-type"). Isso não é uma hipótese do orquestrador — é uma restrição estrutural do
   Strapi. A promoção de `subcategoria` a content-type é obrigatória, não uma opção entre outras.
2. **O próprio repositório já tem o precedente exato duas vezes.** `api::tipo-de-evento.tipo-de-evento`
   (Fase 5) é uma taxonomia content-type com `nome/slug/ordem` e relação `manyToMany` com `product`
   — o mesmo molde que `subcategoria` precisa. E `category.produtos` (`oneToMany`/`mappedBy: categoria`)
   ↔ `product.categoria` (`manyToOne`/`inversedBy: produtos`) é o mesmo molde que `category.subcategorias`
   precisa virar. Nenhuma das duas relações exige desenho novo — é copiar um padrão que já passou por
   produção duas vezes.
3. **A migração de dados é inexistente, não arriscada.** D-07 do CONTEXT confirma que as 5 categorias em
   produção têm `subcategorias` **vazio** hoje (nenhum item cadastrado). Trocar o tipo do atributo de
   `component` para `relation` no mesmo nome de campo é uma mudança estrutural que normalmente exigiria
   cautela — aqui não há uma linha de dado real para perder.
4. **As imagens de hero das 5 categorias já existem no repositório**, em `projeto-base/uploads/`
   (`estrutura-para-eventos.jpg`, `LED SCREEN 3-e4d7e4d4.jpg`, `images (3).jpg`, `eventos-23.png`,
   `HIGH TABLE ALUMINIUM 6-12bcd805.jpg`) — os 5 nomes de arquivo batem exatamente com os 5 valores
   `hero:` do array `CATEGORIAS` do layout-fonte. O seed não depende de imagem nova a ser gerada ou
   buscada; precisa apenas fazer upload das 5 já versionadas no repo.

Um quinto achado, descoberto só pela leitura do array de produtos mock do layout-fonte (não estava no
CONTEXT nem no UI-SPEC): **produto → subcategoria deve ser `manyToMany`, não `manyToOne`.** Um item de
serviço no layout-fonte (`montagem-estrutura`) pertence a três subcategorias ao mesmo tempo
(`f.sub: ['Palcos', 'Treliças e truss', 'Estruturas para telas de LED']`). Modelar como `manyToOne`
(um produto, uma subcategoria) perderia esse caso e forçaria escolha arbitrária no cadastro.

**Primary recommendation:** promover `subcategoria` a content-type próprio espelhando exatamente
`tipo-de-evento` (nome/slug/ordem + relação manyToMany com `product`) e a relação categoria↔subcategoria
espelhando exatamente categoria↔produto (`oneToMany`/`manyToOne`); generalizar `filtros.ts` por adição
pura (novo membro de union + parâmetro opcional com default), nunca por reescrita de assinatura; rodar o
seed via bootstrap idempotente do Strapi (`cms/src/index.ts`), no mesmo padrão de `seedEstrutura`,
fazendo upload das 5 imagens já presentes em `projeto-base/uploads/`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Conteúdo da categoria (nome, descrição, hero, subcategorias, aplicações, emPreparacao) | CMS/Backend (Strapi) | — | Fonte de verdade editorial; o front só lê e adapta (CMS-04/05 já resolvidos) |
| Comparativo LED (7 linhas da tabela) | CMS/Backend (Strapi, single type) | — | D-08: editável pelo usuário, mas com guarda estrutural (single type = 1 registro possível) |
| Régua 0–10m, pixel pitch 1.9/3.9, textos institucionais fixos | Frontend Server (código) | — | "Conteúdo de design, não do CMS" — precedente `DestaqueLedBloco` |
| Filtro por subcategoria/ambiente/tipoDeItem | API/Backend (query Strapi) + Frontend Server (parse/serialize URL) | Browser (toggle buttons, estado visual) | Mesma arquitetura do catálogo: query real no Strapi, estado sancionado só na URL, nunca filtro em memória no cliente |
| Estado "em preparação" / "sem resultado" | Frontend Server (decisão: qual estado renderizar) | Browser (interação dos CTAs) | A decisão (flag OU contagem zero) é feita no Server Component antes de enviar HTML — não há hidratação de estado de "vazio" |
| Breadcrumb + `ItemList` | Frontend Server (dados) | Browser (link navigation) | Estrutura de navegação é dado do servidor; JSON-LD real fica para Fase 12 (fora de escopo aqui) |
| Revalidação de cache ao editar no CMS | API/Backend (`/api/revalidate` + `MODELO_TAG`) | — | Webhook do Strapi; sem entrada no mapa, edição no admin nunca aparece no site |

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CATG-01 | Modelo único de página para as 5 categorias, com hero, subcategorias numeradas, aplicações e FAQ | §1 (schema `shared.aplicacao`), §4 (rota/fetch), FAQ já modelado (D-06, nenhuma mudança necessária) |
| CATG-02 | Filtros toggle horizontais, distintos do acordeão do catálogo | §2 (generalização de `filtros.ts`); UI-SPEC Bloco 3 já prescreve o componente visual |
| CATG-03 | Comparativo LED só em `telas-de-led`, régua, tabela 7 critérios, CTA | §1(d) (schema single type), achado sobre `blocos.comparativo-led` já existente e por que não reusar |
| CATG-04 | Estado "em preparação" (flag OU zero produtos) e "sem resultado" distinto do catálogo | §1(b) (`emPreparacao`), §4 (dupla consulta unfiltered/filtered) |
| CATG-05 | Breadcrumb e `ItemList` | Sem modelo de dados novo — dado estruturado local (ver Pitfall 5) |
</phase_requirements>

## Standard Stack

### Core (já no projeto — nenhuma dependência nova)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@strapi/strapi` | 5.52.0 (`[VERIFIED: cms/package.json]`) | Backend/CMS — schema.json dos 4 modelos novos | Já em produção; toda mudança desta fase é aditiva sobre o schema existente |
| `next` | ^16.3.1 (`[VERIFIED: package.json]`) | App Router, rota `/[locale]/categoria/[slug]` | Já em produção; `params`/`searchParams` como `Promise` confirmado em `node_modules/next/dist/docs/.../generate-static-params.md` e `not-found.md` |
| `zod` | ^4.4.3 (`[VERIFIED: package.json]`) | Validação na borda dos novos campos CMS | Hard constraint do projeto — toda resposta do Strapi passa por `src/lib/cms/schemas.ts` |
| `@radix-ui/react-accordion` | ^1.2.20 (`[VERIFIED: package.json]`) | FAQ da categoria (accordion exclusivo, `type="single" collapsible"`) | Já usado em `PainelDeFiltros.tsx`; UI-SPEC exige o mesmo padrão de acessibilidade |

Nenhuma biblioteca nova entra nesta fase — é 100% modelagem de dados + refatoração de módulo puro +
componentes React sobre o design system já existente.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Promover `subcategoria` a content-type | Manter componente + campo de texto livre no produto para "subcategoria" | Rejeitado por D-09 discretion explícita ("desde que o filtro seja query real e não texto livre") — repetiria o erro que a Fase 5 corrigiu com `tipo-de-evento` |
| Single type "Comparativo LED" dedicado | Reaproveitar o componente Dynamic Zone `blocos.comparativo-led` já existente (ver achado abaixo) | Rejeitado por D-08 — permitiria duplicar o bloco em qualquer `page` ou colá-lo na categoria errada; o usuário optou explicitamente por CMS editável com garantia estrutural |
| Seed via bootstrap idempotente do Strapi | Seed manual via admin UI | Bootstrap é o padrão já estabelecido (`seedEstrutura`, `garantirContagemSolicitacoes`) — idempotente, versionado, roda igual em dev/produção; admin manual não deixa rastro versionado e precisaria ser repetido nos 3 ambientes |

## Package Legitimacy Audit

Não aplicável — nenhuma dependência nova (npm ou pip) é instalada nesta fase. Todas as mudanças usam
pacotes já auditados em fases anteriores (`@strapi/strapi`, `next`, `zod`, `@radix-ui/*`).

## Achado central: por que `subcategoria` precisa virar content-type

### O limite real do Strapi (verificado, não assumido)

`cms/src/components/shared/subcategoria.json` é um **componente** (`nome`, `descricao`), repetível em
`category.subcategorias`. A documentação oficial do Strapi 5 é explícita: o parâmetro `target` de um
atributo `relation` "accepts a string value as the name of the **target content-type**"
`[CITED: docs.strapi.io/cms/backend-customization/models]`. Um componente não é um content-type — não
tem `documentId` próprio nem endpoint de coleção. Não existe combinação de opções que permita
`product.subcategoria` apontar para uma instância dentro de `category.subcategorias[]` enquanto esse
campo for `type: "component"`. A única saída é promover `subcategoria` a `api::subcategoria.subcategoria`
(collection type).

### O precedente já existe duas vezes no próprio schema — copiar, não desenhar

**Padrão A — taxonomia independente com N:N para produto** (`cms/src/api/tipo-de-evento/.../schema.json`):
```json
{
  "kind": "collectionType",
  "attributes": {
    "nome": { "type": "string", "required": true },
    "slug": { "type": "uid", "targetField": "nome", "required": true },
    "ordem": { "type": "integer", "default": 0 },
    "produtos": { "type": "relation", "relation": "manyToMany", "target": "api::product.product", "mappedBy": "tiposDeEvento" }
  }
}
```
Do lado do produto: `tiposDeEvento: { type: "relation", relation: "manyToMany", target: "api::tipo-de-evento.tipo-de-evento", inversedBy: "produtos" }`.

**Padrão B — relação hierárquica 1:N já usada por categoria↔produto** (`category.produtos`
`oneToMany`/`mappedBy: categoria` ↔ `product.categoria` `manyToOne`/`inversedBy: produtos`).

**Recomendação (mistura dos dois padrões, cada um onde já se aplica no domínio):**

```json
// cms/src/api/subcategoria/content-types/subcategoria/schema.json (NOVO)
{
  "kind": "collectionType",
  "collectionName": "subcategorias",
  "info": { "singularName": "subcategoria", "pluralName": "subcategorias", "displayName": "Subcategoria" },
  "options": { "draftAndPublish": true },
  "pluginOptions": { "i18n": { "localized": true } },
  "attributes": {
    "nome": { "type": "string", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "slug": { "type": "uid", "targetField": "nome", "required": true, "pluginOptions": { "i18n": { "localized": true } } },
    "descricao": { "type": "text", "pluginOptions": { "i18n": { "localized": true } } },
    "ordem": { "type": "integer", "default": 0 },
    "categoria": { "type": "relation", "relation": "manyToOne", "target": "api::category.category", "inversedBy": "subcategorias" },
    "produtos": { "type": "relation", "relation": "manyToMany", "target": "api::product.product", "mappedBy": "subcategorias" }
  }
}
```

- Em `category.subcategorias`: trocar de `component`/`repeatable` para
  `{ "type": "relation", "relation": "oneToMany", "target": "api::subcategoria.subcategoria", "mappedBy": "categoria" }`
  — **mesmo nome de campo**, tipo diferente. Seguro porque a produção não tem dado nesse campo (D-07).
- Em `product`: novo atributo `subcategorias`:
  `{ "type": "relation", "relation": "manyToMany", "target": "api::subcategoria.subcategoria", "inversedBy": "produtos" }`
  — **plural e manyToMany**, não singular/manyToOne, pela evidência do produto de serviço com 3 subs
  simultâneas (achado do layout-fonte, ver Summary).

### Consequências práticas que o plano precisa cobrir

1. **`shared/subcategoria.json` (componente) fica órfão** depois da migração — decidir se é removido do
   repositório ou mantido sem uso (recomendação: remover, para não haver dois "subcategoria" no admin).
2. **`src/lib/cms/schemas.ts`**: `subcategoriaSchema` (hoje `{ nome, descricao }`) precisa virar um
   schema de entidade relacional (`{ id, documentId, nome, slug, descricao, ordem }`), e
   `categoriaSchema.subcategorias` muda de array de componente embutido para array de entidade populada
   — mesmo padrão já usado para `categoria`/`tiposDeEvento` no `produtoSchema` (campo aditivo e
   opcional, `nullable().optional()`, para não quebrar resposta sem populate).
3. **`src/lib/cms/adapters.ts`**: `adaptarCategoria` muda a origem de `subcategorias` (de
   `c.subcategorias` direto para a relação populada); `getCategorias`/`getCategoriaPorSlug` precisam
   trocar `populate: 'hero,subcategorias'` por um populate mais profundo se o campo precisar de `slug`
   (`populate[subcategorias][fields][0]=nome&...` ou populate simples se todos os campos forem
   necessários — testar contra o Strapi real, mesma lição do `05-RESEARCH.md §1` citada no CONTEXT).
4. **`FiltroProdutos`** (`adapters.ts`) precisa de um novo campo `subcategorias?: string[]`, com a mesma
   sintaxe de query `$in` já usada para `tiposDeEvento` (relação manyToMany):
   `filters[$and][${i}][subcategorias][slug][$in][${j}]`.
5. **Dois content-types novos exigem duas entradas em `PUBLIC_READ`** (`cms/src/index.ts`):
   `subcategoria` (find/findOne) e o single type do comparativo (só find, sem findOne — single types não
   têm `findOne` por documentId da mesma forma, verificar `garantirPermissoesPublicas` — o código atual
   sempre adiciona `find` + `findOne` exceto para `settings-globais`; um single type novo deve seguir o
   MESMO padrão de exclusão de `settings-globais`, ou seja, só `find`, não `findOne`, para o novo single
   type do comparativo).
6. **Duas entradas novas em `MODELO_TAG`** (`src/app/api/revalidate/route.ts`): `subcategoria` (ex.:
   `cms:subcategorias`) e o slug do single type do comparativo (ex.: `comparativo-led` →
   `cms:comparativo-led`). Sem isso, editar uma subcategoria ou o comparativo no admin nunca aparece no
   site publicado — exatamente o pitfall que o canonical_refs do CONTEXT já sinaliza.

## Achado: o Comparativo LED já tem um "primo" não utilizado na Dynamic Zone

`cms/src/components/blocos/comparativo-led.json` **já existe** desde a Fase 3 — é um dos 13 blocos
previstos por CMS-02, nunca usado por nenhuma página em produção até hoje:

```json
{
  "attributes": {
    "eyebrow": { "type": "string" },
    "titulo": { "type": "string" },
    "introducao": { "type": "richtext" },
    "regraPratica": { "type": "text" },
    "tabela": { "type": "json" },
    "ctaRotulo": { "type": "string" },
    "ctaUrl": { "type": "string" }
  }
}
```

E `src/lib/cms/schemas.ts` já tem `blocoComparativoLed` com o mesmo shape (`z.object({ colunas,
linhas: {rotulo, valores} })` para `tabela`). **Não reusar isso** — é exatamente o desenho que D-08
rejeitou (bloco de Dynamic Zone dentro de `page.blocos`, que qualquer página poderia importar,
duplicar ou colocar na categoria errada). A recomendação é criar um **novo** single type dedicado
(`api::comparativo-led.comparativo-led` ou nome equivalente livre de colisão com o componente
`blocos.comparativo-led` já existente), cobrindo **só as 7 linhas da tabela** por D-08/UI-SPEC — a
régua, o pixel pitch e os textos institucionais continuam fixos no código:

```json
// cms/src/api/comparativo-led/content-types/comparativo-led/schema.json (NOVO — single type)
{
  "kind": "singleType",
  "collectionName": "comparativo_led",
  "info": { "singularName": "comparativo-led", "pluralName": "comparativo-led", "displayName": "Comparativo LED (P1.9 x P3.9)" },
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
```json
// cms/src/components/shared/linha-comparativo.json (NOVO)
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

**Por que componente tipado em vez do `tabela: json` já existente no bloco não usado:** o hard
constraint do projeto exige toda resposta do CMS validada por Zod; um campo `json` livre é validável
só como `unknown`, perdendo a garantia de shape por linha (`criterio`/`valorP19`/`valorP39`) que um
componente repetível dá de graça, e o editor ganha 3 campos de formulário no admin em vez de editar
JSON cru. Isso é uma melhoria sobre o precedente não usado, não uma cópia dele — sinalizar essa
divergência ao usuário/planner como decisão consciente. `[ASSUMED]` — decisão de modelagem específica
desta pesquisa, sem confirmação do usuário; ver Assumptions Log.

`draftAndPublish: false`: seguindo o padrão de `settings-globais` (outro single type do projeto sem
rascunho/publicação) — um comparativo com "rascunho" não teria como fazer sentido (não há segunda versão
em disputa). `[ASSUMED]`, discretion do planner se quiser draftAndPublish: true por consistência com os
outros content-types.

## Achado: componente `shared.aplicacao` (D-05) — o mais simples dos quatro

```json
// cms/src/components/shared/aplicacao.json (NOVO — espelha shared/subcategoria.json linha a linha)
{
  "collectionName": "components_shared_aplicacoes",
  "info": { "displayName": "Aplicação", "icon": "bulletList" },
  "attributes": {
    "nome": { "type": "string", "required": true },
    "descricao": { "type": "text" }
  }
}
```
Em `category`: `"aplicacoes": { "type": "component", "repeatable": true, "component": "shared.aplicacao", "pluginOptions": { "i18n": { "localized": true } } }`. Sem relação, sem migração, sem
entrada em `PUBLIC_READ`/`MODELO_TAG` (componente não é content-type — herda a permissão de `category`,
já pública). `[VERIFIED: cms/src/components/shared/subcategoria.json]` (o molde copiado é código real).

E o booleano `emPreparacao` em `category`: `"emPreparacao": { "type": "boolean", "default": false }`.
**Atenção à lição da Fase 5 registrada em `STATE.md`**: `"default"` no `schema.json` só se aplica na
CRIAÇÃO de um registro, não faz backfill de linhas existentes. As 5 categorias JÁ EXISTEM em produção
(criadas pelo bootstrap `seedEstrutura`) — adicionar `emPreparacao` com `default: false` deixa o campo
`NULL` nas 5 linhas existentes até que algo grave um valor. Como D-01 trata "emPreparacao truthy" como
UMA de duas condições (OR com contagem zero), um `NULL` se comporta como falsy no truth-check JS/TS
(`Boolean(null) === false`), então o efeito prático provavelmente já é o esperado — mas isso é
diferente de garantir a coluna correta no Postgres. Recomendação: seguir o MESMO padrão de
`garantirContagemSolicitacoes` — uma função de backfill idempotente no bootstrap que grava `false`
explicitamente nas 5 categorias existentes, para que `ORDER BY`/filtro futuro (Fase 12, se um dia
listar categorias "prontas" separado) não tropece no mesmo bug já documentado.

## Architecture Patterns

### System Architecture Diagram

```
Requisição HTTP: GET /pt-BR/categoria/telas-de-led?sub=P1.9mm&ambiente=externo
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ src/app/[locale]/categoria/[slug]/page.tsx  (Server Component)│
│  1. isLocale(locale) ?  não → notFound()                     │
│  2. await params → slug ; await searchParams → sp            │
│  3. getCategoriaPorSlug(locale, slug)  → null? → notFound()  │
│  4. parseFiltrosDaCategoria(sp, allowlist) → filtro saneado  │
│  5. getProdutos(locale, {categoria: slug, porPagina:100})    │◄── SEM filtro de eixo:
│        → todosDaCategoria  (decide "em preparação", D-01)    │    total real da categoria
│  6. algumFiltroAtivo(filtro) ?                                │
│        sim → getProdutos(locale, {categoria: slug, ...eixos})│◄── COM filtro: grade real
│        não → reusa todosDaCategoria (evita 2ª chamada)       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐
│ hero + breadcrumb   │   │ subcategorias       │   │ aplicações + FAQ   │
│ (Server, estático)  │   │ numeradas (Server)  │   │ (Server, getFaq)   │
└────────────────────┘   └────────────────────┘   └───────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│ #produtos: toggles (Client, useSearchParams) → 1 de 3 estados: │
│   todosDaCategoria.length === 0 || categoria.emPreparacao      │
│      → EstadoEmPreparacao (novo, copy fixa)                    │
│   produtosFiltrados.length === 0 && algumFiltroAtivo           │
│      → EstadoSemResultados (parametrizado, D-04)               │
│   caso contrário → GradeDeProdutos (reuso Fase 5)               │
└───────────────────────────────────────────────────────────────┘
        │
        ▼ (só quando slug === 'telas-de-led')
┌───────────────────────────────────────────────────────────────┐
│ getComparativoLed(locale) → single type → tabela de 7 linhas   │
│ régua/pixel-pitch/textos fixos no componente (código)          │
└───────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
cms/src/api/subcategoria/content-types/subcategoria/schema.json   # NOVO content-type
cms/src/api/comparativo-led/content-types/comparativo-led/schema.json  # NOVO single type
cms/src/components/shared/aplicacao.json                          # NOVO componente
cms/src/components/shared/linha-comparativo.json                  # NOVO componente
cms/src/components/shared/subcategoria.json                       # REMOVER (órfão após migração)
src/app/[locale]/categoria/[slug]/page.tsx                        # NOVO (rota)
src/app/[locale]/categoria/[slug]/loading.tsx                     # NOVO (skeletons)
src/app/[locale]/categoria/[slug]/error.tsx                       # NOVO ou herdado do catálogo
src/components/categoria/                                          # discricionário (per CONTEXT)
src/components/chrome/Breadcrumb.tsx                               # sugerido no UI-SPEC (reuso Fase 7)
src/lib/catalogo/filtros.ts                                        # GENERALIZAR (não duplicar)
src/lib/cms/adapters.ts                                            # getSubcategorias, getComparativoLed, extends getProdutos/getCategoriaPorSlug
src/lib/cms/schemas.ts                                              # subcategoriaSchema, comparativoLedSchema, categoriaSchema.aplicacoes/emPreparacao
```

### Pattern 1: Generalização aditiva de `filtros.ts` (D-10)

**O que:** ao invés de reescrever `IdGrupoFiltro`/`FiltroCatalogo` para uma forma genérica
(`Record<string, string[]>`), estender por ADIÇÃO em cada ponto de extensão já existente, mantendo
100% de compatibilidade binária com os 5 consumidores atuais (`ToolbarDoCatalogo.tsx`,
`ChipsDeFiltroAtivo.tsx`, `PainelDeFiltros.tsx`, `EmissorFiltroAplicado.tsx`, `catalogo/page.tsx`).

**Quando usar:** sempre que o módulo alvo já tem cobertura de teste extensa (58 e2e + testes de
componente) e a mudança pode ser feita sem tocar assinatura de função existente.

**Passo a passo concreto:**

1. `IdGrupoFiltro`: adicionar o membro `'sub'` ao union (`'categoria' | 'tipo' | 'cor' | 'evento' |
   'ambiente' | 'sub'`). Adicionar um membro a um union type é uma mudança **aditiva e segura** em
   TypeScript para código que já lida com o tipo por valor — MAS quebra qualquer `Record<IdGrupoFiltro,
   X>` que não tenha as 6 chaves. Ver Pitfall 1 abaixo — isso não é hipotético, já existe um caso real.
2. `CAMPO_POR_GRUPO` (dentro de `filtros.ts`): adicionar `sub: 'subcategorias'`.
3. `FiltroCatalogo`: adicionar o campo `subcategorias: string[]` (nunca remover ou renomear os 5
   existentes).
4. `CHAVES_ACEITAS`: adicionar `'sub'` ao array; adicionar `case 'sub':` ao switch de
   `parseFiltrosDaUrl`, usando a mesma allowlist-por-parâmetro que os outros 3 grupos dinâmicos (evento,
   categoria, cor) já usam.
5. `AllowlistDinamica`: adicionar `subcategorias: string[]`.
6. `GRUPOS_DE_FILTRO` (a constante do catálogo) **permanece intocada** — ela não ganha o grupo `sub`,
   porque o catálogo não filtra por subcategoria nesta fase. A categoria monta seu PRÓPRIO array de
   `GrupoDeFiltro[]` (3 grupos: `sub` com rótulo dinâmico por categoria, `ambiente` e `tipo` reaproveitando
   as opções fixas já declaradas em `GRUPOS_DE_FILTRO`, filtradas/copiadas por índice ou por um pequeno
   helper `buscarGrupo(id)`).
7. `serializarFiltros(filtro, grupos: GrupoDeFiltro[] = GRUPOS_DE_FILTRO)` e
   `descreverChips(filtro, grupos: GrupoDeFiltro[] = GRUPOS_DE_FILTRO, rotulosDinamicos = {})`: adicionar
   o parâmetro `grupos` com o **default apontando para a constante atual** — todo call site existente
   (que não passa esse argumento) continua funcionando sem alteração; a categoria passa seu array de 3
   grupos explicitamente.
8. `alternarValor` e `contarFiltrosAtivos` **não precisam mudar** — já operam sobre `URLSearchParams`
   genérico ou somam campos fixos de `FiltroCatalogo` (`contarFiltrosAtivos` precisa de uma linha a mais
   somando `filtro.subcategorias.length`).

### Anti-Patterns to Avoid
- **Criar `src/lib/categoria/filtros.ts` paralelo:** D-10 travou explicitamente contra isso — duplicaria
  lógica de parse/serialize/chip já testada e criaria uma segunda fonte de verdade para o mesmo
  problema (drift entre os dois módulos é como a Fase 5 descreve o próprio motivo da regra).
- **Reescrever `FiltroCatalogo` para `Record<string, string[]>` genérico:** tecnicamente mais "limpo",
  mas exige tocar a assinatura de todos os 5 consumidores e resincronizar manualmente com os 58 testes
  e2e que fazem asserção sobre comportamento observável (URL, chips, eventos) — risco desproporcional
  ao ganho nesta fase. Ver Pitfall 2.
- **Filtrar subcategoria em memória (JS) depois de buscar todos os produtos da categoria:** violaria a
  discretion note de D-09 ("desde que o filtro seja query real e não texto livre") e o precedente
  arquitetural que a Fase 5 já fixou para os outros 4 eixos — todos são query Strapi, nenhum é
  filtro client-side.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Taxonomia relacional com N:N para produto | Enum de string livre no produto, ou campo JSON de subcategorias | Content-type `api::subcategoria.subcategoria`, espelhando `tipo-de-evento` | Já é o segundo caso do mesmo problema no projeto; a Fase 5 já pagou o custo de aprendizado com a migração `aplicacoes` (json livre) → `tiposDeEvento` (relação) — repetir o erro aqui seria desperdiçar essa lição registrada em `STATE.md` |
| Rótulo variável de grupo de filtro por categoria | Objeto de tradução hardcoded no componente React (`if (slug === 'telas-de-led') 'Configuração' else 'Subcategoria'`) | Campo de dado no CMS (o rótulo do grupo `sub` é dado da subcategoria/categoria, não string de UI) — UI-SPEC já resolveu isso como "vem do campo, não é hardcode de UI" | Hardcode de rótulo por slug de categoria quebra no dia em que a 6ª categoria for cadastrada; o dado já está disponível pela modelagem recomendada |
| Empty state "sem resultado" da categoria | Segundo componente `EstadoSemResultadosCategoria.tsx` | Parametrizar `EstadoSemResultados.tsx` existente com props opcionais (`eyebrow`, `titulo`, `corpo`) com os defaults atuais do catálogo | D-04 travou isso explicitamente citando o defeito de contraste do rodapé como exemplo do custo real de duplicar componente |

**Key insight:** as quatro peças de modelagem desta fase (`aplicacao`, `emPreparacao`, `subcategoria`,
`comparativo-led`) têm precedente **literal** em código já existente no mesmo repositório
(`subcategoria` componente → copiar forma; `tipo-de-evento` → copiar padrão de relação N:N;
`contagemSolicitacoes`/`garantirContagemSolicitacoes` → copiar padrão de backfill;
`settings-globais` → copiar padrão de single type). Não há decisão de modelagem nesta fase que exija
inventar um padrão novo para o projeto — o risco real está em *não* olhar esses precedentes antes de
desenhar algo do zero.

## Common Pitfalls

### Pitfall 1: Widening de `IdGrupoFiltro` quebra a compilação de um arquivo que não parece relacionado
**O que dá errado:** `src/components/analytics/EmissorFiltroAplicado.tsx` (linhas 26-37) declara sua
PRÓPRIA cópia local de `Record<IdGrupoFiltro, 'categorias'|'tiposDeItem'|'cores'|'tiposDeEvento'|
'ambientes'>` (`CAMPO_POR_GRUPO`), em vez de importar a constante de `filtros.ts`. Um `Record<T, V>`
exige TODAS as chaves de `T`. Assim que `IdGrupoFiltro` ganhar o membro `'sub'`, esse arquivo passa a
falhar `tsc` com "Property 'sub' is missing" — mesmo que a categoria nunca importe ou renderize
`EmissorFiltroAplicado`.
**Por que acontece:** duplicação de um `Record` tipado por um union compartilhado, em vez de reexportar
a constante única de `filtros.ts`. É um code smell pré-existente, não introduzido por esta fase.
**Como evitar:** antes de tocar `IdGrupoFiltro`, rodar
`grep -rn "Record<IdGrupoFiltro" src/` para achar TODAS as cópias (encontrada uma até agora; pode haver
mais em componentes ainda não lidos nesta pesquisa) e adicionar a chave `sub: 'subcategorias'` em cada
uma, ou — melhor — trocar a declaração local por `import { CAMPO_POR_GRUPO } from '@/lib/catalogo/filtros'`
nesse mesmo commit, eliminando a duplicação de vez.
**Warning signs:** `npm run typecheck` (ou `tsc --noEmit`) falhando com erro em um arquivo de
`analytics/`, não em `catalogo/`, depois de editar só `filtros.ts` — sintoma de duplicação de tipo em
lugar não óbvio.

### Pitfall 2: Trocar o shape de `FiltroCatalogo` quebra 3 consumidores e invalida os 58 testes e2e
**O que dá errado:** qualquer refactor que renomeie os campos existentes de `FiltroCatalogo`
(`categorias`, `tiposDeItem`, `cores`, `tiposDeEvento`, `ambientes`) para uma forma genérica
(`Record<IdGrupoFiltro, string[]>`) precisa também reescrever `ToolbarDoCatalogo.tsx` (acessa
`filtro.ordenar` direto), `ChipsDeFiltroAtivo.tsx` e `EmissorFiltroAplicado.tsx` (os dois acessam campos
nominais), e provavelmente muda a ordem de serialização de query string que 2 testes e2e comparam
literalmente (`aplicar dois filtros, remover um, reload e goBack nunca dessincronizam`,
`achado do orquestrador: aplicar filtro com ?q= já ativo produz EXATAMENTE...`).
**Por que acontece:** a tentação de "fazer certo de uma vez" ao generalizar, em vez de aditivo mínimo.
**Como evitar:** seguir o Pattern 1 acima (adição pura); rodar a suíte e2e completa
(`npx playwright test`) e `npm run check` antes de considerar a Task de refactor concluída — não só o
subconjunto que parece relacionado.
**Warning signs:** diff de `filtros.ts` maior que ~40 linhas adicionadas/alteradas, ou qualquer linha
removida de uma interface pública exportada.

### Pitfall 3: Volume de uploads em produção invalida um `git pull`/redeploy ingênuo das imagens de seed
**O que dá errado:** `cms/Dockerfile` documenta explicitamente que `public/uploads` é ignorado pelo
`.gitignore` do Strapi e recriado vazio a cada build de imagem; em produção esse diretório recebe um
volume persistente (senão cada redeploy apaga upload feito pelo admin). Isso significa que as 5 imagens
de hero em `projeto-base/uploads/` **não chegam a produção só por estarem no repositório** — elas
precisam ser efetivamente enviadas via API/admin do Strapi (que grava no volume montado), não copiadas
para dentro da imagem Docker.
**Por que acontece:** confundir "arquivo está no git" com "arquivo está no volume de uploads do Strapi
em produção" — são dois sistemas de armazenamento diferentes que só se conectam através de uma
chamada de upload real (`POST /api/upload` ou upload pelo admin).
**Como evitar:** o seed de imagem precisa rodar contra o Strapi já no ar (local ou produção), fazendo
upload de fato — seja via script que chama a API de upload do Strapi (`strapi.plugins('upload')...` no
bootstrap, ou uma chamada HTTP autenticada), seja via upload manual no admin. Bootstrap idempotente
(`cms/src/index.ts`) é o padrão do projeto para dados estruturais, mas upload de mídia binária dentro do
`bootstrap()` é mais raro — avaliar se vale a pena versus deixar o upload de imagem como passo manual
documentado (ver Open Question 1).
**Warning signs:** hero aparecendo vazio/placeholder em produção mesmo depois do deploy, enquanto local
funciona (sintoma clássico de volume vazio em produção vs. filesystem do container de dev).

### Pitfall 4: `emPreparacao` com `default: false` não faz backfill nas 5 categorias já existentes
**O que dá errado:** exatamente o bug já documentado em `STATE.md` para `contagemSolicitacoes` —
`"default"` no `schema.json` só se aplica à CRIAÇÃO. As 5 categorias já existem (criadas por
`seedEstrutura` antes desta fase); adicionar `emPreparacao: boolean default false` ao schema não grava
`false` nelas — grava `NULL` até que uma edição toque o campo.
**Por que acontece:** suposição comum (e incorreta) de que `default` no Strapi funciona como `DEFAULT`
de coluna SQL.
**Como evitar:** replicar o padrão de `garantirContagemSolicitacoes` — uma função de backfill idempotente
no `bootstrap()` que grava `emPreparacao: false` explicitamente nas categorias com o campo
`null`/`undefined`.
**Warning signs:** D-01 sendo avaliado como "verdadeiro" para uma categoria que o editor nunca marcou
manualmente, porque `NULL` se comportou de forma inesperada em alguma consulta futura (ex.: um filtro
Strapi `emPreparacao[$eq]=false` não bate com `NULL`, diferente do truth-check JS).

### Pitfall 5: Confundir o `ItemList` de CATG-05 com JSON-LD de verdade
**O que dá errado:** a Fase 12 (fora de escopo aqui) é quem serializa `BreadcrumbList`/`ItemList` como
`<script type="application/ld+json">`. CATG-05 pede que a **estrutura de dados** exista nesta fase — o
componente `Breadcrumb` precisa expor a lista `{ nome, href }[]` de forma que a Fase 12 possa consumir
sem refatorar o componente visual depois.
**Por que acontece:** o nome "ItemList" soa como "preciso emitir JSON-LD agora".
**Como evitar:** seguir exatamente o que o UI-SPEC já resolveu — o componente visual só expõe a lista de
níveis; nenhum `<script>` de dado estruturado é escrito nesta fase.
**Warning signs:** uma Task do plano mencionando `application/ld+json` — sinal de escopo vazando da
Fase 12 para a Fase 6.

## Code Examples

### Filtro de relação manyToMany por slug (padrão já testado em produção, Fase 5)
```ts
// Source: src/lib/cms/adapters.ts (getProdutos, já em produção)
if (filtro.tiposDeEvento?.length) {
  filtro.tiposDeEvento.forEach((slug, j) => {
    params[`filters[$and][${i}][tiposDeEvento][slug][$in][${j}]`] = slug;
  });
  i += 1;
}
// Aplicar o MESMO padrão para subcategorias:
if (filtro.subcategorias?.length) {
  filtro.subcategorias.forEach((slug, j) => {
    params[`filters[$and][${i}][subcategorias][slug][$in][${j}]`] = slug;
  });
  i += 1;
}
```

### Backfill idempotente de campo booleano novo (padrão já em produção)
```ts
// Source: cms/src/index.ts, garantirContagemSolicitacoes (adaptar de integer para boolean)
async function garantirEmPreparacao(strapi: Core.Strapi) {
  const categorias = await strapi.documents('api::category.category').findMany({
    locale: 'pt-BR', status: 'draft', pagination: { pageSize: 100 },
  });
  let corrigidas = 0;
  for (const c of categorias) {
    if (c.emPreparacao !== null && c.emPreparacao !== undefined) continue;
    await strapi.documents('api::category.category').update({
      documentId: c.documentId, locale: 'pt-BR', data: { emPreparacao: false },
    });
    await strapi.documents('api::category.category').publish({ documentId: c.documentId, locale: 'pt-BR' });
    corrigidas += 1;
  }
  strapi.log.info(`[seed] emPreparacao: ${corrigidas} categoria(s) inicializada(s)`);
}
```

### Rota com path param + searchParams simultâneos (mesma assinatura do catálogo, Next 16)
```ts
// Source: node_modules/next/dist/docs/.../generate-static-params.md +
// src/app/[locale]/catalogo/page.tsx (padrão já em produção)
export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const categoria = await getCategoriaPorSlug(locale, slug);
  if (!categoria) notFound();
  // ...
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `subcategorias` como componente de exibição pura | `subcategorias` como content-type relacional, alvo de filtro real | Nesta fase (D-09/discretion) | Categoria e produto passam a compartilhar a mesma fonte de verdade para exibição E filtro — elimina a possibilidade de "subcategoria exibida" divergir de "subcategoria filtrável" |
| Bloco `blocos.comparativo-led` da Dynamic Zone (Fase 3, nunca usado) | Single type dedicado `comparativo-led` | Nesta fase (D-08) | O bloco antigo fica órfão — decidir explicitamente se ele é removido do schema (`cms/src/components/blocos/comparativo-led.json` e a entrada em `blocoSchema`) ou deixado como "não usado, mas ainda no union" (recomendação: registrar como pendência para não confundir o próximo Strapi/Next dev sobre qual dos dois é o real) |

**Deprecated/outdated:**
- `blocos.comparativo-led` (componente de Dynamic Zone): candidato a remoção ou a ficar documentado
  como "substituído pelo single type dedicado da Fase 6" — decisão do planner, não bloqueante para
  entregar CATG-03.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | O nome do content-type do single type deve ser `comparativo-led` (singularName/pluralName iguais, convenção de single type do Strapi) — não confirmado com o usuário, só inferido do padrão `settings-globais` | Achado: Comparativo LED | Baixo — é só um nome de rota da API; renomear depois é um `find/replace` em `cms/src/api/comparativo-led/` e nos dois arquivos que o referenciam (`PUBLIC_READ`, `MODELO_TAG`) |
| A2 | O comparativo deve ser modelado como componente repetível tipado (`shared.linha-comparativo`) em vez do `tabela: json` livre que o bloco não usado já tinha | Achado: Comparativo LED | Médio — se o usuário preferir o `json` livre (menos rígido, mais rápido de editar em lote), a Task de schema muda, mas nenhuma outra Task do plano depende dessa escolha interna |
| A3 | `draftAndPublish: false` no single type do comparativo, espelhando `settings-globais` | Achado: Comparativo LED | Baixo — troca de uma linha no schema.json, sem efeito em cadeia |
| A4 | O upload das 5 imagens de hero deve ser feito via chamada de API/admin contra um Strapi já rodando, não via cópia de arquivo para dentro do container | Pitfall 3 | Alto se ignorado — heroes ficam vazios em produção mesmo com o código "correto"; ver Open Question 1 para as opções concretas que o planner precisa escolher |
| A5 | `emPreparacao` precisa de backfill idempotente no bootstrap, pelo mesmo motivo documentado para `contagemSolicitacoes` | Pitfall 4 | Médio — sem o backfill, o campo fica `NULL` nas 5 categorias existentes; o efeito prático em D-01 (OR com contagem zero) provavelmente mascara o bug no curto prazo, mas resolve errado no dia em que alguém fizer uma query Strapi direta por `emPreparacao[$eq]=false` |

## Open Questions (RESOLVED)

1. **Como as 5 imagens de `projeto-base/uploads/` chegam ao volume de produção?**
   - **RESOLVIDA no plano 06-04** — opção (a): as 5 imagens são copiadas para `cms/seed-assets/` e
     viajam dentro da imagem Docker do serviço `cms`; o bootstrap faz o upload idempotente.
   - O que sabemos: as imagens existem no repo, batem 1:1 com os 5 heros do layout-fonte; produção usa
     um volume persistente montado em `public/uploads` (Pitfall 3); o padrão do projeto para dados
     estruturais é bootstrap idempotente em `cms/src/index.ts`.
   - O que não está claro: se o bootstrap do Strapi (que roda no boot do container) tem acesso de
     filesystem às imagens de `projeto-base/uploads/` (que hoje vive na raiz do monorepo Next, não em
     `cms/`) para fazer upload automático via `strapi.plugins('upload').services.upload.upload(...)`, ou
     se o caminho mais simples é: (a) copiar as 5 imagens para dentro de `cms/` antes do build (ex.:
     `cms/seed-assets/`), incluí-las no bootstrap, e então elas viajam com a imagem Docker do `cms` (que
     tem acesso normal de filesystem, diferente do volume de uploads que é só para conteúdo gerado pelo
     admin) — ou (b) deixar como passo manual documentado em `docs/DEPLOY.md`, no mesmo espírito do
     "cadastrar produtos e imagens reais direto no admin" que já está lá para os produtos.
   - Recomendação: (a) é mais robusto e idempotente (mesmo padrão dos outros seeds), mas exige que o
     planner resolva o caminho relativo `projeto-base/uploads/` → `cms/seed-assets/` como uma Task
     explícita de "copiar assets para dentro do diretório do CMS antes do build da imagem Docker" —
     decisão de planner, não travada aqui.

2. **O componente `shared/subcategoria.json` (órfão após a migração) deve ser removido do repositório
   nesta fase ou só deixado sem uso?**
   - **RESOLVIDA no plano 06-01, Task 3** — o arquivo é REMOVIDO nesta fase, com a verificação de boot
     local antes do deploy.
   - O que sabemos: nenhum outro content-type/componente referencia `shared.subcategoria` além de
     `category.subcategorias` (o campo que está sendo trocado).
   - O que não está claro: se remover o arquivo `.json` do componente exige uma migração de banco
     explícita (droppar a tabela `components_shared_subcategorias`) ou se o Strapi lida com isso
     automaticamente ao não encontrar mais o componente referenciado em nenhum schema no próximo boot.
   - Recomendação: testar localmente (`docker compose up` no `cms`) removendo o arquivo e observando o
     log de boot antes de assumir que é seguro; se o Strapi reclamar, manter o arquivo e só remover a
     referência em `category.subcategorias` (o componente fica no repo, sem uso, até uma limpeza
     posterior).

3. **`getCategoriaPorSlug` deve continuar populando `produtos` diretamente na consulta de categoria, ou
   a Fase 6 deve migrar para usar exclusivamente `getProdutos(locale, {categoria: slug, ...})` (o padrão
   do catálogo)?**
   - **RESOLVIDA no plano 06-05** — `getCategoriaPorSlug` deixa de popular `produtos`; a grade passa a
     vir exclusivamente de `getProdutos`.
   - O que sabemos: `getCategoriaPorSlug` hoje popula `produtos,produtos.imagens` na mesma chamada;
     `getProdutos` já aceita `filtro.categoria` (legado, mantido "para não quebrar" per comentário no
     código) e é o caminho que suporta os filtros por eixo (subcategoria/ambiente/tipoDeItem) com a
     sintaxe `$and`/`$or`/`$in` já testada.
   - O que não está claro: se a Fase 7 (Produto) ou outro consumidor depende do populate embutido de
     `produtos` dentro de `getCategoriaPorSlug` hoje (busca rápida não encontrou uso fora desta função).
   - Recomendação: usar `getCategoriaPorSlug` só para os metadados da categoria (nome, descrição, hero,
     subcategorias, aplicações, emPreparacao, seo), sem popular `produtos` nela, e usar
     `getProdutos(locale, {categoria: slug, ...eixos, porPagina: 100})` para a grade — isso já é
     consistente com o Architecture Pattern proposto (uma chamada sem filtro de eixo para D-01, uma
     chamada com filtro quando ativo).

## Environment Availability

Não aplicável no sentido de ferramentas externas novas — todas as dependências (Strapi, Next, Docker)
já estão configuradas e rodando em dev/produção desde fases anteriores. O único item ambiental
relevante é o acesso de build ao Strapi:

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Strapi (local, `docker compose up`) | Testar a migração de schema (`subcategorias` componente→relação) antes de produção | Depende do ambiente de execução do plano — não verificável nesta sessão de pesquisa | 5.52.0 | Nenhum — a migração de schema **precisa** ser testada localmente antes do deploy, dado que já existe produção viva rodando o schema antigo |
| Acesso de rede ao Strapi de produção durante o build do Next | `STRAPI_API_URL` como build arg (constraint do projeto) — a rota de categoria em si NÃO precisa disso porque não usa `generateStaticParams` (ver §4 abaixo), mas a Home continua precisando | Já validado em fases anteriores | — | — |

**Missing dependencies with no fallback:** nenhuma ferramenta ausente identificada; o risco real é
processual (testar a migração de schema localmente antes de tocar produção), não de ferramenta faltando.

## Rota e busca de dados — detalhamento (research_focus item 4)

**`generateStaticParams`: não usar.** A rota lê `searchParams` (filtros toggle são estado de URL, D-10),
e o projeto não usa Cache Components/PPR (confirmado por HOME-03: "sem `cacheComponents`"). Sem PPR,
acessar `searchParams` em qualquer ponto da árvore de Server Components força a rota inteira a
renderizar sob demanda a cada request — exatamente a mesma situação já documentada no comentário de
`catalogo/page.tsx` ("a primeira rota dinâmica do projeto"). `generateStaticParams` combinado com uma
página que lê `searchParams` não produz HTML parcialmente estático nesta configuração — ela só faria
sentido com Cache Components habilitado (fora de escopo desta fase, PERF-03 é Fase 14). Conclusão:
`/categoria/[slug]` é dinâmica pelo mesmo motivo e do mesmo jeito que `/catalogo` já é — nenhum
`generateStaticParams`, nenhum `export const dynamic`, nenhum `revalidate` explícito (o cache por tag
via `fetchStrapi`/webhook continua sendo o mecanismo, igual à Home e ao catálogo).

**Consequência para o hard constraint "build depende do CMS estar no ar":** essa dependência já existe
hoje (Home é SSG e busca no build). A rota de categoria, por ser dinâmica, **não adiciona** uma nova
dependência de build-time — ela busca em request-time, igual ao catálogo. Isso é uma boa notícia para o
risco de build, não uma mudança de risco.

**`notFound()` para slug desconhecido:** `getCategoriaPorSlug(locale, slug)` já retorna `Categoria |
null` (mesmo contrato de `getProdutoPorSlug`). `if (!categoria) notFound()` é suficiente — mesmo padrão
já em produção em `catalogo/page.tsx` para `isLocale`. Confirmado contra a doc oficial instalada
(`not-found.md`): "Invoking `notFound()` throws... call it in the render path" — chamar direto no corpo
da função async do Server Component (não dentro de um `try/catch` que a suprimiria) é o padrão correto,
e é exatamente o que o projeto já faz.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | não | Rota pública, sem autenticação (mesmo modelo do catálogo/Home) |
| V3 Session Management | não | Sem sessão — estado vive só na URL (`searchParams`), como já decidido para o catálogo |
| V4 Access Control | sim | `PUBLIC_READ` em `cms/src/index.ts` — os 2 content-types novos (`subcategoria`, `comparativo-led`) precisam entrar na lista com `find`/`findOne` (findOne opcional para o single type, ver achado acima); nenhuma outra ação (`create`/`update`/`delete`) deve ser liberada ao role `public` |
| V5 Input Validation | sim | `zod` em `src/lib/cms/schemas.ts` para os 4 campos/entidades novos; `parseFiltrosDaUrl` continua sendo o único ponto onde `searchParams` cru vira valor confiável (allowlist por parâmetro, nunca aceitar string arbitrária como chave de filtro Strapi) |
| V6 Cryptography | não | Nenhum dado sensível ou segredo introduzido nesta fase |

### Known Threat Patterns for este stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Injeção de chave de filtro arbitrária via `?sub=<qualquer coisa>` virando `filters[subcategorias][slug][$in]` sem checar allowlist | Tampering | `AllowlistDinamica.subcategorias` resolvida no servidor a partir de `getSubcategorias(locale, categoriaSlug)`, nunca aceitar valor de URL sem checagem — mesmo padrão já aplicado a `categorias`/`cores`/`tiposDeEvento` em `parseFiltrosDaUrl` |
| Bloco de Dynamic Zone órfão (`blocos.comparativo-led`) sendo colado numa `page` qualquer, duplicando o comparativo fora de `telas-de-led` | Tampering / Repudiation de conteúdo | É exatamente o risco que D-08 já eliminou ao escolher single type dedicado em vez de reusar o bloco da Dynamic Zone — nenhuma ação adicional necessária além de não reverter essa decisão |
| Content-type novo sem entrada em `PUBLIC_READ` vazando erro 403 para o público, ou pior, ficando aberto a `create`/`update` por engano de configuração manual no admin | Elevation of Privilege / Information Disclosure | `garantirPermissoesPublicas` (bootstrap) é a única fonte de verdade — nenhuma permissão deve ser configurada manualmente no admin fora desse código, mesmo padrão já estabelecido pelo projeto |

## Sources

### Primary (HIGH confidence)
- `docs.strapi.io/cms/backend-customization/models` — confirmação de que `relation.target` só aceita
  content-type, não componente `[CITED]`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-static-params.md` —
  comportamento de `generateStaticParams`/`dynamicParams` no Next 16 instalado neste projeto `[CITED]`
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md` — comportamento de
  `notFound()` no Next 16 instalado `[CITED]`
- Código-fonte do repositório (lido integralmente nesta sessão): `cms/src/api/category/.../schema.json`,
  `cms/src/api/product/.../schema.json`, `cms/src/api/tipo-de-evento/.../schema.json`,
  `cms/src/api/faq-item/.../schema.json`, `cms/src/components/shared/subcategoria.json`,
  `cms/src/components/blocos/comparativo-led.json`, `cms/src/index.ts`,
  `src/app/api/revalidate/route.ts`, `src/lib/catalogo/filtros.ts`, `src/lib/cms/adapters.ts`,
  `src/lib/cms/schemas.ts`, `src/components/catalogo/EstadoSemResultados.tsx`,
  `src/components/analytics/EmissorFiltroAplicado.tsx`, `src/app/[locale]/catalogo/page.tsx`,
  `src/app/[locale]/page.tsx`, `cms/Dockerfile`, `projeto-base/All Music Rentals - Categoria.dc.html`,
  `projeto-base/uploads/` (listagem de arquivo) `[VERIFIED]`

### Secondary (MEDIUM confidence)
- `docs/DEPLOY.md`, `docs.strapi.io` (busca geral sobre relações em componentes, resultados
  parcialmente contraditórios de issues do GitHub — usados só para contexto, não como base da
  recomendação final, que se apoia na doc oficial de `models`)

### Tertiary (LOW confidence)
- Nenhum achado desta pesquisa se apoia só em busca não verificada — todos os pontos MEDIUM/LOW estão
  listados no Assumptions Log acima com o risco explícito.

## Metadata

**Confidence breakdown:**
- Modelagem CMS (4 mudanças de schema): HIGH — verificado contra schema.json real + doc oficial do
  Strapi sobre limite de relação em componente
- Refactor de `filtros.ts`: HIGH — verificado contra os 5 consumidores reais no código; a estratégia
  aditiva foi desenhada especificamente para o `Record<IdGrupoFiltro>` duplicado encontrado
- Seed/upload de imagem: MEDIUM — confirmado que as imagens existem e que o volume de produção é a
  armadilha real (Pitfall 3), mas o mecanismo exato de upload fica como Open Question 1 para o planner
  decidir com o usuário
- Rota e fetch de dados: HIGH — mesmo padrão já em produção no catálogo, só adaptado ao path param extra

**Research date:** 2026-08-22
**Valid until:** 30 dias (stack estável; risco de defasagem baixo — nenhuma dependência nova, apenas
extensão de padrões já em produção)
