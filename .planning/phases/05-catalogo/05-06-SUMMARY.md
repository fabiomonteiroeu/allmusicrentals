---
phase: 05-catalogo
plan: 06
subsystem: ui
tags: [radix-dialog, url-as-state, focus-trap, styled-components, jest, testing-library, a11y]

# Dependency graph
requires:
  - phase: 05-catalogo (05-02)
    provides: descreverChips, alternarValor, parseFiltrosDaUrl, contarFiltrosAtivos em src/lib/catalogo/filtros.ts
  - phase: 05-catalogo (05-05)
    provides: PainelDeFiltros (servido dentro do drawer, não reimplementado) e ToolbarDoCatalogo já despachando definirDrawerFiltros
  - phase: 05-catalogo (05-04)
    provides: rota /[locale]/catalogo e LayoutCatalogo onde drawer e chips são montados
provides:
  - ChipsDeFiltroAtivo — chips derivados da URL, com remoção individual e LIMPAR TUDO
  - DrawerDeFiltros — Radix Dialog servindo o mesmo PainelDeFiltros abaixo de 1080px, com foco preso, Esc e retorno de foco
  - Acesso mobile aos filtros fechado; feedback do que está aplicado visível
affects: [05-07, 05-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Primeiro consumidor de @radix-ui/react-dialog no projeto (o pacote já estava instalado, nunca importado em src/)'
    - 'Visibilidade de conteúdo teleportado por Portal: o wrapper de media query vai DENTRO do Portal, com display:contents por padrão e display:none em media.desktop — envolver Dialog.Root não afetaria o DOM teleportado'
    - 'Leitura fiel de searchParams multivalorados: helper paraRegistro usando getAll por chave, porque Object.fromEntries(searchParams.entries()) descarta valores repetidos como ?cor=Bege&cor=Preto'
    - 'Chips derivados da URL, nunca espelhados em estado local — mesma disciplina de URL-as-state estabelecida em 05-05'

key-files:
  created:
    - src/components/catalogo/ChipsDeFiltroAtivo.tsx
    - src/components/catalogo/ChipsDeFiltroAtivo.test.tsx
    - src/components/catalogo/DrawerDeFiltros.tsx
    - src/components/catalogo/DrawerDeFiltros.test.tsx
  modified:
    - src/app/[locale]/catalogo/page.tsx

key-decisions:
  - 'Chips sem estado local, por construção: leem useSearchParams(), convertem por paraRegistro (getAll), rodam parseFiltrosDaUrl com as allowlists recebidas por prop e chamam descreverChips. Fecha a armadilha 2 do RESEARCH §6 estruturalmente, não por teste.'
  - 'Allowlist de cor do chip é Object.keys(coresProduto) (paleta inteira), a mesma que page.tsx já usa em parseFiltrosDaUrl — allowlist de segurança (estável) e conjunto exibido (dinâmico, do CMS) seguem sendo listas com propósitos distintos, per D8. Nenhuma terceira fonte introduzida.'
  - 'O drawer serve o MESMO PainelDeFiltros de 05-05, sem reimplementar o painel.'
  - 'Envelope com display:contents dentro do Portal como a única forma de aplicar D7 a conteúdo teleportado sem quebrar o position:fixed dos filhos.'

patterns-established:
  - 'Portal + media query: o gate de visibilidade mora dentro do Portal, não em volta do Root'
  - 'searchParams multivalorados lidos por getAll, nunca por Object.fromEntries(entries())'
  - 'Foco preso e retorno de foco delegados ao Radix Dialog, sem sobrescrever os callbacks de foco/escape'

requirements-completed: [CATA-03, CATA-05]

# Metrics
duration: ~20min
completed: 2026-08-20
---

# Fase 05 — Plano 06: Drawer mobile de filtros e chips de filtro ativo

**Radix Dialog servindo o mesmo `PainelDeFiltros` abaixo de 1080px, com foco preso e retorno ao gatilho, mais chips de filtro ativo derivados da URL com remoção individual — sem nenhum estado local espelhando filtro.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-08-20T13:23:33-03:00 (primeiro commit)
- **Completed:** 2026-08-20T13:43:29-03:00 (último commit de código)
- **Tasks:** 3 de 3
- **Files modified:** 5 (4 criados, 1 modificado)

## Accomplishments

- **Armadilha nº 2 do RESEARCH §6 fechada por construção.** "Chips dessincronizados da URL — o chip some mas o filtro continua na query, ou vice-versa; só aparece ao usar de verdade (voltar no histórico, recarregar)." Não há como esse bug existir aqui: os chips não têm estado próprio, eles **derivam** da URL a cada render. A defesa é estrutural, não um teste que pode ser removido.
- **O painel não foi reimplementado.** O drawer serve o mesmo `PainelDeFiltros` de 05-05. Duas implementações do mesmo painel divergiriam com o tempo — o risco clássico de UI mobile duplicada.
- **Primeiro consumidor de Radix Dialog no projeto**, com foco preso e retorno de foco delegados ao Radix em vez de reescritos. O precedente do projeto (`MobileMenu.tsx`) não usa Radix e não gerencia foco, então não havia o que herdar.
- **Bug latente de leitura de URL evitado.** `Object.fromEntries(searchParams.entries())` descarta valores repetidos — `?cor=Bege&cor=Preto` viraria uma cor só. O helper `paraRegistro` usa `getAll` por chave. Como o projeto todo é multi-seleção (OR dentro do grupo, D-09), esse atalho teria quebrado exatamente o caso central da fase.

## Task Commits

1. **Task 1: `ChipsDeFiltroAtivo` — chips derivados da URL, com remoção individual e LIMPAR TUDO** — `ed9af9b` (feat)
2. **Task 2: `DrawerDeFiltros` — Radix Dialog com foco preso, Esc e retorno de foco** — `dc3f978` (feat)
3. **Task 3: Montar drawer e chips na rota** — `781283a` (feat)

**Plan metadata:** este SUMMARY (docs: complete plan)

## Files Created/Modified

- `src/components/catalogo/ChipsDeFiltroAtivo.tsx` — chips derivados de `descreverChips` sobre o que `parseFiltrosDaUrl` devolveu; remoção individual e `LIMPAR TUDO` preservando `q` e `ordenar`
- `src/components/catalogo/ChipsDeFiltroAtivo.test.tsx` — 7 testes; provam a derivação da URL e a preservação de `q`/`ordenar`
- `src/components/catalogo/DrawerDeFiltros.tsx` — Radix Dialog com `role="dialog"` nomeado "Filtros", servindo `PainelDeFiltros`; `Envelope` com `display: contents` dentro do Portal aplica D7
- `src/components/catalogo/DrawerDeFiltros.test.tsx` — 9 testes; montagem, nome acessível, `Escape` despachando o fechamento, botões do rodapé
- `src/app/[locale]/catalogo/page.tsx` — drawer e chips montados na rota

## Decisions Made

- **Allowlist do chip de cor é a paleta inteira (`Object.keys(coresProduto)`), não `coresDisponiveis`.** É a mesma allowlist que `page.tsx` já usa em `parseFiltrosDaUrl`. D8 registra essa assimetria como intencional: barreira de segurança não pode variar com conteúdo editorial do CMS. Usar `coresDisponiveis` aqui teria introduzido uma terceira fonte de verdade para o mesmo conceito.
- **`display: contents` no `Envelope`.** `Dialog.Portal` teleporta `Overlay` e `Content` para o fim do `<body>`, então uma media query em volta de `Dialog.Root` não alcançaria o DOM teleportado. O wrapper vai dentro do Portal, e `display: contents` evita interferir no `position: fixed` dos filhos.
- **Callbacks de foco e escape do Radix não foram sobrescritos.** Foco preso, retorno ao gatilho e `Escape` vêm do componente; reescrevê-los seria duplicar e divergir.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug in touched code] JSDoc de `DrawerDeFiltros.tsx` derrubava o próprio critério de aceitação**

- **Found during:** Task 2 (`DrawerDeFiltros`)
- **Issue:** o comentário explicava **quais props de foco/escape do Radix não estavam sendo sobrescritas** citando os nomes literais. Um critério de aceitação do plano verifica a **ausência** desses literais no arquivo (`grep -Eq 'onEscapeKeyDown|onCloseAutoFocus|onOpenAutoFocus|trapped'` esperando saída 1) — o comentário produzia falso positivo
- **Fix:** comentário reformulado sem citar os nomes exatos das props, preservando a explicação
- **Files modified:** `src/components/catalogo/DrawerDeFiltros.tsx`
- **Verification:** greps de aceitação reconferidos após o ajuste e após o `prettier --write` do lint-staged
- **Committed in:** `dc3f978` (commit da Task 2)

---

**Total deviations:** 1 auto-fixed (Rule 1 — ajuste textual em comentário; não é defeito de comportamento)
**Impact on plan:** nenhum scope creep. É o segundo caso desta fase em que um comentário explicativo cita literais que um critério verifica por ausência — o mesmo aconteceu no `error.tsx` do plano 05-04. Padrão a evitar em planos futuros: não citar em comentário strings que o próprio plano proíbe.

## Issues Encountered

- **Critério de aceitação da Task 3 com contagem de grep desatualizada.** O plano exige que `grep -c 'getProdutos' page.tsx` retorne `1`. O arquivo retorna `4` — mas **já retornava 4 antes desta wave**: são o import mais dois comentários herdados de 05-04/05-05, além da chamada real. O *intento* do critério está satisfeito e verificado: `grep -c 'getProdutos('` retorna exatamente **1** invocação. Nenhuma alteração foi feita para "consertar" a contagem textual — seria mutilar comentários corretos para satisfazer um número.

## Débito técnico registrado (decisão do orquestrador)

- **`limparFiltros` duplicada literalmente em dois arquivos.** A função (8 linhas, pura: reconstrói a `URLSearchParams` preservando só `q` e `ordenar`) é idêntica em `ChipsDeFiltroAtivo.tsx:94` e `DrawerDeFiltros.tsx:166`. O executor escalou a decisão em vez de extrair, porque `src/lib/catalogo/filtros.ts` não constava em `files_modified` do plano — disciplina correta.
  **Decisão:** **não extrair agora.** `filtros.ts` foi fechado em 05-02 e tem suíte própria; refatorá-lo com a fase em 6/8 e um plano de checkpoint à frente troca risco real por ganho cosmético. O destino natural é `filtros.ts`, que já é o dono da serialização de URL. Fica registrado para o gate de code review do fim da fase, e o risco a vigiar é uma **terceira** cópia aparecer.

- **`prefers-reduced-motion` tratado de forma oposta em dois planos da mesma fase.** Em 05-05 a regra local foi **removida** como correção Rule 1, porque `GlobalStyle.ts` já zera a duração globalmente (`PainelDeFiltros.tsx:65` documenta a ausência). Em 05-06 uma regra local foi **adicionada**, porque o plano exige essa media query literal como critério de aceitação explícito (`DrawerDeFiltros.tsx:68`). Ambas as escolhas estão documentadas inline e nenhuma é incorreta — a regra local é redundante, não danosa. Não viola D-07: `prefers-reduced-motion` é preferência do usuário, não breakpoint de viewport. Registrado como inconsistência de padrão a resolver no code review.

## Verification

Executada pelo orquestrador na árvore principal, após os 3 commits — o executor rodou apenas verificações focadas por tarefa, por protocolo (ver Issues do plano 05-05: dois executores foram encerrados por watchdog de stream ao rodar a suíte completa).

| Gate                              | Resultado                |
| --------------------------------- | ------------------------ |
| `npx jest`                        | **285 passam, 0 falham** |
| `npm run typecheck`               | exit 0                   |
| `npm run lint`                    | exit 0                   |
| `npm run format:check`            | exit 0                   |
| `npm run verifica:bundle-segredo` | exit 0                   |

Árvore de trabalho limpa. Confirmado por inspeção direta: **nenhuma `@media` literal de viewport** em `src/components/catalogo/` (D-07/D7 honrada — visibilidade só pelos helpers `media.mobile`/`media.desktop`), e `@radix-ui/react-dialog` importado apenas em `DrawerDeFiltros.tsx`, sendo este o primeiro uso no projeto.

**Limite conhecido desta verificação:** **foco preso e retorno de foco não são provados aqui, e não podem ser.** É a armadilha nº 3 do RESEARCH §6 ("foco perdido ao fechar o drawer — jsdom não reproduz gerenciamento de foco fielmente"), confirmada nas waves anteriores desta fase. Os testes unitários cobrem montagem, nome acessível, `Escape` despachando o fechamento e os botões do rodapé. A prova de que `Tab` não escapa do drawer e de que o foco volta ao botão `FILTROS` é **inteiramente** escopo do plano 05-08 (Playwright) — e é requisito de CATA-05, não item opcional. Está documentado no JSDoc do próprio componente.

Também não existe teste de integração cobrindo drawer + chips juntos na página; a cobertura ficou nos testes unitários de cada componente.

## User Setup Required

None — nenhuma configuração de serviço externo é necessária.

## Next Phase Readiness

- **Pronto para 05-07:** a rota já monta hero, busca, painel, toolbar, drawer e chips. Falta a grade de produtos, os dois estados de "nada para mostrar" e os emissores de analytics.
- **Dívida encaminhada a 05-08, agora acumulada:** visibilidade por media query (05-04, 05-05), foco preso e retorno de foco no drawer (05-06) e axe em navegador real. O 05-08 é o único plano da fase que pode provar CATA-05 de verdade — se ele for cortado, a fase fica com um requisito de acessibilidade não verificado.

---

_Phase: 05-catalogo_
_Completed: 2026-08-20_
