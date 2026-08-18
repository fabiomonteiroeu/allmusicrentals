# Divergências — Fase 00

> Regra do briefing: divergências entre páginas **não são resolvidas por conta própria**. Ficam aqui para decisão.
> Legenda: ✅ RESOLVIDA (com aprovação) · ⏳ AGUARDA DECISÃO · ℹ️ INTENCIONAL (não é divergência).

## Cores (tokens)

1. ✅ **RESOLVIDA** — `#C9CBCC` vs `#C7CACB` (bordas claras quase idênticas). Unificados em **`cinza.300 = #C9CBCC`** (261 usos). *Aprovado 2026-08-13.*
2. ✅ **RESOLVIDA** — `#5A2020` vs `#5A1F24` (vermelho escuro). Unificados em **`erro.escuro = #5A2020`**. *Aprovado 2026-08-13.*
3. ℹ️ **INTENCIONAL** — Ramp teal `#2FB6B9` (acento) / `#1A7F82` (link) / `#166D70` (hover). Escala proposital, mantida.

## Responsividade / layout

4. ⏳ **Pontos de troca desktop↔mobile no `support.js`, não no CSS.** Não há `@media`. O breakpoint mobile observado é `window.innerWidth < 1080` (troca header/menu) e a tabela comparativa LED empilha em `< 760px`. **Proposta:** reconstituir esses pontos como constantes de tema (ou container queries) na Fase 02. *Candidato a ADR.*

## Componentes que divergem entre páginas

5. ✅ **RESOLVIDA** — **Header / nav.** O componente real (`src/components/chrome/Header.tsx`) recebe `itens` e `ativoHref` por props (`HeaderProps.itens`, `HeaderProps.ativoHref`), com default vindo de `navPrincipal`, e repassa os dois para `MobileMenu` — exatamente a proposta "um só componente Header recebendo itens[] e ativo por props". Hoje a origem dos itens é o módulo estático `src/lib/site/navigation.ts`; na Fase 4 passa a ser o content-type `menu-item`, pelo adaptador que já existe em `src/lib/cms/adapters.ts` (`getNavPrincipal`). *Fechado 2026-08-17 contra o código da Fase 02.*

6. ✅ **RESOLVIDA** — **Rodapé.** O componente real (`src/components/chrome/Footer.tsx`) recebe `colunas` por props (`FooterProps.colunas`), com default vindo de `colunasRodape` em `src/lib/site/navigation.ts` — a mesma unificação estrutural proposta ("rodapé único vindo do CMS"). Nota: hoje `colunasRodape` ainda usa âncoras de placeholder da Fase 02 (`#estruturas`, `#led`, `#luzsom`, `#tendas`, `#moveis`), não os slugs reais de categoria — o próprio arquivo se declara "Placeholder da Fase 02 — a Fase 03 substitui isto pelos content-types do Strapi via adaptador CMS→props"; os slugs reais (`estruturas`, `telas-de-led`, `luz-e-som`, `tendas`, `moveis`, ver `cms/src/index.ts`) chegam pelo campo `menu-item.url` na Fase 4, quando as páginas de categoria existirem. Sobre o `border-top` extra da Home: `Footer.tsx` não tem prop nem variante para isso — a diferença fica a cargo da seção que antecede o rodapé, a construir na Fase 4. *Fechado 2026-08-17 contra o código da Fase 02.*

7. ✅ **RESOLVIDA COM DESVIO** — **Card de produto.** `ProductCard.tsx` (`ProdutoResumo`) não tem `tipoDeItem`; as variantes de controle hoje são as props booleanas/escalares `ehServico`, `escopo` e `cores`. O seletor de cor é sempre `ColorSwatches` (nunca o `<select>` do layout da Home). Ver detalhamento do desvio na entrada `## D2` de `docs/divergencias.md`. *Fechado 2026-08-17 contra o código da Fase 02.*

8. ✅ **RESOLVIDA** — **Painel de filtros: manter os dois modos.** Catálogo = acordeão vertical checkbox/swatch + drawer mobile; Categoria = botões toggle horizontais. Dois componentes distintos, fiéis ao layout. *Aprovado 2026-08-13.*

9. ✅ **RESOLVIDA** — **Toast.** `src/components/feedback/Toast.tsx` (`ToastProps.offsetBarra`) alterna `bottom` entre `96px` (quando `$offsetBarra`) e `theme.espaco[20]` — a proposta literal, resolvida com offset condicional. *Fechado 2026-08-17 contra o código da Fase 02.*

10. ℹ️ **INTENCIONAL** — **Barra fixa de orçamento.** Presente em Catálogo/Categoria, ausente na Home e nas institucionais. Não é conflito — é presença condicional. *Sem ação além de documentar.* A presença condicional é entrega da Fase 8 (barra fixa mobile do orçamento).

## Dados / conteúdo

11. ✅ **RESOLVIDA** — **Mesmo produto com metadados diferentes entre páginas.** No modelo real, `cms/src/api/product/content-types/product/schema.json` define a categoria do produto como uma única relação `manyToOne` (`categoria` → `api::category.category`) — nunca duas categorias simultâneas. As diferenças "TENDAS vs ÁREA EXTERNA" e "MEDIDAS SOB CONSULTA vs BASE SOB CONSULTA" passam a derivar de três atributos do mesmo registro: `categoria`, `ambiente` (enum `interno`/`externo`/`interno-ou-externo`) e `medidas` (component repetível `shared.medida`). Consequência operacional: um produto nunca tem duas categorias, então a diferença que aparecia entre as páginas do layout vira **erro de dado**, não variação legítima. *Fechado 2026-08-17 contra o modelo da Fase 03.*

12. ✅ **RESOLVIDA** — **Microcopy legal repetido** (candidato a campo global): "Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe." e "Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva." O campo único existe como `settings-globais.textosLegais` (JSON localizado, `pluginOptions.i18n.localized: true`). Contrato de chaves fixado: `disclaimer`, `copyright`, `descricaoMarca` e `avisoCarrinho`. O seed (`cms/src/index.ts`) hoje grava `disclaimer`, `copyright` e `descricaoMarca` — **`avisoCarrinho` ainda não é preenchido pelo seed** e é conteúdo editorial a ser cadastrado no painel; não se inventa texto novo no seed nesta fase, porque o seed é de estrutura. *Fechado 2026-08-17 contra o modelo da Fase 03.*

13. ℹ️ **INTENCIONAL** — **Dados mockados nos exports** (protocolo `AMR-4182`, RESUMO 4 itens/28 unidades, avaliações nomeadas). São **exemplos do design**, não conteúdo real. **Regra:** não semear conteúdo fictício; usar placeholder com legenda técnica onde faltar real. *Sem ação além de não seed.* A regra está implementada e provada: o seed de `cms/src/index.ts` é de estrutura, e o plano 03-06 verifica por `curl` que `/api/avaliacoes` devolve zero itens.

## Contradições com o briefing (importantes)

14. ✅ **RESOLVIDA** — **Formulário: 5 etapas** (seguir o layout). `ETAPAS = 1..5`: (1) Contato · (2) Evento · (3) Local/logística · (4) Produtos+arquivos · (5) Finalizar/consentimentos. Não se reprojeta para 9. *Aprovado 2026-08-13.* Fase 09 do PLANO ajustada.

15. ✅ **RESOLVIDA** — **"Faixa de investimento" (US$) mantida** como no layout (faixa de budget do cliente, com a ressalva). O teste anti-preço terá **allowlist** para `US$`/faixa nesse campo. É budget, não preço de produto. *Aprovado 2026-08-13.*

16. ✅ **RESOLVIDA** — Teal de link padronizado: **`teal.link = #1A7F82`** (links), **`#166D70`** reservado para hover/pressed. *Aplicado.*

17. ℹ️ **Tipo "pacote"** existe no Catálogo (`led-pacote`) mas a PDP demonstra só 3 arquétipos (físico/variação/serviço). Não é conflito — o CMS terá os 4 tipos; a PDP renderiza "pacote" como caso de configuração. *Sem ação.*

---

### Resumo das decisões
| # | Tema | Decisão |
|---|---|---|
| 1 | `#C7CACB` → `#C9CBCC` | ✅ Unificado |
| 2 | `#5A1F24` → `#5A2020` | ✅ Unificado |
| 5 | Header/nav por props | ✅ `Header.tsx` recebe `itens`/`ativoHref` — fechado contra a Fase 02 |
| 6 | Rodapé por props | ✅ `Footer.tsx` recebe `colunas` — fechado contra a Fase 02 |
| 7 | Card de produto: variantes | ✅ COM DESVIO — props booleanas (`ehServico`/`escopo`/`cores`), não `tipoDeItem` — ver D2 |
| 8 | Mecânica de filtros | ✅ Manter os dois modos |
| 9 | Toast: offset condicional | ✅ `Toast.tsx` (`offsetBarra`) — fechado contra a Fase 02 |
| 14 | Form 5 vs 9 etapas | ✅ 5 etapas (seguir layout) |
| 15 | Faixa de investimento US$ | ✅ Manter + allowlist no teste anti-preço |
| 16 | Teal de link | ✅ `#1A7F82` link / `#166D70` hover |

**Ainda em aberto:** nenhum item de decisão. O item 4 (pontos de troca desktop↔mobile) permanece
formalmente marcado "aguarda decisão" neste documento, mas está superado por uma decisão posterior
registrada em `docs/divergencias.md` (entrada `## D1`, 2026-08-14): media query CSS em 1080px, não
constantes de tema/container query. Ver `docs/00-divergencias.md` item 4 e
`.planning/INGEST-CONFLICTS.md` (INFO "Auto-resolvido: proposta aberta superada por decisão
posterior").
