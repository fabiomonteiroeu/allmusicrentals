# Decisões (extraídas dos ADRs)

Fonte: documentos classificados como `ADR` em `.planning/intel/classifications/`.
Precedência aplicada: ADR > SPEC > PRD > DOC.

Legenda de status:
- `TRAVADA` — ADR com `locked: true` ou item explicitamente marcado ✅ RESOLVIDA/Aprovado. Não pode ser sobrescrita automaticamente.
- `VIGENTE` — decisão registrada e em uso, sem campo `Status` formal no documento.
- `ABERTA` — proposta registrada, sem aprovação. Equivalente a `Proposed`.
- `INFORMATIVA` — registrada como não-divergência, sem ação.

---

## DEC-styled-components — styled-components no App Router

- source: `docs/adr/001-styled-components.md`
- status: **TRAVADA** (`locked: true`, "Aceito (Fase 01)", 2026-08-13)
- escopo: styled-components, Next.js App Router, SSR registry, fronteira Server/Client Component

Decisão: adotar styled-components com quatro regras de contenção:

1. Registry na raiz em `src/lib/theme/StyledRegistry.tsx`, coletando estilos no servidor via `useServerInsertedHTML` — sem flash de conteúdo sem estilo.
2. **Busca de dados SEMPRE em Server Component.** Nenhuma página inteira vira client component.
3. Componentes estilizados ficam nas **folhas** da árvore, recebendo dados por props.
4. `compiler.styledComponents: true` no `next.config` (transform SWC, com `displayName`).

Consequências aceitas: JS de runtime do styled-components no cliente; disciplina de manter `"use client"` o mais fundo possível.

Gatilho de reversão: **LCP mobile > 2,5s no p75 de campo** → reavaliar (CSS crítico extraído, ou migrar folhas quentes para CSS Modules / zero-runtime). Medição prevista na Fase 14.

---

## DEC-locale-padrao — pt-BR como locale padrão

- source: `docs/adr/002-locale-padrao.md`
- status: **TRAVADA** (`locked: true`, "Aceito (Fase 01)", 2026-08-13)
- escopo: i18n, roteamento, SEO multilíngue

Decisão:

- `defaultLocale = pt-BR`, com `en` e `es` como locales adicionais.
- Roteamento por prefixo de caminho (`/pt-BR`, `/en`, `/es`) via middleware, com negociação por `Accept-Language` na entrada sem prefixo.
- Mitigação do custo de SEO em inglês (Fase 12): `hreflang` para os três locales + `x-default`, canônica por locale, sitemap por locale.

Consequências: é decisão de **aquisição de cliente**, não técnica; registrada para revisão futura. Reversível apenas por configuração de i18n/SEO (sem reescrita de base) se os dados de busca mostrarem perda relevante em inglês.

---

## DEC-chrome-media-query — Troca desktop↔mobile do chrome via media query CSS

- source: `docs/divergencias.md` (entrada D1, Fase 02, 2026-08-14)
- status: **VIGENTE** (documento sem campo `Status`; `locked: false`)
- escopo: header, topbar, menu mobile; visibilidade desktop/mobile apenas

Decisão: implementar a troca desktop↔mobile do chrome com **media query CSS no breakpoint 1080px** via styled-components, em vez do estado JS de viewport (`window.innerWidth < 1080`) usado no layout-fonte. Breakpoint fica em `theme.breakpoint.header` (1080px).

Motivo técnico: leitura de `window.innerWidth` no cliente causa mismatch de hidratação, flash e CLS na primeira pintura — viola as metas de Core Web Vitals do projeto. Media query resolve no CSS, sem JS e sem shift, mantendo o mesmo ponto de troca.

Escopo negativo explícito: **apenas a visibilidade** desktop/mobile do chrome. Toda a escala fluida (`clamp`) e os grids `auto-fit` seguem exatamente como no layout.

Reversível: trocar por container query ou estado é local ao componente `Header`.

---

## Decisões da Fase 00 (log multi-decisão)

- source: `docs/00-divergencias.md`
- classificação: ADR (confiança média — log multi-decisão, sem frontmatter e sem `Status` no nível do documento)
- `locked: false` no nível do documento, mas os itens marcados ✅ RESOLVIDA trazem aprovação datada e **devem ser tratados como travados na síntese**

### DEC-00-01 — Unificação de cinza de borda
- status: **TRAVADA** (✅ RESOLVIDA, aprovado 2026-08-13)
- escopo: tokens de cor
- Decisão: `#C7CACB` absorvido por **`cinza.300 = #C9CBCC`** (261 usos).

### DEC-00-02 — Unificação de vermelho escuro
- status: **TRAVADA** (✅ RESOLVIDA, aprovado 2026-08-13)
- escopo: tokens de cor
- Decisão: `#5A1F24` absorvido por **`erro.escuro = #5A2020`**.

### DEC-00-08 — Painel de filtros mantém dois modos
- status: **TRAVADA** (✅ RESOLVIDA, aprovado 2026-08-13)
- escopo: catálogo, categoria
- Decisão: manter **dois componentes distintos**, fiéis ao layout. Catálogo = acordeão vertical checkbox/swatch + drawer mobile. Categoria = botões toggle horizontais.

### DEC-00-14 — Formulário de orçamento tem 5 etapas
- status: **TRAVADA** (✅ RESOLVIDA, aprovado 2026-08-13)
- escopo: formulário Solicitar Orçamento, Fase 09
- Decisão: seguir o layout com `ETAPAS = 1..5`: (1) Contato · (2) Evento · (3) Local/logística · (4) Produtos+arquivos · (5) Finalizar/consentimentos. **Não se reprojeta para 9 etapas.** Fase 09 do PLANO ajustada.

### DEC-00-15 — "Faixa de investimento" (US$) mantida, com allowlist anti-preço
- status: **TRAVADA** (✅ RESOLVIDA, aprovado 2026-08-13)
- escopo: formulário etapa 5, teste anti-preço
- Decisão: manter o campo **"Faixa de investimento" em US$** como no layout — é faixa de **budget do cliente**, não preço de produto. O teste anti-preço terá **allowlist** para `US$`/faixa **nesse campo específico**. Ressalva de tela obrigatória: "Nenhum valor é exibido no site. Isto orienta a equipe a propor a configuração adequada, não a definir o preço."

### DEC-00-16 — Teal de link padronizado
- status: **TRAVADA** (✅ RESOLVIDA, aplicado)
- escopo: tokens de cor
- Decisão: **`teal.link = #1A7F82`** para links; **`#166D70`** reservado para hover/pressed.

### Decisões ABERTAS da Fase 00 (não bloqueiam, mas exigem escolha antes das fases afetadas)

- **DEC-00-04 (ABERTA)** — Pontos de troca desktop↔mobile vivem no `support.js`, não no CSS. Proposta: reconstituir como constantes de tema ou container queries na Fase 02. Marcado no texto como "Candidato a ADR".
  → **Superado na prática por `DEC-chrome-media-query`** (`docs/divergencias.md` D1), que decidiu media query CSS em 1080px. Ver `INGEST-CONFLICTS.md`.
- **DEC-00-05 (ABERTA)** — Header/nav: item ativo muda por página; nav estática na Home/Catálogo e dinâmica na Categoria. Proposta: um só `Header` recebendo `itens[]` e `ativo` por props do CMS (`menu-item`). *Recomendado unificar.*
- **DEC-00-06 (ABERTA)** — Rodapé: idêntico nas institucionais; varia só o `href` de produto (`#led` vs `#telas-de-led`, `#luzsom` vs `#luz-e-som`) e a Home tem `border-top` extra. Proposta: rodapé único do CMS (`rodape-coluna` + `menu-item`), hrefs viram slugs reais. *Recomendado unificar.*
- **DEC-00-07 (ABERTA)** — Card de produto com três variações de controle (Home `<select>` de cor; Catálogo swatches + badge SERVIÇO TÉCNICO + bloco ESCOPO; Categoria badge/escopo sem seletor de cor). Proposta: um `CardProduto` com variantes controladas por `tipoDeItem` e presença de `variações`/`cor`. *Recomendado unificar.*
- **DEC-00-09 (ABERTA)** — Toast: mesma marcação, só a posição muda (`bottom:20px` na Home; `bottom:96px` onde há barra fixa). Proposta: offset condicional. *Recomendado unificar.*
- **DEC-00-11 (ABERTA)** — Mesmo produto com metadados diferentes entre páginas (guarda-sol "TENDAS" na Home vs "ÁREA EXTERNA" no Catálogo; "MEDIDAS SOB CONSULTA" vs "BASE SOB CONSULTA"). Proposta: `products` no CMS é fonte única; páginas derivam do mesmo registro. Reconciliar na Fase 03.
- **DEC-00-12 (ABERTA)** — Microcopy legal repetido → campo único em `settings-globais`. *Recomendado.*

### Registros INFORMATIVOS da Fase 00 (sem ação)

- **DEC-00-03** — Ramp teal `#2FB6B9` (acento) / `#1A7F82` (link) / `#166D70` (hover) é escala proposital, não divergência. Mantida.
- **DEC-00-10** — Barra fixa de orçamento presente em Catálogo/Categoria/Produto e ausente na Home e institucionais: presença condicional, não conflito.
- **DEC-00-13** — Dados mockados nos exports (protocolo `AMR-4182`, RESUMO 4 itens/28 unidades, avaliações nomeadas) são exemplos do design. **Regra: não semear conteúdo fictício**; usar placeholder com legenda técnica.
- **DEC-00-17** — Tipo "pacote" existe no Catálogo (`led-pacote`) mas a PDP demonstra só 3 arquétipos. Não é conflito: o CMS terá os 4 tipos; a PDP renderiza "pacote" como caso de configuração.
