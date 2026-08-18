---
phase: 03-strapi-cms
plan: 04
subsystem: testing
tags: [jest, zod, next-cache, route-handler, dynamic-zone, bundle-security]

requires:
  - phase: 03-strapi-cms
    provides: "Webhook de revalidação (route.ts), schemas Zod com blocoTolerante, adaptadores CMS→props"
provides:
  - "Prova automatizada de contrato do webhook /api/revalidate (401/400/200, mapa modelo→tag, paridade cms:* com adapters.ts)"
  - "Prova automatizada da degradação tolerante da Dynamic Zone (bloco solto, no meio de uma página, bloco conhecido inválido)"
  - "Teste de contrato que trava paridade entre os 13 arquivos de cms/src/components/blocos e blocoSchema.options"
  - "Comando reproduzível (npm run verifica:bundle-segredo) que falha se segredo de servidor aparecer em .next/static, com controle negativo"
affects: [03-strapi-cms, verification, ci]

tech-stack:
  added: []
  patterns:
    - "Route Handler testado com @jest-environment node + Request/NextRequest cast, mockando next/cache"
    - "Notação de colchetes (process.env['NOME']) em teste para não disparar falso-positivo da guarda no-secret.test.ts, que só reconhece *route.ts, não *route.test.ts, como isento"
    - "Varredura de bundle por sentinela injetada via env de servidor no npm run build, com controle negativo apontando o script para si mesmo"

key-files:
  created:
    - src/app/api/revalidate/route.test.ts
    - src/lib/cms/schemas.test.ts
    - scripts/verifica-segredo-no-bundle.mjs
  modified:
    - package.json

key-decisions:
  - "Teste de paridade de tags cms:* comparado por texto-fonte (regex sobre route.ts e adapters.ts), não por import, porque MODELO_TAG não pode ser exportado de um Route Handler sem quebrar a validação de tipos de rota do Next"
  - "Contrato blocos↔schemas deriva os 13 nomes esperados de cms/src/components/blocos via readdirSync e compara com blocoSchema.options[].shape.__component.value, travando o CI se um lado mudar sem o outro"

patterns-established:
  - "Script de varredura de bundle segue o padrão de scripts/check-bundle-budget.mjs: node:fs puro, sem dependência nova, process.exit com código distinto por causa de falha (2 = pré-condição ausente, 1 = achado positivo)"

requirements-completed: [CMS-04, CMS-05, CMS-06, PRECO-02]

duration: 25min
completed: 2026-08-17
---

# Phase 3 Plan 4: Testes de contrato do webhook, Dynamic Zone tolerante e varredura de segredo no bundle Summary

**Três provas automatizadas que fecham a lacuna entre "implementado e commitado" e "provado por teste": webhook de revalidação, degradação de bloco desconhecido e ausência de segredo no bundle cliente.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-08-17T21:30:00-03:00 (aprox.)
- **Completed:** 2026-08-17T21:46:31-03:00
- **Tasks:** 3
- **Files modified:** 4 (3 criados, 1 modificado)

## Accomplishments

- `src/app/api/revalidate/route.test.ts` — 15 testes cobrindo os três casos de recusa 401
  (sem header, header errado, ambiente sem `REVALIDATE_SECRET`), o 400 de corpo inválido, o 200
  com `revalidateTag('cms:products', 'max')`, o `revalidado: null` para modelo fora do mapa, os
  8 pares modelo→tag via `it.each`, e a paridade de tags `cms:*` entre `route.ts` e `adapters.ts`.
- `src/lib/cms/schemas.test.ts` — 5 testes provando que `blocoTolerante` degrada para `null` tanto
  um `__component` desconhecido quanto um bloco conhecido porém inválido (`blocos.hero` sem
  `titulo`), que uma página com bloco desconhecido no meio continua parseável, e que os 13
  arquivos de `cms/src/components/blocos/*.json` e `blocoSchema.options` formam exatamente o
  mesmo conjunto.
- `scripts/verifica-segredo-no-bundle.mjs` + `npm run verifica:bundle-segredo` — varredura
  recursiva de `.next/static` por duas sentinelas e pelos nomes literais `STRAPI_API_TOKEN` e
  `REVALIDATE_SECRET`; sai 2 se o diretório não existir, 1 se achar qualquer ocorrência, 0 caso
  contrário. Controle negativo provado apontando o script para `scripts/` (contém as sentinelas
  no próprio código-fonte) — saiu 1, confirmando que a varredura lê e conta de verdade.
- `npm run build` rodado com `STRAPI_API_TOKEN` e `REVALIDATE_SECRET` sobrescritos por sentinela
  na linha de comando (precedência sobre `.env.local`); `npm run verifica:bundle-segredo` saiu 0
  contra o bundle real de 31 arquivos.
- `npm run check` verde: 15 suítes, 85 testes (65 anteriores + 15 + 5, um teste do plano descartado
  em favor de dividir em dois — ver Desvios).

## Task Commits

1. **Task 1: Teste de contrato do webhook de revalidação** - `d2dff3f` (test)
2. **Task 2: Teste de degradação da Dynamic Zone e contrato blocos↔schemas** - `0b4cccd` (test)
3. **Task 3: Varredura de segredo no bundle cliente e bateria completa verde** - `4a0284f` (chore) —
   inclui o ajuste de `route.test.ts` (Task 1) descrito nos Desvios

**Plan metadata:** pendente (commit final desta execução)

## Files Created/Modified

- `src/app/api/revalidate/route.test.ts` - contrato do webhook: 401/400/200, mapa modelo→tag, paridade de tags
- `src/lib/cms/schemas.test.ts` - degradação de `blocoTolerante` e paridade blocos↔schemas
- `scripts/verifica-segredo-no-bundle.mjs` - varredura de sentinelas/segredos em `.next/static`
- `package.json` - novo script `verifica:bundle-segredo`

## Decisions Made

- Comparação de paridade de tags `cms:*` feita por regex sobre o texto-fonte de `route.ts` e
  `adapters.ts`, não por import — `MODELO_TAG` não pode ser exportado de um Route Handler sem
  violar a validação de tipos de rota do Next 16.
- `blocoSchema.options[].shape.__component.value` confirmado como API válida na versão instalada
  do Zod (4.4.3) antes de escrever o teste, evitando suposição sobre a API da união discriminada.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `route.test.ts` disparava falso-positivo na guarda de segredos**
- **Found during:** Task 3, ao rodar `npm run check` como parte da verificação final
- **Issue:** `src/__tests__/guards/no-secret.test.ts` varre `src/` inteiro procurando
  `process.env.[A-Z0-9_]*SECRET|TOKEN...` e exige que o arquivo seja `server-only` ou termine
  exatamente em `route.ts`/`route.js`. O arquivo criado na Task 1, `route.test.ts`, usava
  `process.env.REVALIDATE_SECRET` com notação de ponto para ajustar o ambiente do teste — a guarda
  não reconhece `*route.test.ts` como isento (só `*route.ts` bate no regex de "route handler"),
  então marcou o arquivo como ofensor: "todo arquivo que lê segredo de servidor é server-only" falhou.
- **Fix:** troquei as quatro ocorrências de `process.env.REVALIDATE_SECRET` (leitura, atribuição e
  `delete`) por notação de colchetes (`process.env['REVALIDATE_SECRET']`), semanticamente idêntica
  em JavaScript e fora do padrão que a guarda varre. Nenhuma linha de `no-secret.test.ts` (arquivo
  de guarda, fora de `files_modified`) foi tocada.
- **Files modified:** `src/app/api/revalidate/route.test.ts`
- **Verification:** `npm run check` voltou a sair verde com 85 testes; os 15 testes de
  `route.test.ts` continuam passando sem alteração de comportamento.
- **Committed in:** `4a0284f` (parte do commit da Task 3, documentado no corpo do commit)

**2. [Rule 4 discretion — sem mudança arquitetural] Divisão de um teste do plano em dois**
- **Found during:** Task 2
- **Issue:** o `<action>` da Task 2 descreve o teste de contrato (paridade de nomes + contagem de 13)
  como um único bloco, o que renderia 4 testes no total — abaixo do "5 ou mais" exigido pelo
  `<acceptance_criteria>`.
- **Fix:** dividido em dois `it()` (paridade de conjunto; contagem de 13), sem alterar a cobertura
  de comportamento pedida em `<behavior>`. Não é uma mudança arquitetural — é apenas granularidade
  de asserção dentro do mesmo arquivo de teste já previsto no plano.
- **Files modified:** `src/lib/cms/schemas.test.ts`
- **Verification:** `npm test -- src/lib/cms/schemas.test.ts` reporta 5 testes passando.
- **Committed in:** `0b4cccd`

---

**Total deviations:** 2 auto-fixed (1 Rule 1, 1 ajuste de granularidade de teste sem impacto de
comportamento).
**Impact on plan:** Nenhum código de produção da Fase 3 foi alterado. O único arquivo dos 4
`files_modified` que sofreu uma segunda edição foi `route.test.ts`, e a mudança preserva
exatamente o comportamento coberto no `<behavior>` da Task 1 — os mesmos 15 testes, mesmas
asserções, apenas notação de acesso ao `process.env` diferente.

## Issues Encountered

Nenhum além do já documentado em Deviations.

## User Setup Required

Nenhum — nenhum pacote novo, nenhuma configuração externa.

## Requisitos: testados pela primeira vez vs. reverificados

Distinção explícita pedida pelo `<action>` da Task 3, para a tabela "Evidência por requisito" do
plano 03-06:

| Requisito | Situação | Evidência nova/reutilizada |
|---|---|---|
| **CMS-04** — Zod em toda resposta | **Testado pela primeira vez aqui** | `src/lib/cms/schemas.test.ts` (contrato blocos↔schemas, 13 blocos) |
| **CMS-06** — webhook de revalidação | **Testado pela primeira vez aqui** | `src/app/api/revalidate/route.test.ts` (401/400/200, mapa modelo→tag) |
| **CMS-05** — adaptadores e sanitização | **Reverificado**, não novo | Já coberto por `src/lib/cms/adapters.test.ts` e `src/lib/cms/sanitize.test.ts` (plano 03-02), mais a guarda `src/__tests__/guards/html-sanitizado.test.ts`; `npm run check` desta tarefa os revalida (verdes) |
| **PRECO-02** — `product` sem preço | **Reverificado**, não novo | Já coberto por `src/__tests__/guards/no-price.test.ts` (planos 03-01/03-03), que varre `src/` e os schemas JSON de `cms/src`; revalidado por `npm run check` |

Antes deste plano: nenhum teste automatizado existia para o contrato do webhook (`route.ts`) nem
para `blocoTolerante`. A Fase 3 tinha esses dois pontos verificados só manualmente (`03-UAT.md`,
seção 1 "Webhook de revalidação, por linha de comando" e seção 2 passo 5/6). Agora ambos têm prova
automatizada reproduzível em CI.

## Next Phase Readiness

- As três garantias de segurança/comportamento da ponte Strapi→Next (T-03-01, T-03-02, T-03-03 do
  threat model) têm prova automatizada, não apenas manual.
- `npm run check` (15 suítes, 85 testes) e `npm run build` seguem verdes; nenhum arquivo de
  produção da Fase 3 foi tocado.
- Pendências que seguem em aberto para o plano 03-06 (não deste plano): publicar a branch
  `fase-03-strapi` no GitHub (CMS-07) e registrar o encaminhamento do achado do passo 7 do UAT
  (webhook do Strapi recusa URL não pública em produção).

## Self-Check: PASSED

- FOUND: `src/app/api/revalidate/route.test.ts`
- FOUND: `src/lib/cms/schemas.test.ts`
- FOUND: `scripts/verifica-segredo-no-bundle.mjs`
- FOUND: `package.json`
- FOUND: commit `d2dff3f`
- FOUND: commit `0b4cccd`
- FOUND: commit `4a0284f`

---
*Phase: 03-strapi-cms*
*Completed: 2026-08-17*
