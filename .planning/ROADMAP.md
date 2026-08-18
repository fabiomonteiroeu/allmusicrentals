# Roadmap: All Music Rentals (AMR)

## Overview

O projeto sai de um inventário do layout-fonte e chega a um catálogo trilíngue de aluguel de equipamento
para eventos publicado numa VPS, com fluxo de solicitação de orçamento de ponta a ponta e **sem preço em
nenhuma camada**. A ordem é: fundação e design system → CMS → páginas na sequência do funil
(Home → Catálogo → Categoria → Produto → Carrinho → Formulário → Confirmação → Institucionais) →
camadas transversais (SEO, medição, performance, segurança) → QA final → deploy de produção.

**Numeração preservada.** As fases 0–17 correspondem exatamente às FASES 00–17 de `docs/PLANO.md`, que é
a espinha dorsal aprovada pelo cliente. Os rótulos estruturais (`Phase`, `Goal`, `Depends on`,
`Requirements`, `Success Criteria`, `Plans`) ficam em inglês porque são lidos pelas ferramentas GSD;
todo o conteúdo é pt-BR.

**Estado real (2026-08-18):** Fases 0, 1, 2 e 3 concluídas — a Fase 3 fechou verificada
(`.planning/phases/03-strapi-cms/03-VERIFICATION.md`, `status: passed`), com 6/6 planos e 11/11
requisitos. Fase 4 (Home) planejada em 7 planos, aguardando execução. Fases 5–17 não iniciadas.
Branch corrente `fase-03-strapi`, publicada em `origin`.

## Phases

**Numeração de fases:**
- Fases inteiras (0, 1, 2, …): trabalho planejado, espelhando `docs/PLANO.md`
- Fases decimais (7.1, 7.2): inserções urgentes, executadas entre as inteiras

- [x] **Phase 0: Inventário e plano** - Tokens, inventário do layout-fonte e plano de fases
- [x] **Phase 1: Fundação** - Next 16 App Router, i18n, Redux, Docker de dev, CI e guardas
- [x] **Phase 2: Design system** - Tema dos tokens, primitivos, chrome, feedback e card de produto
- [x] **Phase 3: Strapi (CMS)** - Modelo, cliente server-only com Zod, sanitização e revalidação — verificada por UAT
- [ ] **Phase 4: Home** - `/[locale]` com os blocos da Home ligados ao CMS
- [ ] **Phase 5: Catálogo** - Busca, filtros em acordeão, drawer mobile, chips, grade e estados
- [ ] **Phase 6: Categoria** - Modelo único das 5 categorias e comparativo LED P1.9 × P3.9
- [ ] **Phase 7: Produto** - PDP em `/[locale]/[categoria]/[slug]` com os 4 arquétipos
- [ ] **Phase 8: Carrinho de orçamento** - Slice Redux persistido, prontidão e toast com DESFAZER
- [ ] **Phase 9: Formulário de solicitação** - 5 etapas, rascunho, upload seguro e envio com protocolo
- [ ] **Phase 10: Confirmação** - `/[locale]/solicitacao-recebida` com protocolo e próximas etapas
- [ ] **Phase 11: Institucionais** - Sobre, FAQ, Contato e páginas legais
- [ ] **Phase 12: SEO e dados estruturados** - Metadata, hreflang, sitemap e JSON-LD sem `offers`
- [ ] **Phase 13: Medição** - GTM/GA4/Pixel, Consent Mode v2 e banner de consentimento
- [ ] **Phase 14: Performance e Core Web Vitals** - Auditoria, correções e orçamento de JS no CI
- [ ] **Phase 15: Segurança** - CSP com nonce, headers, rate limiting e revisão de segredos
- [ ] **Phase 16: QA final** - e2e nos 3 locales × mobile/desktop, axe, cobertura e handoff
- [ ] **Phase 17: Deploy — GHCR + Caddy na VPS Hostinger** - Pipeline de produção reproduzível

## Phase Details

### Phase 0: Inventário e plano
**Goal**: Mapear a fonte da verdade e produzir o plano antes de qualquer código de aplicação
**Depends on**: Nothing (primeira fase)
**Requirements**: INV-01, INV-02, INV-03
**Success Criteria** (o que deve ser VERDADE):
  1. Existe `docs/tokens/tokens.json` + `tokens.md` com cor, fonte, espaço, raio, borda, sombra, gradiente, breakpoint e keyframe extraídos do código com contagem de uso
  2. Existe `docs/00-inventario.md` cobrindo páginas, blocos, texto, componentes, formulários, estados e imagens
  3. Existe `docs/00-divergencias.md` com as divergências listadas e as aprovadas marcadas e datadas
**Plans**: 3 plans — **CONCLUÍDA** (commit `208402b`, 2026-08-14)

Plans:
- [x] 00-01: Extração de tokens do CSS-fonte com contagem de uso
- [x] 00-02: Inventário de páginas, blocos, componentes, formulários, estados e imagens
- [x] 00-03: Registro de divergências e redação do `docs/PLANO.md` (17 fases)

### Phase 1: Fundação
**Goal**: Projeto Next rodando com toda a infraestrutura transversal e o ambiente Docker de desenvolvimento
**Depends on**: Phase 0
**Requirements**: FUND-01, FUND-02, FUND-03, FUND-04, FUND-05, PRECO-01, SEG-01
**Success Criteria** (o que deve ser VERDADE):
  1. `docker compose up` sobe app + Postgres + CMS localmente e o CI fica verde
  2. A aplicação renderiza com styled-components via registry SSR, sem erro de hidratação
  3. A troca entre pt-BR, en e es funciona pelo prefixo de caminho
  4. A guarda anti-preço falha o build se vocabulário de preço/compra aparecer, e a guarda anti-segredo falha se um segredo vazar no bundle cliente
**Plans**: 5 plans — **CONCLUÍDA** (branch `fase-01-fundacao`, 2026-08-14)

Plans:
- [x] 01-01: Scaffold Next 16 + TS strict + ESLint/Prettier (`02873b5`)
- [x] 01-02: i18n de 3 locales com roteamento por prefixo em `src/proxy.ts` (`32e37f1`)
- [x] 01-03: styled-components SSR, tema dos tokens e fontes (`66c6110`)
- [x] 01-04: Redux Toolkit com store por requisição e layouts por locale (`6e02eae`, `8e60d22`)
- [x] 01-05: Docker, compose de dev, CI GitHub Actions, Husky, guardas anti-preço/anti-segredo (`35366c5`, `8c1807f`, `90d0909`)

### Phase 2: Design system
**Goal**: Tema e componentes globais construídos a partir dos tokens, não inventados
**Depends on**: Phase 1
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05, DS-06, DS-07
**Success Criteria** (o que deve ser VERDADE):
  1. Todo componente global existe com todos os seus estados e é visível na showcase interna `/[locale]/design-system` (noindex)
  2. Alvo de toque ≥44px, foco visível e contraste AA em todos os componentes, com axe sem violação crítica
  3. A escala tipográfica e os espaçamentos são fluidos (`clamp`), sem media query — exceto a troca do chrome em 1080px
  4. O display Archivo mantém o eixo `wdth 75` depois do subset do `next/font`
**Plans**: 5 plans — **CONCLUÍDA** (branch `fase-02-design-system`, 2026-08-14)
**UI hint**: yes

Plans:
- [x] 02-01: Tema completo — escala fluida, keyframes do layout, helper de media (`ff62086`)
- [x] 02-02: Primitivos — Typography, Button, Field, Chip, QuantityStepper, ColorSwatches, Container (`81b9b25`)
- [x] 02-03: Chrome — TopBar, Header sticky, MobileMenu, Footer (`f0971ee`)
- [x] 02-04: Feedback e media — Notice, Toast, SectionDivider, Skeleton, EmptyState, ImagePlaceholder (`6689b21`)
- [x] 02-05: ProductCard de 3 variantes, showcase e testes jest-axe (`b15d163`, `2fecf48`, `cb7eb30`)

### Phase 3: Strapi (CMS)
**Goal**: Modelagem completa do conteúdo com i18n, cliente tipado e camada de adaptação verificada e publicada
**Depends on**: Phase 2
**Requirements**: CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06, CMS-07, PRECO-02, DOC-01, DOC-02, DOC-03
**Success Criteria** (o que deve ser VERDADE):
  1. O editor consegue subir o Strapi por Docker, ver os 9 content-types (1 single type + 8 coleções) e os 13 blocos da Dynamic Zone nos 3 idiomas, e publicar por locale
  2. Toda resposta do Strapi é validada por Zod antes de virar props, e um bloco desconhecido degrada para `null` sem quebrar a página
  3. Nenhum rich text chega à tela sem passar pela sanitização com allowlist, e nenhum token do Strapi existe no bundle cliente
  4. Não existe nenhum campo de preço, valor ou pagamento em nenhum schema do CMS — a guarda automatizada varre `cms/src` e confirma
  5. As divergências 5, 6, 7, 9, 11 e 12 estão fechadas contra o código real, e `docs/PLANO.md` deixou de conter informação obsoleta (5 etapas, estado das fases, decisão de deploy)
**Plans**: 6 plans — **VERIFICADA** (branch `fase-03-strapi` publicada em `origin`, 2026-08-17)

Plans:
- [x] 03-01: Modelo Strapi completo — content-types, componentes, Dynamic Zone, i18n, permissões e seed de estrutura (`70630a3`)
- [x] 03-02: Cliente server-only, schemas Zod, adaptadores e sanitização de rich text (`5fe84a4`, `4b28864`)
- [x] 03-03: Webhook de revalidação, Dockerfile do Strapi e serviço `cms` no compose (`0cd7b19`, `bd98e75`, `7e88a4e`)
- [x] 03-04: Provas automatizadas da ponte CMS — teste de contrato do webhook (401/400/200 e mapa modelo→tag), teste de degradação da Dynamic Zone (bloco desconhecido → `null`) e do contrato dos 13 blocos, varredura de segredo-sentinela em `.next/static`, `npm run check` e `npm run build` verdes (`d2dff3f`, `0b4cccd`, `4a0284f`)
- [x] 03-05: Fechamento de pendências documentais — conferir divergências 5, 6, 7 e 9 contra os componentes reais da Fase 2 e 11 e 12 contra o modelo da Fase 3, atualizando `docs/00-divergencias.md` (ou registrando desvio em `docs/divergencias.md`); corrigir `docs/PLANO.md:92` para 5 etapas, atualizar o estado das fases no cabeçalho, remover a nota "Decisão aberta" da Fase 17; sincronizar `docs/00-inventario.md`; criar `docs/adr/003-rota-canonica-produto.md` e `docs/adr/004-deploy-ghcr-caddy.md`
- [x] 03-06: Verificação/UAT da fase — Strapi + Postgres no profile `cms`, API pública e webhook provados por curl, modelo conferido pela API administrativa (9 content-types, 13 blocos, 6 componentes compartilhados), página criada em pt-BR e propagada para en/es, evidência por requisito em `03-UAT.md`, branch publicada (`3d152a0`)

### Phase 4: Home
**Goal**: A Home renderiza todos os seus blocos a partir do CMS, com fidelidade ao layout e sem preço
**Depends on**: Phase 3
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, MED-01
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante abre `/pt-BR`, `/en` e `/es` e vê hero, busca, grade de categorias, produtos em destaque, seção LED, como funciona, diferenciais, avaliações e CTA final, todos vindos do CMS
  2. Editar um bloco no Strapi e publicar muda a Home em segundos, sem novo deploy
  3. Quando não há avaliações reais cadastradas, a seção mostra o estado vazio do design — nunca depoimento inventado
  4. A Home é idêntica ao `Home.dc.html` na comparação lado a lado em desktop e em 375px
  5. `view_item_list` sai pelo módulo `dataLayer` tipado; nenhuma chamada solta a `window.dataLayer.push` passa no lint
**Plans**: 7 plans
**UI hint**: yes

Plans:
- [ ] 04-01-PLAN.md — Porta única de eventos: `dataLayer` tipado, regra de lint e guarda de varredura; emissor client de `view_item_list`; `images.remotePatterns` + `NEXT_PUBLIC_STRAPI_MEDIA_URL`
- [ ] 04-02-PLAN.md — Chrome alimentado pelo CMS em `[locale]/layout.tsx` (fecha divergência item 6), extensões E1–E4 do design system + keyframe `amrMod`, `error.tsx` com `retry`
- [ ] 04-03-PLAN.md — Blocos escuros: Hero (mosaico 12×6 em CSS) e Chamada final
- [ ] 04-04-PLAN.md — Busca grande (composto E5) e grade de categorias (card-bandeira LED + 4) com `view_item_list`
- [ ] 04-05-PLAN.md — Vitrine: `Produto.categoria`, `mapearParaProductCard`, slider `scroll-snap` com `view_item_list`, seção Painéis de LED
- [ ] 04-06-PLAN.md — Prova e processo: como funciona, diferenciais, avaliações (cheio/vazio/carregando) + esqueleto na showcase
- [ ] 04-07-PLAN.md — Renderizador da Dynamic Zone, `page.tsx` da Home com degradação, divergências D3/D4 e conferência de fidelidade desktop + 375px

### Phase 5: Catálogo
**Goal**: O visitante encontra produtos por busca e filtros combinados, com todos os estados cobertos
**Depends on**: Phase 4
**Requirements**: CATA-01, CATA-02, CATA-03, CATA-04, CATA-05, CATA-06
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante busca por texto e filtra por Categoria, Tipo de item, Cor, Tipo de evento e Ambiente, e o resultado respeita AND entre grupos e OR dentro do grupo
  2. No mobile o visitante abre o drawer de filtros, aplica, fecha e vê os chips ativos, removendo cada um individualmente
  3. O visitante consegue operar busca, filtros, drawer e ordenação só pelo teclado, com foco sempre visível
  4. Busca vazia, carregando, sem resultados e erro têm cada um sua tela, com o texto do layout
  5. `search`, `filter_applied` e `view_item_list` são emitidos com os parâmetros corretos e sem nenhum campo de valor
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 05-01: Rota `/[locale]/catalogo`, hero, card "SOBRE OS VALORES", busca com validação e estado `busy`
- [ ] 05-02: Painel de filtros em acordeão (5 grupos, swatches de cor) com a lógica AND/OR e a ordenação de 5 opções
- [ ] 05-03: Drawer mobile de filtros, toolbar com contagem e chips de filtro ativo
- [ ] 05-04: Grade, skeletons, estado vazio, sem resultados e erro; navegação por teclado, axe e eventos

### Phase 6: Categoria
**Goal**: Um único modelo de página serve as 5 categorias, incluindo o comparativo LED e o estado "em preparação"
**Depends on**: Phase 5
**Requirements**: CATG-01, CATG-02, CATG-03, CATG-04, CATG-05
**Success Criteria** (o que deve ser VERDADE):
  1. As 5 categorias reais (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`) abrem no mesmo modelo, com hero, subcategorias numeradas, aplicações e FAQ próprios do CMS
  2. `telas-de-led` — e só ela — mostra o comparativo P1.9 × P3.9 com régua 0–10m e tabela de 7 critérios, que empilha abaixo de 760px
  3. `luz-e-som`, `tendas` e `moveis` mostram o estado "em preparação" em vez de uma grade vazia
  4. A página tem breadcrumb navegável e emite `ItemList`
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 06-01: Rota `/[locale]/categoria/[slug]`, hero por categoria, subcategorias numeradas, aplicações, FAQ e breadcrumb
- [ ] 06-02: Filtros toggle horizontais da categoria e grade com estados "em preparação" e "sem resultado"
- [ ] 06-03: Bloco `comparativo-led` — pixel pitch, cartões P1.9/P3.9, régua, tabela de 7 critérios com empilhamento em 760px e CTA "NÃO SEI QUAL ESCOLHER"

### Phase 7: Produto
**Goal**: A PDP entrega os quatro arquétipos de produto na rota canônica e alimenta o orçamento com item válido
**Depends on**: Phase 6
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07, PROD-08
**Success Criteria** (o que deve ser VERDADE):
  1. Todo produto abre em `/[locale]/[categoria]/[slug]`, e um slug de produto que colida com slug de categoria é detectado no build/CI antes de ir ao ar
  2. Mudar um produto de categoria no CMS faz a URL antiga responder 301 para a nova, sem 404
  3. Produto físico, com-variação, serviço técnico e pacote renderizam com os controles corretos de cada arquétipo
  4. Tentar adicionar ao orçamento sem escolher a variação obrigatória é bloqueado e dispara o shake de erro
  5. `view_item`, `select_item` e `add_to_quote` são emitidos, e nenhuma tela da PDP exibe preço
**Plans**: 5 plans
**UI hint**: yes

Plans:
- [ ] 07-01: Rota canônica `/[locale]/[categoria]/[slug]` com resolução categoria+produto, guarda de colisão de slugs no build e redirect 301 por mudança de categoria
- [ ] 07-02: Bloco principal — galeria com zoom-hover e coluna de configuração, com os 4 arquétipos
- [ ] 07-03: Descrição, ficha técnica com medidas, aside "PRECISA DE AJUDA" e FAQ do produto
- [ ] 07-04: Configurador LED, stepper de quantidade e bloqueio de variação obrigatória com shake
- [ ] 07-05: "Frequentemente alugado com", relacionados, breadcrumb e eventos `view_item`/`select_item`/`add_to_quote`

### Phase 8: Carrinho de orçamento
**Goal**: A lista de itens do visitante sobrevive ao recarregamento e comunica claramente que não é reserva
**Depends on**: Phase 7
**Requirements**: ORC-01, ORC-02, ORC-03, ORC-04, ORC-05, ORC-06
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante adiciona itens, fecha o navegador, volta e encontra o orçamento intacto — inclusive depois de uma mudança de versão do formato salvo
  2. Em `/[locale]/meu-orcamento` o visitante altera quantidade, remove e limpa itens, e o estado vazio mostra "COMO FUNCIONA" em 3 passos
  3. O aside mostra "O QUE A EQUIPE VAI RECEBER" com o percentual de prontidão coerente com o que foi preenchido
  4. O aviso "não representa compra ou reserva" aparece, vindo de `settings-globais`, e nenhuma tela mostra preço ou total
  5. Remover um item mostra o toast com DESFAZER, posicionado corretamente onde existe barra fixa
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 08-01: Slice Redux do orçamento com persistência em localStorage versionada e migração testada
- [ ] 08-02: Rota `/[locale]/meu-orcamento` — estado vazio, lista editável, barra fixa mobile e breadcrumb
- [ ] 08-03: Aside de prontidão, avisos legais de `settings-globais`, toast com DESFAZER e eventos `add_to_quote`/`remove_from_quote`/`view_quote`

### Phase 9: Formulário de solicitação
**Goal**: O visitante envia uma solicitação completa em 5 etapas, com rascunho seguro e anexos validados
**Depends on**: Phase 8
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, PRECO-06
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante percorre as 5 etapas ("ETAPA n DE 5") e só avança quando os campos obrigatórios da etapa passam na validação, com resumo de erro e destaque por campo
  2. Fechar e reabrir o navegador restaura o rascunho no mesmo passo em que o visitante parou
  3. Anexar um arquivo fora da allowlist ou acima de 25 MB é recusado com mensagem clara, e o envio fica bloqueado enquanto algum anexo não terminou
  4. Enviar gera um protocolo `AMR-XXXX`, grava os consentimentos com timestamp e IP, dispara e-mail interno e automático, e o rascunho é limpo
  5. A única cifra em tela é "Faixa de investimento" (US$), acompanhada da ressalva de que nenhum valor é exibido no site, e a allowlist do teste anti-preço cobre exclusivamente esse campo
**Plans**: 5 plans
**UI hint**: yes

Plans:
- [ ] 09-01: Rota `/[locale]/solicitar-orcamento` com layout próprio (sem topbar, header enxuto, rodapé compacto), stepper de 5 etapas e barra VOLTAR/CONTINUAR/ENVIAR
- [ ] 09-02: Etapas 1–3 (Contato, Evento, Local/logística) com schemas Zod por etapa e resumo de erro
- [ ] 09-03: Etapa 4 — lista editável de itens vinda do orçamento e upload drag-and-drop com magic number, limite de 25 MB, nome sanitizado, armazenamento fora da raiz pública e progresso
- [ ] 09-04: Etapa 5 — contexto, "Faixa de investimento" com ressalva, 3 consentimentos; rascunho persistente com debounce de 700ms, versionamento e migração
- [ ] 09-05: Route Handler de envio — validação no servidor, protocolo `AMR-XXXX`, gravação no Strapi, e-mails, honeypot, verificação de origem, rate limiting e eventos do fluxo

### Phase 10: Confirmação
**Goal**: Depois de enviar, o visitante entende que a solicitação chegou, o que foi enviado e o que acontece a seguir
**Depends on**: Phase 9
**Requirements**: CONF-01, CONF-02, CONF-03
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante chega em `/[locale]/solicitacao-recebida` e vê o badge "EM ANÁLISE" pulsante com o protocolo do seu envio
  2. O cartão "O QUE CHEGOU ATÉ NÓS" resume os itens realmente enviados, sem nenhum valor
  3. "Próximas etapas" mostra os 4 cards com o primeiro marcado "AGORA", e a página não é indexada
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 10-01: Rota de confirmação — hero com badge pulsante, protocolo, aviso de não-reserva e cartão resumo
- [ ] 10-02: Bloco "Próximas etapas" (Análise → Disponibilidade → Logística → Proposta), CTAs finais, `noindex` e limpeza do rascunho

### Phase 11: Institucionais
**Goal**: As páginas de confiança e de contato rápido existem e convertem o visitante que não quer o formulário longo
**Depends on**: Phase 10
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05
**Success Criteria** (o que deve ser VERDADE):
  1. O visitante lê a Sobre com os dois cartões e os 4 passos de "Da seleção à confirmação"
  2. O visitante navega as 10 perguntas do FAQ por teclado, com accordion exclusivo, e vê o destaque da PERGUNTA 01 com os 7 fatores de cálculo
  3. O visitante envia o formulário de contato de 8 campos e a tela de sucesso substitui o formulário
  4. As páginas legais existem e são as mesmas referenciadas pelos consentimentos do formulário de solicitação
  5. `contact_form_submitted`, `phone_click` e `email_click` são emitidos
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 11-01: `/[locale]/sobre` — hero com imagem, cartões de experiência e estrutura, 4 passos e CTA
- [ ] 11-02: `/[locale]/faq` — destaque da PERGUNTA 01 com os 7 fatores e accordion exclusivo acessível para 02–10
- [ ] 11-03: `/[locale]/contato` — cartões de telefone/e-mail, "Escolha o caminho certo", formulário de 8 campos e aside
- [ ] 11-04: Route Handler de contato com honeypot e rate limit, estado de sucesso, páginas legais e eventos

### Phase 12: SEO e dados estruturados
**Goal**: O site é indexável e corretamente interpretado nos três idiomas, sem nenhum preço nos dados estruturados
**Depends on**: Phase 11
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, PRECO-03
**Success Criteria** (o que deve ser VERDADE):
  1. Cada rota tem título, descrição, canônica e OG/Twitter vindos do componente `seo` do CMS, com fallback quando o campo está vazio
  2. As três versões de idioma se referenciam por `hreflang` e existe `x-default`; a canônica de produto usa `/[locale]/[categoria]/[slug]`
  3. `sitemap.xml` por locale e `robots.txt` são servidos, e rascunhos do CMS saem `noindex`
  4. Rich Results Test e Schema Markup Validator passam em Organization+LocalBusiness, BreadcrumbList, FAQPage, ItemList e Product
  5. O JSON-LD de `Product` não contém `offers`, `price`, `priceCurrency` nem `availability` — verificado por teste automatizado
**Plans**: 4 plans

Plans:
- [ ] 12-01: Metadata API por rota alimentada pelo componente `seo` com fallback e imagem OG padrão de `settings-globais`
- [ ] 12-02: `hreflang` + `x-default` e canônica por locale, incluindo a rota canônica de produto e o 301 da Fase 7
- [ ] 12-03: `sitemap.xml` por locale, `robots.txt` e `noindex` de rascunhos e da confirmação
- [ ] 12-04: JSON-LD — Organization+LocalBusiness, BreadcrumbList, FAQPage, ItemList e Product sem `offers`, com teste que falha se `offers` aparecer

### Phase 13: Medição
**Goal**: O funil é medido de ponta a ponta sem carregar nenhum dado de valor e respeitando o consentimento
**Depends on**: Phase 12
**Requirements**: MED-02, MED-03, MED-04, PRECO-04
**Success Criteria** (o que deve ser VERDADE):
  1. GTM carrega com GA4 e Pixel configurados, usando os IDs de `settings-globais`
  2. Na primeira visita o estado de consentimento é negado por padrão e nenhum aceite vem pré-marcado; o Pixel só dispara depois do aceite
  3. Percorrer o funil completo produz a sequência de eventos esperada, conferida contra um snapshot versionado
  4. Nenhum evento carrega `value`, `currency`, `price` ou `revenue` — verificado por teste sobre o snapshot
**Plans**: 3 plans

Plans:
- [ ] 13-01: GTM com GA4 e Pixel via GTM, IDs vindos do CMS, tudo através da porta tipada da Fase 4
- [ ] 13-02: Consent Mode v2 com estado padrão negado e banner de consentimento sem aceite pré-marcado
- [ ] 13-03: Snapshot da sequência de eventos do funil completo e teste que barra campos de valor

### Phase 14: Performance e Core Web Vitals
**Goal**: O site atinge as metas de campo em mobile e o custo do styled-components fica sob controle medido
**Depends on**: Phase 13
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04
**Success Criteria** (o que deve ser VERDADE):
  1. Em mobile p75 o site entrega LCP < 2,5s, INP < 200ms, CLS < 0,1 e TTFB < 800ms
  2. O Lighthouse CI está verde e o orçamento de JS por rota é verificado a cada PR
  3. Não existe fetch de conteúdo no cliente: as páginas são Server Components e a atualização vem por ISR/webhook
  4. O gatilho de reversão do `DEC-styled-components` foi avaliado com dado real e o resultado está registrado no ADR 001
**Plans**: 3 plans

Plans:
- [ ] 14-01: Auditoria de campo e laboratório por rota, com diagnóstico de LCP, INP, CLS e TTFB
- [ ] 14-02: Correções — fronteiras `use client`, `next/image` com dimensões, ISR/revalidação, remoção de fetch no cliente
- [ ] 14-03: Lighthouse CI verde, orçamento de JS por rota no pipeline e avaliação registrada do gatilho de reversão

### Phase 15: Segurança
**Goal**: O site roda com CSP restritiva, headers completos e nenhuma superfície de upload ou segredo exposta
**Depends on**: Phase 14
**Requirements**: SEG-02, SEG-03, SEG-04, SEG-05
**Success Criteria** (o que deve ser VERDADE):
  1. A CSP usa nonce e não tem `unsafe-inline` global; styled-components e GTM continuam funcionando sob ela
  2. HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e `frame-ancestors` são servidos em todas as respostas
  3. Um arquivo com extensão permitida mas conteúdo diferente é recusado pelo magic number, e os Route Handlers limitam taxa de requisição
  4. Nenhum segredo existe em `NEXT_PUBLIC_`, o `npm audit` está limpo e o Dependabot está ativo
**Plans**: 3 plans

Plans:
- [ ] 15-01: CSP com nonce end-to-end (styled-components + GTM) e demais headers de segurança
- [ ] 15-02: Rate limiting e hardening de upload revisados, com testes de magic number e de nome sanitizado
- [ ] 15-03: Revisão de segredos, `npm audit`, Dependabot e reexecução das guardas anti-preço e anti-segredo

### Phase 16: QA final
**Goal**: O fluxo inteiro é provado automaticamente nos três idiomas, em mobile e desktop, e o projeto fica documentado para handoff
**Depends on**: Phase 15
**Requirements**: QA-01, QA-02, QA-03, QA-04, QA-05, PRECO-05
**Success Criteria** (o que deve ser VERDADE):
  1. A suíte e2e percorre catálogo → filtro → produto → adicionar → carrinho → formulário de 5 etapas → envio → confirmação nos 3 locales × mobile/desktop e fica verde
  2. Os casos de borda estão cobertos: variação obrigatória, persistência de carrinho e rascunho, estados vazio/carregando/sem resultados/erro, navegação por teclado, troca de locale preservando a rota e 375px sem scroll horizontal
  3. A verificação "nenhuma tela exibe preço" passa em todas as rotas dos 3 locales, com a única exceção allowlisted da etapa 5
  4. axe não acusa violação crítica em nenhuma rota pública e a cobertura de lógica de negócio é ≥80%
  5. `docs/HANDOFF.md` existe e a revisão de conteúdo dos três idiomas está concluída
**Plans**: 4 plans

Plans:
- [ ] 16-01: e2e do fluxo principal nos 3 locales × mobile/desktop
- [ ] 16-02: e2e dos casos de borda — variação obrigatória, persistências, estados, teclado, troca de locale, 375px
- [ ] 16-03: Varredura anti-preço em todas as rotas, snapshot do dataLayer e axe em todas as rotas públicas
- [ ] 16-04: Fechamento de cobertura ≥80%, revisão de conteúdo trilíngue e `docs/HANDOFF.md`

### Phase 17: Deploy — GHCR + Caddy na VPS Hostinger
**Goal**: Publicar e atualizar o site na VPS Hostinger a partir do GitHub, de forma reproduzível e com rollback
**Depends on**: Phase 16
**Requirements**: DEP-01, DEP-02, DEP-03, DEP-04, DEP-05, DEP-06, DEP-07
**Success Criteria** (o que deve ser VERDADE):
  1. Um `git push` na branch de release builda as imagens no GitHub Actions, publica em **GHCR** e atualiza a VPS por SSH sem downtime perceptível
  2. O domínio responde por HTTPS com certificado válido emitido automaticamente pelo **Caddy**, que também serve HSTS e os demais headers de segurança
  3. Reiniciar os containers preserva o banco do Strapi e os uploads, e existe backup restaurável comprovado
  4. Nenhum segredo está no repositório — só em GitHub Secrets e no `.env` da VPS
  5. `docs/DEPLOY.md` permite a outra pessoa publicar e reverter uma versão sem ajuda
**Plans**: 5 plans

Plans:
- [ ] 17-01: `Dockerfile` de produção do Next (standalone, enxuto) e imagem de produção do Strapi
- [ ] 17-02: `docker-compose.prod.yml` — app + Strapi + Postgres + Caddy, volumes persistentes e Caddyfile com TLS automático e headers
- [ ] 17-03: GitHub Actions — build multi-imagem, push para GHCR e deploy sync por SSH (`docker compose pull && up -d`)
- [ ] 17-04: Provisionamento da VPS — dimensionamento de RAM, secrets, DNS do domínio, migração/seed do Strapi em produção e rotina de backup
- [ ] 17-05: `docs/DEPLOY.md` com publicação, rollback e localização dos secrets; ensaio de rollback comprovado

## Progress

**Ordem de execução:** as fases executam em ordem numérica: 0 → 1 → 2 → 3 → 4 → … → 17

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Inventário e plano | 3/3 | Complete | 2026-08-14 |
| 1. Fundação | 5/5 | Complete | 2026-08-14 |
| 2. Design system | 5/5 | Complete | 2026-08-14 |
| 3. Strapi (CMS) | 6/6 | Complete | 2026-08-17 |
| 4. Home | 0/4 | Not started | - |
| 5. Catálogo | 0/4 | Not started | - |
| 6. Categoria | 0/3 | Not started | - |
| 7. Produto | 0/5 | Not started | - |
| 8. Carrinho de orçamento | 0/3 | Not started | - |
| 9. Formulário de solicitação | 0/5 | Not started | - |
| 10. Confirmação | 0/2 | Not started | - |
| 11. Institucionais | 0/4 | Not started | - |
| 12. SEO e dados estruturados | 0/4 | Not started | - |
| 13. Medição | 0/3 | Not started | - |
| 14. Performance e Core Web Vitals | 0/3 | Not started | - |
| 15. Segurança | 0/3 | Not started | - |
| 16. QA final | 0/4 | Not started | - |
| 17. Deploy — GHCR + Caddy | 0/5 | Not started | - |

**Total:** 19 de 70 planos concluídos (27%) · 4 de 18 fases concluídas

---
*Roadmap criado em 2026-08-17 a partir de `.planning/intel/` e de `docs/PLANO.md`.*
