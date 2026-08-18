---
phase: 04-home
plan: 01
subsystem: analytics
tags: [dataLayer, ga4, eslint-flat-config, next-image, remotePatterns, view_item_list]

requires:
  - phase: 03-strapi-cms
    provides: "adaptarImagem lendo NEXT_PUBLIC_STRAPI_MEDIA_URL, guardas de varredura existentes (html-sanitizado, no-price) como molde"
provides:
  - "emitirEvento — porta única tipada de saída de eventos (MED-01)"
  - "EmissorViewItemList — componente client que dispara view_item_list uma vez por montagem (HOME-05)"
  - "Barreira dupla (lint + guarda de varredura) contra window.dataLayer/dataLayer.push soltos"
  - "images.remotePatterns autorizando next/image a servir uploads do Strapi (localhost/cms:1337)"
  - "NEXT_PUBLIC_STRAPI_MEDIA_URL documentada em .env.example"
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07]

tech-stack:
  added: []
  patterns:
    - "Porta única de eventos: todo dataLayer.push passa por emitirEvento(); testes de componente mockam @/lib/analytics/dataLayer, nunca inspecionam window.dataLayer"
    - "Barreira dupla: no-restricted-properties (eslint.config.mjs) + guarda de varredura (dataLayer-porta-unica.test.ts), ambas com lista de exceção fechada"
    - "Emissor client-only 'return null': ponte entre bloco Server Component e evento client-only, trava de emissão única via useRef (não array de dependências)"

key-files:
  created:
    - src/lib/analytics/dataLayer.ts
    - src/lib/analytics/dataLayer.test.ts
    - src/components/analytics/EmissorViewItemList.tsx
    - src/components/analytics/EmissorViewItemList.test.tsx
    - src/__tests__/guards/dataLayer-porta-unica.test.ts
  modified:
    - eslint.config.mjs
    - next.config.ts
    - .env.example

key-decisions:
  - "ItemDeListaGA4 omite estruturalmente todo campo monetário — prevenção em tempo de compilação, não só guarda em runtime"
  - "Trava de emissão única via useRef(false) com deps [], não [listaId, listaNome, itens] — itens é array novo a cada render do pai"
  - "Listas de exceção fechadas em 2 (eslint.config.mjs) e 3 entradas (guarda de varredura) — planos futuros mockam o módulo, não editam este arquivo"

patterns-established:
  - "Módulo de evento tipado por união discriminada em event, um membro por evento existente"
  - "images.remotePatterns restrito a host+porta+pathname específicos, nunca unoptimized nem wildcard de hostname"

requirements-completed: [MED-01, HOME-05]

duration: ~15min
completed: 2026-08-18
---

# Phase 4 Plan 1: Porta única de eventos + pré-requisito de imagem remota Summary

**Módulo `dataLayer` tipado (`emitirEvento`) com barreira dupla lint+teste, componente `EmissorViewItemList` para `view_item_list`, e `images.remotePatterns` autorizando uploads do Strapi em `next/image`.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-08-18T15:2x (aprox., ver primeiro commit)
- **Completed:** 2026-08-18T15:29:14-03:00 (último commit de tarefa)
- **Tasks:** 3/3
- **Files modified:** 8 (5 criados, 3 modificados)

## Accomplishments
- `emitirEvento` é a única forma de enfileirar evento no projeto, com fila segura (funciona antes do GTM existir na Fase 13).
- `ItemDeListaGA4`/`EventoDataLayer` impedem em tempo de compilação qualquer campo monetário — a regra inviolável de "sem preço" chega ao módulo de analytics.
- Barreira dupla provada ativa: regra ESLint `no-restricted-properties` testada com arquivo de teste real (falhou com exit 1, confirmado e removido) + guarda `dataLayer-porta-unica.test.ts` varrendo `src/`.
- `EmissorViewItemList` (client, `return null`) emite `view_item_list` uma vez por montagem via `useRef`, sem reemitir em re-renders — testado com mock do módulo, nunca inspecionando `window.dataLayer` diretamente.
- `next/image` autorizado a otimizar uploads do Strapi (`localhost:1337` e serviço `cms:1337`, `pathname: '/uploads/**'`), sem `unoptimized`.
- `NEXT_PUBLIC_STRAPI_MEDIA_URL` documentada em `.env.example`, fechando a dívida de infraestrutura de imagem da Fase 3.

## Task Commits

Each task was committed atomically:

1. **Task 1: Módulo dataLayer tipado como porta única (MED-01)** - `71026dc` (feat)
2. **Task 2: Barreira dupla — regra ESLint e guarda de varredura** - `0b47236` (feat)
3. **Task 3: Emissor client de view_item_list e host de imagem do Strapi** - `0168521` (feat)

_Nota: todos os commits foram passados pelo hook husky/lint-staged (eslint --fix + prettier), sem alterar comportamento._

## Files Created/Modified
- `src/lib/analytics/dataLayer.ts` - módulo único `'use client'`, exporta `emitirEvento`/`ItemDeListaGA4`/`EventoDataLayer`
- `src/lib/analytics/dataLayer.test.ts` - único teste da fase autorizado a tocar `window.dataLayer` (3 casos)
- `src/components/analytics/EmissorViewItemList.tsx` - componente client, `return null`, emite `view_item_list` uma vez por montagem
- `src/components/analytics/EmissorViewItemList.test.tsx` - mocka `@/lib/analytics/dataLayer`, 3 casos (emissão única, não-reemissão, sem DOM)
- `src/__tests__/guards/dataLayer-porta-unica.test.ts` - varredura de `src/` barrando `window.dataLayer`/`dataLayer.push` soltos, allowlist fechada em 3 entradas
- `eslint.config.mjs` - `no-restricted-properties` (2 descritores) + objeto de exceção fechado em 2 caminhos
- `next.config.ts` - `images.remotePatterns` (2 entradas: `localhost`/`cms`, porta `1337`, `pathname: '/uploads/**'`)
- `.env.example` - `NEXT_PUBLIC_STRAPI_MEDIA_URL=http://localhost:1337` sob o bloco público

## Decisions Made
- Nenhum campo monetário chega perto do tipo do evento — a omissão estrutural (não um filtro em runtime) é a defesa (Pitfall 4 do RESEARCH).
- Trava de emissão via `useRef` com array de dependências vazio, com comentário explicando por que `itens` não pode entrar nas deps (array novo a cada render do pai reemitiria o evento).
- Listas de exceção (ESLint e guarda) fechadas de propósito: qualquer plano futuro que precise emitir evento deve importar `emitirEvento` e mockar o módulo no teste, nunca reabrir a exceção — evita conflito de arquivo entre os planos paralelos da fase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Ajuste de redação] Docblock com termos monetários literais quebrava o próprio grep de aceite**
- **Found during:** Task 1
- **Issue:** o comentário inicial de `dataLayer.ts` citava explicitamente `price`, `discount`, `coupon` etc. para explicar a omissão — isso fazia `grep -Ec "price|value|currency|..."` retornar 2 em vez de 0, violando o critério de aceite literal da própria Task 1.
- **Fix:** reescrito o comentário para descrever a omissão sem nomear os campos proibidos ("nenhum campo monetário ou de e-commerce padrão do GA4").
- **Files modified:** `src/lib/analytics/dataLayer.ts`
- **Commit:** `71026dc` (parte do commit da Task 1, antes do commit final)

**2. [Rule 1 - Ajuste de redação] Docblock de `EmissorViewItemList` continha a string `window.dataLayer`, disparando a própria guarda que a Task 2 acabou de criar**
- **Found during:** Task 3
- **Issue:** o docblock explicava "porque `window.dataLayer` só existe no cliente" — a guarda `dataLayer-porta-unica.test.ts` (varredura literal de string, sem diferenciar comentário de código) sinalizou essa linha como violação.
- **Fix:** reescrito para "a fila de eventos só existe no navegador", sem citar `window.dataLayer` literalmente.
- **Files modified:** `src/components/analytics/EmissorViewItemList.tsx`
- **Commit:** `0168521`

**3. [Rule 1 - Ajuste de redação] Comentário sobre `unoptimized: true` em `next.config.ts` disparava o próprio grep de aceite que exige ausência da palavra**
- **Found during:** Task 3
- **Issue:** o critério de aceite exige `grep -c "unoptimized" next.config.ts` = 0, mas o comentário de segurança recomendado pelo plano citava `unoptimized: true` literalmente.
- **Fix:** reescrito para "NUNCA desligar a flag de otimização de imagem como atalho", preservando o alerta sem a palavra literal.
- **Files modified:** `next.config.ts`
- **Commit:** `0168521`

---

**Total deviations:** 3 auto-fixed (Rule 1, ajuste de redação em comentários — nenhuma mudança de comportamento).
**Impact on plan:** Nenhum impacto funcional; os três ajustes existem só para satisfazer os próprios critérios de aceite literais (grep sobre o código) sem perder a explicação em prosa em outro lugar (RESEARCH.md/PATTERNS.md já documentam o raciocínio completo).

## Issues Encountered

- **Verify command do plano usava `/tmp/amr-lint-probe.ts` para provar a regra ESLint ativa; o `eslint.config.mjs` deste projeto restringe a base path ao diretório do projeto**, então o arquivo em `/tmp` foi ignorado com warning "File ignored because outside of base path" (exit 0, não prova nada). Resolvido criando o arquivo de prova dentro de `src/lib/analytics/__amr-lint-probe.ts` (mesmo diretório do módulo, fora da exceção por nome de arquivo), confirmando `exit 1` com a mensagem da regra, e removendo o arquivo em seguida. A regra está provadamente ativa; só o caminho do arquivo de prova mudou.
- **Critério de aceite `grep -c "useRef" src/components/analytics/EmissorViewItemList.tsx` retorna 1 no plano, mas o resultado real é 2** — a linha de `import { useEffect, useRef } from 'react';` também contém a substring `useRef`, além da linha de uso (`const jaEmitiu = useRef(false);`). Isso é estruturalmente inevitável com import nomeado (a alternativa, `React.useRef` via `import * as React`, é um padrão fora de uso no projeto e não resolveria o grep, que casa a palavra em qualquer linha). Nenhuma ação tomada — o `useRef` está presente e funciona corretamente (confirmado pelo teste de não-reemissão); a contagem 2 em vez de 1 é uma característica do grep literal, não um problema de implementação.

## User Setup Required

None - nenhuma configuração de serviço externo necessária. `NEXT_PUBLIC_STRAPI_MEDIA_URL` já está documentada em `.env.example`; quem rodar `docker compose` com o profile `cms` já tem o valor padrão (`http://localhost:1337`) funcionando sem ação extra.

## Next Phase Readiness

- Os planos `04-03` a `04-07` (blocos da Home) já podem importar `emitirEvento`/`EmissorViewItemList` e montar `<Image>` apontando para uploads do Strapi sem novo trabalho de infraestrutura.
- Nenhum bloqueio conhecido. `npm run check` (typecheck + lint + test) e `npm run build` verdes nesta sessão.

---
*Phase: 04-home*
*Completed: 2026-08-18*

## Self-Check: PASSED
