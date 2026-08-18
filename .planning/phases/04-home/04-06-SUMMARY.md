---
phase: 04-home
plan: 06
subsystem: ui
tags: [react, styled-components, server-components, cms, i18n, a11y]

# Dependency graph
requires:
  - phase: 04-home (04-02)
    provides: extensões E1-E4 do design system (Eyebrow $sobreEscuro, Heading leading, Button
      pretoSolido, Spinner) e Showcase.tsx já com as seções de chrome/extensões
provides:
  - "ComoFuncionaBloco (Bloco 6): 4 etapas numeradas + aviso de não-reserva vindo de bloco.aviso"
  - "DiferenciaisBloco (Bloco 7): grade de 5 diferenciais com divisórias de 1px via gap"
  - "AvaliacoesBloco (Bloco 8): estados cheio e vazio, com nota formatada por locale"
  - "AvaliacaoSkeleton: estado carregando exportado e testado, visível na Showcase"
affects: [04-07 (renderizador da Dynamic Zone e page.tsx), 05-catalogo, 06-categoria]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bloco de conteúdo = Server Component sem 'use client', mesmo usando styled-components e
      compondo componentes client (Notice, Container, Button, Eyebrow, Heading)"
    - "Extensão de design system por composição local quando o primitivo compartilhado atende
      só um caso de uso (E6 — estado vazio de avaliações não alterou EmptyState.tsx)"
    - "Formatador Intl.* instanciado uma vez por render do bloco, nunca dentro de um .map()"

key-files:
  created:
    - src/components/blocos/ComoFuncionaBloco.tsx
    - src/components/blocos/ComoFuncionaBloco.test.tsx
    - src/components/blocos/DiferenciaisBloco.tsx
    - src/components/blocos/DiferenciaisBloco.test.tsx
    - src/components/blocos/AvaliacoesBloco.tsx
    - src/components/blocos/AvaliacoesBloco.test.tsx
  modified:
    - src/components/showcase/Showcase.tsx

key-decisions:
  - "O aviso do Bloco 6 vem de bloco.aviso (schema real), não de settings-globais como o
    UI-SPEC afirmava — settingsGlobaisSchema não tem campo de microcopy legal"
  - "Estado vazio das avaliações implementado com a mesma profundidade do estado cheio: é a
    garantia real de produção enquanto o CMS não tiver avaliação publicada"
  - "Extensão E6 (layout 2 colunas do estado vazio) resolvida por composição local dentro de
    AvaliacoesBloco.tsx, sem tocar em EmptyState.tsx (rota 2, conforme 04-PLAN-OUTLINE Q4)"
  - "AvaliacaoSkeleton exportado e usado na Showcase, mas nunca renderizado dentro de
    AvaliacoesBloco na Home nem envolvido em qualquer mecanismo de streaming — é garantia de
    componente testável (HOME-03), não de visibilidade em produção"
  - "Nota de avaliação formatada com Intl.NumberFormat(locale, { minimumFractionDigits: 1,
    maximumFractionDigits: 1 }) — vírgula em pt-BR, ponto em en/es, sem fixar separador"

patterns-established:
  - "Correção de spec registrada em comentário no código-fonte quando o UI-SPEC diverge do
    schema real, apontando a linha do schema que prova a divergência"

requirements-completed: [HOME-03, HOME-04]

# Metrics
duration: ~70min
completed: 2026-08-18
---

# Phase 4 Plan 06: Blocos 6, 7 e 8 da Home — como funciona, diferenciais e avaliações Summary

**ComoFuncionaBloco, DiferenciaisBloco e AvaliacoesBloco (cheio/vazio/carregando) como Server Components, fechando HOME-03 com o estado vazio real das avaliações e o skeleton testável na Showcase.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 3/3 completos
- **Files modified:** 7 (4 criados de par tsx+test, 2 arquivos de AvaliacoesBloco reaproveitados na Task 3, 1 modificado — Showcase.tsx)

## Accomplishments

- Bloco 6 (Como funciona) renderiza as 4 etapas numeradas do CMS com o aviso de não-reserva vindo do campo correto do schema (`bloco.aviso`), corrigindo uma imprecisão do UI-SPEC.
- Bloco 7 (Diferenciais) renderiza a grade de 5 itens com divisórias de 1px via `gap` sobre fundo cinza, e padding fixo de 64px (único bloco sem `clamp()`, fiel ao layout-fonte).
- Bloco 8 (Avaliações) implementa o estado vazio real de lançamento com a cópia exata do UI-SPEC (eyebrow, H3, caixa "ESTRUTURA DA AVALIAÇÃO", CTA) e o estado cheio com nota formatada por locale, empresa condicional e cidade/tipo condicionais.
- `AvaliacaoSkeleton` exportado, testado e visível na Showcase do design system, sem entrar na Home publicada nem introduzir `<Suspense>`/`cacheComponents`.
- Nenhum depoimento fictício do layout-fonte (Marina Alcântara, Rodrigo Beltrão, Camila Ferreira, Diego Nascimento) entrou no código — fixtures de teste usam nomes obviamente fictícios ("Cliente Um", "Cliente Dois").

## Task Commits

Each task was committed atomically:

1. **Task 1: ComoFuncionaBloco e DiferenciaisBloco — Blocos 6 e 7** - `b096767` (feat)
2. **Task 2: AvaliacoesBloco — estados cheio e vazio (extensão E6 por composição local)** - `d7ab12f` (feat)
3. **Task 3: AvaliacaoSkeleton — estado carregando como componente testável, na showcase** - `db6c3f2` (feat)

_Este plano não gerou commit de metadata separado (SUMMARY criado após os três commits de tarefa; STATE.md/ROADMAP.md não atualizados via `gsd-sdk`, conforme instrução do orquestrador desta wave)._

## Files Created/Modified

- `src/components/blocos/ComoFuncionaBloco.tsx` - Bloco 6: 4 etapas numeradas + `Notice` com aviso de não-reserva vindo de `bloco.aviso`
- `src/components/blocos/ComoFuncionaBloco.test.tsx` - 5 testes: numeração, fallback/override do aviso, lista vazia, axe
- `src/components/blocos/DiferenciaisBloco.tsx` - Bloco 7: grade de 5 diferenciais, divisórias via `gap: 1px`, padding fixo 64px
- `src/components/blocos/DiferenciaisBloco.test.tsx` - 3 testes: itens, lista ausente, axe
- `src/components/blocos/AvaliacoesBloco.tsx` - Bloco 8 completo: cabeçalho comum, estado cheio (`Grade`/`Card`), estado vazio (`CaixaVazia`, extensão E6 local) e `AvaliacaoSkeleton` exportado (363 linhas)
- `src/components/blocos/AvaliacoesBloco.test.tsx` - 10 testes: estado vazio, estado cheio, i18n da nota, empresa condicional, nota nula, axe (2 estados), skeleton (contagem, larguras, ausência no estado vazio, axe)
- `src/components/showcase/Showcase.tsx` - nova seção "Avaliações — estado carregando" exibindo `<AvaliacaoSkeleton />`

## Decisions Made

- **Correção ao UI-SPEC (Bloco 6):** o documento afirma que o aviso de não-reserva vem de `settings-globais`, mas `settingsGlobaisSchema` (src/lib/cms/schemas.ts linhas 53-65) não tem campo de microcopy legal — quem tem é `blocos.como-funciona.aviso` (linha 228). Implementado usando `bloco.aviso` com o texto do layout-fonte como fallback; comentário no código aponta a divergência para quem ler depois.
- **Extensão E6 (estado vazio de avaliações em 2 colunas):** resolvida por composição local dentro de `AvaliacoesBloco.tsx` (rota 2 do `04-PLAN-OUTLINE.md`), sem alterar `EmptyState.tsx` — confirmado por `git diff --name-only` não listando esse arquivo em nenhum dos 3 commits.
- **AvaliacaoSkeleton como componente exportado, não interno:** necessário para a Showcase importá-lo. Comentário no código evita a palavra "Suspense" (para não conflitar com o critério de aceite automatizado que verifica sua ausência), descrevendo a decisão como "limite de streaming resolvido no prerender" — mesma decisão travada A3, redação ajustada para não colidir com a guarda de grep do próprio plano.
- **Formatação de nota:** `Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })`, instanciado uma vez por render do bloco (não por avaliação), conforme T-04-25 do threat model.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Teste de larguras do skeleton usava `.style.width` em vez de `getComputedStyle`**
- **Found during:** Task 3 (testes de `AvaliacaoSkeleton`)
- **Issue:** `SkeletonBar` define largura via CSS gerado por `styled-components` (classe), não via atributo `style` inline — `(barra as HTMLElement).style.width` retornava string vazia em todos os casos, falhando o teste.
- **Fix:** Troquei para `getComputedStyle(barra).width`, padrão já usado no projeto em `src/components/primitives/primitives.test.tsx` para asserções de CSS computado em jsdom.
- **Files modified:** `src/components/blocos/AvaliacoesBloco.test.tsx`
- **Verification:** `npx jest src/components/blocos/AvaliacoesBloco.test.tsx` — 10/10 testes verdes.
- **Committed in:** `db6c3f2` (Task 3 commit)

**2. [Rule 1 - Bug] Comentários explicativos continham literalmente as strings vetadas pelos critérios de aceite automatizados**
- **Found during:** Tasks 1, 2 e 3, ao rodar os `grep -c` dos critérios de aceite
- **Issue:** Comentários redigidos para explicar decisões técnicas citavam, sem querer, os próprios trechos que os critérios de aceite verificam como devendo aparecer **exatamente uma vez** (ex.: `tealLink` citado 2×, `clamp(` citado numa frase explicativa sobre o Bloco 7, `Intl.NumberFormat` citado 2×, os 4 nomes do layout-fonte citados no comentário do teste que os proíbe, e a palavra `Suspense` exigida pela redação do plano mas vetada pelo critério de aceite `grep -c "Suspense"` → 0).
- **Fix:** Reescrevi os comentários para preservar o significado sem repetir os literais vetados (ex.: "cor de link sobre fundo claro" em vez de "tealLink"; "padding fluido"/"clamp de padding" em vez de "clamp()"; referência a `docs/00-divergencias.md` item 13 em vez de citar os 4 nomes; "limite de streaming" em vez de "`<Suspense>`").
- **Files modified:** `src/components/blocos/ComoFuncionaBloco.tsx`, `src/components/blocos/DiferenciaisBloco.tsx`, `src/components/blocos/AvaliacoesBloco.tsx`, `src/components/blocos/AvaliacoesBloco.test.tsx`
- **Verification:** todos os `grep -c`/`grep -Ec` dos critérios de aceite das 3 tasks confirmados com a contagem exata pedida, após cada ajuste.
- **Committed in:** `b096767`, `d7ab12f`, `db6c3f2` (ajustados antes de cada commit de task, não depois)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 — bug de teste e conflito literal comentário-vs-grep)
**Impact on plan:** Nenhum impacto no comportamento entregue; ambos os ajustes são de teste/comentário, não de lógica de produção. Nenhum scope creep.

## Issues Encountered

- **Execução concorrente no mesmo working directory (sem worktree):** os planos 04-04 e 04-05 desta wave rodaram em paralelo no mesmo checkout git (não há isolamento por worktree neste projeto). Em dois momentos, `git add`/`git status` deste plano capturaram arquivos de outros planos (`SliderDeProdutos.tsx`, `DestaqueLedBloco.tsx`, `BuscaBloco.tsx`, `SearchBarGrande.tsx`) que estavam sendo staged simultaneamente por outro agente, e um `git commit` concorrente chegou a criar `.git/index.lock` momentaneamente. Resolvido sem nenhum `git reset --hard`/`git clean`: usei `git restore --staged <arquivo>` apontando só para os arquivos fora da minha fronteira, aguardei o lock liberar e revalidei `git diff --cached --name-only` antes de cada commit até conter só os meus 3 arquivos.
- Um erro de lint (`react-hooks/set-state-in-effect`) apareceu transitoriamente em `SliderDeProdutos.tsx` (arquivo do plano 04-05, fora da minha fronteira) durante uma verificação com `npx eslint .` no meio da Task 3. Registrei em `deferred-items.md` por escopo; antes de finalizar este plano, o executor do 04-05 já havia corrigido — removi o arquivo de itens diferidos por não haver mais nada pendente.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Blocos 6, 7 e 8 prontos para serem conectados ao renderizador da Dynamic Zone (plano 04-07): `ComoFuncionaBloco`/`DiferenciaisBloco` recebem só `{ bloco }`; `AvaliacoesBloco` recebe `{ bloco, locale, avaliacoes }` (avaliações vêm de `getAvaliacoes()` fora do próprio bloco, buscadas no `page.tsx`).
- `AvaliacaoSkeleton` está disponível para import em `src/components/blocos/AvaliacoesBloco.tsx` caso uma fase futura (14+, ao avaliar `cacheComponents`) queira efetivamente usá-lo como fallback de streaming — não é usado como tal nesta fase, por decisão travada.
- `npm run check` (28 suítes / 150 testes) e `npm run build` verdes no estado final do repositório, incluindo trabalho concorrente de outros planos da wave.
- Nenhum bloqueio conhecido para o plano 04-07 (renderizador + `page.tsx`) no que depende deste plano.

---
*Phase: 04-home*
*Completed: 2026-08-18*

## Self-Check: PASSED

Todos os 7 arquivos citados (`ComoFuncionaBloco.tsx`/`.test.tsx`, `DiferenciaisBloco.tsx`/`.test.tsx`,
`AvaliacoesBloco.tsx`/`.test.tsx`, `Showcase.tsx`) confirmados presentes no disco. Os 3 hashes de
commit (`b096767`, `d7ab12f`, `db6c3f2`) confirmados em `git log --oneline --all`.
