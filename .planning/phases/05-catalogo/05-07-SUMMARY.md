---
phase: 05-catalogo
plan: 07
subsystem: ui
tags: [analytics, datalayer, css-grid-auto-fit, empty-states, useTransition, jest, testing-library]

# Dependency graph
requires:
  - phase: 05-catalogo (05-02)
    provides: getProdutos, emitirEvento com a união EventoDataLayer ampliada (search, filter_applied), GRUPOS_DE_FILTRO
  - phase: 05-catalogo (05-04, 05-05, 05-06)
    provides: rota /[locale]/catalogo já com hero, busca, painel, toolbar, drawer e chips montados
  - phase: 02-design-system
    provides: ProductCard de 3 variantes, EmptyState, Notice, Button primitivo
  - phase: 04-home
    provides: EmissorViewItemList e a garantia de compilação de que o dataLayer rejeita campo monetário
provides:
  - GradeDeProdutos — grade auto-fit de ProductCard, com view_item_list refletindo o filtro
  - EstadoSemResultados e EstadoCatalogoVazio — dois estados distintos de "nada para mostrar"
  - EmissorSearch e EmissorFiltroAplicado — search e filter_applied sem duplicação, pela porta única emitirEvento
  - D9 registrada em docs/divergencias.md (a quarta tela, ausente do layout-fonte)
  - Fase fechada do lado do visitante — resta a prova em navegador real (05-08)
affects: [05-08, 09-05, 13]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Trava de emissão por VALOR, não por montagem: EmissorSearch guarda o último termo emitido e EmissorFiltroAplicado compara Map<IdGrupoFiltro, Set<string>> por grupo — numa rota dinâmica a trava só de montagem emitiria evento fantasma a cada clique de filtro'
    - 'Comparação de conjuntos de filtro por grupo em vez de string concatenada — nenhum separador escolhido a dedo pode colidir com um valor de filtro'
    - 'Estado vazio sem eco de entrada do usuário: EstadoSemResultados não recebe o termo buscado, eliminando a origem do XSS refletido em vez de sanitizar na saída'

key-files:
  created:
    - src/components/catalogo/GradeDeProdutos.tsx
    - src/components/catalogo/GradeDeProdutos.test.tsx
    - src/components/catalogo/EstadoSemResultados.tsx
    - src/components/catalogo/EstadoCatalogoVazio.tsx
    - src/components/catalogo/EstadosDoCatalogo.test.tsx
    - src/components/analytics/EmissorSearch.tsx
    - src/components/analytics/EmissorFiltroAplicado.tsx
    - src/components/analytics/EmissoresDoCatalogo.test.tsx
  modified:
    - src/app/[locale]/catalogo/page.tsx
    - docs/divergencias.md

key-decisions:
  - 'item_category do view_item_list do catálogo usa produto.categoria.slug, ao contrário do SliderDeProdutos da Home, que usa o nome. Divergência intencional e pontual, especificada pelo plano — registrada aqui para não ser "corrigida" para nome por engano depois.'
  - 'EstadoSemResultados não recebe o termo buscado como prop. Decisão de arquitetura, não de conteúdo: a ausência do dado na origem é mitigação mais forte de T-05-29 (XSS refletido) do que receber e não renderizar.'
  - 'EmissorFiltroAplicado compara Set<string> por grupo (5 mapas) em vez de concatenar "grupo:valor" numa chave. A primeira versão usava separador e foi descartada: qualquer separador escolhido a dedo pode colidir com um valor de filtro real.'
  - 'CTA "SOLICITAR ORÇAMENTO" usa Button as="a", o padrão já estabelecido em ProductCard/HeroBloco, em vez de introduzir next/link como padrão novo nesta tarefa.'
  - 'BotaoSugestaoSecundario (variante estilizada sobre o Button primitivo) NÃO recebeu entrada em docs/divergencias.md — decisão do orquestrador, ver Débito técnico.'

patterns-established:
  - 'Emissor de analytics com trava por valor, adequada a rota dinâmica onde o componente re-renderiza a cada mudança de query'
  - 'Dois estados vazios semanticamente distintos: sem correspondência (oferece limpar filtro) e catálogo vazio (não oferece, porque não há filtro a limpar)'

requirements-completed: [CATA-04, CATA-06]

# Metrics
duration: ~70min
completed: 2026-08-20
---

# Fase 05 — Plano 07: Grade de produtos, estados vazios e emissores de analytics

**Grade `auto-fit` de `ProductCard`, as duas telas semanticamente distintas de "nada para mostrar" (a segunda delas ausente do layout-fonte, registrada como D9) e `search`/`filter_applied` emitidos pela porta única com trava por valor.**

## Performance

- **Duration:** ~70 min
- **Started:** 2026-08-20T14:07:46-03:00 (primeiro commit)
- **Completed:** 2026-08-20T15:16:34-03:00 (último commit de código)
- **Tasks:** 3 de 3
- **Files modified:** 10 (8 criados, 2 modificados)

## Accomplishments

- **A fase fechou do lado do visitante.** A rota entrega hero, busca, painel de filtros, toolbar, drawer, chips, grade e os quatro estados de CATA-04. O que falta é prova em navegador real, não funcionalidade.
- **Um estado que o layout-fonte não desenhou.** `Catalogo.dc.html` prevê três estados do bloco de resultados; "o catálogo não tem produto nenhum cadastrado" não está entre eles, porque um layout estático sempre assume que a lista existe. A quarta tela foi criada e registrada como **D9** — divergência declarada antes de implementar, conforme a regra do arquivo.
- **Trava de evento por valor, não por montagem.** Numa rota dinâmica o emissor re-renderiza a cada mudança de query. Uma trava só de montagem faria `search` disparar de novo a cada checkbox marcado com `?q=` ativo — um evento fantasma por clique, sem relação com busca. `EmissorSearch` guarda o último termo; `EmissorFiltroAplicado` compara conjuntos por grupo.
- **Um bug de separador pego antes de existir.** A primeira versão de `EmissorFiltroAplicado` concatenava `grupo+valor` numa chave única com separador — e `.split('')` teria fatiado por caractere. Foi redesenhada para `Map<IdGrupoFiltro, Set<string>>` antes de qualquer commit. Comparar por grupo elimina a classe do problema: nenhum separador escolhido a dedo pode colidir com um valor de filtro real.
- **A garantia anti-preço na camada de medição foi preservada.** Nenhum evento carrega campo de valor, e o tipo do `dataLayer` continua rejeitando isso em compilação — a garantia que a Fase 4 estabeleceu com `error TS2353`.

## Task Commits

1. **Task 1: `GradeDeProdutos` — grade `auto-fit` de `ProductCard`** — `c47e469` (feat)
2. **Task 2: Os dois estados de "nada para mostrar", distintos, e o registro da divergência de cópia** — `f95c6b5` (feat)
3. **Task 3: Emissores de `search` e `filter_applied`, sem duplicação** — `db2e931` (feat)

**Plan metadata:** este SUMMARY (docs: complete plan)

## Files Created/Modified

- `src/components/catalogo/GradeDeProdutos.tsx` — grade `repeat(auto-fit, minmax(280px, 1fr))` (D5), `view_item_list` com `item_list_id` refletindo o filtro
- `src/components/catalogo/GradeDeProdutos.test.tsx` — 6 testes
- `src/components/catalogo/EstadoSemResultados.tsx` — cópia literal de `estadoVazio` do layout-fonte; oferece remover filtros e duas sugestões de navegação
- `src/components/catalogo/EstadoCatalogoVazio.tsx` — a quarta tela (D9); não oferece limpar filtro, porque não há filtro a limpar
- `src/components/catalogo/EstadosDoCatalogo.test.tsx` — cobre os dois estados e a distinção entre eles
- `src/components/analytics/EmissorSearch.tsx` — `search` com trava por termo; o catálogo emite, a Home só navega (RESEARCH §5)
- `src/components/analytics/EmissorFiltroAplicado.tsx` — `filter_applied` com comparação de `Set` por grupo
- `src/components/analytics/EmissoresDoCatalogo.test.tsx` — cobre a não-duplicação no que o jsdom alcança
- `src/app/[locale]/catalogo/page.tsx` — montagem final: grade, os dois estados e os dois emissores
- `docs/divergencias.md` — **D9** acrescentada

## Decisions Made

- **`item_category` usa `slug`, não `nome`.** Divergência deliberada e pontual em relação ao `SliderDeProdutos` da Home, especificada pelo plano. Registrada explicitamente porque parece inconsistência e convida a uma "correção" errada no futuro.
- **`EstadoSemResultados` não recebe o termo buscado.** Não renderizar o eco da entrada do usuário é bom; **não receber o dado** é melhor. Elimina a origem do XSS refletido (T-05-29) em vez de depender de sanitização na saída.
- **`Button as="a"` no CTA.** Consistência com `ProductCard`/`HeroBloco` em vez de introduzir `next/link` como padrão novo numa tarefa que não é sobre navegação.

## Deviations from Plan

Nenhum desvio de Rule 1–4.

Duas correções internas, ambas resolvidas antes de qualquer commit e portanto não commitadas em estado quebrado:

- **Separador em `EmissorFiltroAplicado`.** A primeira implementação usava `SEPARADOR = ''` para concatenar `grupo+valor`, o que faria `.split('')` fatiar por caractere. Redesenhada para `Map<IdGrupoFiltro, Set<string>>`.
- **Comentários em `EstadoSemResultados.tsx`.** Ajustados para que o `grep -c` das três sugestões retornasse exatamente `3` e não `5` — é a **terceira** ocorrência nesta fase de comentário explicativo interferindo num critério de aceitação por contagem/ausência (as anteriores em `error.tsx` no 05-04 e `DrawerDeFiltros.tsx` no 05-06).

**Impact on plan:** nenhum scope creep.

## Issues Encountered

- **Mensagem de commit corrompida pelo shell.** O commit `db2e931` precisou de `--amend`: crases em `` `filtro` `` e `` `temFiltroOuBusca` `` dentro da string do `-m` foram interpretadas pelo zsh como substituição de comando, comendo texto do corpo. Só a mensagem foi afetada; nenhum código.

## Risco investigado pelo orquestrador — duplicação de `search`/`filter_applied`

O executor sinalizou, corretamente, que a trava por valor **só funciona se a instância do componente sobreviver à navegação**. Se a subárvore de Client Components desmontar e remontar (fallback de Suspense a cada navegação com nova query), um `useRef` novo nasce vazio e `search` re-emite — exatamente o cenário que o JSDoc do componente afirma prevenir. `rerender()` do RTL mantém a mesma instância, então os testes passam sem provar nada disso. É a mesma classe de armadilha do RESEARCH §6.

**Investiguei. O risco está mitigado por desenho, em todos os caminhos:**

| Componente que navega | `router.push` | envolvido em `useTransition` |
| --------------------- | ------------- | ---------------------------- |
| `PainelDeFiltros`     | ✓             | ✓                            |
| `ChipsDeFiltroAtivo`  | ✓             | ✓                            |
| `BarraDeBuscaCatalogo`| ✓             | ✓                            |
| `ToolbarDoCatalogo`   | ✓             | ✓                            |
| `DrawerDeFiltros`     | ✓             | ✓                            |

`startTransition` mantém a UI atual montada enquanto o novo render do servidor carrega — o fallback do `loading.tsx` não aparece, a subárvore não desmonta, e a trava sobrevive. **5 de 5 caminhos, sem exceção.**

**Mas a garantia é emergente, não estrutural, e isso é a parte importante.** Nada no código impede um plano futuro de acrescentar um sexto caminho de navegação sem `useTransition`. No dia em que isso acontecer, `search` passa a duplicar **em silêncio** — nenhum teste de jsdom pega, e o sintoma aparece em GA4, não em CI. Encaminhado como asserção explícita ao 05-08.

Risco residual conhecido e aceito: navegação **dura** (recarregar, digitar a URL, voltar no histórico) remonta de fato. Recarregar com `?q=painel` emite `search` uma vez, o que é defensável — é uma nova visualização com termo de busca. Voltar no histórico para uma URL com `?q=` re-emite; é um evento a mais em GA4, de severidade baixa, e fica registrado em vez de silenciado.

## Débito técnico registrado (decisão do orquestrador)

- **`BotaoSugestaoSecundario` não recebe entrada em `docs/divergencias.md`.** O executor escalou a dúvida. **Decisão: não registrar.** O cabeçalho do arquivo delimita o escopo — divergência **técnica** do HTML original — e diz explicitamente que divergência de conteúdo/design pertence a `docs/00-divergencias.md`. O componente é um variante estilizado sobre o `Button` primitivo que **reproduz** a borda clara/hover escuro do próprio layout-fonte: isso é conformidade com o layout, não divergência dele, e não muda comportamento nem arquitetura. Abrir entrada ali diluiria o valor do registro.

- **Comentário interferindo em critério de aceitação — terceira ocorrência na fase.** `error.tsx` (05-04), `DrawerDeFiltros.tsx` (05-06) e `EstadoSemResultados.tsx` (05-07). Não é defeito de código, é defeito de **desenho de plano**: critérios que verificam literais por ausência ou por contagem exata colidem com comentários corretos. Recomendação para fases futuras: ancorar esses critérios em código (AST, ou `grep` restrito a linhas não-comentário) em vez de varrer o arquivo inteiro.

## Verification

Executada pelo orquestrador na árvore principal, após os 3 commits — o executor rodou apenas verificações focadas por tarefa, por protocolo.

| Gate                              | Resultado                |
| --------------------------------- | ------------------------ |
| `npx jest`                        | **308 passam, 0 falham** |
| `npm run typecheck`               | exit 0                   |
| `npm run lint`                    | exit 0                   |
| `npm run format:check`            | exit 0                   |
| `npm run verifica:bundle-segredo` | exit 0                   |

Árvore limpa. Conferido por inspeção direta:

- `grep -c 'getProdutos(' page.tsx` → **1** — contagem e grade saem da mesma consulta, fechando a armadilha nº 1 do RESEARCH §6 por construção
- `repeat(auto-fit, minmax(280px, 1fr))` presente em `GradeDeProdutos.tsx` (D5, sem JS de viewport)
- `## D9` presente em `docs/divergencias.md`

O executor também reportou `npm run build` verde com `/[locale]/catalogo` mantido como `ƒ` (dinâmico).

**Limite conhecido desta verificação:** o item 4 da `<verification>` do plano — abrir `/pt-BR/catalogo` e `/pt-BR/catalogo?q=zzzzzz` em navegador — **não foi executado**. Nem a armadilha nº 4 do RESEARCH §6 (acento e caixa na busca: "Painéis" vs "paineis" com `$containsi`) foi provada contra dado real. Ambas são escopo do 05-08.

## User Setup Required

None — nenhuma configuração de serviço externo é necessária.

## Next Phase Readiness

- **Pronto para 05-08**, que é o único plano da fase capaz de provar o que jsdom não alcança. A dívida acumulada que ele precisa cobrir:
  1. **Foco preso no drawer e retorno de foco ao gatilho** (05-06) — requisito de CATA-05, hoje não provado
  2. **Visibilidade por media query** — botão `FILTROS` em `media.mobile`, colapso do aside em `media.desktop` (05-04, 05-05)
  3. **Não-duplicação de `search`/`filter_applied`** ao aplicar filtro com busca ativa (este plano) — e, idealmente, uma asserção que falhe se um caminho de navegação perder o `useTransition`
  4. **Acento e caixa na busca** com dado real do CMS (RESEARCH §6, armadilha 4)
  5. **axe em navegador real**
- **Se o 05-08 for cortado, a fase fecha com CATA-05 não verificado.** Não é item opcional de polimento; é o requisito de acessibilidade da fase.
- **Pendência herdada para a Fase 9:** `contagemSolicitacoes` precisa ser incrementado no Route Handler de envio (plano `09-05`), já cravado no ROADMAP por 05-01. Sem isso, "Mais solicitados" permanece idêntico à ordenação alfabética.

---

_Phase: 05-catalogo_
_Completed: 2026-08-20_
