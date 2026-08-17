# Contexto (notas dos DOCs)

Fonte: documentos classificados como `DOC`, mais notas de contexto não-normativas extraídas dos demais.
Nada aqui tem força de decisão — decisões vivem em `decisions.md`, contratos em `constraints.md`.

---

## Tópico: Fluxo editorial no Strapi
- source: `docs/cms-fluxo-editorial.md`

Guia destinado a quem edita conteúdo. Versão instalada: **Strapi 5.52**. O site tem três idiomas: **pt-BR (padrão)**, **en**, **es**.

Princípios editoriais:
- **pt-BR é a fonte.** Criar/editar primeiro em português e depois propagar para en/es.
- **Sem preço.** Nenhum campo de valor/preço existe no modelo — é intencional. "Não peça para adicionar."
- **Sem conteúdo fictício.** Não cadastrar depoimentos, avaliações, números ou produtos de exemplo. Onde faltar conteúdo real, deixar vazio — o site mostra o placeholder técnico.

Ponto de confusão sinalizado no próprio documento: no Strapi **cada locale tem sua própria versão da entrada, inclusive a Dynamic Zone** das páginas. O editor preenche os blocos três vezes (uma por idioma).

Fluxo recomendado para páginas com blocos:
1. Criar a página em pt-BR, montar os blocos e salvar.
2. Trocar para `en` no seletor de idioma (topo direito da edição).
3. Usar "Preencher a partir de outro locale" / "Fill in from another locale" para copiar a estrutura de pt-BR e então traduzir os textos. Repetir para `es`.
4. **Publicar cada idioma separadamente** — o status de publicação é por locale.

Risco de esforço editorial registrado: se em algum content-type a cópia entre locales não aparecer, os campos são copiados manualmente e páginas com muitos blocos levam **~3× o tempo** de uma página monolíngue. Deve entrar no cronograma como risco.

Onde editar cada coisa:
- **Configurações Globais** (single type): telefone, e-mail, tagline, IDs de GTM/Pixel, imagem OG padrão.
- **Menu Item / Rodapé Coluna**: montam cabeçalho e rodapé. Ordenação e inclusão pelo painel, sem deploy.
- **Categorias**: as 5 (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`).
- **Produtos**: catálogo. Cada produto tem SEO próprio, imagens com **alt obrigatório**, tipo de item (físico / com-variação / serviço-técnico / pacote), variações, medidas, FAQ.
- **Páginas**: conteúdo por blocos (Dynamic Zone) + SEO.
- **FAQ Item**: perguntas e respostas, opcionalmente ligadas a uma categoria.
- **Avaliações**: só reais e verificadas. Campo `publicada` controla a exibição.
- **Solicitações**: recebe os formulários do site. **Não criar manualmente** — chega pelo envio do usuário.

Publicação e atualização: ao publicar uma entrada, um **webhook** avisa o Next para revalidar só aquele tipo de conteúdo — a mudança aparece em segundos, sem novo deploy. Rascunhos não aparecem no site público e ficam `noindex`.

Imagens: todo upload exige **texto alternativo (alt)**, obrigatório por acessibilidade. Formatos aceitos seguem a política de segurança do upload (imagens, PDF); executáveis são bloqueados.

---

## Tópico: Fonte da verdade visual
- source: `docs/PLANO.md`, `docs/00-inventario.md`, `docs/tokens/tokens.md`

A fonte da verdade visual é `/projeto-base/*.dc.html` (exports do Claude Design). Os tokens em `docs/tokens/tokens.json` foram extraídos do código com contagem de uso por grep, não inferidos.

Motor dos exports: custom element `<x-dc>`, lógica em `class Component extends DCLogic` (React), diretivas `sc-if`/`sc-for`, bindings `{{ mustache }}` via `renderVals()`, apoiado por `support.js`. Isso importa porque a responsividade e a troca de chrome vivem em JS, não em CSS.

---

## Tópico: Mapa de blocos por página
- source: `docs/00-inventario.md` (§4)

- **Home:** hero ("O palco é seu. Nós levamos a estrutura.") → busca grande → grade de categorias (card-bandeira LED + 4) → produtos em destaque (slider, 5 itens) → seção Painéis de LED (P1.9/P3.9 + listas "O QUE INSTALAMOS"/"O QUE EXIBIMOS" + galeria 3 imagens) → como funciona (4 etapas) → diferenciais (5 blocos) → avaliações (4 depoimentos + estados vazio/carregando) → CTA final → rodapé → toast.
- **Catálogo:** hero + card "SOBRE OS VALORES" + busca → layout 2 colunas (aside filtros + main) → toolbar (Filtros mobile, contagem, Ordenar por) → chips ativos → grade (11 produtos) / skeletons / estado vazio ("Amplie a busca ou fale com a equipe") → rodapé → barra fixa → drawer de filtros mobile → toast.
- **Categoria:** barra "MODELO APLICADO A" (trocador) → hero por categoria → subcategorias numeradas → comparativo P1.9×P3.9 (só LED) → produtos da categoria / "em preparação" / sem resultado → aplicações → FAQ da categoria → CTA → rodapé → barra fixa → toast.
- **Produto:** barra "MODELO APLICADO A" → breadcrumb → bloco principal 2 colunas (galeria com zoom-hover + coluna de configuração/variação) → descrição + aside (ficha técnica + "PRECISA DE AJUDA") → "Frequentemente alugado com" → relacionados → FAQ do produto → CTA final → rodapé → barra fixa → toast.
- **Meu Orçamento:** breadcrumb → cabeçalho + aviso ("não representa compra ou reserva") → estado vazio (com "COMO FUNCIONA" em 3 passos) / estado com itens (lista editável + aside "O QUE A EQUIPE VAI RECEBER" com % de prontidão + PRÓXIMOS PASSOS) → barra mobile fixa → toast com DESFAZER.
- **Solicitar Orçamento:** hero → layout 2 colunas (aside stepper "ETAPA n DE 5" + card RASCUNHO) → resumo de erro condicional → 5 etapas → barra de navegação (VOLTAR / CONTINUAR / ENVIAR) → tela de sucesso com protocolo `AMR-XXXX`. **Sem topbar**; header enxuto; rodapé compacto.
- **Solicitação Recebida:** hero de confirmação (badge "EM ANÁLISE" pulsante + protocolo + H1 "Sua solicitação foi recebida" + aviso "não reservados" + cartão resumo "O QUE CHEGOU ATÉ NÓS") → "Próximas etapas" (4 cards: Análise → Disponibilidade → Logística → Proposta, o 1º ativo com "AGORA") → CTAs → rodapé.
- **Contato:** hero (H1 "Entre em contato" + cartões TELEFONE/E-MAIL) → "Escolha o caminho certo" (Dúvida rápida × Solicitação completa) → corpo 2 colunas (formulário + aside ATENDIMENTO / ANTES DE ESCREVER) → estado de sucesso que substitui o form → rodapé.
- **Sobre:** hero com imagem (H1 "Mais do que equipamentos. Experiência em eventos." + 3 parágrafos) → 2 cartões (NOSSA EXPERIÊNCIA / NOSSA ESTRUTURA com imagem 16:9) → "Da seleção à confirmação" (4 passos) → CTA → rodapé.
- **FAQ:** hero → destaque "PERGUNTA 01" ("Os preços aparecem no site? **NÃO.**" + "O QUE ENTRA NO CÁLCULO" com 7 fatores) → "Outras perguntas" (accordion 02–10) → rodapé. **10 Q&A no total.**

---

## Tópico: Componentes compartilhados e onde divergem
- source: `docs/00-inventario.md` (§3)

- **Topbar** (tagline + tel/e-mail + `EN|PT|ES`): idêntica em todas, **ausente** em Solicitar.
- **Header sticky** (logo + nav 8 itens + badge ORÇAMENTO + CTA): estrutura igual; item ativo muda por página; nav estática na maioria e **dinâmica na Categoria**; badge **não-clicável** em Meu Orçamento; header reduzido (sem nav) em Solicitar.
- **Menu mobile (drawer)**: mesma estrutura; item ativo/links divergem como o header.
- **Rodapé** (5 colunas: Marca, PRODUTOS, EMPRESA, INFORMAÇÕES, CONTATO + 2 disclaimers): "byte-a-byte" nas institucionais; só o `href` de produto varia.
- **Card de produto** (foto 4:3 com spec no hover, categoria mono, nome, descrição, qtd −/+, 2 botões): anatomia comum, controle de cor divergente entre Home / Catálogo / Categoria.
- **Barra fixa de orçamento** (contador + título/sub + VER ORÇAMENTO/SOLICITAR): Catálogo, Categoria, Produto; mobile em Meu Orçamento. Ausente na Home e institucionais.
- **Chip de filtro ativo** (rótulo mono + valor + ×): Catálogo e Categoria, mesmo visual.
- **Painel de filtros**: mecânica divergente por decisão aprovada (dois componentes).
- **Toast** (`role=status`, `amrToast`, preto com borda teal): posição muda; variantes adicionar / DESFAZER / fechar.
- **Breadcrumb**: Catálogo, Categoria, Produto, Meu Orçamento, Contato, FAQ — níveis variam.
- **Accordion FAQ** (`+`/`–`, exclusivo, `faqAberta=-1`): FAQ, Categoria, Produto.
- **Stepper de 5 etapas**: exclusivo de Solicitar.
- **Skeletons**: Home (avaliações), Catálogo (produtos), via `amrPulse`.

---

## Tópico: Estado real do código no momento da ingestão
- source: prompt do orquestrador `/gsd-ingest-docs` (2026-08-17), reconciliado com `docs/PLANO.md`

Este tópico **contradiz o estado declarado nos documentos** e prevalece sobre ele (ver `INGEST-CONFLICTS.md`, INFO):

- Fases **00, 01 e 02 concluídas**: fundação Next 16 App Router + TS strict + i18n pt-BR/en/es + Redux Toolkit + Zod + styled-components; design system completo com primitivos, chrome, feedback e `ProductCard`.
- Fase **03 (Strapi CMS) implementada, mas ainda não verificada/aprovada**: modelo completo, cliente server-only com Zod, adaptadores, sanitização de rich text, webhook de revalidação.
- Fases **04 a 17 não começaram**.
- Infra: Docker + GitHub + deploy futuro em VPS Hostinger (requisito do cliente, virou a Fase 17 do plano).
- Divergências já aprovadas pelo cliente: formulário com **5 etapas** (não 9); a única cifra em tela é **"Faixa de investimento" em US$** (budget do cliente, não preço de produto).

Já no documento, `docs/PLANO.md` abre com "Estado: Fase 00 em andamento. Nenhuma fase de aplicação começa antes da aprovação deste plano", e `docs/00-inventario.md` §10 ainda tem desmarcados os itens "Aprovação das 2 decisões abertas" e "Aprovação do `docs/PLANO.md`". Ambos são registros obsoletos.

---

## Tópico: Riscos registrados nos documentos
- source: `docs/PLANO.md` (Fases 00, 01, 17), `docs/cms-fluxo-editorial.md`

- Responsividade sem `@media` (fluida via `clamp` + `support.js`) → pontos de troca precisam ser reconstituídos. *(Endereçado por `DEC-chrome-media-query`.)*
- styled-components CSS-em-runtime vs. Core Web Vitals. *(Gatilho de reversão definido no `DEC-styled-components`.)*
- CSP com nonce + styled-components + GTM.
- Recursos da VPS Hostinger (RAM para Next + Strapi + Postgres) — dimensionar.
- Escolha do reverse proxy e estratégia de migração/seed do Strapi em produção.
- Esforço editorial ~3× em páginas com muitos blocos se a cópia entre locales não estiver disponível.
