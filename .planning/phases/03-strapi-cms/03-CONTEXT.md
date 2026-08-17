# Phase 3: Strapi (CMS) - Context

**Gathered:** 2026-08-17
**Status:** Ready for planning
**Source:** Orquestrador — derivado de `.planning/intel/` (ingest de 8 docs), dos ADRs travados e do código já implementado em `cms/src` e `src/lib/cms`

<domain>
## Phase Boundary

A Fase 3 entrega a camada de conteúdo do site: o modelo completo no Strapi 5, a ponte tipada e
segura entre Strapi e Next, e a documentação editorial que permite outra pessoa operar o CMS.

**A fase já está IMPLEMENTADA no código.** O que resta é (a) provar que funciona com o Strapi
rodando de verdade, (b) publicar a branch e (c) fechar as pendências documentais que o ingest
levantou. O planner NÃO deve replanejar a modelagem, o cliente, os adaptadores, a sanitização
nem o webhook — tudo isso existe, está commitado e está coberto por testes.

**Dentro do escopo:**
- Verificação de ponta a ponta com Strapi + Postgres em Docker (UAT da fase)
- Publicação da branch `fase-03-strapi` no GitHub
- Fechamento das divergências 5, 6, 7, 9, 11 e 12 contra o código real
- Correção de `docs/PLANO.md` e criação dos ADRs 003 e 004

**Fora do escopo (não fazer nesta fase):**
- Renderizar qualquer página de aplicação com dados do CMS — isso é a Fase 4 em diante
- Criar conteúdo editorial real (textos, produtos, imagens do cliente) — o seed é de **estrutura**,
  nunca de conteúdo fictício
- Configurar o Strapi de produção — isso é a Fase 17

</domain>

<decisions>
## Implementation Decisions

### Regra inviolável do produto (herdada, TRAVADA)
- Nenhum campo de preço, valor monetário ou pagamento existe em qualquer schema do Strapi.
  A guarda automatizada (`src/__tests__/guards/no-price.test.ts`) varre `src/` **e** `cms/src`,
  incluindo os `.json` dos content-types. Isso já está implementado e passando.
- A única cifra permitida no projeto inteiro é a "Faixa de investimento" em US$ da etapa 5 do
  formulário (Fase 9) — não existe no modelo do CMS.

### Modelo de conteúdo (JÁ IMPLEMENTADO — não replanejar)
- Single type: `settings-globais`.
- Collections: `menu-item`, `rodape-coluna`, `page`, `product`, `category`, `faq-item`,
  `avaliacao`, `solicitacao`.
- Componentes compartilhados: `shared.seo`, `shared.caracteristica`, `shared.medida`,
  `shared.variacao`, `shared.subcategoria`, `shared.pergunta-resposta`.
- Dynamic Zone `blocos` com 13 componentes: hero, busca, grade-de-categorias,
  produtos-em-destaque, destaque-led, como-funciona, diferenciais, avaliacoes, chamada-final,
  texto-rico, faq, formulario-contato, comparativo-led.
- i18n nos 3 locales com `pluginOptions.i18n.localized` por atributo — campos de conteúdo
  localizados, campos estruturais (ordem, visível, IDs de medição) não localizados.
- `avaliacao` tem `publicada` e `verificada`, e a descrição do content-type declara:
  avaliação REAL de cliente, **nenhum seed fictício em ambiente algum**.

### Camada Next ↔ Strapi (JÁ IMPLEMENTADA — não replanejar)
- `src/lib/cms/client.ts` — `import 'server-only'`; token e URL vêm de env de servidor, nunca
  `NEXT_PUBLIC_`. Toda resposta passa por `schema.safeParse` antes de virar dado; falha lança
  erro com o path do endpoint.
- `src/lib/cms/schemas.ts` — schemas Zod de todos os content-types. A Dynamic Zone é uma
  `discriminatedUnion` por `__component`, embrulhada em `blocoTolerante`: bloco de componente
  desconhecido vira `null` em vez de derrubar a página (o CMS pode ser publicado antes do deploy
  do front).
- `src/lib/cms/adapters.ts` — adaptadores CMS→props. Cada função declara suas tags de cache, e
  as chaves espelham exatamente o mapa `MODELO_TAG` do webhook.
- `src/lib/cms/sanitize.ts` — campos `richtext` do Strapi são **Markdown**. O caminho seguro é
  sempre markdown → HTML (`marked`) → allowlist estrita (`sanitize-html`) → tipo marcado
  `HtmlSeguro`. `h1` é rebaixado para `h2`, link externo ganha `rel="noopener noreferrer"`,
  esquemas limitados a http/https/mailto/tel.
- `src/app/api/revalidate/route.ts` — webhook protegido por `REVALIDATE_SECRET` em header,
  mapeia modelo do Strapi → tag e chama `revalidateTag(tag, 'max')`.

### Decisões travadas herdadas de fases anteriores
- **DEC-styled-components** (TRAVADA): busca de dados SEMPRE em Server Component; componentes
  estilizados nas folhas, recebendo dados por props. Os adaptadores existem exatamente para
  respeitar isso.
- **DEC-locale-padrao** (TRAVADA): `pt-BR` padrão, `en` e `es` adicionais, roteamento por prefixo.
  O parâmetro `locale` de toda chamada ao Strapi vem daí.

### Decisões novas do usuário (2026-08-17, TRAVADAS)
- **Rota canônica de produto: `/[locale]/[categoria]/[slug]`.** Consome-se na Fase 7, mas o ADR
  003 nasce aqui, no plano de fechamento documental.
- **Deploy: GHCR + Caddy.** ADR 004 nasce aqui pelo mesmo motivo; a nota "Decisão aberta" da
  Fase 17 do `docs/PLANO.md` deixa de valer.

### Como verificar a fase (define o plano de UAT)
- O Strapi sobe pelo profile `cms` do compose, com Postgres, e o admin abre em `localhost:1337`.
- O editor precisa conseguir: ver os 8 content-types e os 13 blocos; criar uma entrada de
  estrutura em pt-BR; propagar para `en` e `es`; publicar; e ver a revalidação acontecer.
- O webhook precisa ser exercitado de verdade — com o segredo correto (revalida) e com segredo
  errado (401).
- `npm run check` e `npm run build` verdes; guarda anti-preço varrendo `cms/src`.

### Claude's Discretion
- Como dividir os passos do UAT entre roteiro manual e script de apoio.
- Formato exato do registro de divergência fechada (manter o padrão já usado em
  `docs/00-divergencias.md` e `docs/divergencias.md`).
- Se o seed de estrutura precisa de ajuste para tornar o UAT reproduzível.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Modelo do CMS
- `cms/src/api/*/content-types/*/schema.json` — os 9 content-types reais, com i18n por atributo
- `cms/src/components/blocos/*.json` — os 13 blocos da Dynamic Zone
- `cms/src/components/shared/*.json` — seo, caracteristica, medida, variacao, subcategoria, pergunta-resposta
- `docker-compose.yml` — serviço `cms` no profile `cms`, com Postgres

### Camada Next
- `src/lib/cms/client.ts` — cliente server-only com validação Zod na borda
- `src/lib/cms/schemas.ts` — schemas de todos os tipos + Dynamic Zone tolerante
- `src/lib/cms/adapters.ts` — adaptadores CMS→props e as tags de cache
- `src/lib/cms/sanitize.ts` — sanitização de rich text e o tipo `HtmlSeguro`
- `src/app/api/revalidate/route.ts` — webhook e o mapa modelo→tag

### Guardas e testes
- `src/__tests__/guards/no-price.test.ts` — varredura anti-preço em `src/` e `cms/src`
- `src/__tests__/guards/no-secret.test.ts` — segredos fora do bundle cliente
- `src/__tests__/guards/html-sanitizado.test.ts` — todo `dangerouslySetInnerHTML` vem do sanitizador
- `src/lib/cms/*.test.ts` — cliente, adaptadores e sanitizador

### Documentação e decisões
- `docs/cms-fluxo-editorial.md` — fluxo editorial (criar em pt-BR, propagar en/es)
- `docs/00-divergencias.md` — itens 5, 6, 7, 9, 11, 12 ainda ⏳ AGUARDA DECISÃO
- `docs/divergencias.md` — divergências técnicas de execução (padrão D1)
- `docs/PLANO.md` — linha 92 obsoleta ("form 9 etapas"), cabeçalho de estado desatualizado, nota "Decisão aberta" na Fase 17
- `.planning/intel/decisions.md` — decisões consolidadas do ingest
- `.planning/INGEST-CONFLICTS.md` — os 4 avisos que originaram DOC-01/02/03

</canonical_refs>

<specifics>
## Specific Ideas

- A branch `fase-03-strapi` existe **apenas localmente**. O `origin` tem só `main`,
  `fase-01-fundacao` e `fase-02-design-system`. Publicá-la faz parte do aceite (CMS-07).
- Pelo fluxo de git do projeto, cada branch de fase descende da anterior, não de `main`.
- As divergências a fechar mapeiam assim: 5 (Header/nav), 6 (Rodapé), 7 (Card de produto) e
  9 (Toast) → conferir contra os componentes da Fase 2 em `src/components/`; 11 (produto como
  fonte única de metadados) e 12 (microcopy legal em `settings-globais`) → conferir contra os
  schemas da Fase 3.
- `docs/PLANO.md:92` diz "form 9 etapas" no fluxo e2e da Fase 16; o correto, já aprovado, é 5.

</specifics>

<deferred>
## Deferred Ideas

- Renderização dos blocos na tela — Fase 4 em diante.
- Conteúdo editorial real do cliente nos 3 idiomas — depende do cliente, entra junto com as
  páginas.
- Strapi de produção, backup e migração — Fase 17.
- Revisão de conteúdo trilíngue — Fase 16.

</deferred>

---

*Phase: 03-strapi-cms*
*Context gathered: 2026-08-17 pelo orquestrador, a partir da intel do ingest e do código implementado*
