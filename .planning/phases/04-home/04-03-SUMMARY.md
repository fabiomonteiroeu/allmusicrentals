---
phase: 04-home
plan: 03
subsystem: ui
tags: [styled-components, server-components, dynamic-zone, hero, cta]

# Dependency graph
requires:
  - phase: 04-01
    provides: "emitirEvento em src/lib/analytics/dataLayer.ts (não consumido diretamente por este plano, mas porta única já disponível)"
  - phase: 04-02
    provides: "Eyebrow $sobreEscuro (E1), Heading $nivel=h1 com leading 0.92 (E2), Button $variante=pretoSolido (E3, não usado aqui), keyframe amrMod + prefers-reduced-motion zerando animation-delay em GlobalStyle.ts, next.config.ts com remotePatterns para localhost/cms:1337"
provides:
  - "HeroBloco (Bloco 1) e ChamadaFinalBloco (Bloco 9), Server Components puros, prontos para o renderizador da Dynamic Zone (plano 04-07)"
  - "Contrato de props { bloco, locale } que os planos 04-04/04-05/04-06 seguem, com bloco tipado por Extract<Bloco, { __component: '...' }>"
  - "Padrão de mosaico decorativo 100% CSS (sem JS de cliente) que qualquer bloco futuro com animação em cascata pode reusar"
affects: [04-07 (renderizador da Dynamic Zone consome os dois blocos)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mosaico do Hero: 72 células (12x6 fixo) geradas em loop no Server Component, sem window.matchMedia — o prefers-reduced-motion global (GlobalStyle.ts, plano 04-02) já zera animation-delay, então a checagem de movimento reduzido nunca precisa de JS"
    - "Contrato de bloco: bloco: Extract<Bloco, { __component: '...' }>; locale: Locale — sem spread {...bloco}, campos lidos explicitamente"
    - "Fallback de CTA: bloco.ctaXUrl ?? `/${locale}/rota-real` — nunca desabilita o botão, aceita 404 até a fase da rota existir (decisão travada em 04-CONTEXT.md)"

key-files:
  created:
    - src/components/blocos/HeroBloco.tsx
    - src/components/blocos/HeroBloco.test.tsx
    - src/components/blocos/ChamadaFinalBloco.tsx
    - src/components/blocos/ChamadaFinalBloco.test.tsx
  modified: []

key-decisions:
  - "Mosaico do Hero é 100% CSS server-rendered — sem 'use client', sem leitura de largura de tela, conforme instrução explícita do plano (divergência deliberada do layout-fonte, que usava JS)"
  - "ChamadaFinalBloco não fecha com SectionDivider de rodapé — o Footer já abre com a própria borda superior, comentado no código para não ser 'consertado' depois"

requirements-completed: [HOME-01, HOME-04]

# Metrics
duration: 25min
completed: 2026-08-18
---

# Phase 4 Plan 03: HeroBloco e ChamadaFinalBloco Summary

**Bloco 1 (Hero) e Bloco 9 (CTA final) da Home, os dois blocos escuros que abrem e fecham a página, como Server Components puros — o Hero com mosaico decorativo de 72 células em CSS puro (sem JS de cliente), e ambos fixando o contrato `{ bloco, locale }` que o restante da fase segue.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-18T18:50:00Z
- **Completed:** 2026-08-18T19:15:00Z
- **Tasks:** 2
- **Files modified:** 4 (todos criados)

## Accomplishments

- `HeroBloco` renderiza título (maior tipo da página, `Heading $nivel="h1"`), eyebrow sobre fundo escuro, subtítulo, citação com barra teal, dois CTAs para rotas reais e a legenda de vídeo, sobre um mosaico de 72 células (12×6) que degrada para fundo sólido `tinta900` quando o CMS não traz imagem — tudo sem uma linha de JS de cliente.
- O mosaico usa exatamente os números do layout-fonte: `background-size: 1200% 600%`, `background-position` fracionado por célula (`c/(11)*100%`, `r/(5)*100%`), `animation: amrMod 0.34s ease-out both` com `animation-delay: (r+c)*0.045+0.15s`, e o scrim com o gradiente de 5 paradas exato.
- `ChamadaFinalBloco` reusa a mesma família visual (seção escura, grid `auto-fit` de 2 colunas) para o CTA final "Comece a montar seu evento", abrindo com `SectionDivider` escuro e propositalmente sem divisor de rodapé.
- Contrato de props `{ bloco: Extract<Bloco, { __component: '...' }>; locale: Locale }` fixado nos dois arquivos, sem `{...bloco}` — cada campo é lido explicitamente, pronto para o renderizador da Dynamic Zone do plano 04-07.
- 7 testes novos (4 + 3), todos verdes: contagem exata de células do mosaico (72 com imagem, 0 sem imagem), hrefs de CTA com fallback de rota real, override de conteúdo do CMS sobre os defaults, e `axe` sem violações nos dois blocos.

## Task Commits

Cada tarefa foi commitada atomicamente:

1. **Task 1: HeroBloco — Bloco 1, com mosaico decorativo em CSS puro** - `5c46a9c` (feat)
2. **Task 2: ChamadaFinalBloco — Bloco 9, CTA final** - `9c5ebbd` (feat)

_Nota: os commits intercalados no `git log` (`b096767` 04-06, `9623f0b` 04-05) pertencem a planos paralelos da mesma fase, não a este plano._

## Files Created/Modified

- `src/components/blocos/HeroBloco.tsx` (novo, 187 linhas) — Server Component do Bloco 1, mosaico CSS puro
- `src/components/blocos/HeroBloco.test.tsx` (novo) — 4 testes (render completo, sem imagem, hrefs de CTA, axe)
- `src/components/blocos/ChamadaFinalBloco.tsx` (novo, 90 linhas) — Server Component do Bloco 9
- `src/components/blocos/ChamadaFinalBloco.test.tsx` (novo) — 3 testes (defaults, override do CMS, axe)

## Decisions Made

- **Movimento reduzido do mosaico sem JS:** seguindo a instrução explícita do plano, nenhuma checagem de `prefers-reduced-motion` foi adicionada em JS — o `GlobalStyle.ts` do plano 04-02 já zera `animation-delay` globalmente sob a media query, o que permite o Hero continuar 100% Server Component.
- **`ChamadaFinalBloco` sem divisor de rodapé:** documentado em comentário no próprio arquivo, para a conferência de fidelidade não tratar a ausência como defeito.
- **Tipo de `bloco.imagem`:** confirmado por leitura de `schemas.ts`/`adapters.ts` que o campo `imagem` de `blocos.hero` **não** passa pelo adaptador `adaptarImagem` (que só normaliza mídia dentro de `Produto`/`Categoria`) — o `Bloco` da união usa a forma crua do Strapi (`{ url, alternativeText, width, height } | null`). O `HeroBloco` lê `bloco.imagem?.url` diretamente; o teste usa uma URL já absoluta (`http://localhost:1337/uploads/x.jpg`), evitando qualquer resolução de URL relativa dentro do componente de apresentação.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - bloqueador de formatação] Prettier do projeto reformata CSS-in-JS embutido em `styled-components`, alterando espaçamento de `rgba()` e casas decimais**
- **Found during:** Task 1, ao commitar (hook `pre-commit` do `lint-staged` roda `prettier --write` em todo `.tsx` staged)
- **Issue:** O `.prettierrc` do projeto usa a formatação embutida padrão do Prettier (`embeddedLanguageFormatting: "auto"`), que reconhece `styled.div\`...\`` como CSS e reformata: `rgba(11,12,13,0.96)` → `rgba(11, 12, 13, 0.96)` e `rgba(11,12,13,0.40)` → `rgba(11, 12, 13, 0.4)`. Isso já acontece em outros arquivos do projeto (`Spinner.tsx`, comparado nesta sessão) — não é uma escolha deste plano, é o comportamento padrão da toolchain já em uso desde a Fase 2. O critério de aceite `grep -c "rgba(11,12,13,0.12) 100%"` (sem espaço) do plano não sobrevive a este hook.
- **Fix:** Nenhuma mudança de código — os valores numéricos permanecem exatamente os do UI-SPEC (`0.96`, `0.88`, `0.66`, `0.4` ≡ `0.40`, `0.12`), só o espaçamento textual mudou. Reverifiquei com grep tolerante a espaço (`rgba\(11, *12, *13, *0\.12\) 100%`) e confirmei 1 ocorrência.
- **Files modified:** `src/components/blocos/HeroBloco.tsx` (só o scrim)
- **Verification:** `npx jest`, `npx tsc --noEmit`, `npx eslint` no arquivo — todos verdes; grep tolerante a espaço confirma a presença do gradiente completo.
- **Committed in:** `5c46a9c`

**2. [Rule 1 - bug de critério de aceite] Comentário do `ChamadaFinalBloco.tsx` citava o identificador `SectionDivider` 3 vezes (import + uso + texto de comentário), quebrando o critério `grep -c "SectionDivider" == 2`**
- **Found during:** Task 2, verificação dos critérios de aceite
- **Issue:** O comentário de topo do arquivo explicava a ausência do divisor de rodapé citando literalmente `` `SectionDivider` ``, somando ao import e ao uso único de abertura.
- **Fix:** Reescrito o comentário para "divisor de rodapé" em vez do nome do componente — o import + o único `<SectionDivider />` de abertura continuam sendo as duas ocorrências esperadas.
- **Files modified:** `src/components/blocos/ChamadaFinalBloco.tsx`
- **Verification:** `grep -c "SectionDivider" src/components/blocos/ChamadaFinalBloco.tsx` retorna 2.
- **Committed in:** `9c5ebbd`

---

**Total deviations:** 2 (1 constatação de tooling documentada, 1 ajuste de comentário) — nenhuma mudança de comportamento ou de valor visual.
**Impact on plan:** Nenhum. Os valores exatos do UI-SPEC (mosaico 12×6, `1200% 600%`, delay `(r+c)*0.045+0.15`, gradiente de 5 paradas, `52ch`, `auto-fit minmax(300px,1fr)`) foram todos verificados por grep após o hook de formatação e batem com o esperado, exceto pelo espaçamento cosmético do primeiro item.

## Issues Encountered

Nenhum além do documentado em Deviations. Durante a execução, `npx tsc --noEmit` mostrou erros em `src/components/blocos/SearchBarGrande.tsx` — arquivo de um plano paralelo (04-04, fora da fronteira deste plano) em progresso simultâneo; confirmado que não afeta `HeroBloco.tsx`/`ChamadaFinalBloco.tsx` isoladamente.

## User Setup Required

None - nenhuma configuração externa necessária.

## Next Phase Readiness

- `HeroBloco` e `ChamadaFinalBloco` estão prontos para o renderizador da Dynamic Zone (plano 04-07): basta `<HeroBloco bloco={blocoEstreitado} locale={locale} />` e `<ChamadaFinalBloco bloco={blocoEstreitado} locale={locale} />` dentro do `switch` sobre `__component`.
- O padrão de mosaico 100% CSS fica disponível como referência para qualquer bloco futuro que precise de animação em cascata sem JS de cliente.
- Nenhum bloqueio identificado para os planos 04-04, 04-05, 04-06 ou 04-07.

---
*Phase: 04-home*
*Completed: 2026-08-18*

## Self-Check: PASSED
