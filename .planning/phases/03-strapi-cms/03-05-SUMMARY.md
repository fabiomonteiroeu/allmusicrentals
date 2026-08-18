---
phase: 03-strapi-cms
plan: 05
subsystem: docs
tags: [strapi, documentacao, adr, divergencias, rota-canonica, deploy]

# Dependency graph
requires:
  - phase: 03-strapi-cms
    provides: modelo do Strapi implementado (content-types, componentes, i18n, seed de estrutura) e camada Next↔Strapi (client, schemas, adapters, sanitize, webhook)
provides:
  - Divergências 5, 6, 7, 9, 11 e 12 fechadas contra o código/modelo real
  - Entrada D2 em docs/divergencias.md documentando o desvio do Card de produto
  - Itens 10 e 13 reclassificados como ℹ️ INTENCIONAL
  - docs/PLANO.md sincronizado com o estado real do projeto (fases concluídas, form 5 etapas, decisões travadas)
  - docs/00-inventario.md com rota de produto unificada e checklist §10 aprovado
  - docs/adr/003-rota-canonica-produto.md (rota /[locale]/[categoria]/[slug])
  - docs/adr/004-deploy-ghcr-caddy.md (registry GHCR + reverse proxy Caddy)
  - docs/cms-fluxo-editorial.md com o contrato de chaves de textosLegais
affects: [04-catalogo, 05-catalogo-paginas, 06-categoria, 07-produto, 08-carrinho, 09-formulario, 12-seo, 15-seguranca, 16-qa-final, 17-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Divergência fechada por leitura de código real (não da proposta), citando arquivo/atributo exato"
    - "Desvio entre proposta e implementação registrado no formato D1/D2 de docs/divergencias.md"
    - "ADR datado no formato de docs/adr/001 e 002 (Contexto/Decisão/Consequências[/Gatilho de reversão])"

key-files:
  created:
    - docs/adr/003-rota-canonica-produto.md
    - docs/adr/004-deploy-ghcr-caddy.md
  modified:
    - docs/00-divergencias.md
    - docs/divergencias.md
    - docs/cms-fluxo-editorial.md
    - docs/PLANO.md
    - docs/00-inventario.md

key-decisions:
  - "Divergência 5 (Header/nav) resolvida: Header.tsx recebe itens/ativoHref por props, origem hoje é navigation.ts, passa a ser menu-item na Fase 4"
  - "Divergência 6 (Rodapé) resolvida: Footer.tsx recebe colunas por props; hrefs ainda são âncoras de placeholder da Fase 02, slugs reais chegam via menu-item.url na Fase 4"
  - "Divergência 7 (Card de produto) resolvida COM DESVIO: variantes por props booleanas (ehServico/escopo/cores), não por tipoDeItem — tradução fica no adapter, não no componente (D2)"
  - "Divergência 9 (Toast) resolvida: offsetBarra alterna bottom entre 96px e theme.espaco[20]"
  - "Divergência 11 (metadados de produto) resolvida: categoria é relação manyToOne única; TENDAS vs ÁREA EXTERNA e MEDIDAS vs BASE viram atributos categoria/ambiente/medidas do mesmo registro"
  - "Divergência 12 (microcopy legal) resolvida: settings-globais.textosLegais com contrato de 4 chaves (disclaimer, copyright, descricaoMarca, avisoCarrinho); avisoCarrinho ainda não semeado"
  - "Itens 10 e 13 reclassificados de ⏳ para ℹ️ INTENCIONAL — nunca foram divergências de decisão"
  - "Rota canônica de produto travada: /[locale]/[categoria]/[slug] (ADR 003)"
  - "Deploy travado: build no GitHub Actions, push para GHCR, VPS só faz pull, Caddy como reverse proxy com TLS automático (ADR 004)"

requirements-completed: [DOC-01, DOC-02, DOC-03]

# Metrics
duration: ~25min
completed: 2026-08-17
---

# Phase 3 Plan 5: Fechamento documental da Fase 3 (Strapi) Summary

**Seis divergências documentais fechadas contra o código real (Header, Footer, ProductCard, Toast, schema de produto e settings-globais), docs/PLANO.md sincronizado com o estado real do projeto, e os ADRs 003 (rota canônica de produto) e 004 (deploy GHCR + Caddy) criados.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-08-17
- **Tasks:** 3/3 concluídas
- **Files modified:** 5 (mais 2 arquivos novos de ADR)

## Accomplishments
- As seis divergências (5, 6, 7, 9, 11, 12) que o ingest apontou como "aguarda decisão" foram fechadas
  citando o arquivo ou atributo real que as implementa, não a proposta original.
- Um desvio real foi encontrado (Card de produto: variantes por props booleanas, não por
  `tipoDeItem`) e registrado como entrada `D2` em `docs/divergencias.md`, no formato exato de D1.
- `docs/PLANO.md` deixou de descrever um estado que não existe mais ("Fase 00 em andamento", "form 9
  etapas", "Decisão aberta" de registry/proxy) e passou a apontar para os ADRs travados.
- `docs/adr/003-rota-canonica-produto.md` e `docs/adr/004-deploy-ghcr-caddy.md` documentam as duas
  decisões novas do usuário, no mesmo formato dos ADRs 001/002, sem nenhum valor de credencial.

## Task Commits

1. **Task 1: Fechar as divergências 5, 6, 7 e 9 contra os componentes da Fase 2** - `ae3ffb7` (docs)
2. **Task 2: Fechar as divergências 11 e 12 contra o modelo do Strapi** - `95eec9d` (docs)
3. **Task 3: Sincronizar docs/PLANO.md e criar os ADRs 003 e 004** - `1e730f4` (docs)

**Plan metadata:** commit deste SUMMARY.md pendente (ver final_commit).

## Files Created/Modified
- `docs/00-divergencias.md` - itens 5, 6, 7, 9, 11, 12 fechados (✅/✅ COM DESVIO); itens 10 e 13 reclassificados para ℹ️ INTENCIONAL; tabela de resumo e linha "Ainda em aberto" atualizadas
- `docs/divergencias.md` - nova entrada `## D2` (Card de produto: variantes por props booleanas)
- `docs/cms-fluxo-editorial.md` - contrato de chaves de `textosLegais` (disclaimer, copyright, descricaoMarca, avisoCarrinho) e onde cada uma aparece
- `docs/PLANO.md` - cabeçalho de estado real, remoção de notas "Confirmar"/"Decisão aberta", correção "9 etapas" → "5 etapas" (Fase 16), ponteiros para os ADRs 003 e 004
- `docs/00-inventario.md` - rota de produto unificada (`/[locale]/[categoria]/[slug]`), checklist §10 marcado como aprovado
- `docs/adr/003-rota-canonica-produto.md` (novo) - rota canônica de produto
- `docs/adr/004-deploy-ghcr-caddy.md` (novo) - registry GHCR + reverse proxy Caddy

## Decisions Made
Ver `key-decisions` no frontmatter — todas derivadas da leitura direta do código/schema real, conforme
exigido pelo plano (nenhuma divergência foi fechada só pela leitura da proposta original).

## Deviations from Plan

### Auto-fixed Issues

Nenhuma. O único "desvio" descoberto (Card de produto usando props booleanas em vez de `tipoDeItem`)
já era esperado como resultado possível pelo próprio plano, que instruiu explicitamente registrá-lo
como entrada D2 caso a leitura do código confirmasse — não é uma correção feita por conta própria, é a
divergência que a Task 1 existe para documentar.

**Total deviations:** 0 auto-fixed
**Impact on plan:** Nenhum — plano executado exatamente como escrito, incluindo o branch condicional
já previsto para o item 7.

## Issues Encountered
None.

## User Setup Required
None - nenhuma configuração de serviço externo é necessária. Este plano é exclusivamente documental.

## Next Phase Readiness
- `docs/` agora reflete o estado real do código e as decisões travadas; as fases 4-17 podem consultar
  `docs/PLANO.md`, `docs/00-divergencias.md`, `docs/divergencias.md` e os ADRs 003/004 sem precisar
  redescobrir o que já foi decidido.
- Nenhum arquivo fora de `docs/` foi modificado (`git diff --name-only` confirma).
- `npm run format:check` verde (guarda de regressão para arquivos não-Markdown; Prettier ignora `*.md`
  por `.prettierignore:10`).

---
*Phase: 03-strapi-cms*
*Completed: 2026-08-17*

## Self-Check: PASSED

Todos os arquivos citados (docs/adr/003, docs/adr/004, docs/00-divergencias.md, docs/divergencias.md,
docs/cms-fluxo-editorial.md, docs/PLANO.md, docs/00-inventario.md e este SUMMARY) existem no disco.
Os três hashes de commit (`ae3ffb7`, `95eec9d`, `1e730f4`) existem no histórico do git.
