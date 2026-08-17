# All Music Rentals (AMR)

## What This Is

Catálogo web de aluguel de equipamento para eventos na Flórida — estruturas e treliças, telas de LED,
som, luz e serviços técnicos — com fluxo de **solicitação de orçamento**. O visitante navega o catálogo,
monta uma lista de itens e envia uma solicitação; a equipe responde com proposta. O site é trilíngue
(pt-BR padrão, en, es) e serve tanto o organizador de evento quanto o produtor técnico que procura
especificação (pixel pitch, medidas, cobertura, montagem).

## Core Value

O visitante consegue montar e enviar uma solicitação de orçamento de ponta a ponta, nos três idiomas,
**sem que nenhum preço apareça em lugar nenhum do produto**.

## Regra inviolável (não negociável)

**SEM PREÇO e SEM PAGAMENTO** em qualquer camada: tela, campo do CMS, `dataLayer`, JSON-LD,
nome de variável, nome de arquivo. Vocabulário obrigatório: "orçamento" / "solicitação".
Nunca "comprar", "checkout", "carrinho de compras", "preço", "valor", "pagamento".

**Exceção única e aprovada:** o campo "Faixa de investimento" (US$) na etapa 5 do formulário de
solicitação. É *budget do cliente*, não preço de produto. Exige ressalva em tela
("Nenhum valor é exibido no site. Isto orienta a equipe a propor a configuração adequada, não a
definir o preço.") e **allowlist restrita a esse campo** no teste anti-preço.

Enforcement em quatro pontos: guarda de build (Fase 1) · modelo do CMS sem campo de preço (Fase 3) ·
JSON-LD `Product` sem `offers` (Fase 12) · eventos sem `value`/`currency`/`price`/`revenue` (Fase 13) ·
verificação e2e "nenhuma tela exibe preço" nos 3 locales (Fase 16).

## Requirements

Escopo completo, com IDs e rastreabilidade, em `.planning/REQUIREMENTS.md`.
Mapeamento requisito → fase em `.planning/ROADMAP.md`.

### Validated

<!-- Entregue e confirmado em código. -->

- ✓ Inventário do layout-fonte, tokens extraídos e plano de fases — Fase 0 (`208402b`)
- ✓ Fundação Next 16 App Router, TS strict, i18n 3 locales, Redux por requisição, Zod, Radix,
  styled-components com registry SSR, Docker de dev, CI, guardas anti-preço e anti-segredo — Fase 1 (branch `fase-01-fundacao`)
- ✓ Design system completo: tema dos tokens, primitivos, chrome, feedback, `ProductCard` de 3 variantes,
  showcase interna e testes axe — Fase 2 (branch `fase-02-design-system`)

### Active

<!-- Escopo atual. -->

- [ ] Fase 3 — Strapi CMS: implementado, **aguardando verificação/UAT** e publicação da branch
- [ ] Fases 4–11 — páginas: Home, Catálogo, Categoria, Produto, Carrinho de orçamento,
      Formulário de 5 etapas, Confirmação, Institucionais
- [ ] Fases 12–15 — transversais: SEO e dados estruturados, Medição com consentimento,
      Core Web Vitals, Segurança
- [ ] Fase 16 — QA final e handoff
- [ ] Fase 17 — Deploy de produção: GHCR + Caddy na VPS Hostinger

### Out of Scope

- **Preço, pagamento, checkout, carrinho de compras** — o produto é orçamento consultivo; a proposta
  é feita por pessoa, com base em disponibilidade e logística. Não é e-commerce.
- **Endereço físico, mapa e redes sociais** — decisão de conteúdo do cliente; contato é telefone e e-mail.
- **Conteúdo fictício em qualquer ambiente** (depoimento, avaliação, número, selo, produto de exemplo) —
  onde falta conteúdo real, entra o placeholder do design com legenda técnica.
- **Biblioteca fora da stack fechada** — só com aprovação, justificando problema e custo de bundle.
- **Formulário de 9 etapas** — o layout tem 5; reprojetar para 9 foi rejeitado (`DEC-00-14`).

## Context

- **Fonte da verdade visual:** `/projeto-base/*.dc.html` (exports do Claude Design). Os tokens em
  `docs/tokens/tokens.json` foram extraídos do código por grep com contagem de uso, **não inferidos**.
- **O CSS-fonte não tem nenhuma `@media`.** A responsividade é fluida (`clamp`, grids `auto-fit`,
  `flex-wrap`); a troca desktop/mobile do chrome vivia em JS (`support.js`) e foi reconstituída como
  media query CSS em 1080px (`DEC-chrome-media-query`).
- **Estado real do código** (prevalece sobre `docs/PLANO.md`, que está desatualizado): Fases 00, 01 e 02
  concluídas; Fase 03 implementada e não verificada; Fases 04–17 não iniciadas. Branch corrente
  `fase-03-strapi`, ainda não publicada no GitHub.
- **Strapi 5.52.** No Strapi cada locale tem sua própria versão da entrada, **inclusive a Dynamic Zone** —
  o editor preenche os blocos três vezes. Risco de esforço editorial ~3× em páginas com muitos blocos.
- **Sem PRD.** Os requisitos foram derivados dos critérios de aceite dos SPECs (`docs/PLANO.md`,
  `docs/00-inventario.md`). Requisito e plano compartilham a mesma origem e não se validam mutuamente —
  ver `.planning/INGEST-CONFLICTS.md`.
- **Métrica de sucesso do projeto:** solicitação de orçamento concluída de ponta a ponta nos 3 locales,
  com Core Web Vitals verdes e zero ocorrência de vocabulário de preço nas guardas automatizadas.

## Constraints

- **Produto**: sem preço e sem pagamento em nenhuma camada — é a razão de ser do produto (ver regra inviolável).
- **Stack (fechada)**: Next.js App Router · TypeScript strict · Redux Toolkit · Zod · Radix UI ·
  styled-components · Strapi CMS · Jest + Testing Library · Playwright — decidida na Fase 01, não se
  amplia sem aprovação.
- **Runtime**: Node ≥ 20.9 · Next 16 · Postgres para o Strapi · tudo em container Docker.
- **i18n**: pt-BR (padrão), en, es, roteamento por prefixo de caminho, `hreflang` + `x-default`.
- **Responsividade**: fluida, sem media query fixa. Exceções aprovadas: chrome em 1080px
  (`theme.breakpoint.header`) e empilhamento da tabela comparativa LED abaixo de 760px.
- **Performance (campo, mobile, p75)**: LCP < 2,5s · INP < 200ms · CLS < 0,1 · TTFB < 800ms.
  LCP > 2,5s p75 é o **gatilho de reversão** do `DEC-styled-components`.
- **Segurança**: CSP com nonce (sem `unsafe-inline` global) · HSTS · rate limiting · upload validado por
  magic number · nenhum segredo em `NEXT_PUBLIC_` · tokens do Strapi só no servidor.
- **Processo**: uma fase por vez, uma branch por fase (descendendo da branch da fase anterior, não de `main`).
  Definição de pronto: typecheck limpo · lint limpo · testes verdes · build passando · axe sem violação
  crítica · tela conferida lado a lado com o HTML-fonte em desktop e 375px.
- **Divergência técnica** necessária → registrar em `docs/divergencias.md` **antes** de implementar.
- **Infra**: Docker · GitHub · deploy sync para VPS Hostinger (requisito do cliente).

## Key Decisions

| Decisão | Racional | Status |
|---------|----------|--------|
| **Rota canônica de produto `/[locale]/[categoria]/[slug]`** | Melhor sinal semântico de URL e breadcrumb natural. Exige guarda de colisão entre slug de categoria e slug de produto, e redirect 301 quando o produto muda de categoria. | 🔒 **LOCKED** (2026-08-17) |
| **Deploy GHCR + Caddy** | Build no GitHub Actions, push da imagem para GHCR, `pull` na VPS. Caddy como reverse proxy com TLS automático. Buildar na VPS consumiria RAM que a Hostinger não tem sobrando com Next + Strapi + Postgres. Anula a nota "Decisão aberta" da Fase 17 do `docs/PLANO.md`. | 🔒 **LOCKED** (2026-08-17) |
| **styled-components no App Router** | Registry SSR em `src/lib/theme/StyledRegistry.tsx` com `useServerInsertedHTML`; dados sempre em Server Component; estilizados nas folhas; `compiler.styledComponents`. Gatilho de reversão: LCP mobile > 2,5s p75. | 🔒 LOCKED — `docs/adr/001-styled-components.md` |
| **pt-BR como locale padrão** | Decisão de aquisição de cliente, não técnica. `en`/`es` adicionais, roteamento por prefixo, negociação por `Accept-Language` na entrada sem prefixo; custo de SEO em inglês mitigado por `hreflang` + `x-default` + canônica e sitemap por locale. | 🔒 LOCKED — `docs/adr/002-locale-padrao.md` |
| **Formulário de solicitação tem 5 etapas** | O layout tem 5 (`ETAPAS = 1..5`). Reprojetar para 9 foi rejeitado. `docs/PLANO.md:92` ainda diz "form 9 etapas" — **correção pendente**. | 🔒 LOCKED — `DEC-00-14` (2026-08-13) |
| **"Faixa de investimento" (US$) mantida com allowlist anti-preço** | É budget do cliente, não preço de produto. Ressalva de tela obrigatória; allowlist restrita a esse campo. | 🔒 LOCKED — `DEC-00-15` (2026-08-13) |
| **Painel de filtros mantém dois modos** | Catálogo = acordeão vertical + drawer mobile. Categoria = botões toggle horizontais. Fiel ao layout, dois componentes distintos. | 🔒 LOCKED — `DEC-00-08` (2026-08-13) |
| **Tokens unificados**: `cinza.300 = #C9CBCC`, `erro.escuro = #5A2020`, `teal.link = #1A7F82` / hover `#166D70` | Absorvem duplicatas quase idênticas encontradas no CSS-fonte. | 🔒 LOCKED — `DEC-00-01/02/16` |
| **Troca desktop↔mobile do chrome por media query CSS em 1080px** | `window.innerWidth` no cliente causa mismatch de hidratação, flash e CLS. Escopo negativo explícito: só a visibilidade do chrome; escala fluida e grids `auto-fit` seguem sem media query. | ✓ Vigente — `docs/divergencias.md` D1 (2026-08-14) |
| **Sem seed de conteúdo fictício** | Protocolo `AMR-4182`, "4 itens / 28 unidades" e avaliações nomeadas nos exports são exemplos do design, não dados. | ✓ Vigente — `DEC-00-13` |
| Divergências 5, 6, 7, 9 (Header/nav, Rodapé, Card de produto, Toast) | Todas apontam para "unificar via CMS/componente". As Fases 02/03 já implementaram — falta **fechar formalmente** conferindo o código real. | — Pendente (tarefa 03-05) |
| Divergências 11, 12 (produto como fonte única, microcopy legal global) | `products` no CMS é fonte única; microcopy legal vira campo em `settings-globais`. Modelado na Fase 03, falta confirmar. | — Pendente (tarefa 03-05) |

## Riscos registrados

- RAM da VPS Hostinger para Next + Strapi + Postgres + Caddy — dimensionar antes da Fase 17.
- Estratégia de migração/seed do Strapi em produção.
- CSP com nonce convivendo com styled-components e GTM (Fase 15).
- CSS-em-runtime do styled-components vs. Core Web Vitals (medição na Fase 14).
- Esforço editorial ~3× em páginas com muitas Dynamic Zones se a cópia entre locales falhar.
- `docs/PLANO.md` e `docs/00-inventario.md` §10 estão obsoletos e podem induzir replanejamento de
  trabalho já entregue — correção é tarefa explícita da Fase 3.

---
*Última atualização: 2026-08-17, na criação do projeto GSD a partir da ingestão de `docs/`.*
