# Restrições (extraídas dos SPECs)

Fonte: documentos classificados como `SPEC` — `docs/PLANO.md`, `docs/00-inventario.md`, `docs/tokens/tokens.md`.
Onde um SPEC contradiz um ADR, o valor abaixo já reflete o ADR vencedor (ver `INGEST-CONFLICTS.md`).

---

## CON-anti-preco — Proibição global de preço e pagamento
- source: `docs/PLANO.md` (cabeçalho)
- tipo: nfr / política de produto
- Proibido em **UI, modelo de dados, dataLayer, schema.org e nomes de variáveis**: preço, pagamento, checkout, carrinho de compras.
- Vocabulário obrigatório: "orçamento" / "solicitação".
- Enforcement: teste de build que falha se palavra de preço/compra aparecer (Fase 01); verificação e2e "nenhuma tela exibe preço" (Fase 16); JSON-LD `Product` sem `offers` (Fase 12); eventos sem `value`/`currency`/`price`/`revenue` (Fase 13).
- Allowlist única: `US$` / faixa no campo "Faixa de investimento" da etapa 5 (`DEC-00-15`).

## CON-stack — Stack fechada
- source: `docs/PLANO.md` (§Stack, §Regras de execução)
- tipo: nfr
- Next.js (App Router) · TypeScript strict · i18n pt-BR (padrão) / en / es · Redux Toolkit · Zod · Radix UI · styled-components · Strapi CMS · Jest + Testing Library · Playwright.
- **Nada de biblioteca fora da stack sem aprovação** (justificar problema + custo de bundle).
- Infra (requisito do cliente): Docker · versionamento GitHub · deploy sync para VPS Hostinger.

## CON-processo — Regras de execução por fase
- source: `docs/PLANO.md` (§Regras de execução)
- tipo: protocolo
- **Uma fase por vez.** Ao terminar: mostrar o entregue, testes passando, pendências e decisões tomadas por conta própria. Esperar aprovação.
- **Definição de pronto:** typecheck limpo · lint limpo · testes verdes · build passando · axe sem violação crítica · tela conferida contra o HTML de `/projeto-base` em desktop e 375px.
- Fidelidade por **comparação lado a lado**, não por impressão.
- Divergência técnica necessária → registrar em `docs/divergencias.md` **ANTES** de implementar.
- Não copiar estilo inline do HTML — traduzir para tema/tokens.
- **Sem conteúdo fictício** em nenhum ambiente (depoimento, avaliação, número, selo). Faltou conteúdo real → placeholder do design com legenda técnica.
- Commits pequenos, em português, um assunto por commit. **Uma branch por fase.**

## CON-rotas — Contrato de rotas
- source: `docs/00-inventario.md` (§1)
- tipo: api-contract
```
/[locale]                          Home
/[locale]/catalogo                 Catálogo
/[locale]/categoria/[slug]         Categoria (modelo para as 5)
/[locale]/produto/[slug]           Produto        (alternativa registrada: /[categoria]/[slug] — INDEFINIDO)
/[locale]/meu-orcamento            Carrinho de orçamento
/[locale]/solicitar-orcamento      Formulário
/[locale]/solicitacao-recebida     Confirmação
/[locale]/contato                  Contato
/[locale]/sobre                    Sobre
/[locale]/faq                      FAQ
```
- Slugs de categoria reais, nesta ordem: `estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`.
- Prontas: `estruturas`, `telas-de-led`. Em preparação: `luz-e-som`, `tendas`, `moveis` (exigem estado "em preparação").
- ⚠️ A rota canônica de produto permanece indefinida — ver `INGEST-CONFLICTS.md` (WARNING).

## CON-tokens — Design tokens
- source: `docs/tokens/tokens.md`, artefato legível por máquina em `docs/tokens/tokens.json`
- tipo: schema
- Valores extraídos do código com contagem de uso, **não inferidos**. O tema styled-components deve honrá-los sem reinvenção.
- Cor (principais): fundo `cinza.100 #F1F2F2` (501) · `tinta.900 #0B0C0D` (448) · `tinta.700 #3A3E40` (175, borda dominante sobre escuro) · `cinza.300 #C9CBCC` (261, borda clara principal) · `teal.brilhante #2FB6B9` (657, acento) · `teal.link #1A7F82` (126) · `teal.escuro #166D70` (98, hover/pressed) · `erro.base #8C2A2A` (71) · `erro.escuro #5A2020` · `acento.areia #D8C9A8` · `acento.navy #1F2A44`.
- Alpha: `rgba(11,12,13,0.35)` sombra padrão · `rgba(11,12,13,0.90)` scrim forte · `rgba(255,255,255,0.35)` · `rgba(11,12,13,0.25)`.
- Tipografia: `Archivo` display (700/800, `font-variation-settings:'wdth' 75`, 174 usos) · `Public Sans` corpo (400/500/600) · `IBM Plex Mono` (400/500, rótulos/códigos/protocolos).
  **O subset `latin` precisa preservar o eixo `wdth`**, senão o display quebra.
- Escala fluida: `clamp(16px,1.2vw,17px)` até `clamp(56px,8vw,144px)` e `clamp(64px,9vw,144px)` (display hero).
- Letter-spacing: `0.06em` (168, rótulos caixa-alta) · `0.04em` (35) · `-0.01em` (72, display grande). `text-transform: uppercase` (66).
- Espaçamento: unidade base ~2px, ritmo em múltiplos de 4. Escala `1·2·4·6·8·10·12·14·16·18·20·24·28·32·40`. Container principal **1280px** (86 usos).
- Raio: **2px** domina (276 usos) — visual anguloso/industrial. Sombra: **sistema de sombra dura sem blur** — `6px 6px 0 rgba(11,12,13,0.35)`, `0 6px 0 …`, `0 -4px 0 …`.
- Movimento: keyframes `amrFade`, `amrToast`, `amrErro`, `amrSpin`, `amrPulso`, `amrDrawer`, `amrMod`, `amrProg`. Durações 0.12–0.7s para UI, 1.3–1.6s para loops. Easings `ease-out` (padrão), `linear` (loops), `cubic-bezier(.2,.7,.2,1)`.
- `prefers-reduced-motion` **não existe no HTML-fonte** e é requisito de acessibilidade — adicionar na Fase 02.
- Alvo do tema: `theme.cor.*`, `theme.fonte.{display,corpo,mono}`, `theme.tamanho.*`, `theme.espaco[n]`, `theme.raio`, `theme.borda.*`, `theme.sombra.*`, `theme.z`, `theme.motion.*`.

## CON-responsividade — Responsividade fluida, sem media query fixa
- source: `docs/tokens/tokens.md` (§Achado estrutural), `docs/PLANO.md` (Fase 02, aceite)
- tipo: nfr
- **Não existe nenhuma `@media` query no CSS-fonte.** A responsividade é fluida/intrínseca: `clamp(min, vw, max)` para tipografia e espaçamento de seção; CSS Grid `repeat(auto-fit, minmax(...))` e grids fracionários `minmax(0, Nfr)`; `flex-wrap` para reflow.
- A troca de layout de header/menu é dirigida por variáveis do `support.js` (`topbarDisplay`, `deskDisplay`, `mobDisplay`, `menuDisplay`, `tituloDeskDisplay`).
- **Exceção aprovada:** `DEC-chrome-media-query` autoriza uma media query CSS em **1080px** exclusivamente para a visibilidade desktop/mobile do chrome (`theme.breakpoint.header`). Escala fluida e grids `auto-fit` permanecem sem media query.
- Ponto de troca secundário observado: tabela comparativa LED empilha abaixo de **760px**.

## CON-formulario — Contrato do formulário Solicitar Orçamento
- source: `docs/00-inventario.md` (§5.1), `docs/PLANO.md` (Fase 09)
- tipo: schema / api-contract
- **5 etapas** (`ETAPAS = 1..5`), barra "ETAPA X DE 5".
- Etapa 1 — Dados de contato (8 campos): Nome\* · Sobrenome\* · Empresa · E-mail\* (regex) · Telefone\* (≥10 díg.) · Idioma de atendimento (PT/EN/ES) · Forma preferida de contato (E-mail/Telefone/WhatsApp/SMS) · Tipo de cliente\* (9 opções).
- Etapa 2 — Dados do evento (8 campos): Tipo de evento\* (10 opções) · Data do evento\* (não pode ser passado) · Nº de convidados · checkbox "montagem no mesmo dia" (default on) · Data da montagem (condicional) · 4× horário (Montagem/Início/Término/Desmontagem, opcionais).
- Etapa 3 — Local e logística (15 campos): Nome do local · Contato do local · Endereço · Cidade\* · Estado (FL/GA/AL/SC/outro) · CEP · Interno/Externo/ambos · Tipo de superfície · Acesso (4 checkboxes) · Info de acesso · Energia · Gerador · Plano de chuva · Tempo de montagem · Desmontagem · Restrições · Instruções.
- Etapa 4 — Produtos e arquivos (2): lista editável de itens (qty/observação/remover, ou "sem itens") · Upload drag-and-drop `PDF · JPG · JPEG · PNG`, até **25 MB cada**, `multiple`, barra de progresso, erro por formato.
- Etapa 5 — Finalizar (5): textarea de contexto · **Faixa de investimento (US$)**, opcional, com ressalva · consentimento c1 obrigatório (não reserva) · c2 obrigatório (Política de Privacidade) · c3 opcional (SMS).
- Validação por etapa (`validar`): 1 → nome/sobrenome/email/telefone/cliente · 2 → evento/data · 3 → cidade · 5 → c1+c2.
- Persistência: localStorage `amr-solicitacao-rascunho-v1`, debounce 700ms, restaura a etapa, versionado + migração.
- Protocolo: `AMR-` + aleatório 1000–9999.
- Envio: bloqueia se anexo `pct<100`; spinner `ENVIANDO`; sucesso limpa o rascunho. Sempre via Route Handler — **nunca cliente→Strapi direto**.
- Hardening: allowlist por **magic number**, nome sanitizado, armazenamento fora da raiz pública, honeypot, verificação de origem, rate limiting, consentimentos com timestamp/IP.

## CON-formulario-contato — Contrato do formulário de Contato
- source: `docs/00-inventario.md` (§5.2)
- tipo: schema
- 8 campos: Nome\* · E-mail\* (regex, 2 mensagens) · Telefone · Empresa · Cidade · Data do evento · Assunto\* (select 6 opções) · Mensagem\* (textarea).
- Botão ENVIAR→ENVIANDO · alerta-resumo de erro · estado de sucesso substitui o formulário.

## CON-busca-filtros — Busca e filtros
- source: `docs/00-inventario.md` (§5.3, §5.4)
- tipo: api-contract
- Busca: `input type=search`, `novalidate`, validação JS (vazio → erro inline), botão desabilita em `busy`.
- Catálogo: filtros Categoria · Tipo de item · Cor (swatch Bege `#D8C9A8` / Preto `#0B0C0D` / Branco `#FFFFFF`) · Tipo de evento · Ambiente. Ordenar por (5 opções). **AND entre grupos, OR dentro do grupo.**
- Categoria: filtros toggle por-categoria (Subcategoria, Ambiente, Porte, Distância do público, etc.).

## CON-produto-controles — Controles da PDP
- source: `docs/00-inventario.md` (§5.5)
- tipo: api-contract
- Quantidade: stepper, `inputmode=numeric`, mínimo 1.
- Cor obrigatória: swatches; **bloqueia adicionar + shake** se vazia.
- Configurador LED: largura×altura ou "Ainda não sei"; Ambiente / Instalação / Conteúdo (multi) / Suporte; observações.

## CON-estados — Catálogo de estados condicionais a implementar
- source: `docs/00-inventario.md` (§6)
- tipo: protocolo
- Responsivo/menu: `topbarDisplay`, `deskDisplay`, `mobDisplay`, `menuDisplay`, `toggleMenu`.
- Vazio: carrinho vazio · catálogo/categoria sem resultado · categoria "em preparação" · form etapa 4 "sem itens" · avaliações vazias.
- Carregando: busca (`busy`) · skeletons de produto e de avaliação (`amrPulse`) · upload em progresso (`pct%`) · envio (`enviando` + spinner).
- Erro: validação por campo (borda vermelha + `amrErro` shake + resumo) · erro de busca · erro de formato de arquivo · cor obrigatória não escolhida.
- Sem resultados: textos distintos em Catálogo e Categoria.
- Aberto/fechado: menu mobile · drawer de filtros (`amrDrawer`) · accordion FAQ (exclusivo, `faqAberta=-1`) · toast (auto-fecha 7–8s).
- Sucesso: contato enviado · solicitação enviada (protocolo) · toast de adicionado/removido com DESFAZER.
- Condicionais de dados: `ehServico`, `ehLed`, `temCor`, `corObrigatoria`, `montagemOutroDia`, prontidão do carrinho (%).

## CON-modelo-conteudo — Modelo de conteúdo e taxonomias
- source: `docs/00-inventario.md` (§9), `docs/PLANO.md` (Fase 03)
- tipo: schema
- `products` é a **fonte única**: o mesmo item aparece na Home/Catálogo/Categoria com metadados divergentes; o registro do CMS reconcilia.
- Tipos de item (enum): `físico` · `com-variação` · `serviço-técnico` · `pacote`.
- Taxonomias reutilizáveis: Categorias · Subcategorias (por categoria) · Tipo de item · Cor (Bege/Preto/Branco/Azul-marinho/Bordô + hex) · Tipo de evento · Ambiente · Porte · Distância do público · Área de cobertura · Montagem.
- Conteúdo confirmado para o CMS: 10 Q&A do FAQ + 7 fatores de preço · blocos da Sobre · 4 passos de "Próximas etapas" · microcopy legal global · opções de todos os selects/toggles do formulário.
- **Sem seed fictício:** protocolo `AMR-4182`, resumo (4 itens / 28 unidades), avaliações nomeadas e itens-mock de carrinho são exemplos do design.

## CON-conteudo-global — Contato e microcopy legal global
- source: `docs/00-inventario.md` (§4)
- tipo: schema
- Telefone `(689) 242-1871` (`tel:+16892421871`) · e-mail `contato@allmusicbr.com` · idiomas EN/PT/ES.
- **Sem endereço físico, mapa ou redes sociais** em nenhuma página.
- Microcopy legal (candidato a campo em `settings-globais`): *"Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva."* · *"Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe."* · `© 2026 All Music Rentals.`

## CON-comparativo-led — Bloco comparativo LED (P1.9 × P3.9)
- source: `docs/00-inventario.md` (§7)
- tipo: schema
- Seção `#comparativo` renderizada **só em `telas-de-led`**. Vira o bloco `comparativo-led` da Dynamic Zone.
- Conteúdo: explicação de *pixel pitch*; cartões P1.9mm (densidade alta, borda teal) × P3.9mm (densidade média) com amostras visuais de pontos; bloco "REGRA PRÁTICA" com régua 0–10m (marcadores 1,9m e 3,9m); tabela de 7 critérios (distância mínima, público típico, conteúdo, ambiente, uso comum, módulo, área por investimento) que **empilha abaixo de 760px**; CTA "NÃO SEI QUAL ESCOLHER".

## CON-imagens — Inventário e regras de imagem
- source: `docs/00-inventario.md` (§8)
- tipo: schema
- Todas em `uploads/`. Proporções: cards/galeria **4:3**, heros **cover**, miniaturas **1:1**, seção LED **16:9 / 16:10 / 1:1**, cartão Sobre **16:9**.
- `LED SCRRENN 2.jpg` tem grafia errada (dois "R") — corrigir no rename.
- `FireShot Capture 005/007 ….png` não são referenciados nos HTMLs (screenshots de concorrentes) — **descartar do build**.
- `Logo AMR original v4.png` é variante não usada; o logo válido é `logo-amr.png`.
- Muitos produtos usam placeholder textual hachurado (ex. `FOTO · LOUNGE EXTERNO · AMBIENTADA · 4:3`) — manter o placeholder do design com legenda técnica; **não inventar imagem**.

## CON-core-web-vitals — Metas de performance
- source: `docs/PLANO.md` (Fase 14), `docs/adr/001-styled-components.md`
- tipo: nfr
- Campo, mobile, p75: **LCP < 2,5s · INP < 200ms · CLS < 0,1 · TTFB < 800ms**.
- Server Components por padrão · `next/image` com `width`/`height` · ISR/revalidação por webhook · sem client-side fetch de conteúdo · orçamento de JS por rota no CI.

## CON-seguranca — Segurança
- source: `docs/PLANO.md` (Fase 15, Fase 01)
- tipo: nfr
- CSP **com nonce** (styled-components + GTM sem `unsafe-inline` global) · HSTS · X-Content-Type-Options · Referrer-Policy · Permissions-Policy · frame-ancestors.
- Rate limiting · hardening de upload (magic number) · nenhum segredo em `NEXT_PUBLIC_` · `npm audit` limpo + Dependabot.
- Tokens do Strapi **só no servidor**; teste que falha se segredo vazar no bundle cliente.

## CON-deploy — Contrato de deploy
- source: `docs/PLANO.md` (Fase 17, Fase 01)
- tipo: protocolo
- Fase 01 entrega o **esqueleto** Docker + CI (dev: app + Strapi + Postgres); Fase 17 **finaliza** o pipeline de produção/VPS.
- Produção: `docker-compose.prod.yml` com app + Strapi + Postgres + reverse proxy TLS na VPS Hostinger; volumes persistentes (Postgres, uploads do Strapi); backup; secrets fora do repo.
- Em aberto: registry (GHCR vs build direto na VPS) e proxy (Caddy / Traefik / Nginx).
