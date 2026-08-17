# Requisitos: All Music Rentals (AMR)

**Definidos:** 2026-08-17 (derivados de `.planning/intel/requirements.md` e dos critérios de aceite de `docs/PLANO.md`)
**Core Value:** O visitante consegue montar e enviar uma solicitação de orçamento de ponta a ponta, nos três idiomas, sem que nenhum preço apareça em lugar nenhum do produto.

> **Proveniência:** não há PRD no conjunto ingerido. Estes requisitos vêm dos critérios de aceite
> embutidos nos SPECs (`docs/PLANO.md` por fase, `docs/00-inventario.md` §10) e das decisões travadas
> em `.planning/intel/decisions.md`. Ver `.planning/INGEST-CONFLICTS.md` para o impacto.

---

## v1 Requirements

### Regra inviolável — sem preço (PRECO)

Requisito global, enforçado em pontos distintos do produto. Cada ponto de enforcement é um requisito
próprio, atribuído à fase que o implementa.

- [x] **PRECO-01**: Guarda de build falha se vocabulário de preço/compra aparecer no código, nos schemas do CMS ou no bundle
- [x] **PRECO-02**: O content-type `product` no Strapi não tem nenhum campo de preço, valor ou pagamento
- [ ] **PRECO-03**: JSON-LD de `Product` é emitido sem `offers` (nunca `price`, `priceCurrency`, `availability`)
- [ ] **PRECO-04**: Nenhum evento do `dataLayer` carrega `value`, `currency`, `price` ou `revenue`
- [ ] **PRECO-05**: Suíte e2e verifica, nos 3 locales, que nenhuma tela do site exibe preço
- [ ] **PRECO-06**: O campo "Faixa de investimento" (US$) aparece só na etapa 5, com ressalva em tela, e é a única entrada da allowlist do teste anti-preço

### Fase 0 — Inventário e plano (INV)

- [x] **INV-01**: Tokens de cor, fonte, espaço, raio, borda, sombra, gradiente, breakpoint e keyframe extraídos do código-fonte com contagem de uso, em `docs/tokens/tokens.json` + `tokens.md`
- [x] **INV-02**: Inventário de páginas, blocos, texto, componentes, formulários, estados e imagens em `docs/00-inventario.md`
- [x] **INV-03**: Divergências do layout-fonte listadas em `docs/00-divergencias.md`, com as aprovadas marcadas e datadas

### Fundação e infraestrutura transversal (FUND)

- [x] **FUND-01**: Aplicação Next 16 App Router com TypeScript strict e styled-components com registry SSR, sem erro de hidratação
- [x] **FUND-02**: i18n de três locales (pt-BR padrão, en, es) com roteamento por prefixo de caminho e troca de idioma funcionando
- [x] **FUND-03**: Redux Toolkit com store por requisição, Zod e Radix integrados
- [x] **FUND-04**: `docker compose up` sobe app + Postgres + CMS localmente, e o pipeline de CI (lint, typecheck, test, build) fica verde
- [x] **FUND-05**: Headers de segurança básicos servidos e orçamento de performance verificado no CI

### Design system (DS)

- [x] **DS-01**: Tema TypeScript tipado (`theme.cor/fonte/tamanho/espaco/raio/borda/sombra/motion/breakpoint`) derivado de `tokens.json`, sem valor inventado
- [x] **DS-02**: Primitivos tipográficos via `next/font` — Archivo display com eixo `wdth` preservado no subset, Public Sans corpo, IBM Plex Mono
- [x] **DS-03**: Primitivos de interação com todos os estados: Button, Field, Chip, QuantityStepper, ColorSwatches, Container
- [x] **DS-04**: Chrome global: TopBar, Header sticky, MobileMenu e Footer, com troca desktop/mobile por media query em 1080px
- [x] **DS-05**: Componentes de feedback: Notice, Toast, SectionDivider, Skeleton, EmptyState e ImagePlaceholder, com os keyframes do layout
- [x] **DS-06**: `ProductCard` com as três variantes de controle (físico, com-variação, serviço técnico)
- [x] **DS-07**: Acessibilidade do design system: alvo de toque ≥44px, foco visível, contraste AA, `prefers-reduced-motion` e axe sem violação crítica

### CMS Strapi (CMS)

- [x] **CMS-01**: Modelo Strapi completo — single type `settings-globais`; collections `menu-item`, `rodape-coluna`, `page`, `product`, `category`, `faq-item`, `avaliacao`, `solicitacao`
- [x] **CMS-02**: Componentes compartilhados (`seo`, característica, medida, variação, subcategoria, pergunta-resposta) e Dynamic Zone `blocos` com os 13 blocos previstos
- [x] **CMS-03**: i18n de 3 locales, permissões por role e seed de **estrutura sem conteúdo fictício**
- [x] **CMS-04**: Cliente Next server-only com **toda resposta do Strapi validada por Zod**, incluindo Dynamic Zone como união discriminada (bloco desconhecido vira `null`, não quebra a página)
- [x] **CMS-05**: Adaptadores CMS→props com tags de cache, e sanitização de rich text com allowlist estrita (tipo marcado `HtmlSeguro`) — nenhuma Dynamic Zone renderiza HTML cru
- [x] **CMS-06**: Webhook de revalidação por tipo de conteúdo, com tokens do Strapi apenas no servidor
- [ ] **CMS-07**: Fase 3 verificada (UAT com o Strapi rodando em Docker) e branch `fase-03-strapi` publicada no GitHub

### Documentação e fechamento de divergências (DOC)

- [ ] **DOC-01**: Divergências 5 (Header/nav), 6 (Rodapé), 7 (Card de produto) e 9 (Toast) de `docs/00-divergencias.md` fechadas conferindo o componente real da Fase 2; onde o código divergir da proposta, registrar em `docs/divergencias.md`
- [ ] **DOC-02**: Divergências 11 (produto como fonte única de metadados) e 12 (microcopy legal em `settings-globais`) fechadas conferindo o modelo real da Fase 3
- [ ] **DOC-03**: `docs/PLANO.md` corrigido — linha 92 passa de "form 9 etapas" para 5 etapas, estado das fases atualizado, nota "Decisão aberta" da Fase 17 removida; ADRs novos criados para a rota canônica de produto e para GHCR + Caddy

### Home (HOME)

- [ ] **HOME-01**: `/[locale]` renderiza os blocos da Home vindos do CMS: hero, busca grande, grade de categorias e CTA final
- [ ] **HOME-02**: Bloco de produtos em destaque (slider) e seção de painéis de LED (P1.9/P3.9 + listas + galeria de 3 imagens)
- [ ] **HOME-03**: Blocos "como funciona" (4 etapas), "diferenciais" (5 blocos) e avaliações com estados vazio e carregando, sem conteúdo fictício
- [ ] **HOME-04**: Fidelidade conferida lado a lado com `Home.dc.html` em desktop e 375px
- [ ] **HOME-05**: Evento `view_item_list` emitido nos blocos de listagem da Home

### Medição (MED)

- [ ] **MED-01**: Módulo `dataLayer` tipado é a única porta de saída de eventos — `window.dataLayer.push` solto é proibido e barrado por lint/teste
- [ ] **MED-02**: GTM carregado com GA4 e Pixel configurados via GTM, com IDs vindos de `settings-globais`
- [ ] **MED-03**: Consent Mode v2 com estado padrão negado e banner sem nenhum aceite pré-marcado; Pixel só dispara após consentimento
- [ ] **MED-04**: Snapshot da sequência de eventos do fluxo completo, versionado como teste

### Catálogo (CATA)

- [ ] **CATA-01**: `/[locale]/catalogo` com busca (`input type=search`, `novalidate`, erro inline em busca vazia, botão desabilitado em `busy`)
- [ ] **CATA-02**: Filtros em acordeão vertical com os 5 grupos (Categoria, Tipo de item, Cor por swatch, Tipo de evento, Ambiente), combinando AND entre grupos e OR dentro do grupo
- [ ] **CATA-03**: Drawer mobile de filtros, chips de filtro ativo com remoção e ordenação com as 5 opções
- [ ] **CATA-04**: Grade de produtos com os quatro estados: vazio, carregando (skeletons), sem resultados e erro
- [ ] **CATA-05**: Todos os filtros e o drawer operáveis por teclado, com foco visível e trap correto
- [ ] **CATA-06**: Eventos `search`, `filter_applied` e `view_item_list` emitidos pela porta tipada

### Categoria (CATG)

- [ ] **CATG-01**: Um único modelo de página atende as 5 categorias reais (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`), com hero, subcategorias numeradas, aplicações e FAQ da categoria
- [ ] **CATG-02**: Filtros da categoria como botões toggle horizontais, distintos do acordeão do catálogo
- [ ] **CATG-03**: Comparativo LED P1.9 × P3.9 renderizado **só em `telas-de-led`**, com régua 0–10m, tabela de 7 critérios que empilha abaixo de 760px e CTA "NÃO SEI QUAL ESCOLHER"
- [ ] **CATG-04**: Estado "em preparação" exibido em `luz-e-som`, `tendas` e `moveis`, e estado "sem resultado" com texto distinto do catálogo
- [ ] **CATG-05**: Breadcrumb e `ItemList` presentes na página de categoria

### Produto / PDP (PROD)

- [ ] **PROD-01**: Produto acessível na rota canônica `/[locale]/[categoria]/[slug]`, com guarda que impede colisão entre slug de categoria e slug de produto
- [ ] **PROD-02**: Produto que muda de categoria responde com redirect 301 da URL antiga para a nova
- [ ] **PROD-03**: Os quatro arquétipos renderizam corretamente: físico, com-variação, serviço técnico configurável e pacote
- [ ] **PROD-04**: Galeria com zoom-hover, ficha técnica com medidas e FAQ do produto em accordion acessível
- [ ] **PROD-05**: Blocos "Frequentemente alugado com" e produtos relacionados, derivados do mesmo registro de `product`
- [ ] **PROD-06**: Configurador de LED (largura×altura ou "Ainda não sei", ambiente, instalação, conteúdo múltiplo, suporte, observações) e stepper de quantidade com mínimo 1 e `inputmode=numeric`
- [ ] **PROD-07**: Variação obrigatória não escolhida bloqueia o "adicionar ao orçamento" e dispara o shake de erro
- [ ] **PROD-08**: Eventos `view_item`, `select_item` e `add_to_quote` emitidos pela porta tipada

### Carrinho de orçamento (ORC)

- [ ] **ORC-01**: Slice Redux do orçamento com persistência em localStorage **versionada e com migração** — recarregar a página mantém o carrinho
- [ ] **ORC-02**: `/[locale]/meu-orcamento` com estado vazio (incluindo "COMO FUNCIONA" em 3 passos) e estado com itens, permitindo alterar quantidade, remover e limpar
- [ ] **ORC-03**: Aside "O QUE A EQUIPE VAI RECEBER" com percentual de prontidão calculado a partir dos itens
- [ ] **ORC-04**: Aviso "não representa compra ou reserva" exibido a partir do microcopy legal de `settings-globais`
- [ ] **ORC-05**: Toast de adicionado/removido com ação DESFAZER, com o offset correto onde há barra fixa
- [ ] **ORC-06**: Eventos `add_to_quote`, `remove_from_quote` e `view_quote` emitidos pela porta tipada

### Formulário de solicitação (FORM)

- [ ] **FORM-01**: `/[locale]/solicitar-orcamento` com stepper de **5 etapas** ("ETAPA n DE 5"): Contato · Evento · Local/logística · Produtos+arquivos · Finalizar/consentimentos, em layout sem topbar e com header enxuto
- [ ] **FORM-02**: Validação Zod por etapa com as regras reais (e-mail por regex, telefone ≥10 dígitos, data do evento não-passada, cidade obrigatória, consentimentos c1 e c2 obrigatórios), no cliente para UX e no servidor como verdade
- [ ] **FORM-03**: Rascunho persistente em `amr-solicitacao-rascunho-v1` com debounce de 700ms, versionado com migração, restaurando inclusive a etapa em que o usuário parou
- [ ] **FORM-04**: Upload drag-and-drop com allowlist PDF/JPG/JPEG/PNG validada por **magic number**, limite de 25 MB por arquivo, nome sanitizado, armazenamento fora da raiz pública e barra de progresso — envio bloqueado enquanto algum anexo estiver em `pct<100`
- [ ] **FORM-05**: Envio via Route Handler (nunca cliente→Strapi direto), gerando protocolo `AMR-XXXX`, gravando consentimentos com timestamp e IP e disparando e-mail interno + automático ao solicitante
- [ ] **FORM-06**: Honeypot, verificação de origem e rate limiting ativos no Route Handler de envio
- [ ] **FORM-07**: Eventos `begin_quote_request`, `quote_step_completed` (número + nome da etapa) e `quote_request_submitted` / `quote_request_error`

### Confirmação (CONF)

- [ ] **CONF-01**: `/[locale]/solicitacao-recebida` com badge "EM ANÁLISE" pulsante, protocolo do envio e aviso de não-reserva
- [ ] **CONF-02**: Cartão resumo "O QUE CHEGOU ATÉ NÓS" e bloco "Próximas etapas" com os 4 cards (Análise → Disponibilidade → Logística → Proposta), o primeiro marcado "AGORA"
- [ ] **CONF-03**: Página marcada `noindex` e o rascunho do formulário limpo após o sucesso

### Institucionais (INST)

- [ ] **INST-01**: `/[locale]/sobre` com hero, dois cartões (experiência e estrutura) e o bloco "Da seleção à confirmação" em 4 passos
- [ ] **INST-02**: `/[locale]/faq` com as 10 Q&A, destaque da PERGUNTA 01 (incluindo os 7 fatores de "O QUE ENTRA NO CÁLCULO") e accordion exclusivo acessível por teclado
- [ ] **INST-03**: `/[locale]/contato` com os 8 campos, envio por Route Handler com honeypot e rate limit, e estado de sucesso que substitui o formulário
- [ ] **INST-04**: Páginas legais (privacidade e termos) publicadas e referenciadas pelos consentimentos do formulário
- [ ] **INST-05**: Eventos `contact_form_submitted`, `phone_click` e `email_click`

### SEO e dados estruturados (SEO)

- [ ] **SEO-01**: Metadata API por rota alimentada pelo componente `seo` do CMS, com fallback quando o campo estiver vazio
- [ ] **SEO-02**: `hreflang` para pt-BR/en/es mais `x-default`, e canônica por locale usando a rota canônica de produto
- [ ] **SEO-03**: `sitemap.xml` por locale e `robots.txt`, com rascunhos do CMS marcados `noindex`
- [ ] **SEO-04**: Open Graph e Twitter Card completos em todas as rotas, com imagem OG padrão de `settings-globais`
- [ ] **SEO-05**: JSON-LD de `Organization` + `LocalBusiness`, `BreadcrumbList`, `FAQPage` e `ItemList`, validados no Rich Results Test e no Schema Markup Validator

### Performance (PERF)

- [ ] **PERF-01**: Metas de campo atingidas em mobile p75: LCP < 2,5s, INP < 200ms, CLS < 0,1, TTFB < 800ms
- [ ] **PERF-02**: Lighthouse CI verde e orçamento de JS por rota verificado no pipeline
- [ ] **PERF-03**: Server Components por padrão, `next/image` sempre com `width`/`height`, ISR com revalidação por webhook e nenhum fetch de conteúdo no cliente
- [ ] **PERF-04**: Gatilho de reversão do `DEC-styled-components` avaliado com dado de campo e o resultado registrado no ADR 001

### Segurança (SEG)

- [x] **SEG-01**: Teste falha se qualquer segredo vazar para o bundle cliente
- [ ] **SEG-02**: CSP com nonce funcionando em produção, com styled-components e GTM, sem `unsafe-inline` global
- [ ] **SEG-03**: HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e `frame-ancestors` servidos em todas as respostas
- [ ] **SEG-04**: Rate limiting e hardening de upload revisados de ponta a ponta, com o magic number verificado por teste
- [ ] **SEG-05**: Nenhum segredo em `NEXT_PUBLIC_`, `npm audit` limpo e Dependabot ativo

### QA final (QA)

- [ ] **QA-01**: Suíte e2e Playwright cobre o fluxo catálogo → filtro → produto → adicionar → carrinho → formulário → envio → confirmação nos 3 locales × mobile/desktop
- [ ] **QA-02**: e2e cobre variação obrigatória, persistência do carrinho e do rascunho, estados vazio/carregando/sem resultados/erro, navegação por teclado, troca de locale preservando a rota e 375px sem scroll horizontal
- [ ] **QA-03**: axe sem violação crítica em todas as rotas públicas
- [ ] **QA-04**: Cobertura de teste ≥80% na lógica de negócio
- [ ] **QA-05**: `docs/HANDOFF.md` escrito e revisão final de conteúdo concluída nos 3 idiomas

### Deploy (DEP)

- [ ] **DEP-01**: `Dockerfile` de produção do Next (standalone, imagem enxuta) e imagem de produção do Strapi
- [ ] **DEP-02**: `docker-compose.prod.yml` com app + Strapi + Postgres + Caddy, volumes persistentes (Postgres e uploads do Strapi) e rotina de backup
- [ ] **DEP-03**: GitHub Actions builda as imagens no push da branch de release, publica em **GHCR** e faz deploy sync na VPS por SSH (`docker compose pull && up -d`), sem downtime perceptível
- [ ] **DEP-04**: Caddy serve o domínio com TLS válido e automático e propaga os headers de segurança/HSTS/CSP em produção
- [ ] **DEP-05**: Segredos existem apenas em GitHub Secrets e no `.env` da VPS, nunca no repositório
- [ ] **DEP-06**: `docs/DEPLOY.md` documenta publicação, rollback e onde ficam os secrets
- [ ] **DEP-07**: Estratégia de migração/seed do Strapi em produção definida e a RAM da VPS Hostinger dimensionada para Next + Strapi + Postgres + Caddy

---

## v2 Requirements

Reconhecidos, fora do roadmap atual.

- **V2-01**: Storybook como vitrine externa do design system (a showcase interna em `/[locale]/design-system` já cobre a necessidade)
- **V2-02**: Área logada do cliente para acompanhar o andamento da solicitação
- **V2-03**: Integração do fluxo de solicitação com CRM
- **V2-04**: Busca com indexação dedicada (a busca v1 é sobre o dataset do CMS)

## Out of Scope

| Item | Motivo |
|------|--------|
| Preço, pagamento, checkout, carrinho de compras | O produto é orçamento consultivo, não e-commerce. Regra inviolável. |
| Endereço físico, mapa e redes sociais | Decisão de conteúdo do cliente; contato é telefone e e-mail. |
| Conteúdo fictício em qualquer ambiente | Depoimento, avaliação, número ou selo inventado é proibido; falta de conteúdo real vira placeholder com legenda técnica. |
| Formulário de 9 etapas | Rejeitado por `DEC-00-14`; o layout tem 5. |
| Biblioteca fora da stack fechada | Custo de bundle e manutenção; só com aprovação justificada. |
| Screenshots `FireShot Capture 005/007` e `Logo AMR original v4.png` | Não referenciados pelos HTMLs; descartados do build. |

---

## Traceability

| Requisito | Fase | Status |
|-----------|------|--------|
| INV-01 | Phase 0 | Complete |
| INV-02 | Phase 0 | Complete |
| INV-03 | Phase 0 | Complete |
| FUND-01 | Phase 1 | Complete |
| FUND-02 | Phase 1 | Complete |
| FUND-03 | Phase 1 | Complete |
| FUND-04 | Phase 1 | Complete |
| FUND-05 | Phase 1 | Complete |
| PRECO-01 | Phase 1 | Complete |
| SEG-01 | Phase 1 | Complete |
| DS-01 | Phase 2 | Complete |
| DS-02 | Phase 2 | Complete |
| DS-03 | Phase 2 | Complete |
| DS-04 | Phase 2 | Complete |
| DS-05 | Phase 2 | Complete |
| DS-06 | Phase 2 | Complete |
| DS-07 | Phase 2 | Complete |
| CMS-01 | Phase 3 | Em verificação |
| CMS-02 | Phase 3 | Em verificação |
| CMS-03 | Phase 3 | Em verificação |
| CMS-04 | Phase 3 | Em verificação |
| CMS-05 | Phase 3 | Em verificação |
| CMS-06 | Phase 3 | Em verificação |
| CMS-07 | Phase 3 | Pending |
| PRECO-02 | Phase 3 | Em verificação |
| DOC-01 | Phase 3 | Pending |
| DOC-02 | Phase 3 | Pending |
| DOC-03 | Phase 3 | Pending |
| HOME-01 | Phase 4 | Pending |
| HOME-02 | Phase 4 | Pending |
| HOME-03 | Phase 4 | Pending |
| HOME-04 | Phase 4 | Pending |
| HOME-05 | Phase 4 | Pending |
| MED-01 | Phase 4 | Pending |
| CATA-01 | Phase 5 | Pending |
| CATA-02 | Phase 5 | Pending |
| CATA-03 | Phase 5 | Pending |
| CATA-04 | Phase 5 | Pending |
| CATA-05 | Phase 5 | Pending |
| CATA-06 | Phase 5 | Pending |
| CATG-01 | Phase 6 | Pending |
| CATG-02 | Phase 6 | Pending |
| CATG-03 | Phase 6 | Pending |
| CATG-04 | Phase 6 | Pending |
| CATG-05 | Phase 6 | Pending |
| PROD-01 | Phase 7 | Pending |
| PROD-02 | Phase 7 | Pending |
| PROD-03 | Phase 7 | Pending |
| PROD-04 | Phase 7 | Pending |
| PROD-05 | Phase 7 | Pending |
| PROD-06 | Phase 7 | Pending |
| PROD-07 | Phase 7 | Pending |
| PROD-08 | Phase 7 | Pending |
| ORC-01 | Phase 8 | Pending |
| ORC-02 | Phase 8 | Pending |
| ORC-03 | Phase 8 | Pending |
| ORC-04 | Phase 8 | Pending |
| ORC-05 | Phase 8 | Pending |
| ORC-06 | Phase 8 | Pending |
| FORM-01 | Phase 9 | Pending |
| FORM-02 | Phase 9 | Pending |
| FORM-03 | Phase 9 | Pending |
| FORM-04 | Phase 9 | Pending |
| FORM-05 | Phase 9 | Pending |
| FORM-06 | Phase 9 | Pending |
| FORM-07 | Phase 9 | Pending |
| PRECO-06 | Phase 9 | Pending |
| CONF-01 | Phase 10 | Pending |
| CONF-02 | Phase 10 | Pending |
| CONF-03 | Phase 10 | Pending |
| INST-01 | Phase 11 | Pending |
| INST-02 | Phase 11 | Pending |
| INST-03 | Phase 11 | Pending |
| INST-04 | Phase 11 | Pending |
| INST-05 | Phase 11 | Pending |
| SEO-01 | Phase 12 | Pending |
| SEO-02 | Phase 12 | Pending |
| SEO-03 | Phase 12 | Pending |
| SEO-04 | Phase 12 | Pending |
| SEO-05 | Phase 12 | Pending |
| PRECO-03 | Phase 12 | Pending |
| MED-02 | Phase 13 | Pending |
| MED-03 | Phase 13 | Pending |
| MED-04 | Phase 13 | Pending |
| PRECO-04 | Phase 13 | Pending |
| PERF-01 | Phase 14 | Pending |
| PERF-02 | Phase 14 | Pending |
| PERF-03 | Phase 14 | Pending |
| PERF-04 | Phase 14 | Pending |
| SEG-02 | Phase 15 | Pending |
| SEG-03 | Phase 15 | Pending |
| SEG-04 | Phase 15 | Pending |
| SEG-05 | Phase 15 | Pending |
| QA-01 | Phase 16 | Pending |
| QA-02 | Phase 16 | Pending |
| QA-03 | Phase 16 | Pending |
| QA-04 | Phase 16 | Pending |
| QA-05 | Phase 16 | Pending |
| PRECO-05 | Phase 16 | Pending |
| DEP-01 | Phase 17 | Pending |
| DEP-02 | Phase 17 | Pending |
| DEP-03 | Phase 17 | Pending |
| DEP-04 | Phase 17 | Pending |
| DEP-05 | Phase 17 | Pending |
| DEP-06 | Phase 17 | Pending |
| DEP-07 | Phase 17 | Pending |

**Cobertura:**
- Requisitos v1: 106 no total
- Mapeados para fases: 106
- Não mapeados: 0 ✓
- Concluídos: 17 · Em verificação: 7 · Pendentes: 82

---
*Requisitos definidos: 2026-08-17*
*Última atualização: 2026-08-17, na criação do roadmap GSD*
