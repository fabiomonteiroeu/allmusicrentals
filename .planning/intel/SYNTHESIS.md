# Síntese da ingestão de documentos

Projeto: **All Music Rentals** — catálogo de aluguel de equipamento para eventos na Flórida.
Modo: `new` · Precedência: ADR > SPEC > PRD > DOC · Gerado em 2026-08-17 por `gsd-doc-synthesizer`.

Este arquivo é o **ponto de entrada único** para o `gsd-roadmapper`.

---

## Regra de produto inviolável

Fluxo de **ORÇAMENTO, SEM PREÇO e SEM PAGAMENTO** em toda a base — nenhuma tela, campo,
`dataLayer` ou JSON-LD exibe ou carrega preço. Vocabulário: "orçamento"/"solicitação",
nunca "comprar/checkout/carrinho de compras".
Exceção única e aprovada: campo "Faixa de investimento" (US$) na etapa 5 do formulário, com
allowlist no teste anti-preço — é budget do cliente, não preço de produto.

Detalhe em `requirements.md` → `REQ-sem-preco` e `constraints.md` → `CON-anti-preco`.

---

## Documentos ingeridos: 8

**ADR — 4**
- `docs/adr/001-styled-components.md` (confiança alta, **LOCKED**)
- `docs/adr/002-locale-padrao.md` (confiança alta, **LOCKED**)
- `docs/00-divergencias.md` (confiança média, log multi-decisão de 17 itens)
- `docs/divergencias.md` (confiança média, log de divergências técnicas, 1 entrada)

**SPEC — 3**
- `docs/PLANO.md` (confiança média, plano de 18 fases 00–17)
- `docs/00-inventario.md` (confiança média, inventário do layout-fonte)
- `docs/tokens/tokens.md` (confiança média, design tokens)

**DOC — 1**
- `docs/cms-fluxo-editorial.md` (confiança alta)

**PRD — 0** (ver INFO em `INGEST-CONFLICTS.md`)

---

## Decisões: 13 vigentes/travadas, 7 abertas, 4 informativas

**Travadas (não sobrescrever automaticamente) — 8**
- `DEC-styled-components` — styled-components com registry SSR; dados sempre em Server Component; estilizados nas folhas. Gatilho de reversão: LCP mobile > 2,5s p75. → `docs/adr/001-styled-components.md`
- `DEC-locale-padrao` — pt-BR padrão, en/es adicionais, roteamento por prefixo, hreflang + x-default. → `docs/adr/002-locale-padrao.md`
- `DEC-00-01` — `cinza.300 = #C9CBCC` (absorve `#C7CACB`)
- `DEC-00-02` — `erro.escuro = #5A2020` (absorve `#5A1F24`)
- `DEC-00-08` — painel de filtros mantém dois modos distintos (Catálogo acordeão, Categoria toggles)
- `DEC-00-14` — **formulário tem 5 etapas**, não 9
- `DEC-00-15` — "Faixa de investimento" (US$) mantida + allowlist no teste anti-preço
- `DEC-00-16` — `teal.link = #1A7F82` (links), `#166D70` (hover/pressed)
  → os seis `DEC-00-*` vêm de `docs/00-divergencias.md`, itens ✅ RESOLVIDA aprovados em 2026-08-13

**Vigente — 1**
- `DEC-chrome-media-query` — troca desktop/mobile do chrome por media query CSS em 1080px (`theme.breakpoint.header`), escopo restrito à visibilidade do chrome. → `docs/divergencias.md` D1

**Abertas — 7:** `DEC-00-04` (superada na prática por `DEC-chrome-media-query`), `DEC-00-05` (Header/nav), `DEC-00-06` (Rodapé), `DEC-00-07` (Card de produto), `DEC-00-09` (Toast), `DEC-00-11` (produto como fonte única no CMS), `DEC-00-12` (microcopy legal global).

**Informativas — 4:** `DEC-00-03`, `DEC-00-10`, `DEC-00-13` (não semear conteúdo fictício), `DEC-00-17`.

---

## Requisitos extraídos: 17

Derivados de critérios de aceite em SPECs — não há PRD no conjunto.

Global: `REQ-sem-preco`
Plataforma: `REQ-fundacao` · `REQ-design-system` · `REQ-cms-strapi`
Páginas: `REQ-home` · `REQ-catalogo` · `REQ-categoria` · `REQ-produto` · `REQ-carrinho-orcamento` · `REQ-formulario-orcamento` · `REQ-confirmacao` · `REQ-institucionais`
Transversais: `REQ-seo` · `REQ-medicao` · `REQ-performance` · `REQ-seguranca` · `REQ-qa` · `REQ-deploy`

---

## Restrições: 17

- **nfr — 5:** `CON-anti-preco` · `CON-stack` · `CON-responsividade` · `CON-core-web-vitals` · `CON-seguranca`
- **schema — 6:** `CON-tokens` · `CON-formulario` · `CON-formulario-contato` · `CON-modelo-conteudo` · `CON-conteudo-global` · `CON-comparativo-led`
- **api-contract — 4:** `CON-rotas` · `CON-busca-filtros` · `CON-produto-controles` · `CON-imagens`
- **protocolo — 2:** `CON-processo` · `CON-estados` · `CON-deploy`

---

## Tópicos de contexto: 6

Fluxo editorial no Strapi · Fonte da verdade visual · Mapa de blocos por página ·
Componentes compartilhados e onde divergem · **Estado real do código no momento da ingestão** ·
Riscos registrados nos documentos.

---

## Estado real do projeto (prevalece sobre o que os documentos dizem)

- Fases **00, 01 e 02 CONCLUÍDAS** — fundação Next 16 App Router, TS strict, i18n pt-BR/en/es, Redux Toolkit, Zod, styled-components; design system completo com primitivos, chrome, feedback e `ProductCard`.
- Fase **03 (Strapi CMS) IMPLEMENTADA, NÃO VERIFICADA** — modelo completo, cliente server-only com Zod, adaptadores, sanitização de rich text, webhook de revalidação. Falta verificação/aprovação.
- Fases **04 a 17 NÃO INICIADAS**.
- Infra: Docker + GitHub + deploy futuro em VPS Hostinger (requisito do cliente → Fase 17).

`docs/PLANO.md` ainda declara "Fase 00 em andamento" e `docs/00-inventario.md` §10 tem itens de
aprovação desmarcados. **São registros obsoletos** — o roadmapper deve usar o estado acima.

---

## Conflitos

- **0 blockers**
- **4 competing-variants / warnings** — ciclo de referências entre PLANO/inventário/divergências · rota canônica de produto indefinida · registry e reverse proxy da Fase 17 em aberto · seis divergências de componentes sem aprovação formal
- **8 auto-resolvidos** — três por precedência ADR > SPEC (5 etapas · faixa US$ + allowlist · media query do chrome), mais cinco registros de transparência

Relatório completo: `.planning/INGEST-CONFLICTS.md`

---

## Arquivos de intel

- `.planning/intel/decisions.md` — decisões dos ADRs, com status travada/vigente/aberta/informativa
- `.planning/intel/requirements.md` — 17 requisitos com critérios de aceite e proveniência
- `.planning/intel/constraints.md` — 17 restrições (nfr, schema, api-contract, protocolo)
- `.planning/intel/context.md` — notas de contexto, incluindo o estado real do código
- `.planning/intel/classifications/` — JSONs de classificação por documento
