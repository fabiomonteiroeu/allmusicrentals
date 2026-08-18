---
phase: 04-home
plan: 02
subsystem: ui
tags: [styled-components, nextjs-app-router, error-boundary, strapi, design-system]

# Dependency graph
requires:
  - phase: 03-strapi-cms
    provides: "getNavPrincipal/getColunasRodape/getSettingsGlobais em src/lib/cms/adapters.ts, validados com Zod na borda"
  - phase: 02-design-system (implícito, via 04-CONTEXT.md)
    provides: "Typography, Button, Skeleton, GlobalStyle, TopBar, Footer, Header, MobileMenu já construídos"
provides:
  - "TopBar/Header/MobileMenu/Footer montados uma única vez em src/app/[locale]/layout.tsx, com dados do Strapi e fallback estático em CMS vazio"
  - "error.tsx do segmento [locale] — primeiro error boundary do projeto, prop retry (Next 16.3)"
  - "Extensões E1-E4 do design system: Eyebrow $sobreEscuro, Heading $nivel=h1 com leading 0.92, Button $variante=pretoSolido, primitivo Spinner"
  - "Keyframe amrMod em GlobalStyle.ts (mosaico do Hero) e prefers-reduced-motion zerando também animation-delay"
  - "Item 6 de docs/divergencias.md fechado: hrefs de CTA do cabeçalho apontam para rotas reais com prefixo de locale, não mais âncoras #led/#luzsom"
affects: [04-home (planos 04-03 a 04-06, blocos da Home consomem E1-E4 e o chrome montado), 05-catalogo (reusa Button pretoSolido/Spinner na busca)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prop-com-default-estático em TopBar (mesmo padrão já usado por Header/Footer/MobileMenu): a prop recebe o dado do CMS, o default aponta para o módulo estático src/lib/site/navigation.ts"
    - "nav.length > 0 ? nav : undefined / colunas.length > 0 ? colunas : undefined — nunca passar [] a um componente com default estático, ou o default é sobrescrito por uma lista vazia"
    - "Chrome buscado uma única vez no layout do segmento (Promise.all), não em cada page.tsx"
    - "error.tsx do App Router usa retry() (Next 16.3+), não reset(); nunca renderiza error.message/stack/digest no cliente"

key-files:
  created:
    - src/components/feedback/Spinner.tsx
    - src/components/chrome/chrome-cms.test.tsx
    - src/app/[locale]/error.tsx
  modified:
    - src/components/primitives/Typography.tsx
    - src/components/primitives/Button.tsx
    - src/components/primitives/primitives.test.tsx
    - src/components/showcase/Showcase.tsx
    - src/lib/theme/GlobalStyle.ts
    - src/components/chrome/TopBar.tsx
    - src/components/chrome/Footer.tsx
    - src/app/[locale]/layout.tsx
    - src/lib/cms/adapters.ts

key-decisions:
  - "MobileMenu não é montado no layout — Header.tsx já o renderiza internamente (linha 248), confirmado por leitura completa do arquivo antes de decidir"
  - "getSettingsGlobais passou a tratar 404 do Strapi como 'CMS vazio' (retorna null), não como erro — Strapi devolve 404 (não 200 com data:null) para um single-type sem localização publicada; só pt-BR está semeado hoje, en/es quebravam o build inteiro"
  - "ctaHref/orcamentoHref do Header no layout usam rotas reais com prefixo de locale (/[lang]/solicitar-orcamento, /[lang]/meu-orcamento), aceitando 404 até as Fases 5/8 existirem, por decisão travada do 04-CONTEXT.md"

requirements-completed: [HOME-01, HOME-04]

# Metrics
duration: 15min
completed: 2026-08-18
---

# Phase 4 Plan 02: Chrome do CMS + extensões E1-E4 do design system Summary

**Chrome (TopBar/Header/MobileMenu/Footer) passa a ser montado uma única vez em `[locale]/layout.tsx` com dados reais do Strapi (fallback estático em CMS vazio), primeiro `error.tsx` do projeto com `retry`, e as 4 extensões de design system (Eyebrow, Heading, Button, Spinner) que os blocos da Home vão consumir.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-08-18T18:24:48Z
- **Completed:** 2026-08-18T18:39:16Z
- **Tasks:** 3
- **Files modified:** 12 (9 modificados + 3 criados)

## Accomplishments
- `TopBar`/`Header`/`Footer` finalmente montados na árvore — antes `[locale]/layout.tsx` só renderizava `StyledRegistry` + `StoreProvider` + `children`, sem nenhum chrome.
- Nav e rodapé do chrome vêm de `getNavPrincipal`/`getColunasRodape`/`getSettingsGlobais` (Strapi), com fallback automático ao módulo estático quando o CMS não tem conteúdo — fechando o item 6 de `docs/divergencias.md` (hrefs de âncora `#led`/`#luzsom` → slugs reais).
- Extensões E1 (`Eyebrow $sobreEscuro`), E2 (`Heading` leading 0.92 só em h1), E3 (`Button $variante="pretoSolido"`) e E4 (`Spinner`) prontas, testadas e visíveis na showcase.
- Keyframe `amrMod` (mosaico do Hero) somado ao inventário central, e `prefers-reduced-motion` agora zera também `animation-delay` — sem essa linha, o mosaico e o stagger dos skeletons ficariam presos em opacidade 0 sob movimento reduzido.
- `error.tsx` do segmento `[locale]` criado com a prop `retry` (não `reset`, que a documentação do Next 16.3 desencoraja), sem vazar `error.message`/`stack`/`digest`.

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Task 1: Extensões E1-E4 do design system e keyframe amrMod** - `d20cee3` (feat)
2. **Task 2: TopBar e Footer aceitam dados do CMS por prop** - `f1fafa9` (feat)
3. **Task 3: Montar o chrome do CMS no layout do locale e criar o error boundary** - `c84fd62` (feat, inclui o auto-fix em `adapters.ts`)

_Nota: os commits `fafdd08`/`0168521`/`0b47236` intercalados no `git log` pertencem ao plano paralelo `04-01` (analytics/eslint/next.config), não a este plano._

## Files Created/Modified
- `src/components/primitives/Typography.tsx` - `Eyebrow` ganha `$sobreEscuro`; `Heading` usa `leading.displayApertado` só em `$nivel="h1"`
- `src/components/primitives/Button.tsx` - novo `case 'pretoSolido'` no switch de variante
- `src/components/feedback/Spinner.tsx` (novo) - primitivo visual consumindo `amrSpin`
- `src/lib/theme/GlobalStyle.ts` - keyframe `amrMod`; `prefers-reduced-motion` zera `animation-delay`
- `src/components/showcase/Showcase.tsx` - nova seção demonstrando E1-E4
- `src/components/primitives/primitives.test.tsx` - 5 testes novos (Eyebrow ×2, Heading ×2, Button ×1)
- `src/components/chrome/TopBar.tsx` - `TopBarProps` com `tagline`/`contato`, default estático
- `src/components/chrome/Footer.tsx` - `FooterProps` ganha `contato`, default estático
- `src/components/chrome/chrome-cms.test.tsx` (novo) - 5 testes cobrindo override do CMS e fallback
- `src/app/[locale]/layout.tsx` - `Promise.all` das 3 buscas + chrome montado; CTAs com rota real
- `src/app/[locale]/error.tsx` (novo) - error boundary do segmento, prop `retry`
- `src/lib/cms/adapters.ts` - `getSettingsGlobais` trata 404 do Strapi como CMS vazio (ver Deviations)

## Decisions Made
- `MobileMenu` não é montado no layout: confirmado por leitura integral de `Header.tsx` que a linha 248 já o renderiza internamente, repassando `itens`/`ativoHref`/`ctaHref`/`ctaLabel`. Montar de novo produziria `id="menu-mobile"` duplicado.
- CTAs do cabeçalho (`ctaHref`, `orcamentoHref`) passam a apontar para as rotas reais prefixadas por locale (`/[lang]/solicitar-orcamento`, `/[lang]/meu-orcamento`) mesmo dando 404 até as Fases 5 e 8 existirem — decisão já travada em `04-CONTEXT.md` ("CTAs apontam para as rotas finais, mesmo antes de existirem").

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `getSettingsGlobais` quebrava o build inteiro quando o CMS não tem localização publicada**
- **Found during:** Task 3, ao rodar `npm run build` (critério de aceite da tarefa)
- **Issue:** `fetchStrapi` lança exceção para qualquer resposta não-2xx. O Strapi, para um single-type sem entrada localizada (só `pt-BR` está semeado em `settings-globais`; `en`/`es` não), devolve **404** em vez de `200` com `data: null`. `getSettingsGlobais` só tratava o caso `data: null`, então o build quebrava ao prerender `/en` e `/es` — exatamente o cenário de "CMS vazio" que o `must_haves.truths` deste plano exige que o chrome sobreviva.
- **Fix:** `getSettingsGlobais` agora envolve a chamada a `fetchStrapi` em `try/catch`; se o erro for especificamente `"Strapi 404 em settings-globais"`, retorna `null` (mesmo contrato de "sem settings" que já existia para `data: null`). Qualquer outro erro (falha de validação Zod, 5xx) continua propagando normalmente.
- **Files modified:** `src/lib/cms/adapters.ts`
- **Verification:** `npm run build` conclui gerando as 3 rotas de locale (`pt-BR`/`en`/`es`) e `npm run check` fica verde (19 suítes, 102 testes)
- **Committed in:** `c84fd62` (parte do commit da Task 3)

---

**Total deviations:** 1 auto-fixed (1 bug bloqueador)
**Impact on plan:** Necessário para o próprio critério de aceite da Task 3 (`npm run build` concluindo) e para o `must_haves.truths` do plano ("com o CMS vazio, o chrome ainda renderiza... em vez de aparecer sem menu"). `adapters.ts` não estava em `files_modified`, mas o fix é local, mínimo e não altera contrato de tipo (`SettingsGlobais | null` continua o mesmo). Sem escopo novo.

## Issues Encountered
Nenhum além do documentado em Deviations.

## User Setup Required
None - nenhuma configuração externa necessária.

## Next Phase Readiness
- `TopBar`/`Header`/`MobileMenu`/`Footer` funcionam com dados reais do Strapi em toda rota `/[locale]`, prontos para os planos 04-03 a 04-06 (blocos da Home).
- As extensões E1 (`Eyebrow $sobreEscuro`), E2 (`Heading` leading apertado), E3 (`Button $variante="pretoSolido"`) e E4 (`Spinner`) estão disponíveis para o Hero, a busca grande e os painéis de LED.
- `error.tsx` cobre falhas de `getPagina`/`getProdutos`/`getAvaliacoes` da Home sem derrubar o chrome.
- Nenhum bloqueio identificado para os próximos planos da Fase 4.

---
*Phase: 04-home*
*Completed: 2026-08-18*

## Self-Check: PASSED
