# Requisitos

> **Nota de proveniência:** nenhum documento do conjunto ingerido foi classificado como `PRD`.
> Os requisitos abaixo foram derivados dos **critérios de aceite** presentes nos documentos
> classificados como `SPEC` (`docs/PLANO.md`, `docs/00-inventario.md`) e das decisões travadas
> em `decisions.md`. Como não há PRDs concorrentes, **não existem variantes de aceite competindo**
> — mas também não existe uma fonte de requisito de produto independente do plano de execução.
> Ver `INGEST-CONFLICTS.md` (INFO) para o impacto disso.

---

## Requisito global (inviolável)

### REQ-sem-preco — Orçamento sem preço e sem pagamento
- source: `docs/PLANO.md` (cabeçalho, "Regra inviolável"), `docs/cms-fluxo-editorial.md`, `docs/00-divergencias.md` (#15)
- escopo: toda a base — UI, modelo de dados, dataLayer, schema.org, nomes de variáveis
- Descrição: o produto é um fluxo de **orçamento**, sem preço e sem pagamento em nenhuma tela, campo, evento ou dado estruturado.
- Aceite:
  - Nenhuma tela exibe preço (verificação explícita na suíte e2e da Fase 16).
  - `products` no Strapi **sem nenhum campo de preço**.
  - Nenhum evento do dataLayer carrega `value`, `currency`, `price` ou `revenue`.
  - JSON-LD de `Product` **sem `offers`** (nunca `price`, `priceCurrency`, `availability`).
  - Teste de build falha se palavra de preço/compra aparecer.
  - Vocabulário: "orçamento"/"solicitação". Nunca "comprar/checkout/carrinho de compras".
- Exceção única e aprovada: campo "Faixa de investimento" (US$) na etapa 5 do formulário, com **allowlist** no teste anti-preço — ver `DEC-00-15`.

---

## Fundação e plataforma

### REQ-fundacao — Fundação Next + infraestrutura transversal
- source: `docs/PLANO.md` (Fase 01)
- Descrição: Next App Router + TS strict, registry styled-components SSR, `ThemeProvider`, Radix, i18n 3 locales com roteamento `[locale]`, Redux com **store por requisição** + Provider client, ESLint/Prettier/Husky, Jest, Playwright, headers de segurança, orçamento de performance no CI.
- Aceite: `docker compose up` sobe app + CMS localmente · CI verde no primeiro PR · registry SSR sem erro de hidratação · troca de locale funciona · teste anti-preço e teste de vazamento de segredo no bundle cliente passando.

### REQ-design-system — Design system a partir dos tokens
- source: `docs/PLANO.md` (Fase 02), `docs/tokens/tokens.md`, `docs/00-inventario.md` (§2, §3)
- Descrição: tema TS tipado (`theme.cor/fonte/tamanho/espaco/raio/borda/sombra/motion`) derivado de `docs/tokens/tokens.json` (não inventado); primitivos tipográficos via `next/font`; botões, campos, chips; componentes globais (topbar, header sticky, menu mobile, rodapé, bloco de aviso, toast, card de produto, divisor, placeholder de imagem, estados de erro/carregando); keyframes `amrFade/amrToast/amrErro/amrSpin/amrPulso/amrDrawer`; `prefers-reduced-motion` (ausente no HTML, adicionar).
- Aceite: cada componente com todos os estados · alvo de toque ≥44px · foco visível · contraste AA · escala fluida sem media query fixa (exceção: `DEC-chrome-media-query`) · comparação lado a lado com o HTML.

### REQ-cms-strapi — Modelagem e camada de acesso ao Strapi
- source: `docs/PLANO.md` (Fase 03), `docs/cms-fluxo-editorial.md`, `docs/00-inventario.md` (§9)
- Descrição: single type `settings-globais`; collections `menu-item`, `rodape-coluna`, `pages` (Dynamic Zone), `products` (sem campo de preço), `categories`, `faq-item`, `avaliacoes`, `solicitacoes`; componente `seo`; Dynamic Zone `blocos` (hero, busca, grade-de-categorias, produtos-em-destaque, destaque-led, como-funciona, diferenciais, avaliacoes, chamada-final, texto-rico, faq, formulario-contato, comparativo-led); i18n 3 locales; permissões; webhooks de revalidação; seed de **estrutura sem conteúdo fictício**; cliente Next server-only com validação Zod de toda resposta; adaptadores CMS→props; sanitização de rich text.
- Aceite: toda resposta validada por Zod · nenhuma Dynamic Zone renderiza HTML cru sem sanitização · tokens do Strapi só no servidor.

---

## Páginas

### REQ-home — Home
- source: `docs/PLANO.md` (Fase 04), `docs/00-inventario.md` (§4)
- Descrição: rota `/[locale]` com os blocos da Home ligados ao CMS — hero, busca grande, grade de categorias, produtos em destaque (slider), seção LED (P1.9/P3.9 + galeria), como funciona (4 etapas), diferenciais (5 blocos), avaliações (com estados vazio/carregando), CTA final, rodapé, toast.
- Aceite: fidelidade desktop + 375px · sem preço · dataLayer `view_item_list` onde aplicável.

### REQ-catalogo — Catálogo
- source: `docs/PLANO.md` (Fase 05), `docs/00-inventario.md` (§4, §5.4)
- Descrição: `/[locale]/catalogo` com busca, filtros (Categoria, Tipo de item, Cor por swatch, Tipo de evento, Ambiente; AND entre grupos, OR dentro), drawer mobile de filtros, chips ativos, ordenação (5 opções), grade e estados (vazio/carregando/sem resultados/erro).
- Aceite: filtros acessíveis por teclado · eventos `search`, `filter_applied`, `view_item_list`.

### REQ-categoria — Categoria
- source: `docs/PLANO.md` (Fase 06), `docs/00-inventario.md` (§1, §7)
- Descrição: modelo único aplicado às 5 categorias (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`), incluindo o comparativo LED P1.9 × P3.9 renderizado só em `telas-de-led`, e o estado "em preparação" para as categorias ainda não prontas.
- Aceite: `ItemList` · breadcrumb · fidelidade.

### REQ-produto — Produto (PDP)
- source: `docs/PLANO.md` (Fase 07), `docs/00-inventario.md` (§5.5)
- Descrição: modelos físico / com-variação / serviço-técnico configurável / pacote; galeria com zoom-hover; specs e medidas; FAQ do produto; relacionados e "frequentemente alugado com"; configurador LED; quantidade com stepper.
- Aceite: `view_item`, `select_item`, `add_to_quote` · **variação obrigatória bloqueia adicionar sem escolher** (com shake de erro) · sem preço.

### REQ-carrinho-orcamento — Carrinho de orçamento
- source: `docs/PLANO.md` (Fase 08), `docs/00-inventario.md` (§4)
- Descrição: slice Redux com persistência em localStorage **versionada + migração**; estados vazio e com itens; quantidade, remover, limpar; aside "O QUE A EQUIPE VAI RECEBER" com % de prontidão; aviso "não representa compra ou reserva"; toast com DESFAZER.
- Aceite: recarregar mantém o carrinho · `add_to_quote` / `remove_from_quote` / `view_quote` · sem preço em lugar nenhum.

### REQ-formulario-orcamento — Formulário multi-etapa de solicitação
- source: `docs/PLANO.md` (Fase 09), `docs/00-inventario.md` (§5.1), `docs/00-divergencias.md` (#14, #15)
- Descrição: **5 etapas** (decisão travada `DEC-00-14`) — (1) Contato · (2) Evento · (3) Local/logística · (4) Produtos+arquivos · (5) Finalizar/consentimentos. Stepper "ETAPA n DE 5". Validação Zod por etapa com regras reais: e-mail por regex, telefone ≥10 dígitos, data do evento não-passada, cidade obrigatória, 2 consentimentos obrigatórios. Rascunho persistente em localStorage `amr-solicitacao-rascunho-v1` com debounce 700ms, versionado + migração, restaurando a etapa. Upload drag-and-drop com allowlist PDF/JPG/JPEG/PNG por **magic number**, ≤25 MB por arquivo, nome sanitizado, armazenado fora da raiz pública, com barra de progresso. Envio por **Route Handler** (nunca cliente→Strapi direto). Geração de protocolo `AMR-XXXX`. E-mail interno + automático. Consentimentos com timestamp/IP. Honeypot + verificação de origem + rate limiting.
- Campo "Faixa de investimento" (US$) opcional na etapa 5, com ressalva em tela e allowlist no teste anti-preço (`DEC-00-15`).
- Aceite: `begin_quote_request`, `quote_step_completed` (nº + nome da etapa), `quote_request_submitted` / `quote_request_error` · validação no cliente (UX) e no servidor (verdade) · recarregar mantém rascunho · bloqueia envio se anexo não concluiu (`pct<100`).

### REQ-confirmacao — Confirmação de solicitação
- source: `docs/PLANO.md` (Fase 10), `docs/00-inventario.md` (§4)
- Descrição: `/[locale]/solicitacao-recebida` com badge "EM ANÁLISE" pulsante, protocolo, aviso de não-reserva, cartão resumo e "Próximas etapas" (Análise→Disponibilidade→Logística→Proposta).
- Aceite: `noindex` se aplicável · fidelidade.

### REQ-institucionais — Sobre, FAQ, Contato e páginas legais
- source: `docs/PLANO.md` (Fase 11), `docs/00-inventario.md` (§4, §5.2)
- Descrição: Sobre; FAQ com 10 Q&A e accordion exclusivo (`FAQPage`); Contato com formulário de 8 campos via Route Handler + honeypot + rate limit e estado de sucesso que substitui o form; páginas legais.
- Aceite: `contact_form_submitted`, `phone_click`, `email_click` · accordion acessível.

---

## Transversais

### REQ-seo — SEO e dados estruturados
- source: `docs/PLANO.md` (Fase 12), `docs/adr/002-locale-padrao.md`
- Descrição: Metadata API por rota (componente `seo` do CMS + fallback), `hreflang` pt-BR/en/es + `x-default`, canônica por locale, `sitemap.xml` por locale + `robots.txt`, rascunhos `noindex`, OG/Twitter completos, schema.org Organization+LocalBusiness, BreadcrumbList, FAQPage, ItemList e Product **sem `offers`**.
- Aceite: validado no Rich Results Test e no Schema Markup Validator · nenhum preço no JSON-LD.

### REQ-medicao — Medição e consentimento
- source: `docs/PLANO.md` (Fase 13)
- Descrição: módulo **dataLayer tipado** como única porta de saída (proibido `window.dataLayer.push` solto); GTM/GA4/Pixel via GTM; Consent Mode v2 com estado padrão negado; banner de consentimento sem nenhum aceite pré-marcado, opção mais preservadora por padrão.
- Aceite: nenhum evento carrega `value`/`currency`/`price`/`revenue` · Pixel só após consentimento · snapshot da sequência de eventos.

### REQ-performance — Core Web Vitals
- source: `docs/PLANO.md` (Fase 14), `docs/adr/001-styled-components.md`
- Descrição: auditoria e correções de performance, Lighthouse CI verde, orçamento de JS por rota no CI.
- Aceite (campo, mobile, p75): **LCP < 2,5s · INP < 200ms · CLS < 0,1 · TTFB < 800ms** · Server Components por padrão · `next/image` com `width`/`height` · ISR/revalidação por webhook · sem client-side fetch de conteúdo.
- Vínculo: LCP > 2,5s p75 é o **gatilho de reversão** do `DEC-styled-components`.

### REQ-seguranca — Segurança
- source: `docs/PLANO.md` (Fase 15)
- Descrição: CSP com nonce funcionando (styled-components + GTM sem `unsafe-inline` global); HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors; rate limiting; hardening de upload; revisão de segredos (nenhum em `NEXT_PUBLIC_`); `npm audit` limpo + Dependabot.
- Aceite: testes de segredo e de preço passando · upload valida magic number.

### REQ-qa — QA final
- source: `docs/PLANO.md` (Fase 16), `docs/00-inventario.md` (§6)
- Descrição: e2e Playwright nos 3 locales × mobile/desktop cobrindo catálogo→filtro→produto→adicionar→carrinho→formulário→envio→confirmação; variação obrigatória; persistência; estados vazio/carregando/sem resultados/erro; navegação por teclado; troca de locale preservando rota; verificação "nenhuma tela exibe preço"; snapshot do dataLayer; axe; 375px sem scroll horizontal; revisão de conteúdo; `docs/HANDOFF.md`.
- Aceite: cobertura ≥80% em lógica de negócio · suíte e2e verde.
- ⚠️ O texto da Fase 16 diz "form 9 etapas" — leitura obsoleta, sobrescrita por `DEC-00-14` (5 etapas). Ver `INGEST-CONFLICTS.md`.

### REQ-deploy — Deploy: Docker produção + GitHub + VPS Hostinger
- source: `docs/PLANO.md` (Fase 17 — "nova, requisito do cliente")
- Descrição: `Dockerfile` de produção (Next standalone, imagem enxuta) + imagem do Strapi; `docker-compose.prod.yml` (app + Strapi + Postgres + reverse proxy com TLS) na VPS; GitHub Actions que builda as imagens no push da branch de release, publica em registry e faz deploy sync na VPS (SSH `docker compose pull && up -d`, ou webhook); volumes persistentes (Postgres, uploads do Strapi); backup; variáveis de ambiente por secret; `docs/DEPLOY.md` com publicação, rollback e localização dos secrets.
- Aceite: `git push` na branch de release → imagens buildadas → VPS atualizada sem downtime perceptível · segredos apenas em GitHub Secrets / `.env` na VPS (fora do git) · headers de segurança/HSTS/CSP servidos em produção pelo proxy · TLS válido e domínio apontado.
- ⚠️ Decisões em aberto: registry (GHCR vs build direto na VPS) e reverse proxy (Caddy / Traefik / Nginx). Ver `INGEST-CONFLICTS.md` (WARNING).
- Riscos: recursos da VPS Hostinger (RAM para Next + Strapi + Postgres); estratégia de migração/seed do Strapi em produção.
