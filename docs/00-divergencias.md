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

5. ⏳ **Header / nav.** Estrutura idêntica, mas: (a) o **item ativo** muda por página; (b) na **Home/Catálogo a nav é estática**, enquanto na **Categoria a nav é dinâmica** (`navPrincipal`/`navMobile` geram as 5 categorias). **Proposta:** um só componente `Header` recebendo `itens[]` e `ativo` por props do CMS (menu-item). *Recomendado unificar.*

6. ⏳ **Rodapé.** "Byte-a-byte idêntico" nas 4 institucionais; nas demais varia só o `href` dos links de produto (`#led` vs `#telas-de-led`, `#luzsom` vs `#luz-e-som`) e a Home tem um `border-top` extra. **Proposta:** rodapé único vindo do CMS (`rodape-coluna` + `menu-item`); hrefs viram slugs reais de categoria. *Recomendado unificar.*

7. ⏳ **Card de produto.** Mesma anatomia, três variações de controle:
   - Home: seletor de cor via `<select>`.
   - Catálogo: cor via **swatches** + badge "SERVIÇO TÉCNICO" + bloco "ESCOPO".
   - Categoria: badge/escopo mas **sem seletor de cor**.
   **Proposta:** um `CardProduto` com variantes controladas por `tipoDeItem` e presença de `variações`/`cor`. *Recomendado unificar como um componente com variantes.*

8. ✅ **RESOLVIDA** — **Painel de filtros: manter os dois modos.** Catálogo = acordeão vertical checkbox/swatch + drawer mobile; Categoria = botões toggle horizontais. Dois componentes distintos, fiéis ao layout. *Aprovado 2026-08-13.*

9. ⏳ **Toast.** Mesma marcação; só a posição muda (`bottom:20px` na Home; `bottom:96px` onde há barra fixa de orçamento). Trivial — resolver com offset condicional. *Recomendado unificar.*

10. ⏳ **Barra fixa de orçamento.** Presente em Catálogo/Categoria, ausente na Home e nas institucionais. Não é conflito — é presença condicional. *Sem ação além de documentar.*

## Dados / conteúdo

11. ⏳ **Mesmo produto com metadados diferentes entre páginas.** Ex.: *guarda-sol* é categoria "TENDAS" na Home e "ÁREA EXTERNA" no Catálogo; spec "MEDIDAS SOB CONSULTA" vs "BASE SOB CONSULTA". **Proposta:** o CMS (`products`) é a fonte única; as páginas derivam do mesmo registro. Reconciliar na modelagem da Fase 03. *Recomendado: fonte única no CMS.*

12. ⏳ **Microcopy legal repetido** (candidato a campo global): "Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe." e "Os produtos estão sujeitos à disponibilidade. O envio de uma solicitação não cria uma reserva." **Proposta:** campo único em `settings-globais`. *Recomendado.*

13. ⏳ **Dados mockados nos exports** (protocolo `AMR-4182`, RESUMO 4 itens/28 unidades, avaliações nomeadas). São **exemplos do design**, não conteúdo real. **Regra:** não semear conteúdo fictício; usar placeholder com legenda técnica onde faltar real. *Sem ação além de não seed.*

## Contradições com o briefing (importantes)

14. ✅ **RESOLVIDA** — **Formulário: 5 etapas** (seguir o layout). `ETAPAS = 1..5`: (1) Contato · (2) Evento · (3) Local/logística · (4) Produtos+arquivos · (5) Finalizar/consentimentos. Não se reprojeta para 9. *Aprovado 2026-08-13.* Fase 09 do PLANO ajustada.

15. ✅ **RESOLVIDA** — **"Faixa de investimento" (US$) mantida** como no layout (faixa de budget do cliente, com a ressalva). O teste anti-preço terá **allowlist** para `US$`/faixa nesse campo. É budget, não preço de produto. *Aprovado 2026-08-13.*

16. ✅ **RESOLVIDA** — Teal de link padronizado: **`teal.link = #1A7F82`** (links), **`#166D70`** reservado para hover/pressed. *Aplicado.*

17. ℹ️ **Tipo "pacote"** existe no Catálogo (`led-pacote`) mas a PDP demonstra só 3 arquétipos (físico/variação/serviço). Não é conflito — o CMS terá os 4 tipos; a PDP renderiza "pacote" como caso de configuração. *Sem ação.*

---

### Resumo das decisões (todas resolvidas — 2026-08-13)
| # | Tema | Decisão |
|---|---|---|
| 1 | `#C7CACB` → `#C9CBCC` | ✅ Unificado |
| 2 | `#5A1F24` → `#5A2020` | ✅ Unificado |
| 8 | Mecânica de filtros | ✅ Manter os dois modos |
| 14 | Form 5 vs 9 etapas | ✅ 5 etapas (seguir layout) |
| 15 | Faixa de investimento US$ | ✅ Manter + allowlist no teste anti-preço |
| 16 | Teal de link | ✅ `#1A7F82` link / `#166D70` hover |

**Ainda em aberto (não bloqueiam):** 5, 6, 7, 9, 11, 12 — todos com recomendação de "unificar via CMS/componente", a aplicar nas fases 02–03.
