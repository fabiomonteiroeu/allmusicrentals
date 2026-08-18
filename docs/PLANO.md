# PLANO DE FASES — All Music Rentals

> **Estado (2026-08-17):** Fases 00, 01 e 02 concluídas · Fase 03 (Strapi) implementada e em
> verificação · Fases 04–17 não iniciadas.
> **Fonte da verdade visual:** `/projeto-base/*.dc.html`. **Tokens:** `docs/tokens/tokens.json`.
> **Regra inviolável:** fluxo de **ORÇAMENTO SEM PREÇO / SEM PAGAMENTO** em toda a base (UI, modelo de dados, dataLayer, schema.org, nomes de variáveis). Vocabulário: "orçamento"/"solicitação". Nunca "comprar/checkout/carrinho de compras".

## Stack
Next.js (App Router) · TypeScript strict · i18n pt-BR(padrão)/en/es · Redux Toolkit · Zod · Radix UI · styled-components · Strapi CMS · Jest + Testing Library · Playwright.
**Infra (requisito do cliente):** Docker (Docker Desktop já rodando) · versionamento GitHub · deploy sync para **VPS Hostinger**.

## Regras de execução (válidas em toda fase)
- **Uma fase por vez.** Ao terminar: mostrar o que foi entregue, testes passando, pendências e decisões tomadas por conta própria. Esperar aprovação.
- **Definição de pronto:** typecheck limpo · lint limpo · testes verdes · build passando · axe sem violação crítica · tela conferida contra o HTML de `/projeto-base` em desktop e 375px.
- **Fidelidade por comparação lado a lado**, não por impressão. Divergência técnica necessária → registrar em `docs/divergencias.md` ANTES de implementar.
- **Não copiar estilo inline** do HTML — traduzir para o tema/tokens.
- **Sem conteúdo fictício** em nenhum ambiente (depoimento, avaliação, número, selo). Faltou conteúdo real → placeholder do design com legenda técnica.
- **Nada de biblioteca fora da stack** sem aprovação (justificar problema + custo de bundle).
- Commits pequenos, em português, um assunto por commit. **Uma branch por fase.**

---

## FASE 00 — Inventário e plano *(sem código de aplicação)*
- **Objetivo:** mapear a fonte da verdade e produzir o plano antes de qualquer código.
- **Entradas:** `/projeto-base/*.dc.html`, `support.js`, `uploads/`.
- **Entregas:** `docs/tokens/tokens.json`, `docs/tokens/tokens.md` ✅ · `docs/00-inventario.md` · `docs/00-divergencias.md` · `docs/PLANO.md`.
- **Aceite:**
  - [x] Tokens extraídos do código (cor, fonte, espaço, raio, borda, sombra, gradiente, breakpoint, keyframe) com contagem de uso.
  - [ ] Inventário de páginas, blocos, texto, componentes, formulários, estados e imagens.
  - [ ] Divergências listadas (não resolvidas unilateralmente além das já aprovadas).
- **Riscos:** responsividade sem `@media` (fluida via clamp + support.js) → pontos de troca precisam ser reconstituídos.

## FASE 01 — Fundação
- **Objetivo:** projeto Next rodando com toda a infraestrutura transversal e o ambiente Docker de dev.
- **Entregas:** Next App Router + TS strict · registry styled-components SSR (`useServerInsertedHTML`) + `compiler.styledComponents` · `ThemeProvider` (esqueleto do tema) · Radix · i18n 3 locales + roteamento `[locale]` · Redux com **store por requisição** + Provider client · ESLint/Prettier/Husky · Jest · Playwright · **headers de segurança** · orçamento de performance no CI · **teste que falha se palavra de preço/compra aparecer no build** · **teste que falha se segredo vazar no bundle cliente**.
  - **Docker/infra:** `Dockerfile` multi-stage (Next standalone) · `docker-compose.yml` de dev (app + Strapi + Postgres) · `.dockerignore` · `.env.example` · **GitHub Actions** (lint/typecheck/test/build + Lighthouse CI) — esqueleto do pipeline que a Fase 17 finaliza.
- **Aceite:** `docker compose up` sobe app + CMS localmente · CI verde no primeiro PR · registry SSR sem erro de hidratação · troca de locale funciona.
- **ADRs:** `docs/adr/001-styled-components.md` (custo + gatilho de reversão: LCP mobile > 2,5s) · `docs/adr/002-locale-padrao.md`.
- **Riscos:** styled-components CSS-em-runtime vs. CWV; CSP com nonce + styled-components + GTM.

## FASE 02 — Design system
- **Objetivo:** tema e componentes globais a partir dos tokens (não inventados).
- **Entradas:** `docs/tokens/tokens.json`, `docs/00-inventario.md`.
- **Entregas:** tema TS tipado (`theme.cor/fonte/tamanho/espaco/raio/borda/sombra/motion`) · primitivos tipográficos (display Archivo `wdth 75`, corpo Public Sans, mono IBM Plex) via `next/font` com subset que **preserva o eixo `wdth`** · botões, campos, chips · componentes globais: **topbar, header sticky, menu mobile, rodapé, bloco de aviso, toast, card de produto, divisor de seção, placeholder de imagem, estados de erro/carregando** · keyframes (`amrFade/amrToast/amrErro/amrSpin/amrPulso/amrDrawer`) · **`prefers-reduced-motion`** (ausente no HTML, adicionar) · sombra dura, raio 2px. Storybook se ajudar.
- **Aceite:** cada componente com todos os estados · alvo de toque ≥44px · foco visível · contraste AA · sem media query fixa (fluido) · comparação lado a lado com o HTML.

## FASE 03 — Strapi (CMS)
- **Objetivo:** modelagem completa, i18n, cliente tipado e camada de adaptação.
- **Entregas:** single type `settings-globais` · collections `menu-item`, `rodape-coluna`, `pages` (Dynamic Zone), `products` (**sem nenhum campo de preço**), `categories`, `faq-item`, `avaliacoes`, `solicitacoes` · componente `seo` · Dynamic Zone `blocos` (hero, busca, grade-de-categorias, produtos-em-destaque, destaque-led, como-funciona, diferenciais, avaliacoes, chamada-final, texto-rico, faq, formulario-contato, comparativo-led) · i18n 3 locales · permissões · webhooks de revalidação · seed de **estrutura sem conteúdo fictício** · cliente Next server-only com **validação Zod de toda resposta** · adaptadores CMS→props · sanitização de rich text.
- **Docs:** `docs/cms-fluxo-editorial.md` (criar em pt-BR e propagar en/es; confirmar se a versão copia de outro locale).
- **Aceite:** toda resposta validada por Zod · nenhuma Dynamic Zone renderiza HTML cru sem sanitização · tokens do Strapi só no servidor.

## FASE 04 — Home
- **Entradas:** Home.dc.html, Fases 02–03. **Entregas:** rota `/[locale]` com blocos da Home ligados ao CMS. **Aceite:** fidelidade desktop+375px, sem preço, dataLayer `view_item_list` onde aplicável.

## FASE 05 — Catálogo
- **Entregas:** `/[locale]/catalogo` — busca, filtros, **drawer mobile de filtros**, chips, grade, estados (vazio/carregando/sem resultados/erro). **Aceite:** filtros acessíveis por teclado; `search`, `filter_applied`, `view_item_list`.

## FASE 06 — Categoria
- **Entregas:** modelo único para as 5 categorias, incluindo o **comparativo LED (P1.9 × P3.9)**. **Aceite:** `ItemList`, breadcrumb, fidelidade.

## FASE 07 — Produto
- **Rota canônica:** `/[locale]/[categoria]/[slug]` — ver `docs/adr/003-rota-canonica-produto.md`.
- **Entregas:** modelos físico / com-variação / serviço-técnico configurável / pacote · galeria · specs/medidas · FAQ do produto · relacionados · **variação obrigatória bloqueia adicionar sem escolher**. **Aceite:** `view_item`, `select_item`, `add_to_quote`; erro de variação; sem preço.

## FASE 08 — Carrinho de orçamento
- **Entregas:** slice Redux · **persistência localStorage com versionamento + migração** · estados (vazio/com itens) · quantidade/remover/limpar. **Aceite:** recarregar mantém carrinho; `add_to_quote`/`remove_from_quote`/`view_quote`; sem preço em lugar nenhum.

## FASE 09 — Formulário multi-etapa
> ⚠️ **O layout tem 5 etapas, não 9** (ver `docs/00-divergencias.md` #14). Plano assume **5 etapas** (recomendação A): (1) Contato · (2) Evento · (3) Local/logística · (4) Produtos+arquivos · (5) Finalizar/consentimentos.
- **Entregas:** stepper 5 etapas · **Zod por etapa** (regras reais: email regex, telefone ≥10 díg., data não-passada, cidade, 2 consentimentos obrigatórios) · **rascunho persistente** (localStorage `amr-solicitacao-rascunho-v1`, debounce 700ms, versionado + migração) · upload drag-and-drop (allowlist PDF/JPG/JPEG/PNG por **magic number**, ≤25 MB, nome sanitizado, fora da raiz pública, barra de progresso) · **Route Handler de envio** (nunca cliente→Strapi direto) · geração de protocolo `AMR-XXXX` · e-mail interno + automático · consentimentos com timestamp/IP · honeypot + verificação de origem + rate limiting.
- **Campo "Faixa de investimento" (US$)** na etapa 5 (#15): manter como faixa de budget com ressalva; **allowlist no teste anti-preço** para `US$`/faixa (é budget do cliente, não preço de produto).
- **Aceite:** `begin_quote_request`, **`quote_step_completed` (nº+nome da etapa)**, `quote_request_submitted/error` · validação cliente (UX) e servidor (verdade) · recarregar mantém rascunho · bloqueia envio se anexo não concluiu.

## FASE 10 — Confirmação
- **Entregas:** `/[locale]/solicitacao-recebida` com protocolo e próximos passos. **Aceite:** noindex se aplicável, fidelidade.

## FASE 11 — Institucionais
- **Entregas:** Sobre, FAQ (`FAQPage`), Contato (Route Handler + honeypot + rate limit), páginas legais. **Aceite:** `contact_form_submitted`, `phone_click`, `email_click`; accordion acessível.

## FASE 12 — SEO e dados estruturados
- **Entregas:** Metadata API por rota (via componente `seo` do CMS + fallback) · **hreflang pt-BR/en/es + x-default** · canônica por locale · `sitemap.xml` por locale + `robots.txt` · rascunhos noindex · OG/Twitter completos · **schema.org: Organization+LocalBusiness, BreadcrumbList, FAQPage, ItemList, Product SEM `offers`** (nunca price/priceCurrency/availability). **Aceite:** validado no Rich Results Test + Schema Markup Validator; nenhum preço no JSON-LD.

## FASE 13 — Medição
- **Entregas:** módulo **dataLayer tipado** (única porta de saída, sem `window.dataLayer.push` solto) · GTM/GA4/Pixel via GTM · **Consent Mode v2** (estado padrão negado) · banner de consentimento (nenhum aceite pré-marcado; opção mais preservadora por padrão). **Aceite:** nenhum evento carrega value/currency/price/revenue; Pixel só após consentimento; snapshot da sequência de eventos.

## FASE 14 — Performance e Core Web Vitals
- **Metas (campo, mobile, p75):** LCP < 2,5s · INP < 200ms · CLS < 0,1 · TTFB < 800ms. **Entregas:** auditoria, correções, Lighthouse CI verde, orçamento de JS por rota no CI. **Aceite:** Server Components por padrão; `next/image` com width/height; ISR/revalidação por webhook; sem client-side fetch de conteúdo.

## FASE 15 — Segurança
- **Entregas:** **CSP com nonce** funcionando (styled-components + GTM sem `unsafe-inline` global) · HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors · rate limiting · hardening de upload · revisão de segredos (nenhum em `NEXT_PUBLIC_`) · `npm audit` limpo + Dependabot. **Aceite:** testes de segredo/preço passando; upload valida magic number.

## FASE 16 — QA final
- **Entregas:** e2e Playwright completo nos 3 locales × mobile/desktop (catálogo→filtro→produto→adicionar→carrinho→form 5 etapas→envio→confirmação) · variação obrigatória · persistência · estados vazio/carregando/sem resultados/erro · navegação por teclado · troca de locale preserva rota · **verificação "nenhuma tela exibe preço"** · snapshot do dataLayer · axe · 375px sem scroll horizontal · revisão de conteúdo · `docs/HANDOFF.md`.
- **Aceite:** cobertura ≥80% em lógica de negócio; suíte e2e verde.

## FASE 17 — Deploy: Docker produção + GitHub + VPS Hostinger *(nova — requisito do cliente)*
- **Objetivo:** publicar o site na VPS Hostinger a partir do GitHub, de forma reproduzível.
- **Entradas:** Dockerfiles/compose da Fase 01, CI da Fase 01, credenciais da VPS Hostinger.
- **Entregas:**
  - `Dockerfile` de produção (Next standalone, imagem enxuta) + imagem do Strapi.
  - `docker-compose.prod.yml` (app + Strapi + Postgres + **reverse proxy Caddy** com TLS automático) na VPS.
  - **GitHub Actions**: build das imagens no push da branch de release, push para registry (GHCR), e **deploy sync na VPS** (SSH `docker compose pull && up -d`, ou webhook).
  - Volumes persistentes (Postgres, uploads do Strapi), backup e variáveis de ambiente por secret (nunca no repo).
  - `docs/DEPLOY.md`: como publicar, rollback, e onde ficam os secrets.
- **Aceite:**
  - [ ] `git push` na branch de release → imagens buildadas → VPS atualizada sem downtime perceptível.
  - [ ] Segredos apenas em GitHub Secrets / `.env` na VPS (fora do git).
  - [ ] Headers de segurança/HSTS/CSP servidos em produção pelo proxy.
  - [ ] TLS válido; domínio apontado.
- **Riscos:** recursos da VPS Hostinger (RAM para Next+Strapi+Postgres) — dimensionar; estratégia de migração/seed do Strapi em produção.
- **Decisão travada:** registry **GHCR** + proxy **Caddy** — ver `docs/adr/004-deploy-ghcr-caddy.md`.

---

### Notas de sequência
- Fase 01 já entrega o **esqueleto** de Docker + CI para desenvolvimento; Fase 17 **finaliza** o pipeline de produção/VPS. Assim o ambiente containerizado existe desde o dia 1.
- ADRs vivem em `docs/adr/`. Divergências em `docs/divergencias.md` (e as da Fase 00 em `docs/00-divergencias.md`).
