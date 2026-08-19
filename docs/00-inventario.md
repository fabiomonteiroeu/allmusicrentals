# Inventário — Fase 00 · All Music Rentals

> **Fonte da verdade:** `/projeto-base/*.dc.html` (exports Claude Design). Nada aqui é reinterpretado.
> **Tokens visuais:** ver `docs/tokens/tokens.json` e `docs/tokens/tokens.md`.
> **Divergências:** `docs/00-divergencias.md`. **Plano:** `docs/PLANO.md`.

## ⚠️ Duas descobertas que contradizem o briefing (aguardam sua decisão)

1. **Formulário: 5 etapas no HTML, não 9.** O arquivo `Solicitar Orcamento` implementa `ETAPAS = 1..5` (barra "ETAPA X DE 5"). As 5 são: (1) Dados de contato · (2) Dados do evento · (3) Local e logística · (4) Produtos e arquivos · (5) Finalizar/consentimentos.
2. **Uma cifra em tela — "Faixa de investimento" em US$** (etapa 5). É faixa de **budget do cliente**, não preço de produto, e traz a ressalva *"Nenhum valor é exibido no site. Isto orienta a equipe a propor a configuração adequada, não a definir o preço."* É o **único** ponto com moeda em todo o site.

Detalhe e proposta em `docs/00-divergencias.md` (itens 14 e 15).

---

## 1. Páginas e rotas

| # | Página | Arquivo de origem | Rota pretendida |
|---|---|---|---|
| 1 | Home | `All Music Rentals - Home.dc.html` | `/[locale]` |
| 2 | Catálogo | `All Music Rentals - Catalogo.dc.html` | `/[locale]/catalogo` |
| 3 | Categoria (modelo p/ 5) | `All Music Rentals - Categoria.dc.html` | `/[locale]/categoria/[slug]` |
| 4 | Produto | `All Music Rentals - Produto.dc.html` | `/[locale]/[categoria]/[slug]` |
| 5 | Meu Orçamento (carrinho) | `All Music Rentals - Meu Orcamento.dc.html` | `/[locale]/meu-orcamento` |
| 6 | Solicitar Orçamento (form) | `All Music Rentals - Solicitar Orcamento.dc.html` | `/[locale]/solicitar-orcamento` |
| 7 | Solicitação Recebida | `All Music Rentals - Solicitacao Recebida.dc.html` | `/[locale]/solicitacao-recebida` |
| 8 | Contato | `All Music Rentals - Contato.dc.html` | `/[locale]/contato` |
| 9 | Sobre | `All Music Rentals - Sobre.dc.html` | `/[locale]/sobre` |
| 10 | FAQ | `All Music Rentals - Perguntas Frequentes.dc.html` | `/[locale]/faq` |

**Slugs de categoria reais (do data):** `estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`. Ordem: `[estruturas, telas-de-led, luz-e-som, tendas, moveis]`. **Prontas:** `estruturas`, `telas-de-led`. **Em preparação:** `luz-e-som`, `tendas`, `moveis`.

**Motor dos exports:** custom element `<x-dc>`, lógica em `class Component extends DCLogic` (React), diretivas `sc-if`/`sc-for`, bindings `{{ mustache }}` via `renderVals()`, `support.js`. **Breakpoint mobile observado:** `innerWidth < 1080` (troca header/menu); tabela comparativa LED empilha `< 760px`. **Não há `@media` no CSS** (responsividade fluida — ver tokens).

---

## 2. Tokens

Resumido aqui; completo em `docs/tokens/`. Cores unificadas (aprovado): `#C7CACB→#C9CBCC`, `#5A1F24→#5A2020`.
- **Cor:** fundo `#F1F2F2`, tinta `#0B0C0D`, teal `#2FB6B9`/`#1A7F82`/`#166D70`, erro `#8C2A2A`.
- **Fonte:** Archivo (display, `wdth 75`, 800, uppercase) · Public Sans (corpo) · IBM Plex Mono (rótulos/códigos).
- **Sistema:** raio 2px, sombra dura sem blur, espaço base 2px/múltiplos de 4, container 1280px.
- **Motion:** `amrFade/amrToast/amrErro/amrSpin/amrPulso/amrDrawer/amrMod/amrProg`. Sem `prefers-reduced-motion` (adicionar).

---

## 3. Componentes compartilhados (2+ páginas)

| Componente | Onde | Idêntico? / Divergência |
|---|---|---|
| **Topbar** (tagline + tel/email + `EN\|PT\|ES`) | Home, Catálogo, Categoria, Produto, Meu Orçamento, Contato, Sobre, FAQ, Confirmação | Idêntica. **Ausente** em Solicitar (header enxuto). |
| **Header sticky** (logo + nav 8 itens + badge ORÇAMENTO + CTA) | Todas | Estrutura igual. Item **ativo** muda por página. Nav **estática** na maioria; **dinâmica** na Categoria (gera as 5 categorias). Badge é **não-clicável** em Meu Orçamento. Header **reduzido** (sem nav) em Solicitar. → divergência 5. |
| **Menu mobile (drawer)** | Todas | Mesma estrutura; item ativo/links divergem como o header. |
| **Rodapé** (5 colunas: Marca, PRODUTOS, EMPRESA, INFORMAÇÕES, CONTATO + 2 disclaimers) | Todas (compacto em Solicitar) | "Byte-a-byte" nas institucionais; só `href` de produto varia (`#led`↔`#telas-de-led`). → divergência 6. |
| **Card de produto** (foto 4:3 / spec no hover, categoria mono, nome, desc, qtd −/+, 2 botões) | Home (slider), Catálogo (grade), Categoria (grade), Produto (relacionados/juntos), carrinho, form etapa 4 | Anatomia comum; controle de cor difere: `<select>` (Home) vs swatches (Catálogo) vs sem-cor (Categoria). → divergência 7. |
| **Barra fixa de orçamento** (contador + título/sub + VER ORÇAMENTO/SOLICITAR) | Catálogo, Categoria, Produto; mobile em Meu Orçamento | Ausente na Home e institucionais. Presença condicional. |
| **Chip de filtro ativo** (rótulo mono + valor + ×) | Catálogo, Categoria | Mesmo visual. |
| **Painel de filtros** | Catálogo (acordeão checkbox/swatch + drawer mobile), Categoria (toggles horizontais) | Mecânica divergente. → divergência 8. |
| **Toast** (`role=status`, `amrToast`, preto + borda teal) | Todas com interação | Posição muda (`bottom:20px` vs `96px`). Variantes: adicionar / DESFAZER / fechar. → divergência 9. |
| **Breadcrumb** | Catálogo, Categoria, Produto, Meu Orçamento, Contato, FAQ | Níveis variam. |
| **Accordion FAQ** (`+`/`–`, exclusivo — um aberto por vez, `faqAberta=-1`) | FAQ, Categoria, Produto | Mesmo comportamento. |
| **Stepper de 5 etapas** | Solicitar | Exclusivo. |
| **Skeletons (carregando)** | Home (avaliações), Catálogo (produtos) | `amrPulse`. |

---

## 4. Conteúdo textual por página

> Texto integral transcrito nos relatórios dos subagentes (nas notas de execução). Abaixo, o mapa de blocos por página; o corpo vira conteúdo de CMS.

### Home (`/`)
Hero (`O palco é seu. Nós levamos a estrutura.`) → Busca grande → Grade de categorias (card-bandeira LED + 4: Estruturas, Luz & Som, Tendas, Móveis) → Produtos em destaque (slider, 5 itens) → Seção Painéis de LED (P1.9/P3.9 + listas "O QUE INSTALAMOS"/"O QUE EXIBIMOS" + galeria 3 imgs) → Como funciona (4 etapas) → Diferenciais (5 blocos) → Avaliações (4 depoimentos + estados vazio/carregando) → CTA final → Rodapé → Toast.

### Catálogo (`/catalogo`)
Hero + card "SOBRE OS VALORES" + busca → Layout 2 col (aside filtros + main) → Toolbar (Filtros mobile, contagem, Ordenar por) → Chips ativos → Grade (10 produtos) / skeletons / **estado vazio** ("Amplie a busca ou fale com a equipe") → Rodapé → Barra fixa → Drawer filtros mobile → Toast.
> Nota: o array `CATALOGO` do layout-fonte tem 10 itens; os 10 já estão cadastrados no CMS (ver D-03).

### Categoria (`/categoria/[slug]`)
Barra "MODELO APLICADO A" (trocador) → Hero por categoria → Subcategorias (numeradas) → **Comparativo P1.9×P3.9** (só LED — ver §7) → Produtos da categoria / **estado "em preparação"** / **sem resultado** → Aplicações (ou "em preparação") → FAQ da categoria (ou vazio) → CTA → Rodapé → Barra fixa → Toast.

### Produto (`/[categoria]/[slug]`)
Barra "MODELO APLICADO A" → Breadcrumb → Bloco principal 2 col (galeria com zoom-hover + coluna de compra c/ variação/config) → Descrição + aside (ficha técnica + "PRECISA DE AJUDA") → "Frequentemente alugado com" → "Produtos relacionados" → **FAQ do produto** → CTA final → Rodapé → Barra fixa → Toast.

### Meu Orçamento (`/meu-orcamento`)
Breadcrumb → Cabeçalho + aviso ("não representa compra ou reserva") → **Estado vazio** (com "COMO FUNCIONA" 3 passos) / **Estado com itens** (lista editável + aside "O QUE A EQUIPE VAI RECEBER" com % de prontidão + PRÓXIMOS PASSOS) → Barra mobile fixa → Toast (com DESFAZER).

### Solicitar Orçamento (`/solicitar-orcamento`)
Hero → Layout 2 col (aside stepper "ETAPA n DE 5" + card RASCUNHO) → Resumo de erro condicional → **5 etapas** (ver §5) → Barra de navegação (VOLTAR / CONTINUAR / ENVIAR) → **Tela de sucesso** (protocolo `AMR-XXXX`).

### Solicitação Recebida (`/solicitacao-recebida`)
Hero confirmação (badge "EM ANÁLISE" pulsante + protocolo + H1 "Sua solicitação foi recebida" + aviso "não reservados" + cartão resumo "O QUE CHEGOU ATÉ NÓS") → "Próximas etapas" (4 cards: Análise→Disponibilidade→Logística→Proposta, 1º ativo "AGORA") → CTAs → Rodapé.

### Contato (`/contato`)
Hero (H1 "Entre em contato" + cartões TELEFONE/E-MAIL) → "Escolha o caminho certo" (Dúvida rápida × Solicitação completa) → Corpo 2 col (formulário + aside ATENDIMENTO/ANTES DE ESCREVER) → **estado sucesso** (substitui form) → Rodapé.

### Sobre (`/sobre`)
Hero com imagem (H1 "Mais do que equipamentos. Experiência em eventos." + 3 parágrafos) → 2 cartões (NOSSA EXPERIÊNCIA / NOSSA ESTRUTURA c/ img 16:9) → "Da seleção à confirmação" (4 passos) → CTA → Rodapé.

### FAQ (`/faq`)
Hero → Destaque "PERGUNTA 01" ("Os preços aparecem no site? **NÃO.**" + "O QUE ENTRA NO CÁLCULO" 7 fatores) → "Outras perguntas" (accordion 02–10) → Rodapé. **10 Q&A no total.**

**Contato global (todas as páginas):** tel `(689) 242-1871` (`tel:+16892421871`) · e-mail `contato@allmusicbr.com` · idiomas EN/PT/ES. **Sem endereço físico, mapa ou redes sociais** em nenhuma página.

**Microcopy legal repetido (→ campo global):** *"Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva."* · *"Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe."* · `© 2026 All Music Rentals.`

---

## 5. Formulários e campos

### 5.1 Formulário Solicitar Orçamento — **5 etapas** (não 9)

**Etapa 1 — Dados de contato** (8 campos): Nome\* · Sobrenome\* · Empresa · E-mail\* (regex) · Telefone\* (≥10 díg.) · Idioma de atendimento (PT/EN/ES) · Forma preferida de contato (E-mail/Telefone/WhatsApp/SMS) · Tipo de cliente\* (9 opções).

**Etapa 2 — Dados do evento** (8 campos): Tipo de evento\* (10 opções) · **Data do evento\*** (não pode ser passado) · Nº de convidados · checkbox "montagem no mesmo dia" (default on) · Data da montagem (condicional) · 4× horário (Montagem/Início/Término/Desmontagem, opcionais).

**Etapa 3 — Local e logística** (15 campos): Nome do local · Contato do local · Endereço · **Cidade\*** · Estado (select FL/GA/AL/SC/outro) · CEP · Interno/Externo/ambos · Tipo de superfície · Acesso (4 checkboxes) · Info de acesso (textarea) · Energia · Gerador · Plano de chuva · Tempo de montagem (select) · Desmontagem · Restrições (textarea) · Instruções (textarea).

**Etapa 4 — Produtos e arquivos** (2): lista editável de itens (qty/observação/remover, ou "sem itens") · **Upload** drag-and-drop — `PDF · JPG · JPEG · PNG · até 25 MB cada`, `multiple`, barra de progresso, erro por formato.

**Etapa 5 — Finalizar** (5): textarea de contexto · **Faixa de investimento (US$)** — opcional (ver alerta) · **Consentimentos:** c1 obrigatório (não reserva) · c2 obrigatório (Política de Privacidade) · c3 opcional (SMS).

**Validação por etapa** (`validar`): 1→nome/sobrenome/email/telefone/cliente · 2→evento/data · 3→cidade · 5→c1+c2. **Persistência:** localStorage `amr-solicitacao-rascunho-v1` (debounce 700ms, restaura etapa). **Protocolo:** `AMR-` + aleatório 1000–9999. **Envio:** bloqueia se anexo `pct<100`; spinner `ENVIANDO`; sucesso limpa rascunho.

### 5.2 Formulário de Contato (8 campos)
Nome\* · E-mail\* (regex, 2 mensagens) · Telefone · Empresa · Cidade · Data do evento · Assunto\* (select 6 opções) · Mensagem\* (textarea). Botão ENVIAR→ENVIANDO. Alerta-resumo de erro. **Estado sucesso** substitui o form. Simulado 1200ms.

### 5.3 Busca (Home e Catálogo)
`input type=search`, `novalidate`, validação JS (vazio → erro inline), botão desabilita em `busy`.

### 5.4 Filtros (Catálogo / Categoria)
**Catálogo:** Categoria · Tipo de item · Cor (swatch: Bege `#D8C9A8`/Preto `#0B0C0D`/Branco `#FFFFFF`) · Tipo de evento · Ambiente. Ordenar por (5 opções). AND entre grupos, OR dentro. **Categoria:** filtros toggle por-categoria (Subcategoria, Ambiente, Porte, Distância do público, etc.).

### 5.5 Controles de produto (PDP)
Quantidade (stepper, `inputmode=numeric`, min 1) · Cor obrigatória (swatches, **bloqueia add + shake** se vazia) · Configurador LED (largura×altura ou "Ainda não sei"; Ambiente/Instalação/Conteúdo multi/Suporte; observações).

---

## 6. Estados condicionais (catálogo de estados a implementar)

- **Responsivo/menu:** `topbarDisplay`, `deskDisplay`, `mobDisplay`, `menuDisplay`, `toggleMenu`, colunas/grids por `vw`.
- **Vazio:** carrinho vazio; catálogo/categoria sem resultado de busca; categoria "em preparação"; form etapa 4 "sem itens"; avaliações vazias.
- **Carregando:** busca (`busy`), skeletons de produto (Catálogo), skeletons de avaliação (Home), upload em progresso (`pct%`), envio (`enviando` + spinner).
- **Erro:** validação por campo (borda vermelha + `amrErro` shake + resumo), erro de busca, erro de formato de arquivo, cor obrigatória não escolhida.
- **Sem resultados:** busca/filtro sem match (Catálogo e Categoria, textos distintos).
- **Aberto/fechado:** menu mobile, drawer de filtros (`amrDrawer`), accordion FAQ (exclusivo), toast (auto-fecha 7–8s).
- **Sucesso:** contato enviado, solicitação enviada (protocolo), toast de adicionado/removido (com DESFAZER).
- **Condicionais de dados:** `ehServico` (sem qty, badge/escopo), `ehLed` (comparativo), `temCor`, `corObrigatoria`, `montagemOutroDia`, prontidão do carrinho (%).

---

## 7. Comparativo LED (P1.9 × P3.9) — bloco especial da Categoria

Seção `#comparativo` renderizada só em `telas-de-led`. Contém: explicação de *pixel pitch*; dois cartões P1.9mm (densidade alta, borda teal) × P3.9mm (densidade média) com amostras visuais de pontos; bloco "REGRA PRÁTICA" com régua 0–10m (marcadores 1,9m e 3,9m) e exemplos de público perto/longe; **tabela comparativa** de 7 critérios (distância mínima, público típico, conteúdo, ambiente, uso comum, módulo, área por investimento — empilha `<760px`); CTA "NÃO SEI QUAL ESCOLHER". → é o componente de bloco `comparativo-led` no CMS.

---

## 8. Inventário de imagens

Todas em `uploads/`. Proporções observadas: cards/galeria **4:3**, heros **cover**, miniaturas **1:1**, seção LED **16:9 / 16:10 / 1:1**, cartão Sobre **16:9**.

| Arquivo | Uso | Nota |
|---|---|---|
| `logo-amr.png` | Logo header (~38px) e rodapé (~34px) — todas as páginas | `Logo AMR original v4.png` é variante não usada |
| `LED SCREEN 3-e4d7e4d4.jpg` / `LED SCREEN 3.jpg` | Hero LED / cards / mosaico do hero Home | Dois arquivos ~iguais |
| `LED SCREEN 4.jpg`, `LED SCREEN 5.jpg` | Galeria/cards LED | |
| `LED SCRRENN 2.jpg` | Galeria LED, cartão Sobre 16:9 | ⚠️ grafia errada (dois "R") — corrigir no rename |
| `estrutura-para-eventos.jpg` | Hero categoria Estruturas / card Home | |
| `images (3).jpg` | Hero Sobre / card Home / hero Luz&Som | |
| `eventos-23.png` | Card Home / hero Tendas | |
| `HIGH TABLE ALUMINIUM 6-12bcd805.jpg` / `HIGH TABLE ALUMINUM 5 (1).jpg` / `HIGH TABLE ALUMINIUM 4.jpg` / `HIGH TABLE ALUMINIUM 2.webp` | Produto Mesa Alta (foto + hover + galeria + thumb carrinho) | vários formatos |
| `COVERS HIGH TABLE.jpg` | Capa spandex (card/relacionados/thumb) | |
| `COVERS TABLE BUFFET.jpg` | Capa mesa 6 pés (relacionados) | |
| `UMBRELLA4.jpg` | Guarda-sol | |
| `images (3).jpg` | (reuso) | |
| `FireShot Capture 005/007 ...png` | **Não referenciados** nos HTMLs (screenshots de concorrentes) | descartar do build |

**Muitos produtos usam placeholder textual hachurado** (ex. `FOTO · LOUNGE EXTERNO · AMBIENTADA · 4:3`) — fotos pendentes de cadastro. Regra: manter placeholder do design com legenda técnica; não inventar imagem.

---

## 9. Mapa para o CMS (Strapi) — reconciliações necessárias

- **Produto é fonte única**: o mesmo item aparece na Home/Catálogo/Categoria com categoria/spec ligeiramente diferentes (ex. guarda-sol "TENDAS" vs "ÁREA EXTERNA"). O registro `products` do CMS reconcilia. → divergência 11.
- **Tipos de item** (enum): físico · com-variação · serviço-técnico · **pacote** (existe no Catálogo como `led-pacote`, embora a PDP só demonstre 3 arquétipos).
- **Taxonomias reutilizáveis:** Categorias, Subcategorias (por categoria), Tipo de item, Cor (Bege/Preto/Branco/Azul-marinho/Bordô + hex), Tipo de evento, Ambiente, Porte, Distância do público, Área de cobertura, Montagem.
- **Conteúdo de CMS confirmado:** 10 Q&A do FAQ + 7 fatores de preço; blocos da Sobre; 4 passos de "Próximas etapas"; microcopy legal global; opções de todos os selects/toggles do formulário.
- **Sem seed fictício:** protocolo `AMR-4182`, resumo (4 itens/28 unid.), avaliações nomeadas e itens-mock de carrinho são **exemplos do design** — não semear.

---

## 10. Checklist de aceite da Fase 00

- [x] Páginas e rotas mapeadas (10 páginas).
- [x] Tokens extraídos do código com contagem (`docs/tokens/`).
- [x] Componentes compartilhados identificados com divergências.
- [x] Conteúdo textual mapeado por página (corpo integral nos relatórios dos subagentes).
- [x] Campos de formulário inventariados (2 forms + busca + filtros + controles de produto).
- [x] Estados condicionais catalogados.
- [x] Comparativo LED documentado.
- [x] Inventário de imagens.
- [x] Divergências registradas (`docs/00-divergencias.md`), incluindo 5-vs-9 etapas e US$.
- [x] **Aprovação das 2 decisões abertas** (etapas do form; faixa de investimento US$) — aprovado 2026-08-13
- [x] **Aprovação do `docs/PLANO.md`.** — aprovado 2026-08-17
