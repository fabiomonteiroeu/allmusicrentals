---
phase: 05-catalogo
plan: 03
subsystem: cms
tags: [strapi, i18n, taxonomia, bootstrap, postgres, contagemSolicitacoes]

# Dependency graph
requires:
  - phase: 05-catalogo (05-01)
    provides: lista final de 11 rótulos de tipo de evento confirmada no checkpoint (Outro com exibirNoFiltroDoCatalogo:false)
provides:
  - Content-type `tipo-de-evento` (taxonomia unificada) no Strapi, com leitura pública e escrita fechada
  - Relação manyToMany `product.tiposDeEvento` preenchida nos 10 produtos a partir de `aplicacoes`
  - Campo `product.contagemSolicitacoes` (integer, default 0, localized:false) sincronizado com o Postgres e sem NULL residual
  - Backfill idempotente de bootstrap que corrige registros pré-existentes quando um campo `default` novo é adicionado ao schema
affects: [05-04, 05-05, 05-06, 05-07, 05-08, fase-09-solicitacao-orcamento]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Seed idempotente no bootstrap do Strapi: findFirst por slug/campo único -> create -> publish, só quando ausente"
    - "Backfill idempotente de campo `default` recém-adicionado: filtra por null/undefined, corrige via document API (update + publish), nunca via UPDATE direto no Postgres"

key-files:
  created:
    - cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json
    - cms/src/api/tipo-de-evento/controllers/tipo-de-evento.ts
    - cms/src/api/tipo-de-evento/routes/tipo-de-evento.ts
    - cms/src/api/tipo-de-evento/services/tipo-de-evento.ts
  modified:
    - cms/src/api/product/content-types/product/schema.json
    - cms/src/index.ts

key-decisions:
  - "D-01 executada: tipo de evento passa a ser taxonomia de primeira classe (manyToMany), aplicacoes permanece para texto livre editorial"
  - "contagemSolicitacoes: 0 nos 10 produtos existentes via backfill idempotente no bootstrap, não via default do schema.json (que só se aplica em criação nova) — decisão do usuário no checkpoint bloqueante da Task 3"

patterns-established:
  - "Pattern: quando um atributo `default` é adicionado a um content-type já povoado, o backfill de registros existentes precisa de uma função de bootstrap dedicada (idempotente, via document API, publicando), porque o Strapi/Postgres não faz backfill automático de coluna nova"

requirements-completed: [CATA-02, CATA-03]

# Metrics
duration: 55min
completed: 2026-08-19
---

# Phase 05 Plan 03: Taxonomia tipo-de-evento + contagemSolicitacoes Summary

**Content-type `tipo-de-evento` sincronizado no Postgres com 11 rótulos, relação `tiposDeEvento` preenchida nos 10 produtos via migração de `aplicacoes`, e `contagemSolicitacoes` corrigido de NULL para 0 por backfill idempotente no bootstrap.**

## Performance

- **Duration:** ~55 min (retomada a partir do checkpoint bloqueante da Task 3)
- **Tasks:** 3/3 (Task 1 e 2 concluídas por executor anterior; Task 3 [BLOCKING] concluída nesta sessão)
- **Files modified:** 6 (4 criados + 2 modificados)

## Accomplishments
- Taxonomia `tipo-de-evento` existe no banco, com leitura pública (`200`) e escrita pública fechada (`403`)
- Os 10 produtos têm `tiposDeEvento` preenchido a partir de `aplicacoes` (zero vazios), com `aplicacoes` preservado
- `contagemSolicitacoes` existe no banco e é observável via `GET /api/products` com valor `0` nos 10 produtos — não apenas no `schema.json` em disco
- Bug latente identificado e corrigido antes de afetar a Fase 9: o `"default": 0` do schema não faz backfill de registros pré-existentes, deixando `NULL` no Postgres, que rankearia incorretamente em `ORDER BY ... DESC` (`NULLS FIRST`)

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: Content-type `tipo-de-evento` e os dois campos novos em `product`** - `86a9e6d` (feat)
2. **Task 2: Permissões públicas, seed idempotente da taxonomia e migração de `aplicacoes`** - `7b3d1d9` (feat)
3. **Task 3 (correção aprovada no checkpoint): backfill idempotente de `contagemSolicitacoes`** - `333f634` (fix)

_Nota: a Task 3 é `type="checkpoint:human-verify"` — não modifica arquivos por si só além da correção aprovada pelo usuário no próprio checkpoint. A correção acima foi commitada como tarefa própria, conforme instruído._

**Plan metadata:** (a ser gerado no commit final desta sessão)

## Files Created/Modified
- `cms/src/api/tipo-de-evento/content-types/tipo-de-evento/schema.json` - taxonomia unificada, 11 rótulos possíveis, `exibirNoFiltroDoCatalogo` controla visibilidade no filtro do catálogo
- `cms/src/api/tipo-de-evento/controllers/tipo-de-evento.ts` - boilerplate `createCoreController`
- `cms/src/api/tipo-de-evento/routes/tipo-de-evento.ts` - boilerplate `createCoreRouter`
- `cms/src/api/tipo-de-evento/services/tipo-de-evento.ts` - boilerplate `createCoreService`
- `cms/src/api/product/content-types/product/schema.json` - relação `tiposDeEvento` (manyToMany) e campo `contagemSolicitacoes` (integer, default 0, localized:false)
- `cms/src/index.ts` - `PUBLIC_READ` com `tipo-de-evento`, seed da taxonomia, `migrarAplicacoesParaTiposDeEvento`, e a função nova `garantirContagemSolicitacoes` (backfill idempotente)

## Decisions Made
- Ordenação e vocabulário da taxonomia: herdados do checkpoint de 05-01 (11 rótulos, `Outro` oculto do filtro do catálogo)
- Mapeamento `Festa` → `Festa privada` na migração de `aplicacoes`, conforme SUMMARY de 05-01
- **Backfill idempotente no bootstrap** para `contagemSolicitacoes` (ver Deviations abaixo) — decisão explícita do usuário no checkpoint bloqueante desta Task 3, entre as alternativas discutidas

## Deviations from Plan

### Auto-fixed Issues (aprovado pelo usuário no checkpoint bloqueante)

**1. [Rule 2 - Missing Critical, aprovado explicitamente pelo usuário] Backfill idempotente de `contagemSolicitacoes` no bootstrap**
- **Found during:** Task 3 (verificação bloqueante) — Prova 5 original falhou: `curl` mostrava `contagemSolicitacoes: null` nos 10 produtos, esperado `0`
- **Diagnóstico:** o `"default": 0` do `schema.json` só é aplicado pelo ORM do Strapi na **criação** de um registro novo. Não vira `DEFAULT` de coluna no Postgres, nem faz backfill dos 10 produtos já cadastrados quando a coluna nova é adicionada no boot. Resultado: os 10 produtos ficaram com `contagemSolicitacoes = NULL`. O sintoma era invisível hoje (10 valores `NULL` uniformes empatam e o desempate `nome:asc` assume), mas em Postgres `ORDER BY x DESC` é `DESC NULLS FIRST` — um produto com `NULL` (zero solicitações) rankearia **acima** de um produto com solicitações reais assim que a Fase 9 começasse a incrementar o contador. Deixar `NULL` no banco plantava um bug que só apareceria na Fase 9.
- **Fix:** nova função `garantirContagemSolicitacoes(strapi)` em `cms/src/index.ts`, chamada no `bootstrap` depois de `migrarAplicacoesParaTiposDeEvento`. Para cada produto do locale padrão (`pt-BR`) com `contagemSolicitacoes` nulo/indefinido: `update` para `0` via document API + `publish` do documento (o campo está num content-type com `draftAndPublish: true`, e `GET /api/products` lê a versão publicada — atualizar só o draft não resolveria a prova). Envolvida em `try/catch` defensivo, no mesmo estilo do bootstrap atual. Idempotente: filtra por nulo/indefinido, então a partir do segundo boot é no-op.
- **Files modified:** `cms/src/index.ts`
- **Verificação:** ver seção "Evidência observável (Task 3)" abaixo — as 6 provas de `curl` reexecutadas, incluindo a idempotência via `docker compose restart cms`
- **Committed in:** `333f634`

---

**Total deviations:** 1 auto-fixed com aprovação explícita do usuário (1 missing critical / bug latente)
**Impact on plan:** Correção essencial para a integridade do dado que sustenta a ordenação "Mais solicitados" da Fase 9. Sem escopo além do aprovado no checkpoint.

## Evidência observável (Task 3) — saídas literais

### Prova 1 — `GET /api/tipo-de-eventos` sem token responde 200
```
$ curl -s -g -o /dev/null -w '%{http_code}' 'http://localhost:1337/api/tipo-de-eventos?locale=pt-BR'
200
```

### Prova 2 — 11 registros, slugs corretos, `Outro` oculto do filtro
```
$ curl -s -g 'http://localhost:1337/api/tipo-de-eventos?locale=pt-BR&pagination[pageSize]=100'
```
`meta.pagination.total: 11`. Slugs, em ordem: `evento-corporativo`, `casamento`, `aniversario`,
`festa-privada`, `show`, `festival`, `feira`, `ativacao-de-marca`, `formatura`,
`evento-ao-ar-livre`, `outro`. O registro `outro` é o único com `"exibirNoFiltroDoCatalogo": false`;
todos os demais têm `true`.

### Prova 3 — 10 produtos, zero com `tiposDeEvento` vazio
```
$ curl -s -g 'http://localhost:1337/api/products?locale=pt-BR&populate=tiposDeEvento&pagination[pageSize]=100'
```
total: 10
vazios: []

```
Mesa Bistrô Preta com Tampo Redondo -> ['evento-corporativo', 'feira', 'festa-privada']
Capa Preta para Mesa Retangular de 6 Pés -> ['evento-corporativo', 'casamento', 'feira']
Mesa Alta Redonda de Alumínio -> ['evento-corporativo', 'casamento', 'aniversario', 'festa-privada', 'feira', 'ativacao-de-marca']
Guarda-sol Externo Bege de 10 Pés -> ['casamento', 'aniversario', 'festa-privada', 'evento-ao-ar-livre', 'feira']
Painel de LED P1.9mm -> ['evento-corporativo', 'casamento', 'show', 'ativacao-de-marca']
Painel de LED P3.9mm -> ['show', 'festival', 'evento-ao-ar-livre', 'ativacao-de-marca']
Pacote Palco + Painel de LED -> ['show', 'festival', 'evento-corporativo', 'ativacao-de-marca']
Operação Técnica de Painel de LED -> ['show', 'festival', 'evento-corporativo', 'ativacao-de-marca']
Lounge Externo com Sofá e Mesa Baixa -> ['casamento', 'festa-privada', 'ativacao-de-marca', 'evento-ao-ar-livre']
Capa de Spandex para Mesa de Coquetel -> ['evento-corporativo', 'casamento', 'feira', 'ativacao-de-marca']
```

### Prova 4 — `POST /api/tipo-de-eventos` sem token é recusado
```
$ curl -s -g -o /dev/null -w '%{http_code}' -X POST 'http://localhost:1337/api/tipo-de-eventos' -H 'Content-Type: application/json' -d '{"data":{"nome":"Teste"}}'
403
```

### Prova 5 — `contagemSolicitacoes` presente e igual a `0` nos 10 produtos (a que falhava antes da correção)
```
$ curl -s -g 'http://localhost:1337/api/products?locale=pt-BR&fields[0]=nome&fields[1]=contagemSolicitacoes&pagination[pageSize]=100' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const d=JSON.parse(s).data;console.log(d.length, d.every(p=>p.contagemSolicitacoes===0))})"
10 true
```
Todos os 10 produtos (ids 36-45) devolvem `"contagemSolicitacoes": 0` — antes da correção, a mesma
one-liner imprimia `10 false` com o valor `null`.

**Prova complementar de localização (o campo é `localized:false`):**
```
$ curl -s -g 'http://localhost:1337/api/products?locale=en&fields[1]=contagemSolicitacoes&pagination[pageSize]=100' | node -e "...."
0 true   # (0 registros — não há conteúdo de produto traduzido em en/es ainda; .every() em array vazio é vacuamente true, não é uma prova positiva)

$ curl -s -g 'http://localhost:1337/api/products?locale=es&...'
0 true   # mesmo caso: 0 registros
```
Não há produtos publicados em `en`/`es` ainda (traduções editoriais pendentes, fora de escopo desta
fase). Portanto não há risco de `null` residual nesses locales hoje — o campo `localized:false`
compartilha o mesmo valor entre locales do mesmo documento, então quando a tradução editorial for
feita, o valor `0` (ou o contador real, se já incrementado) será herdado automaticamente, sem
necessidade de backfill adicional.

### Prova 6 — filtro por `tiposDeEvento.slug` devolve subconjunto estrito
```
$ curl -s -g 'http://localhost:1337/api/products?locale=pt-BR&filters[$and][0][tiposDeEvento][slug][$in][0]=casamento&populate=tiposDeEvento'
```
total encontrados: 6 (de 10)
```
Capa Preta para Mesa Retangular de 6 Pés -> ['evento-corporativo', 'casamento', 'feira']
Mesa Alta Redonda de Alumínio -> ['evento-corporativo', 'casamento', 'aniversario', 'festa-privada', 'feira', 'ativacao-de-marca']
Guarda-sol Externo Bege de 10 Pés -> ['casamento', 'aniversario', 'festa-privada', 'evento-ao-ar-livre', 'feira']
Painel de LED P1.9mm -> ['evento-corporativo', 'casamento', 'show', 'ativacao-de-marca']
Lounge Externo com Sofá e Mesa Baixa -> ['casamento', 'festa-privada', 'ativacao-de-marca', 'evento-ao-ar-livre']
Capa de Spandex para Mesa de Coquetel -> ['evento-corporativo', 'casamento', 'feira', 'ativacao-de-marca']
```

### Logs do bootstrap (primeiro boot após a correção)
```
[seed] permissões públicas garantidas
[seed] categorias garantidas
[seed] tipos de evento garantidos
[seed] menu e rodapé garantidos
[seed] migração aplicacoes→tiposDeEvento: 0 produto(s) migrado(s)
[seed] contagemSolicitacoes: 10 produto(s) inicializado(s)
```
(A migração `aplicacoes→tiposDeEvento` reporta `0 migrado(s)` porque os 10 produtos já haviam sido
migrados no boot anterior, executado pelo executor da Task 2 — comportamento idempotente esperado.
Nenhum `strapi.log.warn` de valor órfão apareceu em nenhum dos dois boots.)

### Prova de idempotência (`docker compose restart cms`)
```
$ docker compose restart cms
$ docker compose logs cms | grep '\[seed\]' | tail -6
[seed] permissões públicas garantidas
[seed] categorias garantidas
[seed] tipos de evento garantidos
[seed] menu e rodapé garantidos
[seed] migração aplicacoes→tiposDeEvento: 0 produto(s) migrado(s)
[seed] contagemSolicitacoes: 0 produto(s) inicializado(s)
```
Segundo boot: `0 produto(s) inicializado(s)` — confirma que o backfill é no-op quando não há mais
nada a corrigir. A Prova 5 foi reexecutada depois do restart e continuou `10 true`.

## Verificação geral do plano
- `node -e` de validação dos dois `schema.json`: `ok`
- `cd cms && npx tsc --noEmit -p tsconfig.json`: sai 0, sem erros
- `npm run verifica:bundle-segredo`: `✓ Nenhum segredo de servidor encontrado no bundle.`
- `npx jest`: `PASS (231) FAIL (0)`
- `npm run typecheck`: sai 0
- `npm run lint`: `ESLint: No issues found`
- `npm run format:check`: `All matched files use Prettier code style!`

## Issues Encountered
- Nenhum além do já diagnosticado e resolvido (ver Deviations). A reexecução completa das 6 provas
  não regrediu nenhuma delas.

## Pendência de conferência humana (item 6 do `how-to-verify` da Task 3)

**Não marcado como concluído.** Requer inspeção visual no admin do Strapi
(`http://localhost:1337/admin`):
- Confirmar que "Tipo de Evento" aparece como content-type no Content Manager
- Abrir um dos 10 produtos e confirmar que a relação `tiposDeEvento` aparece preenchida na UI

Esta verificação é inerentemente visual/manual e não pode ser automatizada por `curl`. O orquestrador
deve levar este item ao usuário antes de considerar a Task 3 (e o plano 05-03) totalmente encerrada.

## User Setup Required
None - nenhuma configuração externa necessária. O backfill roda automaticamente no bootstrap do CMS.

## Next Phase Readiness
- A taxonomia `tipo-de-evento`, a relação `tiposDeEvento` e o campo `contagemSolicitacoes` estão
  sincronizados com o Postgres e prontos para os planos seguintes da Fase 5 (filtros do catálogo,
  ordenação "Mais solicitados")
- A Fase 9 (formulário de solicitação de orçamento) pode incrementar `contagemSolicitacoes` com
  segurança — não há mais `NULL` residual que distorceria `ORDER BY ... DESC`
- Bloqueio remanescente: conferência visual humana no admin do Strapi (ver seção acima)

---
*Phase: 05-catalogo*
*Completed: 2026-08-19*

## Self-Check: PASSED
- FOUND: .planning/phases/05-catalogo/05-03-SUMMARY.md
- FOUND: 86a9e6d
- FOUND: 7b3d1d9
- FOUND: 333f634
